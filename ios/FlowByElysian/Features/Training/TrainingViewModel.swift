import SwiftUI
import SwiftData

@Observable @MainActor
final class TrainingViewModel {
    private(set) var modules: [TrainingModule] = []
    private(set) var isLoading = false
    var errorMessage: String?
    var searchText = ""
    var selectedCategory: TrainingModule.Category? = nil

    private let api = APIClient.shared

    func load(context: ModelContext, isOnline: Bool) async {
        isLoading = true
        defer { isLoading = false }

        if isOnline {
            do {
                let response: TrainingResponse = try await api.get(Endpoint.training)
                modules = response.modules ?? response.data ?? []
                cacheModules(modules, context: context)
            } catch {
                errorMessage = error.localizedDescription
                modules = cachedModules(context: context)
            }
        } else {
            modules = cachedModules(context: context)
        }
    }

    var filteredModules: [TrainingModule] {
        modules.filter { module in
            let matchesSearch   = searchText.isEmpty || module.title.localizedStandardContains(searchText)
            let matchesCategory = selectedCategory == nil || module.category == selectedCategory?.rawValue
            return matchesSearch && matchesCategory
        }
    }

    // MARK: - Cache

    private func cachedModules(context: ModelContext) -> [TrainingModule] {
        (try? context.fetch(FetchDescriptor<CachedTrainingModule>()))?.map { $0.toTrainingModule() } ?? []
    }

    private func cacheModules(_ items: [TrainingModule], context: ModelContext) {
        try? context.delete(model: CachedTrainingModule.self)
        items.forEach { context.insert(CachedTrainingModule(from: $0)) }
        try? context.save()
    }
}
