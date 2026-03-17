import {
  RefreshCw,
  Plus,
  Sun,
  Moon,
  GitBranch,
  CloudDownload,
} from "lucide-react";
import { useAppStore } from "../store";

interface Props {
  onRefresh: () => void;
  refreshing: boolean;
  onFetchAll: () => void;
  fetching: boolean;
  onAddRepo: () => void;
}

export function Header({
  onRefresh,
  refreshing,
  onFetchAll,
  fetching,
  onAddRepo,
}: Props) {
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
          {refreshing ? (
            <span className="spinner" />
          ) : (
            <RefreshCw size={12} className={refreshing ? "spin" : ""} />
          )}{" "}
          Refresh all
        </button>
        <button
          className="btn btn-blue"
          onClick={onFetchAll}
          disabled={fetching}
        >
          {fetching ? (
            <span className="spinner" />
          ) : (
            <CloudDownload size={12} />
          )}{" "}
          Fetch all
        </button>
        <button className="btn btn-primary" onClick={onAddRepo}>
          <Plus size={12} /> Add repo
        </button>
        <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
          {theme === "mocha" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
