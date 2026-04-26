import SwiftUI

struct NewsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var vm = NewsViewModel()
    @State private var selectedURL: URL?

    var body: some View {
        NavigationStack {
            Group {
                if vm.isLoading && vm.articles.isEmpty {
                    newsSkeletonList
                } else if vm.articles.isEmpty {
                    ContentUnavailableView(
                        "No News",
                        systemImage: "newspaper",
                        description: Text("Check your network connection")
                    )
                } else {
                    newsList
                }
            }
            .navigationTitle("News")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close", action: dismiss.callAsFunction)
                }
            }
            .sheet(item: $selectedURL) { url in
                SafariSheet(url: url)
            }
            .refreshable { await vm.load() }
        }
        .task { await vm.load() }
    }

    private var newsList: some View {
        List {
            ForEach(vm.articles) { article in
                NewsRow(article: article) {
                    if let url = URL(string: article.url) {
                        selectedURL = url
                    }
                }
                .listRowSeparator(.hidden)
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets(top: 4, leading: 16, bottom: 4, trailing: 16))
            }

            if !vm.articles.isEmpty {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
                    .task { await vm.loadMore() }
            }
        }
        .listStyle(.plain)
    }

    private var newsSkeletonList: some View {
        List {
            ForEach(0..<8, id: \.self) { _ in
                NewsRowSkeleton()
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
            }
        }
        .listStyle(.plain)
    }
}

// MARK: - News row

private struct NewsRow: View {
    let article: NewsArticle
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(alignment: .top, spacing: AppTheme.Spacing.sm) {
                if let imageString = article.urlToImage, let url = URL(string: imageString) {
                    AsyncImage(url: url) { img in
                        img.resizable().aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle().fill(.quinary)
                    }
                    .frame(width: 80, height: 60)
                    .clipShape(.rect(cornerRadius: AppTheme.Radius.sm - 4))
                    .accessibilityHidden(true)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(article.title)
                        .font(.subheadline.bold())
                        .lineLimit(3)
                        .foregroundStyle(.primary)

                    HStack(spacing: AppTheme.Spacing.xs) {
                        if let source = article.source?.name {
                            Text(source)
                                .font(.caption2.bold())
                                .foregroundStyle(AppTheme.Color.brand)
                        }
                        if let date = article.relativeDate {
                            Text("·")
                                .foregroundStyle(.tertiary)
                            Text(date)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .font(.caption2)
                }
            }
            .padding(AppTheme.Spacing.sm + 2)
            .background(.background, in: .rect(cornerRadius: AppTheme.Radius.sm))
            .overlay {
                RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                    .strokeBorder(.separator, lineWidth: 0.5)
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(article.title), \(article.source?.name ?? "")")
    }
}

private struct NewsRowSkeleton: View {
    var body: some View {
        HStack(alignment: .top, spacing: AppTheme.Spacing.sm) {
            RoundedRectangle(cornerRadius: AppTheme.Radius.sm - 4)
                .fill(.quinary).frame(width: 80, height: 60)
            VStack(alignment: .leading, spacing: 6) {
                RoundedRectangle(cornerRadius: 4).fill(.quinary).frame(height: 13)
                RoundedRectangle(cornerRadius: 4).fill(.quinary).frame(width: 200, height: 13)
                RoundedRectangle(cornerRadius: 4).fill(.quinary).frame(width: 100, height: 11)
            }
            Spacer()
        }
        .padding(AppTheme.Spacing.sm + 2)
    }
}

// MARK: - Safari sheet

private struct SafariSheet: View {
    let url: URL
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            SafariViewRepresentable(url: url)
                .ignoresSafeArea()
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Close", action: dismiss.callAsFunction)
                    }
                }
        }
    }
}

// MARK: - URL conformance for .sheet(item:)
extension URL: @retroactive Identifiable {
    public var id: String { absoluteString }
}
