const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("whatsappWidget", {
  toggleSidebar: () => ipcRenderer.send("toggle-sidebar"),
  setSidebar: (open) => ipcRenderer.send("set-sidebar", open),
  onSidebarState: (cb) => ipcRenderer.on("sidebar-state", (_e, open) => cb(open)),
  onUnreadCount: (cb) => ipcRenderer.on("unread-count", (_e, count) => cb(count)),
  onWhatsAppLoaded: (cb) => ipcRenderer.on("whatsapp-loaded", () => cb()),
});
