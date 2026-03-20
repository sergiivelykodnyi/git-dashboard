# Git Dashboard — Claude Code Context

A local web app for monitoring and managing multiple Git repositories from a single page.
Built with Vite + React 19 + TypeScript on the frontend, and Node.js + Express on the backend.

---

## Commands

```bash
npm run dev:all     # Start both frontend (localhost:5173) and backend (localhost:3000) — use this for development
npm run dev         # Frontend only
npm run server      # Backend only
npm run build       # Type-check + production build → dist/
npm run lint        # ESLint
npx tsc --noEmit    # Type-check without building
```

---

## Architecture

Two-process setup — both run from the same directory:

```
Frontend (Vite/React)  :5173  →  Backend (Express)  :3000  →  local git repos
```

### Frontend — `src/`

| Layer      | Path                 | Purpose                                                                        |
| ---------- | -------------------- | ------------------------------------------------------------------------------ |
| Entry      | `src/main.tsx`       | Mounts React, imports styles                                                   |
| Root       | `src/App.tsx`        | Layout, modal state, renders repo list (RepoRow × n) or empty state            |
| Types      | `src/types/index.ts` | All shared TypeScript interfaces (single source of truth)                      |
| API        | `src/api/index.ts`   | Axios wrapper — all HTTP calls to the backend                                  |
| Store      | `src/store/index.ts` | Zustand global state (repos, activeRepoPath, logs, theme)                      |
| Hooks      | `src/hooks/`         | `useRepos` (fetch + 30s auto-refresh), `useGitAction` (fetch/pull/push/commit) |
| Components | `src/components/`    | See component map below                                                        |
| Styles     | `src/styles/`        | `catppuccin.css` (CSS vars), `app.css` (all component styles)                  |

### Backend — `server.js`

Single Express file. Uses `simple-git` to run git operations on local paths.
Persists repo list to `config.json` in the project root.

---

## Key Types (`src/types/index.ts`)

```ts
interface Repo {
  name: string; // basename of path
  path: string; // absolute path on disk
  branch: string; // current branch name
  tracking: string | null; // e.g. "origin/main"
  hasRemote: boolean;
  ahead: number; // commits ahead of remote
  behind: number; // commits behind remote
  changed: number; // total modified files
  staged: number; // staged files count
  isClean: boolean;
  lastCommit: LastCommit | null;
  files: GitFile[]; // list of changed files
  error?: string; // set if git failed on this repo
}

interface GitFile {
  path: string;
  index: string; // staged status char (M, A, D, R, ?)
  working_dir: string; // unstaged status char
}

interface LastCommit {
  hash: string; // short 7-char hash
  message: string;
  author: string;
  date: string;
}

type GitAction = "fetch" | "pull" | "push" | "commit";
type Theme = "mocha" | "latte";
```

---

## Zustand Store (`src/store/index.ts`)

Single store — `useAppStore`. Shape:

```ts
{
  repos: Repo[]
  activeRepoPath: string | null
  logs: LogEntry[]          // capped at 50 entries
  theme: Theme              // persisted in localStorage
  lastRefresh: Date | null

  // actions
  setRepos(repos)
  updateRepo(repo)          // replaces by path — used after git actions
  removeRepo(path)          // also clears activeRepoPath if it matches
  setActiveRepo(path)
  addLog(msg, type)
  clearLogs()
  toggleTheme()             // also updates document.documentElement.dataset.theme
  setLastRefresh()
}
```

---

## Backend API (`server.js`)

Base URL: `http://localhost:3000/api`

| Method | Endpoint                 | Description                                                                                             |
| ------ | ------------------------ | ------------------------------------------------------------------------------------------------------- |
| GET    | `/repos`                 | Returns `Repo[]` for all configured repos + scan dir                                                    |
| GET    | `/repos/status?path=...` | Returns single `Repo`                                                                                   |
| POST   | `/repos/git`             | `{ path, action, message? }` → runs fetch/pull/push/commit, returns `{ success, result, status: Repo }` |
| POST   | `/repos/add`             | `{ path }` → validates git repo, adds to config                                                         |
| DELETE | `/repos`                 | `{ path }` → removes from config                                                                        |
| GET    | `/config`                | Returns `{ repoPaths: string[], scanDir: string }`                                                      |
| POST   | `/config`                | Saves config                                                                                            |

