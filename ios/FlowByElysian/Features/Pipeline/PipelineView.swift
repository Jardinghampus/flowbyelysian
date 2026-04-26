import SwiftUI
import SwiftData

struct PipelineView: View {
    @Environment(\.modelContext) private var context
    @State private var vm = PipelineViewModel()
    @State private var isKanban = true
    @State private var draggedRequest: ClientRequest?

    var body: some View {
        NavigationStack {
            Group {
                if isKanban {
                    kanbanBoard
                } else {
                    listView
                }
            }
            .background(Color.zBg.ignoresSafeArea())
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { pipelineToolbar }
            .refreshable { await vm.load(context: context) }
        }
        .task { await vm.load(context: context) }
    }

    // MARK: - Kanban board

    private var kanbanBoard: some View {
        ScrollView(.horizontal) {
            HStack(alignment: .top, spacing: DS.Spacing.md) {
                ForEach(PipelineViewModel.Column.allCases, id: \.self) { column in
                    KanbanColumn(
                        column: column,
                        requests: vm.requests(for: column),
                        draggedRequest: $draggedRequest
                    ) { req in
                        Task { await vm.move(req, to: column, context: context) }
                    }
                }
            }
            .padding(DS.Spacing.base)
        }
        .scrollIndicators(.hidden)
    }

    // MARK: - List view

    private var listView: some View {
        ScrollView {
            VStack(spacing: DS.Spacing.sm) {
                ForEach(PipelineViewModel.Column.allCases, id: \.self) { column in
                    let reqs = vm.requests(for: column)
                    if !reqs.isEmpty {
                        VStack(alignment: .leading, spacing: DS.Spacing.xs) {
                            PipelineColumnHeader(column: column, count: reqs.count)
                                .padding(.horizontal, DS.Spacing.base)
                            ForEach(reqs) { req in
                                PipelineListRow(request: req) { newStatus in
                                    Task { await vm.moveToStatus(req, status: newStatus, context: context) }
                                }
                                .padding(.horizontal, DS.Spacing.base)
                            }
                        }
                        .padding(.top, DS.Spacing.sm)
                    }
                }
            }
            .padding(.vertical, DS.Spacing.md)
            .padding(.bottom, DS.Spacing.xl)
        }
        .scrollIndicators(.hidden)
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var pipelineToolbar: some ToolbarContent {
        ToolbarItem(placement: .principal) {
            Text("Pipeline").font(.headline)
        }
        ToolbarItem(placement: .topBarTrailing) {
            Button {
                withAnimation(DS.Anim.quick) { isKanban.toggle() }
            } label: {
                Image(systemName: isKanban ? "list.bullet" : "rectangle.split.3x1")
                    .symbolEffect(.bounce, value: isKanban)
            }
            .tint(Color.zBlue)
        }
    }
}

// MARK: - Kanban column

private struct KanbanColumn: View {
    let column: PipelineViewModel.Column
    let requests: [ClientRequest]
    @Binding var draggedRequest: ClientRequest?
    let onDrop: (ClientRequest) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Spacing.sm) {
            PipelineColumnHeader(column: column, count: requests.count)
                .padding(.horizontal, DS.Spacing.sm)

            VStack(spacing: DS.Spacing.sm) {
                ForEach(requests) { req in
                    KanbanCard(request: req)
                        .draggable(req.id) {
                            KanbanCard(request: req)
                                .frame(width: 240)
                                .opacity(0.85)
                        }
                        .opacity(draggedRequest?.id == req.id ? 0.4 : 1)
                        .onDrag {
                            draggedRequest = req
                            return NSItemProvider(object: req.id as NSString)
                        }
                }

                if requests.isEmpty {
                    Text("Drop here")
                        .font(AppFont.body(13))
                        .foregroundStyle(.tertiary)
                        .frame(maxWidth: .infinity)
                        .frame(height: 80)
                        .background(Color.zCard.opacity(0.5), in: .rect(cornerRadius: DS.Radius.md))
                        .overlay {
                            RoundedRectangle(cornerRadius: DS.Radius.md)
                                .strokeBorder(Color.zBorderDefault, style: StrokeStyle(lineWidth: 1, dash: [6]))
                        }
                }
            }
        }
        .frame(width: 240)
        .dropDestination(for: String.self) { ids, _ in
            guard let id = ids.first,
                  let req = draggedRequest, req.id == id else { return false }
            onDrop(req)
            draggedRequest = nil
            return true
        }
    }
}

