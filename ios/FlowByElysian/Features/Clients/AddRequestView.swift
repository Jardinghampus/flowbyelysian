import SwiftUI

struct AddRequestView: View {
    @Environment(\.dismiss) private var dismiss
    let onSave: (NewRequestPayload) async -> Void

    @State private var clientName = ""
    @State private var budget = ""
    @State private var propertyType = "villa"
    @State private var bedrooms = ""
    @State private var areaName = ""
    @State private var notes = ""
    @State private var isSaving = false

    private var isValid: Bool { !clientName.isEmpty }

    private let areas = Area.dubaiAreas.map(\.name)
    private let types = ["villa", "apartment", "townhouse", "penthouse", "plot", "office", "retail"]

    var body: some View {
        NavigationStack {
            Form {
                Section("Klientinformation") {
                    TextField("Klientnamn *", text: $clientName)

                    TextField("Budget (AED)", text: $budget)
                        .keyboardType(.numberPad)
                }

                Section("Önskemål") {
                    Picker("Fastighetstyp", selection: $propertyType) {
                        ForEach(types, id: \.self) { Text($0.capitalized).tag($0) }
                    }
                    Picker("Område", selection: $areaName) {
                        Text("Inget specifikt").tag("")
                        ForEach(areas, id: \.self) { Text($0).tag($0) }
                    }
                    TextField("Sovrum (min)", text: $bedrooms)
                        .keyboardType(.numberPad)
                }

                Section("Anteckningar") {
                    TextField("Övrigt om klienten…", text: $notes, axis: .vertical)
                        .lineLimit(3...)
                }
            }
            .navigationTitle("Ny klientförfrågan")
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
        let payload = NewRequestPayload(
            clientName: clientName,
            budget: Int(budget),
            propertyType: propertyType,
            bedrooms: Int(bedrooms),
            areaId: nil,   // area lookup by name requires extra step; pass nil for now
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
