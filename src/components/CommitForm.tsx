// TODO: This component is not used anymore and can be removed in the future.
import { useState } from 'react';
import { GitCommitHorizontal } from 'lucide-react';
import { useGitAction } from '../hooks/useGitAction';
import { toast } from './Toast';

interface Props { repoPath: string }

export function CommitForm({ repoPath }: Props) {
  const [message, setMessage] = useState('');
  const { execute, loading } = useGitAction();

  const handleCommit = async () => {
    if (!message.trim()) { toast('Enter a commit message first', 'err'); return; }
    const result = await execute(repoPath, 'commit', message.trim());
    if (result?.success) {
      toast(result.result, 'ok');
      setMessage('');
    } else if (result) {
      toast(result.result, 'err');
    }
  };

  return (
    <div className="card">
      <div className="card-title">Commit Changes</div>
      <div className="commit-form">
        <input
          className="commit-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
          placeholder="feat: describe your changes…"
        />
        <button className="btn btn-primary" onClick={handleCommit} disabled={!!loading}>
          {loading === 'commit'
            ? <span className="spinner" />
            : <GitCommitHorizontal size={12} />}
          Commit
        </button>
      </div>
    </div>
  );
}
