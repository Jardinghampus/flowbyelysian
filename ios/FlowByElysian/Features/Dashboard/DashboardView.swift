import SwiftUI
import SwiftData

struct DashboardView: View {
    @Environment(\.modelContext) private var context
    @EnvironmentObject private var networkMonitor: NetworkMonitor
    @StateObject private var vm = DashboardViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // KPI-kort
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        KPICard(title: "Live listings", value: "\(vm.liveListings)", icon: "building.2.fill", color: .green)
                        KPICard(title: "Aktiva requests", value: "\(vm.activeRequests)", icon: "person.2.fill", color: .indigo)
                        KPICard(title: "Aviseringar", value: "\(vm.unreadCount)", icon: "bell.badge.fill", color: .orange)
                    }
                    .padding(.horizontal)

                    // Senaste listings
                    if !vm.listings.isEmpty {
                        SectionHeader(title: "Senaste listings")
                        ForEach(vm.listings) { listing in
                            NavigationLink(destination: ListingDetailView(listing: listing)) {
                                ListingRowView(listing: listing)
                            }
                            .buttonStyle(.plain)
                            .padding(.horizontal)
                        }
                    }

                    // Senaste requests
                    if !vm.requests.isEmpty {
                        SectionHeader(title: "Senaste requests")
                        ForEach(vm.requests) { req in
                            RequestRowView(request: req)
                                .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Dashboard")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    if vm.isLoading { ProgressView() }
                }
            }
            .task { await vm.load(context: context, isOnline: networkMonitor.isConnected) }
            .refreshable { await vm.load(context: context, isOnline: networkMonitor.isConnected) }
        }
    }
}

struct KPICard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(value)
                .font(.title.bold())
            Text(title)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(12)
        .background(.quaternary, in: RoundedRectangle(cornerRadius: 12))
    }
}

struct SectionHeader: View {
    let title: String
    var body: some View {
        HStack {
            Text(title)
                .font(.headline)
            Spacer()
        }
        .padding(.horizontal)
        .padding(.top, 8)
    }
}
