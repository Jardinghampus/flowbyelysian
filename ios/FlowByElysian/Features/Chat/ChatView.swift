import SwiftUI

struct ChatView: View {
    @State private var vm = ChatViewModel()
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if vm.messages.isEmpty {
                    SuggestedPromptsView(prompts: vm.suggestedPrompts) { vm.sendSuggested($0) }
                } else {
                    MessageList(messages: vm.messages, isStreaming: vm.isStreaming)
                }

                Divider()
                InputBar(vm: vm)
            }
            .navigationTitle("AI Coach")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Stäng", action: dismiss.callAsFunction)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    if !vm.messages.isEmpty {
                        Button("Rensa", systemImage: "trash") {
                            withAnimation { vm.clearMessages() }
                        }
                        .tint(.red)
                    }
                }
            }
            .alert("Fel", isPresented: Binding(
                get: { vm.errorMessage != nil },
                set: { if !$0 { vm.errorMessage = nil } }
            )) {
                Button("OK") { vm.errorMessage = nil }
            } message: {
                Text(vm.errorMessage ?? "")
            }
        }
    }
}

// MARK: - Suggested prompts

private struct SuggestedPromptsView: View {
    let prompts: [String]
    let onSelect: (String) -> Void

    var body: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            Spacer()

            VStack(spacing: AppTheme.Spacing.xs) {
                Image(systemName: "bubble.left.and.bubble.right.fill")
                    .font(.system(size: 44))
                    .foregroundStyle(AppTheme.Color.brand.gradient)
                    .accessibilityHidden(true)
                Text("AI Coach")
                    .font(.title2.bold())
                Text("Ställ frågor om Dubai-fastigheter,\nRERA-regler och mäklartips.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }

            VStack(spacing: AppTheme.Spacing.sm) {
                Text("Förslag")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, AppTheme.Spacing.md)

                ForEach(prompts, id: \.self) { prompt in
                    Button {
                        onSelect(prompt)
                    } label: {
                        Text(prompt)
                            .font(.subheadline)
                            .foregroundStyle(.primary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(AppTheme.Spacing.md)
                            .glassCard()
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal, AppTheme.Spacing.md)
                    .accessibilityLabel(prompt)
                }
            }

            Spacer()
        }
    }
}

// MARK: - Message list

private struct MessageList: View {
    let messages: [ChatMessage]
    let isStreaming: Bool

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: AppTheme.Spacing.sm) {
                    ForEach(messages) { msg in
                        MessageBubble(message: msg)
                            .id(msg.id)
                    }
                    if isStreaming, messages.last?.role == .assistant, messages.last?.content.isEmpty == true {
                        TypingIndicator()
                            .id("typing")
                    }
                }
                .padding(AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.sm)
            }
            .scrollIndicators(.hidden)
            .onChange(of: messages.count) {
                withAnimation { proxy.scrollTo(messages.last?.id, anchor: .bottom) }
            }
            .onChange(of: messages.last?.content) {
                withAnimation { proxy.scrollTo(messages.last?.id, anchor: .bottom) }
            }
        }
    }
}

private struct MessageBubble: View {
    let message: ChatMessage

    var isUser: Bool { message.role == .user }

    var body: some View {
        HStack(alignment: .bottom, spacing: AppTheme.Spacing.xs) {
            if isUser { Spacer(minLength: 60) }

            if !isUser {
                Circle()
                    .fill(AppTheme.Color.brand.gradient)
                    .frame(width: 28, height: 28)
                    .overlay {
                        Image(systemName: "sparkles")
                            .font(.caption2.bold())
                            .foregroundStyle(.white)
                    }
                    .accessibilityHidden(true)
            }

            Text(message.content.isEmpty ? " " : message.content)
                .font(.subheadline)
                .foregroundStyle(isUser ? .white : .primary)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(
                    isUser ? AnyShapeStyle(AppTheme.Color.brand.gradient) : AnyShapeStyle(.regularMaterial),
                    in: .rect(
                        topLeadingRadius: isUser ? AppTheme.Radius.md : AppTheme.Radius.sm,
                        bottomLeadingRadius: isUser ? AppTheme.Radius.md : 4,
                        bottomTrailingRadius: isUser ? 4 : AppTheme.Radius.md,
                        topTrailingRadius: isUser ? AppTheme.Radius.sm : AppTheme.Radius.md
                    )
                )
                .textSelection(.enabled)

            if !isUser { Spacer(minLength: 60) }
        }
        .accessibilityLabel("\(isUser ? "Du" : "AI"): \(message.content)")
    }
}

private struct TypingIndicator: View {
    @State private var phase: Int = 0

    var body: some View {
        HStack(alignment: .bottom, spacing: AppTheme.Spacing.xs) {
            Circle()
                .fill(AppTheme.Color.brand.gradient)
                .frame(width: 28, height: 28)
                .overlay {
                    Image(systemName: "sparkles")
                        .font(.caption2.bold())
                        .foregroundStyle(.white)
                }
                .accessibilityHidden(true)

            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(.secondary)
                        .frame(width: 7, height: 7)
                        .scaleEffect(phase == i ? 1.3 : 0.8)
                        .animation(.easeInOut(duration: 0.4).repeatForever().delay(Double(i) * 0.15), value: phase)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(.regularMaterial, in: .rect(
                topLeadingRadius: AppTheme.Radius.sm,
                bottomLeadingRadius: 4,
                bottomTrailingRadius: AppTheme.Radius.md,
                topTrailingRadius: AppTheme.Radius.md
            ))

            Spacer(minLength: 60)
        }
        .accessibilityLabel("AI skriver…")
        .onAppear { phase = 1 }
    }
}

// MARK: - Input bar

private struct InputBar: View {
    @Bindable var vm: ChatViewModel

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            TextField("Skriv ett meddelande…", text: $vm.inputText, axis: .vertical)
                .lineLimit(1...5)
                .padding(.horizontal, AppTheme.Spacing.sm)
                .padding(.vertical, 10)
                .background(.quaternary, in: .rect(cornerRadius: AppTheme.Radius.md))
                .submitLabel(.send)
                .onSubmit { vm.send() }
                .disabled(vm.isStreaming)

            Button {
                if vm.isStreaming { vm.cancelStream() }
                else { vm.send() }
            } label: {
                Image(systemName: vm.isStreaming ? "stop.circle.fill" : "arrow.up.circle.fill")
                    .font(.title2)
                    .foregroundStyle(vm.inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !vm.isStreaming
                                     ? AnyShapeStyle(.tertiary)
                                     : AnyShapeStyle(AppTheme.Color.brand.gradient))
            }
            .buttonStyle(.plain)
            .disabled(vm.inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !vm.isStreaming)
            .accessibilityLabel(vm.isStreaming ? "Avbryt" : "Skicka")
        }
        .padding(.horizontal, AppTheme.Spacing.md)
        .padding(.vertical, AppTheme.Spacing.sm)
        .background(.bar)
    }
}
