import SwiftUI
import SwiftData

struct ReportsView: View {
    @Environment(AppState.self) private var appState
    @Environment(AuthManager.self) private var auth
    @Environment(NetworkMonitor.self) private var network
    @Environment(\.modelContext) private var context
    @State private var vm = ReportsViewModel()
    @State private var shareItem: PDFShareItem?

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading {
                    ProgressView("Loading data…")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    reportsList
                }
            }
            .background(.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { reportsToolbar }
            .sheet(item: $shareItem) { item in
                ShareSheet(activityItems: [item.data])
                    .presentationDetents([.medium, .large])
            }
            .refreshable { await vm.load(context: context, isOnline: network.isConnected) }
        }
        .task { await vm.load(context: context, isOnline: network.isConnected) }
    }

    private var reportsList: some View {
        ScrollView {
            VStack(spacing: AppTheme.Spacing.sm) {
                ReportsSummaryRow(listingCount: vm.listings.count, requestCount: vm.requests.count)

                SectionLabel(title: "Generate Report")

                ReportCard(
                    title: "Landlord Report",
                    subtitle: "Complete portfolio overview for property owners",
                    icon: "doc.text.fill",
                    tint: AppTheme.Color.brand,
                    isGenerating: vm.isGenerating
                ) {
                    let agentName = auth.currentUser?.name ?? "Agent"
                    let pdf = await vm.generateLandlordReport(agentName: agentName)
                    shareItem = PDFShareItem(data: pdf, filename: "landlord-report.pdf")
                }

                ReportCard(
                    title: "Inventory Report",
                    subtitle: "Sorted by property type with prices and status",
                    icon: "list.clipboard.fill",
                    tint: .mint,
                    isGenerating: vm.isGenerating
                ) {
                    let agentName = auth.currentUser?.name ?? "Agent"
                    let pdf = await vm.generateInventoryReport(agentName: agentName)
                    shareItem = PDFShareItem(data: pdf, filename: "inventory-report.pdf")
                }

                ReportCard(
                    title: "Performance Report",
                    subtitle: "KPIs, conversion rate and pipeline status",
                    icon: "chart.bar.doc.horizontal.fill",
                    tint: AppTheme.Color.live,
                    isGenerating: vm.isGenerating
                ) {
                    let agentName = auth.currentUser?.name ?? "Agent"
                    let pdf = await vm.generatePerformanceReport(agentName: agentName)
                    shareItem = PDFShareItem(data: pdf, filename: "performance-report.pdf")
                }

                Text("Reports are generated as PDF and can be shared or saved to Files.")
                    .font(.footnote)
                    .foregroundStyle(.tertiary)
                    .multilineTextAlignment(.center)
                    .padding(.top, AppTheme.Spacing.sm)
            }
            .padding(AppTheme.Spacing.md)
        }
        .scrollIndicators(.hidden)
    }

    @ToolbarContentBuilder
    private var reportsToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Menu", systemImage: "line.3.horizontal") { appState.openDrawer() }
        }
        ToolbarItem(placement: .principal) {
            Text("Reports")
                .font(.headline)
        }
    }
}

// MARK: - Sub-views

private struct ReportsSummaryRow: View {
    let listingCount: Int
    let requestCount: Int

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            SummaryPill(label: "Listings", value: "\(listingCount)", icon: "building.2.fill", tint: Color.zBlue)
            SummaryPill(label: "Clients",  value: "\(requestCount)", icon: "person.2.fill",   tint: .mint)
        }
    }
}

private struct SummaryPill: View {
    let label: String
    let value: String
    let icon: String
    let tint: Color

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Image(systemName: icon)
                .foregroundStyle(tint)
            VStack(alignment: .leading, spacing: 1) {
                Text(value).font(.headline)
                Text(label).font(.caption).foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppTheme.Spacing.md)
        .glassCard()
    }
}

private struct SectionLabel: View {
    let title: String

    var body: some View {
        Text(title)
            .font(.headline)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, AppTheme.Spacing.sm)
    }
}

private struct ReportCard: View {
    let title: String
    let subtitle: String
    let icon: String
    let tint: Color
    let isGenerating: Bool
    let onGenerate: () async -> Void

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            RoundedRectangle(cornerRadius: 12)
                .fill(tint.opacity(0.15))
                .frame(width: 52, height: 52)
                .overlay {
                    Image(systemName: icon)
                        .font(.title3)
                        .foregroundStyle(tint)
                }

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.subheadline.bold())
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button {
                Task { await onGenerate() }
            } label: {
                if isGenerating {
                    ProgressView()
                        .frame(width: 44, height: 44)
                } else {
                    Image(systemName: "arrow.down.circle.fill")
                        .font(.title2)
                        .foregroundStyle(tint)
                        .frame(minWidth: 44, minHeight: 44)
                }
            }
            .disabled(isGenerating)
            .sensoryFeedback(.impact(flexibility: .soft), trigger: isGenerating)
        }
        .padding(AppTheme.Spacing.md)
        .glassCard()
    }
}

// MARK: - Helpers

struct PDFShareItem: Identifiable {
    let id = UUID()
    let data: Data
    let filename: String
}

// ShareSheet is defined in ListingDetailView.swift
