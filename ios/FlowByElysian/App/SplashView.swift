import SwiftUI

struct SplashView: View {
    @State private var logoScale: CGFloat = 0.6
    @State private var logoOpacity: Double = 0
    @State private var glowOpacity: Double = 0
    @State private var glowRadius: CGFloat = 20
    @State private var textOpacity: Double = 0
    @State private var textOffset: CGFloat = 8
    @State private var taglineOpacity: Double = 0
    @State private var outerRingScale: CGFloat = 0.4
    @State private var outerRingOpacity: Double = 0
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            // Ambient outer ring
            Circle()
                .stroke(Color.zBlue.opacity(0.12), lineWidth: 1)
                .frame(width: 340, height: 340)
                .scaleEffect(outerRingScale)
                .opacity(outerRingOpacity)
                .blur(radius: 1)

            Circle()
                .stroke(Color.zIndigo.opacity(0.07), lineWidth: 0.5)
                .frame(width: 460, height: 460)
                .scaleEffect(outerRingScale * 0.88)
                .opacity(outerRingOpacity * 0.6)

            VStack(spacing: DS.Spacing.lg) {
                // Logo mark
                ZStack {
                    // Glow halo
                    Circle()
                        .fill(Color.zBlue.opacity(0.25))
                        .frame(width: 110, height: 110)
                        .blur(radius: glowRadius)
                        .opacity(glowOpacity)

                    // Icon tile
                    RoundedRectangle(cornerRadius: DS.Radius.xl)
                        .fill(LinearGradient.zBlue)
                        .frame(width: 76, height: 76)
                        .overlay {
                            Text("F")
                                .font(.system(size: 38, weight: .black, design: .rounded))
                                .foregroundStyle(.white)
                        }
                        .shadow(color: Color.zBlue.opacity(0.55), radius: 24, y: 10)
                }
                .scaleEffect(logoScale)
                .opacity(logoOpacity)

                // Wordmark + tagline
                VStack(spacing: 5) {
                    Text("Flow by Elysian")
                        .font(AppFont.display(27))
                        .foregroundStyle(.white)

                    Text("Dubai Real Estate")
                        .font(AppFont.body(13))
                        .foregroundStyle(Color.white.opacity(0.45))
                        .tracking(1.5)
                        .textCase(.uppercase)
                }
                .offset(y: textOffset)
                .opacity(textOpacity)
            }
        }
        .onAppear(perform: runSequence)
    }

    private func runSequence() {
        if reduceMotion {
            logoScale = 1; logoOpacity = 1
            glowOpacity = 1; glowRadius = 22
            textOpacity = 1; textOffset = 0
            outerRingScale = 1; outerRingOpacity = 1
            return
        }
        withAnimation(.spring(response: 0.65, dampingFraction: 0.70)) {
            logoScale = 1; logoOpacity = 1
        }
        withAnimation(.easeOut(duration: 0.5).delay(0.18)) {
            glowOpacity = 1; glowRadius = 36
        }
        withAnimation(.easeInOut(duration: 0.7).delay(0.55)) {
            glowRadius = 22
        }
        withAnimation(.spring(response: 0.55, dampingFraction: 0.78).delay(0.32)) {
            textOpacity = 1; textOffset = 0
        }
        withAnimation(.easeOut(duration: 1.1).delay(0.08)) {
            outerRingScale = 1; outerRingOpacity = 1
        }
    }
}

#Preview {
    SplashView()
}
