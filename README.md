Live webiste :- 
# 🚀 Live Codex

A real‑time collaborative code editor with rooms, built with React (CRA) and Express + Socket.IO. The server can serve the production React build, so you can deploy as a single Node service.

## ✨ Features

- ⚡ Real‑time collaboration with Socket.IO (join by room id)
- 📝 Code editor UI (CodeMirror 5)
- 🔔 Toast notifications and simple routing
- 🧪 Compile endpoint stub (`POST /compile`) for future execution integration
- 📦 Production build served by Express (SPA fallback)

## 🧰 Tech Stack

- 🖥️ Client: React 18, React Router, CodeMirror 5, Bootstrap, react-hot-toast
- 🛠️ Server: Node.js (>= 18), Express 5, Socket.IO, CORS (dev only)

## 📁 Project Structure

```text
Live-Dev_v2/
  client/           # React app (CRA)
  server/           # Express + Socket.IO server
  package.json      # Root scripts to build/start both
  .gitignore
```



## 🗂️ Folder Structure Details

```text
Live-Dev_v2/
├─ client/
│  ├─ public/
│  │  ├─ images/
│  │  │  ├─ FullLogo_Transparent.png
│  │  │  └─ IconOnly_Transparent.png
│  │  └─ index.html            # CRA HTML template
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ Home.js            # Landing page (create/join room)
│  │  │  ├─ EditorPage.js      # Room page + participants + compiler UI
│  │  │  ├─ Editor.js          # CodeMirror editor wrapper
│  │  │  └─ Client.js          # User avatar/name in the sidebar
│  │  ├─ socket.js             # Socket.IO client init (dev vs prod base URL)
│  │  ├─ App.js                # Routes (/ and /editor/:roomid)
│  │  ├─ index.js              # React entry
│  │  └─ App.css               # Global styles
│  ├─ package.json             # Client scripts (start/build/test)
│  └─ build/                   # Production build output (generated)
│
├─ server/
│  ├─ index.js                 # Express app, Socket.IO server, SPA fallback
│  ├─ package.json             # Server scripts (start/dev) and engines
│  └─ node_modules/            # Server deps (generated)
│
├─ package.json                # Root scripts: build/start full stack
├─ README.md                   # Project docs
└─ .gitignore                  # Ignore node_modules, builds, env files, etc.
```

### 🔍 Key Files

- `server/index.js`: Sets up Express + Socket.IO, dev-only CORS, `POST /compile`, and in production serves `client/build` with SPA fallback.
- `client/src/socket.js`: Chooses Socket.IO base URL (localhost in dev, same‑origin in prod).
- `client/src/components/EditorPage.js`: Manages room lifecycle, syncs code via Socket.IO, and calls `POST /compile`.
- `package.json` (root):
  - `build`: installs client deps, builds client, installs server deps
  - `start`: runs server in production mode to serve the built client

<img width="1266" height="854" alt="image" src="https://github.com/user-attachments/assets/803c7c11-7103-4d96-818d-6aeea54bb72a" />

## ▶️ Quick Start

From the repository root:

- Build production client and install server deps:

```bash
npm run build
```

- Start server in production mode (serves `client/build`):

```bash
npm run start
# open http://localhost:5000
```

- Dev mode (separate servers):

```bash
npm run dev --prefix server
npm start --prefix client
# open http://localhost:3000
```

## 🧪 API

- `POST /compile`
  - Body: `{ code: string, language: string }`
  - Response: `{ output: string }` (placeholder)

## 📝 Notes

- Express 5 path matching is stricter; this project uses a regex fallback route to avoid `path-to-regexp` wildcard issues.
- Node version is specified (>= 18) in `server/package.json`.

## 🪪 License

ISC
>>>>>>> 54cc355703784b38f3ffad6cdc9212431045b15d
