import SwiftUI

struct AddListingView: View {
    @Environment(\.dismiss) private var dismiss
    let onSave: (NewListingPayload) async -> Void

    @State private var title        = ""
    @State private var areaName     = ""
    @State private var priceValue: Double? = nil
    @State private var type         = "villa"
    @State private var status       = "live"
    @State private var transactionType = "sale"
    @State private var inquiryType  = "stock"
    @State private var bedrooms     = 0
    @State private var bathrooms    = 0
    @State private var sizeText     = ""
    @State private var notes        = ""
    @State private var availability = ""
    @State private var isSaving     = false
    @State private var errorMessage: String?

    private var isValid: Bool { !title.isEmpty && !areaName.isEmpty && priceValue != nil }

    private let areas = [
        "Palm Jumeirah", "Downtown Dubai", "Dubai Marina", "Emirates Hills",
        "Arabian Ranches", "Dubai Hills Estate", "Business Bay", "JBR",
        "DIFC", "City Walk", "Jumeirah Golf Estates", "Al Barari", "Tilal Al Ghaf"
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: DS.Spacing.xl) {
                    // Basic details
                    FormCard(title: "Basic Details") {
                        FloatingLabelTextField(label: "Title *", text: $title, icon: "text.alignleft")

                        Picker("Area *", selection: $areaName) {
                            Text("Select area…").tag("")
                            ForEach(areas, id: \.self) { Text($0).tag($0) }
                        }
                        .pickerStyle(.menu)
                        .tint(Color.zBlue)
                        .padding(.horizontal, DS.Spacing.md)
                        .padding(.vertical, DS.Spacing.md)
                        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
                        .overlay {
                            RoundedRectangle(cornerRadius: DS.Radius.md)
                                .strokeBorder(Color.zBorderSubtle, lineWidth: 0.5)
                        }

                        CurrencyTextField(label: "Price (AED) *", value: $priceValue)
                    }

                    // Classification
                    FormCard(title: "Classification") {
                        InlinePickerRow(label: "Type", selection: $type, options: [
                            ("villa", "Villa"), ("apartment", "Apartment"),
                            ("townhouse", "Townhouse"), ("penthouse", "Penthouse"),
                            ("plot", "Plot"), ("office", "Office"), ("retail", "Retail")
                        ])
                        InlinePickerRow(label: "Status", selection: $status, options: [
                            ("live", "Live"), ("pocket", "Pocket"), ("unofficial", "Unofficial")
                        ])
                        InlinePickerRow(label: "Transaction", selection: $transactionType, options: [
                            ("sale", "Sale"), ("rent", "Rent")
                        ])
                        InlinePickerRow(label: "Inquiry", selection: $inquiryType, options: [
                            ("stock", "Stock"), ("request", "Request"), ("viewing", "Viewing")
                        ])
                    }

                    // Specs
                    FormCard(title: "Specifications") {
                        TabStepper(label: "Bedrooms", value: $bedrooms, options: [0,1,2,3,4,5,6,7])
                        TabStepper(label: "Bathrooms", value: $bathrooms, options: [0,1,2,3,4,5,6])
                        FloatingLabelTextField(label: "Size (sqft)", text: $sizeText,
                                              keyboardType: .numberPad, icon: "ruler")
                    }

                    // Additional
                    FormCard(title: "Additional") {
                        FloatingLabelTextField(label: "Notes", text: $notes, icon: "note.text")
                        FloatingLabelTextField(label: "Availability", text: $availability, icon: "calendar")
                    }

                    if let err = errorMessage {
                        Label(err, systemImage: "exclamationmark.triangle.fill")
                            .font(AppFont.body(13))
                            .foregroundStyle(Color.zRed)
                            .padding(DS.Spacing.md)
                            .background(Color.zRed.opacity(0.08), in: .rect(cornerRadius: DS.Radius.md))
                    }
                }
                .padding(DS.Spacing.base)
                .padding(.bottom, DS.Spacing.xxxl)
            }
            .background(Color.zBg.ignoresSafeArea())
            .navigationTitle("New Listing")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }.tint(.secondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    if isSaving {
                        ProgressView()
                    } else {
                        Button("Save", action: save)
                            .fontWeight(.semibold)
                            .tint(Color.zBlue)
                            .disabled(!isValid)
                    }
                }
            }
            .disabled(isSaving)
        }
    }

    private func save() {
        guard let p = priceValue else { errorMessage = "Enter a valid price"; return }
        let payload = NewListingPayload(
            title: title, areaName: areaName, price: Int(p),
            type: type, status: status, inquiryType: inquiryType,
            transactionType: transactionType,
            bedrooms: bedrooms > 0 ? bedrooms : nil,
            bathrooms: bathrooms > 0 ? bathrooms : nil,
            size: Int(sizeText),
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

// MARK: - Shared form helpers

struct FormCard<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Spacing.md) {
            Text(title)
                .font(AppFont.label(11))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
                .tracking(0.8)

            VStack(spacing: DS.Spacing.sm) {
                content
            }
        }
    }
}

struct InlinePickerRow: View {
    let label: String
    @Binding var selection: String
    let options: [(String, String)]

    var body: some View {
        HStack {
            Text(label)
                .font(AppFont.body(15))
                .foregroundStyle(.primary)
            Spacer()
            Picker(label, selection: $selection) {
                ForEach(options, id: \.0) { value, display in
                    Text(display).tag(value)
                }
            }
            .pickerStyle(.menu)
            .tint(Color.zBlue)
        }
        .padding(.horizontal, DS.Spacing.md)
        .padding(.vertical, DS.Spacing.sm + 2)
        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
        .overlay {
            RoundedRectangle(cornerRadius: DS.Radius.md)
                .strokeBorder(Color.zBorderSubtle, lineWidth: 0.5)
        }
    }
}
