import SwiftUI

struct ListingDetailView: View {
    let listing: Listing
    @State private var showShareSheet = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                HeroImage(url: listing.firstImage)

                VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                    ListingTitleRow(listing: listing)
                    Divider()
                    ListingSpecsGrid(listing: listing)

                    if let desc = listing.description, !desc.isEmpty {
                        Divider()
                        Text("Beskrivning")
                            .font(.headline)
                        Text(desc)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(AppTheme.Spacing.md)
            }
        }
        .scrollIndicators(.hidden)
        .ignoresSafeArea(edges: .top)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Dela", systemImage: "square.and.arrow.up") {
                    showShareSheet = true
                }
            }
        }
        .sheet(isPresented: $showShareSheet) {
            ShareSheet(activityItems: [listing.shareText])
                .presentationDetents([.medium, .large])
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
                }
        }
        .frame(height: 280)
        .clipped()
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
            }
            Spacer()
            if let status = listing.status {
                StatusBadge(status: status)
            }
        }
    }
}

private struct ListingSpecsGrid: View {
    let listing: Listing

    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: AppTheme.Spacing.sm) {
            SpecCell(icon: "bed.double", label: "Sovrum",    value: "\(listing.bedrooms ?? 0)")
            SpecCell(icon: "shower",     label: "Badrum",    value: "\(listing.bathrooms ?? 0)")
            if let size = listing.sizeSqft, size > 0 {
                SpecCell(icon: "square", label: "Storlek",   value: "\(Int(size)) sqft")
            }
            if let type = listing.type {
                SpecCell(icon: "building.2", label: "Typ",   value: type.capitalized)
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

// MARK: - Share helpers

private struct ShareSheet: UIViewControllerRepresentable {
    let activityItems: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

private extension Listing {
    var shareText: String {
        "\(title) – \(priceFormatted)\nStatus: \(status?.capitalized ?? "N/A")"
    }
}
