const { ipcRenderer } = require("electron");

const origNotification = window.Notification;

window.Notification = function (title, options) {
  ipcRenderer.send("show-notification", {
    title,
    body: options?.body || "",
  });

  if (origNotification) {
    return new origNotification(title, options);
  }
};

window.Notification.permission = "granted";
window.Notification.requestPermission = async () => "granted";
