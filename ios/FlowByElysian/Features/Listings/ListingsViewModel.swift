import SwiftUI
import SwiftData

@Observable @MainActor
final class ListingsViewModel {
    private(set) var listings: [Listing] = []
    private(set) var isLoading = false
    var searchText = ""
    var filterStatus = ""
    var filterType = ""

    private let sync = SyncManager.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }

        if isOnline {
            var query: [String: String] = [:]
            if !filterStatus.isEmpty { query["status"] = filterStatus }
            if !filterType.isEmpty   { query["type"]   = filterType }
            listings = (try? await sync.fetchListings(context: context, query: query))
                ?? sync.cachedListings(context: context)
        } else {
            listings = sync.cachedListings(context: context)
        }
    }

    var filtered: [Listing] {
        guard !searchText.isEmpty else { return listings }
        let q = searchText.lowercased()
        return listings.filter {
            $0.title.lowercased().contains(q) ||
            ($0.type?.lowercased().contains(q) == true) ||
            ($0.areaId?.lowercased().contains(q) == true)
        }
    }
}
