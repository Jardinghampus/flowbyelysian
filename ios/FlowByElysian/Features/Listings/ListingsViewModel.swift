import SwiftUI
import SwiftData

@Observable @MainActor
final class ListingsViewModel {
    private(set) var listings: [Listing] = []
    private(set) var isLoading = false
    var errorMessage: String?
    var searchText = ""
    var filterStatus = ""
    var filterType = ""

    private let sync = SyncManager.shared
    private let api  = APIClient.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        if isOnline {
            var query: [String: String] = [:]
            if !filterStatus.isEmpty { query["status"] = filterStatus }
            if !filterType.isEmpty   { query["type"]   = filterType }
            do {
                listings = try await sync.fetchListings(context: context, query: query)
            } catch {
                errorMessage = error.localizedDescription
                listings = sync.cachedListings(context: context)
            }
        } else {
            listings = sync.cachedListings(context: context)
        }
    }

    func createListing(_ payload: NewListingPayload, context: ModelContext) async throws {
        let response: SingleListingResponse = try await api.post(Endpoint.listings, body: payload)
        listings.insert(response.listing, at: 0)
        context.insert(CachedListing(from: response.listing))
        try? context.save()
    }

    func updateListing(id: String, payload: NewListingPayload, context: ModelContext) async throws {
        let response: SingleListingResponse = try await api.patch(Endpoint.listing(id), body: payload)
        if let idx = listings.firstIndex(where: { $0.id == id }) {
            listings[idx] = response.listing
        }
    }

    func deleteListing(id: String, context: ModelContext) async throws {
        try await api.delete(Endpoint.listing(id))
        listings.removeAll { $0.id == id }
        if let cached = try? context.fetch(FetchDescriptor<CachedListing>())
                                     .first(where: { $0.id == id }) {
            context.delete(cached)
            try? context.save()
        }
    }

    var filtered: [Listing] {
        guard !searchText.isEmpty else { return listings }
        return listings.filter {
            $0.title.localizedStandardContains(searchText) ||
            ($0.type?.localizedStandardContains(searchText) == true) ||
            ($0.areaName?.localizedStandardContains(searchText) == true)
        }
    }
}
