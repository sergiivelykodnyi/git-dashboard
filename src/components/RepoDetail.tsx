import { Download, Upload, RefreshCw, Trash2, GitBranch, BookMarked } from 'lucide-react';
import { useAppStore } from '../store';
import { removeRepo as apiRemoveRepo } from '../api';
import { useGitAction } from '../hooks/useGitAction';
import { toast } from './Toast';
import { StatsGrid } from './StatsGrid';
import { FileList } from './FileList';
import { CommitForm } from './CommitForm';
import { LogOutput } from './LogOutput';
import type { Repo } from '../types';

interface Props { repo: Repo }

function formatDate(d: string) {
  const date = new Date(d);
  return isNaN(date.getTime()) ? d : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function RepoDetail({ repo }: Props) {
  const { removeRepo } = useAppStore();
  const { execute, loading } = useGitAction();

  const handleGit = async (action: 'fetch' | 'pull' | 'push') => {
    const result = await execute(repo.path, action);
    if (result?.success) toast(result.result, 'ok');
    else if (result) toast(result.result, 'err');
  };

  const handleRemove = async () => {
    await apiRemoveRepo(repo.path);
    removeRepo(repo.path);
    toast('Repository removed');
  };

  return (
    <div className="repo-detail">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-title">
          <div className="detail-icon"><BookMarked size={22} /></div>
          <div>
            <div className="detail-name">{repo.name}</div>
            <div className="detail-path">{repo.path}</div>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn btn-blue" onClick={() => handleGit('fetch')} disabled={!!loading}>
            {loading === 'fetch' ? <span className="spinner" /> : <Download size={12} />} Fetch
          </button>
          <button className="btn btn-green" onClick={() => handleGit('pull')} disabled={!!loading}>
            {loading === 'pull' ? <span className="spinner" /> : <RefreshCw size={12} />} Pull
          </button>
          <button className="btn btn-peach" onClick={() => handleGit('push')} disabled={!!loading}>
            {loading === 'push' ? <span className="spinner" /> : <Upload size={12} />} Push
          </button>
          <button className="btn" onClick={handleRemove}>
            <Trash2 size={12} /> Remove
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid repo={repo} />

      {/* Two column: last commit + branch */}
      <div className="two-col">
        <div className="card">
          <div className="card-title">Last Commit</div>
          {repo.lastCommit ? (
            <div className="commit-info">
              <div className="commit-hash">{repo.lastCommit.hash}</div>
              <div>
                <div className="commit-msg">{repo.lastCommit.message}</div>
                <div className="commit-meta">
                  {repo.lastCommit.author} · {formatDate(repo.lastCommit.date)}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--overlay0)', fontSize: 13 }}>No commits yet</div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Branch</div>
          <div className="commit-info">
            <div style={{ flex: 1 }}>
              <div className="commit-msg" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GitBranch size={14} color="var(--mauve)" />
                {repo.branch || '?'}
              </div>
              <div className="commit-meta" style={{ marginTop: 6 }}>
                Tracking: {repo.tracking ?? 'no remote tracking'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File list */}
      <FileList files={repo.files} />

      {/* Commit */}
      <CommitForm repoPath={repo.path} />

      {/* Log */}
      <LogOutput />
    </div>
  );
}
