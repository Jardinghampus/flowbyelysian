import SwiftData
import Foundation

// Matches the actual Supabase schema returned by /api/listings
struct Listing: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let areaName: String?       // area_name in DB (not area_id)
    let price: Double?
    let type: String?           // villa/apartment/townhouse/penthouse/plot/office/retail
    let status: String?         // live/pocket/unofficial
    let inquiryType: String?    // stock/request/viewing
    let transactionType: String? // sale/rent
    let bedrooms: Int?
    let bathrooms: Int?
    let size: Double?           // sqft – field is "size" not "size_sqft"
    let images: [String]?
    let notes: String?          // "notes" not "description"
    let availability: String?
    let propertyFinderUrl: String?
    let ownerName: String?
    let createdAt: String?

    var priceFormatted: String {
        guard let price else { return "Price not set" }
        return price.formatted(.currency(code: "AED").precision(.fractionLength(0)))
    }

    var firstImage: URL? {
        images?.first.flatMap { URL(string: $0) }
    }

    var isForRent: Bool { transactionType == "rent" }
}

struct ListingsResponse: Codable {
    let listings: [Listing]?
    let data: [Listing]?
    let total: Int?
}

// Payload sent to POST /api/listings
struct NewListingPayload: Encodable {
    let title: String
    let areaName: String
    let price: Int
    let type: String
    let status: String
    let inquiryType: String
    let transactionType: String
    let bedrooms: Int?
    let bathrooms: Int?
    let size: Int?
    let notes: String?
    let availability: String?
}

struct SingleListingResponse: Codable {
    let listing: Listing
}

// MARK: - SwiftData cache

@Model
final class CachedListing {
    var id: String
    var title: String
    var areaName: String?
    var price: Double
    var type: String?
    var status: String?
    var transactionType: String?
    var bedrooms: Int
    var bathrooms: Int
    var size: Double
    var imagesJSON: String?
    var notes: String?
    var cachedAt: Date

    init(from l: Listing) {
        id            = l.id
        title         = l.title
        areaName      = l.areaName
        price         = l.price ?? 0
        type          = l.type
        status        = l.status
        transactionType = l.transactionType
        bedrooms      = l.bedrooms ?? 0
        bathrooms     = l.bathrooms ?? 0
        size          = l.size ?? 0
        imagesJSON    = l.images.flatMap { try? JSONEncoder().encode($0) }
                               .flatMap { String(data: $0, encoding: .utf8) }
        notes         = l.notes
        cachedAt      = .now
    }

    func toListing() -> Listing {
        let imgs = imagesJSON
            .flatMap { $0.data(using: .utf8) }
            .flatMap { try? JSONDecoder().decode([String].self, from: $0) }
        return Listing(
            id: id, title: title, areaName: areaName, price: price,
            type: type, status: status, inquiryType: nil, transactionType: transactionType,
            bedrooms: bedrooms, bathrooms: bathrooms, size: size,
            images: imgs, notes: notes, availability: nil,
            propertyFinderUrl: nil, ownerName: nil, createdAt: nil
        )
    }
}
