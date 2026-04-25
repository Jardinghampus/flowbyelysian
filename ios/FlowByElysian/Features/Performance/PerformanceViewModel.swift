import SwiftUI

@Observable @MainActor
final class PerformanceViewModel {
    // Targets (editable)
    var targets: [AgentTarget] = AgentTarget.defaults

    // These are loaded from DashboardViewModel in real usage;
    // here we keep mock data matching the web app
    private(set) var leaderboard: [LeaderboardEntry] = LeaderboardEntry.mock
    private(set) var achievements: [Achievement] = Achievement.mock
    var leaderboardPeriod: Period = .monthly
    var achievementFilter: Achievement.Category? = nil
    private(set) var isSavingTargets = false
    var errorMessage: String?

    enum Period: String, CaseIterable {
        case weekly = "Vecka"
        case monthly = "Månad"
        case yearly = "År"
    }

    func saveTargets() async {
        isSavingTargets = true
        defer { isSavingTargets = false }
        // POST /api/performance/targets in production
        try? await Task.sleep(for: .milliseconds(600))
    }

    var filteredAchievements: [Achievement] {
        guard let filter = achievementFilter else { return achievements }
        return achievements.filter { $0.category == filter }
    }

    var unlockedCount: Int { achievements.count(where: { $0.unlocked }) }
    var totalPoints: Int { leaderboard.first(where: { $0.isCurrentUser })?.points ?? 0 }
    var currentRank: Int { leaderboard.first(where: { $0.isCurrentUser })?.rank ?? 0 }
}

// MARK: - Mock data matching web app

extension LeaderboardEntry {
    static let mock: [LeaderboardEntry] = [
        LeaderboardEntry(id: "1", rank: 1, previousRank: 2, name: "Ahmed Al Maktoum",
                         initials: "AM", deals: 8, revenue: 15_200_000, commission: 456_000, streak: 12, points: 2450),
        LeaderboardEntry(id: "2", rank: 2, previousRank: 1, name: "Sarah Johnson",
                         initials: "SJ", deals: 6, revenue: 9_800_000, commission: 294_000, streak: 5, points: 1890),
        LeaderboardEntry(id: "3", rank: 3, previousRank: 3, name: "Mohammed Rashid",
                         initials: "MR", deals: 5, revenue: 8_500_000, commission: 255_000, streak: 8, points: 1650, isCurrentUser: true),
        LeaderboardEntry(id: "4", rank: 4, previousRank: 5, name: "Emma Williams",
                         initials: "EW", deals: 4, revenue: 6_250_000, commission: 187_500, streak: 3, points: 1320),
        LeaderboardEntry(id: "5", rank: 5, previousRank: 4, name: "Khalid Ibrahim",
                         initials: "KI", deals: 3, revenue: 4_800_000, commission: 144_000, streak: 1, points: 980),
    ]
}

extension Achievement {
    static let mock: [Achievement] = [
        Achievement(id: "1", name: "Första affären", description: "Stäng din första affär",
                    icon: "trophy.fill", category: .milestone, rarity: .common,
                    unlocked: true, progress: nil, maxProgress: nil, unlockedDate: "15 jan 2025"),
        Achievement(id: "2", name: "Miljonmakaren", description: "Stäng affärer värda 1M AED totalt",
                    icon: "diamond.fill", category: .milestone, rarity: .rare,
                    unlocked: true, progress: nil, maxProgress: nil, unlockedDate: "28 jan 2025"),
        Achievement(id: "3", name: "Hetstreck", description: "Stäng affärer 5 dagar i rad",
                    icon: "flame.fill", category: .streak, rarity: .rare,
                    unlocked: true, progress: nil, maxProgress: nil, unlockedDate: "2 feb 2025"),
        Achievement(id: "4", name: "Speed Demon", description: "Svara på 50 förfrågningar inom 10 min",
                    icon: "bolt.fill", category: .special, rarity: .epic,
                    unlocked: false, progress: 38, maxProgress: 50, unlockedDate: nil),
        Achievement(id: "5", name: "Toppresterare", description: "Var #1 på listan en hel månad",
                    icon: "crown.fill", category: .special, rarity: .legendary,
                    unlocked: false, progress: 0, maxProgress: 1, unlockedDate: nil),
        Achievement(id: "6", name: "Nätverkare", description: "Lägg till 100 kontakter",
                    icon: "person.3.fill", category: .milestone, rarity: .common,
                    unlocked: false, progress: 67, maxProgress: 100, unlockedDate: nil),
        Achievement(id: "7", name: "Listningsledaren", description: "Ha 20 aktiva listings samtidigt",
                    icon: "building.2.fill", category: .sales, rarity: .rare,
                    unlocked: false, progress: 14, maxProgress: 20, unlockedDate: nil),
        Achievement(id: "8", name: "Iron Streak", description: "30 dagars aktivitet i rad",
                    icon: "shield.fill", category: .streak, rarity: .epic,
                    unlocked: false, progress: 12, maxProgress: 30, unlockedDate: nil),
    ]
}

extension AgentTarget {
    static let defaults: [AgentTarget] = [
        AgentTarget(id: "deals",      label: "Affärer",    icon: "chart.line.uptrend.xyaxis",
                    current: 3,  target: 5,   max: 15,     unit: "affärer",    colorName: "green"),
        AgentTarget(id: "commission", label: "Provision",  icon: "banknote",
                    current: 85_000, target: 125_000, max: 500_000, unit: "AED", colorName: "blue"),
        AgentTarget(id: "listings",   label: "Listings",   icon: "building.2",
                    current: 8,  target: 12,  max: 30,     unit: "listings",   colorName: "purple"),
        AgentTarget(id: "viewings",   label: "Visningar",  icon: "eye",
                    current: 22, target: 30,  max: 60,     unit: "visningar",  colorName: "orange"),
    ]
}
