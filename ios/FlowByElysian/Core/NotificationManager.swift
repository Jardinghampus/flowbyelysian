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
        let viewMatch   = UNNotificationAction(identifier: "VIEW_MATCH",   title: "Visa Match",      options: .foreground)
        let dismissMatch = UNNotificationAction(identifier: "DISMISS",      title: "Avvisa",          options: .destructive)
        let matchCat    = UNNotificationCategory(identifier: "MATCH_FOUND",
                                                 actions: [viewMatch, dismissMatch],
                                                 intentIdentifiers: [],
                                                 options: [])

        // Task reminder
        let markDone  = UNNotificationAction(identifier: "MARK_DONE",  title: "Markera klar",   options: [])
        let snooze    = UNNotificationAction(identifier: "SNOOZE",     title: "Påminn imorgon", options: [])
        let taskCat   = UNNotificationCategory(identifier: "TASK_DUE",
                                               actions: [markDone, snooze],
                                               intentIdentifiers: [],
                                               options: [])

        // Listing inquiry
        let viewListing = UNNotificationAction(identifier: "VIEW_LISTING", title: "Visa Listing", options: .foreground)
        let listingCat  = UNNotificationCategory(identifier: "LISTING_INQUIRY",
                                                 actions: [viewListing, dismissMatch],
                                                 intentIdentifiers: [],
                                                 options: [])

        UNUserNotificationCenter.current().setNotificationCategories([matchCat, taskCat, listingCat])
    }

    // MARK: - Schedule local notifications

    func scheduleMatchNotification(matchCount: Int) {
        let content = UNMutableNotificationContent()
        content.title = "✨ \(matchCount) ny\(matchCount == 1 ? "" : "a") matchning\(matchCount == 1 ? "" : "ar")"
        content.body  = "Öppna Flow för att se dina AI-matchningar."
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
        content.title = "📋 Uppgift förfaller"
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
        Task { @MainActor in
            switch response.actionIdentifier {
            case "VIEW_MATCH":
                AppStateRouter.shared.navigateTo(.matches)
            case "VIEW_LISTING":
                AppStateRouter.shared.navigateTo(.listings)
            case "MARK_DONE":
                if let taskID = response.notification.request.content.userInfo["taskID"] as? String {
                    AppStateRouter.shared.markTaskDone(taskID)
                }
            case "SNOOZE":
                if let taskID = response.notification.request.content.userInfo["taskID"] as? String {
                    let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: .now) ?? .now
                    let title = response.notification.request.content.body
                    scheduleTaskReminder(taskID: taskID, title: title, dueDate: tomorrow)
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
