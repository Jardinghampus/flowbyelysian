import SwiftUI
import SwiftData

struct ClientsView: View {
    @Environment(AppState.self) private var appState
    @Environment(NetworkMonitor.self) private var network
    @Environment(\.modelContext) private var context
    @State private var vm = ClientsViewModel()
    @State private var selectedContact: Contact?

    private let statusOptions: [(String, String)] = [
        ("Alla", ""), ("Aktiva", "active"), ("Matchade", "matched"), ("Stängda", "closed")
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Segment: Requests / Contacts
                SegmentedPicker(selection: Bindable(vm).selectedSegment)

                if vm.selectedSegment == 0 {
                    RequestsTab(vm: vm, statusOptions: statusOptions)
                } else {
                    ContactsTab(vm: vm, selectedContact: $selectedContact)
                }
            }
            .background(.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { clientsToolbar }
            .searchable(text: Bindable(vm).searchText, prompt: "Sök…")
            .sheet(item: $selectedContact, content: ContactDetailView.init)
            .refreshable { await vm.load(context: context, isOnline: network.isConnected) }
        }
        .task { await vm.load(context: context, isOnline: network.isConnected) }
    }

    @ToolbarContentBuilder
    private var clientsToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Menu", systemImage: "line.3.horizontal") { appState.openDrawer() }
        }
        ToolbarItem(placement: .principal) {
            Text("Clients")
                .font(.headline)
        }
        ToolbarItem(placement: .topBarTrailing) {
            if vm.isLoading { ProgressView() }
        }
    }
}

// MARK: - Segment picker

private struct SegmentedPicker: View {
    @Binding var selection: Int

    var body: some View {
        HStack(spacing: 0) {
            SegmentTab(title: "Requests", index: 0, selection: $selection)
            SegmentTab(title: "Contacts",  index: 1, selection: $selection)
        }
        .padding(3)
        .background(.quinary, in: .rect(cornerRadius: AppTheme.Radius.sm))
        .padding(.horizontal, AppTheme.Spacing.md)
        .padding(.vertical, AppTheme.Spacing.sm)
    }
}

private struct SegmentTab: View {
    let title: String
    let index: Int
    @Binding var selection: Int

    var isSelected: Bool { selection == index }

    var body: some View {
        Button(title) {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) {
                selection = index
            }
        }
        .font(.subheadline.weight(isSelected ? .semibold : .regular))
        .foregroundStyle(isSelected ? .primary : .secondary)
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppTheme.Spacing.sm)
        .background(isSelected ? .background : .clear, in: .rect(cornerRadius: AppTheme.Radius.sm - 2))
        .shadow(color: isSelected ? .black.opacity(0.07) : .clear, radius: 4, y: 1)
        .buttonStyle(.plain)
        .sensoryFeedback(.selection, trigger: isSelected)
    }
}

// MARK: - Requests tab

private struct RequestsTab: View {
    var vm: ClientsViewModel
    let statusOptions: [(String, String)]

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(.horizontal) {
                HStack(spacing: AppTheme.Spacing.sm) {
                    ForEach(statusOptions, id: \.0) { label, value in
                        FilterChip(label: label, isSelected: Bindable(vm).filterStatus.wrappedValue == value) {
                            Bindable(vm).filterStatus.wrappedValue = value
                        }
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.vertical, AppTheme.Spacing.sm)
            }
            .scrollIndicators(.hidden)
            Divider()

            if vm.filteredRequests.isEmpty {
                ContentUnavailableView.search
                    .frame(maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVStack(spacing: AppTheme.Spacing.sm) {
                        ForEach(vm.filteredRequests) { req in
                            ClientRowView(request: req)
                        }
                    }
                    .padding(AppTheme.Spacing.md)
                }
                .scrollIndicators(.hidden)
            }
        }
    }
}

// MARK: - Contacts tab

private struct ContactsTab: View {
    var vm: ClientsViewModel
    @Binding var selectedContact: Contact?

    var body: some View {
        if vm.filteredContacts.isEmpty {
            ContentUnavailableView.search
                .frame(maxHeight: .infinity)
        } else {
            List(vm.filteredContacts) { contact in
                ContactRow(contact: contact)
                    .contentShape(.rect)
                    .onTapGesture { selectedContact = contact }
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
            }
            .listStyle(.plain)
        }
    }
}

// MARK: - Shared row components

struct ClientRowView: View {
    let request: ClientRequest

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            HStack {
                Text(request.clientName)
                    .font(.subheadline.bold())
                Spacer()
                if let status = request.status {
                    StatusBadge(status: status)
                }
            }

            HStack(spacing: AppTheme.Spacing.md) {
                if let type = request.propertyType {
                    Label(type.capitalized, systemImage: "building.2")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                if let beds = request.bedrooms, beds > 0 {
                    Label("^[\(beds) sovrum](inflect: true)", systemImage: "bed.double")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Text(request.budgetFormatted)
                .font(.footnote.bold())
                .foregroundStyle(AppTheme.Color.brand)
        }
        .padding(AppTheme.Spacing.md)
        .glassCard()
    }
}

private struct ContactRow: View {
    let contact: Contact

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Circle()
                .fill(AppTheme.Color.brand.gradient)
                .frame(width: 42, height: 42)
                .overlay {
                    Text(contact.initials)
                        .font(.callout.bold())
                        .foregroundStyle(.white)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(contact.name)
                    .font(.subheadline.bold())
                if let email = contact.email {
                    Text(email)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            if let role = contact.role {
                Text(role.capitalized)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, AppTheme.Spacing.sm)
    }
}

private struct ContactDetailView: View {
    let contact: Contact

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(spacing: AppTheme.Spacing.sm) {
                        Circle()
                            .fill(AppTheme.Color.brand.gradient)
                            .frame(width: 72, height: 72)
                            .overlay {
                                Text(contact.initials)
                                    .font(.title2.bold())
                                    .foregroundStyle(.white)
                            }
                        Text(contact.name)
                            .font(.title3.bold())
                        if let role = contact.role {
                            Text(role.capitalized)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, AppTheme.Spacing.sm)
                    .listRowBackground(Color.clear)
                }

                if let email = contact.email {
                    Section("Kontakt") {
                        Label(email, systemImage: "envelope")
                        if let phone = contact.phone {
                            Label(phone, systemImage: "phone")
                        }
                        if let wa = contact.whatsapp {
                            Label(wa, systemImage: "message")
                        }
                    }
                }
            }
            .navigationTitle(contact.name)
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}
