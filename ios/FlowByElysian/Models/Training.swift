import SwiftData
import Foundation

struct TrainingModule: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let description: String?
    let category: String   // 'rera' | 'tips' | 'way-of-work'
    let content: String?
    let videoUrl: String?
    let videoType: String? // 'youtube' | 'loom'
    let duration: String?
    let createdAt: String?

    enum Category: String, CaseIterable {
        case rera      = "rera"
        case tips      = "tips"
        case wayOfWork = "way-of-work"

        var label: String {
            switch self {
            case .rera:      return "RERA"
            case .tips:      return "Tips"
            case .wayOfWork: return "Way of Work"
            }
        }

        var icon: String {
            switch self {
            case .rera:      return "doc.badge.checkmark"
            case .tips:      return "lightbulb.fill"
            case .wayOfWork: return "person.2.fill"
            }
        }
    }

    var categoryEnum: Category { Category(rawValue: category) ?? .tips }

    var hasVideo: Bool { videoUrl != nil }
}

struct TrainingResponse: Codable {
    let modules: [TrainingModule]?
    let data:    [TrainingModule]?
}

// MARK: - SwiftData cache

@Model
final class CachedTrainingModule {
    var id: String
    var title: String
    var moduleDescription: String?
    var category: String
    var content: String?
    var videoUrl: String?
    var videoType: String?
    var duration: String?
    var cachedAt: Date

    init(from m: TrainingModule) {
        id                 = m.id
        title              = m.title
        moduleDescription  = m.description
        category           = m.category
        content            = m.content
        videoUrl           = m.videoUrl
        videoType          = m.videoType
        duration           = m.duration
        cachedAt           = .now
    }

    func toTrainingModule() -> TrainingModule {
        TrainingModule(
            id: id, title: title, description: moduleDescription,
            category: category, content: content,
            videoUrl: videoUrl, videoType: videoType,
            duration: duration, createdAt: nil
        )
    }
}
