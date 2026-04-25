import SwiftUI

enum AppTab: Hashable { case home, listings, matches, clients, performance }

@Observable @MainActor
final class AppState {
    var selectedTab: AppTab = .home
    var drawerOpen = false
    var showChat = false
    var showNotifications = false
    var showAreas = false
    var showNews = false
    var notificationUnreadCount = 0

    func openDrawer() {
        withAnimation(.spring(response: 0.38, dampingFraction: 0.82)) {
            drawerOpen = true
        }
    }

    func closeDrawer() {
        withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
            drawerOpen = false
        }
    }

    func navigate(to tab: AppTab) {
        closeDrawer()
        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
            selectedTab = tab
        }
    }

    func openChat() {
        closeDrawer()
        showChat = true
    }

    func openNotifications() {
        closeDrawer()
        showNotifications = true
    }

    func openAreas() {
        closeDrawer()
        showAreas = true
    }

    func openNews() {
        closeDrawer()
        showNews = true
    }
}
