import SwiftData
import Foundation

/// Hanterar synk mellan API och lokal SwiftData-cache.
/// Används i alla ViewModels: om online → hämta + cacha, om offline → läs cache.
@MainActor
final class SyncManager {
    static let shared = SyncManager()
    private let api = APIClient.shared

    private init() {}

    // MARK: Listings

    func fetchListings(context: ModelContext, query: [String: String] = [:]) async throws -> [Listing] {
        let response: ListingsResponse = try await api.get(Endpoint.listings, query: query)
        let listings = response.listings ?? response.data ?? []
        cacheListings(listings, context: context)
        return listings
    }

    func cachedListings(context: ModelContext) -> [Listing] {
        let cached = (try? context.fetch(FetchDescriptor<CachedListing>())) ?? []
        return cached.map { $0.toListing() }
    }

    // MARK: Contacts

    func fetchContacts(context: ModelContext) async throws -> [Contact] {
        let response: ContactsResponse = try await api.get(Endpoint.contacts)
        let contacts = response.contacts ?? response.data ?? []
        cacheContacts(contacts, context: context)
        return contacts
    }

    func cachedContacts(context: ModelContext) -> [Contact] {
        let cached = (try? context.fetch(FetchDescriptor<CachedContact>())) ?? []
        return cached.map { $0.toContact() }
    }

    // MARK: Requests

    func fetchRequests(context: ModelContext) async throws -> [ClientRequest] {
        let response: RequestsResponse = try await api.get(Endpoint.requests)
        let requests = response.requests ?? response.data ?? []
        cacheRequests(requests, context: context)
        return requests
    }

    func cachedRequests(context: ModelContext) -> [ClientRequest] {
        let cached = (try? context.fetch(FetchDescriptor<CachedRequest>())) ?? []
        return cached.map { $0.toRequest() }
    }

    // MARK: Notifications

    func fetchNotifications(context: ModelContext) async throws -> [AppNotification] {
        let response: NotificationsResponse = try await api.get(Endpoint.notifications)
        let notifications = response.notifications ?? response.data ?? []
        cacheNotifications(notifications, context: context)
        return notifications
    }

    func cachedNotifications(context: ModelContext) -> [AppNotification] {
        let cached = (try? context.fetch(FetchDescriptor<CachedNotification>())) ?? []
        return cached.map { $0.toNotification() }
    }

    // MARK: - Private cache helpers

    private func cacheListings(_ listings: [Listing], context: ModelContext) {
        try? context.delete(model: CachedListing.self)
        listings.forEach { context.insert(CachedListing(from: $0)) }
        try? context.save()
    }

    private func cacheContacts(_ contacts: [Contact], context: ModelContext) {
        try? context.delete(model: CachedContact.self)
        contacts.forEach { context.insert(CachedContact(from: $0)) }
        try? context.save()
    }

    private func cacheRequests(_ requests: [ClientRequest], context: ModelContext) {
        try? context.delete(model: CachedRequest.self)
        requests.forEach { context.insert(CachedRequest(from: $0)) }
        try? context.save()
    }

    private func cacheNotifications(_ notifications: [AppNotification], context: ModelContext) {
        try? context.delete(model: CachedNotification.self)
        notifications.forEach { context.insert(CachedNotification(from: $0)) }
        try? context.save()
    }
}
