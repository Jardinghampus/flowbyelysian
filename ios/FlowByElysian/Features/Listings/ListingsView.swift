import SwiftUI
import SwiftData

struct ListingsView: View {
    @Environment(AppState.self) private var appState
    @Environment(NetworkMonitor.self) private var network
    @Environment(\.modelContext) private var context
    @State private var vm = ListingsViewModel()
    @State private var path = NavigationPath()
    @State private var showAddSheet = false

    private let statusOptions: [(String, String)] = [
        ("All", ""), ("Live", "live"), ("Pocket", "pocket"), ("Unofficial", "unofficial")
    ]
    private let typeOptions: [(String, String)] = [
        ("All Types", ""), ("Villa", "villa"), ("Apartment", "apartment"),
        ("Townhouse", "townhouse"), ("Penthouse", "penthouse"), ("Plot", "plot")
    ]

    var body: some View {
        NavigationStack(path: $path) {
            VStack(spacing: 0) {
                FiltersSection(vm: vm, statusOptions: statusOptions, typeOptions: typeOptions)
                    .onChange(of: vm.filterStatus) { _, _ in reload() }
                    .onChange(of: vm.filterType)   { _, _ in reload() }

                ZStack(alignment: .bottomTrailing) {
                    ListingsContent(vm: vm, path: $path, context: context, network: network)
                    AddButton { showAddSheet = true }
                        .padding(AppTheme.Spacing.md)
                }
            }
            .background(.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { listingsToolbar }
            .navigationDestination(for: Listing.self) {
                ListingDetailView(listing: $0, vm: vm)
            }
            .searchable(text: Bindable(vm).searchText, prompt: "Title, type, area…")
            .sheet(isPresented: $showAddSheet) { addSheet }
            .refreshable { await vm.load(context: context, isOnline: network.isConnected) }
        }
        .task { await vm.load(context: context, isOnline: network.isConnected) }
    }

    private var addSheet: some View {
        AddListingView { payload in
            do {
                try await vm.createListing(payload, context: context)
            } catch {
                vm.errorMessage = error.localizedDescription
            }
        }
    }

    private func reload() {
        Task { await vm.load(context: context, isOnline: network.isConnected) }
    }

    @ToolbarContentBuilder
    private var listingsToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Menu", systemImage: "line.3.horizontal", action: appState.openDrawer)
        }
        ToolbarItem(placement: .principal) {
            Text("Listings").font(.headline)
        }
        ToolbarItem(placement: .topBarTrailing) {
            if vm.isLoading { ProgressView() }
        }
    }
}

// MARK: - Sub-views

private struct FiltersSection: View {
    @Bindable var vm: ListingsViewModel
    let statusOptions: [(String, String)]
    let typeOptions: [(String, String)]

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(.horizontal) {
                HStack(spacing: AppTheme.Spacing.sm) {
                    ForEach(statusOptions, id: \.0) { label, value in
                        FilterChip(label: label, isSelected: vm.filterStatus == value) {
                            vm.filterStatus = value
                        }
                    }
                    Divider().frame(height: 20)
                    ForEach(typeOptions, id: \.0) { label, value in
                        FilterChip(label: label, isSelected: vm.filterType == value) {
                            vm.filterType = value
                        }
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.vertical, AppTheme.Spacing.sm)
            }
            .scrollIndicators(.hidden)
            Divider()
        }
    }
}

