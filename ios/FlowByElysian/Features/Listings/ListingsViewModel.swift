import SwiftData
import Foundation

@MainActor
final class ListingsViewModel: ObservableObject {
    @Published var listings: [Listing] = []
    @Published var isLoading = false
    @Published var error: String?
    @Published var searchText = ""
    @Published var filterStatus = ""
    @Published var filterType = ""

    private let sync = SyncManager.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }
        error = nil

        if isOnline {
            do {
                var query: [String: String] = [:]
                if !filterStatus.isEmpty { query["status"] = filterStatus }
                if !filterType.isEmpty { query["type"] = filterType }
                listings = try await sync.fetchListings(context: context, query: query)
            } catch {
                self.error = error.localizedDescription
                listings = sync.cachedListings(context: context)
            }
        } else {
            listings = sync.cachedListings(context: context)
        }
    }

    var filtered: [Listing] {
        guard !searchText.isEmpty else { return listings }
        return listings.filter {
            $0.title.localizedCaseInsensitiveContains(searchText) ||
            ($0.type?.localizedCaseInsensitiveContains(searchText) == true)
        }
    }
}
