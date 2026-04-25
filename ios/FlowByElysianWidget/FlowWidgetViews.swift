import WidgetKit
import SwiftUI

// MARK: - Entry view router

struct FlowWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: FlowWidgetEntry

    var body: some View {
        switch family {
        case .systemSmall:  SmallWidgetView(data: entry.data)
        case .systemMedium: MediumWidgetView(data: entry.data)
        default:            MediumWidgetView(data: entry.data)
        }
    }
}

// MARK: - Medium widget (main design)

struct MediumWidgetView: View {
    let data: WidgetData

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {

            // ── Header ──────────────────────────────────────────
            HStack {
                HStack(spacing: 5) {
                    Image(systemName: "f.square.fill")
                        .foregroundStyle(.white)
                        .font(.caption.bold())
                        .accessibilityHidden(true)
                    Text("Flow")
                        .font(.caption.bold())
                        .foregroundStyle(.white.opacity(0.9))
                }
                Spacer()
                if data.currentRank > 0 {
                    Text("#\(data.currentRank)")
                        .font(.caption2.bold())
                        .foregroundStyle(.white.opacity(0.75))
                }
            }

            Spacer(minLength: 0)

            // ── Upcoming event ───────────────────────────────────
            if let event = data.upcomingEvents.first {
                HStack(spacing: 6) {
                    Image(systemName: "calendar")
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.7))
                        .accessibilityHidden(true)
                    Text(event.title)
                        .font(.caption.bold())
                        .foregroundStyle(.white)
                        .lineLimit(1)
                    Spacer()
                    VStack(alignment: .trailing, spacing: 1) {
                        Text(event.dayString)
                            .font(.caption2)
                            .foregroundStyle(.white.opacity(0.7))
                        Text(event.timeString)
                            .font(.caption2.bold())
                            .foregroundStyle(.white)
                    }
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 5)
                .background(.white.opacity(0.12), in: .rect(cornerRadius: 7))
            } else {
                Text("Inga kommande händelser")
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.5))
            }

            Spacer(minLength: 0)

            // ── Stats row ───────────────────────────────────────
            HStack(spacing: 0) {
                WidgetStat(
                    icon: "sparkles",
                    value: "\(data.matchCount)",
                    label: "matches"
                )
                WidgetDivider()
                WidgetStat(
                    icon: "building.2.fill",
                    value: "\(data.liveListingsCount)",
                    label: "live"
                )
                WidgetDivider()
                WidgetStat(
                    icon: "percent",
                    value: "\(data.commissionPercent)%",
                    label: "provision"
                )
            }

            Spacer(minLength: 0)

            // ── Commission bar ──────────────────────────────────
            VStack(alignment: .leading, spacing: 3) {
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(.white.opacity(0.2)).frame(height: 5)
                        Capsule()
                            .fill(.white)
                            .frame(width: geo.size.width * data.commissionFraction, height: 5)
                    }
                }
                .frame(height: 5)

                HStack {
                    Text("Provision")
                        .font(.system(size: 9))
                        .foregroundStyle(.white.opacity(0.6))
                    Spacer()
                    Text(formatAED(data.commissionCurrent) + " / " + formatAED(data.commissionTarget))
                        .font(.system(size: 9, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.8))
                }
            }
        }
        .padding(14)
        .background(brandGradient)
    }

    private var brandGradient: some View {
        LinearGradient(
            colors: [Color(red: 0.37, green: 0.26, blue: 0.83),
                     Color(red: 0.25, green: 0.18, blue: 0.60)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    private func formatAED(_ value: Int) -> String {
        if value >= 1_000_000 {
            return String(format: "%.1fM", Double(value) / 1_000_000)
        }
        if value >= 1_000 {
            return "\(value / 1_000)K"
        }
        return "\(value)"
    }
}

// MARK: - Small widget

struct SmallWidgetView: View {
    let data: WidgetData

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {

            // Header
            HStack {
                Image(systemName: "f.square.fill")
                    .foregroundStyle(.white)
                    .font(.caption.bold())
                    .accessibilityHidden(true)
                Text("Flow")
                    .font(.caption.bold())
                    .foregroundStyle(.white)
                Spacer()
            }

            Spacer(minLength: 0)

            // Stats 2×2
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 6) {
                SmallStat(icon: "sparkles",      value: "\(data.matchCount)",        label: "matches")
                SmallStat(icon: "building.2",    value: "\(data.liveListingsCount)", label: "live")
                SmallStat(icon: "calendar",
                          value: "\(data.upcomingEvents.count)",
                          label: "events")
                SmallStat(icon: "percent",       value: "\(data.commissionPercent)%", label: "mål")
            }

            Spacer(minLength: 0)

            // Commission bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(.white.opacity(0.2)).frame(height: 4)
                    Capsule()
                        .fill(.white)
                        .frame(width: geo.size.width * data.commissionFraction, height: 4)
                }
            }
            .frame(height: 4)
        }
        .padding(12)
        .background(
            LinearGradient(
                colors: [Color(red: 0.37, green: 0.26, blue: 0.83),
                         Color(red: 0.25, green: 0.18, blue: 0.60)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}

// MARK: - Shared sub-views

private struct WidgetStat: View {
    let icon: String
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 2) {
            Image(systemName: icon)
                .font(.caption2)
                .foregroundStyle(.white.opacity(0.7))
                .accessibilityHidden(true)
            Text(value)
                .font(.subheadline.bold())
                .foregroundStyle(.white)
            Text(label)
                .font(.system(size: 9))
                .foregroundStyle(.white.opacity(0.6))
        }
        .frame(maxWidth: .infinity)
    }
}

private struct SmallStat: View {
    let icon: String
    let value: String
    let label: String

    var body: some View {
        VStack(spacing: 2) {
            HStack(spacing: 3) {
                Image(systemName: icon)
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.7))
                    .accessibilityHidden(true)
                Text(value)
                    .font(.caption.bold())
                    .foregroundStyle(.white)
            }
            Text(label)
                .font(.system(size: 9))
                .foregroundStyle(.white.opacity(0.6))
        }
        .frame(maxWidth: .infinity)
    }
}

private struct WidgetDivider: View {
    var body: some View {
        Rectangle()
            .fill(.white.opacity(0.15))
            .frame(width: 0.5, height: 32)
    }
}
