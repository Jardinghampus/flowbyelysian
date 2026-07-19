export interface AreaAgent {
  id: string
  name: string
  role: "Sales" | "Leasing"
  avatar?: string
  deals: number
  commission: number
  listings: number
  phone: string
  email: string
}

export interface AreaListing {
  id: string
  title: string
  type: "villa" | "apartment" | "townhouse" | "penthouse" | "plot"
  price: number
  size: number
  bedrooms: number
  bathrooms: number
  status: "live" | "pocket" | "unofficial"
  transactionType: "sale" | "rent"
  agentId: string
  agentName: string
  createdAt: string
}

export interface AreaRequest {
  id: string
  clientName: string
  budget: number
  propertyType: string
  bedrooms: number
  notes: string
  status: "active" | "matched" | "closed"
  agentId: string
  agentName: string
  createdAt: string
}

export interface AreaMarketData {
  avgPriceSqft: number
  avgPriceSqftChange: number
  totalTransactions: number
  transactionsChange: number
  avgDaysOnMarket: number
  daysOnMarketChange: number
  priceHistory: { month: string; price: number }[]
  transactionHistory: { month: string; count: number }[]
  propertyTypeBreakdown: { type: string; percentage: number }[]
}

export interface Area {
  id: string
  slug: string
  name: string
  description: string
  image: string
  stats: {
    totalListings: number
    activeAgents: number
    avgPrice: number
    totalDeals: number
    avgRentYield: number
  }
  marketData: AreaMarketData
  agents: AreaAgent[]
  listings: AreaListing[]
  requests: AreaRequest[]
}

