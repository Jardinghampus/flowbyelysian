import SwiftUI
import SwiftData

struct ClientsView: View {
    @Environment(AppState.self) private var appState
    @Environment(NetworkMonitor.self) private var network
    @Environment(\.modelContext) private var context
    @State private var vm = ClientsViewModel()
    @State private var selectedContact: Contact?
    @State private var showAddRequest = false
    @State private var showAddContact = false

    private let statusOptions: [(String, String)] = [
        ("Alla", ""), ("Aktiva", "active"), ("Matchade", "matched"), ("Stängda", "closed")
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                SegmentedPicker(selection: Bindable(vm).selectedSegment)
                    .padding(.horizontal, AppTheme.Spacing.md)
                    .padding(.vertical, AppTheme.Spacing.sm)
                Divider()

                ZStack(alignment: .bottomTrailing) {
                    if vm.selectedSegment == 0 {
                        RequestsTab(vm: vm, statusOptions: statusOptions, context: context)
                    } else {
                        ContactsTab(vm: vm, selectedContact: $selectedContact, context: context)
                    }

                    AddButton(label: vm.selectedSegment == 0 ? "Ny förfrågan" : "Ny kontakt") {
                        if vm.selectedSegment == 0 { showAddRequest = true }
                        else { showAddContact = true }
                    }
                    .padding(AppTheme.Spacing.md)
                }
            }
            .background(.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { clientsToolbar }
            .searchable(text: Bindable(vm).searchText, prompt: "Sök…")
            .sheet(item: $selectedContact, content: ContactDetailSheet.init)
            .sheet(isPresented: $showAddRequest) {
                AddRequestView { payload in
                    do { try await vm.createRequest(payload, context: context) }
                    catch { vm.errorMessage = error.localizedDescription }
                }
            }
            .sheet(isPresented: $showAddContact) {
                AddContactView { payload in
                    do { try await vm.createContact(payload, context: context) }
                    catch { vm.errorMessage = error.localizedDescription }
                }
            }
            .refreshable { await vm.load(context: context, isOnline: network.isConnected) }
        }
        .task { await vm.load(context: context, isOnline: network.isConnected) }
    }

    @ToolbarContentBuilder
    private var clientsToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Menu", systemImage: "line.3.horizontal", action: appState.openDrawer)
        }
        ToolbarItem(placement: .principal) {
            Text("Clients").font(.headline)
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
            SegmentButton(title: "Requests", index: 0, selection: $selection)
            SegmentButton(title: "Contacts",  index: 1, selection: $selection)
        }
        .padding(3)
        .background(.quinary, in: .rect(cornerRadius: AppTheme.Radius.sm))
    }
}

private struct SegmentButton: View {
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
        .background(isSelected ? AnyShapeStyle(.background) : AnyShapeStyle(Color.clear), in: .rect(cornerRadius: AppTheme.Radius.sm - 2))
        .shadow(color: isSelected ? .black.opacity(0.07) : .clear, radius: 4, y: 1)
        .buttonStyle(.plain)
        .sensoryFeedback(.selection, trigger: isSelected)
    }
}

// MARK: - Requests tab

private struct RequestsTab: View {
    @Bindable var vm: ClientsViewModel
    let statusOptions: [(String, String)]
    let context: ModelContext

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(.horizontal) {
                HStack(spacing: AppTheme.Spacing.sm) {
                    ForEach(statusOptions, id: \.0) { label, value in
                        FilterChip(label: label, isSelected: vm.filterStatus == value) {
                            vm.filterStatus = value
                        }
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.vertical, AppTheme.Spacing.sm)
            }
            .scrollIndicators(.hidden)
            Divider()

            if vm.filteredRequests.isEmpty {
                let descriptionText = vm.filterStatus.isEmpty
                    ? "Tryck + för att lägga till"
                    : "Inga status \(vm.filterStatus)"
                ContentUnavailableView(
                    "Inga förfrågningar",
                    systemImage: "person.2.slash",
                    description: Text(descriptionText)
                )
                .frame(maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVStack(spacing: AppTheme.Spacing.sm) {
                        ForEach(vm.filteredRequests) { req in
                            RequestCard(request: req, onStatusChange: { newStatus in
                                Task {
                                    try? await vm.updateRequestStatus(id: req.id, status: newStatus)
                                }
                            }, onDelete: {
                                Task {
                                    try? await vm.deleteRequest(id: req.id, context: context)
                                }
                            })
                        }
                    }
                    .padding(AppTheme.Spacing.md)
                    .padding(.bottom, 80)
                }
                .scrollIndicators(.hidden)
            }
        }
    }
}

