import Foundation

struct Area: Codable, Identifiable, Hashable {
    let id: String
    let slug: String
    let name: String
    let description: String?
    let image: String?
    let stats: AreaStats?
}

struct AreaStats: Codable, Hashable {
    let totalListings: Int?
    let activeAgents: Int?
    let avgPrice: Double?
    let avgRentYield: Double?
}

struct AreasResponse: Codable {
    let areas: [Area]
}

// Static Dubai areas used as fallback when offline
extension Area {
    static let dubaiAreas: [Area] = [
        Area(id: "palm",      slug: "palm-jumeirah",   name: "Palm Jumeirah",       description: nil, image: nil, stats: nil),
        Area(id: "downtown",  slug: "downtown-dubai",  name: "Downtown Dubai",      description: nil, image: nil, stats: nil),
        Area(id: "marina",    slug: "dubai-marina",    name: "Dubai Marina",        description: nil, image: nil, stats: nil),
        Area(id: "hills",     slug: "emirates-hills",  name: "Emirates Hills",      description: nil, image: nil, stats: nil),
        Area(id: "ranches",   slug: "arabian-ranches", name: "Arabian Ranches",     description: nil, image: nil, stats: nil),
        Area(id: "dhills",    slug: "dubai-hills",     name: "Dubai Hills Estate",  description: nil, image: nil, stats: nil),
        Area(id: "bay",       slug: "business-bay",    name: "Business Bay",        description: nil, image: nil, stats: nil),
        Area(id: "jbr",       slug: "jbr",             name: "JBR",                 description: nil, image: nil, stats: nil),
        Area(id: "difc",      slug: "difc",            name: "DIFC",                description: nil, image: nil, stats: nil),
        Area(id: "citywalk",  slug: "city-walk",       name: "City Walk",           description: nil, image: nil, stats: nil),
    ]
}
