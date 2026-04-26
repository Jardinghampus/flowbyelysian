import SwiftUI
import SwiftData

struct GlobalSearchView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var context
    @State private var query = ""
    @FocusState private var focused: Bool

    // Local data pulled from SwiftData cache
    @State private var listings:  [Listing]       = []
    @State private var contacts:  [Contact]        = []
    @State private var requests:  [ClientRequest]  = []

    private var filteredListings: [Listing] {
        guard !query.isEmpty else { return [] }
        let q = query.lowercased()
        return listings.filter {
            $0.title.lowercased().contains(q) ||
            ($0.areaName?.lowercased().contains(q) ?? false) ||
            ($0.status?.lowercased().contains(q) ?? false)
        }.prefix(5).map { $0 }
    }

    private var filteredContacts: [Contact] {
        guard !query.isEmpty else { return [] }
        let q = query.lowercased()
        return contacts.filter {
            $0.name.lowercased().contains(q) ||
            ($0.email?.lowercased().contains(q) ?? false) ||
            ($0.role?.lowercased().contains(q) ?? false)
        }.prefix(5).map { $0 }
    }

    private var filteredRequests: [ClientRequest] {
        guard !query.isEmpty else { return [] }
        let q = query.lowercased()
        return requests.filter {
            $0.clientName.lowercased().contains(q) ||
            ($0.areaName?.lowercased().contains(q) ?? false)
        }.prefix(5).map { $0 }
    }

    private var hasResults: Bool {
        !filteredListings.isEmpty || !filteredContacts.isEmpty || !filteredRequests.isEmpty
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search bar
                HStack(spacing: DS.Spacing.sm) {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(.secondary)
                    TextField("Search listings, contacts, clients…", text: $query)
                        .font(AppFont.body(16))
                        .focused($focused)
                        .autocorrectionDisabled()
                        .submitLabel(.search)
                    if !query.isEmpty {
                        Button {
                            query = ""
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundStyle(.secondary)
                        }
                        .buttonStyle(.plain)
                        .transition(.scale.combined(with: .opacity))
                    }
                }
                .padding(DS.Spacing.md)
                .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.lg))
                .padding(DS.Spacing.base)

                Divider()

                ScrollView {
                    if query.isEmpty {
                        searchHint
                    } else if !hasResults {
                        emptyState
                    } else {
                        VStack(alignment: .leading, spacing: DS.Spacing.xl) {
                            if !filteredListings.isEmpty {
                                SearchSection(title: "Listings", icon: "building.2.fill", tint: Color.zGreen) {
                                    ForEach(filteredListings) { listing in
                                        ListingSearchRow(listing: listing)
                                    }
                                }
                            }
                            if !filteredContacts.isEmpty {
                                SearchSection(title: "Contacts", icon: "person.fill", tint: Color.zBlue) {
                                    ForEach(filteredContacts) { contact in
                                        ContactSearchRow(contact: contact)
                                    }
                                }
                            }
                            if !filteredRequests.isEmpty {
                                SearchSection(title: "Clients", icon: "person.2.fill", tint: Color.zIndigo) {
                                    ForEach(filteredRequests) { req in
                                        RequestSearchRow(request: req)
                                    }
                                }
                            }
                        }
                        .padding(DS.Spacing.base)
                    }
                }
                .scrollIndicators(.hidden)
                .animation(DS.Anim.quick, value: query)
            }
            .background(Color.zBg.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("Search").font(.headline)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Cancel") { dismiss() }
                        .tint(Color.zBlue)
                }
            }
        }
        .onAppear {
            focused = true
            loadLocalData()
        }
    }

    private var searchHint: some View {
        VStack(spacing: DS.Spacing.md) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 44))
                .foregroundStyle(Color.zBlue.opacity(0.4))
                .padding(.top, DS.Spacing.xxxl)
            Text("Search everything")
                .font(AppFont.heading(18))
            Text("Listings, contacts, and clients\nall in one place.")
                .font(AppFont.body(14))
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(DS.Spacing.base)
    }

    private var emptyState: some View {
        VStack(spacing: DS.Spacing.md) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 44))
                .foregroundStyle(.tertiary)
                .padding(.top, DS.Spacing.xxxl)
            Text("No results for \"\(query)\"")
                .font(AppFont.heading(16))
            Text("Try a different name, area, or status.")
                .font(AppFont.body(13))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(DS.Spacing.base)
    }

    private func loadLocalData() {
        let sync = SyncManager.shared
        listings = sync.cachedListings(context: context)
        contacts = sync.cachedContacts(context: context)
        requests = sync.cachedRequests(context: context)
    }
}

// MARK: - Section wrapper

private struct SearchSection<Content: View>: View {
    let title: String
    let icon: String
    let tint: Color
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Spacing.sm) {
            Label(title, systemImage: icon)
                .font(AppFont.label(11))
                .foregroundStyle(tint)
                .textCase(.uppercase)
                .tracking(0.8)

            VStack(spacing: DS.Spacing.xs) {
                content
            }
        }
    }
}

// MARK: - Row types

private struct ListingSearchRow: View {
    let listing: Listing

    var body: some View {
        HStack(spacing: DS.Spacing.sm) {
            RoundedRectangle(cornerRadius: DS.Radius.sm)
                .fill(Color.zGreen.opacity(0.15))
                .frame(width: 40, height: 40)
                .overlay {
                    Image(systemName: "building.2.fill")
                        .font(.caption.bold())
                        .foregroundStyle(Color.zGreen)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(listing.title)
                    .font(AppFont.body(14, weight: .medium))
                    .lineLimit(1)
                if let area = listing.areaName {
                    Text(area)
                        .font(AppFont.body(12))
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(listing.priceFormatted)
                    .font(AppFont.label(11))
                    .foregroundStyle(Color.zBlue)
                if let status = listing.status {
                    StatusBadge(status: status)
                }
            }
        }
        .padding(DS.Spacing.sm + 2)
        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
    }
}

private struct ContactSearchRow: View {
    let contact: Contact

    var body: some View {
        HStack(spacing: DS.Spacing.sm) {
            Circle()
                .fill(LinearGradient.zBlue)
                .frame(width: 40, height: 40)
                .overlay {
                    Text(contact.initials)
                        .font(AppFont.label(13))
                        .foregroundStyle(.white)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(contact.name)
                    .font(AppFont.body(14, weight: .medium))
                if let email = contact.email {
                    Text(email)
                        .font(AppFont.body(12))
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            if let role = contact.role {
                Text(role.capitalized)
                    .font(AppFont.label(10))
                    .foregroundStyle(.secondary)
            }
        }
        .padding(DS.Spacing.sm + 2)
        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
    }
}

private struct RequestSearchRow: View {
    let request: ClientRequest

    var body: some View {
        HStack(spacing: DS.Spacing.sm) {
            Circle()
                .fill(Color.zIndigo.opacity(0.15))
                .frame(width: 40, height: 40)
                .overlay {
                    Text(String(request.clientName.prefix(1)).uppercased())
                        .font(AppFont.heading(16))
                        .foregroundStyle(Color.zIndigo)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(request.clientName)
                    .font(AppFont.body(14, weight: .medium))
                Text(request.budgetFormatted)
                    .font(AppFont.body(12))
                    .foregroundStyle(Color.zBlue)
            }

            Spacer()

            if let status = request.status {
                StatusBadge(status: status)
            }
        }
        .padding(DS.Spacing.sm + 2)
        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
    }
}