// MARK: - Kanban card

private struct KanbanCard: View {
    let request: ClientRequest

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Spacing.xs) {
            HStack {
                Text(request.clientName)
                    .font(AppFont.heading(14))
                    .lineLimit(1)
                Spacer()
                Image(systemName: "line.3.horizontal")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            if let area = request.areaName {
                Label(area, systemImage: "mappin")
                    .font(AppFont.body(12))
                    .foregroundStyle(.secondary)
            }

            HStack {
                if let type = request.propertyType {
                    Text(type.capitalized)
                        .font(AppFont.label(10))
                        .padding(.horizontal, DS.Spacing.sm)
                        .padding(.vertical, 3)
                        .background(Color.zCardRaised, in: Capsule())
                }
                if let beds = request.bedrooms, beds > 0 {
                    Text("\(beds) BR")
                        .font(AppFont.label(10))
                        .padding(.horizontal, DS.Spacing.sm)
                        .padding(.vertical, 3)
                        .background(Color.zCardRaised, in: Capsule())
                }
            }

            Text(request.budgetFormatted)
                .font(AppFont.body(13, weight: .semibold))
                .foregroundStyle(Color.zBlue)
        }
        .padding(DS.Spacing.md)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
        .overlay {
            RoundedRectangle(cornerRadius: DS.Radius.md)
                .strokeBorder(Color.zBorderSubtle, lineWidth: 0.5)
        }
        .shadow(color: .black.opacity(0.2), radius: 8, y: 3)
    }
}

// MARK: - List row

private struct PipelineListRow: View {
    let request: ClientRequest
    let onStatusChange: (String) -> Void

    var body: some View {
        HStack(spacing: DS.Spacing.sm) {
            Circle()
                .fill(Color.zBlue.opacity(0.12))
                .frame(width: 40, height: 40)
                .overlay {
                    Text(String(request.clientName.prefix(1)).uppercased())
                        .font(AppFont.heading(16))
                        .foregroundStyle(Color.zBlue)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(request.clientName)
                    .font(AppFont.body(14, weight: .semibold))
                Text(request.budgetFormatted)
                    .font(AppFont.body(12))
                    .foregroundStyle(Color.zBlue)
            }

            Spacer()

            if let status = request.status {
                StatusBadge(status: status)
            }
        }
        .padding(DS.Spacing.sm + 2)
        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
        .overlay {
            RoundedRectangle(cornerRadius: DS.Radius.md)
                .strokeBorder(Color.zBorderSubtle, lineWidth: 0.5)
        }
        .contextMenu {
            Menu("Move to", systemImage: "arrow.right.circle") {
                Button("Active")  { onStatusChange("active")  }
                Button("Matched") { onStatusChange("matched") }
                Button("Closed")  { onStatusChange("closed")  }
            }
        }
    }
}

// MARK: - Column header

struct PipelineColumnHeader: View {
    let column: PipelineViewModel.Column
    let count: Int

    var body: some View {
        HStack(spacing: DS.Spacing.xs) {
            Circle()
                .fill(column.tint)
                .frame(width: 8, height: 8)
            Text(column.title)
                .font(AppFont.heading(14))
            Text("\(count)")
                .font(AppFont.label(11))
                .foregroundStyle(.white)
                .padding(.horizontal, 6)
                .frame(minWidth: 20, minHeight: 20)
                .background(column.tint.opacity(0.8), in: Capsule())
        }
    }
}
