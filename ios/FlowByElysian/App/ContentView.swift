import SwiftUI

struct ContentView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(NetworkMonitor.self) private var network
    @AppStorage("preferredColorScheme") private var preferredScheme: Int = 2

    private var resolvedColorScheme: ColorScheme? {
        switch preferredScheme {
        case 1: .light
        case 2: .dark
        default: nil
        }
    }

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
        .preferredColorScheme(resolvedColorScheme)
        .animation(DS.Anim.standard, value: auth.state)
        .animation(DS.Anim.quick, value: network.isConnected)
        .animation(DS.Anim.quick, value: preferredScheme)
    }
}

private struct OfflineBanner: View {
    var body: some View {
        Label("Offline – showing cached data", systemImage: "wifi.slash")
            .font(AppFont.body(13, weight: .medium))
            .foregroundStyle(.white)
            .padding(.horizontal, DS.Spacing.md)
            .padding(.vertical, DS.Spacing.sm)
            .background(Color.zOrange.gradient, in: Capsule())
            .shadow(color: Color.zOrange.opacity(0.35), radius: 8, y: 4)
    }
}
