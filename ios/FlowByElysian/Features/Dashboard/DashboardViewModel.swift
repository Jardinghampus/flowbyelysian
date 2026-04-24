import SwiftData
import Foundation

@MainActor
final class DashboardViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var requests: [ClientRequest] = []
    @Published var notifications: [AppNotification] = []
    @Published var isLoading = false
    @Published var error: String?

    private let sync = SyncManager.shared
    private let api = APIClient.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }

        if isOnline {
            await withTaskGroup(of: Void.self) { group in
                group.addTask {
                    if let result = try? await self.sync.fetchListings(context: context) {
                        await MainActor.run { self.listings = Array(result.prefix(5)) }
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
            listings = Array(sync.cachedListings(context: context).prefix(5))
            requests = Array(sync.cachedRequests(context: context).prefix(5))
            notifications = Array(sync.cachedNotifications(context: context).prefix(5))
        }
    }

    var unreadCount: Int { notifications.filter { $0.isRead == false }.count }
    var activeRequests: Int { requests.filter { $0.status == "active" }.count }
    var liveListings: Int { listings.filter { $0.status == "live" }.count }
}
