import type { Repo } from '../types';

interface Props { repo: Repo }

export function StatsGrid({ repo }: Props) {
  return (
    <div className="card">
      <div className="card-title">Status</div>
      <div className="stats-grid">
        <div className="stat-item stat-clean">
          <div className="stat-value">{repo.isClean ? '✓' : '✗'}</div>
          <div className="stat-label">Clean</div>
        </div>
        <div className="stat-item stat-changed">
          <div className="stat-value">{repo.changed}</div>
          <div className="stat-label">Changed</div>
        </div>
        <div className="stat-item stat-ahead">
          <div className="stat-value">{repo.ahead}</div>
          <div className="stat-label">Ahead</div>
        </div>
        <div className="stat-item stat-behind">
          <div className="stat-value">{repo.behind}</div>
          <div className="stat-label">Behind</div>
        </div>
      </div>
    </div>
  );
}
