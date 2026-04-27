import SwiftUI

struct LeftDrawerView: View {
    @Environment(AppState.self) private var appState
    @Environment(AuthManager.self) private var auth
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            DSPDrawerHeader()
                .padding(.top, 56)
                .padding(.horizontal, AppTheme.Spacing.md)

            Divider()
                .padding(.vertical, AppTheme.Spacing.md)

            ScrollView {
                VStack(spacing: AppTheme.Spacing.xs) {
                    // Main navigation tabs
                    DrawerSectionHeader("Navigation")
                    DrawerNavItem(icon: "house.fill",                   label: "Dashboard",   tab: .home)
                    DrawerNavItem(icon: "building.2.fill",              label: "Listings",    tab: .listings)
                    DrawerNavItem(icon: "sparkles",                     label: "AI Matches",  tab: .matches)
                    DrawerNavItem(icon: "person.2.fill",                label: "Clients",     tab: .clients)
                    DrawerNavItem(icon: "chart.line.uptrend.xyaxis",    label: "Performance", tab: .performance)
                }
                .padding(.horizontal, AppTheme.Spacing.sm)

                Divider()
                    .padding(.vertical, AppTheme.Spacing.sm)
                    .padding(.horizontal, AppTheme.Spacing.md)

                VStack(spacing: AppTheme.Spacing.xs) {
                    // Utilities
                    DrawerSectionHeader("Tools")
                    DrawerActionItem(icon: "bubble.left.and.bubble.right.fill",
                                     label: "AI Coach",
                                     action: { appState.openChat() })
                    DrawerActionItem(icon: "bell.badge.fill",
                                     label: "Notifications",
                                     badge: appState.notificationUnreadCount,
                                     action: { appState.openNotifications() })
                    DrawerActionItem(icon: "mappin.and.ellipse",
                                     label: "Areas",
                                     action: { appState.openAreas() })
                    DrawerActionItem(icon: "newspaper.fill",
                                     label: "News",
                                     action: { appState.openNews() })
                    DrawerActionItem(icon: "checklist",
                                     label: "Tasks",
                                     action: { appState.openTasks() })
                    DrawerActionItem(icon: "rectangle.split.3x1",
                                     label: "Pipeline",
                                     action: { appState.openPipeline() })
                    DrawerActionItem(icon: "calendar",
                                     label: "Calendar",
                                     action: { appState.openCalendar() })
                    DrawerActionItem(icon: "wand.and.sparkles",
                                     label: "SEO Generator",
                                     action: { appState.openSEO() })
                    DrawerActionItem(icon: "book.fill",
                                     label: "Training",
                                     action: { appState.openTraining() })
                    DrawerActionItem(icon: "gearshape.fill",
                                     label: "Settings",
                                     action: { appState.openSettings() })
                }
                .padding(.horizontal, AppTheme.Spacing.sm)
            }
            .scrollIndicators(.hidden)

            Spacer()

            Button(action: auth.signOut) {
                Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
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

// MARK: - Section header

private struct DrawerSectionHeader: View {
    let title: String
    init(_ title: String) { self.title = title }

    var body: some View {
        Text(title)
            .font(.caption2.weight(.semibold))
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, AppTheme.Spacing.sm)
            .padding(.top, AppTheme.Spacing.xs)
    }
}

// MARK: - DSP branded drawer header

private struct DSPDrawerHeader: View {
    @Environment(AuthManager.self) private var auth

    var body: some View {
        VStack(alignment: .leading, spacing: DS.Spacing.md) {
            // Brand wordmark
            HStack(spacing: DS.Spacing.sm) {
                Circle()
                    .fill(Color.black)
                    .frame(width: 32, height: 32)
                    .overlay { Circle().strokeBorder(Color.zGold.opacity(0.7), lineWidth: 1) }
                    .overlay {
                        Text("D")
                            .font(.system(size: 14, weight: .thin, design: .serif))
                            .foregroundStyle(Color.zGold)
                    }

                VStack(alignment: .leading, spacing: 1) {
                    Text("DERRICK")
                        .font(.system(size: 10, weight: .light))
                        .tracking(3)
                        .foregroundStyle(.primary)
                    Text("SIGNATURE PROPERTIES")
                        .font(.system(size: 6, weight: .regular))
                        .tracking(2)
                        .foregroundStyle(.secondary)
                }
            }

            // Agent info
            HStack(spacing: DS.Spacing.sm) {
                Circle()
                    .fill(Color.zBlue.opacity(0.15))
                    .frame(width: 40, height: 40)
                    .overlay {
                        Text(auth.currentUser?.initials ?? "?")
                            .font(AppFont.heading(15))
                            .foregroundStyle(Color.zBlue)
                    }

                VStack(alignment: .leading, spacing: 2) {
                    Text(auth.currentUser?.name ?? "Agent")
                        .font(AppFont.body(14, weight: .semibold))
                    Text(auth.currentUser?.role.capitalized ?? "Agent")
                        .font(AppFont.body(12))
                        .foregroundStyle(.secondary)
                }
            }
        }
    }
}

// MARK: - Nav item

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

// MARK: - Action item

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
                        .accessibilityLabel("\(badge) unread")
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
