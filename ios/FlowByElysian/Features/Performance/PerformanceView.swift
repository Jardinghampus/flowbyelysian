import SwiftUI

struct PerformanceView: View {
    @Environment(AppState.self) private var appState
    @State private var vm = PerformanceViewModel()
    @State private var selectedSection = 0

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.lg) {
                    // My rank summary card
                    RankSummaryCard(vm: vm)
                        .padding(.horizontal, AppTheme.Spacing.md)

                    // Section picker
                    SectionPicker(selection: $selectedSection)
                        .padding(.horizontal, AppTheme.Spacing.md)

                    switch selectedSection {
                    case 0: LeaderboardSection(vm: vm)
                    case 1: AchievementsSection(vm: vm)
                    case 2: TargetsSection(vm: vm)
                    case 3: PerformanceChartsSection(vm: vm)
                    default: EmptyView()
                    }
                }
                .padding(.vertical, AppTheme.Spacing.md)
            }
            .scrollIndicators(.hidden)
            .background(.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { performanceToolbar }
        }
    }

    @ToolbarContentBuilder
    private var performanceToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Menu", systemImage: "line.3.horizontal", action: appState.openDrawer)
        }
        ToolbarItem(placement: .principal) {
            Text("Performance").font(.headline)
        }
    }
}

// MARK: - Rank summary

private struct RankSummaryCard: View {
    let vm: PerformanceViewModel

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            VStack(spacing: 2) {
                Text("#\(vm.currentRank)")
                    .font(.title.bold())
                    .foregroundStyle(AppTheme.Color.brand)
                Text("Rank").font(.caption2).foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)

            Divider().frame(height: 40)

            VStack(spacing: 2) {
                Text(vm.totalPoints.formatted())
                    .font(.title.bold())
                    .foregroundStyle(AppTheme.Color.brand)
                Text("Poäng").font(.caption2).foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)

            Divider().frame(height: 40)

            VStack(spacing: 2) {
                Text("\(vm.unlockedCount)/\(vm.achievements.count)")
                    .font(.title.bold())
                    .foregroundStyle(AppTheme.Color.brand)
                Text("Badges").font(.caption2).foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
        }
        .padding(AppTheme.Spacing.md)
        .glassCard()
    }
}

// MARK: - Section picker

private struct SectionPicker: View {
    @Binding var selection: Int

    var body: some View {
        HStack(spacing: 0) {
            ForEach(["Leaderboard", "Achievements", "Mål", "Statistik"].indices, id: \.self) { i in
                let label = ["Leaderboard", "Achievements", "Mål", "Statistik"][i]
                Button(label) {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.75)) { selection = i }
                }
                .font(.subheadline.weight(selection == i ? .semibold : .regular))
                .foregroundStyle(selection == i ? .primary : .secondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, AppTheme.Spacing.sm)
                .background(selection == i ? .background : .clear,
                            in: .rect(cornerRadius: AppTheme.Radius.sm - 2))
                .shadow(color: selection == i ? .black.opacity(0.07) : .clear, radius: 4, y: 1)
                .buttonStyle(.plain)
                .sensoryFeedback(.selection, trigger: selection)
            }
        }
        .padding(3)
        .background(.quinary, in: .rect(cornerRadius: AppTheme.Radius.sm))
    }
}

// MARK: - Leaderboard

private struct LeaderboardSection: View {
    @Bindable var vm: PerformanceViewModel

    var body: some View {
        VStack(spacing: AppTheme.Spacing.sm) {
            // Period picker
            Picker("Period", selection: $vm.leaderboardPeriod) {
                ForEach(PerformanceViewModel.Period.allCases, id: \.self) {
                    Text($0.rawValue).tag($0)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, AppTheme.Spacing.md)

            // Top 3 podium
            PodiumView(entries: Array(vm.leaderboard.prefix(3)))
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.vertical, AppTheme.Spacing.sm)

            // Rest of the list
            VStack(spacing: AppTheme.Spacing.xs) {
                ForEach(Array(vm.leaderboard.dropFirst(3).enumerated()), id: \.element.id) { index, entry in
                    LeaderboardRow(entry: entry)
                        .staggeredAppear(index: index)
                }
            }
            .padding(.horizontal, AppTheme.Spacing.md)
        }
    }
}

private struct PodiumView: View {
    let entries: [LeaderboardEntry]

