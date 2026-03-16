# 🗂️ Git Dashboard — React Edition

A local web app to monitor and manage all your Git repositories from one page.  
Built with **Vite + React + TypeScript**. Styled with **Catppuccin** — Mocha (dark) and Latte (light) themes.

## Features

- 📋 Sidebar list of all repos with live status badges
- 🌿 Current branch + remote tracking info
- ↑↓ Ahead / behind remote indicators
- 📄 Changed files list with status (M / A / D / R)
- 📦 Last commit info (hash, message, author, date)
- ⚡ **Fetch**, **Pull**, **Push** per repo with one click
- ✏️ **Commit** changes with a message (stages everything + commits)
- 🔄 Auto-refresh every 30 seconds
- 🌙 Mocha (dark) / ☀️ Latte (light) theme toggle, persisted in localStorage

## Tech Stack

| Layer    | Tech                         |
| -------- | ---------------------------- |
| Frontend | React 19, TypeScript, Vite   |
| State    | Zustand                      |
| HTTP     | Axios                        |
| Icons    | Lucide React                 |
| Backend  | Node.js, Express, simple-git |
| Theme    | Catppuccin (Mocha + Latte)   |

## Requirements

- [Node.js](https://nodejs.org/) v18+

## Setup

```bash
# Install all dependencies
npm install

# Option A — run frontend and backend together (recommended)
npm run dev:all

# Option B — run separately in two terminals
npm run server   # backend  → http://localhost:3000
npm run dev      # frontend → http://localhost:5173
```

Then open **http://localhost:5173** in your browser.

## Adding Repositories

**Single repo** — Click **Add repo** → paste an absolute path, e.g. `/Users/you/projects/my-app`

**Scan a folder** — Click **Add repo** → enter a parent directory, e.g. `/Users/you/projects`  
All git repositories inside will be auto-discovered.

## Project Structure

```
├── server.js               # Express backend (git operations)
├── src/
│   ├── api/index.ts        # Axios API layer
│   ├── store/index.ts      # Zustand global store
│   ├── hooks/
│   │   ├── useRepos.ts     # Data fetching + auto-refresh
│   │   └── useGitAction.ts # Git operation hook
│   ├── types/index.ts      # Shared TypeScript types
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── RepoItem.tsx
│   │   ├── RepoDetail.tsx
│   │   ├── StatsGrid.tsx
│   │   ├── FileList.tsx
│   │   ├── CommitForm.tsx
│   │   ├── LogOutput.tsx
│   │   ├── AddRepoModal.tsx
│   │   └── Toast.tsx
│   └── styles/
│       ├── catppuccin.css  # Latte + Mocha CSS variables
│       └── app.css         # All component styles
```

## Custom Port

```bash
PORT=8080 node server.js
```

Repos and scan directory are saved in `config.json` next to `server.js`.
