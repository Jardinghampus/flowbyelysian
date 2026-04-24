import SwiftData
import Foundation

@MainActor
final class NotificationsViewModel: ObservableObject {
    @Published var notifications: [AppNotification] = []
    @Published var isLoading = false

    private let sync = SyncManager.shared
    private let api = APIClient.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }
        if isOnline {
            notifications = (try? await sync.fetchNotifications(context: context)) ?? sync.cachedNotifications(context: context)
        } else {
            notifications = sync.cachedNotifications(context: context)
        }
    }

    func markAllRead() async {
        // PATCH /api/notifications med read: true för alla
        struct Payload: Encodable { let readAll: Bool }
        _ = try? await api.patch(
            Endpoint.notifications,
            body: Payload(readAll: true)
        ) as EmptyResponse
        notifications = notifications.map {
            AppNotification(id: $0.id, title: $0.title, body: $0.body, type: $0.type, isRead: true, createdAt: $0.createdAt)
        }
    }
}

struct EmptyResponse: Decodable {}
