import { RefreshCw } from 'lucide-react';
import { useAppStore } from '../store';
import { RepoItem } from './RepoItem';

interface Props {
  onRefresh: () => void;
}

export function Sidebar({ onRefresh }: Props) {
  const { repos, activeRepoPath, setActiveRepo } = useAppStore();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Repositories</span>
        <div className="sidebar-actions">
          <button className="btn-icon" onClick={onRefresh} title="Refresh">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <div className="repo-list">
        {repos.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--overlay0)', fontSize: '12px', lineHeight: 1.6 }}>
            No repositories yet.<br />
            Click <strong>Add repo</strong> to get started.
          </div>
        ) : (
          repos.map((repo) => (
            <RepoItem
              key={repo.path}
              repo={repo}
              active={repo.path === activeRepoPath}
              onClick={() => setActiveRepo(repo.path)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
