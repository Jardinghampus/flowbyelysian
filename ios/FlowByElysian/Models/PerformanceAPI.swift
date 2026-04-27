import Foundation

// Codable types that mirror the /api/performance JSON response.
// PerformanceViewModel maps these to the existing view-model types.

struct PerformanceAPIResponse: Codable {
    let leaderboard:  [LeaderboardAPIEntry]
    let achievements: [AchievementAPIEntry]
    let targets:      AgentTargetsAPI?
    let currentMonth: CurrentMonthAPI?
    let monthlyKPI:   [MonthlyKPIAPIEntry]
}

struct LeaderboardAPIEntry: Codable {
    let agentId:       String
    let name:          String?
    let rank:          Int
    let points:        Int?
    let monthlyPoints: Int?
    let weeklyPoints:  Int?
    let yearlyPoints:  Int?
    let streakDays:    Int?

    func toLeaderboardEntry(currentUserID: String, period: PerformanceViewModel.Period) -> LeaderboardEntry {
        let nameStr   = name ?? "Agent"
        let parts     = nameStr.components(separatedBy: " ")
        let initials  = parts.prefix(2).compactMap(\.first).map(String.init).joined()
        let pts: Int  = switch period {
        case .weekly:  weeklyPoints  ?? points ?? 0
        case .monthly: monthlyPoints ?? points ?? 0
        case .yearly:  yearlyPoints  ?? points ?? 0
        }
        return LeaderboardEntry(
            id: agentId, rank: rank, previousRank: rank,
            name: nameStr, initials: initials,
            deals: 0, revenue: 0, commission: 0,
            streak: streakDays ?? 0, points: pts,
            isCurrentUser: agentId == currentUserID
        )
    }
}

struct AchievementAPIEntry: Codable, Identifiable {
    let id:          String
    let name:        String?
    let description: String?
    let category:    String?
    let rarity:      String?
    let icon:        String?
    let unlocked:    Bool
    let progress:    Int?
    let maxProgress: Int?
    let unlockedAt:  String?

    func toAchievement() -> Achievement {
        Achievement(
            id: id,
            name: name ?? "Achievement",
            description: description ?? "",
            icon: sfSymbol(for: icon ?? "star"),
            category: Achievement.Category(rawValue: category ?? "milestone") ?? .milestone,
            rarity:   Achievement.Rarity(rawValue:   rarity   ?? "common")   ?? .common,
            unlocked: unlocked,
            progress: progress,
            maxProgress: maxProgress,
            unlockedDate: unlockedAt
        )
    }

    private func sfSymbol(for icon: String) -> String {
        switch icon {
        case "trophy":      return "trophy.fill"
        case "gem",
             "diamond":     return "diamond.fill"
        case "flame",
             "fire":        return "flame.fill"
        case "zap":         return "bolt.fill"
        case "crown":       return "crown.fill"
        case "users":       return "person.3.fill"
        case "target":      return "target"
        case "trending-up": return "chart.line.uptrend.xyaxis"
        case "clock":       return "clock.fill"
        case "star":        return "star.fill"
        case "key":         return "key.fill"
        case "layers":      return "square.3.layers.3d"
        case "shield":      return "shield.fill"
        default:            return "star.fill"
        }
    }
}

struct AgentTargetsAPI: Codable {
    let dealsTarget:      Int?
    let commissionTarget: Double?
    let listingsTarget:   Int?
    let viewingsTarget:   Int?
}

struct CurrentMonthAPI: Codable {
    let dealsClosed:       Int?
    let commissionEarned:  Double?
    let listingsCreated:   Int?
    let viewingsConducted: Int?
}

struct MonthlyKPIAPIEntry: Codable {
    let year:              Int
    let month:             Int
    let dealsClosed:       Int?
    let commissionEarned:  Double?
    let viewingsConducted: Int?
    let listingsCreated:   Int?

    private static let monthAbbreviations = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ]

    var monthLabel: String {
        guard month >= 1, month <= 12 else { return "\(month)" }
        return Self.monthAbbreviations[month - 1]
    }
}

// Payload for PATCH /api/performance
struct UpdateTargetsPayload: Encodable {
    let dealsTarget:      Int
    let commissionTarget: Double
    let listingsTarget:   Int
    let viewingsTarget:   Int
}
