// TODO: This component is not used anymore and can be removed in the future.
import { useAppStore } from "../store";
import { RepoItem } from "./RepoItem";

export function Sidebar() {
  const { repos, activeRepoPath, setActiveRepo } = useAppStore();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Repositories</span>
      </div>

      <div className="repo-list">
        {repos.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "var(--overlay0)",
              fontSize: "12px",
              lineHeight: 1.6,
            }}
          >
            No repositories yet.
            <br />
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
