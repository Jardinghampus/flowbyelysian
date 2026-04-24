import SwiftData
import Foundation

struct Contact: Codable, Identifiable {
    let id: String
    let name: String
    let email: String?
    let phone: String?
    let whatsapp: String?
    let role: String?
    let areaId: String?
    let createdAt: String?

    var initials: String {
        name.split(separator: " ")
            .compactMap { $0.first.map(String.init) }
            .prefix(2)
            .joined()
            .uppercased()
    }
}

struct ContactsResponse: Codable {
    let contacts: [Contact]?
    let data: [Contact]?
}

@Model
final class CachedContact {
    var id: String
    var name: String
    var email: String?
    var phone: String?
    var whatsapp: String?
    var role: String?
    var areaId: String?
    var cachedAt: Date

    init(from contact: Contact) {
        self.id = contact.id
        self.name = contact.name
        self.email = contact.email
        self.phone = contact.phone
        self.whatsapp = contact.whatsapp
        self.role = contact.role
        self.areaId = contact.areaId
        self.cachedAt = Date()
    }

    func toContact() -> Contact {
        Contact(id: id, name: name, email: email, phone: phone,
                whatsapp: whatsapp, role: role, areaId: areaId, createdAt: nil)
    }
}
