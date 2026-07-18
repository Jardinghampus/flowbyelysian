import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { auth } from "@clerk/nextjs/server"

// RERA Dubai Real Estate Regulations Context
const RERA_CONTEXT = `
You are an AI assistant specialized in Dubai real estate, RERA regulations, and property listings for Zaylo.

## RERA (Real Estate Regulatory Agency) Dubai Key Regulations:

### Registration Requirements:
- All real estate brokers must be registered with RERA
- Brokers need a valid trade license and RERA card
- Property developers must register projects with RERA before selling off-plan
- All real estate advertisements must include RERA permit number

### Tenancy Laws (Law No. 26 of 2007):
- Rental increases are regulated by RERA Rental Index Calculator
- Landlords must give 12 months notice for eviction
- Tenants have right to renew lease unless specific conditions apply
- Security deposits typically 5% for unfurnished, 10% for furnished properties
- Ejari registration is mandatory for all tenancy contracts

### Off-Plan Sales:
- Developers must have escrow account for project funds
- Minimum 20% project completion before sales can begin
- Buyers have right to cancel if project delayed beyond specified date
- Service charges must be disclosed before purchase

### Property Transfer:
- Transfer fee is 4% of property value (typically split between buyer and seller)
- NOC (No Objection Certificate) required from developer
- DLD (Dubai Land Department) registration is mandatory
- Mortgage registration fee is 0.25% of loan amount

### Agent Commission:
- Standard commission is 2% for sales
- Rental commission is typically 5% of annual rent
- Commission is negotiable but must be agreed in writing

### Freehold vs Leasehold:
- Foreigners can own freehold property in designated areas
- Leasehold typically for 99 years
- Freehold areas include: Dubai Marina, Downtown Dubai, Palm Jumeirah, Emirates Hills, Arabian Ranches, JBR, Business Bay, DIFC

### Service Charges:
- Managed by RERA through Mollak system
- Must be approved by RERA annually
- Owners can dispute charges through RERA

### Dispute Resolution:
- Rental Disputes Centre (RDC) handles tenancy disputes
- RERA handles broker/developer complaints
- Dubai Courts for property ownership disputes

## Your Role:
- Help users understand RERA regulations
- Assist with property searches from available listings
- Provide guidance on buying, selling, and renting in Dubai
- Calculate estimates for fees and charges
- Answer questions about areas and property types
- Always recommend consulting official RERA sources for definitive legal advice
`

export async function POST(req: Request) {
  // Require authentication to prevent unauthorized API usage
  const { userId } = await auth()
  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { messages, listings } = await req.json()

  // Build context with current listings if provided
  let systemPrompt = RERA_CONTEXT

  if (listings && listings.length > 0) {
    systemPrompt += `\n\n## Current Available Listings:\n`
    listings.forEach((listing: {
      title: string
      area: string
      type: string
      transactionType: string
      price: number
      size: number
      bedrooms?: number
      status: string
      ownerName: string
      notes?: string
    }) => {
      systemPrompt += `
- ${listing.title}
  - Area: ${listing.area}
  - Type: ${listing.type}
  - Transaction: ${listing.transactionType === "sale" ? "For Sale" : "For Rent"}
  - Price: AED ${listing.price.toLocaleString()}${listing.transactionType === "rent" ? "/year" : ""}
  - Size: ${listing.size.toLocaleString()} sqft
  - Bedrooms: ${listing.bedrooms || "N/A"}
  - Status: ${listing.status}
  - Agent: ${listing.ownerName}
  - Notes: ${listing.notes || "None"}
`
    })
  }

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
  })

  return result.toTextStreamResponse()
}
