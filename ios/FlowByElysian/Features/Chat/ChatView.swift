import SwiftUI

struct ChatView: View {
    @StateObject private var vm = ChatViewModel()
    @FocusState private var isFocused: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(vm.messages) { msg in
                                ChatBubble(message: msg)
                                    .id(msg.id)
                            }
                            if vm.isLoading {
                                HStack {
                                    ProgressView()
                                    Text("Tänker...")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    Spacer()
                                }
                                .padding(.horizontal)
                            }
                        }
                        .padding()
                    }
                    .onChange(of: vm.messages.count) {
                        withAnimation { proxy.scrollTo(vm.messages.last?.id) }
                    }
                }

                Divider()

                HStack(spacing: 12) {
                    TextField("Fråga om RERA, listings...", text: $vm.inputText, axis: .vertical)
                        .textFieldStyle(.plain)
                        .lineLimit(1...4)
                        .focused($isFocused)
                        .onSubmit { Task { await vm.send() } }

                    Button {
                        Task { await vm.send() }
                    } label: {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.title2)
                            .foregroundStyle(vm.inputText.isEmpty ? .gray : .indigo)
                    }
                    .disabled(vm.inputText.isEmpty || vm.isLoading)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(.thinMaterial)
            }
            .navigationTitle("AI Coach")
        }
    }
}

struct ChatBubble: View {
    let message: ChatViewModel.ChatMessage

    var isUser: Bool { message.role == "user" }

    var body: some View {
        HStack {
            if isUser { Spacer(minLength: 60) }
            Text(message.content)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(isUser ? Color.indigo : Color(.secondarySystemBackground))
                .foregroundStyle(isUser ? .white : .primary)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            if !isUser { Spacer(minLength: 60) }
        }
    }
}
