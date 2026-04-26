import SwiftUI
import SwiftData
import Charts

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
                if vm.isLoading && vm.listings.isEmpty {
                    DashboardSkeleton()
                        .transition(.opacity)
                }
                VStack(spacing: AppTheme.Spacing.lg) {
                    HeroCard(user: auth.currentUser, vm: vm)
                        .padding(.horizontal, AppTheme.Spacing.md)

                    QuickActionsRow()
                        .padding(.horizontal, AppTheme.Spacing.md)

                    KPIRow(vm: vm)
                        .padding(.horizontal, AppTheme.Spacing.md)

                    if vm.unreadCount > 0 {
                        NotificationsBanner(count: vm.unreadCount, action: appState.openNotifications)
                            .padding(.horizontal, AppTheme.Spacing.md)
                    }

                    if !vm.upcomingEvents.isEmpty {
                        UpcomingEventsSection(events: vm.upcomingEvents)
                    }

                    if !vm.tasks.isEmpty {
                        TodayFocusSection(tasks: vm.tasks)
                    }

                    RecentListingsSection(listings: vm.listings, path: $listingPath)

                    if !vm.requests.isEmpty {
                        ActiveClientsSection(requests: vm.requests)
                    }
                }
                .padding(.vertical, AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xl)
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
        ToolbarItem(placement: .principal) {
            Button(action: appState.openSearch) {
                HStack(spacing: DS.Spacing.xs) {
                    Image(systemName: "magnifyingglass")
                        .font(.caption.bold())
                    Text("Search everything…")
                        .font(AppFont.body(13))
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal, DS.Spacing.md)
                .padding(.vertical, DS.Spacing.xs + 2)
                .background(Color.zCard, in: Capsule())
                .overlay {
                    Capsule().strokeBorder(Color.zBorderSubtle, lineWidth: 0.5)
                }
            }
            .buttonStyle(.plain)
            .tint(.secondary)
        }
        ToolbarItem(placement: .topBarTrailing) {
            if vm.isLoading {
                ProgressView()
            } else {
                Button("Notifications", systemImage: "bell.fill", action: appState.openNotifications)
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

// MARK: - Hero Card

private struct HeroCard: View {
    let user: AppUser?
    let vm: DashboardViewModel
    @State private var displayedValue: Double = 0

    private var greeting: String {
        switch Calendar.current.component(.hour, from: .now) {
        case 0..<12:  "Good morning"
        case 12..<18: "Good afternoon"
        default:      "Good evening"
        }
    }

    private var formattedDate: String {
        Date.now.formatted(.dateTime.weekday(.wide).day().month(.wide).year())
    }

    private func formatValue(_ v: Double) -> String {
        if v >= 1_000_000 {
            return "AED " + (v / 1_000_000).formatted(.number.precision(.fractionLength(1))) + "M"
        } else if v > 0 {
            return v.formatted(.currency(code: "AED").precision(.fractionLength(0)))
        }
        return "AED —"
    }

    private var sparklinePrices: [Double] {
        vm.listings.compactMap(\.price).sorted()
    }

    var body: some View {
        ZStack(alignment: .topLeading) {
            LinearGradient.zHero

            // Decorative ambient circles
            Circle()
                .fill(.white.opacity(0.035))
                .frame(width: 220, height: 220)
                .offset(x: 160, y: -80)
            Circle()
                .fill(Color.zBlue.opacity(0.08))
                .frame(width: 130, height: 130)
                .offset(x: -40, y: 120)

            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(greeting)
                            .font(AppFont.body(13, weight: .medium))
                            .foregroundStyle(.white.opacity(0.70))
                        Text(user?.name ?? "Agent")
                            .font(AppFont.display(20))
                            .foregroundStyle(.white)
                    }
                    Spacer()
                    Circle()
                        .fill(.white.opacity(0.13))
                        .frame(width: 44, height: 44)
                        .overlay {
                            Text(user?.initials ?? "?")
                                .font(AppFont.heading(15))
                                .foregroundStyle(.white)
                        }
                        .accessibilityLabel("Profile: \(user?.name ?? "agent")")
                }

                Spacer()

                Text(formattedDate)
                    .font(AppFont.label(11))
                    .foregroundStyle(.white.opacity(0.48))
                    .padding(.bottom, DS.Spacing.xs + 2)

                Rectangle()
                    .fill(.white.opacity(0.14))
                    .frame(height: 0.5)
                    .padding(.bottom, DS.Spacing.sm)

                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("Portfolio Value")
                            .font(AppFont.label(11))
                            .foregroundStyle(.white.opacity(0.62))
                        Text(formatValue(displayedValue))
                            .font(AppFont.display(25))
                            .foregroundStyle(.white)
                            .minimumScaleFactor(0.6)
                            .lineLimit(1)
                            .contentTransition(.numericText(value: displayedValue))
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: DS.Spacing.xs) {
                        if sparklinePrices.count >= 2 {
                            MiniSparkline(values: sparklinePrices)
                                .frame(width: 70, height: 30)
                        }
                        HStack(spacing: DS.Spacing.sm) {
                            MiniHeroStat(value: vm.liveListings.formatted(), label: "Live")
                            MiniHeroStat(value: vm.activeRequests.formatted(), label: "Clients")
                        }
                    }
                }
            }
            .padding(DS.Spacing.base + 4)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 210)
        .clipShape(.rect(cornerRadius: DS.Radius.xl))
        .shadow(color: Color.zBlue.opacity(0.20), radius: 30, y: 12)
        .onAppear {
            withAnimation(.easeOut(duration: 1.2).delay(0.2)) {
                displayedValue = vm.totalValue
            }
        }
        .onChange(of: vm.totalValue) { _, newVal in
            withAnimation(.easeOut(duration: 0.8)) {
                displayedValue = newVal
            }
        }
    }
}

