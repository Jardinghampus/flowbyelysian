import SwiftUI
import EventKit

@Observable @MainActor
final class CalendarViewModel {
    private(set) var events: [EKEvent] = []
    private(set) var isLoading = false
    private(set) var hasAccess = false
    private(set) var accessDenied = false

    var selectedDate: Date = Calendar.current.startOfDay(for: .now)
    var displayedMonth: Date = Calendar.current.startOfDay(for: .now)

    private let store = EKEventStore()
    private let cal = Calendar.current

    var eventsForSelectedDay: [EKEvent] {
        let start = cal.startOfDay(for: selectedDate)
        guard let end = cal.date(byAdding: .day, value: 1, to: start) else { return [] }
        return events.filter { e in
            e.startDate < end && (e.endDate ?? e.startDate) >= start
        }.sorted { $0.startDate < $1.startDate }
    }

    func eventDates(in month: Date) -> Set<Int> {
        guard let monthStart = cal.date(from: cal.dateComponents([.year, .month], from: month)),
              let monthEnd = cal.date(byAdding: .month, value: 1, to: monthStart) else { return [] }
        let inMonth = events.filter { $0.startDate >= monthStart && $0.startDate < monthEnd }
        return Set(inMonth.map { cal.component(.day, from: $0.startDate) })
    }

    func requestAccessAndLoad() async {
        isLoading = true
        defer { isLoading = false }

        let status = EKEventStore.authorizationStatus(for: .event)
        if status == .denied || status == .restricted {
            accessDenied = true
            return
        }

        var granted = status == .fullAccess
        if !granted {
            if #available(iOS 17, *) {
                granted = (try? await store.requestFullAccessToEvents()) ?? false
            } else {
                granted = await withCheckedContinuation { cont in
                    store.requestAccess(to: .event) { g, _ in cont.resume(returning: g) }
                }
            }
        }

        if granted {
            hasAccess = true
            accessDenied = false
            loadEvents()
        } else {
            accessDenied = true
        }
    }

    func loadEvents() {
        guard hasAccess else { return }
        guard let start = cal.date(byAdding: .month, value: -1, to: displayedMonth),
              let end   = cal.date(byAdding: .month, value: 2,  to: displayedMonth) else { return }
        let pred = store.predicateForEvents(withStart: start, end: end, calendars: nil)
        events = store.events(matching: pred).sorted { $0.startDate < $1.startDate }
    }

    func nextMonth() {
        withAnimation(DS.Anim.quick) {
            displayedMonth = cal.date(byAdding: .month, value: 1, to: displayedMonth) ?? displayedMonth
        }
        loadEvents()
    }

    func prevMonth() {
        withAnimation(DS.Anim.quick) {
            displayedMonth = cal.date(byAdding: .month, value: -1, to: displayedMonth) ?? displayedMonth
        }
        loadEvents()
    }

    func daysInMonth() -> [Date?] {
        guard let monthStart = cal.date(from: cal.dateComponents([.year, .month], from: displayedMonth)),
              let range = cal.range(of: .day, in: .month, for: monthStart) else { return [] }

        let weekday = cal.component(.weekday, from: monthStart)
        let offset = (weekday - cal.firstWeekday + 7) % 7
        var days: [Date?] = Array(repeating: nil, count: offset)

        for day in range {
            if let date = cal.date(byAdding: .day, value: day - 1, to: monthStart) {
                days.append(date)
            }
        }
        return days
    }

    func addEvent(title: String, start: Date, end: Date, notes: String?) async -> Bool {
        guard hasAccess else { return false }
        let event = EKEvent(eventStore: store)
        event.title = title
        event.startDate = start
        event.endDate = end
        event.notes = notes
        event.calendar = store.defaultCalendarForNewEvents

        do {
            try store.save(event, span: .thisEvent)
            loadEvents()
            return true
        } catch {
            return false
        }
    }
}
