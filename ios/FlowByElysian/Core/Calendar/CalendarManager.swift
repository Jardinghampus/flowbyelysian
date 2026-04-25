import EventKit
import SwiftUI

// Wraps EventKit for calendar access.
// The widget reads pre-fetched events from WidgetDataStore (written here).
// EventKit works with any calendar synced to the device:
// Microsoft Exchange/365, Google, iCloud — all transparent.

@Observable @MainActor
final class CalendarManager {
    private(set) var authStatus: EKAuthorizationStatus = .notDetermined
    private let store = EKEventStore()

    func requestAccess() async -> Bool {
        let status = EKEventStore.authorizationStatus(for: .event)
        if status == .fullAccess { authStatus = status; return true }
        if #available(iOS 17, *) {
            let granted = (try? await store.requestFullAccessToEvents()) ?? false
            authStatus = granted ? .fullAccess : .denied
            return granted
        } else {
            let granted = await withCheckedContinuation { continuation in
                store.requestAccess(to: .event) { granted, _ in
                    continuation.resume(returning: granted)
                }
            }
            authStatus = granted ? .fullAccess : .denied
            return granted
        }
    }

    // Returns next `count` events from the next `days` calendar days
    func fetchUpcoming(days: Int = 5, limit: Int = 3) -> [WidgetEvent] {
        guard EKEventStore.authorizationStatus(for: .event) == .fullAccess else { return [] }
        let start = Date()
        let end   = Calendar.current.date(byAdding: .day, value: days, to: start) ?? start
        let pred  = store.predicateForEvents(withStart: start, end: end, calendars: nil)
        return store.events(matching: pred)
            .sorted { $0.startDate < $1.startDate }
            .prefix(limit)
            .map { event in
                WidgetEvent(
                    id: event.eventIdentifier ?? UUID().uuidString,
                    title: event.title ?? "Händelse",
                    startDate: event.startDate,
                    location: event.location,
                    isAllDay: event.isAllDay
                )
            }
    }
}
