import UserNotifications
import SwiftUI

// Manages all local and push notification setup.
// Categories and quick-action buttons are registered at launch.

@Observable @MainActor
final class NotificationManager: NSObject {
    static let shared = NotificationManager()
    private(set) var authStatus: UNAuthorizationStatus = .notDetermined

    private override init() { super.init() }

    // MARK: - Registration

    func registerOnLaunch() {
        UNUserNotificationCenter.current().delegate = self
        registerCategories()
        Task { await refreshStatus() }
    }

    func requestPermission() async -> Bool {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
            await refreshStatus()
            return granted
        } catch {
            return false
        }
    }

    func refreshStatus() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        authStatus = settings.authorizationStatus
    }

    // MARK: - Notification categories (quick actions)

    private func registerCategories() {
        // Match found
        let viewMatch   = UNNotificationAction(identifier: "VIEW_MATCH",   title: "View Match",    options: .foreground)
        let dismissMatch = UNNotificationAction(identifier: "DISMISS",      title: "Dismiss",       options: .destructive)
        let matchCat    = UNNotificationCategory(identifier: "MATCH_FOUND",
                                                 actions: [viewMatch, dismissMatch],
                                                 intentIdentifiers: [],
                                                 options: [])

        // Task reminder
        let markDone  = UNNotificationAction(identifier: "MARK_DONE",  title: "Mark Done",       options: [])
        let snooze    = UNNotificationAction(identifier: "SNOOZE",     title: "Remind Tomorrow", options: [])
        let taskCat   = UNNotificationCategory(identifier: "TASK_DUE",
                                               actions: [markDone, snooze],
                                               intentIdentifiers: [],
                                               options: [])

        // Listing inquiry
        let viewListing = UNNotificationAction(identifier: "VIEW_LISTING", title: "View Listing", options: .foreground)
        let listingCat  = UNNotificationCategory(identifier: "LISTING_INQUIRY",
                                                 actions: [viewListing, dismissMatch],
                                                 intentIdentifiers: [],
                                                 options: [])

        UNUserNotificationCenter.current().setNotificationCategories([matchCat, taskCat, listingCat])
    }

    // MARK: - Schedule local notifications

    func scheduleMatchNotification(matchCount: Int) {
        let content = UNMutableNotificationContent()
        content.title = "✨ \(matchCount) new match\(matchCount == 1 ? "" : "es") found"
        content.body  = "Open Flow to review your AI matches."
        content.sound = .default
        content.badge = matchCount as NSNumber
        content.categoryIdentifier = "MATCH_FOUND"

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: "match_\(Date().timeIntervalSince1970)",
                                            content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
    }

    func scheduleTaskReminder(taskID: String, title: String, dueDate: Date) {
        let content = UNMutableNotificationContent()
        content.title = "Task Due"
        content.body  = title
        content.sound = .default
        content.categoryIdentifier = "TASK_DUE"
        content.userInfo = ["taskID": taskID]

        let components = Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: dueDate)
        let trigger  = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        let request  = UNNotificationRequest(identifier: "task_\(taskID)", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
    }

    func cancelTaskReminder(taskID: String) {
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["task_\(taskID)"])
    }

    func clearBadge() {
        UNUserNotificationCenter.current().setBadgeCount(0, withCompletionHandler: nil)
    }
}

// MARK: - Delegate (foreground display + action handling)

extension NotificationManager: UNUserNotificationCenterDelegate {
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler handler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show banner even when app is in foreground
        handler([.banner, .sound, .badge])
    }

    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler handler: @escaping () -> Void
    ) {
        // Extract Sendable values before crossing actor boundary
        let actionIdentifier = response.actionIdentifier
        let taskID = response.notification.request.content.userInfo["taskID"] as? String
        let body   = response.notification.request.content.body
        Task { @MainActor in
            switch actionIdentifier {
            case "VIEW_MATCH":
                AppStateRouter.shared.navigateTo(.matches)
            case "VIEW_LISTING":
                AppStateRouter.shared.navigateTo(.listings)
            case "MARK_DONE":
                if let id = taskID { AppStateRouter.shared.markTaskDone(id) }
            case "SNOOZE":
                if let id = taskID {
                    let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: .now) ?? .now
                    scheduleTaskReminder(taskID: id, title: body, dueDate: tomorrow)
                }
            default:
                break
            }
        }
        handler()
    }
}

// MARK: - Deep-link router (notification → tab navigation)

@Observable @MainActor
final class AppStateRouter {
    static let shared = AppStateRouter()
    var pendingTab: AppTab? = nil
    var pendingTaskDone: String? = nil

    private init() {}

    func navigateTo(_ tab: AppTab) { pendingTab = tab }
    func markTaskDone(_ id: String) { pendingTaskDone = id }
}
