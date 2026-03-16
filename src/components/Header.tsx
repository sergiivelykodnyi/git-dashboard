import { RefreshCw, Plus, Sun, Moon, GitBranch } from 'lucide-react';
import { useAppStore } from '../store';

interface Props {
  onRefresh: () => void;
  refreshing: boolean;
  onAddRepo: () => void;
}

export function Header({ onRefresh, refreshing, onAddRepo }: Props) {
  const { theme, toggleTheme, lastRefresh } = useAppStore();

  return (
    <header>
      <div className="header-left">
        <div className="logo">
          <GitBranch size={18} />
          git dashboard
        </div>
      </div>
      <div className="header-right">
        {lastRefresh && (
          <span className="refresh-badge">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
        )}
        <button className="btn" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw size={12} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing…' : 'Refresh all'}
        </button>
        <button className="btn btn-primary" onClick={onAddRepo}>
          <Plus size={12} /> Add repo
        </button>
        <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
          {theme === 'mocha' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
