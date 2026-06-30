// Villa Communities Data - SEO-optimized area data for public landing pages
// All market data reflects Dubai villa market trends as of Q1 2025

export interface CommunityHighlight {
  title: string
  description: string
  icon: "golf" | "lagoon" | "beach" | "park" | "school" | "metro" | "mall" | "gym" | "pool" | "security"
}

export interface CommunityListing {
  id: string
  title: string
  type: "villa" | "townhouse"
  subType?: string // e.g. "Harmony", "Elan", "Signature"
  bedrooms: number
  bathrooms: number
  size: number // sqft
  price: number
  pricePerSqft: number
  image: string
  transactionType: "sale" | "rent"
  features: string[]
  isNew?: boolean
}

export interface PriceRange {
  type: string
  bedrooms: string
  minPrice: number
  maxPrice: number
  avgPrice: number
}

export interface CommunityMarketData {
  avgPriceSqft: number
  avgPriceSqftChange: number // YoY %
  avgPriceSqftQ: number // QoQ %
  totalTransactionsYTD: number
  transactionsChange: number // YoY %
  avgDaysOnMarket: number
  avgRentYield: number
  priceHistory: { month: string; avgPrice: number; transactions: number }[]
  priceRanges: PriceRange[]
  propertyTypeBreakdown: { type: string; percentage: number; avgPrice: number }[]
  bedroomBreakdown: { bedrooms: string; percentage: number; avgPrice: number }[]
  rentalYields: { type: string; yield: number }[]
}

export interface VillaCommunity {
  id: string
  slug: string
  name: string
  developer: string
  location: string
  established: string
  tagline: string
  description: string
  seoTitle: string
  seoDescription: string
  heroImage: string
  galleryImages: string[]
  stats: {
    totalUnits: number
    completedUnits: number
    avgPrice: number
    priceFrom: number
    priceTo: number
    avgSize: number // sqft
    communitySize: string // e.g. "30 million sqft"
  }
  highlights: CommunityHighlight[]
  marketData: CommunityMarketData
  listings: CommunityListing[]
  nearbyAmenities: string[]
  subCommunities: string[]
}

