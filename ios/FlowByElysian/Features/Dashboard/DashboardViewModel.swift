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
            // Already @MainActor – no MainActor.run needed inside task group
            await withTaskGroup(of: Void.self) { group in
                group.addTask { [weak self] in
                    guard let self else { return }
                    if let result = try? await self.sync.fetchListings(context: context) {
                        self.listings = Array(result.prefix(6))
                    }
                }
                group.addTask { [weak self] in
                    guard let self else { return }
                    if let result = try? await self.sync.fetchRequests(context: context) {
                        self.requests = Array(result.prefix(5))
                    }
                }
                group.addTask { [weak self] in
                    guard let self else { return }
                    if let result = try? await self.sync.fetchNotifications(context: context) {
                        self.notifications = Array(result.prefix(5))
                    }
                }
            }
        } else {
            listings      = Array(sync.cachedListings(context: context).prefix(6))
            requests      = Array(sync.cachedRequests(context: context).prefix(5))
            notifications = Array(sync.cachedNotifications(context: context).prefix(5))
        }
    }

    var liveListings:   Int    { listings.count(where: { $0.status == "live" }) }
    var activeRequests: Int    { requests.count(where: { $0.status == "active" }) }
    var unreadCount:    Int    { notifications.count(where: { $0.isUnread }) }
    var totalValue:     Double { listings.compactMap(\.price).reduce(0, +) }
}
