import SwiftUI
import SwiftData

@Observable @MainActor
final class TasksViewModel {
    private(set) var tasks: [TaskItem] = []
    private(set) var isLoading = false
    var errorMessage: String?
    var searchText = ""
    var filterStatus: TaskItem.TaskStatus? = nil
    var filterPriority: TaskItem.TaskPriority? = nil

    private let api  = APIClient.shared
    private let sync = SyncManager.shared

    // MARK: - Load

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }

        if isOnline {
            do {
                let response: TasksResponse = try await api.get(Endpoint.tasks)
                tasks = response.tasks ?? response.data ?? []
                cacheTasks(tasks, context: context)
            } catch {
                // API might not exist yet — fall back to local
                tasks = cachedTasks(context: context)
            }
        } else {
            tasks = cachedTasks(context: context)
        }
    }

    // MARK: - CRUD

    func createTask(_ payload: NewTaskPayload, context: ModelContext) async throws {
        do {
            let response: SingleTaskResponse = try await api.post(Endpoint.tasks, body: payload)
            tasks.insert(response.task, at: 0)
            context.insert(CachedTask(from: response.task, synced: true))
            try? context.save()
        } catch {
            // Offline: create locally with a temporary ID
            let local = TaskItem(
                id: "local_\(UUID().uuidString)",
                title: payload.title,
                status: TaskItem.TaskStatus(rawValue: payload.status) ?? .todo,
                priority: TaskItem.TaskPriority(rawValue: payload.priority) ?? .medium,
                category: TaskItem.TaskCategory(rawValue: payload.category) ?? .general,
                dueDate: payload.dueDate, notes: payload.notes,
                assignedTo: nil, createdAt: nil
            )
            tasks.insert(local, at: 0)
            context.insert(CachedTask(from: local, synced: false))
            try? context.save()
        }
    }

    func updateStatus(_ task: TaskItem, status: TaskItem.TaskStatus, context: ModelContext) async {
        guard let idx = tasks.firstIndex(where: { $0.id == task.id }) else { return }
        struct Patch: Encodable { let status: String }

        // Optimistic update
        var updated = task; updated.status = status
        tasks[idx] = updated
        updateCache(id: task.id, status: status.rawValue, context: context)

        do {
            try await api.patchVoid(Endpoint.task(task.id), body: Patch(status: status.rawValue))
        } catch {
            tasks[idx] = task
            errorMessage = error.localizedDescription
        }
    }

    func deleteTask(_ task: TaskItem, context: ModelContext) async {
        tasks.removeAll { $0.id == task.id }
        do {
            try await api.delete(Endpoint.task(task.id))
        } catch {
            // If delete fails just keep it removed locally; will reconcile on next load
        }
        deleteFromCache(id: task.id, context: context)
    }

    // MARK: - Filtered

    var filteredTasks: [TaskItem] {
        tasks.filter { task in
            let matchesSearch   = searchText.isEmpty || task.title.localizedStandardContains(searchText)
            let matchesStatus   = filterStatus == nil   || task.status   == filterStatus
            let matchesPriority = filterPriority == nil || task.priority == filterPriority
            return matchesSearch && matchesStatus && matchesPriority
        }
    }

    var completedCount: Int  { tasks.count(where: { $0.status == .completed }) }
    var inProgressCount: Int { tasks.count(where: { $0.status == .inProgress }) }
    var todoCount: Int       { tasks.count(where: { $0.status == .todo }) }

    // MARK: - Cache helpers

    private func cachedTasks(context: ModelContext) -> [TaskItem] {
        (try? context.fetch(FetchDescriptor<CachedTask>()))?.map { $0.toTaskItem() } ?? []
    }

    private func cacheTasks(_ items: [TaskItem], context: ModelContext) {
        try? context.delete(model: CachedTask.self)
        items.forEach { context.insert(CachedTask(from: $0)) }
        try? context.save()
    }

    private func updateCache(id: String, status: String, context: ModelContext) {
        if let cached = try? context.fetch(FetchDescriptor<CachedTask>())
                                    .first(where: { $0.id == id }) {
            cached.status = status
            try? context.save()
        }
    }

    private func deleteFromCache(id: String, context: ModelContext) {
        if let cached = try? context.fetch(FetchDescriptor<CachedTask>())
                                    .first(where: { $0.id == id }) {
            context.delete(cached)
            try? context.save()
        }
    }
}
