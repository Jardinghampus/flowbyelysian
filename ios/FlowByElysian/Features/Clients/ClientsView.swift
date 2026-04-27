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
        ("All", ""), ("Active", "active"), ("Matched", "matched"), ("Closed", "closed")
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

                    AddButton(label: vm.selectedSegment == 0 ? "New Request" : "New Contact") {
                        if vm.selectedSegment == 0 { showAddRequest = true }
                        else { showAddContact = true }
                    }
                    .padding(AppTheme.Spacing.md)
                }
            }
            .background(.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { clientsToolbar }
            .searchable(text: Bindable(vm).searchText, prompt: "Search…")
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
            if vm.isLoading {
                ProgressView()
            } else {
                Button("Pipeline", systemImage: "rectangle.split.3x1") {
                    appState.openPipeline()
                }
                .tint(Color.zBlue)
            }
        }
    }
}

// MARK: - Segment picker (Revolut sliding underline style)

private struct SegmentedPicker: View {
    @Binding var selection: Int
    @Namespace private var ns

    var body: some View {
        HStack(spacing: 0) {
            SegmentButton(title: "Requests", index: 0, selection: $selection, namespace: ns)
            SegmentButton(title: "Contacts",  index: 1, selection: $selection, namespace: ns)
        }
    }
}

private struct SegmentButton: View {
    let title: String
    let index: Int
    @Binding var selection: Int
    let namespace: Namespace.ID

    var isSelected: Bool { selection == index }

    var body: some View {
        Button {
            withAnimation(DS.Anim.standard) { selection = index }
        } label: {
            VStack(spacing: DS.Spacing.xs) {
                Text(title)
                    .font(AppFont.body(15, weight: isSelected ? .semibold : .regular))
                    .foregroundStyle(isSelected ? .primary : .secondary)
                    .padding(.vertical, DS.Spacing.sm)

                if isSelected {
                    Rectangle()
                        .fill(Color.zBlue)
                        .frame(height: 2)
                        .clipShape(.rect(cornerRadius: 1))
                        .matchedGeometryEffect(id: "seg", in: namespace)
                } else {
                    Rectangle()
                        .fill(Color.clear)
                        .frame(height: 2)
                }
            }
            .frame(maxWidth: .infinity)
            .contentShape(.rect)
        }
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
                ContentUnavailableView(
                    "No Requests",
                    systemImage: "person.2.slash",
                    description: Text(vm.filterStatus.isEmpty ? "Tap + to add" : "None with status \"\(vm.filterStatus)\"")
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
                "No Contacts",
                systemImage: "person.slash",
                description: Text("Tap + to add a contact")
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
                        Button("Delete", role: .destructive) {
                            Task { try? await vm.deleteContact(id: contact.id, context: context) }
                        }
                    }
                    .swipeActions(edge: .leading, allowsFullSwipe: false) {
                        if let url = contact.whatsappURL {
                            Link(destination: url) {
                                Label("WhatsApp", systemImage: "message.fill")
                            }
                            .tint(.green)
                        }
                        if let url = contact.callURL {
                            Link(destination: url) {
                                Label("Call", systemImage: "phone.fill")
                            }
                            .tint(.blue)
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
                    Label("\(beds) bed\(beds == 1 ? "" : "s")", systemImage: "bed.double")
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
    @State private var showDeleteConfirm = false

    var body: some View {
        ClientRowView(request: request)
            .contextMenu {
                Menu("Change Status", systemImage: "arrow.triangle.2.circlepath") {
                    Button("Active")  { onStatusChange("active") }
                    Button("Matched") { onStatusChange("matched") }
                    Button("Closed")  { onStatusChange("closed") }
                }
                Divider()
                Button("Delete", systemImage: "trash", role: .destructive) {
                    showDeleteConfirm = true
                }
            }
            .confirmationDialog("Delete \(request.clientName)?",
                                isPresented: $showDeleteConfirm,
                                titleVisibility: .visible) {
                Button("Delete", role: .destructive, action: onDelete)
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
            // Quick WhatsApp chip
            if contact.whatsappURL != nil {
                Image(systemName: "message.fill")
                    .font(.caption)
                    .foregroundStyle(.green)
                    .accessibilityHidden(true)
            }
        }
        .padding(.vertical, AppTheme.Spacing.sm)
        .accessibilityLabel("\(contact.name)\(contact.role.map { ", \($0)" } ?? "")")
    }
}

private struct ContactDetailSheet: View {
    let contact: Contact
    @Environment(\.openURL) private var openURL

    var body: some View {
        NavigationStack {
            List {
                // Avatar header
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

                // Quick action buttons
                if contact.whatsappURL != nil || contact.callURL != nil {
                    Section {
                        HStack(spacing: AppTheme.Spacing.sm) {
                            if let url = contact.callURL {
                                ContactActionButton(
                                    icon: "phone.fill",
                                    label: "Call",
                                    tint: .blue
                                ) { openURL(url) }
                            }
                            if let url = contact.whatsappURL {
                                ContactActionButton(
                                    icon: "message.fill",
                                    label: "WhatsApp",
                                    tint: .green
                                ) { openURL(url) }
                            }
                            if let email = contact.email,
                               let url = URL(string: "mailto:\(email)") {
                                ContactActionButton(
                                    icon: "envelope.fill",
                                    label: "Email",
                                    tint: AppTheme.Color.brand
                                ) { openURL(url) }
                            }
                        }
                        .listRowBackground(Color.clear)
                        .listRowInsets(.init())
                    }
                }

                Section("Contact") {
                    if let email = contact.email {
                        Label(email, systemImage: "envelope")
                            .accessibilityLabel("Email: \(email)")
                    }
                    if let phone = contact.phone {
                        Button {
                            if let url = contact.callURL { openURL(url) }
                        } label: {
                            Label(phone, systemImage: "phone")
                                .foregroundStyle(.primary)
                        }
                        .accessibilityLabel("Phone: \(phone)")
                    }
                    if let wa = contact.whatsapp {
                        Button {
                            if let url = contact.whatsappURL { openURL(url) }
                        } label: {
                            Label(wa, systemImage: "message")
                                .foregroundStyle(.primary)
                        }
                        .accessibilityLabel("WhatsApp: \(wa)")
                    }
                }

                if let area = contact.areaName {
                    Section("Area") {
                        Label(area, systemImage: "mappin")
                    }
                }
            }
            .navigationTitle(contact.name)
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

private struct ContactActionButton: View {
    let icon: String
    let label: String
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 5) {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(tint)
                Text(label)
                    .font(.caption2.bold())
                    .foregroundStyle(.primary)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 60)
            .background(.ultraThinMaterial, in: .rect(cornerRadius: AppTheme.Radius.md))
            .overlay {
                RoundedRectangle(cornerRadius: AppTheme.Radius.md)
                    .strokeBorder(tint.opacity(0.2), lineWidth: 0.5)
            }
        }
        .buttonStyle(LiquidButtonStyle())
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
