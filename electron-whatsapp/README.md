# ZFlow WhatsApp Widget

Persistent WhatsApp Web sidebar widget – runs as a lightweight Electron desktop app.

## Quick Start

```bash
cd electron-whatsapp
npm install
npm start
```

## Features

- **Persistent session** – QR login persists across restarts (cookies/localStorage kept)
- **Sidebar toggle** – click the WhatsApp button or press `Ctrl+Shift+W` (Cmd on Mac)
- **Native notifications** – OS-level notifications for new messages
- **Unread badge** – shows unread count on the toggle button
- **Dark mode** – follows system theme automatically
- **Domain-locked** – only WhatsApp domains are allowed (no external navigation)
- **Secure** – `contextIsolation` enabled, `nodeIntegration` disabled

## Architecture

```
electron-whatsapp/
├── main/index.js          # Main process – window, BrowserView, IPC
├── renderer/
│   ├── index.html         # Main window shell
│   ├── styles.css         # UI styles (dark mode compatible)
│   └── app.js             # Renderer logic
└── preload/
    ├── main.js            # Main window bridge (sidebar toggle, badge)
    └── whatsapp.js        # WhatsApp view bridge (notification forwarding)
```
