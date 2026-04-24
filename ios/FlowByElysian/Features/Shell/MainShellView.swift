import SwiftUI

struct MainShellView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        @Bindable var appState = appState

        ZStack(alignment: .leading) {
            // Tab content + dim
            ZStack {
                TabView(selection: $appState.selectedTab) {
                    Tab("Home", systemImage: "house.fill", value: AppTab.home) {
                        DashboardView()
                    }
                    Tab("Listings", systemImage: "building.2.fill", value: AppTab.listings) {
                        ListingsView()
                    }
                    Tab("Clients", systemImage: "person.2.fill", value: AppTab.clients) {
                        ClientsView()
                    }
                    Tab("Reports", systemImage: "chart.bar.fill", value: AppTab.reports) {
                        ReportsView()
                    }
                }
                .tint(AppTheme.Color.brand)
                .scaleEffect(appState.drawerOpen ? 0.93 : 1, anchor: .trailing)
                .offset(x: appState.drawerOpen ? 264 : 0)
                .blur(radius: appState.drawerOpen ? 1.5 : 0)
                .allowsHitTesting(!appState.drawerOpen)
                .animation(.spring(response: 0.38, dampingFraction: 0.82), value: appState.drawerOpen)

                if appState.drawerOpen {
                    Color.black.opacity(0.28)
                        .ignoresSafeArea()
                        .onTapGesture { appState.closeDrawer() }
                        .transition(.opacity)
                }
            }

            // Drawer
            LeftDrawerView()
                .frame(width: 264)
                .offset(x: appState.drawerOpen ? 0 : -280)
                .animation(.spring(response: 0.38, dampingFraction: 0.82), value: appState.drawerOpen)
                .zIndex(10)
        }
    }
}
