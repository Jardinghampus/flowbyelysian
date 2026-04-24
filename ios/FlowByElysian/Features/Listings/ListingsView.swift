import SwiftUI
import SwiftData

struct ListingsView: View {
    @Environment(\.modelContext) private var context
    @EnvironmentObject private var networkMonitor: NetworkMonitor
    @StateObject private var vm = ListingsViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading && vm.listings.isEmpty {
                    ProgressView("Laddar listings...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if vm.filtered.isEmpty {
                    ContentUnavailableView("Inga listings", systemImage: "building.2.slash")
                } else {
                    List(vm.filtered) { listing in
                        NavigationLink(destination: ListingDetailView(listing: listing)) {
                            ListingRowView(listing: listing)
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Listings")
            .searchable(text: $vm.searchText, prompt: "Sök titel, typ...")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Picker("Status", selection: $vm.filterStatus) {
                            Text("Alla").tag("")
                            Text("Live").tag("live")
                            Text("Pocket").tag("pocket")
                            Text("Unofficial").tag("unofficial")
                        }
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                }
            }
            .task { await vm.load(context: context, isOnline: networkMonitor.isConnected) }
            .refreshable { await vm.load(context: context, isOnline: networkMonitor.isConnected) }
            .onChange(of: vm.filterStatus) {
                Task { await vm.load(context: context, isOnline: networkMonitor.isConnected) }
            }
        }
    }
}

struct ListingRowView: View {
    let listing: Listing

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: listing.firstImage) { image in
                image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
                Color.gray.opacity(0.2)
            }
            .frame(width: 72, height: 56)
            .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 4) {
                Text(listing.title)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(1)
                HStack(spacing: 6) {
                    if let type = listing.type {
                        Label(type.capitalized, systemImage: "building")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    if let beds = listing.bedrooms, beds > 0 {
                        Label("\(beds) bd", systemImage: "bed.double")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                Text(listing.priceFormatted)
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.indigo)
            }

            Spacer()

            if let status = listing.status {
                Text(status)
                    .font(.caption2.weight(.semibold))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(statusBackground(status), in: Capsule())
                    .foregroundStyle(.white)
            }
        }
        .padding(.vertical, 4)
    }

    private func statusBackground(_ status: String) -> Color {
        switch status {
        case "live": return .green
        case "pocket": return .purple
        default: return .orange
        }
    }
}
