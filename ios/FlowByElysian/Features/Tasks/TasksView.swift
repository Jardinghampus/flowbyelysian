import SwiftUI
import SwiftData

struct TasksView: View {
    @Environment(NetworkMonitor.self) private var network
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @State private var vm = TasksViewModel()
    @State private var showAdd = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                TaskKPIStrip(vm: vm)
                    .padding(AppTheme.Spacing.md)

                TaskFilterBar(vm: vm)

                Divider()

                if vm.filteredTasks.isEmpty {
                    ContentUnavailableView(
                        "No Tasks",
                        systemImage: "checkmark.circle",
                        description: Text(vm.searchText.isEmpty ? "Tap + to add a task" : "No results for \"\(vm.searchText)\"")
                    )
                    .frame(maxHeight: .infinity)
                } else {
                    taskList
                }
            }
            .background(.background)
            .navigationTitle("Tasks")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { tasksToolbar }
            .searchable(text: Bindable(vm).searchText, prompt: "Search tasks…")
            .sheet(isPresented: $showAdd) { AddTaskView { payload in
                try await vm.createTask(payload, context: context)
            }}
            .refreshable { await vm.load(context: context, isOnline: network.isConnected) }
        }
        .task { await vm.load(context: context, isOnline: network.isConnected) }
    }

    private var taskList: some View {
        List {
            ForEach(TaskItem.TaskStatus.allCases, id: \.self) { status in
                let group = vm.filteredTasks.filter { $0.status == status }
                if !group.isEmpty {
                    Section(status.label) {
                        ForEach(group) { task in
                            TaskRow(task: task) { newStatus in
                                Task { await vm.updateStatus(task, status: newStatus, context: context) }
                            }
                            .listRowSeparator(.hidden)
                            .listRowBackground(Color.clear)
                            .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                Button("Delete", role: .destructive) {
                                    Task { await vm.deleteTask(task, context: context) }
                                }
                            }
                            .swipeActions(edge: .leading, allowsFullSwipe: true) {
                                if status != .completed {
                                    Button("Done", systemImage: "checkmark") {
                                        Task { await vm.updateStatus(task, status: .completed, context: context) }
                                    }
                                    .tint(.green)
                                }
                            }
                        }
                    }
                }
            }
        }
        .listStyle(.plain)
    }

    @ToolbarContentBuilder
    private var tasksToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Close", action: dismiss.callAsFunction)
        }
        ToolbarItem(placement: .topBarTrailing) {
            if vm.isLoading {
                ProgressView()
            } else {
                Button("Add", systemImage: "plus") { showAdd = true }
            }
        }
    }
}

// MARK: - KPI strip

private struct TaskKPIStrip: View {
    let vm: TasksViewModel

    var body: some View {
        HStack(spacing: 0) {
            TaskKPI(label: "To Do",      value: vm.todoCount,       color: .secondary)
            TaskKPI(label: "In Progress", value: vm.inProgressCount, color: AppTheme.Color.brand)
            TaskKPI(label: "Done",        value: vm.completedCount,  color: .green)
        }
        .glassCard(radius: AppTheme.Radius.sm)
    }
}

private struct TaskKPI: View {
    let label: String
    let value: Int
    let color: Color

    var body: some View {
        VStack(spacing: 2) {
            Text(value.formatted())
                .font(.title3.bold())
                .foregroundStyle(color)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, AppTheme.Spacing.sm)
    }
}

// MARK: - Filter bar

private struct TaskFilterBar: View {
    @Bindable var vm: TasksViewModel

    var body: some View {
        ScrollView(.horizontal) {
            HStack(spacing: AppTheme.Spacing.xs) {
                FilterChip(label: "All", isSelected: vm.filterStatus == nil) {
                    vm.filterStatus = nil
                }
                ForEach(TaskItem.TaskStatus.allCases, id: \.self) { s in
                    FilterChip(label: s.label, isSelected: vm.filterStatus == s) {
                        vm.filterStatus = vm.filterStatus == s ? nil : s
                    }
                }
            }
            .padding(.horizontal, AppTheme.Spacing.md)
            .padding(.vertical, AppTheme.Spacing.sm)
        }
        .scrollIndicators(.hidden)
    }
}

// MARK: - Task row

