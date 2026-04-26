import SwiftUI

struct MonthlyStats: Identifiable {
    let id = UUID()
    let month: String
    let commission: Double
    let deals: Int
}

@Observable @MainActor
final class PerformanceViewModel {
    private(set) var leaderboard: [LeaderboardEntry] = []
    private(set) var achievements: [Achievement] = []
    private(set) var monthlyStats: [MonthlyStats] = []
    var targets: [AgentTarget] = AgentTarget.defaults

    private(set) var isLoading = false
    private(set) var isSavingTargets = false
    var errorMessage: String?
    var leaderboardPeriod: Period = .monthly
    var achievementFilter: Achievement.Category? = nil

    private let api = APIClient.shared

    enum Period: String, CaseIterable {
        case weekly  = "Weekly"
        case monthly = "Monthly"
        case yearly  = "Yearly"
    }

    // MARK: - Load

    func load() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let response: PerformanceAPIResponse = try await api.get(Endpoint.performance)
            applyResponse(response)
        } catch {
            // Fall back to mock data so the UI is never empty
            if leaderboard.isEmpty { leaderboard = LeaderboardEntry.mock }
            if achievements.isEmpty { achievements = Achievement.mock }
            if monthlyStats.isEmpty { monthlyStats = MonthlyStats.mock }
        }
    }

    private func applyResponse(_ response: PerformanceAPIResponse) {
        let userID = Config.demoUserID

        // Leaderboard – re-computed when period picker changes
        leaderboard = response.leaderboard.map { $0.toLeaderboardEntry(currentUserID: userID, period: leaderboardPeriod) }

        // Achievements
        achievements = response.achievements.map { $0.toAchievement() }
        if achievements.isEmpty { achievements = Achievement.mock }

        // Monthly stats chart (commission + deals per month)
        monthlyStats = response.monthlyKPI.map { entry in
            MonthlyStats(month: entry.monthLabel,
                         commission: entry.commissionEarned ?? 0,
                         deals: entry.dealsClosed ?? 0)
        }
        if monthlyStats.isEmpty { monthlyStats = MonthlyStats.mock }

        // Targets – merge API targets with current month actuals
        let t = response.targets
        let c = response.currentMonth
        targets = [
            AgentTarget(id: "deals",
                        label: "Deals",        icon: "chart.line.uptrend.xyaxis",
                        current: c?.dealsClosed ?? AgentTarget.defaults[0].current,
                        target:  t?.dealsTarget ?? AgentTarget.defaults[0].target,
                        max: 15, unit: "deals",    colorName: "green"),
            AgentTarget(id: "commission",
                        label: "Commission",   icon: "banknote",
                        current: Int(c?.commissionEarned ?? Double(AgentTarget.defaults[1].current)),
                        target:  Int(t?.commissionTarget ?? Double(AgentTarget.defaults[1].target)),
                        max: 500_000, unit: "AED", colorName: "blue"),
            AgentTarget(id: "listings",
                        label: "Listings",     icon: "building.2",
                        current: c?.listingsCreated ?? AgentTarget.defaults[2].current,
                        target:  t?.listingsTarget ?? AgentTarget.defaults[2].target,
                        max: 30, unit: "listings", colorName: "purple"),
            AgentTarget(id: "viewings",
                        label: "Viewings",     icon: "eye",
                        current: c?.viewingsConducted ?? AgentTarget.defaults[3].current,
                        target:  t?.viewingsTarget ?? AgentTarget.defaults[3].target,
                        max: 60, unit: "viewings", colorName: "orange"),
        ]
    }

    // MARK: - Leaderboard period change

    func reloadLeaderboard() async {
        // Re-fetch so point totals reflect the selected period
        await load()
    }

    // MARK: - Save targets

    func saveTargets() async {
        isSavingTargets = true
        defer { isSavingTargets = false }

        guard let deals      = targets.first(where: { $0.id == "deals" }),
              let commission  = targets.first(where: { $0.id == "commission" }),
              let listings    = targets.first(where: { $0.id == "listings" }),
              let viewings    = targets.first(where: { $0.id == "viewings" }) else { return }

        let payload = UpdateTargetsPayload(
            dealsTarget:      deals.target,
            commissionTarget: Double(commission.target),
            listingsTarget:   listings.target,
            viewingsTarget:   viewings.target
        )

        struct TargetsEnvelope: Decodable { let targets: AgentTargetsAPI? }
        _ = try? await api.patch(Endpoint.performance, body: payload) as TargetsEnvelope
    }

    // MARK: - Computed

    var filteredAchievements: [Achievement] {
        guard let filter = achievementFilter else { return achievements }
        return achievements.filter { $0.category == filter }
    }

    var unlockedCount: Int { achievements.count(where: { $0.unlocked }) }
    var totalPoints:   Int { leaderboard.first(where: { $0.isCurrentUser })?.points ?? 0 }
    var currentRank:   Int { leaderboard.first(where: { $0.isCurrentUser })?.rank ?? 0 }
}

