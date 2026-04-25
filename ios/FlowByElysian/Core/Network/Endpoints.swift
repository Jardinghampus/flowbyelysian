import Foundation

enum Endpoint {
    static let listings      = "listings"
    static let contacts      = "contacts"
    static let requests      = "requests"
    static let areas         = "areas"
    static let notifications = "notifications"
    static let chat          = "chat"
    static let news          = "news"
    static let tasks         = "tasks"
    static let reports       = "reports/monthly"

    static func listing(_ id: String) -> String      { "listings/\(id)" }
    static func contact(_ id: String) -> String      { "contacts/\(id)" }
    static func request(_ id: String) -> String      { "requests/\(id)" }
    static func area(_ slug: String) -> String       { "areas/\(slug)" }
    static func notification(_ id: String) -> String { "notifications/\(id)" }
    static func task(_ id: String) -> String         { "tasks/\(id)" }
}