// MARK: - Contacts tab

private struct ContactsTab: View {
    @Bindable var vm: ClientsViewModel
    @Binding var selectedContact: Contact?
    let context: ModelContext

    var body: some View {
        if vm.filteredContacts.isEmpty {
            ContentUnavailableView(
                "Inga kontakter",
                systemImage: "person.slash",
                description: Text("Tryck + för att lägga till")
            )
            .frame(maxHeight: .infinity)
        } else {
            List {
                ForEach(vm.filteredContacts) { contact in
                    Button {
                        selectedContact = contact
                    } label: {
                        ContactRow(contact: contact)
                    }
                    .buttonStyle(.plain)
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
                    .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                        Button("Radera", role: .destructive) {
                            Task { try? await vm.deleteContact(id: contact.id, context: context) }
                        }
                    }
                }
            }
            .listStyle(.plain)
        }
    }
}

// MARK: - Row components (also used in Dashboard)

struct ClientRowView: View {
    let request: ClientRequest

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            HStack {
                Text(request.clientName)
                    .font(.subheadline.bold())
                Spacer()
                if let status = request.status { StatusBadge(status: status) }
            }
            HStack(spacing: AppTheme.Spacing.md) {
                if let type = request.propertyType {
                    Label(type.capitalized, systemImage: "building.2")
                        .font(.caption).foregroundStyle(.secondary)
                }
                if let beds = request.bedrooms, beds > 0 {
                    Label("^[\(beds) sovrum](inflect: true)", systemImage: "bed.double")
                        .font(.caption).foregroundStyle(.secondary)
                }
                if let area = request.areaName {
                    Label(area, systemImage: "mappin")
                        .font(.caption).foregroundStyle(.secondary)
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

private struct RequestCard: View {
    let request: ClientRequest
    let onStatusChange: (String) -> Void
    let onDelete: () -> Void
    @State private var showStatusPicker = false
    @State private var showDeleteConfirm = false

    var body: some View {
        ClientRowView(request: request)
            .contextMenu {
                Menu("Ändra status", systemImage: "arrow.triangle.2.circlepath") {
                    Button("Aktiv")    { onStatusChange("active") }
                    Button("Matchad")  { onStatusChange("matched") }
                    Button("Stängd")   { onStatusChange("closed") }
                }
                Divider()
                Button("Radera", systemImage: "trash", role: .destructive) {
                    showDeleteConfirm = true
                }
            }
            .confirmationDialog("Radera \(request.clientName)?",
                                isPresented: $showDeleteConfirm,
                                titleVisibility: .visible) {
                Button("Radera", role: .destructive, action: onDelete)
            }
            .accessibilityLabel("\(request.clientName), \(request.budgetFormatted)")
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
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 2) {
                Text(contact.name).font(.subheadline.bold())
                if let email = contact.email {
                    Text(email).font(.caption).foregroundStyle(.secondary)
                }
            }
            Spacer()
            if let role = contact.role {
                Text(role.capitalized).font(.caption).foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, AppTheme.Spacing.sm)
        .accessibilityLabel("\(contact.name)\(contact.role.map { ", \($0)" } ?? "")")
    }
}

private struct ContactDetailSheet: View {
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
                            .accessibilityHidden(true)
                        Text(contact.name).font(.title3.bold())
                        if let role = contact.role {
                            Text(role.capitalized).font(.subheadline).foregroundStyle(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, AppTheme.Spacing.sm)
                    .listRowBackground(Color.clear)
                }
                Section("Kontakt") {
                    if let email = contact.email {
                        Label(email, systemImage: "envelope")
                            .accessibilityLabel("E-post: \(email)")
                    }
                    if let phone = contact.phone {
                        Label(phone, systemImage: "phone")
                            .accessibilityLabel("Telefon: \(phone)")
                    }
                    if let wa = contact.whatsapp {
                        Label(wa, systemImage: "message")
                            .accessibilityLabel("WhatsApp: \(wa)")
                    }
                }
                if let area = contact.areaName {
                    Section("Område") {
                        Label(area, systemImage: "mappin")
                    }
                }
            }
            .navigationTitle(contact.name)
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

private struct AddButton: View {
    let label: String
    let action: () -> Void

    var body: some View {
        Button(label, systemImage: "plus", action: action)
            .labelStyle(.iconOnly)
            .font(.title2.weight(.semibold))
            .foregroundStyle(.white)
            .frame(width: 56, height: 56)
            .background(AppTheme.Color.brand.gradient, in: Circle())
            .shadow(color: AppTheme.Color.brand.opacity(0.4), radius: 12, y: 6)
    }
}
