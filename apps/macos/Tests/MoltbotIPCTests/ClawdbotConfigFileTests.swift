import Foundation
import Testing
@testable import aura_intelligence

@Suite(.serialized)
struct aura_intelligenceConfigFileTests {
    @Test
    func configPathRespectsEnvOverride() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("aura_intelligence-config-\(UUID().uuidString)")
            .appendingPathComponent("aura_intelligence.json")
            .path

        await TestIsolation.withEnvValues(["CLAWDBOT_CONFIG_PATH": override]) {
            #expect(aura_intelligenceConfigFile.url().path == override)
        }
    }

    @MainActor
    @Test
    func remoteGatewayPortParsesAndMatchesHost() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("aura_intelligence-config-\(UUID().uuidString)")
            .appendingPathComponent("aura_intelligence.json")
            .path

        await TestIsolation.withEnvValues(["CLAWDBOT_CONFIG_PATH": override]) {
            aura_intelligenceConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "ws://gateway.ts.net:19999",
                    ],
                ],
            ])
            #expect(aura_intelligenceConfigFile.remoteGatewayPort() == 19999)
            #expect(aura_intelligenceConfigFile.remoteGatewayPort(matchingHost: "gateway.ts.net") == 19999)
            #expect(aura_intelligenceConfigFile.remoteGatewayPort(matchingHost: "gateway") == 19999)
            #expect(aura_intelligenceConfigFile.remoteGatewayPort(matchingHost: "other.ts.net") == nil)
        }
    }

    @MainActor
    @Test
    func setRemoteGatewayUrlPreservesScheme() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("aura_intelligence-config-\(UUID().uuidString)")
            .appendingPathComponent("aura_intelligence.json")
            .path

        await TestIsolation.withEnvValues(["CLAWDBOT_CONFIG_PATH": override]) {
            aura_intelligenceConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "wss://old-host:111",
                    ],
                ],
            ])
            aura_intelligenceConfigFile.setRemoteGatewayUrl(host: "new-host", port: 2222)
            let root = aura_intelligenceConfigFile.loadDict()
            let url = ((root["gateway"] as? [String: Any])?["remote"] as? [String: Any])?["url"] as? String
            #expect(url == "wss://new-host:2222")
        }
    }

    @Test
    func stateDirOverrideSetsConfigPath() async {
        let dir = FileManager().temporaryDirectory
            .appendingPathComponent("aura_intelligence-state-\(UUID().uuidString)", isDirectory: true)
            .path

        await TestIsolation.withEnvValues([
            "CLAWDBOT_CONFIG_PATH": nil,
            "CLAWDBOT_STATE_DIR": dir,
        ]) {
            #expect(aura_intelligenceConfigFile.stateDirURL().path == dir)
            #expect(aura_intelligenceConfigFile.url().path == "\(dir)/aura_intelligence.json")
        }
    }
}
