export type QuickListingStatus = "live" | "pocket" | "unofficial"
export type QuickInquiryType = "stock" | "request"
export type QuickListingType = "villa" | "apartment" | "townhouse" | "penthouse" | "plot" | "office" | "retail"
export type QuickTransactionType = "sale" | "rent"

export type QuickListingPayload = {
  title: string
  area_name: string
  price: number
  size?: number
  type: QuickListingType
  status: QuickListingStatus
  inquiry_type: QuickInquiryType
  transaction_type: QuickTransactionType
  bedrooms?: number
  contact_phone?: string
  contact_name?: string
  notes?: string
}

export const QUICK_AREAS = [
  "Palm Jumeirah",
  "Dubai Marina",
  "Downtown Dubai",
  "Dubai Hills Estate",
  "Emirates Hills",
  "Arabian Ranches",
  "Business Bay",
  "Jumeirah Beach Residence",
  "Mohammed Bin Rashid City",
  "Tilal Al Ghaf",
]
