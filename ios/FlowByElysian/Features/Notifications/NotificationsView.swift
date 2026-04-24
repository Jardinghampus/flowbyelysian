import SwiftUI
import SwiftData

struct NotificationsView: View {
    @Environment(AppState.self) private var appState
    @Environment(NetworkMonitor.self) private var network
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @State private var vm = NotificationsViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if vm.notifications.isEmpty && !vm.isLoading {
                    ContentUnavailableView(
                        "Inga aviseringar",
                        systemImage: "bell.slash",
                        description: Text("Du är à jour!")
                    )
                } else {
                    notificationList
                }
            }
            .navigationTitle("Aviseringar")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { notificationsToolbar }
            .refreshable { await vm.load(context: context, isOnline: network.isConnected, appState: appState) }
            .alert("Fel", isPresented: Binding(
                get: { vm.errorMessage != nil },
                set: { if !$0 { vm.errorMessage = nil } }
            )) {
                Button("OK") { vm.errorMessage = nil }
            } message: {
                Text(vm.errorMessage ?? "")
            }
        }
        .task { await vm.load(context: context, isOnline: network.isConnected, appState: appState) }
    }

    private var notificationList: some View {
        List {
            ForEach(vm.notifications) { notification in
                NotificationRow(notification: notification) {
                    Task { await vm.markRead(id: notification.id, context: context) }
                }
                .listRowSeparator(.hidden)
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets(
                    top: AppTheme.Spacing.xs,
                    leading: AppTheme.Spacing.md,
                    bottom: AppTheme.Spacing.xs,
                    trailing: AppTheme.Spacing.md
                ))
                .swipeActions(edge: .leading, allowsFullSwipe: true) {
                    if notification.isUnread {
                        Button("Läst", systemImage: "checkmark") {
                            Task { await vm.markRead(id: notification.id, context: context) }
                        }
                        .tint(.green)
                    }
                }
            }
        }
        .listStyle(.plain)
    }

    @ToolbarContentBuilder
    private var notificationsToolbar: some ToolbarContent {
        ToolbarItem(placement: .topBarLeading) {
            Button("Stäng", action: dismiss.callAsFunction)
        }
        ToolbarItem(placement: .topBarTrailing) {
            if vm.isLoading {
                ProgressView()
            } else if vm.unreadCount > 0 {
                Button("Markera alla") {
                    Task { await vm.markAllRead(context: context) }
                }
                .font(.subheadline)
            }
        }
    }
}

// MARK: - Row

private struct NotificationRow: View {
    let notification: AppNotification
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(alignment: .top, spacing: AppTheme.Spacing.sm) {
                ZStack {
                    Circle()
                        .fill(notification.isUnread
                              ? AppTheme.Color.brand.opacity(0.15)
                              : Color(.systemFill))
                        .frame(width: 40, height: 40)
                    Image(systemName: notification.typeIcon)
                        .font(.callout)
                        .foregroundStyle(notification.isUnread ? AppTheme.Color.brand : .secondary)
                }
                .accessibilityHidden(true)

                VStack(alignment: .leading, spacing: 3) {
                    Text(notification.title)
                        .font(.subheadline.weight(notification.isUnread ? .semibold : .regular))
                        .foregroundStyle(.primary)

                    if let message = notification.message {
                        Text(message)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(2)
                    }

                    if let date = notification.relativeDate {
                        Text(date)
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                }

                Spacer()

                if notification.isUnread {
                    Circle()
                        .fill(AppTheme.Color.brand)
                        .frame(width: 8, height: 8)
                        .padding(.top, 5)
                        .accessibilityLabel("Oläst")
                }
            }
            .padding(AppTheme.Spacing.md)
            .background(.background, in: .rect(cornerRadius: AppTheme.Radius.md))
            .overlay {
                RoundedRectangle(cornerRadius: AppTheme.Radius.md)
                    .strokeBorder(.separator, lineWidth: 0.5)
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(notification.title)\(notification.message.map { ", \($0)" } ?? "")\(notification.isUnread ? ", oläst" : "")")
    }
}

// MARK: - AppNotification helpers

private extension AppNotification {
    var relativeDate: String? {
        guard let createdAt else { return nil }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = formatter.date(from: createdAt) else { return nil }
        return date.formatted(.relative(presentation: .named))
    }
}
