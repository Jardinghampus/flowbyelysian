import SwiftUI

struct LoginView: View {
    @EnvironmentObject private var authManager: AuthManager
    @State private var isLoading = false

    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            VStack(spacing: 8) {
                Image(systemName: "building.2.crop.circle.fill")
                    .font(.system(size: 64))
                    .foregroundStyle(.indigo)
                Text("Flow by Elysian")
                    .font(.largeTitle.bold())
                Text("Dubai Real Estate CRM")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(spacing: 12) {
                Button {
                    isLoading = true
                    authManager.loginDemo()
                    isLoading = false
                } label: {
                    Label("Logga in (Demo)", systemImage: "person.fill.checkmark")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(.indigo)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .disabled(isLoading)

                Text("Koppla Clerk iOS SDK för produktion")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
            .padding(.horizontal, 32)
            .padding(.bottom, 48)
        }
    }
}
