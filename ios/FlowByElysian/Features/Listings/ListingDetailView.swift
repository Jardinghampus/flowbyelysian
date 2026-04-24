import SwiftUI

struct ListingDetailView: View {
    let listing: Listing

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Hero image
                AsyncImage(url: listing.firstImage) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(.gray.opacity(0.2))
                        .overlay(Image(systemName: "building.2").font(.largeTitle).foregroundStyle(.gray))
                }
                .frame(height: 260)
                .clipped()

                VStack(alignment: .leading, spacing: 16) {
                    // Titel & status
                    HStack(alignment: .top) {
                        Text(listing.title)
                            .font(.title2.bold())
                        Spacer()
                        if let status = listing.status {
                            Text(status.uppercased())
                                .font(.caption.weight(.bold))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(status == "live" ? Color.green : .orange, in: Capsule())
                                .foregroundStyle(.white)
                        }
                    }

                    // Pris
                    Text(listing.priceFormatted)
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(.indigo)

                    Divider()

                    // Specs
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        SpecItem(icon: "bed.double", label: "Sovrum", value: "\(listing.bedrooms ?? 0)")
                        SpecItem(icon: "shower", label: "Badrum", value: "\(listing.bathrooms ?? 0)")
                        if let size = listing.sizeSqft, size > 0 {
                            SpecItem(icon: "square", label: "Storlek", value: "\(Int(size)) sqft")
                        }
                        if let type = listing.type {
                            SpecItem(icon: "building.2", label: "Typ", value: type.capitalized)
                        }
                    }

                    // Beskrivning
                    if let desc = listing.description, !desc.isEmpty {
                        Divider()
                        Text("Beskrivning")
                            .font(.headline)
                        Text(desc)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .ignoresSafeArea(edges: .top)
    }
}

struct SpecItem: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundStyle(.indigo)
                .frame(width: 24)
            VStack(alignment: .leading, spacing: 2) {
                Text(label).font(.caption).foregroundStyle(.secondary)
                Text(value).font(.subheadline.weight(.medium))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(.quaternary, in: RoundedRectangle(cornerRadius: 8))
    }
}
