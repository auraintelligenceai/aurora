// swift-tools-version: 6.2
// Package manifest for the aura_intelligence macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "aura_intelligence",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "aura_intelligenceIPC", targets: ["aura_intelligenceIPC"]),
        .library(name: "aura_intelligenceDiscovery", targets: ["aura_intelligenceDiscovery"]),
        .executable(name: "aura_intelligence", targets: ["aura_intelligence"]),
        .executable(name: "aura_intelligence-mac", targets: ["aura_intelligenceMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/aura_intelligenceKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "aura_intelligenceIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "aura_intelligenceDiscovery",
            dependencies: [
                .product(name: "aura_intelligenceKit", package: "aura_intelligenceKit"),
            ],
            path: "Sources/aura_intelligenceDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "aura_intelligence",
            dependencies: [
                "aura_intelligenceIPC",
                "aura_intelligenceDiscovery",
                .product(name: "aura_intelligenceKit", package: "aura_intelligenceKit"),
                .product(name: "aura_intelligenceChatUI", package: "aura_intelligenceKit"),
                .product(name: "aura_intelligenceProtocol", package: "aura_intelligenceKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/aura_intelligence.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "aura_intelligenceMacCLI",
            dependencies: [
                "aura_intelligenceDiscovery",
                .product(name: "aura_intelligenceKit", package: "aura_intelligenceKit"),
                .product(name: "aura_intelligenceProtocol", package: "aura_intelligenceKit"),
            ],
            path: "Sources/aura_intelligenceMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "aura_intelligenceIPCTests",
            dependencies: [
                "aura_intelligenceIPC",
                "aura_intelligence",
                "aura_intelligenceDiscovery",
                .product(name: "aura_intelligenceProtocol", package: "aura_intelligenceKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
