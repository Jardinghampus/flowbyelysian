import SwiftUI
import SwiftData

struct RequestsView: View {
    @Environment(\.modelContext) private var context
    @EnvironmentObject private var networkMonitor: NetworkMonitor
    @StateObject private var vm = RequestsViewModel()

    var body: some View {
        NavigationStack {
            List(vm.filtered) { req in
                RequestRowView(request: req)
            }
            .listStyle(.plain)
            .navigationTitle("Client Requests")
            .searchable(text: $vm.searchText, prompt: "Sök klientnamn...")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Picker("Status", selection: $vm.filterStatus) {
                            Text("Alla").tag("")
                            Text("Aktiva").tag("active")
                            Text("Matchade").tag("matched")
                            Text("Stängda").tag("closed")
                        }
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                }
            }
            .overlay {
                if vm.isLoading && vm.requests.isEmpty { ProgressView() }
                else if vm.filtered.isEmpty && !vm.isLoading {
                    ContentUnavailableView("Inga requests", systemImage: "person.2.slash")
                }
            }
            .task { await vm.load(context: context, isOnline: networkMonitor.isConnected) }
            .refreshable { await vm.load(context: context, isOnline: networkMonitor.isConnected) }
        }
    }
}

struct RequestRowView: View {
    let request: ClientRequest

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(request.clientName)
                    .font(.subheadline.weight(.semibold))
                Spacer()
                if let status = request.status {
                    Text(status.capitalized)
                        .font(.caption2.weight(.semibold))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 3)
                        .background(statusColor(status), in: Capsule())
                        .foregroundStyle(.white)
                }
            }
            HStack(spacing: 12) {
                if let type = request.propertyType {
                    Label(type.capitalized, systemImage: "building.2")
                        .font(.caption).foregroundStyle(.secondary)
                }
                if let beds = request.bedrooms, beds > 0 {
                    Label("\(beds) bd", systemImage: "bed.double")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }
            Text(request.budgetFormatted)
                .font(.caption.weight(.medium))
                .foregroundStyle(.indigo)
        }
        .padding(.vertical, 4)
    }

    private func statusColor(_ status: String) -> Color {
        switch status {
        case "active": return .green
        case "matched": return .blue
        default: return .gray
        }
    }
}
