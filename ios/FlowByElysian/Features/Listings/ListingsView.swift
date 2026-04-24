import SwiftUI
import SwiftData

struct ListingsView: View {
    @Environment(AppState.self) private var appState
    @Environment(NetworkMonitor.self) private var network
    @Environment(\.modelContext) private var context
    @State private var vm = ListingsViewModel()
    @State private var path = NavigationPath()

    private let statusOptions: [(String, String)] = [
        ("Alla", ""), ("Live", "live"), ("Pocket", "pocket"), ("Unofficial", "unofficial")
    ]
    private let typeOptions: [(String, String)] = [
        ("Alla typer", ""), ("Villa", "villa"), ("Apartment", "apartment"),
        ("Townhouse", "townhouse"), ("Penthouse", "penthouse"), ("Plot", "plot")
    ]

    var body: some View {
        NavigationStack(path: $path) {
            VStack(spacing: 0) {
                FiltersSection(vm: vm, statusOptions: statusOptions, typeOptions: typeOptions)
                    .onChange(of: vm.filterStatus) { _, _ in
                        Task { await vm.load(context: context, isOnline: network.isConnected) }
                    }
                    .onChange(of: vm.filterType) { _, _ in
                        Task { await vm.load(context: context, isOnline: network.isConnected) }
                    }

                if vm.isLoading && vm.listings.isEmpty {
                    ProgressView()
                        .frame(maxHeight: .infinity)
                } else {
                    ListingsGrid(listings: vm.filtered, path: $path)
                }
            }
            .background(.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { listingsToolbar }
            .navigationDestination(for: Listing.self) { ListingDetailView(listing: $0) }
            .searchable(text: $vm.searchText, prompt: "Titel, typ, område…")
            .refreshable { await vm.load(context: context, isOnline: network.isConnected) }
        }
        .task { await vm.load(context: context, isOnline: network.isConnected) }
    }

    @ToolbarContentBuilder
    private var listingsToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Menu", systemImage: "line.3.horizontal") { appState.openDrawer() }
        }
        ToolbarItem(placement: .principal) {
            Text("Listings")
                .font(.headline)
        }
        ToolbarItem(placement: .topBarTrailing) {
            if vm.isLoading { ProgressView() }
        }
    }
}

// MARK: - Sub-views

private struct FiltersSection: View {
    var vm: ListingsViewModel
    let statusOptions: [(String, String)]
    let typeOptions: [(String, String)]

    @Bindable private var bindableVM: ListingsViewModel

    init(vm: ListingsViewModel, statusOptions: [(String, String)], typeOptions: [(String, String)]) {
        self.vm = vm
        self.bindableVM = vm
        self.statusOptions = statusOptions
        self.typeOptions = typeOptions
    }

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(.horizontal) {
                HStack(spacing: AppTheme.Spacing.sm) {
                    ForEach(statusOptions, id: \.0) { label, value in
                        FilterChip(label: label, isSelected: bindableVM.filterStatus == value) {
                            bindableVM.filterStatus = value
                        }
                    }
                    Divider().frame(height: 20)
                    ForEach(typeOptions, id: \.0) { label, value in
                        FilterChip(label: label, isSelected: bindableVM.filterType == value) {
                            bindableVM.filterType = value
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

private struct ListingsGrid: View {
    let listings: [Listing]
    @Binding var path: NavigationPath

    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        if listings.isEmpty {
            ContentUnavailableView.search
        } else {
            ScrollView {
                LazyVGrid(columns: columns, spacing: AppTheme.Spacing.sm) {
                    ForEach(listings) { listing in
                        ListingGridCard(listing: listing)
                            .onTapGesture { path.append(listing) }
                    }
                }
                .padding(AppTheme.Spacing.md)
            }
            .scrollIndicators(.hidden)
        }
    }
}

private struct ListingGridCard: View {
    let listing: Listing

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            AsyncImage(url: listing.firstImage) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle().fill(.quinary)
                    .overlay { Image(systemName: "building.2").foregroundStyle(.tertiary) }
            }
            .frame(height: 110)
            .clipShape(.rect(topLeadingRadius: AppTheme.Radius.card,
                             topTrailingRadius: AppTheme.Radius.card))

            VStack(alignment: .leading, spacing: 4) {
                Text(listing.title)
                    .font(.footnote.bold())
                    .lineLimit(1)

                Text(listing.priceFormatted)
                    .font(.footnote)
                    .foregroundStyle(AppTheme.Color.brand)

                HStack(spacing: AppTheme.Spacing.xs) {
                    if let beds = listing.bedrooms, beds > 0 {
                        Label("\(beds)", systemImage: "bed.double")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    if let status = listing.status {
                        Spacer()
                        StatusBadge(status: status)
                    }
                }
            }
            .padding(AppTheme.Spacing.sm)
        }
        .background(.regularMaterial, in: .rect(cornerRadius: AppTheme.Radius.card))
        .shadow(color: .black.opacity(0.06), radius: 8, y: 2)
    }
}
