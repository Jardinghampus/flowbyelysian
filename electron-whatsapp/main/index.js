const { app, BrowserWindow, BrowserView, ipcMain, globalShortcut, Notification, session, nativeTheme } = require("electron");
const path = require("path");
const Store = require("electron-store");

const store = new Store({
  defaults: { sidebarOpen: false, windowBounds: { width: 1200, height: 800 } },
});

let mainWindow = null;
let whatsappView = null;
let sidebarOpen = store.get("sidebarOpen");
const SIDEBAR_WIDTH = 400;
const TOGGLE_WIDTH = 48;

function createWhatsAppView() {
  const partition = "persist:whatsapp";
  const ses = session.fromPartition(partition);

  whatsappView = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "whatsapp.js"),
      contextIsolation: true,
      nodeIntegration: false,
      partition,
      spellcheck: true,
    },
  });

  whatsappView.setAutoResize({ width: false, height: true });

  ses.webRequest.onBeforeRequest({ urls: ["*://*/*"] }, (details, callback) => {
    const url = new URL(details.url);
    const allowed = [
      "web.whatsapp.com",
      "www.whatsapp.com",
      "whatsapp.com",
      "mmg.whatsapp.net",
      "static.whatsapp.net",
      "media.whatsapp.net",
      "pps.whatsapp.net",
      "dyn.web.whatsapp.com",
      "web.whatsapp.com",
    ];
    const isAllowed =
      allowed.some((d) => url.hostname === d || url.hostname.endsWith("." + d)) ||
      url.hostname.endsWith(".whatsapp.net") ||
      url.hostname.endsWith(".whatsapp.com") ||
      url.hostname.endsWith(".facebook.com") ||
      url.hostname.endsWith(".fbcdn.net") ||
      url.protocol === "data:" ||
      url.protocol === "blob:";

    callback({ cancel: !isAllowed });
  });

  whatsappView.webContents.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  whatsappView.webContents.loadURL("https://web.whatsapp.com");

  whatsappView.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("whatsapp-loaded");
  });

  whatsappView.webContents.on("page-title-updated", (_e, title) => {
    const match = title.match(/\((\d+)\)/);
    const count = match ? parseInt(match[1]) : 0;
    mainWindow.webContents.send("unread-count", count);
  });

  return whatsappView;
}

function layoutViews() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  const [winWidth, winHeight] = mainWindow.getContentSize();

  if (sidebarOpen && whatsappView) {
    const sidebarX = winWidth - SIDEBAR_WIDTH;
    whatsappView.setBounds({
      x: sidebarX,
      y: 0,
      width: SIDEBAR_WIDTH,
      height: winHeight,
    });
    mainWindow.addBrowserView(whatsappView);
  } else if (whatsappView) {
    whatsappView.setBounds({ x: winWidth + 10, y: 0, width: SIDEBAR_WIDTH, height: winHeight });
  }
}

function toggleSidebar(forceState) {
  sidebarOpen = forceState !== undefined ? forceState : !sidebarOpen;
  store.set("sidebarOpen", sidebarOpen);
  layoutViews();
  mainWindow.webContents.send("sidebar-state", sidebarOpen);
  if (sidebarOpen && whatsappView) {
    whatsappView.webContents.focus();
  }
}

function createMainWindow() {
  const bounds = store.get("windowBounds");

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 600,
    minHeight: 400,
    title: "ZFlow",
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0a0a0a" : "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "main.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));

  createWhatsAppView();
  layoutViews();

  mainWindow.on("resize", () => {
    layoutViews();
    store.set("windowBounds", mainWindow.getBounds());
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    whatsappView = null;
  });
}

app.whenReady().then(() => {
  createMainWindow();

  globalShortcut.register("CommandOrControl+Shift+W", () => toggleSidebar());

  ipcMain.on("toggle-sidebar", () => toggleSidebar());
  ipcMain.on("set-sidebar", (_e, open) => toggleSidebar(open));

  ipcMain.on("show-notification", (_e, { title, body }) => {
    if (Notification.isSupported()) {
      const n = new Notification({ title, body, silent: false });
      n.on("click", () => {
        mainWindow.show();
        mainWindow.focus();
        toggleSidebar(true);
      });
      n.show();
    }
  });

  app.on("activate", () => {
    if (!mainWindow) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
