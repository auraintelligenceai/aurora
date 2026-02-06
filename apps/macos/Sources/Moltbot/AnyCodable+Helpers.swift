import aura_intelligenceKit
import aura_intelligenceProtocol
import Foundation

// Prefer the aura_intelligenceKit wrapper to keep gateway request payloads consistent.
typealias AnyCodable = aura_intelligenceKit.AnyCodable
typealias InstanceIdentity = aura_intelligenceKit.InstanceIdentity

extension AnyCodable {
    var stringValue: String? { self.value as? String }
    var boolValue: Bool? { self.value as? Bool }
    var intValue: Int? { self.value as? Int }
    var doubleValue: Double? { self.value as? Double }
    var dictionaryValue: [String: AnyCodable]? { self.value as? [String: AnyCodable] }
    var arrayValue: [AnyCodable]? { self.value as? [AnyCodable] }

    var foundationValue: Any {
        switch self.value {
        case let dict as [String: AnyCodable]:
            dict.mapValues { $0.foundationValue }
        case let array as [AnyCodable]:
            array.map(\.foundationValue)
        default:
            self.value
        }
    }
}

extension aura_intelligenceProtocol.AnyCodable {
    var stringValue: String? { self.value as? String }
    var boolValue: Bool? { self.value as? Bool }
    var intValue: Int? { self.value as? Int }
    var doubleValue: Double? { self.value as? Double }
    var dictionaryValue: [String: aura_intelligenceProtocol.AnyCodable]? { self.value as? [String: aura_intelligenceProtocol.AnyCodable] }
    var arrayValue: [aura_intelligenceProtocol.AnyCodable]? { self.value as? [aura_intelligenceProtocol.AnyCodable] }

    var foundationValue: Any {
        switch self.value {
        case let dict as [String: aura_intelligenceProtocol.AnyCodable]:
            dict.mapValues { $0.foundationValue }
        case let array as [aura_intelligenceProtocol.AnyCodable]:
            array.map(\.foundationValue)
        default:
            self.value
        }
    }
}
