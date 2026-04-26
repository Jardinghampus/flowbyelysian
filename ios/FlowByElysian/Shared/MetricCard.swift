import SwiftUI

struct MetricCard: View {
    let title: String
    let value: String
    let subtitle: String?
    let icon: String
    let tint: Color
    var trend: Double? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Spacing.sm) {
            HStack(alignment: .top) {
                Image(systemName: icon)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(tint)
                    .frame(width: 32, height: 32)
                    .background(tint.opacity(0.14), in: .rect(cornerRadius: DS.Radius.sm))
                    .accessibilityHidden(true)
                Spacer()
                if let trend {
                    TrendBadge(value: trend)
                }
            }

            Text(value)
                .font(AppFont.display(24))
                .minimumScaleFactor(0.7)
                .lineLimit(1)
                .contentTransition(.numericText())

            Text(title)
                .font(AppFont.body(13))
                .foregroundStyle(.secondary)

            if let sub = subtitle {
                Text(sub)
                    .font(AppFont.body(12))
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(DS.Spacing.md)
        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.lg))
        .overlay {
            RoundedRectangle(cornerRadius: DS.Radius.lg)
                .strokeBorder(Color.zBorderSubtle, lineWidth: 0.5)
        }
        .shadow(color: .black.opacity(0.22), radius: 16, y: 6)
        .frame(maxWidth: .infinity)
    }
}

private struct TrendBadge: View {
    let value: Double
    var isUp: Bool { value >= 0 }

    var body: some View {
        Label(String(format: "%.0f%%", abs(value)),
              systemImage: isUp ? "arrow.up.right" : "arrow.down.right")
            .font(AppFont.label(10))
            .foregroundStyle(isUp ? Color.zGreen : Color.zRed)
            .padding(.horizontal, DS.Spacing.sm)
            .padding(.vertical, 3)
            .background((isUp ? Color.zGreen : Color.zRed).opacity(0.1), in: Capsule())
    }
}
