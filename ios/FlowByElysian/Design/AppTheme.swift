import SwiftUI

// Single source of truth for all design tokens.
enum AppTheme {

    enum Color {
        // Brand – override in asset catalog for production
        static let brand     = SwiftUI.Color.indigo
        static let live      = SwiftUI.Color.green
        static let pocket    = SwiftUI.Color(hue: 0.76, saturation: 0.70, brightness: 0.85)
        static let pending   = SwiftUI.Color.orange
        static let closed    = SwiftUI.Color.gray
    }

    enum Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
    }

    enum Radius {
        static let sm: CGFloat  = 10
        static let md: CGFloat  = 16
        static let lg: CGFloat  = 22
        static let card: CGFloat = 18
    }
}

// MARK: - Liquid Glass card modifier

struct GlassCardModifier: ViewModifier {
    var radius: CGFloat

    func body(content: Content) -> some View {
        content
            .background(.regularMaterial, in: .rect(cornerRadius: radius))
            .overlay {
                RoundedRectangle(cornerRadius: radius)
                    .strokeBorder(.white.opacity(0.12), lineWidth: 0.5)
            }
            .shadow(color: .black.opacity(0.07), radius: 16, x: 0, y: 4)
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
