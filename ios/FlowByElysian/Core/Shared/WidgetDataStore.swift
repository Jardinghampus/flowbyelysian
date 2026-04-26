import Foundation
import WidgetKit

// Shared between main app and widget extension via App Group UserDefaults.
// Main app writes here after loading data; widget reads in its timeline provider.

struct WidgetData: Codable {
    var upcomingEvents: [WidgetEvent] = []
    var matchCount: Int = 0
    var liveListingsCount: Int = 0
    var commissionCurrent: Int = 0
    var commissionTarget: Int = 125_000
    var currentRank: Int = 0
    var updatedAt: Date = .now

    var commissionFraction: Double {
        guard commissionTarget > 0 else { return 0 }
        return min(Double(commissionCurrent) / Double(commissionTarget), 1)
    }

    var commissionPercent: Int { Int(commissionFraction * 100) }
}

struct WidgetEvent: Codable, Identifiable {
    let id: String
    let title: String
    let startDate: Date
    let location: String?
    let isAllDay: Bool

    var timeString: String {
        if isAllDay { return "All day" }
        return startDate.formatted(.dateTime.hour().minute())
    }

    var dayString: String {
        if Calendar.current.isDateInToday(startDate)    { return "Today" }
        if Calendar.current.isDateInTomorrow(startDate) { return "Tomorrow" }
        return startDate.formatted(.dateTime.weekday(.wide))
    }
}

// MARK: - Store

final class WidgetDataStore: @unchecked Sendable {
    static let shared = WidgetDataStore()

    private let appGroupID = "group.com.flowbyelysian.app"
    private let storageKey = "flowWidgetData"

    private init() {}

    func save(_ data: WidgetData) {
        guard let defaults = UserDefaults(suiteName: appGroupID),
              let encoded = try? JSONEncoder().encode(data) else { return }
        defaults.set(encoded, forKey: storageKey)
        WidgetCenter.shared.reloadAllTimelines()
    }

    func load() -> WidgetData {
        guard let defaults = UserDefaults(suiteName: appGroupID),
              let raw = defaults.data(forKey: storageKey),
              let data = try? JSONDecoder().decode(WidgetData.self, from: raw) else {
            return WidgetData()
        }
        return data
    }
}