private struct MiniHeroStat: View {
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 2) {
            Text(value)
                .font(AppFont.display(16))
                .foregroundStyle(.white)
            Text(label)
                .font(AppFont.label(10))
                .foregroundStyle(.white.opacity(0.62))
        }
        .frame(minWidth: 46)
        .padding(.vertical, DS.Spacing.xs + 1)
        .padding(.horizontal, DS.Spacing.sm + 1)
        .background(.white.opacity(0.11), in: .rect(cornerRadius: DS.Radius.sm))
    }
}

private struct MiniSparkline: View {
    let values: [Double]

    private var chartData: [(Int, Double)] {
        values.enumerated().map { ($0.offset, $0.element) }
    }

    var body: some View {
        Chart(chartData, id: \.0) { idx, val in
            LineMark(x: .value("i", idx), y: .value("v", val))
                .interpolationMethod(.catmullRom)
                .foregroundStyle(Color.zBlue)
            AreaMark(x: .value("i", idx), y: .value("v", val))
                .interpolationMethod(.catmullRom)
                .foregroundStyle(
                    LinearGradient(
                        colors: [Color.zBlue.opacity(0.35), .clear],
                        startPoint: .top, endPoint: .bottom
                    )
                )
        }
        .chartXAxis(.hidden)
        .chartYAxis(.hidden)
        .chartLegend(.hidden)
    }
}

// MARK: - Quick Actions

private struct QuickActionsRow: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            QuickActionPill(icon: "plus.circle.fill",      label: "Listing",  tint: AppTheme.Color.live) {
                appState.navigate(to: .listings)
            }
            QuickActionPill(icon: "person.badge.plus.fill", label: "Client",   tint: AppTheme.Color.brand) {
                appState.navigate(to: .clients)
            }
            QuickActionPill(icon: "checklist",             label: "Tasks",    tint: .orange) {
                appState.openTasks()
            }
            QuickActionPill(icon: "sparkles",              label: "AI Coach", tint: .purple) {
                appState.openChat()
            }
        }
    }
}

private struct QuickActionPill: View {
    let icon: String
    let label: String
    let tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundStyle(tint)
                Text(label)
                    .font(.caption2.bold())
                    .foregroundStyle(.primary)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 70)
            .background(.ultraThinMaterial, in: .rect(cornerRadius: AppTheme.Radius.md))
            .overlay {
                RoundedRectangle(cornerRadius: AppTheme.Radius.md)
                    .strokeBorder(tint.opacity(0.22), lineWidth: 0.5)
            }
        }
        .buttonStyle(LiquidButtonStyle())
        .sensoryFeedback(.impact(flexibility: .soft), trigger: label)
    }
}

// MARK: - KPI Row

private struct KPIRow: View {
    let vm: DashboardViewModel

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            MetricCard(
                title: "Live Listings",
                value: vm.liveListings.formatted(),
                subtitle: nil,
                icon: "building.2.fill",
                tint: AppTheme.Color.live,
                trend: 12
            )
            .staggeredAppear(index: 0)

            MetricCard(
                title: "Active Clients",
                value: vm.activeRequests.formatted(),
                subtitle: nil,
                icon: "person.2.fill",
                tint: AppTheme.Color.brand,
                trend: 5
            )
            .staggeredAppear(index: 1)
        }
    }
}

// MARK: - Notifications Banner

