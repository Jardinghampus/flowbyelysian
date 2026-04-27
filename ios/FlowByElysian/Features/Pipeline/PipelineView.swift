import SwiftUI
import SwiftData

struct PipelineView: View {
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @State private var vm = PipelineViewModel()
    @State private var selectedStage = 0
    @Namespace private var tabNS

    var body: some View {
        VStack(spacing: 0) {
            // Custom stage bar with sliding underline (Revolut-style)
            PipelineStageBar(selected: $selectedStage, vm: vm, namespace: tabNS)

            Divider().opacity(0.5)

            // Paged vertical columns
            TabView(selection: $selectedStage) {
                ForEach(Array(PipelineViewModel.Column.allCases.enumerated()), id: \.offset) { idx, col in
                    PipelineStageList(column: col, requests: vm.requests(for: col)) { req, status in
                        Task { await vm.moveToStatus(req, status: status, context: context) }
                    }
                    .tag(idx)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(DS.Anim.standard, value: selectedStage)
            .ignoresSafeArea(edges: .bottom)
        }
        .background(Color.zBg.ignoresSafeArea())
        .task { await vm.load(context: context) }
        .refreshable { await vm.load(context: context) }
        .overlay(alignment: .topLeading) {
            Button { dismiss() } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.secondary)
                    .frame(width: 30, height: 30)
                    .background(.ultraThinMaterial, in: Circle())
            }
            .padding(.leading, DS.Spacing.base)
            .padding(.top, DS.Spacing.base)
        }
    }
}

// MARK: - Stage tab bar

private struct PipelineStageBar: View {
    @Binding var selected: Int
    let vm: PipelineViewModel
    let namespace: Namespace.ID

    private let columns = PipelineViewModel.Column.allCases

