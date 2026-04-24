import SwiftData
import Foundation

struct AppNotification: Codable, Identifiable {
    let id: String
    let title: String
    let body: String?
    let type: String?
    let isRead: Bool?
    let createdAt: String?

    var typeIcon: String {
        switch type {
        case "match": return "arrow.triangle.2.circlepath"
        case "listing": return "building.2"
        case "request": return "person.2"
        default: return "bell"
        }
    }
}

struct NotificationsResponse: Codable {
    let notifications: [AppNotification]?
    let data: [AppNotification]?
}

@Model
final class CachedNotification {
    var id: String
    var title: String
    var body: String?
    var type: String?
    var isRead: Bool
    var cachedAt: Date

    init(from n: AppNotification) {
        self.id = n.id
        self.title = n.title
        self.body = n.body
        self.type = n.type
        self.isRead = n.isRead ?? false
        self.cachedAt = Date()
    }

    func toNotification() -> AppNotification {
        AppNotification(id: id, title: title, body: body, type: type, isRead: isRead, createdAt: nil)
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
        self.id = id
        self.slug = slug
        self.name = name
        self.areaDescription = description
        self.image = image
        self.cachedAt = Date()
    }
}
