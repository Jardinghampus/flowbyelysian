import SwiftUI
import SwiftData

@main
struct FlowByElysianApp: App {
    @State private var auth       = AuthManager()
    @State private var network    = NetworkMonitor()
    @State private var appState   = AppState()
    @State private var calendar   = CalendarManager()
    @State private var router     = AppStateRouter.shared

    init() {
        NotificationManager.shared.registerOnLaunch()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(auth)
                .environment(network)
                .environment(appState)
                .environment(calendar)
                .modelContainer(PersistenceController.shared.container)
                // Handle deep-link navigation from notification quick actions
                .onChange(of: router.pendingTab) { _, tab in
                    if let tab {
                        appState.navigate(to: tab)
                        router.pendingTab = nil
                    }
                }
        }
    }
}
