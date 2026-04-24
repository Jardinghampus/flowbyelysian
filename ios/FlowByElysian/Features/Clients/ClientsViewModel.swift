import SwiftUI
import SwiftData

@Observable @MainActor
final class ClientsViewModel {
    private(set) var requests: [ClientRequest] = []
    private(set) var contacts: [Contact] = []
    private(set) var isLoading = false
    var errorMessage: String?
    var searchText = ""
    var filterStatus = ""
    var selectedSegment = 0

    private let sync = SyncManager.shared
    private let api  = APIClient.shared

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

    // MARK: Requests CRUD

    func createRequest(_ payload: NewRequestPayload, context: ModelContext) async throws {
        let response: SingleRequestResponse = try await api.post(Endpoint.requests, body: payload)
        requests.insert(response.request, at: 0)
        context.insert(CachedRequest(from: response.request))
        try? context.save()
    }

    func updateRequestStatus(id: String, status: String) async throws {
        struct Patch: Encodable { let status: String }
        let response: SingleRequestResponse = try await api.patch(Endpoint.request(id), body: Patch(status: status))
        if let idx = requests.firstIndex(where: { $0.id == id }) {
            requests[idx] = response.request
        }
    }

    func deleteRequest(id: String, context: ModelContext) async throws {
        try await api.delete(Endpoint.request(id))
        requests.removeAll { $0.id == id }
        if let cached = try? context.fetch(FetchDescriptor<CachedRequest>())
                                     .first(where: { $0.id == id }) {
            context.delete(cached)
            try? context.save()
        }
    }

    // MARK: Contacts CRUD

    func createContact(_ payload: NewContactPayload, context: ModelContext) async throws {
        let response: SingleContactResponse = try await api.post(Endpoint.contacts, body: payload)
        contacts.insert(response.contact, at: 0)
        context.insert(CachedContact(from: response.contact))
        try? context.save()
    }

    func deleteContact(id: String, context: ModelContext) async throws {
        try await api.delete(Endpoint.contact(id))
        contacts.removeAll { $0.id == id }
        if let cached = try? context.fetch(FetchDescriptor<CachedContact>())
                                     .first(where: { $0.id == id }) {
            context.delete(cached)
            try? context.save()
        }
    }

    // MARK: Filtered results

    var filteredRequests: [ClientRequest] {
        requests.filter { req in
            (filterStatus.isEmpty || req.status == filterStatus) &&
            (searchText.isEmpty   || req.clientName.localizedStandardContains(searchText))
        }
    }

    var filteredContacts: [Contact] {
        guard !searchText.isEmpty else { return contacts }
        return contacts.filter {
            $0.name.localizedStandardContains(searchText) ||
            ($0.email?.localizedStandardContains(searchText) == true)
        }
    }
}
