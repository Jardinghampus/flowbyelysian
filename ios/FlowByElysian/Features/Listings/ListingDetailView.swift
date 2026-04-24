import SwiftUI

struct ListingDetailView: View {
    let listing: Listing
    var vm: ListingsViewModel? = nil

    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @State private var showEdit = false
    @State private var showDeleteConfirm = false
    @State private var showShare = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                HeroImage(url: listing.firstImage)
                VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                    ListingTitleRow(listing: listing)
                    Divider()
                    ListingTagRow(listing: listing)
                    Divider()
                    ListingSpecsGrid(listing: listing)
                    if let notes = listing.notes, !notes.isEmpty {
                        Divider()
                        NoteSection(text: notes)
                    }
                }
                .padding(AppTheme.Spacing.md)
            }
        }
        .scrollIndicators(.hidden)
        .ignoresSafeArea(edges: .top)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar { detailToolbar }
        .sheet(isPresented: $showEdit) {
            AddListingView { payload in
                guard let vm else { return }
                do {
                    try await vm.updateListing(id: listing.id, payload: payload, context: context)
                } catch { /* error shown via vm.errorMessage */ }
            }
        }
        .confirmationDialog("Radera \(listing.title)?",
                            isPresented: $showDeleteConfirm,
                            titleVisibility: .visible) {
            Button("Radera", role: .destructive) { deleteAndDismiss() }
        }
        .sheet(isPresented: $showShare) {
            ShareSheet(activityItems: [listing.shareText])
                .presentationDetents([.medium, .large])
        }
    }

    @ToolbarContentBuilder
    private var detailToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarTrailing) {
            Menu("Alternativ", systemImage: "ellipsis.circle") {
                Button("Dela", systemImage: "square.and.arrow.up") { showShare = true }
                if vm != nil {
                    Button("Redigera", systemImage: "pencil") { showEdit = true }
                    Button("Radera", systemImage: "trash", role: .destructive) {
                        showDeleteConfirm = true
                    }
                }
            }
        }
    }

    private func deleteAndDismiss() {
        Task {
            try? await vm?.deleteListing(id: listing.id, context: context)
            dismiss()
        }
    }
}

// MARK: - Sub-views

private struct HeroImage: View {
    let url: URL?

    var body: some View {
        AsyncImage(url: url) { image in
            image.resizable().aspectRatio(contentMode: .fill)
        } placeholder: {
            Rectangle().fill(.quinary)
                .overlay {
                    Image(systemName: "building.2")
                        .font(.largeTitle)
                        .foregroundStyle(.tertiary)
                        .accessibilityHidden(true)
                }
        }
        .frame(height: 280)
        .clipped()
        .accessibilityLabel("Fastighetsbild")
    }
}

private struct ListingTitleRow: View {
    let listing: Listing

    var body: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 4) {
                Text(listing.title)
                    .font(.title2.bold())
                Text(listing.priceFormatted)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(AppTheme.Color.brand)
                if let area = listing.areaName {
                    Label(area, systemImage: "mappin")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
            if let status = listing.status {
                StatusBadge(status: status)
            }
        }
    }
}

private struct ListingTagRow: View {
    let listing: Listing

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            if let tt = listing.transactionType {
                TagPill(label: tt == "sale" ? "Försäljning" : "Uthyrning",
                        tint: tt == "sale" ? AppTheme.Color.brand : .mint)
            }
            if let it = listing.inquiryType {
                TagPill(label: it.capitalized, tint: .secondary)
            }
            if let type = listing.type {
                TagPill(label: type.capitalized, tint: .secondary)
            }
        }
    }
}

private struct TagPill: View {
    let label: String
    let tint: Color

    var body: some View {
        Text(label)
            .font(.caption.weight(.medium))
            .foregroundStyle(tint)
            .padding(.horizontal, AppTheme.Spacing.sm)
            .padding(.vertical, 4)
            .background(tint.opacity(0.12), in: Capsule())
    }
}

private struct ListingSpecsGrid: View {
    let listing: Listing

    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())],
                  spacing: AppTheme.Spacing.sm) {
            if let beds = listing.bedrooms {
                SpecCell(icon: "bed.double",  label: "Sovrum",  value: beds.formatted())
            }
            if let baths = listing.bathrooms {
                SpecCell(icon: "shower",      label: "Badrum",  value: baths.formatted())
            }
            if let size = listing.size, size > 0 {
                SpecCell(icon: "square",      label: "Storlek", value: "\(Int(size)) sqft")
            }
            if let avail = listing.availability {
                SpecCell(icon: "calendar",    label: "Tillg.",  value: avail)
            }
        }
    }
}

private struct SpecCell: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        LabeledContent(label) {
            Label(value, systemImage: icon)
                .foregroundStyle(AppTheme.Color.brand)
        }
        .padding(AppTheme.Spacing.sm)
        .background(.quinary, in: .rect(cornerRadius: AppTheme.Radius.sm))
    }
}

private struct NoteSection: View {
    let text: String

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text("Anteckningar").font(.headline)
            Text(text).font(.body).foregroundStyle(.secondary)
        }
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let activityItems: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

extension Listing {
    var shareText: String {
        var parts = ["\(title) – \(priceFormatted)"]
        if let area = areaName { parts.append("Område: \(area)") }
        if let status { parts.append("Status: \(status.capitalized)") }
        return parts.joined(separator: "\n")
    }
}
