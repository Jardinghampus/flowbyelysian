import SwiftUI
import SwiftData

@Observable @MainActor
final class MatchesViewModel {
    private(set) var matches: [PropertyMatch] = []
    private(set) var isLoading = false
    var errorMessage: String?
    var filterMinScore: Int = 40
    var dismissedIDs: Set<UUID> = []

    private let sync = SyncManager.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }

        let listings: [Listing]
        let requests: [ClientRequest]

        if isOnline {
            async let l = sync.fetchListings(context: context)
            async let r = sync.fetchRequests(context: context)
            listings = (try? await l) ?? sync.cachedListings(context: context)
            requests = (try? await r) ?? sync.cachedRequests(context: context)
        } else {
            listings = sync.cachedListings(context: context)
            requests = sync.cachedRequests(context: context)
        }

        matches = MatchEngine.run(listings: listings, requests: requests)
    }

    var filteredMatches: [PropertyMatch] {
        matches.filter { $0.score >= filterMinScore && !dismissedIDs.contains($0.id) }
    }

    func dismiss(_ match: PropertyMatch) {
        dismissedIDs.insert(match.id)
    }
}
