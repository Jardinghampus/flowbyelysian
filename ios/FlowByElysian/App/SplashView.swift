import SwiftUI

struct SplashView: View {
    @State private var logoScale: CGFloat = 0.55
    @State private var logoOpacity: Double = 0
    @State private var ringProgress: CGFloat = 0

    var body: some View {
        ZStack {
            backgroundGradient

            Circle()
                .stroke(AppTheme.Color.brand.opacity(0.2), lineWidth: 1)
                .frame(width: 280, height: 280)
                .scaleEffect(ringProgress)
                .opacity(ringProgress)
                .blur(radius: 0.5)

            Circle()
                .stroke(AppTheme.Color.brand.opacity(0.10), lineWidth: 1)
                .frame(width: 380, height: 380)
                .scaleEffect(ringProgress * 0.9)
                .opacity(ringProgress * 0.7)

            VStack(spacing: AppTheme.Spacing.md) {
                LogoMark()
                    .scaleEffect(logoScale)
                    .opacity(logoOpacity)

                VStack(spacing: 4) {
                    Text("Flow by Elysian")
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                    Text("Dubai Real Estate")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.5))
                }
                .opacity(logoOpacity)
            }
        }
        .onAppear(perform: startAnimation)
    }

    private var backgroundGradient: some View {
        LinearGradient(
            colors: [
                Color(hue: 0.68, saturation: 0.70, brightness: 0.10),
                Color(hue: 0.72, saturation: 0.60, brightness: 0.18)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }

    private func startAnimation() {
        withAnimation(.spring(response: 0.7, dampingFraction: 0.68)) {
            logoScale = 1
            logoOpacity = 1
        }
        withAnimation(.easeOut(duration: 0.9).delay(0.15)) {
            ringProgress = 1
        }
    }
}

private struct LogoMark: View {
    var body: some View {
        ZStack {
            Circle()
                .fill(AppTheme.Color.brand.opacity(0.18))
                .frame(width: 100, height: 100)
                .blur(radius: 18)

            RoundedRectangle(cornerRadius: 22)
                .fill(
                    LinearGradient(
                        colors: [AppTheme.Color.brand, AppTheme.Color.pocket],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 72, height: 72)
                .overlay {
                    Image(systemName: "building.2.crop.circle.fill")
                        .font(.system(size: 32, weight: .semibold))
                        .foregroundStyle(.white)
                }
                .shadow(color: AppTheme.Color.brand.opacity(0.55), radius: 20, y: 8)
        }
    }
}

#Preview {
    SplashView()
}
