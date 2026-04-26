import SwiftUI
import EventKit

struct CalendarView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var vm = CalendarViewModel()
    @State private var showAddEvent = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if vm.accessDenied {
                    accessDeniedView
                } else {
                    MonthHeader(vm: vm)
                        .padding(.horizontal, DS.Spacing.base)
                        .padding(.top, DS.Spacing.md)

                    WeekdayLabels()
                        .padding(.horizontal, DS.Spacing.base)
                        .padding(.top, DS.Spacing.sm)

                    MonthGrid(vm: vm)
                        .padding(.horizontal, DS.Spacing.base)
                        .padding(.top, DS.Spacing.xs)

                    Divider()
                        .padding(.top, DS.Spacing.md)

                    DayEventList(vm: vm)
                }
            }
            .background(Color.zBg.ignoresSafeArea())
            .navigationTitle("Calendar")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { dismiss() }.tint(.secondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    if vm.hasAccess {
                        Button("Add", systemImage: "plus") { showAddEvent = true }
                            .tint(Color.zBlue)
                    }
                }
            }
            .sheet(isPresented: $showAddEvent) {
                AddEventSheet(defaultDate: vm.selectedDate) { title, start, end, notes in
                    let ok = await vm.addEvent(title: title, start: start, end: end, notes: notes)
                    if ok { ToastManager.shared.success("Event added") }
                    else  { ToastManager.shared.error("Failed to save event") }
                }
            }
        }
        .task { await vm.requestAccessAndLoad() }
    }

    private var accessDeniedView: some View {
        ContentUnavailableView {
            Label("Calendar Access Required", systemImage: "calendar.badge.exclamationmark")
        } description: {
            Text("Enable calendar access in Settings to view your viewings and meetings.")
        } actions: {
            Button("Open Settings") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            .buttonStyle(.borderedProminent)
            .tint(Color.zBlue)
        }
        .frame(maxHeight: .infinity)
    }
}

// MARK: - Month header

private struct MonthHeader: View {
    let vm: CalendarViewModel

    private var monthTitle: String {
        vm.displayedMonth.formatted(.dateTime.month(.wide).year())
    }

    var body: some View {
        HStack {
            Button { vm.prevMonth() } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Color.zBlue)
                    .frame(width: 36, height: 36)
                    .background(Color.zCard, in: Circle())
            }
            .buttonStyle(LiquidButtonStyle())

            Spacer()

            Text(monthTitle)
                .font(AppFont.heading(18))
                .foregroundStyle(.primary)
                .contentTransition(.numericText())

            Spacer()

            Button { vm.nextMonth() } label: {
                Image(systemName: "chevron.right")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(Color.zBlue)
                    .frame(width: 36, height: 36)
                    .background(Color.zCard, in: Circle())
            }
            .buttonStyle(LiquidButtonStyle())
        }
    }
}

// MARK: - Weekday labels

private struct WeekdayLabels: View {
    private var labels: [String] {
        let cal = Calendar.current
        let symbols = cal.veryShortWeekdaySymbols
        let first = cal.firstWeekday - 1
        return Array(symbols[first...] + symbols[..<first])
    }

    var body: some View {
        HStack(spacing: 0) {
            ForEach(labels, id: \.self) { day in
                Text(day)
                    .font(AppFont.label(11))
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
    }
}

// MARK: - Month grid

private struct MonthGrid: View {
    @Bindable var vm: CalendarViewModel
    private let cal = Calendar.current
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 0), count: 7)

    var body: some View {
        let days = vm.daysInMonth()
        let eventDays = vm.eventDates(in: vm.displayedMonth)

        LazyVGrid(columns: columns, spacing: 4) {
            ForEach(Array(days.enumerated()), id: \.offset) { _, date in
                if let date {
                    DayCell(
                        date: date,
                        isSelected: cal.isDate(date, inSameDayAs: vm.selectedDate),
                        isToday: cal.isDateInToday(date),
                        hasEvents: eventDays.contains(cal.component(.day, from: date))
                    ) {
                        withAnimation(DS.Anim.quick) {
                            vm.selectedDate = cal.startOfDay(for: date)
                        }
                    }
                } else {
                    Color.clear.frame(height: 44)
                }
            }
        }
    }
}

private struct DayCell: View {
    let date: Date
    let isSelected: Bool
    let isToday: Bool
    let hasEvents: Bool
    let action: () -> Void

    private var day: String {
        Calendar.current.component(.day, from: date).formatted()
    }

    var body: some View {
        Button(action: action) {
            VStack(spacing: 3) {
                Text(day)
                    .font(AppFont.body(14, weight: isSelected || isToday ? .semibold : .regular))
                    .foregroundStyle(isSelected ? .white : isToday ? Color.zBlue : .primary)
                    .frame(width: 36, height: 36)
                    .background(
                        isSelected ? Color.zBlue : Color.clear,
                        in: Circle()
                    )
                    .overlay {
                        if isToday && !isSelected {
                            Circle().strokeBorder(Color.zBlue, lineWidth: 1.5)
                        }
                    }

                Circle()
                    .fill(isSelected ? Color.white.opacity(0.7) : Color.zBlue)
                    .frame(width: 4, height: 4)
                    .opacity(hasEvents ? 1 : 0)
            }
            .frame(maxWidth: .infinity)
            .frame(height: 52)
        }
        .buttonStyle(LiquidButtonStyle())
        .accessibilityLabel("\(date.formatted(.dateTime.day().month())), \(hasEvents ? "has events" : "no events")")
    }
}

