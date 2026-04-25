import SwiftUI
import SwiftData

struct DashboardView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(AppState.self) private var appState
    @Environment(NetworkMonitor.self) private var network
    @Environment(CalendarManager.self) private var calendar
    @Environment(\.modelContext) private var context
    @State private var vm = DashboardViewModel()
    @State private var listingPath = NavigationPath()

    var body: some View {
        NavigationStack(path: $listingPath) {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.md) {
                    DashboardGreeting(user: auth.currentUser)
                    KPIGrid(vm: vm)
                    RecentListingsSection(listings: vm.listings, path: $listingPath)
                    RecentRequestsSection(requests: vm.requests)
                }
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.vertical, AppTheme.Spacing.md)
            }
            .scrollIndicators(.hidden)
            .background(.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { dashboardToolbar }
            .navigationDestination(for: Listing.self) { ListingDetailView(listing: $0) }
            .refreshable {
                await vm.load(context: context, isOnline: network.isConnected)
                appState.notificationUnreadCount = vm.unreadCount
                await refreshWidget()
            }
        }
        .task {
            await vm.load(context: context, isOnline: network.isConnected)
            appState.notificationUnreadCount = vm.unreadCount
            await refreshWidget()
        }
    }

    private func refreshWidget() async {
        let granted = await calendar.requestAccess()
        let events  = granted ? calendar.fetchUpcoming() : []
        vm.updateWidget(calendarEvents: events)
    }

    @ToolbarContentBuilder
    private var dashboardToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Menu", systemImage: "line.3.horizontal", action: appState.openDrawer)
                .sensoryFeedback(.impact(flexibility: .soft), trigger: appState.drawerOpen)
        }
        ToolbarItem(placement: .topBarTrailing) {
            if vm.isLoading {
                ProgressView()
            } else {
                Button("Aviseringar", systemImage: "bell.fill", action: appState.openNotifications)
                    .symbolEffect(.bounce, value: appState.notificationUnreadCount)
                    .overlay(alignment: .topTrailing) {
                        if appState.notificationUnreadCount > 0 {
                            Text(appState.notificationUnreadCount > 9 ? "9+" :
                                 appState.notificationUnreadCount.formatted())
                                .font(.system(size: 9, weight: .bold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 3)
                                .frame(minWidth: 14, minHeight: 14)
                                .background(AppTheme.Color.pending, in: Capsule())
                                .offset(x: 6, y: -6)
                                .accessibilityHidden(true)
                        }
                    }
            }
        }
    }
}

// MARK: - Sub-views

private struct DashboardGreeting: View {
    let user: AppUser?

    private var greeting: String {
        switch Calendar.current.component(.hour, from: .now) {
        case 0..<12:  "God morgon"
        case 12..<18: "God eftermiddag"
        default:      "God kväll"
        }
    }

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(greeting)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                Text(user?.name ?? "Agent")
                    .font(.title2.bold())
            }
            Spacer()
            Circle()
                .fill(AppTheme.Color.brand.gradient)
                .frame(width: 40, height: 40)
                .overlay {
                    Text(user?.initials ?? "?")
                        .font(.callout.bold())
                        .foregroundStyle(.white)
                }
                .accessibilityLabel("Profil för \(user?.name ?? "agent")")
        }
    }
}

private struct KPIGrid: View {
    let vm: DashboardViewModel

    private var portfolioFormatted: String {
        let v = vm.totalValue
        if v >= 1_000_000 {
            return (v / 1_000_000).formatted(.number.precision(.fractionLength(1))) + "M AED"
        }
        return v.formatted(.currency(code: "AED").precision(.fractionLength(0)))
    }

    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())],
                  spacing: AppTheme.Spacing.sm) {
            MetricCard(title: "Live listings",   value: vm.liveListings.formatted(),
                       subtitle: nil, icon: "building.2.fill",     tint: AppTheme.Color.live,    trend: 12)
            MetricCard(title: "Aktiva klienter", value: vm.activeRequests.formatted(),
                       subtitle: nil, icon: "person.2.fill",       tint: AppTheme.Color.brand,   trend: 5)
            MetricCard(title: "Portfölj",        value: portfolioFormatted,
                       subtitle: nil, icon: "banknote.fill",       tint: .mint,                  trend: 8)
            MetricCard(title: "Notiser",         value: vm.unreadCount.formatted(),
                       subtitle: nil, icon: "bell.badge.fill",     tint: AppTheme.Color.pending, trend: nil)
        }
    }
}

private struct RecentListingsSection: View {
    let listings: [Listing]
    @Binding var path: NavigationPath

    var body: some View {
        if !listings.isEmpty {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                Text("Senaste listings")
                    .font(.headline)
                    .frame(maxWidth: .infinity, alignment: .leading)

                ScrollView(.horizontal) {
                    HStack(spacing: AppTheme.Spacing.sm) {
                        ForEach(listings) { listing in
                            DashboardListingCard(listing: listing) {
                                path.append(listing)
                            }
                        }
                    }
                    .padding(.horizontal, AppTheme.Spacing.xs)
                    .padding(.vertical, AppTheme.Spacing.xs)
                }
                .scrollIndicators(.hidden)
                .scrollClipDisabled()
            }
        }
    }
}

private struct DashboardListingCard: View {
    let listing: Listing
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                AsyncImage(url: listing.firstImage) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle().fill(.quinary)
                        .overlay {
                            Image(systemName: "building.2")
                                .foregroundStyle(.tertiary)
                                .accessibilityHidden(true)
                        }
                }
                .frame(width: 180, height: 120)
                .clipShape(.rect(cornerRadius: AppTheme.Radius.sm))
                .accessibilityHidden(true)

                VStack(alignment: .leading, spacing: 3) {
                    Text(listing.title)
                        .font(.footnote.bold())
                        .lineLimit(1)
                    Text(listing.priceFormatted)
                        .font(.footnote)
                        .foregroundStyle(AppTheme.Color.brand)
                    if let status = listing.status {
                        StatusBadge(status: status)
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xs)
                .padding(.bottom, AppTheme.Spacing.xs)
            }
            .frame(width: 180)
            .glassCard()
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(listing.title), \(listing.priceFormatted)")
    }
}

private struct RecentRequestsSection: View {
    let requests: [ClientRequest]

    var body: some View {
        if !requests.isEmpty {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                Text("Senaste klienter")
                    .font(.headline)
                    .frame(maxWidth: .infinity, alignment: .leading)

                VStack(spacing: AppTheme.Spacing.xs) {
                    ForEach(requests) { req in
                        ClientRowView(request: req)
                    }
                }
            }
        }
    }
}