private struct TaskRow: View {
    let task: TaskItem
    let onStatusChange: (TaskItem.TaskStatus) -> Void

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Button {
                onStatusChange(nextStatus(task.status))
            } label: {
                Image(systemName: task.status.icon)
                    .font(.title3)
                    .foregroundStyle(statusColor(task.status))
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Status: \(task.status.label)")

            VStack(alignment: .leading, spacing: 3) {
                Text(task.title)
                    .font(.subheadline)
                    .foregroundStyle(task.status == .completed ? .secondary : .primary)
                    .strikethrough(task.status == .completed)
                    .lineLimit(2)

                HStack(spacing: AppTheme.Spacing.xs) {
                    PriorityPill(priority: task.priority)
                    Image(systemName: task.category.icon)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                    Text(task.category.label)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                    if let due = task.dueDate {
                        Spacer()
                        Label(due, systemImage: "calendar")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Spacer()
        }
        .padding(AppTheme.Spacing.sm + 2)
        .background(.background, in: .rect(cornerRadius: AppTheme.Radius.sm))
        .overlay {
            RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                .strokeBorder(.separator, lineWidth: 0.5)
        }
        .accessibilityLabel("\(task.title), \(task.status.label), \(task.priority.label) priority")
    }

    private func nextStatus(_ current: TaskItem.TaskStatus) -> TaskItem.TaskStatus {
        switch current {
        case .todo:       return .inProgress
        case .inProgress: return .completed
        case .completed:  return .todo
        case .cancelled:  return .todo
        }
    }

    private func statusColor(_ status: TaskItem.TaskStatus) -> Color {
        switch status {
        case .todo:       return .secondary
        case .inProgress: return AppTheme.Color.brand
        case .completed:  return .green
        case .cancelled:  return .red
        }
    }
}

struct PriorityPill: View {
    let priority: TaskItem.TaskPriority

    private var color: Color {
        switch priority {
        case .low:       return .secondary
        case .medium:    return .blue
        case .important: return .orange
        case .critical:  return .red
        }
    }

    var body: some View {
        Text(priority.label)
            .font(.caption2.bold())
            .foregroundStyle(color)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(color.opacity(0.12), in: Capsule())
    }
}

// MARK: - Add task sheet

struct AddTaskView: View {
    @Environment(\.dismiss) private var dismiss
    let onSave: (NewTaskPayload) async throws -> Void

    @State private var title    = ""
    @State private var status   = TaskItem.TaskStatus.todo
    @State private var priority = TaskItem.TaskPriority.medium
    @State private var category = TaskItem.TaskCategory.general
    @State private var notes    = ""
    @State private var isSaving = false
    @State private var errorMessage: String?

    private var isValid: Bool { !title.trimmingCharacters(in: .whitespaces).isEmpty }

    var body: some View {
        NavigationStack {
            Form {
                Section("Task") {
                    TextField("Title *", text: $title)
                }
                Section("Classification") {
                    Picker("Status",   selection: $status)   { ForEach(TaskItem.TaskStatus.allCases,   id: \.self) { Text($0.label).tag($0) } }
                    Picker("Priority", selection: $priority) { ForEach(TaskItem.TaskPriority.allCases, id: \.self) { Text($0.label).tag($0) } }
                    Picker("Category", selection: $category) { ForEach(TaskItem.TaskCategory.allCases, id: \.self) { Text($0.label).tag($0) } }
                }
                Section("Notes") {
                    TextField("Optional…", text: $notes, axis: .vertical)
                        .lineLimit(3...)
                }
                if let err = errorMessage {
                    Section { Text(err).foregroundStyle(.red).font(.caption) }
                }
            }
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading)  { Button("Cancel", action: dismiss.callAsFunction) }
                ToolbarItem(placement: .topBarTrailing) {
                    if isSaving { ProgressView() }
                    else {
                        Button("Save") { save() }
                            .bold()
                            .disabled(!isValid)
                    }
                }
            }
            .disabled(isSaving)
        }
    }

    private func save() {
        let payload = NewTaskPayload(
            title: title.trimmingCharacters(in: .whitespaces),
            status: status.rawValue,
            priority: priority.rawValue,
            category: category.rawValue,
            dueDate: nil,
            notes: notes.isEmpty ? nil : notes
        )
        isSaving = true
        Task {
            do {
                try await onSave(payload)
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
                isSaving = false
            }
        }
    }
}
