import Foundation

public enum aura_intelligenceChatTransportEvent: Sendable {
    case health(ok: Bool)
    case tick
    case chat(aura_intelligenceChatEventPayload)
    case agent(aura_intelligenceAgentEventPayload)
    case seqGap
}

public protocol aura_intelligenceChatTransport: Sendable {
    func requestHistory(sessionKey: String) async throws -> aura_intelligenceChatHistoryPayload
    func sendMessage(
        sessionKey: String,
        message: String,
        thinking: String,
        idempotencyKey: String,
        attachments: [aura_intelligenceChatAttachmentPayload]) async throws -> aura_intelligenceChatSendResponse

    func abortRun(sessionKey: String, runId: String) async throws
    func listSessions(limit: Int?) async throws -> aura_intelligenceChatSessionsListResponse

    func requestHealth(timeoutMs: Int) async throws -> Bool
    func events() -> AsyncStream<aura_intelligenceChatTransportEvent>

    func setActiveSessionKey(_ sessionKey: String) async throws
}

extension aura_intelligenceChatTransport {
    public func setActiveSessionKey(_: String) async throws {}

    public func abortRun(sessionKey _: String, runId _: String) async throws {
        throw NSError(
            domain: "aura_intelligenceChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "chat.abort not supported by this transport"])
    }

    public func listSessions(limit _: Int?) async throws -> aura_intelligenceChatSessionsListResponse {
        throw NSError(
            domain: "aura_intelligenceChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "sessions.list not supported by this transport"])
    }
}
