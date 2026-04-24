import SwiftUI

enum AuthState { case splash, unauthenticated, authenticated }

@Observable @MainActor
final class AuthManager {
    private(set) var state: AuthState = .splash
    private(set) var currentUser: AppUser?
    var isLoading = false
    var errorMessage: String?

    private let keychain = KeychainService()

    init() {
        Task {
            try? await Task.sleep(for: .milliseconds(1800))
            restoreSession()
        }
    }

    // MARK: - Clerk integration point
    // 1. Add package via SPM: https://github.com/clerk/clerk-ios
    // 2. import ClerkSDK
    // 3. Clerk.configure(publishableKey: Config.clerkPublishableKey) in app init
    // 4. Replace signIn body with:
    //    let result = try await Clerk.shared.signIn.create(strategy: .password(email: email, password: password))
    //    let token  = try await result.session?.getToken() ?? ""
    //    finalise(token: token, email: email)

    func signIn(email: String, password: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        // Demo fallback – remove when Clerk is wired
        try? await Task.sleep(for: .milliseconds(900))

        guard email.contains("@"), password.count >= 6 else {
            errorMessage = "Ogiltig e-post eller lösenord (minst 6 tecken)"
            return
        }

        finalise(token: "tok_\(email.lowercased())", email: email)
    }

    func signOut() {
        keychain.delete(key: "auth_token")
        currentUser = nil
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
            state = .unauthenticated
        }
    }

    // MARK: - Private

    private func finalise(token: String, email: String) {
        keychain.save(token: token, key: "auth_token")
        let name = email.components(separatedBy: "@").first?.capitalized ?? "Agent"
        currentUser = AppUser(id: token, email: email, name: name, role: "agent")
        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
            state = .authenticated
        }
    }

    private func restoreSession() {
        if let token = keychain.load(key: "auth_token") {
            currentUser = AppUser(id: token, email: "agent@elysian.ae", name: "Agent", role: "agent")
            withAnimation { state = .authenticated }
        } else {
            withAnimation { state = .unauthenticated }
        }
    }
}

struct AppUser: Codable {
    let id: String
    let email: String
    let name: String
    let role: String

    var initials: String {
        name.split(separator: " ")
            .compactMap { $0.first.map(String.init) }
            .prefix(2).joined().uppercased()
    }
}
