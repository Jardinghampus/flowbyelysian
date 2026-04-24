import SwiftUI
import SwiftData

@Observable @MainActor
final class DashboardViewModel {
    private(set) var listings: [Listing] = []
    private(set) var requests: [ClientRequest] = []
    private(set) var notifications: [AppNotification] = []
    private(set) var isLoading = false

    private let sync = SyncManager.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }

        if isOnline {
            await withTaskGroup(of: Void.self) { group in
                group.addTask {
                    if let result = try? await self.sync.fetchListings(context: context) {
                        await MainActor.run { self.listings = Array(result.prefix(6)) }
                    }
                }
                group.addTask {
                    if let result = try? await self.sync.fetchRequests(context: context) {
                        await MainActor.run { self.requests = Array(result.prefix(5)) }
                    }
                }
                group.addTask {
                    if let result = try? await self.sync.fetchNotifications(context: context) {
                        await MainActor.run { self.notifications = Array(result.prefix(5)) }
                    }
                }
            }
        } else {
            listings      = Array(sync.cachedListings(context: context).prefix(6))
            requests      = Array(sync.cachedRequests(context: context).prefix(5))
            notifications = Array(sync.cachedNotifications(context: context).prefix(5))
        }
    }

    var liveListings:   Int { listings.filter { $0.status == "live" }.count }
    var activeRequests: Int { requests.filter { $0.status == "active" }.count }
    var unreadCount:    Int { notifications.filter { $0.isRead == false }.count }
    var totalValue:     Double { listings.compactMap { $0.price }.reduce(0, +) }
}
