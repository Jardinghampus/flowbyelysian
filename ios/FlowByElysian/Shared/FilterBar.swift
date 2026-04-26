import SwiftUI

struct FilterChip: View {
    let label: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(AppFont.body(13, weight: isSelected ? .semibold : .regular))
                .foregroundStyle(isSelected ? .white : .primary)
                .padding(.horizontal, DS.Spacing.md)
                .padding(.vertical, DS.Spacing.xs + 3)
                .background {
                    Capsule()
                        .fill(isSelected
                              ? AnyShapeStyle(LinearGradient.zBlue)
                              : AnyShapeStyle(Color.zCard))
                }
                .overlay {
                    Capsule()
                        .strokeBorder(
                            isSelected ? Color.clear : Color.zBorderDefault,
                            lineWidth: 0.5
                        )
                }
        }
        .buttonStyle(LiquidButtonStyle())
        .animation(DS.Anim.quick, value: isSelected)
        .sensoryFeedback(.selection, trigger: isSelected)
    }
}