// MARK: - Static mock data (fallback / initial state)

extension LeaderboardEntry {
    static let mock: [LeaderboardEntry] = [
        LeaderboardEntry(id: "1", rank: 1, previousRank: 2, name: "Ahmed Al Maktoum",
                         initials: "AM", deals: 8, revenue: 15_200_000, commission: 456_000, streak: 12, points: 2450),
        LeaderboardEntry(id: "2", rank: 2, previousRank: 1, name: "Sarah Johnson",
                         initials: "SJ", deals: 6, revenue:  9_800_000, commission: 294_000, streak:  5, points: 1890),
        LeaderboardEntry(id: "3", rank: 3, previousRank: 3, name: "Mohammed Rashid",
                         initials: "MR", deals: 5, revenue:  8_500_000, commission: 255_000, streak:  8, points: 1650, isCurrentUser: true),
        LeaderboardEntry(id: "4", rank: 4, previousRank: 5, name: "Emma Williams",
                         initials: "EW", deals: 4, revenue:  6_250_000, commission: 187_500, streak:  3, points: 1320),
        LeaderboardEntry(id: "5", rank: 5, previousRank: 4, name: "Khalid Ibrahim",
                         initials: "KI", deals: 3, revenue:  4_800_000, commission: 144_000, streak:  1, points:  980),
    ]
}

extension Achievement {
    static let mock: [Achievement] = [
        Achievement(id: "1", name: "First Deal",      description: "Close your first real estate deal",
                    icon: "trophy.fill",    category: .milestone, rarity: .common,
                    unlocked: true,  progress: nil, maxProgress: nil, unlockedDate: "Jan 15, 2025"),
        Achievement(id: "2", name: "Million Maker",   description: "Close deals worth over 1M AED total",
                    icon: "diamond.fill",   category: .milestone, rarity: .rare,
                    unlocked: true,  progress: nil, maxProgress: nil, unlockedDate: "Jan 28, 2025"),
        Achievement(id: "3", name: "Hot Streak",      description: "Close deals 5 days in a row",
                    icon: "flame.fill",    category: .streak,    rarity: .rare,
                    unlocked: true,  progress: nil, maxProgress: nil, unlockedDate: "Feb 2, 2025"),
        Achievement(id: "4", name: "Speed Demon",     description: "Respond to 50 inquiries within 10 min",
                    icon: "bolt.fill",     category: .special,   rarity: .epic,
                    unlocked: false, progress: 38,  maxProgress: 50,  unlockedDate: nil),
        Achievement(id: "5", name: "Top Performer",   description: "Be #1 on the leaderboard for a month",
                    icon: "crown.fill",    category: .special,   rarity: .legendary,
                    unlocked: false, progress: 0,   maxProgress: 1,   unlockedDate: nil),
        Achievement(id: "6", name: "Network Builder", description: "Add 100 contacts to your CRM",
                    icon: "person.3.fill", category: .milestone, rarity: .common,
                    unlocked: false, progress: 67,  maxProgress: 100, unlockedDate: nil),
    ]
}

extension AgentTarget {
    static let defaults: [AgentTarget] = [
        AgentTarget(id: "deals",      label: "Deals",      icon: "chart.line.uptrend.xyaxis",
                    current: 3,       target: 5,       max: 15,      unit: "deals",    colorName: "green"),
        AgentTarget(id: "commission", label: "Commission", icon: "banknote",
                    current: 85_000,  target: 125_000, max: 500_000, unit: "AED",      colorName: "blue"),
        AgentTarget(id: "listings",   label: "Listings",   icon: "building.2",
                    current: 8,       target: 12,      max: 30,      unit: "listings", colorName: "purple"),
        AgentTarget(id: "viewings",   label: "Viewings",   icon: "eye",
                    current: 22,      target: 30,      max: 60,      unit: "viewings", colorName: "orange"),
    ]
}

extension MonthlyStats {
    static let mock: [MonthlyStats] = [
        MonthlyStats(month: "Oct", commission: 38_000,  deals: 1),
        MonthlyStats(month: "Nov", commission: 45_000,  deals: 1),
        MonthlyStats(month: "Dec", commission: 62_000,  deals: 2),
        MonthlyStats(month: "Jan", commission: 78_000,  deals: 2),
        MonthlyStats(month: "Feb", commission: 85_000,  deals: 3),
        MonthlyStats(month: "Mar", commission: 92_000,  deals: 4),
    ]
}
