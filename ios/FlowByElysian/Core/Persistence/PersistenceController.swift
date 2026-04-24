import SwiftData
import Foundation

@MainActor
final class PersistenceController {
    static let shared = PersistenceController()

    let container: ModelContainer

    private init() {
        let schema = Schema([
            CachedListing.self,
            CachedContact.self,
            CachedRequest.self,
            CachedNotification.self,
            CachedArea.self
        ])
        let config = ModelConfiguration("FlowByElysian", schema: schema, isStoredInMemoryOnly: false)
        do {
            container = try ModelContainer(for: schema, configurations: config)
        } catch {
            fatalError("SwiftData kunde inte initieras: \(error)")
        }
    }
}
