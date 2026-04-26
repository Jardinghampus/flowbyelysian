import SwiftUI

struct StatusBadge: View {
    let status: String

    var body: some View {
        Text(status.capitalized)
            .font(AppFont.label(10))
            .foregroundStyle(.white)
            .padding(.horizontal, DS.Spacing.sm)
            .padding(.vertical, 3)
            .background(status.statusColor, in: Capsule())
    }
}
