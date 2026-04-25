import SwiftData
import Foundation

// "TaskItem" avoids clash with Swift's built-in "Task" type.
// Schema matches web app's task schema + adds dueDate and assignedTo for mobile.

struct TaskItem: Codable, Identifiable, Hashable {
    let id: String
    var title: String
    var status: TaskStatus
    var priority: TaskPriority
    var category: TaskCategory
    var dueDate: String?
    var notes: String?
    var assignedTo: String?
    let createdAt: String?

    enum TaskStatus: String, Codable, CaseIterable {
        case todo        = "todo"
        case inProgress  = "in progress"
        case completed   = "completed"
        case cancelled   = "cancelled"

        var label: String {
            switch self {
            case .todo:       return "Att göra"
            case .inProgress: return "Pågående"
            case .completed:  return "Klar"
            case .cancelled:  return "Avbruten"
            }
        }

        var icon: String {
            switch self {
            case .todo:       return "circle"
            case .inProgress: return "clock.fill"
            case .completed:  return "checkmark.circle.fill"
            case .cancelled:  return "xmark.circle.fill"
            }
        }
    }

    enum TaskPriority: String, Codable, CaseIterable {
        case low      = "low"
        case medium   = "medium"
        case important = "important"
        case critical  = "critical"

        var label: String {
            switch self {
            case .low:       return "Låg"
            case .medium:    return "Medium"
            case .important: return "Viktig"
            case .critical:  return "Kritisk"
            }
        }

        var color: String {
            switch self {
            case .low:       return "secondary"
            case .medium:    return "blue"
            case .important: return "orange"
            case .critical:  return "red"
            }
        }
    }

    enum TaskCategory: String, Codable, CaseIterable {
        case feature       = "feature"
        case bug           = "bug"
        case documentation = "documentation"
        case general       = "general"

        var label: String { rawValue.capitalized }
        var icon: String {
            switch self {
            case .feature:       return "star"
            case .bug:           return "ant"
            case .documentation: return "doc.text"
            case .general:       return "checkmark"
            }
        }
    }
}

struct TasksResponse: Codable {
    let tasks: [TaskItem]?
    let data: [TaskItem]?
}

struct SingleTaskResponse: Codable {
    let task: TaskItem
}

struct NewTaskPayload: Encodable {
    let title: String
    let status: String
    let priority: String
    let category: String
    let dueDate: String?
    let notes: String?
}

// MARK: - SwiftData cache

@Model
final class CachedTask {
    var id: String
    var title: String
    var status: String
    var priority: String
    var category: String
    var dueDate: String?
    var notes: String?
    var isSynced: Bool      // false = created offline, not yet pushed
    var cachedAt: Date

    init(from t: TaskItem, synced: Bool = true) {
        id        = t.id
        title     = t.title
        status    = t.status.rawValue
        priority  = t.priority.rawValue
        category  = t.category.rawValue
        dueDate   = t.dueDate
        notes     = t.notes
        isSynced  = synced
        cachedAt  = .now
    }

    func toTaskItem() -> TaskItem {
        TaskItem(
            id: id, title: title,
            status:   TaskItem.TaskStatus(rawValue: status)   ?? .todo,
            priority: TaskItem.TaskPriority(rawValue: priority) ?? .medium,
            category: TaskItem.TaskCategory(rawValue: category) ?? .general,
            dueDate: dueDate, notes: notes, assignedTo: nil, createdAt: nil
        )
    }
}
