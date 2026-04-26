import SwiftUI

enum AppTheme {

    enum Color {
        static let brand     = SwiftUI.Color.zBlue
        static let live      = SwiftUI.Color.zGreen
        static let pocket    = SwiftUI.Color.zPurple
        static let pending   = SwiftUI.Color.zOrange
        static let closed    = SwiftUI.Color.gray

        // Hero gradient (deep navy, AMOLED-optimised)
        static let heroTop    = SwiftUI.Color(hex: "#0A1628")
        static let heroMid    = SwiftUI.Color(hex: "#0D1F3C")
        static let heroBottom = SwiftUI.Color(hex: "#0A0F1E")
    }

    enum Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
    }

    enum Radius {
        static let sm: CGFloat   = 10
        static let md: CGFloat   = 16
        static let lg: CGFloat   = 22
        static let card: CGFloat = 18
    }
}

// MARK: - Liquid Glass card

struct GlassCardModifier: ViewModifier {
    var radius: CGFloat

    func body(content: Content) -> some View {
        content
            .background(.regularMaterial, in: .rect(cornerRadius: radius))
            .overlay {
                RoundedRectangle(cornerRadius: radius)
                    .strokeBorder(.white.opacity(0.10), lineWidth: 0.5)
            }
            .shadow(color: .black.opacity(0.22), radius: 18, x: 0, y: 6)
    }
}

extension View {
    func glassCard(radius: CGFloat = AppTheme.Radius.card) -> some View {
        modifier(GlassCardModifier(radius: radius))
    }
}

// MARK: - Status colour helper

extension String {
    var statusColor: Color {
        switch self {
        case "live", "active":  return AppTheme.Color.live
        case "pocket":          return AppTheme.Color.pocket
        case "matched":         return AppTheme.Color.brand
        case "unofficial":      return AppTheme.Color.pending
        default:                return AppTheme.Color.closed
        }
    }
}
