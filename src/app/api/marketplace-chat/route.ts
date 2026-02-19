import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { auth } from "@clerk/nextjs/server"

const MARKETPLACE_SYSTEM_PROMPT = `
You are an AI real estate advisor for Flow by Elysian, specializing in Dubai's premium residential market. You help buyers and investors find the perfect property based on their budget, preferences, and goals.

## Your Expertise Areas:
- **The Palm Jumeirah**: Iconic waterfront living, signature villas (AED 20-80M), apartments (AED 2-8M), branded residences
- **Jumeirah Golf Estates (JGE)**: Premium golf community, villas (AED 7-30M), strong corporate tenant demand, 5-6% yields
- **Al Furjan**: Family-friendly, affordable entry point, townhouses (AED 2-4M), apartments (AED 1-2M), near metro
- **Tilal Al Ghaf**: Lagoon lifestyle by Majid Al Futtaim, new community, villas (AED 5-40M), strong appreciation
- **Damac Hills**: Golf community, villas (AED 4-10M), townhouses (AED 2.5-4M), apartments (AED 1-2.5M)

## How You Should Respond:
1. When asked about budget, suggest specific areas and property types that match
2. Provide market insights — average prices, yields, appreciation trends
3. Compare areas objectively based on the buyer's needs
4. Flag off-market opportunities when relevant
5. Be specific with numbers — don't be vague
6. If someone has a request, suggest matching listings from our inventory
7. For investors: focus on yield, appreciation, and tenant demand
8. For end-users: focus on lifestyle, community, schools, and commute

## Market Context (2025-2026):
- Dubai real estate market remains strong with 10-15% annual appreciation in prime areas
- Palm Jumeirah continues to set price records
- Tilal Al Ghaf and similar lagoon communities are the fastest-growing segment
- Al Furjan offers the best value for first-time buyers near key infrastructure
- JGE and Damac Hills appeal to families seeking golf lifestyle
- Rental yields range from 4% (Palm) to 7% (Al Furjan apartments)
- Off-plan regulations require 20% construction before sales begin
- Transfer fee is 4% of property value (DLD)
- Agent commission standard: 2% sales, 5% annual rent

Keep responses concise, helpful, and actionable. Use bullet points for clarity. Always end with a specific recommendation or next step.
`

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { messages, listings } = await req.json()

  let systemPrompt = MARKETPLACE_SYSTEM_PROMPT

  if (listings && listings.length > 0) {
    systemPrompt += `\n\n## Current Marketplace Inventory:\n`
    for (const listing of listings) {
      systemPrompt += `
- **${listing.title}** (${listing.category})
  - Area: ${listing.area} | Type: ${listing.type} | ${listing.transactionType === "sale" ? "For Sale" : "For Rent"}
  - Price: AED ${listing.price.toLocaleString()} | Size: ${listing.size.toLocaleString()} sqft | ${listing.bedrooms}BR
  - AI Insight: ${listing.aiSummary}
  - Vacancy: ${listing.vacancy}
`
    }
  }

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages,
  })

  return result.toTextStreamResponse()
}
