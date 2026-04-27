import SwiftUI
import SwiftData

struct TrainingView: View {
    @Environment(NetworkMonitor.self) private var network
    @Environment(AppState.self)       private var appState
    @Environment(\.modelContext)      private var context
    @Environment(\.dismiss)           private var dismiss
    @State private var vm = TrainingViewModel()

    private let categories: [(String, TrainingModule.Category?)] = [
        ("All",          nil),
        ("RERA",         .rera),
        ("Tips",         .tips),
        ("Way of Work",  .wayOfWork),
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                categoryBar

                Divider()

                Group {
                    if vm.isLoading && vm.modules.isEmpty {
                        ProgressView()
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                    } else if vm.filteredModules.isEmpty {
                        ContentUnavailableView(
                            "No modules",
                            systemImage: "book.closed",
                            description: Text(vm.searchText.isEmpty
                                ? "Check back soon for new training content"
                                : "No results for \"\(vm.searchText)\"")
                        )
                        .frame(maxHeight: .infinity)
                    } else {
                        moduleList
                    }
                }
            }
            .background(.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { trainingToolbar }
            .searchable(text: Bindable(vm).searchText, prompt: "Search modules…")
            .refreshable { await vm.load(context: context, isOnline: network.isConnected) }
        }
        .task { await vm.load(context: context, isOnline: network.isConnected) }
    }

    // MARK: - Category filter bar

    private var categoryBar: some View {
        ScrollView(.horizontal) {
            HStack(spacing: AppTheme.Spacing.xs) {
                ForEach(categories, id: \.0) { label, cat in
                    FilterChip(label: label, isSelected: vm.selectedCategory == cat) {
                        vm.selectedCategory = cat
                    }
                }
            }
            .padding(.horizontal, AppTheme.Spacing.md)
            .padding(.vertical, AppTheme.Spacing.sm)
        }
        .scrollIndicators(.hidden)
    }

    // MARK: - Module list

    private var moduleList: some View {
        ScrollView {
            LazyVStack(spacing: AppTheme.Spacing.sm) {
                ForEach(Array(vm.filteredModules.enumerated()), id: \.element.id) { index, module in
                    NavigationLink(value: module) {
                        TrainingModuleCard(module: module)
                    }
                    .buttonStyle(.plain)
                    .staggeredAppear(index: index)
                }
            }
            .padding(AppTheme.Spacing.md)
        }
        .scrollIndicators(.hidden)
        .navigationDestination(for: TrainingModule.self) { TrainingDetailView(module: $0) }
    }

    // MARK: - Toolbar

    @ToolbarContentBuilder
    private var trainingToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Close", action: dismiss.callAsFunction)
        }
        ToolbarItem(placement: .principal) {
            Text("Training").font(.headline)
        }
        ToolbarItem(placement: .topBarTrailing) {
            if vm.isLoading { ProgressView() }
        }
    }
}

// MARK: - Module card

struct TrainingModuleCard: View {
    let module: TrainingModule

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            RoundedRectangle(cornerRadius: AppTheme.Radius.sm)
                .fill(categoryColor.opacity(0.15))
                .frame(width: 52, height: 52)
                .overlay {
                    Image(systemName: module.categoryEnum.icon)
                        .font(.title3)
                        .foregroundStyle(categoryColor)
                }
                .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 4) {
                Text(module.title)
                    .font(.subheadline.bold())
                    .lineLimit(2)
                    .foregroundStyle(.primary)

                HStack(spacing: AppTheme.Spacing.xs) {
                    Text(module.categoryEnum.label)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    if let duration = module.duration {
                        Text("·").foregroundStyle(.tertiary)
                        Label(duration, systemImage: "clock")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                if module.hasVideo {
                    Label("Video available", systemImage: "play.circle.fill")
                        .font(.caption2.bold())
                        .foregroundStyle(AppTheme.Color.brand)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(AppTheme.Spacing.md)
        .glassCard()
        .accessibilityLabel("\(module.title), \(module.categoryEnum.label)\(module.duration.map { ", \($0)" } ?? "")")
    }

    private var categoryColor: Color {
        switch module.categoryEnum {
        case .rera:      return .blue
        case .tips:      return .orange
        case .wayOfWork: return AppTheme.Color.brand
        }
    }
}

// MARK: - Detail view

struct TrainingDetailView: View {
    let module: TrainingModule
    @Environment(\.openURL) private var openURL

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                // Header metadata
                VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                    HStack(spacing: AppTheme.Spacing.sm) {
                        Text(module.categoryEnum.label)
                            .font(.caption.bold())
                            .foregroundStyle(.white)
                            .padding(.horizontal, AppTheme.Spacing.sm)
                            .padding(.vertical, 4)
                            .background(AppTheme.Color.brand.gradient, in: Capsule())

                        if let duration = module.duration {
                            Label(duration, systemImage: "clock")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }

                    if let description = module.description, !description.isEmpty {
                        Text(description)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.md)

                // Video launch button
                if let rawURL = module.videoUrl, let url = URL(string: rawURL) {
                    Button { openURL(url) } label: {
                        HStack(spacing: AppTheme.Spacing.sm) {
                            Image(systemName: module.videoType == "loom"
                                  ? "play.rectangle.fill"
                                  : "play.circle.fill")
                                .font(.title2)
                                .foregroundStyle(.white)

                            VStack(alignment: .leading, spacing: 2) {
                                Text("Watch \(module.videoType?.capitalized ?? "Video")")
                                    .font(.subheadline.bold())
                                    .foregroundStyle(.white)
                                Text("Opens in browser")
                                    .font(.caption)
                                    .foregroundStyle(.white.opacity(0.7))
                            }

                            Spacer()

                            Image(systemName: "arrow.up.right.circle")
                                .font(.title3)
                                .foregroundStyle(.white.opacity(0.8))
                        }
                        .padding(AppTheme.Spacing.md)
                        .background(AppTheme.Color.brand.gradient,
                                    in: .rect(cornerRadius: AppTheme.Radius.sm))
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal, AppTheme.Spacing.md)
                }

                // Content body
                if let content = module.content, !content.isEmpty {
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                        Text("Module Content")
                            .font(.headline)
                        Text(content)
                            .font(.body)
                    }
                    .padding(.horizontal, AppTheme.Spacing.md)
                }
            }
            .padding(.vertical, AppTheme.Spacing.md)
        }
        .scrollIndicators(.hidden)
        .background(.background)
        .navigationTitle(module.categoryEnum.label)
        .navigationBarTitleDisplayMode(.inline)
    }
}
