import Foundation

// Port of the web app's AI matching algorithm from
// src/app/(dashboard)/inventory/components/ai-matching-dialog.tsx

enum MatchEngine {

    // Which areas are considered interchangeable alternatives
    private static let compatibility: [String: [String]] = [
        "Palm Jumeirah":      ["Emirates Hills", "JBR", "Dubai Marina"],
        "Emirates Hills":     ["Palm Jumeirah", "Jumeirah Golf Estates"],
        "Downtown Dubai":     ["Business Bay", "DIFC", "City Walk"],
        "Dubai Marina":       ["JBR", "Palm Jumeirah"],
        "JBR":                ["Dubai Marina", "Palm Jumeirah"],
        "Arabian Ranches":    ["Tilal Al Ghaf", "Dubai Hills Estate"],
        "Dubai Hills Estate": ["Arabian Ranches", "Tilal Al Ghaf"],
        "Business Bay":       ["Downtown Dubai", "DIFC"],
        "DIFC":               ["Downtown Dubai", "Business Bay"],
    ]

    static func run(listings: [Listing], requests: [ClientRequest]) -> [PropertyMatch] {
        var matches: [PropertyMatch] = []

        let stock = listings.filter { $0.inquiryType == "stock" || $0.inquiryType == nil }

        for listing in stock {
            for request in requests where request.status == "active" {
                let result = score(listing: listing, request: request)
                if result.score >= 40 {
                    matches.append(PropertyMatch(
                        stock: listing,
                        request: request,
                        score: result.score,
                        reasons: result.reasons
                    ))
                }
            }
        }

        return matches.sorted { $0.score > $1.score }
    }

    private static func score(listing: Listing, request: ClientRequest) -> (score: Int, reasons: [String]) {
        var score = 0
        var reasons: [String] = []

        // Type must match
        guard let lType = listing.type, let rType = request.propertyType,
              lType.lowercased() == rType.lowercased() else {
            return (0, [])
        }
        score += 30
        reasons.append("Property type matches: \(lType.capitalized)")

        // Price within budget
        if let lPrice = listing.price, let rBudget = request.budget, rBudget > 0 {
            let diff = abs(lPrice - Double(rBudget)) / Double(rBudget)
            if diff <= 0.10 {
                score += 25; reasons.append("Price within 10% of budget")
            } else if diff <= 0.20 {
                score += 15; reasons.append("Price within 20% of budget")
            } else if diff <= 0.30 {
                score += 5;  reasons.append("Price slightly above budget")
            }
        }

        // Area match
        let lArea = listing.areaName ?? ""
        let rArea = request.areaName ?? ""
        if !lArea.isEmpty && !rArea.isEmpty {
            if lArea == rArea {
                score += 25; reasons.append("Exact area match: \(lArea)")
            } else if compatibility[rArea]?.contains(lArea) == true {
                score += 15; reasons.append("Compatible area: \(lArea)")
            }
        }

        // Bedrooms
        if let lBeds = listing.bedrooms, let rBeds = request.bedrooms {
            if lBeds == rBeds {
                score += 15; reasons.append("\(lBeds) BR matches requirement")
            } else if abs(lBeds - rBeds) == 1 {
                score += 7; reasons.append("Close bedroom count (\(lBeds) vs \(rBeds) requested)")
            }
        }

        return (min(score, 100), reasons)
    }
}
