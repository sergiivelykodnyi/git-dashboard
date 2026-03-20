const express = require("express");
const { simpleGit } = require("simple-git");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors({ origin: /^http:\/\/localhost(:\d+)?$/ }));
app.use(express.json());
app.use(express.static("public"));

// Config file path
const CONFIG_FILE = path.join(__dirname, "config.json");

function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
      return {
        repoPaths: Array.isArray(raw.repoPaths)
          ? raw.repoPaths.filter((p) => typeof p === "string")
          : [],
        scanDir: typeof raw.scanDir === "string" ? raw.scanDir : "",
      };
    } catch {
      return { repoPaths: [], scanDir: "" };
    }
  }
  return { repoPaths: [], scanDir: "" };
}

function resolveRepoPath(inputPath) {
  if (!inputPath || typeof inputPath !== "string") return null;
  const resolved = path.resolve(inputPath);
  try {
    const real = fs.realpathSync(resolved);
    if (!fs.statSync(real).isDirectory()) return null;
    return real;
  } catch {
    return null;
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function isGitRepo(dir) {
  return fs.existsSync(path.join(dir, ".git"));
}

function scanDirectory(dir) {
  const resolved = resolveRepoPath(dir);
  if (!resolved) return [];
  try {
    return fs.readdirSync(resolved).flatMap((name) => {
      try {
        const real = fs.realpathSync(path.join(resolved, name));
        return fs.statSync(real).isDirectory() && isGitRepo(real) ? [real] : [];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

async function getRepoStatus(repoPath) {
  try {
    const git = simpleGit(repoPath);
    const [status, log, remotes, stashList] = await Promise.all([
      git.status(),
      git.log({ maxCount: 1 }).catch(() => ({ latest: null })),
      git.getRemotes(true).catch(() => []),
      git.stashList().catch(() => ({ all: [] })),
    ]);

    const hasRemote = remotes.length > 0;
    let ahead = 0,
      behind = 0;
    if (hasRemote && status.tracking) {
      ahead = status.ahead || 0;
      behind = status.behind || 0;
    }

    const lastCommit = log.latest
      ? {
          hash: log.latest.hash.substring(0, 7),
          message: log.latest.message,
          author: log.latest.author_name,
          date: log.latest.date,
        }
      : null;

    const staged = status.staged.length;
    const changed = status.files.filter(
      (f) => f.working_dir !== " " && f.working_dir !== ""
    ).length;
    const stash = stashList.all.length;

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
      stash,
      isClean: changed === 0 && staged === 0,
      lastCommit,
      files: status.files.map((f) => ({
        path: f.path,
        index: f.index,
        working_dir: f.working_dir,
      })),
    };
  } catch (e) {
    return {
      name: path.basename(repoPath),
      path: repoPath,
      error: e.message,
      branch: "?",
      isClean: null,
      changed: 0,
      staged: 0,
      stash: 0,
      ahead: 0,
      behind: 0,
      hasRemote: false,
      lastCommit: null,
      files: [],
    };
  }
}

// GET all repos status
app.get("/api/repos", async (req, res) => {
  const config = loadConfig();
  const paths = new Set([...config.repoPaths]);
  if (config.scanDir) {
    scanDirectory(config.scanDir).forEach((p) => paths.add(p));
  }
  const statuses = await Promise.all([...paths].map(getRepoStatus));
  res.json(statuses);
});

// GET single repo status
app.get("/api/repos/status", async (req, res) => {
  const { path: repoPath } = req.query;
  if (!repoPath) return res.status(400).json({ error: "path required" });
  const resolved = resolveRepoPath(repoPath);
  if (!resolved)
    return res.status(400).json({ error: "Invalid or non-existent path" });
  const status = await getRepoStatus(resolved);
  res.json(status);
});

// POST git operation (fetch/pull/push)
app.post("/api/repos/git", async (req, res) => {
  const { path: repoPath, action, message } = req.body;
  if (!repoPath || !action)
    return res.status(400).json({ error: "path and action required" });
  const resolved = resolveRepoPath(repoPath);
  if (!resolved)
    return res.status(400).json({ error: "Invalid or non-existent path" });
  if (!isGitRepo(resolved))
    return res.status(400).json({ error: "Not a git repository" });

  try {
    const git = simpleGit(resolved);
    let result = "";

    if (action === "fetch") {
      await git.fetch(["--all", "--prune"]);
      result = "Fetched from all remotes";
    } else if (action === "pull") {
      const pullResult = await git.pull();
      result =
        pullResult.summary.changes > 0
          ? `Pulled: ${pullResult.summary.changes} change(s), ${pullResult.summary.insertions} insertion(s), ${pullResult.summary.deletions} deletion(s)`
          : "Already up to date";
    } else if (action === "push") {
      await git.push();
      result = "Pushed to origin";
    } else if (action === "commit") {
      if (!message)
        return res.status(400).json({ error: "commit message required" });
      await git.add(".");
      const commitResult = await git.commit(message);
      result = `Committed: ${commitResult.summary.changes} change(s) — ${commitResult.commit}`;
    } else {
      return res.status(400).json({ error: "unknown action" });
    }

    const status = await getRepoStatus(resolved);
    res.json({ success: true, result, status });
  } catch (e) {
    res.status(500).json({ success: false, result: e.message });
  }
});

// GET config
app.get("/api/config", (req, res) => {
  res.json(loadConfig());
});

// POST config
app.post("/api/config", (req, res) => {
  const { repoPaths, scanDir } = req.body;
  const validatedPaths = Array.isArray(repoPaths)
    ? repoPaths.filter((p) => typeof p === "string")
    : [];
  saveConfig({
    repoPaths: validatedPaths,
    scanDir: typeof scanDir === "string" ? scanDir : "",
  });
  res.json({ ok: true });
});

// POST add single repo
app.post("/api/repos/add", (req, res) => {
  const { path: repoPath } = req.body;
  if (!repoPath) return res.status(400).json({ error: "path required" });
  const resolved = resolveRepoPath(repoPath);
  if (!resolved)
    return res.status(400).json({ error: "Invalid or non-existent path" });
  if (!isGitRepo(resolved))
    return res.status(400).json({ error: "Not a git repository" });
  const config = loadConfig();
  if (!config.repoPaths.includes(resolved)) {
    config.repoPaths.push(resolved);
    saveConfig(config);
  }
  res.json({ ok: true });
});

// POST fetch all repos
app.post("/api/repos/fetch-all", async (req, res) => {
  const config = loadConfig();
  const paths = new Set([...config.repoPaths]);
  if (config.scanDir) {
    scanDirectory(config.scanDir).forEach((p) => paths.add(p));
  }
  const results = await Promise.all(
    [...paths].map(async (repoPath) => {
      try {
        const git = simpleGit(repoPath);
        const remotes = await git.getRemotes(true).catch(() => []);
        if (remotes.length > 0) {
          await git.fetch(["--all", "--prune"]);
        }
      } catch {
        // ignore fetch errors; still return updated status
      }
      return getRepoStatus(repoPath);
    }),
  );
  res.json(results);
});

// DELETE repo from list
app.delete("/api/repos", (req, res) => {
  const { path: repoPath } = req.body;
  if (!repoPath) return res.status(400).json({ error: "path required" });
  const config = loadConfig();
  config.repoPaths = config.repoPaths.filter((p) => p !== repoPath);
  saveConfig(config);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5800;
app.listen(PORT, () => {
  console.log(`\n🚀 Git Dashboard running at http://localhost:${PORT}\n`);
});
