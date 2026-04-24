import SwiftUI

struct AddContactView: View {
    @Environment(\.dismiss) private var dismiss
    let onSave: (NewContactPayload) async -> Void

    @State private var name = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var whatsapp = ""
    @State private var role = "agent"
    @State private var isSaving = false

    private var isValid: Bool { !name.isEmpty }

    var body: some View {
        NavigationStack {
            Form {
                Section("Grunduppgifter") {
                    TextField("Namn *", text: $name)
                    Picker("Roll", selection: $role) {
                        Text("Agent").tag("agent")
                        Text("Senior Agent").tag("senior_agent")
                        Text("Manager").tag("manager")
                        Text("Admin").tag("admin")
                        Text("Extern").tag("external")
                    }
                }
                Section("Kontaktuppgifter") {
                    TextField("E-post", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                    TextField("Telefon", text: $phone)
                        .textContentType(.telephoneNumber)
                        .keyboardType(.phonePad)
                    TextField("WhatsApp", text: $whatsapp)
                        .keyboardType(.phonePad)
                }
            }
            .navigationTitle("Ny kontakt")
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
        let payload = NewContactPayload(
            name: name,
            email: email.isEmpty ? nil : email,
            phone: phone.isEmpty ? nil : phone,
            whatsapp: whatsapp.isEmpty ? nil : whatsapp,
            role: role,
            areaId: nil
        )
        isSaving = true
        Task {
            await onSave(payload)
            isSaving = false
            dismiss()
        }
    }
}