Config is persisted to `config.json` in the project root.

---

## Component Map (`src/components/`)

```
App.tsx
├── Header.tsx              — logo, refresh button, Add repo, theme toggle
├── RepoRow.tsx             — one card per repo: icon, name, branch pill, status badges, action buttons
├── LogOutput.tsx           — scrolling log of all git operation output (rendered below the repo list)
├── AddRepoModal.tsx        — modal: single path input OR scan-directory input
└── Toast.tsx               — imperative toast system (call toast(msg, type) from anywhere)

Unused (TODO: remove in the future):
├── Sidebar.tsx             — old sidebar container
├── RepoItem.tsx            — old sidebar row
├── RepoDetail.tsx          — old detail panel
├── StatsGrid.tsx           — old 4-cell status grid
└── CommitForm.tsx          — old commit input + button
```

---

## Theming

**Catppuccin** — two flavours:

- `mocha` = dark (default)
- `latte` = light

Theme is applied via `data-theme="mocha|latte"` on `<html>`. CSS variables are defined in `src/styles/catppuccin.css`.

All colors reference CSS variables — **never hardcode hex values**, always use the variables:

```css
/* Surfaces (dark → light in mocha, light → dark in latte) */
--base, --mantle, --crust
--surface0, --surface1, --surface2
--overlay0, --overlay1, --overlay2
--subtext0, --subtext1, --text

/* Accent colors */
--mauve    /* primary accent — buttons, active states, highlights */
--blue     /* Fetch button */
--green    /* Pull button, clean status, ok logs */
--peach    /* Push button, behind badge */
--yellow   /* changed badge, modified files */
--red      /* errors, deleted files */
--lavender, --sapphire, --sky, --teal, --pink, --flamingo, --rosewater
```

---

## Adding a New Feature — Checklist

1. **Type** — add any new interfaces/types to `src/types/index.ts`
2. **Backend** — add new Express route(s) to `server.js` using `simple-git`
3. **API** — add the corresponding function(s) to `src/api/index.ts`
4. **Store** — add state + actions to `src/store/index.ts` if needed
5. **Hook** — add a custom hook in `src/hooks/` if the logic is reusable
6. **Component** — create the component in `src/components/`
7. **Styles** — add styles to `src/styles/app.css` using CSS variables only
8. **Wire up** — import and place the component in `App.tsx` or `RepoDetail.tsx`

---

## Conventions

- **No CSS-in-JS, no Tailwind** — all styles live in `src/styles/app.css` as plain CSS using the Catppuccin CSS variables
- **Icons** — use `lucide-react` exclusively, consistent `size` prop (12px for buttons, 14–16px for inline, 22px for detail headers)
- **Font families** — `'JetBrains Mono'` for code/labels/badges/paths, `'Mona Sans'` for prose/UI text
- **Error handling** — backend errors surface via `addLog(msg, 'err')` + `toast(msg, 'err')`; never `console.error` only
- **Git operations always return updated `Repo` status** — call `updateRepo(data.status)` after any successful git action so the UI reflects the new state without a full refresh
- **Repo identity is always its absolute `path`** — never use `name` as a key (names can collide)

---

## Known Constraints / Things to Keep in Mind

- The backend has no auth — it's local-only by design
- `commit` action in the backend does `git add .` before committing (stages everything)
- Auto-refresh interval is 30s, configured in `useRepos.ts`
- Logs are capped at 50 entries in the store
- `config.json` is created automatically on first use; it's gitignored by default
- `color-mix()` is used for translucent badge backgrounds — requires a modern browser (Chrome 111+, Firefox 113+, Safari 16.2+)