    var body: some View {
        HStack(alignment: .bottom, spacing: AppTheme.Spacing.sm) {
            if entries.count > 1 { PodiumPillar(entry: entries[1], height: 80, medal: "🥈") }
            if entries.count > 0 { PodiumPillar(entry: entries[0], height: 100, medal: "🥇") }
            if entries.count > 2 { PodiumPillar(entry: entries[2], height: 64, medal: "🥉") }
        }
        .frame(maxWidth: .infinity)
    }
}

private struct PodiumPillar: View {
    let entry: LeaderboardEntry
    let height: CGFloat
    let medal: String

    var body: some View {
        VStack(spacing: AppTheme.Spacing.xs) {
            Text(medal).font(.title2).accessibilityHidden(true)

            Circle()
                .fill(entry.isCurrentUser ? AppTheme.Color.brand.gradient : AnyShapeStyle(.quaternary))
                .frame(width: 44, height: 44)
                .overlay {
                    Text(entry.initials)
                        .font(.caption.bold())
                        .foregroundStyle(entry.isCurrentUser ? .white : .primary)
                }
                .accessibilityHidden(true)

            Text(entry.name.components(separatedBy: " ").first ?? entry.name)
                .font(.caption.bold())
                .lineLimit(1)

            Text(entry.points.formatted() + " pts")
                .font(.caption2).foregroundStyle(.secondary)

            Rectangle()
                .fill(entry.isCurrentUser ? AppTheme.Color.brand.gradient : AnyShapeStyle(.quinary))
                .frame(height: height)
                .clipShape(.rect(topLeadingRadius: 4, topTrailingRadius: 4))
        }
        .frame(maxWidth: .infinity)
        .accessibilityLabel("\(medal) \(entry.name), \(entry.points) poäng")
    }
}

private struct LeaderboardRow: View {
    let entry: LeaderboardEntry

    private var rankIcon: String {
        if entry.rankChange > 0 { return "chevron.up" }
        if entry.rankChange < 0 { return "chevron.down" }
        return "minus"
    }
    private var rankColor: Color {
        if entry.rankChange > 0 { return .green }
        if entry.rankChange < 0 { return .red }
        return .secondary
    }

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Text("#\(entry.rank)")
                .font(.caption.bold())
                .foregroundStyle(.secondary)
                .frame(width: 28, alignment: .leading)

            Circle()
                .fill(entry.isCurrentUser ? AppTheme.Color.brand.gradient : AnyShapeStyle(.quaternary))
                .frame(width: 36, height: 36)
                .overlay {
                    Text(entry.initials)
                        .font(.caption2.bold())
                        .foregroundStyle(entry.isCurrentUser ? .white : .primary)
                }
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 2) {
                Text(entry.name)
                    .font(.subheadline.weight(entry.isCurrentUser ? .semibold : .regular))
                HStack(spacing: AppTheme.Spacing.xs) {
                    Text("\(entry.deals) affärer")
                    if entry.streak > 0 {
                        Label("\(entry.streak) dagar", systemImage: "flame.fill")
                            .foregroundStyle(.orange)
                    }
                }
                .font(.caption).foregroundStyle(.secondary)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(entry.points.formatted() + " pts")
                    .font(.caption.bold())
                Image(systemName: rankIcon)
                    .font(.caption2)
                    .foregroundStyle(rankColor)
            }
        }
        .padding(AppTheme.Spacing.sm + 4)
        .background(entry.isCurrentUser ? AppTheme.Color.brand.opacity(0.06) : .clear,
                    in: .rect(cornerRadius: AppTheme.Radius.sm))
        .overlay {
            if entry.isCurrentUser {
                RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                    .strokeBorder(AppTheme.Color.brand.opacity(0.25), lineWidth: 1)
            }
        }
        .accessibilityLabel("\(entry.name), rank \(entry.rank), \(entry.points) poäng")
    }
}

// MARK: - Achievements

private struct AchievementsSection: View {
    @Bindable var vm: PerformanceViewModel

    private let categories: [(String?, Achievement.Category?)] = [
        ("Alla", nil),
        ("Sales", .sales),
        ("Streaks", .streak),
        ("Milestones", .milestone),
        ("Special", .special),
    ]

    var body: some View {
        VStack(spacing: AppTheme.Spacing.sm) {
            ScrollView(.horizontal) {
                HStack(spacing: AppTheme.Spacing.xs) {
                    ForEach(categories, id: \.0) { label, cat in
                        FilterChip(label: label ?? "", isSelected: vm.achievementFilter == cat) {
                            vm.achievementFilter = cat
                        }
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.md)
            }
            .scrollIndicators(.hidden)

            LazyVGrid(
                columns: [GridItem(.flexible()), GridItem(.flexible())],
                spacing: AppTheme.Spacing.sm
            ) {
                ForEach(Array(vm.filteredAchievements.enumerated()), id: \.element.id) { index, achievement in
                    AchievementCard(achievement: achievement)
                        .staggeredAppear(index: index)
                }
            }
            .padding(.horizontal, AppTheme.Spacing.md)
        }
    }
}

private struct AchievementCard: View {
    let achievement: Achievement

