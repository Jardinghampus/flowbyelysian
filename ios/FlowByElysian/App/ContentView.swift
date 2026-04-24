import SwiftUI

struct ContentView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(NetworkMonitor.self) private var network

    var body: some View {
        ZStack {
            switch auth.state {
            case .splash:
                SplashView()
                    .transition(.opacity)

            case .unauthenticated:
                LoginView()
                    .transition(.asymmetric(
                        insertion: .move(edge: .bottom).combined(with: .opacity),
                        removal: .opacity
                    ))

            case .authenticated:
                MainShellView()
                    .transition(.asymmetric(
                        insertion: .move(edge: .trailing).combined(with: .opacity),
                        removal: .opacity
                    ))
                    .overlay(alignment: .top) {
                        if !network.isConnected {
                            OfflineBanner()
                                .padding(.top, AppTheme.Spacing.sm)
                                .transition(.move(edge: .top).combined(with: .opacity))
                        }
                    }
            }
        }
        .animation(.spring(response: 0.42, dampingFraction: 0.82), value: auth.state)
        .animation(.spring(response: 0.3), value: network.isConnected)
    }
}

private struct OfflineBanner: View {
    var body: some View {
        Label("Offline – visar cachad data", systemImage: "wifi.slash")
            .font(.footnote.weight(.medium))
            .foregroundStyle(.white)
            .padding(.horizontal, AppTheme.Spacing.md)
            .padding(.vertical, AppTheme.Spacing.sm)
            .background(.orange.gradient, in: Capsule())
            .shadow(color: .orange.opacity(0.35), radius: 8, y: 4)
    }
}
