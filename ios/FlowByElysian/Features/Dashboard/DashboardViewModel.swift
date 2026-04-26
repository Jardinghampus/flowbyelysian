import SwiftUI
import SwiftData

@Observable @MainActor
final class DashboardViewModel {
    private(set) var listings: [Listing] = []
    private(set) var requests: [ClientRequest] = []
    private(set) var notifications: [AppNotification] = []
    private(set) var tasks: [TaskItem] = []
    private(set) var isLoading = false

    private let sync = SyncManager.shared
    private let api  = APIClient.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }

        if isOnline {
            listings      = Array((try? await sync.fetchListings(context: context))?.prefix(6)      ?? [])
            requests      = Array((try? await sync.fetchRequests(context: context))?.prefix(5)      ?? [])
            notifications = Array((try? await sync.fetchNotifications(context: context))?.prefix(5) ?? [])
            let taskResp: TasksResponse? = try? await api.get(Endpoint.tasks)
            tasks = Array((taskResp?.tasks ?? taskResp?.data ?? [])
                .filter { $0.status == .todo || $0.status == .inProgress }
                .prefix(5))
        } else {
            listings      = Array(sync.cachedListings(context: context).prefix(6))
            requests      = Array(sync.cachedRequests(context: context).prefix(5))
            notifications = Array(sync.cachedNotifications(context: context).prefix(5))
            tasks         = (try? context.fetch(FetchDescriptor<CachedTask>()))?.compactMap { t -> TaskItem? in
                let item = t.toTaskItem()
                return (item.status == .todo || item.status == .inProgress) ? item : nil
            }.prefix(5).map { $0 } ?? []
        }
    }

    var liveListings:   Int    { listings.count(where: { $0.status == "live" }) }
    var activeRequests: Int    { requests.count(where: { $0.status == "active" }) }
    var unreadCount:    Int    { notifications.count(where: { $0.isUnread }) }
    var totalValue:     Double { listings.compactMap(\.price).reduce(0, +) }

    func updateWidget(calendarEvents: [WidgetEvent]) {
        let matchCount = MatchEngine.run(listings: listings, requests: requests).count
        let commission = AgentTarget.defaults.first { $0.id == "commission" }
        var data = WidgetData()
        data.upcomingEvents = calendarEvents
        data.matchCount = matchCount
        data.liveListingsCount = liveListings
        data.commissionCurrent = commission?.current ?? 0
        data.commissionTarget  = commission?.target  ?? 125_000
        data.currentRank = 3
        WidgetDataStore.shared.save(data)
    }
}