private struct NotificationsBanner: View {
    let count: Int
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: AppTheme.Spacing.sm) {
                Image(systemName: "bell.badge.fill")
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.Color.pending)
                Text("\(count) unread notification\(count == 1 ? "" : "s")")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.primary)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption.bold())
                    .foregroundStyle(.tertiary)
            }
            .padding(AppTheme.Spacing.md)
            .background(AppTheme.Color.pending.opacity(0.10), in: .rect(cornerRadius: AppTheme.Radius.sm))
            .overlay {
                RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                    .strokeBorder(AppTheme.Color.pending.opacity(0.25), lineWidth: 0.5)
            }
        }
        .buttonStyle(LiquidButtonStyle())
    }
}

// MARK: - Today's Focus (tasks)

private struct TodayFocusSection: View {
    let tasks: [TaskItem]
    @Environment(AppState.self) private var appState

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            DashSectionHeader(title: "Today's Focus", icon: "checklist", badge: tasks.count) {
                appState.openTasks()
            }
            .padding(.horizontal, AppTheme.Spacing.md)

            VStack(spacing: AppTheme.Spacing.xs) {
                ForEach(Array(tasks.prefix(3).enumerated()), id: \.element.id) { idx, task in
                    DashboardTaskRow(task: task)
                        .padding(.horizontal, AppTheme.Spacing.md)
                        .staggeredAppear(index: idx)
                }
            }
        }
    }
}

private struct DashboardTaskRow: View {
    let task: TaskItem

    private var statusColor: Color {
        switch task.status {
        case .todo:       return .secondary
        case .inProgress: return AppTheme.Color.brand
        case .completed:  return .green
        case .cancelled:  return .red
        }
    }

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Image(systemName: task.status.icon)
                .font(.subheadline)
                .foregroundStyle(statusColor)
                .frame(width: 22)

            VStack(alignment: .leading, spacing: 2) {
                Text(task.title)
                    .font(.subheadline)
                    .lineLimit(1)
                    .strikethrough(task.status == .completed)
                Text(task.category.label)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            PriorityPill(priority: task.priority)
        }
        .padding(AppTheme.Spacing.sm + 2)
        .background(.ultraThinMaterial, in: .rect(cornerRadius: AppTheme.Radius.sm))
        .overlay {
            RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                .strokeBorder(.white.opacity(0.07), lineWidth: 0.5)
        }
    }
}

// MARK: - Recent Listings

private struct RecentListingsSection: View {
    let listings: [Listing]
    @Binding var path: NavigationPath

    var body: some View {
        if !listings.isEmpty {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                DashSectionHeader(title: "Recent Listings", icon: "building.2.fill", badge: nil, action: nil)
                    .padding(.horizontal, AppTheme.Spacing.md)

                ScrollView(.horizontal) {
                    HStack(spacing: AppTheme.Spacing.sm) {
                        ForEach(Array(listings.enumerated()), id: \.element.id) { index, listing in
                            DashboardListingCard(listing: listing) {
                                path.append(listing)
                            }
                            .staggeredAppear(index: index)
                        }
                    }
                    .padding(.horizontal, AppTheme.Spacing.md)
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
            VStack(alignment: .leading, spacing: 0) {
                ZStack(alignment: .bottomLeading) {
                    AsyncImage(url: listing.firstImage) { image in
                        image.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle().fill(.quinary)
                            .overlay {
                                Image(systemName: "building.2")
                                    .foregroundStyle(.tertiary)
                                    .font(.title2)
                                    .accessibilityHidden(true)
                            }
                    }
                    .frame(width: 190, height: 130)
                    .clipped()

                    LinearGradient(
                        colors: [.black.opacity(0.55), .clear],
                        startPoint: .bottom,
                        endPoint: .center
                    )

                    if let status = listing.status {
                        StatusBadge(status: status)
                            .padding(AppTheme.Spacing.sm)
                    }
                }
                .frame(width: 190, height: 130)
                .clipShape(.rect(topLeadingRadius: AppTheme.Radius.card,
                                 topTrailingRadius: AppTheme.Radius.card))
                .accessibilityHidden(true)

                VStack(alignment: .leading, spacing: 4) {
                    Text(listing.title)
                        .font(.footnote.bold())
                        .lineLimit(1)
                    Text(listing.priceFormatted)
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(AppTheme.Color.brand)
                    if let area = listing.areaName {
                        Label(area, systemImage: "mappin")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(AppTheme.Spacing.sm + 2)
            }
            .frame(width: 190)
            .glassCard()
        }
        .buttonStyle(LiquidButtonStyle())
        .accessibilityLabel("\(listing.title), \(listing.priceFormatted)")
    }
}

// MARK: - Active Clients

private struct ActiveClientsSection: View {
    let requests: [ClientRequest]
    @Environment(AppState.self) private var appState

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            DashSectionHeader(title: "Active Clients", icon: "person.2.fill", badge: requests.count) {
                appState.navigate(to: .clients)
            }
            .padding(.horizontal, AppTheme.Spacing.md)

            VStack(spacing: AppTheme.Spacing.xs) {
                ForEach(Array(requests.prefix(4).enumerated()), id: \.element.id) { idx, req in
                    CompactClientRow(request: req)
                        .padding(.horizontal, AppTheme.Spacing.md)
                        .staggeredAppear(index: idx)
                }
            }
        }
    }
}

private struct CompactClientRow: View {
    let request: ClientRequest

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Circle()
                .fill(AppTheme.Color.brand.opacity(0.15))
                .frame(width: 38, height: 38)
                .overlay {
                    Text(String(request.clientName.prefix(1)).uppercased())
                        .font(.callout.bold())
                        .foregroundStyle(AppTheme.Color.brand)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(request.clientName)
                    .font(.subheadline.bold())
                    .lineLimit(1)
                Text(request.budgetFormatted)
                    .font(.caption)
                    .foregroundStyle(AppTheme.Color.brand)
            }

