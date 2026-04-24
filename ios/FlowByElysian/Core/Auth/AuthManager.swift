import SwiftUI
import Combine

@MainActor
final class AuthManager: ObservableObject {
    @Published private(set) var isAuthenticated = false
    @Published private(set) var currentUser: AppUser?

    private let keychain = KeychainService()

    init() {
        restoreSession()
    }

    // Demo-inloggning – speglar web-appens demo-läge
    func loginDemo() {
        let user = AppUser(
            id: Config.demoUserID,
            email: Config.demoEmail,
            name: "Demo User",
            role: "admin"
        )
        currentUser = user
        isAuthenticated = true
        keychain.save(token: Config.demoUserID, key: "auth_token")
    }

    // Riktig JWT-inloggning (Clerk) – implementera när du kopplar Clerk iOS SDK
    func login(email: String, password: String) async throws {
        // TODO: integrera Clerk iOS SDK (https://clerk.com/docs/references/ios)
        // let token = try await ClerkSDK.signIn(email: email, password: password)
        // keychain.save(token: token, key: "auth_token")
        loginDemo() // Fallback till demo tills Clerk är konfigurerat
    }

    func logout() {
        currentUser = nil
        isAuthenticated = false
        keychain.delete(key: "auth_token")
    }

    private func restoreSession() {
        if keychain.load(key: "auth_token") != nil {
            loginDemo()
        }
    }
}

struct AppUser: Codable {
    let id: String
    let email: String
    let name: String
    let role: String
}
