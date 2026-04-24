import SwiftData
import Foundation

struct ClientRequest: Codable, Identifiable {
    let id: String
    let clientName: String
    let budget: Double?
    let propertyType: String?
    let bedrooms: Int?
    let areaId: String?
    let agentId: String?
    let status: String?
    let notes: String?
    let createdAt: String?

    var budgetFormatted: String {
        guard let budget else { return "Budget ej angiven" }
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "AED"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: budget)) ?? "AED \(Int(budget))"
    }
}

struct RequestsResponse: Codable {
    let requests: [ClientRequest]?
    let data: [ClientRequest]?
}

@Model
final class CachedRequest {
    var id: String
    var clientName: String
    var budget: Double
    var propertyType: String?
    var bedrooms: Int
    var areaId: String?
    var agentId: String?
    var status: String?
    var notes: String?
    var cachedAt: Date

    init(from request: ClientRequest) {
        self.id = request.id
        self.clientName = request.clientName
        self.budget = request.budget ?? 0
        self.propertyType = request.propertyType
        self.bedrooms = request.bedrooms ?? 0
        self.areaId = request.areaId
        self.agentId = request.agentId
        self.status = request.status
        self.notes = request.notes
        self.cachedAt = Date()
    }

    func toRequest() -> ClientRequest {
        ClientRequest(id: id, clientName: clientName, budget: budget,
                      propertyType: propertyType, bedrooms: bedrooms,
                      areaId: areaId, agentId: agentId, status: status, notes: notes, createdAt: nil)
    }
}
