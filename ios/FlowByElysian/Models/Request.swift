import SwiftData
import Foundation

struct ClientRequest: Codable, Identifiable, Hashable {
    let id: String
    let clientName: String
    let budget: Double?
    let propertyType: String?
    let bedrooms: Int?
    let areaId: String?
    let agentId: String?
    let agentName: String?
    let status: String?   // active/matched/closed
    let notes: String?
    let createdAt: String?

    // Joined area data
    let areas: AreaRef?

    var budgetFormatted: String {
        guard let budget else { return "Budget ej angiven" }
        return budget.formatted(.currency(code: "AED").precision(.fractionLength(0)))
    }

    var areaName: String? { areas?.name ?? areaId }
}

struct AreaRef: Codable, Hashable {
    let name: String?
    let slug: String?
}

struct RequestsResponse: Codable {
    let requests: [ClientRequest]?
    let data: [ClientRequest]?
}

struct NewRequestPayload: Encodable {
    let clientName: String
    let budget: Int?
    let propertyType: String?
    let bedrooms: Int?
    let areaId: String?
    let status: String
    let notes: String?
}

struct SingleRequestResponse: Codable {
    let request: ClientRequest
}

@Model
final class CachedRequest {
    var id: String
    var clientName: String
    var budget: Double
    var propertyType: String?
    var bedrooms: Int
    var areaId: String?
    var status: String?
    var notes: String?
    var cachedAt: Date

    init(from r: ClientRequest) {
        id           = r.id
        clientName   = r.clientName
        budget       = r.budget ?? 0
        propertyType = r.propertyType
        bedrooms     = r.bedrooms ?? 0
        areaId       = r.areaId
        status       = r.status
        notes        = r.notes
        cachedAt     = .now
    }

    func toRequest() -> ClientRequest {
        ClientRequest(id: id, clientName: clientName, budget: budget,
                      propertyType: propertyType, bedrooms: bedrooms,
                      areaId: areaId, agentId: nil, agentName: nil,
                      status: status, notes: notes, createdAt: nil, areas: nil)
    }
}
