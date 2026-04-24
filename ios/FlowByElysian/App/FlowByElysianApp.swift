import SwiftUI
import SwiftData

@main
struct FlowByElysianApp: App {
    @State private var auth    = AuthManager()
    @State private var network = NetworkMonitor()
    @State private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(auth)
                .environment(network)
                .environment(appState)
                .modelContainer(PersistenceController.shared.container)
        }
    }
}
