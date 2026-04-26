import SwiftUI

struct SettingsView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(\.dismiss) private var dismiss
    @AppStorage("preferredColorScheme") private var preferredScheme: Int = 2

    private let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0"
    private let build   = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "1"

    var body: some View {
        NavigationStack {
            List {
                // Profile
                Section {
                    HStack(spacing: DS.Spacing.md) {
                        Circle()
                            .fill(LinearGradient.zBlue)
                            .frame(width: 60, height: 60)
                            .overlay {
                                Text(auth.currentUser?.initials ?? "?")
                                    .font(AppFont.display(22))
                                    .foregroundStyle(.white)
                            }

                        VStack(alignment: .leading, spacing: 3) {
                            Text(auth.currentUser?.name ?? "Agent")
                                .font(AppFont.heading(17))
                            Text(auth.currentUser?.email ?? "")
                                .font(AppFont.body(13))
                                .foregroundStyle(.secondary)
                            Text(auth.currentUser?.role.capitalized ?? "Agent")
                                .font(AppFont.label(11))
                                .foregroundStyle(Color.zBlue)
                        }
                    }
                    .padding(.vertical, DS.Spacing.xs)
                }

                // Appearance
                Section("Appearance") {
                    Picker("Theme", selection: $preferredScheme) {
                        Label("System", systemImage: "circle.lefthalf.filled").tag(0)
                        Label("Light",  systemImage: "sun.max.fill").tag(1)
                        Label("Dark",   systemImage: "moon.fill").tag(2)
                    }
                    .pickerStyle(.inline)
                    .tint(Color.zBlue)
                }

                // About
                Section("About") {
                    LabeledContent("Version", value: "\(version) (\(build))")
                    LabeledContent("Backend", value: "flow.elysian.ae")
                    LabeledContent("Environment", value: "Production")
                }

                // Danger zone
                Section {
                    Button(role: .destructive) {
                        dismiss()
                        Task { @MainActor in
                            try? await Task.sleep(nanoseconds: 200_000_000)
                            auth.signOut()
                        }
                    } label: {
                        Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .fontWeight(.semibold)
                        .tint(Color.zBlue)
                }
            }
        }
    }
}
