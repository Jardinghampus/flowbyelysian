import SwiftUI

struct AddListingView: View {
    @Environment(\.dismiss) private var dismiss
    let onSave: (NewListingPayload) async -> Void

    @State private var title = ""
    @State private var areaName = ""
    @State private var price = ""
    @State private var type = "villa"
    @State private var status = "live"
    @State private var transactionType = "sale"
    @State private var inquiryType = "stock"
    @State private var bedrooms = ""
    @State private var bathrooms = ""
    @State private var size = ""
    @State private var notes = ""
    @State private var availability = ""
    @State private var isSaving = false
    @State private var errorMessage: String?

    private var isValid: Bool { !title.isEmpty && !areaName.isEmpty && !price.isEmpty }

    var body: some View {
        NavigationStack {
            Form {
                BasicDetailsSection(title: $title, areaName: $areaName, price: $price)
                ClassificationSection(type: $type, status: $status,
                                      transactionType: $transactionType, inquiryType: $inquiryType)
                PropertySpecsSection(bedrooms: $bedrooms, bathrooms: $bathrooms, size: $size)
                ExtraSection(notes: $notes, availability: $availability)

                if let err = errorMessage {
                    Section {
                        Label(err, systemImage: "exclamationmark.triangle.fill")
                            .foregroundStyle(.red)
                            .font(.footnote)
                    }
                }
            }
            .navigationTitle("Ny listing")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Avbryt", action: dismiss.callAsFunction)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    if isSaving {
                        ProgressView()
                    } else {
                        Button("Spara", action: save)
                            .bold()
                            .disabled(!isValid)
                    }
                }
            }
            .disabled(isSaving)
        }
    }

    private func save() {
        guard let priceInt = Int(price) else {
            errorMessage = "Ange ett giltigt pris"
            return
        }
        let payload = NewListingPayload(
            title: title,
            areaName: areaName,
            price: priceInt,
            type: type,
            status: status,
            inquiryType: inquiryType,
            transactionType: transactionType,
            bedrooms: Int(bedrooms),
            bathrooms: Int(bathrooms),
            size: Int(size),
            notes: notes.isEmpty ? nil : notes,
            availability: availability.isEmpty ? nil : availability
        )
        isSaving = true
        Task {
            await onSave(payload)
            isSaving = false
            dismiss()
        }
    }
}

// MARK: - Form sections

private struct BasicDetailsSection: View {
    @Binding var title: String
    @Binding var areaName: String
    @Binding var price: String

    private let areas = ["Palm Jumeirah", "Downtown Dubai", "Dubai Marina",
                         "Emirates Hills", "Arabian Ranches", "Dubai Hills Estate",
                         "Business Bay", "JBR", "DIFC", "City Walk",
                         "Jumeirah Golf Estates", "Al Barari", "Tilal Al Ghaf"]

    var body: some View {
        Section("Grunduppgifter") {
            TextField("Titel *", text: $title)
            Picker("Område *", selection: $areaName) {
                Text("Välj område").tag("")
                ForEach(areas, id: \.self) { Text($0).tag($0) }
            }
            TextField("Pris (AED) *", text: $price)
                .keyboardType(.numberPad)
        }
    }
}

private struct ClassificationSection: View {
    @Binding var type: String
    @Binding var status: String
    @Binding var transactionType: String
    @Binding var inquiryType: String

    var body: some View {
        Section("Klassificering") {
            Picker("Typ", selection: $type) {
                Text("Villa").tag("villa")
                Text("Apartment").tag("apartment")
                Text("Townhouse").tag("townhouse")
                Text("Penthouse").tag("penthouse")
                Text("Plot").tag("plot")
                Text("Office").tag("office")
                Text("Retail").tag("retail")
            }
            Picker("Status", selection: $status) {
                Text("Live").tag("live")
                Text("Pocket").tag("pocket")
                Text("Unofficial").tag("unofficial")
            }
            Picker("Transaktion", selection: $transactionType) {
                Text("Försäljning").tag("sale")
                Text("Uthyrning").tag("rent")
            }
            Picker("Förfrågan", selection: $inquiryType) {
                Text("Stock").tag("stock")
                Text("Request").tag("request")
                Text("Viewing").tag("viewing")
            }
        }
    }
}

private struct PropertySpecsSection: View {
    @Binding var bedrooms: String
    @Binding var bathrooms: String
    @Binding var size: String

    var body: some View {
        Section("Specifikationer") {
            TextField("Sovrum", text: $bedrooms)
                .keyboardType(.numberPad)
            TextField("Badrum", text: $bathrooms)
                .keyboardType(.numberPad)
            TextField("Storlek (sqft)", text: $size)
                .keyboardType(.numberPad)
        }
    }
}

private struct ExtraSection: View {
    @Binding var notes: String
    @Binding var availability: String

    var body: some View {
        Section("Övrigt") {
            TextField("Anteckningar", text: $notes, axis: .vertical)
                .lineLimit(3...)
            TextField("Tillgänglighet", text: $availability)
        }
    }
}
