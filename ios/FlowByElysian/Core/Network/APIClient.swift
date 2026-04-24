import Foundation

enum APIError: LocalizedError {
    case invalidURL
    case noData
    case httpError(Int)
    case decodingError(Error)
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Ogiltig URL"
        case .noData: return "Inget svar från servern"
        case .httpError(let code): return "Serverfel: \(code)"
        case .decodingError(let e): return "Tolkningsfel: \(e.localizedDescription)"
        case .networkError(let e): return e.localizedDescription
        }
    }
}

final class APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private let decoder: JSONDecoder

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = Config.Timeouts.request
        config.timeoutIntervalForResource = Config.Timeouts.resource
        self.session = URLSession(configuration: config)

        decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
    }

    func get<T: Decodable>(_ path: String, query: [String: String] = [:]) async throws -> T {
        let url = try buildURL(path: path, query: query)
        var request = URLRequest(url: url)
        applyHeaders(&request)
        return try await perform(request)
    }

    func post<Body: Encodable, Response: Decodable>(_ path: String, body: Body) async throws -> Response {
        let url = try buildURL(path: path)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        applyHeaders(&request)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        request.httpBody = try encoder.encode(body)
        return try await perform(request)
    }

    func patch<Body: Encodable, Response: Decodable>(_ path: String, body: Body) async throws -> Response {
        let url = try buildURL(path: path)
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        applyHeaders(&request)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        request.httpBody = try encoder.encode(body)
        return try await perform(request)
    }

    func postVoid<Body: Encodable>(_ path: String, body: Body) async throws {
        let url = try buildURL(path: path)
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        applyHeaders(&request)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        request.httpBody = try encoder.encode(body)
        let (_, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            let code = (response as? HTTPURLResponse)?.statusCode ?? 0
            throw APIError.httpError(code)
        }
    }

    func patchVoid<Body: Encodable>(_ path: String, body: Body) async throws {
        let url = try buildURL(path: path)
        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        applyHeaders(&request)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        request.httpBody = try encoder.encode(body)
        let (_, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            let code = (response as? HTTPURLResponse)?.statusCode ?? 0
            throw APIError.httpError(code)
        }
    }

    func delete(_ path: String) async throws {
        let url = try buildURL(path: path)
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        applyHeaders(&request)
        let (_, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            let code = (response as? HTTPURLResponse)?.statusCode ?? 0
            throw APIError.httpError(code)
        }
    }

    // MARK: - Private

    private func buildURL(path: String, query: [String: String] = []) throws -> URL {
        guard var components = URLComponents(url: Config.baseURL.appendingPathComponent(path), resolvingAgainstBaseURL: true) else {
            throw APIError.invalidURL
        }
        if !query.isEmpty {
            components.queryItems = query.map { URLQueryItem(name: $0.key, value: $0.value) }
        }
        guard let url = components.url else { throw APIError.invalidURL }
        return url
    }

    private func applyHeaders(_ request: inout URLRequest) {
        // Demo-auth: speglar web-appens demo-läge
        // Byt mot riktig Clerk JWT-token när auth är konfigurerat
        request.setValue(Config.demoUserID, forHTTPHeaderField: "X-Demo-User-ID")
    }

    private func perform<T: Decodable>(_ request: URLRequest) async throws -> T {
        do {
            let (data, response) = try await session.data(for: request)
            guard let http = response as? HTTPURLResponse else { throw APIError.noData }
            guard (200...299).contains(http.statusCode) else { throw APIError.httpError(http.statusCode) }
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw APIError.decodingError(error)
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }
}
