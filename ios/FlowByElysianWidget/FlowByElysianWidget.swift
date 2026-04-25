import WidgetKit
import SwiftUI

// MARK: - Timeline entry

struct FlowWidgetEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

// MARK: - Timeline provider

struct FlowWidgetProvider: TimelineProvider {
    private let store = WidgetDataStore.shared

    func placeholder(in context: Context) -> FlowWidgetEntry {
        FlowWidgetEntry(date: .now, data: WidgetData())
    }

    func getSnapshot(in context: Context, completion: @escaping (FlowWidgetEntry) -> Void) {
        completion(FlowWidgetEntry(date: .now, data: store.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<FlowWidgetEntry>) -> Void) {
        let data  = store.load()
        let entry = FlowWidgetEntry(date: .now, data: data)
        // Reload every 30 minutes; also reloaded by main app on data change
        let next  = Calendar.current.date(byAdding: .minute, value: 30, to: .now) ?? .now
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

// MARK: - Widget bundle

@main
struct FlowWidgetBundle: WidgetBundle {
    var body: some Widget {
        FlowByElysianWidget()
    }
}

// MARK: - Widget declaration

struct FlowByElysianWidget: Widget {
    let kind = "FlowByElysianWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FlowWidgetProvider()) { entry in
            FlowWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Flow by Elysian")
        .description("Matchningar, listings, provision och kommande händelser.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
