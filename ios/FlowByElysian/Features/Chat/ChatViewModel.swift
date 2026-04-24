import Foundation

@MainActor
final class ChatViewModel: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var inputText = ""
    @Published var isLoading = false

    private let api = APIClient.shared

    struct ChatMessage: Identifiable {
        let id = UUID()
        let role: String  // "user" | "assistant"
        let content: String
        var timestamp = Date()
    }

    func send() async {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }

        messages.append(ChatMessage(role: "user", content: text))
        inputText = ""
        isLoading = true
        defer { isLoading = false }

        struct Payload: Encodable {
            let message: String
            let history: [[String: String]]
        }
        struct Response: Decodable {
            let response: String?
            let message: String?
        }

        let history = messages.dropLast().map { ["role": $0.role, "content": $0.content] }
        do {
            let resp: Response = try await api.post(Endpoint.chat, body: Payload(message: text, history: history))
            let reply = resp.response ?? resp.message ?? "Inget svar"
            messages.append(ChatMessage(role: "assistant", content: reply))
        } catch {
            messages.append(ChatMessage(role: "assistant", content: "Fel: \(error.localizedDescription)"))
        }
    }
}
