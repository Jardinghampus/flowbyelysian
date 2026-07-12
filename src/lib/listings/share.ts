export type ShareableListing = {
  id: string
  title: string
  area: string
  subArea: string | null
  size: number | null
  price: number
  type: string
  status: string
  inquiryType: string
  transactionType: string
  bedrooms: number | null
  bathrooms: number | null
  availability: string | null
  propertyFinderUrl: string | null
  googleMapsUrl: string | null
  images: string[]
  agentName: string
  notesPublic: string | null
}

export function toShareableListing(row: Record<string, unknown>, opts?: { includeNotes?: boolean }): ShareableListing {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    area: String(row.area_name || ""),
    subArea: row.sub_area ? String(row.sub_area) : null,
    size: row.size != null ? Number(row.size) : null,
    price: Number(row.price || 0),
    type: String(row.type || ""),
    status: String(row.status || ""),
    inquiryType: String(row.inquiry_type || "stock"),
    transactionType: String(row.transaction_type || "sale"),
    bedrooms: row.bedrooms != null ? Number(row.bedrooms) : null,
    bathrooms: row.bathrooms != null ? Number(row.bathrooms) : null,
    availability: row.availability ? String(row.availability) : null,
    propertyFinderUrl: row.property_finder_url ? String(row.property_finder_url) : null,
    googleMapsUrl: row.google_maps_url ? String(row.google_maps_url) : null,
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    agentName: String(row.owner_name || "Agent"),
    // Never leak private CRM notes on public shares unless explicitly allowed
    notesPublic: opts?.includeNotes && row.notes ? String(row.notes) : null,
  }
}

export function formatListingPrice(price: number, transactionType: string) {
  const formatted = new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(price)
  return transactionType === "rent" ? `${formatted}/yr` : formatted
}
