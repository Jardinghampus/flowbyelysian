import SwiftUI

struct AddContactView: View {
    @Environment(\.dismiss) private var dismiss
    let onSave: (NewContactPayload) async -> Void

    @State private var name     = ""
    @State private var email    = ""
    @State private var phone    = ""
    @State private var whatsapp = ""
    @State private var role     = "agent"
    @State private var isSaving = false

    private var isValid: Bool { !name.isEmpty }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: DS.Spacing.xl) {
                    FormCard(title: "Basic Info") {
                        FloatingLabelTextField(label: "Full Name *", text: $name, icon: "person.fill")
                        InlinePickerRow(label: "Role", selection: $role, options: [
                            ("agent", "Agent"), ("senior_agent", "Senior Agent"),
                            ("manager", "Manager"), ("admin", "Admin"), ("external", "External")
                        ])
                    }

                    FormCard(title: "Contact Details") {
                        FloatingLabelTextField(
                            label: "Email", text: $email,
                            keyboardType: .emailAddress,
                            autocapitalization: .never,
                            icon: "envelope.fill"
                        )
                        FloatingLabelTextField(
                            label: "Phone", text: $phone,
                            keyboardType: .phonePad,
                            icon: "phone.fill"
                        )
                        FloatingLabelTextField(
                            label: "WhatsApp", text: $whatsapp,
                            keyboardType: .phonePad,
                            icon: "message.fill"
                        )
                    }
                }
                .padding(DS.Spacing.base)
                .padding(.bottom, DS.Spacing.xxxl)
            }
            .background(Color.zBg.ignoresSafeArea())
            .navigationTitle("New Contact")
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
