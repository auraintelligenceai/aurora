// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "aura_intelligenceKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "aura_intelligenceProtocol", targets: ["aura_intelligenceProtocol"]),
        .library(name: "aura_intelligenceKit", targets: ["aura_intelligenceKit"]),
        .library(name: "aura_intelligenceChatUI", targets: ["aura_intelligenceChatUI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.0"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "aura_intelligenceProtocol",
            path: "Sources/aura_intelligenceProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "aura_intelligenceKit",
            dependencies: [
                "aura_intelligenceProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit"),
            ],
            path: "Sources/aura_intelligenceKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "aura_intelligenceChatUI",
            dependencies: [
                "aura_intelligenceKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/aura_intelligenceChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "aura_intelligenceKitTests",
            dependencies: ["aura_intelligenceKit", "aura_intelligenceChatUI"],
            path: "Tests/aura_intelligenceKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
