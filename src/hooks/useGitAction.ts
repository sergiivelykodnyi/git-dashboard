import { useState } from 'react';
import { runGitAction } from '../api';
import { useAppStore } from '../store';
import type { GitAction } from '../types';

export function useGitAction() {
  const [loading, setLoading] = useState<GitAction | null>(null);
  const { updateRepo, addLog } = useAppStore();

  const execute = async (path: string, action: GitAction, message?: string) => {
    setLoading(action);
    addLog(`Running git ${action}…`, 'info');
    try {
      const data = await runGitAction(path, action, message);
      if (data.success) {
        addLog(data.result, 'ok');
        if (data.status) updateRepo(data.status);
      } else {
        addLog(data.result, 'err');
      }
      return data;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      addLog(msg, 'err');
      return { success: false, result: msg };
    } finally {
      setLoading(null);
    }
  };

  return { execute, loading };
}
