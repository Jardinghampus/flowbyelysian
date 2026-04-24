import SwiftUI

struct LeftDrawerView: View {
    @Environment(AppState.self) private var appState
    @Environment(AuthManager.self) private var auth
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Profile header
            ProfileHeader()
                .padding(.top, 60)
                .padding(.horizontal, AppTheme.Spacing.md)

            Divider()
                .padding(.vertical, AppTheme.Spacing.md)

            // Navigation items
            ScrollView {
                VStack(spacing: AppTheme.Spacing.xs) {
                    DrawerNavItem(icon: "house.fill",         label: "Dashboard",    tab: .home)
                    DrawerNavItem(icon: "building.2.fill",    label: "Listings",     tab: .listings)
                    DrawerNavItem(icon: "person.2.fill",      label: "Clients",      tab: .clients)
                    DrawerNavItem(icon: "chart.bar.fill",     label: "Reports",      tab: .reports)
                }
                .padding(.horizontal, AppTheme.Spacing.sm)

                Divider()
                    .padding(.vertical, AppTheme.Spacing.md)
                    .padding(.horizontal, AppTheme.Spacing.md)

                VStack(spacing: AppTheme.Spacing.xs) {
                    DrawerActionItem(icon: "bubble.left.and.bubble.right.fill",
                                     label: "AI Coach",
                                     action: { appState.openChat() })
                    DrawerActionItem(icon: "bell.badge.fill",
                                     label: "Aviseringar",
                                     badge: appState.notificationUnreadCount,
                                     action: { appState.openNotifications() })
                    DrawerActionItem(icon: "gearshape.fill",
                                     label: "Inställningar",
                                     action: { appState.closeDrawer() })
                }
                .padding(.horizontal, AppTheme.Spacing.sm)
            }
            .scrollIndicators(.hidden)

            Spacer()

            // Sign out
            Button(action: auth.signOut) {
                Label("Logga ut", systemImage: "rectangle.portrait.and.arrow.right")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.red)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(AppTheme.Spacing.md)
                    .contentShape(.rect)
            }
            .padding(.bottom, 32)
        }
        .frame(maxHeight: .infinity, alignment: .top)
        .background {
            Rectangle()
                .fill(.ultraThinMaterial)
                .ignoresSafeArea()
                .overlay(alignment: .trailing) {
                    Rectangle()
                        .fill(.separator)
                        .frame(width: 0.5)
                }
        }
    }
}

private struct ProfileHeader: View {
    @Environment(AuthManager.self) private var auth

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Circle()
                .fill(AppTheme.Color.brand.gradient)
                .frame(width: 48, height: 48)
                .overlay {
                    Text(auth.currentUser?.initials ?? "?")
                        .font(.callout.bold())
                        .foregroundStyle(.white)
                }

            VStack(alignment: .leading, spacing: 2) {
                Text(auth.currentUser?.name ?? "Agent")
                    .font(.subheadline.bold())
                Text(auth.currentUser?.role.capitalized ?? "")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

private struct DrawerNavItem: View {
    @Environment(AppState.self) private var appState
    let icon: String
    let label: String
    let tab: AppTab

    var isSelected: Bool { appState.selectedTab == tab }

    var body: some View {
        Button {
            appState.navigate(to: tab)
        } label: {
            Label(label, systemImage: icon)
                .font(.subheadline.weight(isSelected ? .semibold : .regular))
                .foregroundStyle(isSelected ? AppTheme.Color.brand : .primary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, AppTheme.Spacing.sm)
                .padding(.vertical, 11)
                .background(isSelected ? AppTheme.Color.brand.opacity(0.1) : .clear,
                            in: .rect(cornerRadius: AppTheme.Radius.sm))
        }
        .buttonStyle(.plain)
        .sensoryFeedback(.selection, trigger: isSelected)
    }
}

private struct DrawerActionItem: View {
    let icon: String
    let label: String
    var badge: Int = 0
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack {
                Label(label, systemImage: icon)
                    .font(.subheadline)
                    .foregroundStyle(.primary)
                Spacer()
                if badge > 0 {
                    Text(badge > 99 ? "99+" : badge.formatted())
                        .font(.caption2.bold())
                        .foregroundStyle(.white)
                        .padding(.horizontal, 5)
                        .frame(minWidth: 18, minHeight: 18)
                        .background(AppTheme.Color.pending, in: Capsule())
                        .accessibilityLabel("\(badge) olästa")
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, AppTheme.Spacing.sm)
            .padding(.vertical, 11)
            .contentShape(.rect)
        }
        .buttonStyle(.plain)
    }
}
