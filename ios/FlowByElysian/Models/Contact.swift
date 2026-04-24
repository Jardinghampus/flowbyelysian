import SwiftData
import Foundation

struct Contact: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let email: String?
    let phone: String?
    let whatsapp: String?
    let role: String?
    let areaId: String?
    let areas: AreaRef?
    let createdAt: String?

    var initials: String {
        name.split(separator: " ")
            .compactMap { $0.first.map(String.init) }
            .prefix(2).joined().uppercased()
    }

    var areaName: String? { areas?.name ?? areaId }
}

struct ContactsResponse: Codable {
    let contacts: [Contact]?
    let data: [Contact]?
}

struct NewContactPayload: Encodable {
    let name: String
    let email: String?
    let phone: String?
    let whatsapp: String?
    let role: String?
    let areaId: String?
}

struct SingleContactResponse: Codable {
    let contact: Contact
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

    init(from c: Contact) {
        id       = c.id
        name     = c.name
        email    = c.email
        phone    = c.phone
        whatsapp = c.whatsapp
        role     = c.role
        areaId   = c.areaId
        cachedAt = .now
    }

    func toContact() -> Contact {
        Contact(id: id, name: name, email: email, phone: phone,
                whatsapp: whatsapp, role: role, areaId: areaId,
                areas: nil, createdAt: nil)
    }
}
