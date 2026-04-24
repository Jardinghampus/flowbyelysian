import SwiftData
import Foundation

@MainActor
final class ContactsViewModel: ObservableObject {
    @Published var contacts: [Contact] = []
    @Published var isLoading = false
    @Published var searchText = ""

    private let sync = SyncManager.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }
        if isOnline {
            contacts = (try? await sync.fetchContacts(context: context)) ?? sync.cachedContacts(context: context)
        } else {
            contacts = sync.cachedContacts(context: context)
        }
    }

    var filtered: [Contact] {
        guard !searchText.isEmpty else { return contacts }
        return contacts.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            ($0.email?.localizedCaseInsensitiveContains(searchText) == true)
        }
    }
}
