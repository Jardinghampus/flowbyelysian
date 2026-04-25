import Foundation

// MARK: - Leaderboard

struct LeaderboardEntry: Identifiable {
    let id: String
    let rank: Int
    let previousRank: Int
    let name: String
    let initials: String
    let deals: Int
    let revenue: Double
    let commission: Double
    let streak: Int
    let points: Int
    var isCurrentUser: Bool = false

    var rankChange: Int { previousRank - rank }
}

// MARK: - Achievements

struct Achievement: Identifiable {
    let id: String
    let name: String
    let description: String
    let icon: String        // SF Symbol name
    let category: Category
    let rarity: Rarity
    let unlocked: Bool
    let progress: Int?
    let maxProgress: Int?
    let unlockedDate: String?

    enum Category: String, CaseIterable { case sales, streak, milestone, special }
    enum Rarity: String { case common, rare, epic, legendary }

    var rarityColor: String {
        switch rarity {
        case .common:    return "secondary"
        case .rare:      return "blue"
        case .epic:      return "purple"
        case .legendary: return "yellow"
        }
    }

    var progressFraction: Double {
        guard let p = progress, let m = maxProgress, m > 0 else { return unlocked ? 1 : 0 }
        return min(Double(p) / Double(m), 1)
    }
}

// MARK: - Personal Targets

struct AgentTarget: Identifiable {
    let id: String
    let label: String
    let icon: String        // SF Symbol name
    let current: Int
    var target: Int
    let max: Int
    let unit: String
    let colorName: String

    var progressFraction: Double { min(Double(current) / max(Double(target), 1), 1) }
    var percentComplete: Int { Int(progressFraction * 100) }
}

// MARK: - News

struct NewsArticle: Codable, Identifiable {
    var id: String { url }
    let title: String
    let description: String?
    let url: String
    let urlToImage: String?
    let publishedAt: String?
    let source: NewsSource?

    var relativeDate: String? {
        guard let publishedAt else { return nil }
        let fmt = ISO8601DateFormatter()
        fmt.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let date = fmt.date(from: publishedAt)
            ?? ISO8601DateFormatter().date(from: publishedAt)
        return date?.formatted(.relative(presentation: .named))
    }
}

struct NewsSource: Codable {
    let name: String?
}

struct NewsResponse: Codable {
    let articles: [NewsArticle]?
    let totalResults: Int?
}

// MARK: - Property Match

struct PropertyMatch: Identifiable {
    let id = UUID()
    let stock: Listing
    let request: ClientRequest
    let score: Int
    let reasons: [String]

    var label: String { "\(stock.title) ↔ \(request.clientName)" }
}