private struct ListingsContent: View {
    @Bindable var vm: ListingsViewModel
    @Binding var path: NavigationPath
    let context: ModelContext
    let network: NetworkMonitor

    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        if vm.isLoading && vm.listings.isEmpty {
            ScrollView {
                LazyVGrid(columns: columns, spacing: AppTheme.Spacing.sm) {
                    ForEach(0..<6, id: \.self) { _ in ListingCardSkeleton() }
                }
                .padding(AppTheme.Spacing.md)
            }
            .scrollIndicators(.hidden)
        } else if vm.filtered.isEmpty {
            ContentUnavailableView.search
        } else {
            ScrollView {
                LazyVGrid(columns: columns, spacing: AppTheme.Spacing.sm) {
                    ForEach(Array(vm.filtered.enumerated()), id: \.element.id) { index, listing in
                        ListingGridCard(listing: listing, onTap: { path.append(listing) },
                                        onDelete: { deleteListing(listing) })
                            .staggeredAppear(index: index)
                    }
                }
                .padding(AppTheme.Spacing.md)
                .padding(.bottom, 80) // clearance for FAB
            }
            .scrollIndicators(.hidden)
        }
    }

    private func deleteListing(_ listing: Listing) {
        Task {
            do {
                try await vm.deleteListing(id: listing.id, context: context)
            } catch {
                vm.errorMessage = error.localizedDescription
            }
        }
    }
}

private struct ListingGridCard: View {
    let listing: Listing
    let onTap: () -> Void
    let onDelete: () -> Void
    @State private var showDeleteConfirm = false

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 0) {
                ZStack(alignment: .bottomLeading) {
                    AsyncImage(url: listing.firstImage) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle()
                            .fill(Color.zCardRaised)
                            .shimmer()
                            .overlay {
                                Image(systemName: "building.2")
                                    .foregroundStyle(.tertiary)
                                    .font(.title3)
                                    .accessibilityHidden(true)
                            }
                    }
                    .frame(height: 115)
                    .clipShape(.rect(topLeadingRadius: DS.Radius.lg,
                                     topTrailingRadius: DS.Radius.lg))
                    .accessibilityHidden(true)

                    LinearGradient(
                        colors: [.black.opacity(0.5), .clear],
                        startPoint: .bottom, endPoint: .center
                    )
                    .clipShape(UnevenRoundedRectangle(
                        topLeadingRadius: DS.Radius.lg, bottomLeadingRadius: 0,
                        bottomTrailingRadius: 0, topTrailingRadius: DS.Radius.lg
                    ))

                    if let status = listing.status {
                        StatusBadge(status: status)
                            .padding(DS.Spacing.sm)
                    }
                }
                .frame(height: 115)

                VStack(alignment: .leading, spacing: 4) {
                    Text(listing.title)
                        .font(AppFont.body(12, weight: .semibold))
                        .lineLimit(1)
                    Text(listing.priceFormatted)
                        .font(AppFont.body(12, weight: .bold))
                        .foregroundStyle(Color.zBlue)
                    if let beds = listing.bedrooms, beds > 0 {
                        Label("\(beds) BR", systemImage: "bed.double")
                            .font(AppFont.body(11))
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(DS.Spacing.sm + 2)
            }
            .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.lg))
            .overlay {
                RoundedRectangle(cornerRadius: DS.Radius.lg)
                    .strokeBorder(Color.zBorderSubtle, lineWidth: 0.5)
            }
            .shadow(color: .black.opacity(0.25), radius: 12, y: 4)
        }
        .buttonStyle(LiquidButtonStyle())
        .accessibilityLabel("\(listing.title), \(listing.priceFormatted)")
        .contextMenu {
            Button("Delete", systemImage: "trash", role: .destructive) {
                showDeleteConfirm = true
            }
        }
        .confirmationDialog("Delete \(listing.title)?",
                            isPresented: $showDeleteConfirm,
                            titleVisibility: .visible) {
            Button("Delete", role: .destructive, action: onDelete)
        }
    }
}

private struct AddButton: View {
    let action: () -> Void

    var body: some View {
        Button("Add Listing", systemImage: "plus", action: action)
            .labelStyle(.iconOnly)
            .font(.title2.weight(.semibold))
            .foregroundStyle(.white)
            .frame(width: 56, height: 56)
            .background(AppTheme.Color.brand.gradient, in: Circle())
            .shadow(color: AppTheme.Color.brand.opacity(0.4), radius: 12, y: 6)
            .sensoryFeedback(.impact, trigger: true)
    }
}
