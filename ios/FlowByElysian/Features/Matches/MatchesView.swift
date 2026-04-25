import SwiftUI
import SwiftData

struct MatchesView: View {
    @Environment(NetworkMonitor.self) private var network
    @Environment(\.modelContext) private var context
    @Environment(AppState.self) private var appState
    @State private var vm = MatchesViewModel()
    @State private var selectedMatch: PropertyMatch?

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    MatchesSkeletonView()
                } else if vm.filteredMatches.isEmpty {
                    ContentUnavailableView(
                        "Inga matchningar",
                        systemImage: "sparkles",
                        description: Text("Inga aktiva förfrågningar matchar ditt lager just nu.")
                    )
                } else {
                    matchList
                }
            }
            .navigationTitle("AI Matches")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { matchesToolbar }
            .sheet(item: $selectedMatch) { MatchDetailSheet(match: $0) }
            .refreshable { await vm.load(context: context, isOnline: network.isConnected) }
        }
        .task { await vm.load(context: context, isOnline: network.isConnected) }
    }

    private var matchList: some View {
        ScrollView {
            VStack(spacing: 0) {
                MatchHeaderBanner(count: vm.filteredMatches.count)
                    .padding(AppTheme.Spacing.md)

                LazyVStack(spacing: AppTheme.Spacing.sm) {
                    ForEach(vm.filteredMatches) { match in
                        MatchCard(match: match) {
                            selectedMatch = match
                        } onDismiss: {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                                vm.dismiss(match)
                            }
                        }
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xl)
            }
        }
        .scrollIndicators(.hidden)
    }

    @ToolbarContentBuilder
    private var matchesToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Menu", systemImage: "line.3.horizontal", action: appState.openDrawer)
        }
        ToolbarItem(placement: .topBarTrailing) {
            if vm.isLoading { ProgressView() }
        }
    }
}

// MARK: - Header banner

private struct MatchHeaderBanner: View {
    let count: Int

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Image(systemName: "sparkles")
                .font(.title2)
                .foregroundStyle(AppTheme.Color.brand.gradient)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 2) {
                Text("^[\(count) matchning](inflect: true) hittade")
                    .font(.subheadline.bold())
                Text("Swipa för att avvisa · Tryck för detaljer")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(AppTheme.Spacing.md)
        .background(.ultraThinMaterial, in: .rect(cornerRadius: AppTheme.Radius.md))
    }
}

// MARK: - Match card

private struct MatchCard: View {
    let match: PropertyMatch
    let onTap: () -> Void
    let onDismiss: () -> Void

    @State private var offset: CGFloat = 0
    @State private var isDismissing = false

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: AppTheme.Spacing.sm) {
                ScoreRing(score: match.score)
                    .frame(width: 56, height: 56)

                VStack(alignment: .leading, spacing: 4) {
                    Text(match.stock.title)
                        .font(.subheadline.bold())
                        .lineLimit(1)
                    Text(match.request.clientName)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                    HStack(spacing: AppTheme.Spacing.xs) {
                        if let area = match.stock.areaName {
                            Label(area, systemImage: "mappin")
                                .font(.caption2).foregroundStyle(.secondary)
                        }
                        if let price = match.stock.price {
                            Text(price.formatted(.currency(code: "AED").precision(.fractionLength(0))))
                                .font(.caption2.bold())
                                .foregroundStyle(AppTheme.Color.brand)
                        }
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption.bold())
                    .foregroundStyle(.tertiary)
            }
            .padding(AppTheme.Spacing.md)
            .glassCard()
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Match: \(match.stock.title) med \(match.request.clientName), \(match.score)%")
        .offset(x: offset)
        .gesture(
            DragGesture()
                .onChanged { value in
                    if value.translation.width < 0 {
                        offset = value.translation.width
                    }
                }
                .onEnded { value in
                    if value.translation.width < -80 {
                        withAnimation(.easeOut(duration: 0.25)) {
                            offset = -400
                            isDismissing = true
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { onDismiss() }
                    } else {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.7)) {
                            offset = 0
                        }
                    }
                }
        )
    }
}

