/**
 * Inventory Search Logic
 * Deterministic keyword parsing for property search
 */

export interface Property {
  id: string
  title: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  size: number
  type: "villa" | "apartment" | "townhouse" | "penthouse" | "plot" | "office" | "retail"
  transactionType: "sale" | "rent"
  imageUrl?: string
}

export interface SearchQuery {
  location?: string
  bedrooms?: number
  minPrice?: number
  maxPrice?: number
  propertyType?: string
  transactionType?: "sale" | "rent"
}

export interface SearchResult {
  properties: Property[]
  query: SearchQuery
  totalFound: number
}

// Dubai location keywords mapping
const LOCATION_KEYWORDS: Record<string, string[]> = {
  "Palm Jumeirah": ["palm", "palm jumeirah", "jumeirah palm", "the palm"],
  "Dubai Marina": ["marina", "dubai marina", "the marina"],
  "Downtown Dubai": ["downtown", "downtown dubai", "burj khalifa", "dubai mall"],
  "Emirates Hills": ["emirates hills", "emirates", "golf course"],
  "JBR": ["jbr", "jumeirah beach residence", "beach residence", "the walk"],
  "Business Bay": ["business bay", "bay"],
  "DIFC": ["difc", "financial centre", "financial center"],
  "Tilal Al Ghaf": ["tilal", "tilal al ghaf", "al ghaf", "lagoon"],
  "Arabian Ranches": ["arabian ranches", "ranches", "arabian"],
  "Al Furjan": ["al furjan", "furjan"],
}

// Property type keywords
const TYPE_KEYWORDS: Record<string, string[]> = {
  villa: ["villa", "villas", "house", "mansion"],
  apartment: ["apartment", "apartments", "flat", "flats", "apt"],
  townhouse: ["townhouse", "townhome", "town house"],
  penthouse: ["penthouse", "ph"],
  plot: ["plot", "land", "plots"],
}

// Demo inventory data (matches Supabase seed data structure)
const DEMO_INVENTORY: Property[] = [
  {
    id: "1",
    title: "Luxury Beachfront Villa with Private Beach",
    price: 25000000,
    location: "Palm Jumeirah",
    bedrooms: 6,
    bathrooms: 7,
    size: 8500,
    type: "villa",
    transactionType: "sale",
  },
  {
    id: "2",
    title: "Premium 3BR with Burj Khalifa View",
    price: 4500000,
    location: "Downtown Dubai",
    bedrooms: 3,
    bathrooms: 4,
    size: 2200,
    type: "apartment",
    transactionType: "sale",
  },
  {
    id: "3",
    title: "Marina View 2BR Apartment",
    price: 2800000,
    location: "Dubai Marina",
    bedrooms: 2,
    bathrooms: 2,
    size: 1400,
    type: "apartment",
    transactionType: "sale",
  },
  {
    id: "4",
    title: "Modern 4BR Villa with Lagoon Access",
    price: 8500000,
    location: "Tilal Al Ghaf",
    bedrooms: 4,
    bathrooms: 5,
    size: 5500,
    type: "villa",
    transactionType: "sale",
  },
  {
    id: "5",
    title: "Executive Penthouse with Panoramic Views",
    price: 15000000,
    location: "Emirates Hills",
    bedrooms: 5,
    bathrooms: 6,
    size: 6500,
    type: "penthouse",
    transactionType: "sale",
  },
  {
    id: "6",
    title: "Beachfront 3BR in JBR",
    price: 180000,
    location: "JBR",
    bedrooms: 3,
    bathrooms: 3,
    size: 1800,
    type: "apartment",
    transactionType: "rent",
  },
  {
    id: "7",
    title: "Furnished 2BR Marina Apartment",
    price: 120000,
    location: "Dubai Marina",
    bedrooms: 2,
    bathrooms: 2,
    size: 1200,
    type: "apartment",
    transactionType: "rent",
  },
  {
    id: "8",
    title: "Family Villa in Arabian Ranches",
    price: 6200000,
    location: "Arabian Ranches",
    bedrooms: 5,
    bathrooms: 5,
    size: 4800,
    type: "villa",
    transactionType: "sale",
  },
  {
    id: "9",
    title: "Downtown 1BR with Fountain View",
    price: 2100000,
    location: "Downtown Dubai",
    bedrooms: 1,
    bathrooms: 1,
    size: 850,
    type: "apartment",
    transactionType: "sale",
  },
  {
    id: "10",
    title: "Spacious 4BR Townhouse",
    price: 3500000,
    location: "Al Furjan",
    bedrooms: 4,
    bathrooms: 4,
    size: 3200,
    type: "townhouse",
    transactionType: "sale",
  },
]

/**
 * Parse user message to extract search parameters
 */