            Spacer()

            if let status = request.status {
                StatusBadge(status: status)
            }

            Image(systemName: "chevron.right")
                .font(.caption2.bold())
                .foregroundStyle(.tertiary)
        }
        .padding(AppTheme.Spacing.sm + 2)
        .background(.ultraThinMaterial, in: .rect(cornerRadius: AppTheme.Radius.sm))
        .overlay {
            RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                .strokeBorder(.white.opacity(0.07), lineWidth: 0.5)
        }
        .accessibilityLabel("\(request.clientName), \(request.budgetFormatted)")
    }
}

// MARK: - Section header

private struct DashSectionHeader: View {
    let title: String
    let icon: String
    let badge: Int?
    let action: (() -> Void)?

    var body: some View {
        HStack(spacing: AppTheme.Spacing.xs) {
            Image(systemName: icon)
                .font(.caption.bold())
                .foregroundStyle(AppTheme.Color.brand)
                .accessibilityHidden(true)
            Text(title)
                .font(.headline)
            if let badge, badge > 0 {
                Text(badge.formatted())
                    .font(.caption2.bold())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 5)
                    .frame(minWidth: 18, minHeight: 18)
                    .background(AppTheme.Color.brand.opacity(0.8), in: Capsule())
            }
            Spacer()
            if let action {
                Button("See all", action: action)
                    .font(.footnote.weight(.medium))
                    .foregroundStyle(AppTheme.Color.brand)
            }
        }
    }
}

// MARK: - Upcoming Events (calendar)

private struct UpcomingEventsSection: View {
    let events: [WidgetEvent]
    @Environment(AppState.self) private var appState

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            DashSectionHeader(title: "Upcoming", icon: "calendar", badge: nil) {
                appState.openCalendar()
            }
            .padding(.horizontal, AppTheme.Spacing.md)

            VStack(spacing: AppTheme.Spacing.xs) {
                ForEach(Array(events.prefix(3).enumerated()), id: \.element.id) { idx, event in
                    UpcomingEventRow(event: event)
                        .padding(.horizontal, AppTheme.Spacing.md)
                        .staggeredAppear(index: idx)
                }
            }
        }
    }
}

private struct UpcomingEventRow: View {
    let event: WidgetEvent

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            VStack(spacing: 2) {
                Text(event.dayString)
                    .font(.caption2.bold())
                    .foregroundStyle(AppTheme.Color.brand)
                Text(event.timeString)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .frame(width: 58, alignment: .leading)

            Rectangle()
                .fill(AppTheme.Color.brand.opacity(0.5))
                .frame(width: 2)
                .clipShape(.rect(cornerRadius: 1))

            VStack(alignment: .leading, spacing: 2) {
                Text(event.title)
                    .font(.subheadline.weight(.medium))
                    .lineLimit(1)
                if let loc = event.location {
                    Label(loc, systemImage: "mappin")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()
        }
        .padding(AppTheme.Spacing.sm + 2)
        .background(.ultraThinMaterial, in: .rect(cornerRadius: AppTheme.Radius.sm))
        .overlay {
            RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                .strokeBorder(.white.opacity(0.07), lineWidth: 0.5)
        }
        .accessibilityLabel("\(event.title), \(event.dayString) \(event.timeString)\(event.location.map { ", \($0)" } ?? "")")
    }
}
