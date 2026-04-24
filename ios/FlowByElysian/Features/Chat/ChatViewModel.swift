import SwiftUI

struct ChatMessage: Identifiable, Equatable {
    let id = UUID()
    let role: Role
    var content: String
    let timestamp: Date = .now

    enum Role { case user, assistant }
}

@Observable @MainActor
final class ChatViewModel {
    private(set) var messages: [ChatMessage] = []
    private(set) var isStreaming = false
    var inputText = ""
    var errorMessage: String?

    private let api = APIClient.shared

    // Suggested prompts shown before first message
    let suggestedPrompts = [
        "Förklara RERA-reglerna för off-plan",
        "Vad är mäklarprovisionen i Dubai?",
        "Hur fungerar Ejari-registrering?",
        "Freehold vs leasehold – skillnaden?",
    ]

    func send() async {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, !isStreaming else { return }

        messages.append(ChatMessage(role: .user, content: text))
        inputText = ""
        errorMessage = nil

        // Add assistant placeholder for streaming
        let assistantMsg = ChatMessage(role: .assistant, content: "")
        messages.append(assistantMsg)
        let assistantIndex = messages.count - 1

        isStreaming = true
        defer { isStreaming = false }

        do {
            try await streamResponse(into: assistantIndex)
        } catch {
            messages[assistantIndex].content = "Fel: \(error.localizedDescription)"
            errorMessage = error.localizedDescription
        }
    }

    func sendSuggested(_ prompt: String) {
        inputText = prompt
        Task { await send() }
    }

    func clearMessages() {
        messages = []
        errorMessage = nil
    }

    // MARK: - Streaming

    // The web /api/chat uses AI SDK streamText which produces a data-stream:
    // Each line: `0:"token"` for text chunks, `e:{...}` for finish, `d:{...}` for usage.
    private func streamResponse(into index: Int) async throws {
        let url = Config.baseURL.appendingPathComponent(Endpoint.chat)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(Config.demoUserID, forHTTPHeaderField: "X-Demo-User-ID")
        request.timeoutInterval = 60

        let history = messages.dropLast(2).map {
            ["role": $0.role == .user ? "user" : "assistant", "content": $0.content]
        }
        struct Body: Encodable {
            let messages: [[String: String]]
        }
        request.httpBody = try JSONEncoder().encode(Body(messages: history + [
            ["role": "user", "content": messages[index - 1].content]
        ]))

        let (stream, response) = try await URLSession.shared.bytes(for: request)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            let code = (response as? HTTPURLResponse)?.statusCode ?? 0
            throw APIError.httpError(code)
        }

        var accumulated = ""
        for try await line in stream.lines {
            guard line.hasPrefix("0:") else { continue }
            // Strip prefix and JSON-string quotes: 0:"token"
            let raw = line.dropFirst(2)
            if let data = raw.data(using: .utf8),
               let decoded = try? JSONDecoder().decode(String.self, from: data) {
                accumulated += decoded
                messages[index].content = accumulated
            }
        }

        // Fallback: if stream produced nothing, show a placeholder
        if messages[index].content.isEmpty {
            messages[index].content = "Inget svar mottogs. Kontrollera API-anslutningen."
        }
    }
}
