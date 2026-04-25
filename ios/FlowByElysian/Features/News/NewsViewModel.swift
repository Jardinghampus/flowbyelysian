import SwiftUI

@Observable @MainActor
final class NewsViewModel {
    private(set) var articles: [NewsArticle] = []
    private(set) var isLoading = false
    var errorMessage: String?
    private var page = 1

    private let api = APIClient.shared

    func load() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }
        page = 1
        do {
            let response: NewsResponse = try await api.get(
                Endpoint.news,
                query: ["pageSize": "20", "page": "1", "sortBy": "publishedAt"]
            )
            articles = response.articles?.filter { !$0.title.contains("[Removed]") } ?? []
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func loadMore() async {
        guard !isLoading, articles.count >= 20 else { return }
        isLoading = true
        defer { isLoading = false }
        page += 1
        do {
            let response: NewsResponse = try await api.get(
                Endpoint.news,
                query: ["pageSize": "20", "page": "\(page)", "sortBy": "publishedAt"]
            )
            let newItems = response.articles?.filter { !$0.title.contains("[Removed]") } ?? []
            articles.append(contentsOf: newItems)
        } catch {
            page -= 1
            errorMessage = error.localizedDescription
        }
    }
}