export function parseSearchQuery(message: string): SearchQuery {
  const query: SearchQuery = {}
  const lowerMessage = message.toLowerCase()

  // Extract location
  for (const [location, keywords] of Object.entries(LOCATION_KEYWORDS)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      query.location = location
      break
    }
  }

  // Extract bedroom count
  const bedroomMatch = lowerMessage.match(/(\d+)\s*(?:bed|br|bedroom|sovrum|rum)/i)
  if (bedroomMatch) {
    query.bedrooms = parseInt(bedroomMatch[1], 10)
  }

  // Extract property type
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
      query.propertyType = type
      break
    }
  }

  // Extract price range
  const priceMatch = lowerMessage.match(
    /(?:under|below|max|maximum|upp till|max)\s*(?:aed|dhs?)?\s*(\d[\d,\.]*)\s*(?:m|million|miljoner)?/i
  )
  if (priceMatch) {
    let price = parseFloat(priceMatch[1].replace(/[,]/g, ""))
    if (lowerMessage.includes("million") || lowerMessage.includes("m") || lowerMessage.includes("miljoner")) {
      price *= 1000000
    }
    query.maxPrice = price
  }

  const minPriceMatch = lowerMessage.match(
    /(?:above|over|min|minimum|minst|över)\s*(?:aed|dhs?)?\s*(\d[\d,\.]*)\s*(?:m|million|miljoner)?/i
  )
  if (minPriceMatch) {
    let price = parseFloat(minPriceMatch[1].replace(/[,]/g, ""))
    if (lowerMessage.includes("million") || lowerMessage.includes("m") || lowerMessage.includes("miljoner")) {
      price *= 1000000
    }
    query.minPrice = price
  }

  // Detect rent vs sale
  if (lowerMessage.includes("rent") || lowerMessage.includes("hyra") || lowerMessage.includes("lease")) {
    query.transactionType = "rent"
  } else if (lowerMessage.includes("buy") || lowerMessage.includes("köpa") || lowerMessage.includes("purchase") || lowerMessage.includes("sale")) {
    query.transactionType = "sale"
  }

  return query
}

/**
 * Search inventory based on parsed query
 */
export function searchInventory(query: SearchQuery, maxResults: number = 3): SearchResult {
  let results = [...DEMO_INVENTORY]

  // Filter by location
  if (query.location) {
    results = results.filter(
      (p) => p.location.toLowerCase() === query.location!.toLowerCase()
    )
  }

  // Filter by bedrooms
  if (query.bedrooms) {
    results = results.filter((p) => p.bedrooms === query.bedrooms)
  }

  // Filter by property type
  if (query.propertyType) {
    results = results.filter((p) => p.type === query.propertyType)
  }

  // Filter by price range
  if (query.minPrice) {
    results = results.filter((p) => p.price >= query.minPrice!)
  }
  if (query.maxPrice) {
    results = results.filter((p) => p.price <= query.maxPrice!)
  }

  // Filter by transaction type
  if (query.transactionType) {
    results = results.filter((p) => p.transactionType === query.transactionType)
  }

  const totalFound = results.length

  // Sort by price (ascending) and limit results
  results.sort((a, b) => a.price - b.price)
  results = results.slice(0, maxResults)

  return {
    properties: results,
    query,
    totalFound,
  }
}

/**
 * Format property for display in chat
 */
export function formatProperty(property: Property): string {
  const priceFormatted =
    property.transactionType === "rent"
      ? `AED ${property.price.toLocaleString()}/year`
      : `AED ${(property.price / 1000000).toFixed(1)}M`

  return `${property.title}\n${priceFormatted} | ${property.location} | ${property.bedrooms}BR`
}

/**
 * Format search results for chat response
 */
export function formatSearchResults(result: SearchResult): string {
  if (result.properties.length === 0) {
    return "I couldn't find any properties matching your criteria. Would you like to adjust your search?"
  }

  const header =
    result.totalFound > result.properties.length
      ? `I found ${result.totalFound} properties. Here are the top ${result.properties.length}:`
      : `I found ${result.properties.length} properties that match your criteria:`

  const listings = result.properties.map((p, i) => `${i + 1}. ${formatProperty(p)}`).join("\n\n")

  return `${header}\n\n${listings}`
}

/**
 * Check if message contains property search intent
 */
export function hasSearchIntent(message: string): boolean {
  const searchKeywords = [
    "looking for",
    "search",
    "find",
    "want",
    "need",
    "interested",
    "letar",
    "söker",
    "vill ha",
    "property",
    "properties",
    "villa",
    "apartment",
    "flat",
    "house",
    "bedroom",
    "br",
    ...Object.values(LOCATION_KEYWORDS).flat(),
  ]

  const lowerMessage = message.toLowerCase()
  return searchKeywords.some((keyword) => lowerMessage.includes(keyword))
}
