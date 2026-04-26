import SwiftUI
import Charts

struct PerformanceChartsSection: View {
    let vm: PerformanceViewModel
    @State private var selectedChart = 0

    private var lastMonth: MonthlyStats? { vm.monthlyStats.last }
    private var prevMonth: MonthlyStats? {
        guard vm.monthlyStats.count >= 2 else { return nil }
        return vm.monthlyStats[vm.monthlyStats.count - 2]
    }

    var body: some View {
        VStack(spacing: AppTheme.Spacing.md) {
            // KPI summary row
            HStack(spacing: AppTheme.Spacing.sm) {
                StatKPICard(
                    label: "Provision (månad)",
                    value: formattedCommission(lastMonth?.commission ?? 0),
                    delta: commissionDelta,
                    icon: "banknote.fill",
                    tint: AppTheme.Color.brand
                )
                StatKPICard(
                    label: "Affärer (månad)",
                    value: "\(lastMonth?.deals ?? 0)",
                    delta: dealsDelta,
                    icon: "checkmark.seal.fill",
                    tint: .green
                )
            }
            .padding(.horizontal, AppTheme.Spacing.md)
            .staggeredAppear(index: 0)

            // Chart type picker
            Picker("Visa", selection: $selectedChart) {
                Text("Provision").tag(0)
                Text("Affärer").tag(1)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, AppTheme.Spacing.md)
            .staggeredAppear(index: 1)

            Group {
                if selectedChart == 0 {
                    CommissionChart(stats: vm.monthlyStats)
                        .transition(.asymmetric(
                            insertion: .move(edge: .leading).combined(with: .opacity),
                            removal:   .move(edge: .trailing).combined(with: .opacity)
                        ))
                } else {
                    DealsChart(stats: vm.monthlyStats)
                        .transition(.asymmetric(
                            insertion: .move(edge: .trailing).combined(with: .opacity),
                            removal:   .move(edge: .leading).combined(with: .opacity)
                        ))
                }
            }
            .animation(.spring(response: 0.38, dampingFraction: 0.82), value: selectedChart)
            .staggeredAppear(index: 2)
        }
        .padding(.bottom, AppTheme.Spacing.md)
    }

    private var commissionDelta: Double? {
        guard let last = lastMonth?.commission, let prev = prevMonth?.commission, prev > 0 else { return nil }
        return (last - prev) / prev * 100
    }

    private var dealsDelta: Double? {
        guard let last = lastMonth?.deals, let prev = prevMonth?.deals, prev > 0 else { return nil }
        return Double(last - prev) / Double(prev) * 100
    }

    private func formattedCommission(_ value: Double) -> String {
        if value >= 1_000_000 {
            return String(format: "%.1fM", value / 1_000_000) + " AED"
        }
        return String(format: "%.0fk", value / 1_000) + " AED"
    }
}

// MARK: - KPI card

private struct StatKPICard: View {
    let label: String
    let value: String
    let delta: Double?
    let icon: String
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            HStack {
                Image(systemName: icon)
                    .font(.caption)
                    .foregroundStyle(tint)
                    .accessibilityHidden(true)
                Spacer()
                if let d = delta {
                    Label(String(format: "%.0f%%", abs(d)),
                          systemImage: d >= 0 ? "arrow.up" : "arrow.down")
                        .font(.caption2.bold())
                        .foregroundStyle(d >= 0 ? .green : .red)
                        .labelStyle(.titleAndIcon)
                }
            }
            Text(value)
                .font(.title3.bold())
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
        .padding(AppTheme.Spacing.sm + 4)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassCard(radius: AppTheme.Radius.sm + 2)
        .accessibilityElement(children: .combine)
    }
}

// MARK: - Commission area/line chart

private struct CommissionChart: View {
    let stats: [MonthlyStats]

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            Text("Provision 6 månader (AED)")
                .font(.caption.bold())
                .foregroundStyle(.secondary)

            Chart(stats) { stat in
                AreaMark(
                    x: .value("Månad", stat.month),
                    y: .value("Provision", stat.commission)
                )
                .foregroundStyle(
                    LinearGradient(
                        gradient: Gradient(stops: [
                            .init(color: AppTheme.Color.brand.opacity(0.28), location: 0),
                            .init(color: .clear, location: 1),
                        ]),
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .interpolationMethod(.catmullRom)

                LineMark(
                    x: .value("Månad", stat.month),
                    y: .value("Provision", stat.commission)
                )
                .foregroundStyle(AppTheme.Color.brand)
                .lineStyle(StrokeStyle(lineWidth: 2.5))
                .interpolationMethod(.catmullRom)

                PointMark(
                    x: .value("Månad", stat.month),
                    y: .value("Provision", stat.commission)
                )
                .foregroundStyle(AppTheme.Color.brand)
                .symbolSize(36)
            }
            .chartYAxis {
                AxisMarks(position: .leading, values: .automatic(desiredCount: 4)) { value in
                    AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                        .foregroundStyle(Color(.separator))
                    AxisValueLabel {
                        if let v = value.as(Double.self) {
                            Text(v >= 1000 ? "\(Int(v / 1000))k" : "\(Int(v))")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .chartXAxis {
                AxisMarks { _ in
                    AxisValueLabel()
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(height: 200)
        }
        .padding(AppTheme.Spacing.md)
        .glassCard()
        .padding(.horizontal, AppTheme.Spacing.md)
    }
}

// MARK: - Deals bar chart

private struct DealsChart: View {
    let stats: [MonthlyStats]

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            Text("Affärer stängda 6 månader")
                .font(.caption.bold())
                .foregroundStyle(.secondary)

            Chart(stats) { stat in
                BarMark(
                    x: .value("Månad", stat.month),
                    y: .value("Affärer", stat.deals)
                )
                .foregroundStyle(AppTheme.Color.brand.gradient)
                .annotation(position: .top, alignment: .center) {
                    Text("\(stat.deals)")
                        .font(.caption2.bold())
                        .foregroundStyle(AppTheme.Color.brand)
                }
            }
            .chartYAxis {
                AxisMarks(position: .leading, values: .automatic(desiredCount: 4)) { _ in
                    AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                        .foregroundStyle(Color(.separator))
                    AxisValueLabel()
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            .chartXAxis {
                AxisMarks { _ in
                    AxisValueLabel()
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(height: 200)
        }
        .padding(AppTheme.Spacing.md)
        .glassCard()
        .padding(.horizontal, AppTheme.Spacing.md)
    }
}
