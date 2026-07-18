/**
 * Cheap stock↔request matcher.
 * Heuristic first (free). Optional gpt-4o-mini one-liners for top pairs only.
 */

export type MatchListing = {
  id: string
  title: string
  area_name: string | null
  type: string
  status: string
  inquiry_type: string
  transaction_type: string
  price: number
  bedrooms: number | null
  size: number | null
  owner_id: string
  owner_name: string | null
}

export type ScoredMatch = {
  stock: MatchListing
  request: MatchListing
  score: number
  reasons: string[]
}

function txCompatible(stockTx: string, requestTx: string) {
  return stockTx === requestTx
}

export function scoreStockRequest(stock: MatchListing, request: MatchListing): ScoredMatch | null {
  if (stock.inquiry_type === "request") return null
  if (request.inquiry_type !== "request") return null
  if (stock.owner_id === request.owner_id) return null // don't match own stock to own request
  if (!txCompatible(stock.transaction_type, request.transaction_type)) return null

  let score = 0
  const reasons: string[] = []

  if (stock.type && request.type && stock.type === request.type) {
    score += 30
    reasons.push(`Type: ${stock.type}`)
  } else if (stock.type && request.type) {
    return null
  }

  const stockArea = (stock.area_name || "").toLowerCase()
  const reqArea = (request.area_name || "").toLowerCase()
  if (stockArea && reqArea) {
    if (stockArea === reqArea) {
      score += 30
      reasons.push("Same area")
    } else if (stockArea.includes(reqArea) || reqArea.includes(stockArea)) {
      score += 18
      reasons.push("Related area")
    }
  }

  if (stock.bedrooms != null && request.bedrooms != null) {
    const bedDiff = Math.abs(stock.bedrooms - request.bedrooms)
    if (bedDiff === 0) {
      score += 20
      reasons.push(`${stock.bedrooms} BR`)
    } else if (bedDiff === 1) {
      score += 10
      reasons.push("Beds ±1")
    }
  }

  if (stock.price > 0 && request.price > 0) {
    const diff = Math.abs(stock.price - request.price) / request.price
    if (diff <= 0.1) {
      score += 20
      reasons.push("Price within 10%")
    } else if (diff <= 0.2) {
      score += 12
      reasons.push("Price within 20%")
    } else if (diff <= 0.35) {
      score += 5
      reasons.push("Price within 35%")
    }
  }

  if (score < 40) return null
  return { stock, request, score, reasons }
}

export function findMatches(listings: MatchListing[], limit = 40): ScoredMatch[] {
  const stock = listings.filter((l) => l.inquiry_type !== "request" && (l.status === "live" || l.status === "pocket"))
  const requests = listings.filter((l) => l.inquiry_type === "request")
  const out: ScoredMatch[] = []

  for (const s of stock) {
    for (const r of requests) {
      const m = scoreStockRequest(s, r)
      if (m) out.push(m)
    }
  }

  return out.sort((a, b) => b.score - a.score).slice(0, limit)
}

export async function summarizeMatchesWithOpenAI(
  matches: ScoredMatch[],
  apiKey: string
): Promise<Map<string, string>> {
  const summaries = new Map<string, string>()
  if (!apiKey || matches.length === 0) return summaries

  const top = matches.slice(0, 12)
  const payload = top.map((m, i) => ({
    i,
    stock: `${m.stock.bedrooms ?? "?"}BR ${m.stock.type} ${m.stock.area_name} AED ${m.stock.price} (${m.stock.status})`,
    request: `${m.request.bedrooms ?? "?"}BR ${m.request.type} ${m.request.area_name} budget AED ${m.request.price}`,
    score: m.score,
    reasons: m.reasons,
  }))

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You write ultra-short Dubai brokerage match notes. Reply with JSON array only: [{\"i\":0,\"summary\":\"...\"}]. Max 12 words per summary. No contact details.",
          },
          {
            role: "user",
            content: JSON.stringify(payload),
          },
        ],
      }),
    })

    if (!res.ok) return summaries
    const json = await res.json()
    const text = json.choices?.[0]?.message?.content || "[]"
    const start = text.indexOf("[")
    const end = text.lastIndexOf("]")
    if (start < 0 || end < 0) return summaries
    const parsed = JSON.parse(text.slice(start, end + 1)) as Array<{ i: number; summary: string }>
    for (const row of parsed) {
      const match = top[row.i]
      if (match && row.summary) {
        summaries.set(`${match.stock.id}:${match.request.id}`, String(row.summary).slice(0, 160))
      }
    }
  } catch {
    // Heuristic-only fallback is fine
  }

  return summaries
}
