import SwiftUI
import SwiftData

@main
struct FlowByElysianApp: App {
    @StateObject private var authManager = AuthManager()
    @StateObject private var networkMonitor = NetworkMonitor()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(networkMonitor)
                .modelContainer(PersistenceController.shared.container)
        }
    }
}
