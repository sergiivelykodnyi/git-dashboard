import { create } from 'zustand';
import type { Repo, LogEntry, Theme } from '../types';

let logId = 0;

interface AppState {
  repos: Repo[];
  activeRepoPath: string | null;
  logs: LogEntry[];
  theme: Theme;
  lastRefresh: Date | null;

  setRepos: (repos: Repo[]) => void;
  updateRepo: (repo: Repo) => void;
  removeRepo: (path: string) => void;
  setActiveRepo: (path: string | null) => void;
  addLog: (msg: string, type: LogEntry['type']) => void;
  clearLogs: () => void;
  toggleTheme: () => void;
  setLastRefresh: () => void;
}

const saved = localStorage.getItem('theme');
const savedTheme: Theme = (saved === 'mocha' || saved === 'latte') ? saved : 'mocha';
document.documentElement.dataset.theme = savedTheme;

export const useAppStore = create<AppState>((set) => ({
  repos: [],
  activeRepoPath: null,
  logs: [],
  theme: savedTheme,
  lastRefresh: null,

  setRepos: (repos) => set({ repos }),

  updateRepo: (repo) =>
    set((state) => ({
      repos: state.repos.map((r) => (r.path === repo.path ? repo : r)),
    })),

  removeRepo: (path) =>
    set((state) => ({
      repos: state.repos.filter((r) => r.path !== path),
      activeRepoPath: state.activeRepoPath === path ? null : state.activeRepoPath,
    })),

  setActiveRepo: (path) => set({ activeRepoPath: path }),

  addLog: (msg, type) =>
    set((state) => ({
      logs: [
        ...state.logs.slice(-49),
        { id: logId++, msg, type, time: new Date().toLocaleTimeString() },
      ],
    })),

  clearLogs: () => set({ logs: [] }),

  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === 'mocha' ? 'latte' : 'mocha';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('theme', next);
      return { theme: next };
    }),

  setLastRefresh: () => set({ lastRefresh: new Date() }),
}));
