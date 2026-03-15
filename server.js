const express = require('express');
const { simpleGit } = require('simple-git');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Restrict CORS to localhost origins only
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin / curl) or localhost
    if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: origin not allowed'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Config file path
const CONFIG_FILE = path.join(__dirname, 'config.json');

function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  return { repoPaths: [], scanDir: '' };
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function isGitRepo(dir) {
  return fs.existsSync(path.join(dir, '.git'));
}

/**
 * Validates and normalises a repo path.
 * Returns the resolved path, or null if the path is unsafe / invalid.
 */
function validateRepoPath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') return null;
  const resolved = path.resolve(inputPath);
  // Reject filesystem root and paths that don't exist
  if (resolved === '/' || resolved === path.parse(resolved).root) return null;
  if (!fs.existsSync(resolved)) return null;
  try {
    if (!fs.statSync(resolved).isDirectory()) return null;
  } catch {
    return null;
  }
  return resolved;
}

/**
 * Validates and normalises a scan directory path.
 * Less strict than validateRepoPath (doesn't require it to be a git repo)
 * but still prevents filesystem root traversal.
 */
function validateScanDir(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') return null;
  const resolved = path.resolve(inputPath);
  if (resolved === '/' || resolved === path.parse(resolved).root) return null;
  if (!fs.existsSync(resolved)) return null;
  try {
    if (!fs.statSync(resolved).isDirectory()) return null;
  } catch {
    return null;
  }
  return resolved;
}

function scanDirectory(dir) {
  if (!dir || !fs.existsSync(dir)) return [];
  try {
    return fs.readdirSync(dir)
      .map(name => path.join(dir, name))
      .filter(p => fs.statSync(p).isDirectory() && isGitRepo(p));
  } catch (e) {
    return [];
  }
}

async function getRepoStatus(repoPath) {
  try {
    const git = simpleGit(repoPath);
    const [status, log, remotes] = await Promise.all([
      git.status(),
      git.log({ maxCount: 1 }).catch(() => ({ latest: null })),
      git.getRemotes(true).catch(() => [])
    ]);

    const hasRemote = remotes.length > 0;
    let ahead = 0, behind = 0;
    if (hasRemote && status.tracking) {
      ahead = status.ahead || 0;
      behind = status.behind || 0;
    }

    const lastCommit = log.latest ? {
      hash: log.latest.hash.substring(0, 7),
      message: log.latest.message,
      author: log.latest.author_name,
      date: log.latest.date
    } : null;

    const changed = status.files.length;
    const staged = status.staged.length;

    return {
      name: path.basename(repoPath),
      path: repoPath,
      branch: status.current,
      tracking: status.tracking,
      hasRemote,
      ahead,
      behind,
      changed,
      staged,
      isClean: changed === 0,
      lastCommit,
      files: status.files.map(f => ({ path: f.path, index: f.index, working_dir: f.working_dir }))
    };
  } catch (e) {
    console.error(`[getRepoStatus] ${repoPath}:`, e.message);
    return {
      name: path.basename(repoPath),
      path: repoPath,
      error: 'Failed to read repository status',
      branch: '?',
      isClean: null,
      changed: 0,
      staged: 0,
      ahead: 0,
      behind: 0,
      hasRemote: false,
      lastCommit: null,
      files: []
    };
  }
}

// GET all repos status
app.get('/api/repos', async (req, res) => {
  const config = loadConfig();
  const paths = new Set([...config.repoPaths]);
  if (config.scanDir) {
    scanDirectory(config.scanDir).forEach(p => paths.add(p));
  }
  const statuses = await Promise.all([...paths].map(getRepoStatus));
  res.json(statuses);
});

// GET single repo status
app.get('/api/repos/status', async (req, res) => {
  const repoPath = validateRepoPath(req.query.path);
  if (!repoPath) return res.status(400).json({ error: 'Invalid or missing path' });
  const status = await getRepoStatus(repoPath);
  res.json(status);
});

// POST git operation (fetch/pull/push)
app.post('/api/repos/git', async (req, res) => {
  const { action, message } = req.body;
  const repoPath = validateRepoPath(req.body.path);
  if (!repoPath || !action) return res.status(400).json({ error: 'Valid path and action required' });

  try {
    const git = simpleGit(repoPath);
    let result = '';

    if (action === 'fetch') {
      await git.fetch(['--all', '--prune']);
      result = 'Fetched from all remotes';
    } else if (action === 'pull') {
      const pullResult = await git.pull();
      result = pullResult.summary.changes > 0
        ? `Pulled: ${pullResult.summary.changes} change(s), ${pullResult.summary.insertions} insertion(s), ${pullResult.summary.deletions} deletion(s)`
        : 'Already up to date';
    } else if (action === 'push') {
      await git.push();
      result = 'Pushed to origin';
    } else if (action === 'commit') {
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Commit message required' });
      }
      if (message.length > 1000) {
        return res.status(400).json({ error: 'Commit message too long (max 1000 chars)' });
      }
      await git.add('.');
      const commitResult = await git.commit(message.trim());
      result = `Committed: ${commitResult.summary.changes} change(s) — ${commitResult.commit}`;
    } else {
      return res.status(400).json({ error: 'Unknown action' });
    }

    const status = await getRepoStatus(repoPath);
    res.json({ success: true, result, status });
  } catch (e) {
    console.error(`[git ${action}] ${repoPath}:`, e.message);
    res.json({ success: false, result: 'Git operation failed' });
  }
});

// GET config
app.get('/api/config', (req, res) => {
  res.json(loadConfig());
});

// POST config
app.post('/api/config', (req, res) => {
  const { repoPaths, scanDir } = req.body;

  // Validate each repo path
  const validatedPaths = Array.isArray(repoPaths)
    ? repoPaths.map(p => validateRepoPath(p)).filter(Boolean)
    : [];

  // Validate scanDir — must exist and not be filesystem root
  const validatedScanDir = scanDir ? (validateScanDir(scanDir) || '') : '';

  saveConfig({ repoPaths: validatedPaths, scanDir: validatedScanDir });
  res.json({ ok: true });
});

// POST add single repo
app.post('/api/repos/add', (req, res) => {
  const repoPath = validateRepoPath(req.body.path);
  if (!repoPath) return res.status(400).json({ error: 'Invalid or missing path' });
  if (!isGitRepo(repoPath)) return res.status(400).json({ error: 'Not a git repository' });
  const config = loadConfig();
  if (!config.repoPaths.includes(repoPath)) {
    config.repoPaths.push(repoPath);
    saveConfig(config);
  }
  res.json({ ok: true });
});

// DELETE repo from list
app.delete('/api/repos', (req, res) => {
  const { path: repoPath } = req.body;
  const config = loadConfig();
  config.repoPaths = config.repoPaths.filter(p => p !== repoPath);
  saveConfig(config);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
// Bind to localhost only — this dashboard is a local tool and must not be exposed on the network
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 Git Dashboard running at http://localhost:${PORT}\n`);
});