    var body: some View {
        HStack(spacing: 0) {
            ForEach(Array(columns.enumerated()), id: \.offset) { idx, col in
                let isSelected = selected == idx
                let count = vm.requests(for: col).count

                Button {
                    withAnimation(DS.Anim.standard) { selected = idx }
                } label: {
                    VStack(spacing: DS.Spacing.sm) {
                        HStack(spacing: DS.Spacing.xs) {
                            Text(col.title)
                                .font(AppFont.body(14, weight: isSelected ? .semibold : .regular))
                                .foregroundStyle(isSelected ? .primary : .secondary)

                            if count > 0 {
                                Text("\(count)")
                                    .font(AppFont.label(10))
                                    .foregroundStyle(isSelected ? .white : .secondary)
                                    .padding(.horizontal, 5)
                                    .frame(minWidth: 18, minHeight: 18)
                                    .background(isSelected ? col.tint : Color.zCardRaised, in: Capsule())
                            }
                        }

                        // Sliding underline
                        if isSelected {
                            Rectangle()
                                .fill(col.tint)
                                .frame(height: 2)
                                .clipShape(.rect(cornerRadius: 1))
                                .matchedGeometryEffect(id: "underline", in: namespace)
                        } else {
                            Rectangle()
                                .fill(Color.clear)
                                .frame(height: 2)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .contentShape(.rect)
                }
                .buttonStyle(.plain)
                .sensoryFeedback(.selection, trigger: isSelected)
            }
        }
        .padding(.horizontal, DS.Spacing.base)
        .padding(.top, DS.Spacing.xxxl + DS.Spacing.md)
        .padding(.bottom, DS.Spacing.xs)
        .animation(DS.Anim.standard, value: selected)
    }
}

// MARK: - Stage list (one per page)

private struct PipelineStageList: View {
    let column: PipelineViewModel.Column
    let requests: [ClientRequest]
    let onMove: (ClientRequest, String) -> Void

    var body: some View {
        ScrollView {
            if requests.isEmpty {
                emptyState
            } else {
                LazyVStack(spacing: 0) {
                    ForEach(Array(requests.enumerated()), id: \.element.id) { idx, req in
                        PipelineRow(request: req) { status in
                            onMove(req, status)
                        }
                        .staggeredAppear(index: idx)

                        if idx < requests.count - 1 {
                            Divider()
                                .padding(.leading, DS.Spacing.base + 42 + DS.Spacing.md)
                        }
                    }
                }
                .padding(.top, DS.Spacing.sm)
                .padding(.bottom, 120)
            }
        }
        .scrollIndicators(.hidden)
    }

    private var emptyState: some View {
        VStack(spacing: DS.Spacing.md) {
            Circle()
                .fill(column.tint.opacity(0.08))
                .frame(width: 64, height: 64)
                .overlay {
                    Image(systemName: "tray")
                        .font(.title3)
                        .foregroundStyle(column.tint.opacity(0.5))
                }
            Text("No \(column.title.lowercased()) clients")
                .font(AppFont.body(15))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 100)
    }
}

// MARK: - Transaction-style row (Revolut aesthetic)

private struct PipelineRow: View {
    let request: ClientRequest
    let onMove: (String) -> Void
    @State private var showMoveSheet = false
    @State private var showDetail = false

    var body: some View {
        Button { showDetail = true } label: {
            HStack(spacing: DS.Spacing.md) {
                // Avatar
                ZStack {
                    Circle()
                        .fill(avatarColor.opacity(0.10))
                        .frame(width: 42, height: 42)
                    Text(String(request.clientName.prefix(1)).uppercased())
                        .font(AppFont.heading(17))
                        .foregroundStyle(avatarColor)
                }

                // Info stack
                VStack(alignment: .leading, spacing: 3) {
                    Text(request.clientName)
                        .font(AppFont.body(15, weight: .medium))
                        .foregroundStyle(.primary)
                        .lineLimit(1)

                    Text(metaLine)
                        .font(AppFont.body(12))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }

                Spacer()

                // Amount (right-aligned, monospaced like bank)
                VStack(alignment: .trailing, spacing: 3) {
                    Text(request.budgetFormatted)
                        .font(AppFont.mono(14, weight: .semibold))
                        .foregroundStyle(.primary)
                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(.tertiary)
                }
            }
            .padding(.horizontal, DS.Spacing.base)
            .padding(.vertical, DS.Spacing.md)
            .contentShape(.rect)
        }
        .buttonStyle(.plain)
        .sheet(isPresented: $showDetail) {
            PipelineDetailSheet(request: request, onMove: { status in
                onMove(status)
                showDetail = false
            })
            .presentationDetents([.medium])
            .presentationDragIndicator(.visible)
            .presentationCornerRadius(DS.Radius.xl)
        }
    }

    private var metaLine: String {
        [request.propertyType?.capitalized, request.bedrooms.map { $0 > 0 ? "\($0) BR" : nil } ?? nil, request.areaName]
            .compactMap { $0 }.joined(separator: " · ")
    }

    private var avatarColor: Color {
        let colors: [Color] = [.zBlue, .zPurple, .zGreen, .zOrange]
        let idx = abs(request.clientName.hashValue) % colors.count
        return colors[idx]
    }
}

// MARK: - Detail / Move sheet

private struct PipelineDetailSheet: View {
    let request: ClientRequest
    let onMove: (String) -> Void

    private let stages: [(String, String, Color)] = [
        ("active",  "Active",  .zGreen),
        ("matched", "Matched", .zBlue),
        ("closed",  "Closed",  .secondary)
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Client header
            VStack(spacing: DS.Spacing.sm) {
                Circle()
                    .fill(Color.zBlue.opacity(0.10))
                    .frame(width: 56, height: 56)
                    .overlay {
                        Text(String(request.clientName.prefix(1)).uppercased())
                            .font(AppFont.heading(24))
                            .foregroundStyle(Color.zBlue)
                    }

                Text(request.clientName)
                    .font(AppFont.heading(18))

                Text(request.budgetFormatted)
                    .font(AppFont.mono(15, weight: .semibold))
                    .foregroundStyle(Color.zBlue)
            }
            .padding(.top, DS.Spacing.xl)
            .padding(.bottom, DS.Spacing.lg)

            Divider().padding(.horizontal, DS.Spacing.base)

            // Property details
            VStack(spacing: 0) {
                if let type = request.propertyType {
                    DetailLine(label: "Type", value: type.capitalized)
                }
                if let beds = request.bedrooms, beds > 0 {
                    DetailLine(label: "Bedrooms", value: "\(beds)")
                }
                if let area = request.areaName {
                    DetailLine(label: "Area", value: area)
                }
                if let notes = request.notes, !notes.isEmpty {
                    DetailLine(label: "Notes", value: notes)
                }
            }
            .padding(.horizontal, DS.Spacing.base)
            .padding(.top, DS.Spacing.sm)

            Divider().padding(.horizontal, DS.Spacing.base).padding(.top, DS.Spacing.sm)

            // Move buttons
            VStack(alignment: .leading, spacing: DS.Spacing.xs) {
                Text("Move to")
                    .font(AppFont.label(11))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)
                    .tracking(0.8)
                    .padding(.horizontal, DS.Spacing.base)
                    .padding(.top, DS.Spacing.md)

                HStack(spacing: DS.Spacing.sm) {
                    ForEach(stages, id: \.0) { status, label, color in
                        let isCurrent = request.status == status
                        Button(label) { if !isCurrent { onMove(status) } }
                            .font(AppFont.body(14, weight: isCurrent ? .semibold : .regular))
                            .foregroundStyle(isCurrent ? .white : .primary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, DS.Spacing.md)
                            .background(isCurrent ? color : Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
                            .overlay {
                                if !isCurrent {
                                    RoundedRectangle(cornerRadius: DS.Radius.md)
                                        .strokeBorder(Color.zBorderDefault, lineWidth: 0.5)
                                }
                            }
                            .disabled(isCurrent)
                            .buttonStyle(LiquidButtonStyle())
                    }
                }
                .padding(.horizontal, DS.Spacing.base)
                .padding(.bottom, DS.Spacing.xxxl)
            }
        }
        .background(Color.zBg)
    }
}

private struct DetailLine: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .font(AppFont.body(14))
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(AppFont.body(14, weight: .medium))
                .foregroundStyle(.primary)
                .multilineTextAlignment(.trailing)
        }
        .padding(.vertical, DS.Spacing.sm + 2)
        Divider().opacity(0.4)
    }
}

// MARK: - Column header (kept for ViewModel compatibility)

struct PipelineColumnHeader: View {
    let column: PipelineViewModel.Column
    let count: Int

    var body: some View {
        HStack(spacing: DS.Spacing.xs) {
            Circle().fill(column.tint).frame(width: 8, height: 8)
            Text(column.title).font(AppFont.heading(14))
            Text("\(count)")
                .font(AppFont.label(11))
                .foregroundStyle(.white)
                .padding(.horizontal, 6)
                .frame(minWidth: 20, minHeight: 20)
                .background(column.tint.opacity(0.8), in: Capsule())
        }
    }
}
