# 🗂️ Git Dashboard

A local web app to monitor and manage all your Git repositories from one page.  
Styled with **Catppuccin** — Mocha (dark) and Latte (light) themes.

## Features

- 📋 Sidebar list of all your repos with status badges
- 🌿 Current branch + tracking info
- ↑↓ Ahead / behind remote indicators
- 📄 Changed files list with status (M/A/D/R)
- 📦 Last commit info (hash, message, author, date)
- ⚡ **Fetch**, **Pull**, **Push** with one click
- ✏️ **Commit** staged + unstaged changes with a message
- 🔄 Auto-refresh every 30 seconds
- 🌙 Dark (Mocha) / ☀️ Light (Latte) theme toggle

## Requirements

- [Node.js](https://nodejs.org/) v16+

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the server
node server.js

# 3. Open in your browser
open http://localhost:3000
```

## Adding Repositories

**Option A — Single repo:**  
Click **Add repo** → enter the absolute path to a repo, e.g. `/Users/you/projects/my-app`

**Option B — Scan a directory:**  
Click **Add repo** → enter a parent directory, e.g. `/Users/you/projects`  
All git repositories inside will be auto-discovered.

## Running on a custom port

```bash
PORT=8080 node server.js
```

## Config

Repos are saved in `config.json` next to `server.js`. You can edit it manually if needed.
