import SwiftData
import Foundation

// MARK: - API Model (matchar Supabase-schemat)

struct Listing: Codable, Identifiable {
    let id: String
    let title: String
    let areaId: String?
    let price: Double?
    let type: String?
    let status: String?
    let bedrooms: Int?
    let bathrooms: Int?
    let sizeSqft: Double?
    let images: [String]?
    let description: String?
    let createdAt: String?

    var priceFormatted: String {
        guard let price else { return "Pris ej angivet" }
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "AED"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: price)) ?? "AED \(Int(price))"
    }

    var firstImage: URL? {
        guard let urlString = images?.first else { return nil }
        return URL(string: urlString)
    }

    var statusColor: String {
        switch status {
        case "live": return "green"
        case "pocket": return "purple"
        case "unofficial": return "orange"
        default: return "gray"
        }
    }
}

struct ListingsResponse: Codable {
    let listings: [Listing]?
    let data: [Listing]?
}

// MARK: - SwiftData Cache Model

@Model
final class CachedListing {
    var id: String
    var title: String
    var areaId: String?
    var price: Double
    var type: String?
    var status: String?
    var bedrooms: Int
    var bathrooms: Int
    var sizeSqft: Double
    var imagesJSON: String?
    var listingDescription: String?
    var cachedAt: Date

    init(from listing: Listing) {
        self.id = listing.id
        self.title = listing.title
        self.areaId = listing.areaId
        self.price = listing.price ?? 0
        self.type = listing.type
        self.status = listing.status
        self.bedrooms = listing.bedrooms ?? 0
        self.bathrooms = listing.bathrooms ?? 0
        self.sizeSqft = listing.sizeSqft ?? 0
        self.imagesJSON = listing.images.flatMap { try? JSONEncoder().encode($0) }.flatMap { String(data: $0, encoding: .utf8) }
        self.listingDescription = listing.description
        self.cachedAt = Date()
    }

    func toListing() -> Listing {
        let images = imagesJSON
            .flatMap { $0.data(using: .utf8) }
            .flatMap { try? JSONDecoder().decode([String].self, from: $0) }
        return Listing(
            id: id, title: title, areaId: areaId, price: price,
            type: type, status: status, bedrooms: bedrooms, bathrooms: bathrooms,
            sizeSqft: sizeSqft, images: images, description: listingDescription, createdAt: nil
        )
    }
}
