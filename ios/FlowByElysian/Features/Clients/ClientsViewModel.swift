import SwiftUI
import SwiftData

@Observable @MainActor
final class ClientsViewModel {
    private(set) var requests: [ClientRequest] = []
    private(set) var contacts: [Contact] = []
    private(set) var isLoading = false
    var searchText = ""
    var filterStatus = ""
    var selectedSegment = 0  // 0 = Requests, 1 = Contacts

    private let sync = SyncManager.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }

        if isOnline {
            async let r = sync.fetchRequests(context: context)
            async let c = sync.fetchContacts(context: context)
            requests = (try? await r) ?? sync.cachedRequests(context: context)
            contacts = (try? await c) ?? sync.cachedContacts(context: context)
        } else {
            requests = sync.cachedRequests(context: context)
            contacts = sync.cachedContacts(context: context)
        }
    }

    var filteredRequests: [ClientRequest] {
        requests.filter { req in
            let statusMatch = filterStatus.isEmpty || req.status == filterStatus
            let searchMatch = searchText.isEmpty || req.clientName.lowercased().contains(searchText.lowercased())
            return statusMatch && searchMatch
        }
    }

    var filteredContacts: [Contact] {
        guard !searchText.isEmpty else { return contacts }
        let q = searchText.lowercased()
        return contacts.filter {
            $0.name.lowercased().contains(q) ||
            ($0.email?.lowercased().contains(q) == true)
        }
    }
}
