export type RequestType = "buy" | "sell" | "rent" | "lease"
export type RequestStatus = "active" | "matched" | "closed"
export type UrgencyLevel = "low" | "medium" | "high" | "urgent"

export interface ExchangeRequest {
  id: string
  type: RequestType
  title: string
  description: string
  area: string
  areaSlug: string
  subArea?: string
  unitNumber?: string
  floor?: string
  propertyType: "villa" | "apartment" | "townhouse" | "penthouse" | "plot" | "office" | "retail"
  bedrooms: number
  bathrooms: number
  minSize: number
  maxSize: number
  minBudget: number
  maxBudget: number
  features: string[]
  status: RequestStatus
  urgency: UrgencyLevel
  contactName: string
  contactPhone: string
  contactEmail: string
  createdAt: string
  matchCount: number
  imageUrl: string
  isOffMarket?: boolean
}

export interface AgencyInquiry {
  fullName: string
  email: string
  phone: string
  propertyType: string
  transactionType: RequestType
  area: string
  bedrooms: number
  estimatedValue: number
  description: string
  hasTitle: boolean
  preferredContact: "phone" | "email" | "whatsapp"
}

export const requestTypeConfig: Record<RequestType, { label: string; color: string; bg: string; text: string; icon: string }> = {
  buy: { label: "Buy", color: "#10b981", bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-400", icon: "ShoppingCart" },
  sell: { label: "Sell", color: "#f59e0b", bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-400", icon: "Tag" },
  rent: { label: "Rent", color: "#3b82f6", bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-400", icon: "Key" },
  lease: { label: "Lease Out", color: "#8b5cf6", bg: "bg-violet-500/10 dark:bg-violet-500/20", text: "text-violet-700 dark:text-violet-400", icon: "Building" },
}

export const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; bg: string; text: string }> = {
  low: { label: "Low", color: "#6b7280", bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
  medium: { label: "Medium", color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  high: { label: "High", color: "#ef4444", bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
  urgent: { label: "Urgent", color: "#dc2626", bg: "bg-red-600/10", text: "text-red-700 dark:text-red-400" },
}

export const sampleRequests: ExchangeRequest[] = [
  {
    id: "exr-001",
    type: "buy",
    title: "Looking for Family Villa in Palm Jumeirah",
    description: "Relocating family of 5 from London. Need a 4-5BR villa with private pool and beach access. Pre-approved mortgage, ready to close within 60 days.",
    area: "Palm Jumeirah",
    areaSlug: "palm-jumeirah",
    propertyType: "villa",
    bedrooms: 5,
    bathrooms: 6,
    minSize: 5000,
    maxSize: 10000,
    minBudget: 15000000,
    maxBudget: 30000000,
    features: ["Private Pool", "Beach Access", "Parking x3", "Maid's Room"],
    status: "active",
    urgency: "high",
    contactName: "James W.",
    contactPhone: "+971 50 XXX XXXX",
    contactEmail: "j.w***@gmail.com",
    createdAt: "2026-02-18",
    matchCount: 3,
    imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
  },
  {
    id: "exr-002",
    type: "sell",
    title: "6BR Signature Villa - Frond M",
    description: "Fully upgraded signature villa with stunning Atlantis views. Italian marble, smart home system. Motivated seller, open to reasonable offers.",
    area: "Palm Jumeirah",
    areaSlug: "palm-jumeirah",
    subArea: "Frond M",
    unitNumber: "V-M-12",
    propertyType: "villa",
    bedrooms: 6,
    bathrooms: 7,
    minSize: 12000,
    maxSize: 12000,
    minBudget: 40000000,
    maxBudget: 48000000,
    features: ["Atlantis View", "Smart Home", "Italian Marble", "Private Beach"],
    status: "active",
    urgency: "medium",
    contactName: "Fatima A.",
    contactPhone: "+971 55 412 8834",
    contactEmail: "f.a***@outlook.com",
    createdAt: "2026-02-15",
    matchCount: 5,
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    isOffMarket: true,
  },
  {
    id: "exr-003",
    type: "rent",
    title: "Seeking 2BR Apartment - Short Term",
    description: "Digital nomad couple looking for a furnished 2BR apartment for 6-12 months. Flexible on area but prefer marina or downtown views. Budget up to 120K/yr.",
    area: "Al Furjan",
    areaSlug: "al-furjan",
    propertyType: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    minSize: 1000,
    maxSize: 1800,
    minBudget: 80000,
    maxBudget: 120000,
    features: ["Furnished", "Gym", "Pool", "High Floor"],
    status: "active",
    urgency: "medium",
    contactName: "Carlos M.",
    contactPhone: "+971 52 XXX XXXX",
    contactEmail: "c.m***@gmail.com",
    createdAt: "2026-02-19",
    matchCount: 8,
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  },
  {
    id: "exr-004",
    type: "lease",
    title: "4BR Townhouse Available for Lease",
    description: "Well-maintained 4BR townhouse with garden and community pool. Owner looking for corporate tenant on 1-2 year lease. Currently vacant.",
    area: "Jumeirah Golf Estates",
    areaSlug: "jge",
    subArea: "Lime Tree Valley",
    unitNumber: "LTV-42",
    propertyType: "townhouse",
    bedrooms: 4,
    bathrooms: 5,
    minSize: 4500,
    maxSize: 4500,
    minBudget: 180000,
    maxBudget: 220000,
    features: ["Garden", "Community Pool", "Gym", "Pet Friendly"],
    status: "active",
    urgency: "low",
    contactName: "Ahmed R.",
    contactPhone: "+971 56 331 9920",
    contactEmail: "a.r***@hotmail.com",
    createdAt: "2026-02-10",
    matchCount: 2,
    imageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    isOffMarket: true,
  },
  {
    id: "exr-005",
    type: "buy",
    title: "Investment: 1-2BR Apartments in Damac Hills",
    description: "Investor portfolio acquisition. Looking for 3-5 units in Damac Hills for rental yield. Cash buyer, bulk deal preferred.",
    area: "Damac Hills",
    areaSlug: "damac-hills",
    propertyType: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    minSize: 800,
    maxSize: 1500,
    minBudget: 800000,
    maxBudget: 2000000,
    features: ["High Yield", "Furnished Preferred", "Golf View", "Bulk Deal"],
    status: "active",
    urgency: "medium",
    contactName: "Raj P.",
    contactPhone: "+971 54 XXX XXXX",
    contactEmail: "r.p***@yahoo.com",
    createdAt: "2026-02-12",
    matchCount: 12,
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  },
  {
    id: "exr-006",
    type: "sell",
    title: "Harmony III Villa - Lagoon Facing",
    description: "Immaculate 5BR villa with direct lagoon access. Brand new, never lived in. Owner relocating overseas. Below market value for quick sale.",
    area: "Tilal Al Ghaf",
    areaSlug: "tilal-al-ghaf",
    subArea: "Harmony III",
    unitNumber: "H3-V-087",
    propertyType: "villa",
    bedrooms: 5,
    bathrooms: 6,
    minSize: 7000,
    maxSize: 7000,
    minBudget: 13000000,
    maxBudget: 15000000,
    features: ["Lagoon Access", "Brand New", "Smart Home", "Rooftop Terrace"],
    status: "active",
    urgency: "high",
    contactName: "Sarah K.",
    contactPhone: "+971 50 887 2241",
    contactEmail: "s.k***@gmail.com",
    createdAt: "2026-02-17",
    matchCount: 7,
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    isOffMarket: true,
  },
  {
    id: "exr-007",
    type: "rent",
    title: "Corporate Lease: 5BR Villa for Executive",
    description: "Multinational company seeking a 5BR villa for incoming C-level executive. Need prestigious area, move-in ready by March 2026. 2-year corporate lease.",
    area: "Jumeirah Golf Estates",
    areaSlug: "jge",
    propertyType: "villa",
    bedrooms: 5,
    bathrooms: 6,
    minSize: 6000,
    maxSize: 12000,
    minBudget: 250000,
    maxBudget: 400000,
    features: ["Golf View", "Pool", "Furnished", "Move-in Ready"],
    status: "active",
    urgency: "urgent",
    contactName: "HR Dept.",
    contactPhone: "+971 4 XXX XXXX",
    contactEmail: "hr***@corp.com",
    createdAt: "2026-02-20",
    matchCount: 4,
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  },
  {
    id: "exr-008",
    type: "lease",
    title: "Retail Space in Al Furjan",
    description: "Ground floor retail unit with high foot traffic. Suitable for café, salon, or convenience store. Long-term lease preferred, 3-5 years.",
    area: "Al Furjan",
    areaSlug: "al-furjan",
    subArea: "Al Furjan South",
    unitNumber: "AFS-R-003",
    propertyType: "retail",
    bedrooms: 0,
    bathrooms: 1,
    minSize: 800,
    maxSize: 1500,
    minBudget: 120000,
    maxBudget: 200000,
    features: ["Ground Floor", "High Foot Traffic", "Parking", "Storage"],
    status: "active",
    urgency: "low",
    contactName: "Mike T.",
    contactPhone: "+971 58 220 4417",
    contactEmail: "m.t***@gmail.com",
    createdAt: "2026-02-08",
    matchCount: 1,
    imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    isOffMarket: true,
  },
]
