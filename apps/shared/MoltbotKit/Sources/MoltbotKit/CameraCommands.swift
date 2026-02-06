import Foundation

public enum aura_intelligenceCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum aura_intelligenceCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum aura_intelligenceCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum aura_intelligenceCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct aura_intelligenceCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: aura_intelligenceCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: aura_intelligenceCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: aura_intelligenceCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: aura_intelligenceCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct aura_intelligenceCameraClipParams: Codable, Sendable, Equatable {
    public var facing: aura_intelligenceCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: aura_intelligenceCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: aura_intelligenceCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: aura_intelligenceCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
