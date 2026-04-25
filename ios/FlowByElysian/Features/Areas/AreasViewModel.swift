import SwiftUI
import SwiftData

@Observable @MainActor
final class AreasViewModel {
    private(set) var areas: [Area] = []
    private(set) var isLoading = false
    var searchText = ""
    var errorMessage: String?

    private let api = APIClient.shared

    func load(isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }

        if isOnline {
            do {
                let response: AreasResponse = try await api.get(Endpoint.areas)
                areas = response.areas
            } catch {
                areas = Area.dubaiAreas
                errorMessage = nil  // silently fall back to static list
            }
        } else {
            areas = Area.dubaiAreas
        }
    }

    var filteredAreas: [Area] {
        guard !searchText.isEmpty else { return areas }
        return areas.filter { $0.name.localizedStandardContains(searchText) }
    }
}

@Observable @MainActor
final class AreaDetailViewModel {
    private(set) var area: Area?
    private(set) var listings: [Listing] = []
    private(set) var requests: [ClientRequest] = []
    private(set) var isLoading = false

    private let api = APIClient.shared

    func load(slug: String) async {
        isLoading = true
        defer { isLoading = false }

        do {
            let response: AreaDetailResponse = try await api.get(Endpoint.area(slug))
            area     = response.area
            listings = response.listings ?? []
            requests = response.requests ?? []
        } catch {
            // Keep whatever data is already loaded
        }
    }
}

struct AreaDetailResponse: Codable {
    let area: Area?
    let listings: [Listing]?
    let requests: [ClientRequest]?
    let marketData: AreaMarketData?
}

struct AreaMarketData: Codable {
    let avgPriceSqft: Double?
    let totalTransactions: Int?
    let avgRentYield: Double?
}