    private var rarityGradient: AnyShapeStyle {
        switch achievement.rarity {
        case .legendary: return AnyShapeStyle(LinearGradient(colors: [.yellow.opacity(0.3), .orange.opacity(0.1)], startPoint: .topLeading, endPoint: .bottomTrailing))
        case .epic:      return AnyShapeStyle(LinearGradient(colors: [.purple.opacity(0.2), .indigo.opacity(0.05)], startPoint: .topLeading, endPoint: .bottomTrailing))
        case .rare:      return AnyShapeStyle(Color.blue.opacity(0.08))
        case .common:    return AnyShapeStyle(Color(.systemFill))
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            HStack {
                Image(systemName: achievement.icon)
                    .font(.title3)
                    .foregroundStyle(achievement.unlocked ? .yellow : .secondary)
                    .accessibilityHidden(true)
                Spacer()
                if !achievement.unlocked {
                    Image(systemName: "lock.fill")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                        .accessibilityHidden(true)
                }
            }

            Text(achievement.name)
                .font(.caption.bold())
                .foregroundStyle(achievement.unlocked ? .primary : .secondary)
                .lineLimit(1)

            Text(achievement.description)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(2)

            if let p = achievement.progress, let max = achievement.maxProgress, !achievement.unlocked {
                VStack(spacing: 2) {
                    ProgressView(value: achievement.progressFraction)
                        .tint(AppTheme.Color.brand)
                    Text("\(p)/\(max)")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }
            }

            if let date = achievement.unlockedDate {
                Text(date).font(.caption2).foregroundStyle(.tertiary)
            }
        }
        .padding(AppTheme.Spacing.sm + 2)
        .background(rarityGradient, in: .rect(cornerRadius: AppTheme.Radius.sm))
        .overlay {
            RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                .strokeBorder(achievement.unlocked ? .yellow.opacity(0.3) : .separator, lineWidth: 0.5)
        }
        .accessibilityLabel("\(achievement.name)\(achievement.unlocked ? ", upplåst" : ", låst")")
    }
}

// MARK: - Personal targets

private struct TargetsSection: View {
    @Bindable var vm: PerformanceViewModel

    var body: some View {
        VStack(spacing: AppTheme.Spacing.sm) {
            ForEach($vm.targets) { $target in
                TargetRow(target: $target)
            }

            Button {
                Task { await vm.saveTargets() }
            } label: {
                HStack {
                    if vm.isSavingTargets {
                        ProgressView().scaleEffect(0.8)
                    } else {
                        Image(systemName: "checkmark")
                    }
                    Text(vm.isSavingTargets ? "Sparar…" : "Spara mål")
                }
                .font(.subheadline.bold())
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(AppTheme.Spacing.md)
                .background(AppTheme.Color.brand.gradient, in: .rect(cornerRadius: AppTheme.Radius.sm))
            }
            .buttonStyle(.plain)
            .disabled(vm.isSavingTargets)
            .padding(.horizontal, AppTheme.Spacing.md)
            .padding(.top, AppTheme.Spacing.xs)
        }
        .padding(.horizontal, AppTheme.Spacing.md)
    }
}

private struct TargetRow: View {
    @Binding var target: AgentTarget

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            HStack {
                Image(systemName: target.icon)
                    .foregroundStyle(AppTheme.Color.brand)
                    .accessibilityHidden(true)
                Text(target.label).font(.subheadline.bold())
                Spacer()
                Text("\(target.percentComplete)%")
                    .font(.caption.bold())
                    .foregroundStyle(target.progressFraction >= 1 ? .green : AppTheme.Color.brand)
            }

            ProgressView(value: target.progressFraction)
                .tint(target.progressFraction >= 1 ? .green : AppTheme.Color.brand)

            HStack {
                Text("Nuvarande: \(target.current) \(target.unit)")
                    .font(.caption).foregroundStyle(.secondary)
                Spacer()
                Text("Mål: \(target.target) \(target.unit)")
                    .font(.caption.bold())
            }

            Slider(value: Binding(
                get: { Double(target.target) },
                set: { target.target = Int($0) }
            ), in: 1...Double(target.max), step: 1)
            .tint(AppTheme.Color.brand)
        }
        .padding(AppTheme.Spacing.md)
        .glassCard()
    }
}
