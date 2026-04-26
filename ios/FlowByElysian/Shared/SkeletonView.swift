import SwiftUI

// MARK: - Skeleton placeholder shapes

struct SkeletonRect: View {
    var height: CGFloat = 16
    var cornerRadius: CGFloat = DS.Radius.sm
    var widthFraction: CGFloat = 1.0

    var body: some View {
        Rectangle()
            .fill(Color.zCardRaised)
            .frame(maxWidth: .infinity)
            .frame(height: height)
            .clipShape(.rect(cornerRadius: cornerRadius))
            .shimmer()
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct SkeletonCircle: View {
    var size: CGFloat = 40

    var body: some View {
        Circle()
            .fill(Color.zCardRaised)
            .frame(width: size, height: size)
            .shimmer()
    }
}

// MARK: - Listing card skeleton

struct ListingCardSkeleton: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image placeholder
            Rectangle()
                .fill(Color.zCardRaised)
                .frame(height: 130)
                .shimmer()

            VStack(alignment: .leading, spacing: DS.Spacing.xs) {
                SkeletonRect(height: 13, widthFraction: 0.8)
                SkeletonRect(height: 11, cornerRadius: 6, widthFraction: 0.5)
                SkeletonRect(height: 10, cornerRadius: 5, widthFraction: 0.65)
            }
            .padding(DS.Spacing.sm + 2)
        }
        .frame(width: 190)
        .zCard()
    }
}

// MARK: - Row skeleton

struct RowSkeleton: View {
    var body: some View {
        HStack(spacing: DS.Spacing.sm) {
            SkeletonCircle(size: 38)

            VStack(alignment: .leading, spacing: DS.Spacing.xs) {
                SkeletonRect(height: 13, widthFraction: 0.6)
                SkeletonRect(height: 11, cornerRadius: 5, widthFraction: 0.4)
            }

            Spacer()

            SkeletonRect(height: 20, cornerRadius: DS.Radius.sm)
                .frame(width: 56)
        }
        .padding(DS.Spacing.sm + 2)
        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
    }
}

// MARK: - Dashboard skeleton (shown while loading)

struct DashboardSkeleton: View {
    var body: some View {
        VStack(spacing: DS.Spacing.lg) {
            // Hero card placeholder
            Rectangle()
                .fill(Color.zCard)
                .frame(height: 210)
                .clipShape(.rect(cornerRadius: DS.Radius.xl))
                .shimmer()

            // Quick actions
            HStack(spacing: DS.Spacing.sm) {
                ForEach(0..<4, id: \.self) { _ in
                    RoundedRectangle(cornerRadius: DS.Radius.md)
                        .fill(Color.zCard)
                        .frame(height: 70)
                        .shimmer()
                }
            }

            // KPI row
            HStack(spacing: DS.Spacing.sm) {
                ForEach(0..<2, id: \.self) { _ in
                    RoundedRectangle(cornerRadius: DS.Radius.md)
                        .fill(Color.zCard)
                        .frame(height: 90)
                        .shimmer()
                }
            }

            // Row skeletons
            ForEach(0..<3, id: \.self) { _ in
                RowSkeleton()
            }
        }
        .padding(.horizontal, DS.Spacing.base)
        .padding(.vertical, DS.Spacing.md)
    }
}
