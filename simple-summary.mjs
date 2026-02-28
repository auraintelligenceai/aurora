#!/usr/bin/env node
import fs from 'fs';

console.log('🎯 Skills Status Summary');
console.log('========================');
console.log(`Total Skills: 67`);
console.log(`Eligible Skills: 20`);
console.log(`Ineligible Skills: 47`);
console.log('');

console.log('✅ Eligible Skills:');
const eligible = [
  "bluebubbles",
  "adversarial-red-team",
  "byzantine-fault-tolerant-consensus",
  "cognitive-mode-controller",
  "stigmergic-swarm-coordination",
  "ethical-governor",
  "value-learning-and-alignment",
  "edge-mode-adaptation",
  "gpu-self-healing",
  "ptp-clock-sync",
  "self-healing-modules",
  "integrated-information-theory",
  "intrinsic-goal-generation",
  "recursive-self-improvement",
  "unified-memory-system",
  "world-model-engine",
  "homomorphic-encryption",
  "worm-audit-archive",
  "skill-creator",
  "formal-verification"
];

eligible.forEach(name => {
  console.log(`  📦 ${name}`);
});
console.log('');

console.log('🔍 Ineligible Skills Breakdown (Windows):');
console.log('========================================');
console.log('  🖥️  macOS-only Skills (8):');
const macOnly = [
  "apple-notes",
  "apple-reminders", 
  "bear-notes",
  "imsg",
  "model-usage",
  "peekaboo",
  "things-mac",
  "tmux"
];
macOnly.forEach(name => {
  console.log(`    📦 ${name}`);
});

console.log('');
console.log('  🍺 Needs Homebrew (25):');
const needsBrew = [
  "1password",
  "apple-notes",
  "apple-reminders",
  "camsnap", 
  "gemini",
  "gifgrep",
  "github",
  "gog",
  "goplaces",
  "himalaya",
  "imsg",
  "model-usage",
  "nano-banana-pro",
  "obsidian",
  "openai-image-gen",
  "openai-whisper",
  "openhue",
  "ordercli",
  "peekaboo",
  "sag",
  "songsee",
  "spotify-player",
  "summarize",
  "video-frames",
  "wacli"
];
needsBrew.forEach(name => {
  console.log(`    📦 ${name}`);
});

console.log('');
console.log('  📦 Needs Node Package Manager (4):');
const needsNode = [
  "bird",
  "clawdhub",
  "mcporter",
  "oracle"
];
needsNode.forEach(name => {
  console.log(`    📦 ${name}`);
});

console.log('');
console.log('  🐹 Needs Go (6):');
const needsGo = [
  "bear-notes",
  "blogwatcher",
  "blucli",
  "eightctl",
  "sonoscli",
  "things-mac"
];
needsGo.forEach(name => {
  console.log(`    📦 ${name}`);
});

console.log('');
console.log('  🐍 Needs UV (Python) (1):');
console.log('    📦 nano-pdf');

console.log('');
console.log('  📥 Needs Download (1):');
console.log('    📦 sherpa-onnx-tts');

console.log('');
console.log('  ❓ Other Issues (2):');
console.log('    📦 slack (missing config)');
console.log('    📦 voice-call (missing config)');

console.log('');
console.log('🚨 Key Issues:');
console.log('=============');
console.log('1. brew not installed (required for 25 skills)');
console.log('2. pnpm not available (required for 4 skills)');
console.log('3. 8 skills are macOS-only and won\'t work on Windows');
console.log('4. Some skills need environment variables or config');
