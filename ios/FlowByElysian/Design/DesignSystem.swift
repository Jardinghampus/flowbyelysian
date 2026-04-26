import SwiftUI

// MARK: - Typography

enum AppFont {
    static func display(_ size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }
    static func heading(_ size: CGFloat, weight: Font.Weight = .semibold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }
    static func body(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .system(size: size, weight: weight, design: .default)
    }
    static func mono(_ size: CGFloat, weight: Font.Weight = .medium) -> Font {
        .system(size: size, weight: weight, design: .monospaced)
    }
    static func label(_ size: CGFloat = 11) -> Font {
        .system(size: size, weight: .semibold, design: .default)
    }
}

// MARK: - Hex Color

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int & 0xFF0000) >> 16) / 255
        let g = Double((int & 0x00FF00) >> 8)  / 255
        let b = Double(int & 0x0000FF)          / 255
        self.init(red: r, green: g, blue: b)
    }
}

// MARK: - Semantic Colors

extension Color {

    // ── Accent (same in both modes — AAA contrast guaranteed) ──
    static let zBlue    = Color(hex: "#0A84FF")  // primary CTA, links
    static let zIndigo  = Color(hex: "#5E5CE6")  // secondary, premium
    static let zGreen   = Color(hex: "#30D158")  // success, live
    static let zAmber   = Color(hex: "#FFD60A")  // warning, stale
    static let zRed     = Color(hex: "#FF453A")  // danger, delete
    static let zOrange  = Color(hex: "#FF6B35")  // tasks, pending
    static let zPurple  = Color(hex: "#BF5AF2")  // AI, premium

    // ── AMOLED-first adaptive backgrounds ──────────────────────
    static let zBg: Color = Color(UIColor { t in
        t.userInterfaceStyle == .dark
            ? UIColor(red: 0,     green: 0,     blue: 0,     alpha: 1) // #000000
            : UIColor(red: 0.961, green: 0.961, blue: 0.969, alpha: 1) // #F5F5F7
    })
    static let zCard: Color = Color(UIColor { t in
        t.userInterfaceStyle == .dark
            ? UIColor(red: 0.039, green: 0.039, blue: 0.039, alpha: 1) // #0A0A0A
            : UIColor(red: 1,     green: 1,     blue: 1,     alpha: 1) // #FFFFFF
    })
    static let zCardRaised: Color = Color(UIColor { t in
        t.userInterfaceStyle == .dark
            ? UIColor(red: 0.067, green: 0.067, blue: 0.067, alpha: 1) // #111111
            : UIColor(red: 0.969, green: 0.969, blue: 0.973, alpha: 1) // #F7F7F8
    })
    static let zSurface: Color = Color(UIColor { t in
        t.userInterfaceStyle == .dark
            ? UIColor(red: 0.082, green: 0.082, blue: 0.082, alpha: 1) // #151515
            : UIColor(red: 0.949, green: 0.949, blue: 0.953, alpha: 1) // #F2F2F3
    })

    // ── Borders ────────────────────────────────────────────────
    static let zBorderSubtle  = Color.white.opacity(0.06)
    static let zBorderDefault = Color.white.opacity(0.10)
    static let zBorderStrong  = Color.white.opacity(0.18)
}

// MARK: - Gradients

extension LinearGradient {
    static let zBlue = LinearGradient(
        colors: [Color.zBlue, Color.zIndigo],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    static let zSuccess = LinearGradient(
        colors: [Color.zGreen, Color.zBlue],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    static let zPremium = LinearGradient(
        colors: [Color.zPurple, Color.zIndigo],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    static let zWarm = LinearGradient(
        colors: [Color.zOrange, Color.zRed],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
    static let zHero = LinearGradient(
        stops: [
            .init(color: Color(hex: "#0A1628"), location: 0),
            .init(color: Color(hex: "#0D1F3C"), location: 0.5),
            .init(color: Color(hex: "#0A0F1E"), location: 1),
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

// MARK: - DS Namespace (Design System)

enum DS {

    enum Spacing {
        static let xs:   CGFloat = 4
        static let sm:   CGFloat = 8
        static let md:   CGFloat = 12
        static let base: CGFloat = 16
        static let lg:   CGFloat = 20
        static let xl:   CGFloat = 24
        static let xxl:  CGFloat = 32
        static let xxxl: CGFloat = 48
    }

    enum Radius {
        static let sm:   CGFloat = 8
        static let md:   CGFloat = 12
        static let lg:   CGFloat = 16
        static let xl:   CGFloat = 20
        static let xxl:  CGFloat = 28
        static let pill: CGFloat = 999
    }

    enum Anim {
        static let quick    = SwiftUI.Animation.spring(response: 0.28, dampingFraction: 0.80)
        static let standard = SwiftUI.Animation.spring(response: 0.42, dampingFraction: 0.75)
        static let slow     = SwiftUI.Animation.spring(response: 0.60, dampingFraction: 0.70)
        static let easeOut  = SwiftUI.Animation.easeOut(duration: 0.25)
    }
}

// MARK: - Premium Card Modifier (AMOLED-optimised)

struct ZCardModifier: ViewModifier {
    var radius: CGFloat
    var elevated: Bool

    func body(content: Content) -> some View {
        content
            .background(elevated ? Color.zCardRaised : Color.zCard,
                        in: .rect(cornerRadius: radius))
            .overlay {
                RoundedRectangle(cornerRadius: radius)
                    .strokeBorder(Color.zBorderSubtle, lineWidth: 0.5)
            }
            .shadow(color: .black.opacity(0.28), radius: 20, x: 0, y: 6)
    }
}

extension View {
    func zCard(radius: CGFloat = DS.Radius.lg, elevated: Bool = false) -> some View {
        modifier(ZCardModifier(radius: radius, elevated: elevated))
    }
}

// MARK: - Shimmer Modifier

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = -1

    func body(content: Content) -> some View {
        content
            .overlay {
                GeometryReader { geo in
                    LinearGradient(
                        stops: [
                            .init(color: .clear, location: 0),
                            .init(color: .white.opacity(0.06), location: 0.35),
                            .init(color: .white.opacity(0.12), location: 0.5),
                            .init(color: .white.opacity(0.06), location: 0.65),
                            .init(color: .clear, location: 1),
                        ],
                        startPoint: .init(x: phase, y: 0),
                        endPoint: .init(x: phase + 1, y: 0)
                    )
                }
            }
            .onAppear {
                withAnimation(.linear(duration: 1.6).repeatForever(autoreverses: false)) {
                    phase = 1
                }
            }
    }
}

extension View {
    func shimmer() -> some View { modifier(ShimmerModifier()) }
}

// MARK: - Liquid Button Style (spring press)

struct LiquidButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .opacity(configuration.isPressed ? 0.88 : 1.0)
            .animation(DS.Anim.quick, value: configuration.isPressed)
    }
}

// MARK: - Number counting animation helper

struct CountingText: View {
    let value: Double
    let format: String
    @State private var displayed: Double = 0

    var body: some View {
        Text(String(format: format, displayed))
            .onAppear {
                withAnimation(.easeOut(duration: 1.1).delay(0.3)) {
                    displayed = value
                }
            }
    }
}
