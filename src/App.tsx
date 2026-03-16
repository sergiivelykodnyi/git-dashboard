import { useState } from 'react';
import { BookMarked } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { RepoDetail } from './components/RepoDetail';
import { AddRepoModal } from './components/AddRepoModal';
import { ToastContainer } from './components/Toast';
import { useRepos } from './hooks/useRepos';
import { useAppStore } from './store';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { refresh } = useRepos();
  const { repos, activeRepoPath } = useAppStore();

  const activeRepo = repos.find((r) => r.path === activeRepoPath) ?? null;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <>
      <Header onRefresh={handleRefresh} refreshing={refreshing} onAddRepo={() => setShowModal(true)} />
      <div className="layout">
        <Sidebar onRefresh={handleRefresh} />
        <main className="main">
          {activeRepo ? (
            <RepoDetail repo={activeRepo} />
          ) : (
            <div className="empty-state">
              <BookMarked size={56} strokeWidth={1.2} style={{ opacity: 0.25 }} />
              <h3>No repository selected</h3>
              <p>Select a repository from the sidebar, or add one to get started.</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Add repository
              </button>
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <AddRepoModal onClose={() => setShowModal(false)} onAdded={handleRefresh} />
      )}

      <ToastContainer />
    </>
  );
}

export default App;