export const areasData: Area[] = [
  {
    id: "1",
    slug: "tilal-al-ghaf",
    name: "Tilal Al Ghaf",
    description: "A premium master-planned community featuring lagoons, parks, and luxury villas. Known for sustainable living and world-class amenities.",
    image: "/areas/tilal-al-ghaf.jpg",
    stats: {
      totalListings: 45,
      activeAgents: 3,
      avgPrice: 8500000,
      totalDeals: 12,
      avgRentYield: 5.2,
    },
    marketData: {
      avgPriceSqft: 1850,
      avgPriceSqftChange: 8.5,
      totalTransactions: 156,
      transactionsChange: 12,
      avgDaysOnMarket: 45,
      daysOnMarketChange: -5,
      priceHistory: [
        { month: "Aug", price: 1650 },
        { month: "Sep", price: 1700 },
        { month: "Oct", price: 1720 },
        { month: "Nov", price: 1780 },
        { month: "Dec", price: 1800 },
        { month: "Jan", price: 1850 },
      ],
      transactionHistory: [
        { month: "Aug", count: 22 },
        { month: "Sep", count: 28 },
        { month: "Oct", count: 25 },
        { month: "Nov", count: 30 },
        { month: "Dec", count: 24 },
        { month: "Jan", count: 27 },
      ],
      propertyTypeBreakdown: [
        { type: "Villa", percentage: 65 },
        { type: "Townhouse", percentage: 25 },
        { type: "Apartment", percentage: 10 },
      ],
    },
    agents: [
      {
        id: "a1",
        name: "Paola Santos",
        role: "Leasing",
        deals: 10,
        commission: 32000,
        listings: 54,
        phone: "+971 50 123 4567",
        email: "paola@zaylo.ae",
      },
      {
        id: "a2",
        name: "Madelon",
        role: "Sales",
        deals: 12,
        commission: 65000,
        listings: 100,
        phone: "+971 50 234 5678",
        email: "madelon@zaylo.ae",
      },
    ],
    listings: [
      {
        id: "l1",
        title: "Harmony 3 Villa - Brand New",
        type: "villa",
        price: 9500000,
        size: 5200,
        bedrooms: 5,
        bathrooms: 6,
        status: "live",
        transactionType: "sale",
        agentId: "a2",
        agentName: "Madelon",
        createdAt: "2024-01-15",
      },
      {
        id: "l2",
        title: "Elan Townhouse - Corner Unit",
        type: "townhouse",
        price: 4200000,
        size: 3100,
        bedrooms: 4,
        bathrooms: 4,
        status: "live",
        transactionType: "sale",
        agentId: "a1",
        agentName: "Paola Santos",
        createdAt: "2024-01-18",
      },
      {
        id: "l3",
        title: "Aura Villa with Lagoon Access",
        type: "villa",
        price: 12000000,
        size: 6800,
        bedrooms: 6,
        bathrooms: 7,
        status: "pocket",
        transactionType: "sale",
        agentId: "a2",
        agentName: "Madelon",
        createdAt: "2024-01-20",
      },
    ],
    requests: [
      {
        id: "r1",
        clientName: "James Wilson",
        budget: 10000000,
        propertyType: "Villa",
        bedrooms: 5,
        notes: "Prefers lagoon view, ready to close quickly",
        status: "active",
        agentId: "a2",
        agentName: "Madelon",
        createdAt: "2024-01-22",
      },
    ],
  },
  {
    id: "2",
    slug: "al-furjan",
    name: "Al Furjan",
    description: "A vibrant family-friendly community with a mix of villas and townhouses. Close to metro, schools, and retail destinations.",
    image: "/areas/al-furjan.jpg",
    stats: {
      totalListings: 65,
      activeAgents: 2,
      avgPrice: 3200000,
      totalDeals: 18,
      avgRentYield: 6.8,
    },
    marketData: {
      avgPriceSqft: 1100,
      avgPriceSqftChange: 5.2,
      totalTransactions: 234,
      transactionsChange: 8,
      avgDaysOnMarket: 32,
      daysOnMarketChange: -8,
      priceHistory: [
        { month: "Aug", price: 980 },
        { month: "Sep", price: 1000 },
        { month: "Oct", price: 1020 },
        { month: "Nov", price: 1050 },
        { month: "Dec", price: 1080 },
        { month: "Jan", price: 1100 },
      ],
      transactionHistory: [
        { month: "Aug", count: 35 },
        { month: "Sep", count: 42 },
        { month: "Oct", count: 38 },
        { month: "Nov", count: 45 },
        { month: "Dec", count: 40 },
        { month: "Jan", count: 34 },
      ],
      propertyTypeBreakdown: [
        { type: "Villa", percentage: 40 },
        { type: "Townhouse", percentage: 45 },
        { type: "Apartment", percentage: 15 },
      ],
    },
    agents: [
      {
        id: "a3",
        name: "Hampus Jarding",
        role: "Leasing",
        deals: 7,
        commission: 40000,
        listings: 65,
        phone: "+971 50 345 6789",
        email: "hampus@zaylo.ae",
      },
    ],
    listings: [
      {
        id: "l4",
        title: "Quortaj Villa - Upgraded",
        type: "villa",
        price: 3800000,
        size: 3600,
        bedrooms: 4,
        bathrooms: 5,
        status: "live",
        transactionType: "sale",
        agentId: "a3",
        agentName: "Hampus Jarding",
        createdAt: "2024-01-10",
      },
      {
        id: "l5",
        title: "Family Townhouse - Near Metro",
        type: "townhouse",
        price: 85000,
        size: 2400,
        bedrooms: 3,
        bathrooms: 4,
        status: "live",
        transactionType: "rent",
        agentId: "a3",
        agentName: "Hampus Jarding",
        createdAt: "2024-01-12",
      },
    ],
    requests: [
      {
        id: "r2",
        clientName: "Sarah Ahmed",
        budget: 90000,
        propertyType: "Townhouse",
        bedrooms: 3,
        notes: "Annual lease, family with 2 kids, near school preferred",
        status: "active",
        agentId: "a3",
        agentName: "Hampus Jarding",
        createdAt: "2024-01-20",
      },
    ],
  },
  {
    id: "3",
    slug: "palm-jumeirah",
    name: "Palm Jumeirah",
    description: "The iconic man-made island featuring ultra-luxury villas, apartments, and world-renowned hotels. Premium beachfront living.",
    image: "/areas/palm-jumeirah.jpg",
    stats: {
      totalListings: 28,
      activeAgents: 2,
      avgPrice: 25000000,
      totalDeals: 5,
      avgRentYield: 4.5,
    },
    marketData: {
      avgPriceSqft: 3500,
      avgPriceSqftChange: 12.5,
      totalTransactions: 89,
      transactionsChange: 15,
      avgDaysOnMarket: 60,
      daysOnMarketChange: -10,
      priceHistory: [
        { month: "Aug", price: 3000 },
        { month: "Sep", price: 3100 },
        { month: "Oct", price: 3200 },
        { month: "Nov", price: 3300 },
        { month: "Dec", price: 3400 },
        { month: "Jan", price: 3500 },
      ],
      transactionHistory: [
        { month: "Aug", count: 12 },
        { month: "Sep", count: 15 },
        { month: "Oct", count: 14 },
        { month: "Nov", count: 18 },
        { month: "Dec", count: 16 },
        { month: "Jan", count: 14 },
      ],
      propertyTypeBreakdown: [
        { type: "Villa", percentage: 35 },
        { type: "Apartment", percentage: 50 },
        { type: "Penthouse", percentage: 15 },
      ],
    },
    agents: [
      {
        id: "a4",
        name: "Alex Scriven",
        role: "Sales",
        deals: 5,
        commission: 95000,
        listings: 23,
        phone: "+971 50 456 7890",
        email: "alex@zaylo.ae",
      },
    ],
    listings: [
      {
        id: "l6",
        title: "Signature Villa - Frond Tip",
        type: "villa",
        price: 45000000,
        size: 12000,
        bedrooms: 7,
        bathrooms: 9,
        status: "live",
        transactionType: "sale",
        agentId: "a4",
        agentName: "Alex Scriven",
        createdAt: "2024-01-08",
      },
      {
        id: "l7",
        title: "Garden Home - Beach Access",
        type: "villa",
        price: 28000000,
        size: 8500,
        bedrooms: 5,
        bathrooms: 6,
        status: "pocket",
        transactionType: "sale",
        agentId: "a4",
        agentName: "Alex Scriven",
        createdAt: "2024-01-14",
      },
    ],
    requests: [
      {
        id: "r3",
        clientName: "Mohammed Al Rashid",
        budget: 50000000,
        propertyType: "Villa",
        bedrooms: 6,
        notes: "Cash buyer, requires private beach, no rush",
        status: "active",
        agentId: "a4",
        agentName: "Alex Scriven",
        createdAt: "2024-01-18",
      },
    ],
  },
  {
    id: "4",
    slug: "dubai-marina",
    name: "Dubai Marina",
    description: "A stunning waterfront community with high-rise luxury apartments, dining, and entertainment. The heart of New Dubai.",
    image: "/areas/dubai-marina.jpg",
    stats: {
      totalListings: 82,
      activeAgents: 3,
      avgPrice: 2800000,
      totalDeals: 25,
      avgRentYield: 7.2,
    },
    marketData: {
      avgPriceSqft: 1650,
      avgPriceSqftChange: 6.8,
      totalTransactions: 456,
      transactionsChange: 10,
      avgDaysOnMarket: 28,
      daysOnMarketChange: -12,
      priceHistory: [
        { month: "Aug", price: 1450 },
        { month: "Sep", price: 1500 },
        { month: "Oct", price: 1550 },
        { month: "Nov", price: 1580 },
        { month: "Dec", price: 1620 },
        { month: "Jan", price: 1650 },
      ],
      transactionHistory: [
        { month: "Aug", count: 68 },
        { month: "Sep", count: 75 },
        { month: "Oct", count: 72 },
        { month: "Nov", count: 82 },
        { month: "Dec", count: 78 },
        { month: "Jan", count: 81 },
      ],
      propertyTypeBreakdown: [
        { type: "Apartment", percentage: 75 },
        { type: "Penthouse", percentage: 20 },
        { type: "Villa", percentage: 5 },
      ],
    },
    agents: [
      {
        id: "a5",
        name: "Jane Doe",
        role: "Sales",
        deals: 3,
        commission: 2000,
        listings: 43,
        phone: "+971 50 567 8901",
        email: "jane@zaylo.ae",
      },
    ],
    listings: [
      {
        id: "l8",
        title: "Marina View Penthouse",
        type: "penthouse",
        price: 8500000,
        size: 4200,
        bedrooms: 4,
        bathrooms: 5,
        status: "live",
        transactionType: "sale",
        agentId: "a5",
        agentName: "Jane Doe",
        createdAt: "2024-01-16",
      },
      {
        id: "l9",
        title: "2BR High Floor - Full Marina",
        type: "apartment",
        price: 180000,
        size: 1400,
        bedrooms: 2,
        bathrooms: 3,
        status: "live",
        transactionType: "rent",
        agentId: "a5",
        agentName: "Jane Doe",
        createdAt: "2024-01-19",
      },
    ],
    requests: [
      {
        id: "r4",
        clientName: "David Chen",
        budget: 200000,
        propertyType: "Apartment",
        bedrooms: 2,
        notes: "Corporate lease, high floor required, furnished",
        status: "active",
        agentId: "a5",
        agentName: "Jane Doe",
        createdAt: "2024-01-21",
      },
    ],
  },
  {
    id: "5",
    slug: "downtown-dubai",
    name: "Downtown Dubai",
    description: "Home to Burj Khalifa and Dubai Mall. The most prestigious address in Dubai with world-class amenities and lifestyle.",
    image: "/areas/downtown-dubai.jpg",
    stats: {
      totalListings: 55,
      activeAgents: 2,
      avgPrice: 4500000,
      totalDeals: 15,
      avgRentYield: 5.8,
    },
    marketData: {
      avgPriceSqft: 2200,
      avgPriceSqftChange: 9.2,
      totalTransactions: 312,
      transactionsChange: 14,
      avgDaysOnMarket: 35,
      daysOnMarketChange: -6,
      priceHistory: [
        { month: "Aug", price: 1900 },
        { month: "Sep", price: 1980 },
        { month: "Oct", price: 2050 },
        { month: "Nov", price: 2100 },
        { month: "Dec", price: 2150 },
        { month: "Jan", price: 2200 },
      ],
      transactionHistory: [
        { month: "Aug", count: 48 },
        { month: "Sep", count: 52 },
        { month: "Oct", count: 50 },
        { month: "Nov", count: 58 },
        { month: "Dec", count: 55 },
        { month: "Jan", count: 49 },
      ],
      propertyTypeBreakdown: [
        { type: "Apartment", percentage: 80 },
        { type: "Penthouse", percentage: 15 },
        { type: "Villa", percentage: 5 },
      ],
    },
    agents: [],
    listings: [
      {
        id: "l10",
        title: "Burj Khalifa Residence",
        type: "apartment",
        price: 6500000,
        size: 2200,
        bedrooms: 3,
        bathrooms: 4,
        status: "live",
        transactionType: "sale",
        agentId: "a1",
        agentName: "Paola Santos",
        createdAt: "2024-01-11",
      },
    ],
    requests: [],
  },
  {
    id: "6",
    slug: "arabian-ranches",
    name: "Arabian Ranches",
    description: "An established family community with spacious villas, golf course, and equestrian facilities. Suburban living at its finest.",
    image: "/areas/arabian-ranches.jpg",
    stats: {
      totalListings: 38,
      activeAgents: 2,
      avgPrice: 5800000,
      totalDeals: 8,
      avgRentYield: 5.5,
    },
    marketData: {
      avgPriceSqft: 1400,
      avgPriceSqftChange: 4.8,
      totalTransactions: 145,
      transactionsChange: 6,
      avgDaysOnMarket: 52,
      daysOnMarketChange: -3,
      priceHistory: [
        { month: "Aug", price: 1280 },
        { month: "Sep", price: 1300 },
        { month: "Oct", price: 1320 },
        { month: "Nov", price: 1350 },
        { month: "Dec", price: 1380 },
        { month: "Jan", price: 1400 },
      ],
      transactionHistory: [
        { month: "Aug", count: 22 },
        { month: "Sep", count: 25 },
        { month: "Oct", count: 23 },
        { month: "Nov", count: 28 },
        { month: "Dec", count: 26 },
        { month: "Jan", count: 21 },
      ],
      propertyTypeBreakdown: [
        { type: "Villa", percentage: 85 },
        { type: "Townhouse", percentage: 15 },
      ],
    },
    agents: [],
    listings: [],
    requests: [],
  },
]

export function getAreaBySlug(slug: string): Area | undefined {
  return areasData.find((area) => area.slug === slug)
}

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `AED ${(price / 1000000).toFixed(1)}M`
  }
  if (price >= 1000) {
    return `AED ${(price / 1000).toFixed(0)}K`
  }
  return `AED ${price.toLocaleString()}`
}
