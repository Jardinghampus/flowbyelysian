import SwiftUI
import SwiftData

struct NotificationsView: View {
    @Environment(\.modelContext) private var context
    @EnvironmentObject private var networkMonitor: NetworkMonitor
    @StateObject private var vm = NotificationsViewModel()

    var body: some View {
        NavigationStack {
            List(vm.notifications) { notification in
                NotificationRowView(notification: notification)
            }
            .listStyle(.plain)
            .navigationTitle("Aviseringar")
            .toolbar {
                if networkMonitor.isConnected {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Markera alla") {
                            Task { await vm.markAllRead() }
                        }
                        .font(.caption)
                    }
                }
            }
            .overlay {
                if vm.isLoading && vm.notifications.isEmpty { ProgressView() }
                else if vm.notifications.isEmpty && !vm.isLoading {
                    ContentUnavailableView("Inga aviseringar", systemImage: "bell.slash")
                }
            }
            .task { await vm.load(context: context, isOnline: networkMonitor.isConnected) }
            .refreshable { await vm.load(context: context, isOnline: networkMonitor.isConnected) }
        }
    }
}

struct NotificationRowView: View {
    let notification: AppNotification

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: notification.typeIcon)
                .font(.title3)
                .foregroundStyle(.indigo)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(notification.title)
                        .font(.subheadline.weight(notification.isRead == true ? .regular : .semibold))
                    Spacer()
                    if notification.isRead == false {
                        Circle().fill(.indigo).frame(width: 8, height: 8)
                    }
                }
                if let body = notification.body {
                    Text(body)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
            }
        }
        .padding(.vertical, 4)
    }
}