// MARK: - Day event list

private struct DayEventList: View {
    let vm: CalendarViewModel

    private var dayTitle: String {
        if Calendar.current.isDateInToday(vm.selectedDate) { return "Today" }
        if Calendar.current.isDateInTomorrow(vm.selectedDate) { return "Tomorrow" }
        if Calendar.current.isDateInYesterday(vm.selectedDate) { return "Yesterday" }
        return vm.selectedDate.formatted(.dateTime.weekday(.wide).day().month())
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(dayTitle)
                .font(AppFont.heading(15))
                .foregroundStyle(.primary)
                .padding(.horizontal, DS.Spacing.base)
                .padding(.vertical, DS.Spacing.md)

            if vm.eventsForSelectedDay.isEmpty {
                ContentUnavailableView(
                    "No Events",
                    systemImage: "calendar",
                    description: Text("Tap + to add a viewing or meeting")
                )
                .frame(maxHeight: .infinity)
            } else {
                ScrollView {
                    LazyVStack(spacing: DS.Spacing.sm) {
                        ForEach(vm.eventsForSelectedDay, id: \.eventIdentifier) { event in
                            EventRow(event: event)
                        }
                    }
                    .padding(.horizontal, DS.Spacing.base)
                    .padding(.bottom, DS.Spacing.xxxl)
                }
                .scrollIndicators(.hidden)
            }
        }
        .frame(maxHeight: .infinity, alignment: .top)
    }
}

private struct EventRow: View {
    let event: EKEvent

    private var timeRange: String {
        if event.isAllDay { return "All day" }
        let start = event.startDate.formatted(.dateTime.hour().minute())
        let end   = event.endDate.formatted(.dateTime.hour().minute())
        return "\(start) – \(end)"
    }

    private var calendarColor: Color {
        guard let cgColor = event.calendar?.cgColor else { return Color.zBlue }
        return Color(cgColor)
    }

    var body: some View {
        HStack(spacing: DS.Spacing.md) {
            Rectangle()
                .fill(calendarColor)
                .frame(width: 3)
                .clipShape(.rect(cornerRadius: DS.Radius.pill))

            VStack(alignment: .leading, spacing: 3) {
                Text(event.title ?? "Untitled")
                    .font(AppFont.body(15, weight: .medium))
                    .foregroundStyle(.primary)
                    .lineLimit(1)

                Text(timeRange)
                    .font(AppFont.body(12))
                    .foregroundStyle(.secondary)

                if let location = event.location, !location.isEmpty {
                    Label(location, systemImage: "mappin")
                        .font(AppFont.body(12))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()
        }
        .padding(DS.Spacing.md)
        .background(Color.zCard, in: .rect(cornerRadius: DS.Radius.md))
        .overlay {
            RoundedRectangle(cornerRadius: DS.Radius.md)
                .strokeBorder(Color.zBorderSubtle, lineWidth: 0.5)
        }
        .accessibilityLabel("\(event.title ?? "Event"), \(timeRange)\(event.location.map { ", \($0)" } ?? "")")
    }
}

// MARK: - Add event sheet

private struct AddEventSheet: View {
    @Environment(\.dismiss) private var dismiss
    let defaultDate: Date
    let onSave: (String, Date, Date, String?) async -> Void

    @State private var title = ""
    @State private var startDate: Date
    @State private var endDate: Date
    @State private var notes = ""
    @State private var isSaving = false

    init(defaultDate: Date, onSave: @escaping (String, Date, Date, String?) async -> Void) {
        self.defaultDate = defaultDate
        self.onSave = onSave
        let start = Calendar.current.date(bySettingHour: 9, minute: 0, second: 0, of: defaultDate) ?? defaultDate
        _startDate = State(initialValue: start)
        _endDate   = State(initialValue: start.addingTimeInterval(3600))
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Event") {
                    TextField("Title *", text: $title)
                }
                Section("Time") {
                    DatePicker("Start", selection: $startDate)
                    DatePicker("End",   selection: $endDate,   in: startDate...)
                }
                Section("Notes") {
                    TextField("Optional…", text: $notes, axis: .vertical)
                        .lineLimit(3...)
                }
            }
            .navigationTitle("New Event")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }.tint(.secondary)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    if isSaving { ProgressView() }
                    else {
                        Button("Save") { save() }
                            .fontWeight(.semibold)
                            .tint(Color.zBlue)
                            .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                }
            }
            .disabled(isSaving)
        }
    }

    private func save() {
        isSaving = true
        Task {
            await onSave(
                title.trimmingCharacters(in: .whitespaces),
                startDate,
                endDate,
                notes.isEmpty ? nil : notes
            )
            isSaving = false
            dismiss()
        }
    }
}