export const villaCommunities: VillaCommunity[] = [
  // ===================== DAMAC HILLS =====================
  {
    id: "damac-hills",
    slug: "damac-hills",
    name: "DAMAC Hills",
    developer: "DAMAC Properties",
    location: "Dubailand, Dubai",
    established: "2014",
    tagline: "Golf Course Living at Its Finest",
    description: "DAMAC Hills is a sprawling master-planned community built around the Trump International Golf Club Dubai. With an 18-hole championship golf course as its centerpiece, the community offers luxury villas, townhouses, and apartments set amid lush green landscapes. The community features the Trump Clubhouse, a world-class leisure destination with fine dining, spa facilities, and an infinity pool. Residents enjoy a resort-style lifestyle with parks, cycling tracks, swimming pools, and retail outlets. DAMAC Hills has become one of Dubai's most sought-after villa communities, offering competitive pricing with premium amenities.",
    seoTitle: "DAMAC Hills Villas & Townhouses for Sale | Dubai Villa Community",
    seoDescription: "Explore DAMAC Hills - luxury villas and townhouses around Trump International Golf Club. From AED 1.8M. Golf course living with world-class amenities in Dubai.",
    heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
    ],
    stats: {
      totalUnits: 6000,
      completedUnits: 4800,
      avgPrice: 3800000,
      priceFrom: 1800000,
      priceTo: 25000000,
      avgSize: 3200,
      communitySize: "42 million sqft",
    },
    highlights: [
      { title: "Trump International Golf Club", description: "18-hole championship course with clubhouse, spa, and fine dining", icon: "golf" },
      { title: "Parks & Green Spaces", description: "Over 200,000 sqft of landscaped parks, jogging tracks, and cycling paths", icon: "park" },
      { title: "Swimming Pools & Gym", description: "Multiple community pools, fully equipped gyms, and sports courts", icon: "pool" },
      { title: "Retail & Dining", description: "DAMAC Hills Mall with supermarkets, restaurants, and cafes", icon: "mall" },
      { title: "Schools Nearby", description: "GEMS Metropole School, Jebel Ali School, and multiple nurseries", icon: "school" },
      { title: "24/7 Security", description: "Gated community with round-the-clock security and CCTV surveillance", icon: "security" },
    ],
    marketData: {
      avgPriceSqft: 1180,
      avgPriceSqftChange: 14.2,
      avgPriceSqftQ: 3.8,
      totalTransactionsYTD: 1842,
      transactionsChange: 22,
      avgDaysOnMarket: 38,
      avgRentYield: 6.4,
      priceHistory: [
        { month: "Sep 2024", avgPrice: 1020, transactions: 285 },
        { month: "Oct 2024", avgPrice: 1045, transactions: 312 },
        { month: "Nov 2024", avgPrice: 1068, transactions: 298 },
        { month: "Dec 2024", avgPrice: 1095, transactions: 275 },
        { month: "Jan 2025", avgPrice: 1140, transactions: 340 },
        { month: "Feb 2025", avgPrice: 1180, transactions: 332 },
      ],
      priceRanges: [
        { type: "Townhouse", bedrooms: "3 BR", minPrice: 1800000, maxPrice: 2800000, avgPrice: 2200000 },
        { type: "Townhouse", bedrooms: "4 BR", minPrice: 2500000, maxPrice: 4000000, avgPrice: 3100000 },
        { type: "Villa", bedrooms: "4 BR", minPrice: 3200000, maxPrice: 5500000, avgPrice: 4100000 },
        { type: "Villa", bedrooms: "5 BR", minPrice: 4500000, maxPrice: 8000000, avgPrice: 5800000 },
        { type: "Villa", bedrooms: "6 BR", minPrice: 7000000, maxPrice: 25000000, avgPrice: 12000000 },
      ],
      propertyTypeBreakdown: [
        { type: "Villa", percentage: 45, avgPrice: 5200000 },
        { type: "Townhouse", percentage: 35, avgPrice: 2600000 },
        { type: "Apartment", percentage: 20, avgPrice: 1200000 },
      ],
      bedroomBreakdown: [
        { bedrooms: "3 BR", percentage: 30, avgPrice: 2400000 },
        { bedrooms: "4 BR", percentage: 35, avgPrice: 3800000 },
        { bedrooms: "5 BR", percentage: 25, avgPrice: 5800000 },
        { bedrooms: "6+ BR", percentage: 10, avgPrice: 12000000 },
      ],
      rentalYields: [
        { type: "3 BR Townhouse", yield: 7.1 },
        { type: "4 BR Villa", yield: 6.4 },
        { type: "5 BR Villa", yield: 5.8 },
        { type: "6 BR Villa", yield: 4.9 },
      ],
    },
    listings: [
      {
        id: "dh-1",
        title: "Golf Course View Villa - Fully Upgraded",
        type: "villa",
        subType: "V3",
        bedrooms: 5,
        bathrooms: 6,
        size: 5200,
        price: 6500000,
        pricePerSqft: 1250,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Golf course view", "Private pool", "Upgraded kitchen", "Landscaped garden"],
      },
      {
        id: "dh-2",
        title: "Brand New Townhouse - Park Facing",
        type: "townhouse",
        subType: "Pelham",
        bedrooms: 3,
        bathrooms: 4,
        size: 2100,
        price: 2200000,
        pricePerSqft: 1048,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Park facing", "Brand new", "Maid's room", "Open kitchen"],
        isNew: true,
      },
      {
        id: "dh-3",
        title: "Luxurious 4BR Villa - Corner Plot",
        type: "villa",
        subType: "Loreto",
        bedrooms: 4,
        bathrooms: 5,
        size: 3800,
        price: 4200000,
        pricePerSqft: 1105,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Corner plot", "Extra garden", "Premium finish", "Smart home"],
      },
      {
        id: "dh-4",
        title: "Furnished 4BR Villa - Yearly Rent",
        type: "villa",
        subType: "Whitefield",
        bedrooms: 4,
        bathrooms: 5,
        size: 3400,
        price: 220000,
        pricePerSqft: 65,
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
        transactionType: "rent",
        features: ["Fully furnished", "Private pool", "Near clubhouse", "Maintained garden"],
      },
    ],
    nearbyAmenities: [
      "Trump International Golf Club",
      "DAMAC Hills Mall",
      "GEMS Metropole School",
      "Dubai Autodrome",
      "IMG Worlds of Adventure",
      "Dubai Sports City",
      "Global Village",
      "Motor City",
    ],
    subCommunities: [
      "Loreto",
      "Pelham",
      "Whitefield",
      "Brookfield",
      "Carson",
      "Maple",
      "Golf Terrace",
      "Trump Estates",
      "Akoya Oxygen",
    ],
  },

  // ===================== TILAL AL GHAF =====================
  {
    id: "tilal-al-ghaf",
    slug: "tilal-al-ghaf",
    name: "Tilal Al Ghaf",
    developer: "Majid Al Futtaim",
    location: "Dubailand, Dubai",
    established: "2018",
    tagline: "Lagoon Living in the Heart of Dubai",
    description: "Tilal Al Ghaf by Majid Al Futtaim is one of Dubai's most anticipated master-planned communities, centered around a pristine lagoon with white sand beaches. Spanning over 30 million sqft, the community features an array of villa clusters including Harmony, Aura, Serenity, and Elan — each with a distinct architectural character. The heart of the community is Hessa Street, a vibrant retail and dining destination. With a commitment to sustainability, Tilal Al Ghaf incorporates green building principles, solar panels, and extensive green spaces. The community offers 18km of cycling tracks, sports courts, farm-to-table restaurants, and a forest-inspired parkland called Al Ghaf Park.",
    seoTitle: "Tilal Al Ghaf Villas for Sale | Lagoon Community by Majid Al Futtaim",
    seoDescription: "Discover Tilal Al Ghaf - premium lagoon-front villas and townhouses by Majid Al Futtaim. From AED 3.5M. Crystal lagoon, parks, and sustainable living in Dubai.",
    heroImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2670&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
    ],
    stats: {
      totalUnits: 6500,
      completedUnits: 3200,
      avgPrice: 8500000,
      priceFrom: 3500000,
      priceTo: 50000000,
      avgSize: 5200,
      communitySize: "30 million sqft",
    },
    highlights: [
      { title: "Crystal Lagoon", description: "Pristine swimmable lagoon with white sand beach and water sports", icon: "lagoon" },
      { title: "Al Ghaf Park", description: "Forest-inspired parkland with jogging trails, picnic areas, and playgrounds", icon: "park" },
      { title: "Hessa Street", description: "Vibrant retail and dining destination with boutiques and farm-to-table restaurants", icon: "mall" },
      { title: "Sports & Fitness", description: "18km cycling tracks, tennis courts, padel courts, and community gym", icon: "gym" },
      { title: "Top Schools", description: "Proximity to Sunmarke School, Hartland International, and GEMS schools", icon: "school" },
      { title: "Sustainable Living", description: "Solar panels, green building principles, and EV charging stations", icon: "park" },
    ],
    marketData: {
      avgPriceSqft: 1850,
      avgPriceSqftChange: 18.5,
      avgPriceSqftQ: 5.2,
      totalTransactionsYTD: 892,
      transactionsChange: 35,
      avgDaysOnMarket: 28,
      avgRentYield: 5.2,
      priceHistory: [
        { month: "Sep 2024", avgPrice: 1520, transactions: 128 },
        { month: "Oct 2024", avgPrice: 1580, transactions: 145 },
        { month: "Nov 2024", avgPrice: 1650, transactions: 152 },
        { month: "Dec 2024", avgPrice: 1720, transactions: 138 },
        { month: "Jan 2025", avgPrice: 1790, transactions: 168 },
        { month: "Feb 2025", avgPrice: 1850, transactions: 161 },
      ],
      priceRanges: [
        { type: "Townhouse", bedrooms: "3 BR", minPrice: 3500000, maxPrice: 5000000, avgPrice: 4200000 },
        { type: "Townhouse", bedrooms: "4 BR", minPrice: 4500000, maxPrice: 6500000, avgPrice: 5400000 },
        { type: "Villa", bedrooms: "4 BR", minPrice: 6000000, maxPrice: 9000000, avgPrice: 7200000 },
        { type: "Villa", bedrooms: "5 BR", minPrice: 8000000, maxPrice: 15000000, avgPrice: 10500000 },
        { type: "Villa", bedrooms: "6+ BR", minPrice: 15000000, maxPrice: 50000000, avgPrice: 25000000 },
      ],
      propertyTypeBreakdown: [
        { type: "Villa", percentage: 65, avgPrice: 10500000 },
        { type: "Townhouse", percentage: 30, avgPrice: 4800000 },
        { type: "Mansion", percentage: 5, avgPrice: 30000000 },
      ],
      bedroomBreakdown: [
        { bedrooms: "3 BR", percentage: 20, avgPrice: 4200000 },
        { bedrooms: "4 BR", percentage: 35, avgPrice: 6500000 },
        { bedrooms: "5 BR", percentage: 30, avgPrice: 10500000 },
        { bedrooms: "6+ BR", percentage: 15, avgPrice: 25000000 },
      ],
      rentalYields: [
        { type: "3 BR Townhouse", yield: 5.8 },
        { type: "4 BR Villa", yield: 5.2 },
        { type: "5 BR Villa", yield: 4.8 },
        { type: "6+ BR Villa", yield: 4.2 },
      ],
    },
    listings: [
      {
        id: "tag-1",
        title: "Harmony 3 Villa - Lagoon View",
        type: "villa",
        subType: "Harmony",
        bedrooms: 5,
        bathrooms: 6,
        size: 5200,
        price: 9500000,
        pricePerSqft: 1827,
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2670&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Lagoon view", "Private pool", "Smart home", "Premium landscaping"],
      },
      {
        id: "tag-2",
        title: "Aura Garden Villa - Brand New",
        type: "villa",
        subType: "Aura",
        bedrooms: 6,
        bathrooms: 7,
        size: 6800,
        price: 14000000,
        pricePerSqft: 2059,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Brand new", "Direct lagoon access", "Private beach", "Rooftop terrace"],
        isNew: true,
      },
      {
        id: "tag-3",
        title: "Elan Townhouse - Corner Unit",
        type: "townhouse",
        subType: "Elan",
        bedrooms: 4,
        bathrooms: 4,
        size: 3100,
        price: 5200000,
        pricePerSqft: 1677,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Corner unit", "Park view", "Extended plot", "Upgraded kitchen"],
      },
      {
        id: "tag-4",
        title: "Serenity Mansion - Ultra Luxury",
        type: "villa",
        subType: "Serenity",
        bedrooms: 7,
        bathrooms: 9,
        size: 12000,
        price: 35000000,
        pricePerSqft: 2917,
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Lagoon frontage", "Infinity pool", "Home cinema", "Staff quarters"],
      },
    ],
    nearbyAmenities: [
      "Crystal Lagoon & Beach",
      "Al Ghaf Park",
      "Hessa Street Retail",
      "Sunmarke School",
      "Hartland International School",
      "City Centre Me'aisem",
      "Dubai Sports City",
      "Arabian Ranches Golf Club",
    ],
    subCommunities: [
      "Harmony",
      "Aura",
      "Serenity",
      "Elan",
      "The Parkway",
      "Sur La Mer",
      "The Estates",
    ],
  },

  // ===================== AL FURJAN =====================
  {
    id: "al-furjan",
    slug: "al-furjan",
    name: "Al Furjan",
    developer: "Nakheel",
    location: "Jebel Ali, Dubai",
    established: "2007",
    tagline: "Family Living with Metro Connectivity",
    description: "Al Furjan is a well-established, family-friendly community developed by Nakheel, strategically located near Ibn Battuta Mall and connected to the Dubai Metro. The community offers a mix of independent villas, townhouses, and apartments spread across a well-planned neighborhood. Al Furjan features its own retail pavilion with cafes, supermarkets, and restaurants, plus a dedicated community center with swimming pools, gyms, and children's play areas. Its proximity to Al Maktoum International Airport, Expo City, and major highways makes it popular with both families and investors. The community is known for its affordable yet quality villa living, making it one of Dubai's best-value villa communities.",
    seoTitle: "Al Furjan Villas & Townhouses for Sale | Family Community Near Metro",
    seoDescription: "Find Al Furjan villas and townhouses from AED 1.6M. Family-friendly community by Nakheel near metro and Ibn Battuta Mall. Great ROI at 6.8% average yield.",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
    ],
    stats: {
      totalUnits: 4200,
      completedUnits: 4000,
      avgPrice: 3200000,
      priceFrom: 1600000,
      priceTo: 8000000,
      avgSize: 2800,
      communitySize: "560 acres",
    },
    highlights: [
      { title: "Metro Access", description: "Direct access to Route 2020 Metro - Al Furjan Station within the community", icon: "metro" },
      { title: "Ibn Battuta Mall", description: "5 minutes to one of Dubai's largest themed shopping malls", icon: "mall" },
      { title: "Community Pavilion", description: "Dedicated retail strip with cafes, restaurants, and daily essentials", icon: "mall" },
      { title: "Parks & Playgrounds", description: "Multiple parks, jogging tracks, and children's play areas throughout", icon: "park" },
      { title: "Top-Rated Schools", description: "Arbor School, JSS International, and GEMS schools nearby", icon: "school" },
      { title: "Sports Facilities", description: "Community pool, gym, tennis courts, and basketball courts", icon: "gym" },
    ],
    marketData: {
      avgPriceSqft: 1100,
      avgPriceSqftChange: 12.5,
      avgPriceSqftQ: 3.2,
      totalTransactionsYTD: 1456,
      transactionsChange: 18,
      avgDaysOnMarket: 32,
      avgRentYield: 6.8,
      priceHistory: [
        { month: "Sep 2024", avgPrice: 940, transactions: 210 },
        { month: "Oct 2024", avgPrice: 968, transactions: 235 },
        { month: "Nov 2024", avgPrice: 1000, transactions: 248 },
        { month: "Dec 2024", avgPrice: 1035, transactions: 225 },
        { month: "Jan 2025", avgPrice: 1070, transactions: 268 },
        { month: "Feb 2025", avgPrice: 1100, transactions: 270 },
      ],
      priceRanges: [
        { type: "Townhouse", bedrooms: "3 BR", minPrice: 1600000, maxPrice: 2500000, avgPrice: 2000000 },
        { type: "Townhouse", bedrooms: "4 BR", minPrice: 2200000, maxPrice: 3500000, avgPrice: 2800000 },
        { type: "Villa", bedrooms: "4 BR", minPrice: 2800000, maxPrice: 4200000, avgPrice: 3400000 },
        { type: "Villa", bedrooms: "5 BR", minPrice: 3800000, maxPrice: 6000000, avgPrice: 4600000 },
        { type: "Villa", bedrooms: "6 BR", minPrice: 5000000, maxPrice: 8000000, avgPrice: 6200000 },
      ],
      propertyTypeBreakdown: [
        { type: "Villa", percentage: 40, avgPrice: 4000000 },
        { type: "Townhouse", percentage: 45, avgPrice: 2400000 },
        { type: "Apartment", percentage: 15, avgPrice: 1100000 },
      ],
      bedroomBreakdown: [
        { bedrooms: "3 BR", percentage: 35, avgPrice: 2000000 },
        { bedrooms: "4 BR", percentage: 35, avgPrice: 3100000 },
        { bedrooms: "5 BR", percentage: 25, avgPrice: 4600000 },
        { bedrooms: "6 BR", percentage: 5, avgPrice: 6200000 },
      ],
      rentalYields: [
        { type: "3 BR Townhouse", yield: 7.5 },
        { type: "4 BR Townhouse", yield: 7.0 },
        { type: "4 BR Villa", yield: 6.6 },
        { type: "5 BR Villa", yield: 6.2 },
      ],
    },
    listings: [
      {
        id: "af-1",
        title: "Quortaj Villa - Upgraded & Extended",
        type: "villa",
        subType: "Quortaj",
        bedrooms: 5,
        bathrooms: 5,
        size: 3600,
        price: 4200000,
        pricePerSqft: 1167,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Extended plot", "Private pool", "Upgraded kitchen", "Near metro"],
      },
      {
        id: "af-2",
        title: "Modern Townhouse - Near Pavilion",
        type: "townhouse",
        subType: "Phase 2",
        bedrooms: 3,
        bathrooms: 4,
        size: 2100,
        price: 1950000,
        pricePerSqft: 929,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Near pavilion", "Open plan", "Maid's room", "Storage room"],
      },
      {
        id: "af-3",
        title: "Family Villa - Corner Unit",
        type: "villa",
        subType: "Quortaj",
        bedrooms: 4,
        bathrooms: 5,
        size: 3200,
        price: 3400000,
        pricePerSqft: 1063,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Corner plot", "Extra garden", "Renovated bathrooms", "Parking for 2"],
      },
      {
        id: "af-4",
        title: "Spacious 4BR Villa for Rent",
        type: "villa",
        bedrooms: 4,
        bathrooms: 5,
        size: 3100,
        price: 180000,
        pricePerSqft: 58,
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
        transactionType: "rent",
        features: ["Well maintained", "Landscaped garden", "Near school", "Community view"],
      },
    ],
    nearbyAmenities: [
      "Al Furjan Metro Station",
      "Ibn Battuta Mall",
      "Al Furjan Pavilion",
      "Expo City Dubai",
      "Dubai Parks & Resorts",
      "Arbor School",
      "Al Maktoum Airport",
      "Discovery Gardens",
    ],
    subCommunities: [
      "Quortaj Villas",
      "Phase 1",
      "Phase 2",
      "Masakin Al Furjan",
      "The Dreamz",
      "Azizi Riviera",
    ],
  },

  // ===================== JUMEIRAH GOLF ESTATES =====================
  {
    id: "jumeirah-golf-estates",
    slug: "jumeirah-golf-estates",
    name: "Jumeirah Golf Estates",
    developer: "Dubai Properties Group / Leisurecorp",
    location: "Jebel Ali, Dubai",
    established: "2008",
    tagline: "World-Class Golf, Exceptional Living",
    description: "Jumeirah Golf Estates (JGE) is a premium residential community featuring two championship golf courses — Earth and Fire — designed by Greg Norman. The community is home to the DP World Tour Championship, the final event of the European Tour's Race to Dubai, making it one of the most prestigious golfing addresses in the world. JGE offers a curated selection of luxury villas, townhouses, and apartments across distinct sub-communities including Lime Tree Valley, Orange Lake, Wildflower, Whispering Pines, and Sanctuary Falls. The community is known for its tranquil, resort-style environment with extensive landscaping, a world-class clubhouse, and proximity to major attractions.",
    seoTitle: "Jumeirah Golf Estates Villas for Sale | JGE Golf Community Dubai",
    seoDescription: "Luxury villas at Jumeirah Golf Estates from AED 4M. Home of DP World Tour Championship. Two Greg Norman courses, premium clubhouse, and resort-style living.",
    heroImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
    ],
    stats: {
      totalUnits: 1600,
      completedUnits: 1400,
      avgPrice: 7500000,
      priceFrom: 4000000,
      priceTo: 40000000,
      avgSize: 5800,
      communitySize: "1119 acres",
    },
    highlights: [
      { title: "Two Championship Courses", description: "Earth & Fire courses by Greg Norman — home of DP World Tour Championship", icon: "golf" },
      { title: "Premium Clubhouse", description: "World-class clubhouse with fine dining, pro shop, and members' lounge", icon: "gym" },
      { title: "Swimming & Fitness", description: "Olympic-size pool, spa, fully equipped gym, and personal training", icon: "pool" },
      { title: "Landscaped Community", description: "Extensively landscaped with mature trees, lakes, and walking trails", icon: "park" },
      { title: "School & Nursery", description: "GEMS Wellington Primary School within the community", icon: "school" },
      { title: "Gated & Secure", description: "24/7 security with controlled access, patrol, and CCTV coverage", icon: "security" },
    ],
    marketData: {
      avgPriceSqft: 1350,
      avgPriceSqftChange: 16.8,
      avgPriceSqftQ: 4.5,
      totalTransactionsYTD: 456,
      transactionsChange: 28,
      avgDaysOnMarket: 42,
      avgRentYield: 5.5,
      priceHistory: [
        { month: "Sep 2024", avgPrice: 1120, transactions: 65 },
        { month: "Oct 2024", avgPrice: 1160, transactions: 72 },
        { month: "Nov 2024", avgPrice: 1200, transactions: 78 },
        { month: "Dec 2024", avgPrice: 1250, transactions: 68 },
        { month: "Jan 2025", avgPrice: 1300, transactions: 88 },
        { month: "Feb 2025", avgPrice: 1350, transactions: 85 },
      ],
      priceRanges: [
        { type: "Townhouse", bedrooms: "3 BR", minPrice: 4000000, maxPrice: 5500000, avgPrice: 4600000 },
        { type: "Villa", bedrooms: "4 BR", minPrice: 5500000, maxPrice: 8000000, avgPrice: 6500000 },
        { type: "Villa", bedrooms: "5 BR", minPrice: 7000000, maxPrice: 12000000, avgPrice: 8800000 },
        { type: "Villa", bedrooms: "6 BR", minPrice: 10000000, maxPrice: 20000000, avgPrice: 14000000 },
        { type: "Villa", bedrooms: "7+ BR", minPrice: 18000000, maxPrice: 40000000, avgPrice: 28000000 },
      ],
      propertyTypeBreakdown: [
        { type: "Villa", percentage: 70, avgPrice: 9500000 },
        { type: "Townhouse", percentage: 20, avgPrice: 4800000 },
        { type: "Apartment", percentage: 10, avgPrice: 2200000 },
      ],
      bedroomBreakdown: [
        { bedrooms: "3 BR", percentage: 15, avgPrice: 4600000 },
        { bedrooms: "4 BR", percentage: 30, avgPrice: 6500000 },
        { bedrooms: "5 BR", percentage: 30, avgPrice: 8800000 },
        { bedrooms: "6+ BR", percentage: 25, avgPrice: 18000000 },
      ],
      rentalYields: [
        { type: "3 BR Townhouse", yield: 6.0 },
        { type: "4 BR Villa", yield: 5.5 },
        { type: "5 BR Villa", yield: 5.0 },
        { type: "6+ BR Villa", yield: 4.5 },
      ],
    },
    listings: [
      {
        id: "jge-1",
        title: "Earth Course Villa - Golf View",
        type: "villa",
        subType: "Lime Tree Valley",
        bedrooms: 5,
        bathrooms: 6,
        size: 6200,
        price: 9800000,
        pricePerSqft: 1581,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Earth course view", "Private pool", "Basement", "Premium finish"],
      },
      {
        id: "jge-2",
        title: "Sanctuary Falls - Lakefront Luxury",
        type: "villa",
        subType: "Sanctuary Falls",
        bedrooms: 6,
        bathrooms: 7,
        size: 8500,
        price: 16000000,
        pricePerSqft: 1882,
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2670&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Lake view", "Infinity pool", "Home cinema", "4-car garage"],
      },
      {
        id: "jge-3",
        title: "Orange Lake Townhouse - Ready",
        type: "townhouse",
        subType: "Orange Lake",
        bedrooms: 3,
        bathrooms: 4,
        size: 3200,
        price: 4500000,
        pricePerSqft: 1406,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Golf view", "Ready to move", "Landscaped", "Community pool access"],
      },
      {
        id: "jge-4",
        title: "Whispering Pines 5BR - Rent",
        type: "villa",
        subType: "Whispering Pines",
        bedrooms: 5,
        bathrooms: 6,
        size: 5800,
        price: 380000,
        pricePerSqft: 66,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
        transactionType: "rent",
        features: ["Golf course view", "Private pool", "Furnished option", "Driver's room"],
      },
    ],
    nearbyAmenities: [
      "Earth Golf Course",
      "Fire Golf Course",
      "JGE Clubhouse",
      "GEMS Wellington Primary",
      "Dubai Parks & Resorts",
      "Ibn Battuta Mall",
      "Expo City Dubai",
      "Al Maktoum Airport",
    ],
    subCommunities: [
      "Lime Tree Valley",
      "Orange Lake",
      "Wildflower",
      "Whispering Pines",
      "Sanctuary Falls",
      "Al Andalus",
      "Redwood Park",
      "Alandalus",
    ],
  },

  // ===================== PALM JUMEIRAH =====================
  {
    id: "palm-jumeirah",
    slug: "palm-jumeirah",
    name: "Palm Jumeirah",
    developer: "Nakheel",
    location: "Palm Jumeirah, Dubai",
    established: "2001",
    tagline: "The Icon of Waterfront Luxury",
    description: "Palm Jumeirah is the world's most iconic man-made island, shaped like a palm tree and jutting into the Arabian Gulf. Developed by Nakheel, this engineering marvel hosts some of the most expensive and prestigious addresses in Dubai. The crescent features five-star hotels including Atlantis The Royal, One&Only, and the W Dubai. The fronds offer exclusive Signature Villas with private beaches, while the trunk features Garden Homes, townhouses, and luxury apartments. With Nakheel Mall on the trunk, a monorail connection to the mainland, and the new Palm West Beach with its vibrant dining and beach club scene, Palm Jumeirah remains the ultimate statement of luxury living in the Middle East.",
    seoTitle: "Palm Jumeirah Villas for Sale | Waterfront Luxury Living Dubai",
    seoDescription: "Exclusive Palm Jumeirah villas and signature homes from AED 15M. Private beaches, Atlantis views, and the world's most iconic island address. Premium waterfront living.",
    heroImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2670&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
    ],
    stats: {
      totalUnits: 4000,
      completedUnits: 3800,
      avgPrice: 25000000,
      priceFrom: 15000000,
      priceTo: 300000000,
      avgSize: 8500,
      communitySize: "560 hectares",
    },
    highlights: [
      { title: "Private Beaches", description: "Every villa comes with direct beach access and private waterfront", icon: "beach" },
      { title: "Atlantis & Hotels", description: "Atlantis The Royal, One&Only, W Dubai, and FIVE Palm at your doorstep", icon: "pool" },
      { title: "Nakheel Mall", description: "Premium shopping destination with luxury retail, dining, and entertainment", icon: "mall" },
      { title: "Palm West Beach", description: "Vibrant beachfront with restaurants, beach clubs, and sunset views", icon: "beach" },
      { title: "Monorail", description: "Dedicated Palm Monorail connecting to mainland tram and metro", icon: "metro" },
      { title: "World-Class Dining", description: "Nobu, Ossiano, Gordon Ramsay, and over 100 premium restaurants", icon: "mall" },
    ],
    marketData: {
      avgPriceSqft: 3500,
      avgPriceSqftChange: 22.8,
      avgPriceSqftQ: 6.5,
      totalTransactionsYTD: 624,
      transactionsChange: 18,
      avgDaysOnMarket: 55,
      avgRentYield: 4.5,
      priceHistory: [
        { month: "Sep 2024", avgPrice: 2780, transactions: 85 },
        { month: "Oct 2024", avgPrice: 2920, transactions: 92 },
        { month: "Nov 2024", avgPrice: 3050, transactions: 98 },
        { month: "Dec 2024", avgPrice: 3200, transactions: 105 },
        { month: "Jan 2025", avgPrice: 3350, transactions: 122 },
        { month: "Feb 2025", avgPrice: 3500, transactions: 122 },
      ],
      priceRanges: [
        { type: "Garden Home", bedrooms: "4 BR", minPrice: 15000000, maxPrice: 25000000, avgPrice: 18000000 },
        { type: "Garden Home", bedrooms: "5 BR", minPrice: 20000000, maxPrice: 35000000, avgPrice: 26000000 },
        { type: "Signature Villa", bedrooms: "5 BR", minPrice: 30000000, maxPrice: 60000000, avgPrice: 42000000 },
        { type: "Signature Villa", bedrooms: "6 BR", minPrice: 45000000, maxPrice: 100000000, avgPrice: 65000000 },
        { type: "Custom Villa", bedrooms: "7+ BR", minPrice: 80000000, maxPrice: 300000000, avgPrice: 150000000 },
      ],
      propertyTypeBreakdown: [
        { type: "Villa", percentage: 35, avgPrice: 45000000 },
        { type: "Apartment", percentage: 50, avgPrice: 8000000 },
        { type: "Penthouse", percentage: 15, avgPrice: 35000000 },
      ],
      bedroomBreakdown: [
        { bedrooms: "4 BR", percentage: 20, avgPrice: 18000000 },
        { bedrooms: "5 BR", percentage: 35, avgPrice: 32000000 },
        { bedrooms: "6 BR", percentage: 30, avgPrice: 55000000 },
        { bedrooms: "7+ BR", percentage: 15, avgPrice: 120000000 },
      ],
      rentalYields: [
        { type: "4 BR Garden Home", yield: 4.8 },
        { type: "5 BR Garden Home", yield: 4.5 },
        { type: "Signature Villa", yield: 3.8 },
        { type: "Custom Villa", yield: 3.2 },
      ],
    },
    listings: [
      {
        id: "pj-1",
        title: "Signature Villa - Frond Tip",
        type: "villa",
        subType: "Signature",
        bedrooms: 6,
        bathrooms: 8,
        size: 12000,
        price: 65000000,
        pricePerSqft: 5417,
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2670&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Frond tip position", "360° water views", "Private beach", "Staff quarters"],
      },
      {
        id: "pj-2",
        title: "Garden Home - Atlantis View",
        type: "villa",
        subType: "Garden Home",
        bedrooms: 5,
        bathrooms: 6,
        size: 8500,
        price: 28000000,
        pricePerSqft: 3294,
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2670&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Atlantis view", "Beach access", "Renovated", "Home automation"],
      },
      {
        id: "pj-3",
        title: "Custom Mansion - K Frond",
        type: "villa",
        subType: "Custom",
        bedrooms: 7,
        bathrooms: 10,
        size: 18000,
        price: 120000000,
        pricePerSqft: 6667,
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Custom built", "Yacht dock", "Cinema", "Wine cellar", "Elevator"],
      },
      {
        id: "pj-4",
        title: "Garden Home for Rent - Beach Side",
        type: "villa",
        subType: "Garden Home",
        bedrooms: 5,
        bathrooms: 6,
        size: 7800,
        price: 850000,
        pricePerSqft: 109,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
        transactionType: "rent",
        features: ["Private beach", "Fully furnished", "Pool", "Landscaped"],
      },
    ],
    nearbyAmenities: [
      "Atlantis The Royal",
      "Nakheel Mall",
      "Palm West Beach",
      "One&Only The Palm",
      "W Dubai - The Palm",
      "Aquaventure Waterpark",
      "Palm Monorail",
      "Palm Views Marina",
    ],
    subCommunities: [
      "Signature Villas",
      "Garden Homes",
      "Canal Cove",
      "Palm Views",
      "Shoreline Apartments",
      "Tiara Residences",
      "FIVE Palm",
    ],
  },

  // ===================== OTHER VILLA COMMUNITIES =====================
  {
    id: "other-villa-communities",
    slug: "other-villa-communities",
    name: "Other Villa Communities",
    developer: "Various Developers",
    location: "Across Dubai",
    established: "Various",
    tagline: "Dubai's Premier Villa Neighborhoods",
    description: "Dubai offers a diverse range of villa communities beyond the headline names, each with its own unique character and lifestyle. Arabian Ranches by Emaar is a mature, established community popular with families for its golf course, equestrian center, and excellent schools. Emirates Hills, often called the 'Beverly Hills of Dubai', features custom-built mansions overlooking the Montgomerie Golf Club. Dubai Hills Estate by Emaar and Meraas combines a championship golf course with a major shopping mall. Mudon, The Villa, Jumeirah Village Circle (JVC), and Mirdif are excellent mid-market options offering strong rental yields and family-friendly environments. Each community has its own personality, amenities, and investment profile.",
    seoTitle: "Dubai Villa Communities for Sale | Arabian Ranches, Emirates Hills & More",
    seoDescription: "Explore Dubai's top villa communities - Arabian Ranches, Emirates Hills, Dubai Hills Estate, Mudon, and more. Find your perfect family home from AED 1.2M.",
    heroImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2670&auto=format&fit=crop",
    ],
    stats: {
      totalUnits: 35000,
      completedUnits: 28000,
      avgPrice: 4500000,
      priceFrom: 1200000,
      priceTo: 200000000,
      avgSize: 3800,
      communitySize: "Various",
    },
    highlights: [
      { title: "Arabian Ranches Golf Club", description: "18-hole Ian Baker-Finch designed course with country club amenities", icon: "golf" },
      { title: "Emirates Hills Mansions", description: "Custom mega-mansions up to 30,000 sqft overlooking Montgomerie Golf Club", icon: "pool" },
      { title: "Dubai Hills Mall", description: "State-of-the-art mall with 600+ stores, cinema, and indoor park", icon: "mall" },
      { title: "Top Schools Nearby", description: "GEMS, Taaleem, and Nord Anglia schools across all communities", icon: "school" },
      { title: "Green Spaces", description: "Extensive parks, running tracks, and cycling paths in every community", icon: "park" },
      { title: "Strong ROI", description: "Average rental yields of 5-7% across mid-market villa communities", icon: "security" },
    ],
    marketData: {
      avgPriceSqft: 1250,
      avgPriceSqftChange: 10.5,
      avgPriceSqftQ: 2.8,
      totalTransactionsYTD: 8500,
      transactionsChange: 15,
      avgDaysOnMarket: 40,
      avgRentYield: 5.8,
      priceHistory: [
        { month: "Sep 2024", avgPrice: 1080, transactions: 1200 },
        { month: "Oct 2024", avgPrice: 1110, transactions: 1350 },
        { month: "Nov 2024", avgPrice: 1145, transactions: 1420 },
        { month: "Dec 2024", avgPrice: 1180, transactions: 1280 },
        { month: "Jan 2025", avgPrice: 1220, transactions: 1580 },
        { month: "Feb 2025", avgPrice: 1250, transactions: 1670 },
      ],
      priceRanges: [
        { type: "Villa (Mudon/JVC)", bedrooms: "3 BR", minPrice: 1200000, maxPrice: 2500000, avgPrice: 1800000 },
        { type: "Villa (Arabian Ranches)", bedrooms: "4 BR", minPrice: 3500000, maxPrice: 6000000, avgPrice: 4500000 },
        { type: "Villa (Dubai Hills)", bedrooms: "5 BR", minPrice: 5000000, maxPrice: 12000000, avgPrice: 7500000 },
        { type: "Villa (Emirates Hills)", bedrooms: "6 BR", minPrice: 20000000, maxPrice: 80000000, avgPrice: 40000000 },
        { type: "Mansion (Emirates Hills)", bedrooms: "7+ BR", minPrice: 50000000, maxPrice: 200000000, avgPrice: 90000000 },
      ],
      propertyTypeBreakdown: [
        { type: "Villa", percentage: 60, avgPrice: 5500000 },
        { type: "Townhouse", percentage: 30, avgPrice: 2800000 },
        { type: "Mansion", percentage: 10, avgPrice: 45000000 },
      ],
      bedroomBreakdown: [
        { bedrooms: "3 BR", percentage: 25, avgPrice: 2200000 },
        { bedrooms: "4 BR", percentage: 30, avgPrice: 4000000 },
        { bedrooms: "5 BR", percentage: 25, avgPrice: 7000000 },
        { bedrooms: "6+ BR", percentage: 20, avgPrice: 25000000 },
      ],
      rentalYields: [
        { type: "3 BR (Mudon/JVC)", yield: 7.2 },
        { type: "4 BR (Arabian Ranches)", yield: 5.8 },
        { type: "5 BR (Dubai Hills)", yield: 5.2 },
        { type: "6+ BR (Emirates Hills)", yield: 3.5 },
      ],
    },
    listings: [
      {
        id: "oth-1",
        title: "Arabian Ranches 2 - Palma Villa",
        type: "villa",
        subType: "Palma",
        bedrooms: 5,
        bathrooms: 5,
        size: 4200,
        price: 5800000,
        pricePerSqft: 1381,
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Community view", "Private pool", "Upgraded", "Near golf course"],
      },
      {
        id: "oth-2",
        title: "Emirates Hills - Sector E Mansion",
        type: "villa",
        subType: "Custom",
        bedrooms: 7,
        bathrooms: 9,
        size: 18000,
        price: 65000000,
        pricePerSqft: 3611,
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2671&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Golf course view", "Lake view", "Infinity pool", "Home cinema", "Wine cellar"],
      },
      {
        id: "oth-3",
        title: "Dubai Hills - Maple Townhouse",
        type: "townhouse",
        subType: "Maple",
        bedrooms: 4,
        bathrooms: 4,
        size: 2600,
        price: 3800000,
        pricePerSqft: 1462,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
        transactionType: "sale",
        features: ["Park view", "Near mall", "Brand new", "Premium finish"],
        isNew: true,
      },
      {
        id: "oth-4",
        title: "Mudon 4BR Villa for Rent",
        type: "villa",
        subType: "Mudon",
        bedrooms: 4,
        bathrooms: 5,
        size: 2800,
        price: 160000,
        pricePerSqft: 57,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2675&auto=format&fit=crop",
        transactionType: "rent",
        features: ["Well maintained", "Community pool", "Near school", "Landscaped"],
      },
    ],
    nearbyAmenities: [
      "Arabian Ranches Golf Club",
      "Montgomerie Golf Club",
      "Dubai Hills Mall",
      "GEMS Schools (Multiple)",
      "Dubai Sports City",
      "Motor City",
      "Global Village",
      "IMG Worlds of Adventure",
    ],
    subCommunities: [
      "Arabian Ranches 1 & 2 & 3",
      "Emirates Hills",
      "Dubai Hills Estate",
      "Mudon",
      "The Villa",
      "Jumeirah Village Circle",
      "Mirdif",
      "The Springs / Meadows",
    ],
  },
]

export function getCommunityBySlug(slug: string): VillaCommunity | undefined {
  return villaCommunities.find((c) => c.slug === slug)
}

export function formatPrice(price: number): string {
  if (price >= 1000000000) return `AED ${(price / 1000000000).toFixed(1)}B`
  if (price >= 1000000) return `AED ${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `AED ${(price / 1000).toFixed(0)}K`
  return `AED ${price.toLocaleString()}`
}

export function formatPriceShort(price: number): string {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`
  if (price >= 1000) return `${(price / 1000).toFixed(0)}K`
  return price.toLocaleString()
}

export const allAreaSlugs = villaCommunities.map((c) => c.slug)
