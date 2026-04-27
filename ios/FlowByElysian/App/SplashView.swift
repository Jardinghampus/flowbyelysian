import SwiftUI

struct SplashView: View {
    @State private var logoScale: CGFloat = 0.6
    @State private var logoOpacity: Double = 0
    @State private var glowOpacity: Double = 0
    @State private var glowRadius: CGFloat = 20
    @State private var wordmarkOpacity: Double = 0
    @State private var wordmarkOffset: CGFloat = 10
    @State private var ringScale: CGFloat = 0.4
    @State private var ringOpacity: Double = 0
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            // Ambient rings
            Circle()
                .stroke(Color.zGold.opacity(0.10), lineWidth: 1)
                .frame(width: 340, height: 340)
                .scaleEffect(ringScale)
                .opacity(ringOpacity)

            Circle()
                .stroke(Color.zGold.opacity(0.05), lineWidth: 0.5)
                .frame(width: 480, height: 480)
                .scaleEffect(ringScale * 0.9)
                .opacity(ringOpacity * 0.6)

            VStack(spacing: DS.Spacing.xl) {
                // Monogram mark
                ZStack {
                    Circle()
                        .fill(Color.zGold.opacity(0.18))
                        .frame(width: 110, height: 110)
                        .blur(radius: glowRadius)
                        .opacity(glowOpacity)

                    Circle()
                        .fill(Color.black)
                        .frame(width: 80, height: 80)
                        .overlay {
                            Circle()
                                .strokeBorder(
                                    LinearGradient(
                                        colors: [Color.zGold, Color.zGold.opacity(0.4)],
                                        startPoint: .topLeading,
                                        endPoint: .bottomTrailing
                                    ),
                                    lineWidth: 1.5
                                )
                        }
                        .overlay {
                            Text("D")
                                .font(.system(size: 34, weight: .thin, design: .serif))
                                .foregroundStyle(Color.zGold)
                        }
                }
                .scaleEffect(logoScale)
                .opacity(logoOpacity)

                // Wordmark
                VStack(spacing: 5) {
                    Text("DERRICK")
                        .font(.system(size: 20, weight: .light, design: .default))
                        .foregroundStyle(.white)
                        .tracking(8)

                    Text("SIGNATURE PROPERTIES")
                        .font(.system(size: 9, weight: .regular, design: .default))
                        .foregroundStyle(Color.zGold.opacity(0.7))
                        .tracking(4)

                    Rectangle()
                        .fill(Color.zGold.opacity(0.3))
                        .frame(width: 40, height: 0.5)
                        .padding(.top, 6)

                    Text("DUBAI · UAE")
                        .font(.system(size: 9, weight: .regular))
                        .foregroundStyle(.white.opacity(0.3))
                        .tracking(4)
                        .padding(.top, 2)
                }
                .offset(y: wordmarkOffset)
                .opacity(wordmarkOpacity)
            }
        }
        .onAppear(perform: runSequence)
    }

    private func runSequence() {
        if reduceMotion {
            logoScale = 1; logoOpacity = 1
            glowOpacity = 0.8; glowRadius = 24
            wordmarkOpacity = 1; wordmarkOffset = 0
            ringScale = 1; ringOpacity = 1
            return
        }
        withAnimation(.spring(response: 0.70, dampingFraction: 0.72)) {
            logoScale = 1; logoOpacity = 1
        }
        withAnimation(.easeOut(duration: 0.5).delay(0.15)) {
            glowOpacity = 0.8; glowRadius = 38
        }
        withAnimation(.easeInOut(duration: 0.8).delay(0.55)) {
            glowRadius = 24
        }
        withAnimation(.spring(response: 0.55, dampingFraction: 0.78).delay(0.30)) {
            wordmarkOpacity = 1; wordmarkOffset = 0
        }
        withAnimation(.easeOut(duration: 1.2).delay(0.05)) {
            ringScale = 1; ringOpacity = 1
        }
    }
}

#Preview { SplashView() }
