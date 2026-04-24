import SwiftUI
import SwiftData

@Observable @MainActor
final class ReportsViewModel {
    private(set) var listings: [Listing] = []
    private(set) var requests: [ClientRequest] = []
    private(set) var isLoading = false
    private(set) var generatedPDF: Data?
    var isGenerating = false

    private let sync = SyncManager.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }

        if isOnline {
            async let l = sync.fetchListings(context: context)
            async let r = sync.fetchRequests(context: context)
            listings = (try? await l) ?? sync.cachedListings(context: context)
            requests = (try? await r) ?? sync.cachedRequests(context: context)
        } else {
            listings = sync.cachedListings(context: context)
            requests = sync.cachedRequests(context: context)
        }
    }

    func generateLandlordReport(agentName: String) async -> Data {
        isGenerating = true
        defer { isGenerating = false }
        return await Task.detached(priority: .userInitiated) {
            PDFGenerator.landlordReport(listings: self.listings, agentName: agentName)
        }.value
    }

    func generateInventoryReport(agentName: String) async -> Data {
        isGenerating = true
        defer { isGenerating = false }
        return await Task.detached(priority: .userInitiated) {
            PDFGenerator.inventoryReport(listings: self.listings, agentName: agentName)
        }.value
    }

    func generatePerformanceReport(agentName: String) async -> Data {
        isGenerating = true
        defer { isGenerating = false }
        return await Task.detached(priority: .userInitiated) {
            PDFGenerator.performanceReport(
                listings: self.listings,
                requests: self.requests,
                agentName: agentName
            )
        }.value
    }
}
