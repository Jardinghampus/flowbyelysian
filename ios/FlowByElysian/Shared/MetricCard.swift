import SwiftUI

struct MetricCard: View {
    let title: String
    let value: String
    let subtitle: String?
    let icon: String
    let tint: Color
    var trend: Double? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            HStack(alignment: .top) {
                Image(systemName: icon)
                    .font(.system(size: 15).weight(.semibold))
                    .foregroundStyle(tint)
                    .frame(width: 32, height: 32)
                    .background(tint.opacity(0.14), in: .rect(cornerRadius: 8))
                Spacer()
                if let trend {
                    TrendBadge(value: trend)
                }
            }

            Text(value)
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .minimumScaleFactor(0.7)
                .lineLimit(1)

            Text(title)
                .font(.footnote)
                .foregroundStyle(.secondary)

            if let sub = subtitle {
                Text(sub)
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(AppTheme.Spacing.md)
        .glassCard()
    }
}

private struct TrendBadge: View {
    let value: Double
    var isUp: Bool { value >= 0 }

    var body: some View {
        Label(String(format: "%.0f%%", abs(value)),
              systemImage: isUp ? "arrow.up.right" : "arrow.down.right")
            .font(.caption.weight(.semibold))
            .foregroundStyle(isUp ? AppTheme.Color.live : .red)
            .padding(.horizontal, 6)
            .padding(.vertical, 3)
            .background((isUp ? AppTheme.Color.live : Color.red).opacity(0.1), in: Capsule())
    }
}