// MARK: - Score ring

struct ScoreRing: View {
    let score: Int

    private var fraction: Double { Double(score) / 100.0 }

    private var color: Color {
        if score >= 80 { return .green }
        if score >= 60 { return AppTheme.Color.brand }
        return AppTheme.Color.pending
    }

    var body: some View {
        ZStack {
            Circle()
                .stroke(.quaternary, lineWidth: 5)
            Circle()
                .trim(from: 0, to: fraction)
                .stroke(color.gradient, style: StrokeStyle(lineWidth: 5, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.spring(response: 0.6, dampingFraction: 0.8), value: fraction)
            Text("\(score)%")
                .font(.caption.bold())
                .foregroundStyle(color)
        }
        .accessibilityLabel("Match score \(score) percent")
    }
}

// MARK: - Match detail sheet

private struct MatchDetailSheet: View {
    let match: PropertyMatch
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                Section("Fastighet (Lager)") {
                    DetailRow(label: "Titel",   value: match.stock.title)
                    DetailRow(label: "Pris",    value: match.stock.priceFormatted)
                    if let area = match.stock.areaName {
                        DetailRow(label: "Område", value: area)
                    }
                    if let type = match.stock.type {
                        DetailRow(label: "Typ",   value: type.capitalized)
                    }
                    if let beds = match.stock.bedrooms, beds > 0 {
                        DetailRow(label: "Sovrum", value: "\(beds)")
                    }
                }

                Section("Klientförfrågan") {
                    DetailRow(label: "Klient",  value: match.request.clientName)
                    DetailRow(label: "Budget",  value: match.request.budgetFormatted)
                    if let area = match.request.areaName {
                        DetailRow(label: "Önskat område", value: area)
                    }
                    if let type = match.request.propertyType {
                        DetailRow(label: "Typ",  value: type.capitalized)
                    }
                    if let beds = match.request.bedrooms, beds > 0 {
                        DetailRow(label: "Sovrum", value: "\(beds)")
                    }
                }

                Section("Matchningsorsaker") {
                    ForEach(match.reasons, id: \.self) { reason in
                        Label(reason, systemImage: "checkmark.circle.fill")
                            .font(.subheadline)
                            .foregroundStyle(.green, .primary)
                    }
                }

                Section {
                    HStack {
                        Spacer()
                        ScoreRing(score: match.score)
                            .frame(width: 80, height: 80)
                        Spacer()
                    }
                    .listRowBackground(Color.clear)
                }
            }
            .navigationTitle("Match \(match.score)%")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Stäng", action: dismiss.callAsFunction)
                }
            }
        }
    }
}

private struct DetailRow: View {
    let label: String
    let value: String

    var body: some View {
        LabeledContent(label, value: value)
            .font(.subheadline)
    }
}

// MARK: - Skeleton

private struct MatchesSkeletonView: View {
    var body: some View {
        ScrollView {
            LazyVStack(spacing: AppTheme.Spacing.sm) {
                ForEach(0..<6, id: \.self) { _ in
                    HStack(spacing: AppTheme.Spacing.sm) {
                        Circle().fill(.quinary).frame(width: 56, height: 56)
                        VStack(alignment: .leading, spacing: 6) {
                            RoundedRectangle(cornerRadius: 4).fill(.quinary).frame(width: 180, height: 14)
                            RoundedRectangle(cornerRadius: 4).fill(.quinary).frame(width: 120, height: 12)
                        }
                        Spacer()
                    }
                    .padding(AppTheme.Spacing.md)
                    .glassCard()
                }
            }
            .padding(AppTheme.Spacing.md)
        }
        .scrollIndicators(.hidden)
    }
}
