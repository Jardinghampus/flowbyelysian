import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var authManager: AuthManager
    @EnvironmentObject private var networkMonitor: NetworkMonitor

    var body: some View {
        Group {
            if authManager.isAuthenticated {
                MainTabView()
                    .overlay(alignment: .top) {
                        if !networkMonitor.isConnected {
                            OfflineBanner()
                        }
                    }
            } else {
                LoginView()
            }
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem { Label("Dashboard", systemImage: "chart.bar.fill") }

            ListingsView()
                .tabItem { Label("Listings", systemImage: "building.2.fill") }

            RequestsView()
                .tabItem { Label("Requests", systemImage: "person.2.fill") }

            ContactsView()
                .tabItem { Label("Contacts", systemImage: "person.crop.circle.fill") }

            NotificationsView()
                .tabItem { Label("Alerts", systemImage: "bell.fill") }
        }
        .tint(.indigo)
    }
}

struct OfflineBanner: View {
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "wifi.slash")
            Text("Offline – visar cachad data")
        }
        .font(.caption.weight(.medium))
        .foregroundStyle(.white)
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(.orange, in: Capsule())
        .padding(.top, 8)
        .transition(.move(edge: .top).combined(with: .opacity))
        .animation(.spring(), value: true)
    }
}
