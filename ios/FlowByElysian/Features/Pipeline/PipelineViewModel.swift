import SwiftUI
import SwiftData

@Observable @MainActor
final class PipelineViewModel {
    enum Column: CaseIterable, Hashable {
        case active, matched, closed

        var title: String {
            switch self {
            case .active:  "Active"
            case .matched: "Matched"
            case .closed:  "Closed"
            }
        }

        var status: String {
            switch self {
            case .active:  "active"
            case .matched: "matched"
            case .closed:  "closed"
            }
        }

        var tint: Color {
            switch self {
            case .active:  Color.zGreen
            case .matched: Color.zBlue
            case .closed:  Color.gray
            }
        }
    }

    private(set) var allRequests: [ClientRequest] = []
    private(set) var isLoading = false

    private let sync = SyncManager.shared
    private let api  = APIClient.shared

    func requests(for column: Column) -> [ClientRequest] {
        allRequests.filter { $0.status == column.status }
    }

    func load(context: ModelContext) async {
        isLoading = true
        defer { isLoading = false }
        allRequests = (try? await sync.fetchRequests(context: context)) ?? sync.cachedRequests(context: context)
    }

    func move(_ request: ClientRequest, to column: Column, context: ModelContext) async {
        await moveToStatus(request, status: column.status, context: context)
    }

    func moveToStatus(_ request: ClientRequest, status: String, context: ModelContext) async {
        // Optimistic update
        if let idx = allRequests.firstIndex(where: { $0.id == request.id }) {
            let updated = ClientRequest(
                id: request.id, clientName: request.clientName,
                budget: request.budget, propertyType: request.propertyType,
                bedrooms: request.bedrooms, areaId: request.areaId,
                agentId: request.agentId, agentName: request.agentName,
                status: status, notes: request.notes,
                createdAt: request.createdAt, areas: request.areas
            )
            allRequests[idx] = updated
        }

        struct StatusPayload: Encodable { let status: String }
        try? await api.patchVoid(Endpoint.request(request.id), body: StatusPayload(status: status))
    }
}
