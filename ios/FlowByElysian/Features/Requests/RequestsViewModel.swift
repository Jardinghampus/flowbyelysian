import SwiftData
import Foundation

@MainActor
final class RequestsViewModel: ObservableObject {
    @Published var requests: [ClientRequest] = []
    @Published var isLoading = false
    @Published var filterStatus = ""
    @Published var searchText = ""

    private let sync = SyncManager.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }
        if isOnline {
            requests = (try? await sync.fetchRequests(context: context)) ?? sync.cachedRequests(context: context)
        } else {
            requests = sync.cachedRequests(context: context)
        }
    }

    var filtered: [ClientRequest] {
        requests.filter { req in
            let matchStatus = filterStatus.isEmpty || req.status == filterStatus
            let matchSearch = searchText.isEmpty || req.clientName.localizedCaseInsensitiveContains(searchText)
            return matchStatus && matchSearch
        }
    }
}
