import SwiftUI

struct AddRequestView: View {
    @Environment(\.dismiss) private var dismiss
    let onSave: (NewRequestPayload) async -> Void

    @State private var clientName   = ""
    @State private var budgetValue: Double? = nil
    @State private var propertyType = "villa"
    @State private var bedrooms     = 0
    @State private var areaName     = ""
    @State private var notes        = ""
    @State private var isSaving     = false

    private var isValid: Bool { !clientName.isEmpty }

    private let areas = Area.dubaiAreas.map(\.name)
    private let types = ["villa","apartment","townhouse","penthouse","plot","office","retail"]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: DS.Spacing.xl) {
                    FormCard(title: "Client Info") {
                        FloatingLabelTextField(label: "Client Name *", text: $clientName,
                                              icon: "person.fill")
                        CurrencyTextField(label: "Budget (AED)", value: $budgetValue)
                    }

                    FormCard(title: "Preferences") {
                        InlinePickerRow(label: "Property Type", selection: $propertyType,
                                        options: types.map { ($0, $0.capitalized) })

                        Picker("Area", selection: $areaName) {
                            Text("No preference").tag("")
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

                        TabStepper(label: "Bedrooms", value: $bedrooms,
                                   options: [0,1,2,3,4,5,6,7])
                    }

                    FormCard(title: "Notes") {
                        FloatingLabelTextField(label: "Additional details…", text: $notes,
                                              icon: "note.text")
                    }
                }
                .padding(DS.Spacing.base)
                .padding(.bottom, DS.Spacing.xxxl)
            }
            .background(Color.zBg.ignoresSafeArea())
            .navigationTitle("New Client Request")
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
        let payload = NewRequestPayload(
            clientName: clientName,
            budget: budgetValue.map(Int.init),
            propertyType: propertyType,
            bedrooms: bedrooms > 0 ? bedrooms : nil,
            areaId: nil,
            status: "active",
            notes: notes.isEmpty ? nil : notes
        )
        isSaving = true
        Task {
            await onSave(payload)
            isSaving = false
            dismiss()
        }
    }
}
