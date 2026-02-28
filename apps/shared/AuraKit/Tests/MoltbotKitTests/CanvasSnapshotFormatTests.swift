import aura_intelligenceKit
import Foundation
import Testing

@Suite struct CanvasSnapshotFormatTests {
    @Test func acceptsJpgAlias() throws {
        struct Wrapper: Codable {
            var format: aura_intelligenceCanvasSnapshotFormat
        }

        let data = try #require("{\"format\":\"jpg\"}".data(using: .utf8))
        let decoded = try JSONDecoder().decode(Wrapper.self, from: data)
        #expect(decoded.format == .jpeg)
    }
}
