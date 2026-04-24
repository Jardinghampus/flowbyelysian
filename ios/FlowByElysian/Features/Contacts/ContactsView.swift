import SwiftUI
import SwiftData

struct ContactsView: View {
    @Environment(\.modelContext) private var context
    @EnvironmentObject private var networkMonitor: NetworkMonitor
    @StateObject private var vm = ContactsViewModel()

    var body: some View {
        NavigationStack {
            List(vm.filtered) { contact in
                NavigationLink(destination: ContactDetailView(contact: contact)) {
                    ContactRowView(contact: contact)
                }
            }
            .listStyle(.plain)
            .navigationTitle("Kontakter")
            .searchable(text: $vm.searchText, prompt: "Sök namn, email...")
            .overlay {
                if vm.isLoading && vm.contacts.isEmpty {
                    ProgressView()
                } else if vm.filtered.isEmpty && !vm.isLoading {
                    ContentUnavailableView("Inga kontakter", systemImage: "person.slash")
                }
            }
            .task { await vm.load(context: context, isOnline: networkMonitor.isConnected) }
            .refreshable { await vm.load(context: context, isOnline: networkMonitor.isConnected) }
        }
    }
}

struct ContactRowView: View {
    let contact: Contact

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(.indigo.gradient)
                .frame(width: 44, height: 44)
                .overlay(Text(contact.initials).font(.callout.weight(.semibold)).foregroundStyle(.white))

            VStack(alignment: .leading, spacing: 3) {
                Text(contact.name).font(.subheadline.weight(.semibold))
                if let email = contact.email {
                    Text(email).font(.caption).foregroundStyle(.secondary)
                }
            }
            Spacer()
            if let role = contact.role {
                Text(role).font(.caption2).foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}

struct ContactDetailView: View {
    let contact: Contact

    var body: some View {
        List {
            Section {
                HStack {
                    Spacer()
                    VStack(spacing: 8) {
                        Circle()
                            .fill(.indigo.gradient)
                            .frame(width: 80, height: 80)
                            .overlay(Text(contact.initials).font(.title.weight(.bold)).foregroundStyle(.white))
                        Text(contact.name).font(.title2.bold())
                        if let role = contact.role {
                            Text(role).font(.subheadline).foregroundStyle(.secondary)
                        }
                    }
                    Spacer()
                }
                .listRowBackground(Color.clear)
            }

            if let email = contact.email {
                Section("Email") {
                    Label(email, systemImage: "envelope")
                }
            }
            if let phone = contact.phone {
                Section("Telefon") {
                    Label(phone, systemImage: "phone")
                }
            }
            if let wa = contact.whatsapp {
                Section("WhatsApp") {
                    Label(wa, systemImage: "message")
                }
            }
        }
        .navigationTitle(contact.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}
