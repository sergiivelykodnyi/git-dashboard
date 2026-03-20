// TODO: This component is not used anymore and can be removed in the future.
import { GitBranch, BookMarked } from 'lucide-react';
import type { Repo } from '../types';

interface Props {
  repo: Repo;
  active: boolean;
  onClick: () => void;
}

export function RepoItem({ repo, active, onClick }: Props) {
  return (
    <div className={`repo-item ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="repo-icon">
        <BookMarked size={14} />
      </div>
      <div className="repo-info">
        <div className="repo-name">{repo.name}</div>
        <div className="repo-branch">
          <GitBranch size={10} />
          {repo.branch || '?'}
        </div>
      </div>
      <div className="repo-badges">
        {repo.error && <span className="badge badge-error">err</span>}
        {!repo.error && repo.isClean && !repo.ahead && !repo.behind && (
          <span className="badge badge-clean">✓</span>
        )}
        {repo.changed > 0 && <span className="badge badge-changed">{repo.changed}</span>}
        {repo.ahead > 0 && <span className="badge badge-ahead">↑{repo.ahead}</span>}
        {repo.behind > 0 && <span className="badge badge-behind">↓{repo.behind}</span>}
      </div>
    </div>
  );
}
