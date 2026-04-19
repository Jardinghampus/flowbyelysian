const toggleBtn = document.getElementById("toggle-btn");
const badge = document.getElementById("badge");
const loadingOverlay = document.getElementById("loading-overlay");

let isOpen = false;

toggleBtn.addEventListener("click", () => {
  window.whatsappWidget.toggleSidebar();
});

window.whatsappWidget.onSidebarState((open) => {
  isOpen = open;
  toggleBtn.classList.toggle("active", open);

  if (open) {
    loadingOverlay.classList.remove("hidden");
  } else {
    loadingOverlay.classList.add("hidden");
  }
});

window.whatsappWidget.onUnreadCount((count) => {
  if (count > 0) {
    badge.textContent = count > 99 ? "99+" : count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
});

window.whatsappWidget.onWhatsAppLoaded(() => {
  loadingOverlay.classList.add("hidden");
});

// Hide loading overlay initially
loadingOverlay.classList.add("hidden");
