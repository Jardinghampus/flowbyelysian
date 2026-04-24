import SwiftUI
import SwiftData

@Observable @MainActor
final class NotificationsViewModel {
    private(set) var notifications: [AppNotification] = []
    private(set) var isLoading = false
    var errorMessage: String?

    var unreadCount: Int { notifications.count(where: { $0.isUnread }) }

    private let sync = SyncManager.shared
    private let api  = APIClient.shared

    func load(context: ModelContext, isOnline: Bool, appState: AppState? = nil) async {
        isLoading = true
        defer { isLoading = false }

        if isOnline {
            notifications = (try? await sync.fetchNotifications(context: context))
                         ?? sync.cachedNotifications(context: context)
        } else {
            notifications = sync.cachedNotifications(context: context)
        }
        appState?.notificationUnreadCount = unreadCount
    }

    func markRead(id: String, context: ModelContext) async {
        struct Patch: Encodable { let read: Bool }
        guard let idx = notifications.firstIndex(where: { $0.id == id }) else { return }
        let n = notifications[idx]
        guard n.isUnread else { return }

        // Optimistic update
        notifications[idx] = AppNotification(
            id: n.id, userId: n.userId, type: n.type,
            title: n.title, message: n.message,
            link: n.link, read: true, createdAt: n.createdAt
        )
        updateCache(id: id, isRead: true, context: context)

        do {
            try await api.patchVoid(Endpoint.notification(id), body: Patch(read: true))
        } catch {
            // Rollback
            notifications[idx] = n
            updateCache(id: id, isRead: false, context: context)
            errorMessage = error.localizedDescription
        }
    }

    func markAllRead(context: ModelContext) async {
        let unread = notifications.filter(\.isUnread)
        guard !unread.isEmpty else { return }

        // Optimistic update
        notifications = notifications.map { n in
            guard n.isUnread else { return n }
            return AppNotification(id: n.id, userId: n.userId, type: n.type,
                                   title: n.title, message: n.message,
                                   link: n.link, read: true, createdAt: n.createdAt)
        }
        unread.forEach { updateCache(id: $0.id, isRead: true, context: context) }

        do {
            let ids = unread.map(\.id)
            try await api.postVoid(
                "\(Endpoint.notifications)/mark-read",
                body: MarkReadPayload(markAllRead: nil, ids: ids)
            )
        } catch {
            // Reload on failure
            await load(context: context, isOnline: true)
            errorMessage = error.localizedDescription
        }
    }

    private func updateCache(id: String, isRead: Bool, context: ModelContext) {
        if let cached = try? context.fetch(FetchDescriptor<CachedNotification>())
                                    .first(where: { $0.id == id }) {
            cached.isRead = isRead
            try? context.save()
        }
    }
}
