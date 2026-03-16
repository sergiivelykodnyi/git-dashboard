import { useCallback, useEffect, useRef } from "react";
import { fetchRepos } from "../api";
import { useAppStore } from "../store";

export function useRepos(intervalMs = 60_000) {
  const { setRepos, setLastRefresh, addLog } = useAppStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchRepos();
      setRepos(data);
      setLastRefresh();
    } catch {
      addLog("Cannot connect to server — is it running?", "err");
    }
  }, [setRepos, setLastRefresh, addLog]);

  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refresh, intervalMs]);

  return { refresh };
}
