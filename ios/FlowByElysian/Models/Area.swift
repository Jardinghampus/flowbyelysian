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
    let avgPriceSqft: Double?
    let totalTransactions: Int?
}

struct AreasResponse: Codable {
    let areas: [Area]
}

// Static Dubai areas — shown offline and as pickers throughout the app
extension Area {
    static let dubaiAreas: [Area] = [
        Area(id: "palm",      slug: "palm-jumeirah",   name: "Palm Jumeirah",
             description: "Iconic palm-shaped island, ultra-luxury waterfront living.",
             image: nil,
             stats: AreaStats(totalListings: 42, activeAgents: 8, avgPrice: 12_500_000, avgRentYield: 4.2, avgPriceSqft: 2800, totalTransactions: 156)),
        Area(id: "downtown",  slug: "downtown-dubai",  name: "Downtown Dubai",
             description: "Heart of the city — Burj Khalifa, Dubai Mall, and iconic skyline.",
             image: nil,
             stats: AreaStats(totalListings: 38, activeAgents: 6, avgPrice: 4_800_000, avgRentYield: 5.1, avgPriceSqft: 2200, totalTransactions: 210)),
        Area(id: "marina",    slug: "dubai-marina",    name: "Dubai Marina",
             description: "Vibrant waterfront district, world-class dining and nightlife.",
             image: nil,
             stats: AreaStats(totalListings: 55, activeAgents: 9, avgPrice: 2_900_000, avgRentYield: 5.8, avgPriceSqft: 1750, totalTransactions: 320)),
        Area(id: "hills",     slug: "emirates-hills",  name: "Emirates Hills",
             description: "Dubai's most exclusive villa community, golf-course living.",
             image: nil,
             stats: AreaStats(totalListings: 18, activeAgents: 4, avgPrice: 25_000_000, avgRentYield: 3.2, avgPriceSqft: 3200, totalTransactions: 42)),
        Area(id: "ranches",   slug: "arabian-ranches", name: "Arabian Ranches",
             description: "Serene family living, equestrian club, lush green landscape.",
             image: nil,
             stats: AreaStats(totalListings: 29, activeAgents: 5, avgPrice: 5_200_000, avgRentYield: 4.8, avgPriceSqft: 1200, totalTransactions: 180)),
        Area(id: "dhills",    slug: "dubai-hills",     name: "Dubai Hills Estate",
             description: "Master-planned community, central park, championship golf.",
             image: nil,
             stats: AreaStats(totalListings: 47, activeAgents: 7, avgPrice: 6_800_000, avgRentYield: 4.5, avgPriceSqft: 1450, totalTransactions: 220)),
        Area(id: "bay",       slug: "business-bay",    name: "Business Bay",
             description: "Dubai's business hub, canal-front towers, premium offices.",
             image: nil,
             stats: AreaStats(totalListings: 62, activeAgents: 10, avgPrice: 2_100_000, avgRentYield: 6.2, avgPriceSqft: 1600, totalTransactions: 410)),
        Area(id: "jbr",       slug: "jbr",             name: "JBR",
             description: "The Walk, beach living, buzzing retail and entertainment.",
             image: nil,
             stats: AreaStats(totalListings: 31, activeAgents: 5, avgPrice: 3_400_000, avgRentYield: 5.5, avgPriceSqft: 1900, totalTransactions: 195)),
        Area(id: "difc",      slug: "difc",            name: "DIFC",
             description: "Financial district, art galleries, ultra-premium apartments.",
             image: nil,
             stats: AreaStats(totalListings: 22, activeAgents: 4, avgPrice: 6_200_000, avgRentYield: 4.9, avgPriceSqft: 2600, totalTransactions: 98)),
        Area(id: "citywalk",  slug: "city-walk",       name: "City Walk",
             description: "Open-air lifestyle destination, trendy F&B and boutiques.",
             image: nil,
             stats: AreaStats(totalListings: 15, activeAgents: 3, avgPrice: 3_800_000, avgRentYield: 5.0, avgPriceSqft: 2100, totalTransactions: 85)),
    ]
}
