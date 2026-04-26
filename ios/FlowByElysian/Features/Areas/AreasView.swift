import SwiftUI

struct AreasView: View {
    @Environment(NetworkMonitor.self) private var network
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    @State private var vm = AreasViewModel()
    @State private var selectedArea: Area?

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading && vm.areas.isEmpty {
                    ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if vm.filteredAreas.isEmpty {
                    ContentUnavailableView("No Areas", systemImage: "map",
                                          description: Text("Check your search term"))
                } else {
                    areaGrid
                }
            }
            .navigationTitle("Areas")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close", action: dismiss.callAsFunction)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    if vm.isLoading { ProgressView() }
                }
            }
            .searchable(text: Bindable(vm).searchText, prompt: "Search areas…")
            .navigationDestination(for: Area.self) { area in
                AreaDetailView(area: area)
            }
            .refreshable { await vm.load(isOnline: network.isConnected) }
        }
        .task { await vm.load(isOnline: network.isConnected) }
    }

    private var areaGrid: some View {
        ScrollView {
            LazyVGrid(
                columns: [GridItem(.flexible()), GridItem(.flexible())],
                spacing: AppTheme.Spacing.sm
            ) {
                ForEach(vm.filteredAreas) { area in
                    NavigationLink(value: area) {
                        AreaCard(area: area)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(AppTheme.Spacing.md)
        }
        .scrollIndicators(.hidden)
    }
}

// MARK: - Area card

struct AreaCard: View {
    let area: Area

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            // Image / gradient header
            ZStack(alignment: .bottomLeading) {
                if let imageURL = area.image.flatMap(URL.init) {
                    AsyncImage(url: imageURL) { img in
                        img.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        areaGradient
                    }
                    .frame(height: 90)
                    .clipped()
                    .overlay(areaGradient.opacity(0.4))
                } else {
                    areaGradient.frame(height: 90)
                }
                Text(area.name)
                    .font(.caption.bold())
                    .foregroundStyle(.white)
                    .padding(AppTheme.Spacing.xs)
                    .padding(.bottom, 2)
                    .accessibilityHidden(true)
            }
            .clipShape(.rect(topLeadingRadius: AppTheme.Radius.sm,
                             topTrailingRadius: AppTheme.Radius.sm))

            // Stats row
            if let stats = area.stats {
                VStack(alignment: .leading, spacing: 3) {
                    if let avg = stats.avgPrice {
                        Text(avg.formatted(.currency(code: "AED").precision(.fractionLength(0))))
                            .font(.caption.bold())
                            .foregroundStyle(AppTheme.Color.brand)
                            .lineLimit(1)
                    }
                    HStack(spacing: AppTheme.Spacing.xs) {
                        if let yield = stats.avgRentYield {
                            Label(yield.formatted(.number.precision(.fractionLength(1))) + "% avkastning",
                                  systemImage: "percent")
                                .font(.caption2).foregroundStyle(.secondary)
                        }
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xs)
                .padding(.bottom, AppTheme.Spacing.xs)
            } else {
                Spacer().frame(height: AppTheme.Spacing.sm)
            }
        }
        .background(.background, in: .rect(cornerRadius: AppTheme.Radius.sm))
        .overlay {
            RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                .strokeBorder(.separator, lineWidth: 0.5)
        }
        .shadow(color: .black.opacity(0.06), radius: 8, y: 2)
        .accessibilityLabel("\(area.name)\(area.stats?.avgPrice.map { ", genomsnittspris \($0.formatted(.currency(code: "AED").precision(.fractionLength(0))))" } ?? "")")
    }

    private var areaGradient: some View {
        LinearGradient(
            colors: [AppTheme.Color.brand.opacity(0.7), AppTheme.Color.brand.opacity(0.3)],
            startPoint: .topLeading, endPoint: .bottomTrailing
        )
    }
}

// MARK: - Area detail view

struct AreaDetailView: View {
    let area: Area
    @State private var vm = AreaDetailViewModel()
    @State private var selectedTab = 0

    var body: some View {
        VStack(spacing: 0) {
            // Stats strip
            if let stats = area.stats {
                AreaStatsStrip(stats: stats)
                    .padding(AppTheme.Spacing.md)
            }

            // Segment tabs
            Picker("View", selection: $selectedTab) {
                Text("Stock").tag(0)
                Text("Requests").tag(1)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, AppTheme.Spacing.md)
            .padding(.bottom, AppTheme.Spacing.sm)

            Divider()

            if vm.isLoading {
                ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if selectedTab == 0 {
                AreaListingsTab(listings: vm.listings)
            } else {
                AreaRequestsTab(requests: vm.requests)
            }
        }
        .navigationTitle(area.name)
        .navigationBarTitleDisplayMode(.inline)
        .task { await vm.load(slug: area.slug) }
    }
}

private struct AreaStatsStrip: View {
    let stats: AreaStats

    var body: some View {
        HStack(spacing: 0) {
            if let avg = stats.avgPrice {
                StatPill(label: "Snittpris",
                         value: (avg / 1_000_000).formatted(.number.precision(.fractionLength(1))) + "M")
            }
            if let yield = stats.avgRentYield {
                StatPill(label: "Avkastning",
                         value: yield.formatted(.number.precision(.fractionLength(1))) + "%")
            }
            if let listings = stats.totalListings {
                StatPill(label: "Lager", value: listings.formatted())
            }
            if let agents = stats.activeAgents {
                StatPill(label: "Agenter", value: agents.formatted())
            }
        }
        .frame(maxWidth: .infinity)
        .padding(AppTheme.Spacing.sm)
        .glassCard(radius: AppTheme.Radius.sm)
    }
}

private struct StatPill: View {
    let label: String
    let value: String

    var body: some View {
        VStack(spacing: 2) {
            Text(value).font(.subheadline.bold()).foregroundStyle(AppTheme.Color.brand)
            Text(label).font(.caption2).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

private struct AreaListingsTab: View {
    let listings: [Listing]

    var body: some View {
        if listings.isEmpty {
            ContentUnavailableView("No Listings", systemImage: "building.2.slash")
                .frame(maxHeight: .infinity)
        } else {
            ScrollView {
                LazyVStack(spacing: AppTheme.Spacing.sm) {
                    ForEach(listings) { listing in
                        AreaListingRow(listing: listing)
                    }
                }
                .padding(AppTheme.Spacing.md)
            }
            .scrollIndicators(.hidden)
        }
    }
}

private struct AreaListingRow: View {
    let listing: Listing

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 3) {
                Text(listing.title).font(.subheadline.bold()).lineLimit(1)
                HStack(spacing: AppTheme.Spacing.xs) {
                    if let type = listing.type {
                        Text(type.capitalized).font(.caption).foregroundStyle(.secondary)
                    }
                    if let beds = listing.bedrooms, beds > 0 {
                        Text("· \(beds) BR").font(.caption).foregroundStyle(.secondary)
                    }
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 3) {
                Text(listing.priceFormatted)
                    .font(.caption.bold())
                    .foregroundStyle(AppTheme.Color.brand)
                if let status = listing.status { StatusBadge(status: status) }
            }
        }
        .padding(AppTheme.Spacing.md)
        .glassCard()
    }
}

private struct AreaRequestsTab: View {
    let requests: [ClientRequest]

    var body: some View {
        if requests.isEmpty {
            ContentUnavailableView("No Requests", systemImage: "person.2.slash")
                .frame(maxHeight: .infinity)
        } else {
            ScrollView {
                LazyVStack(spacing: AppTheme.Spacing.sm) {
                    ForEach(requests) { req in
                        ClientRowView(request: req)
                    }
                }
                .padding(AppTheme.Spacing.md)
            }
            .scrollIndicators(.hidden)
        }
    }
}
