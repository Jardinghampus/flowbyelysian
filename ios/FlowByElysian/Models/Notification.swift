import SwiftData
import Foundation

// Matches actual Supabase notifications table
struct AppNotification: Codable, Identifiable {
    let id: String
    let userId: String?
    let type: String?
    let title: String
    let message: String?   // field is "message" not "body"
    let link: String?
    let read: Bool?        // field is "read" not "is_read"
    let createdAt: String?

    var isUnread: Bool { read == false }

    var typeIcon: String {
        switch type {
        case "match":   return "arrow.triangle.2.circlepath.circle.fill"
        case "listing": return "building.2.fill"
        case "request": return "person.2.fill"
        default:        return "bell.fill"
        }
    }
}

struct NotificationsResponse: Codable {
    let notifications: [AppNotification]?
    let data: [AppNotification]?
    let unreadCount: Int?
}

struct MarkReadPayload: Encodable {
    let markAllRead: Bool?
    let ids: [String]?
}

@Model
final class CachedNotification {
    var id: String
    var title: String
    var message: String?
    var type: String?
    var isRead: Bool
    var cachedAt: Date

    init(from n: AppNotification) {
        id       = n.id
        title    = n.title
        message  = n.message
        type     = n.type
        isRead   = n.read ?? false
        cachedAt = .now
    }

    func toNotification() -> AppNotification {
        AppNotification(id: id, userId: nil, type: type, title: title,
                        message: message, link: nil, read: isRead, createdAt: nil)
    }
}

@Model
final class CachedArea {
    var id: String
    var slug: String
    var name: String
    var areaDescription: String?
    var image: String?
    var cachedAt: Date

    init(id: String, slug: String, name: String, description: String?, image: String?) {
        self.id               = id
        self.slug             = slug
        self.name             = name
        self.areaDescription  = description
        self.image            = image
        self.cachedAt         = .now
    }
}
