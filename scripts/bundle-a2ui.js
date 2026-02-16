#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HASH_FILE = path.join(ROOT_DIR, 'src', 'canvas-host', 'a2ui', '.bundle.hash');
const OUTPUT_FILE = path.join(ROOT_DIR, 'src', 'canvas-host', 'a2ui', 'a2ui.bundle.js');
const A2UI_RENDERER_DIR = path.join(ROOT_DIR, 'vendor', 'a2ui', 'renderers', 'lit');
const A2UI_APP_DIR = path.join(ROOT_DIR, 'apps', 'shared', 'aura_intelligenceKit', 'Tools', 'CanvasA2UI');

console.log('Checking if A2UI bundle needs to be rebuilt...');

// Check if A2UI sources exist
if (!fs.existsSync(A2UI_RENDERER_DIR) || !fs.existsSync(A2UI_APP_DIR)) {
  console.log('A2UI sources missing; skipping bundle');
  process.exit(0);
}

// Input paths for hash computation
const INPUT_PATHS = [
  path.join(ROOT_DIR, 'package.json'),
  path.join(ROOT_DIR, 'pnpm-lock.yaml'),
  A2UI_RENDERER_DIR,
  A2UI_APP_DIR
];

// Recursively walk directories to find all files
function walk(entryPath) {
  const files = [];
  const st = fs.statSync(entryPath);
  if (st.isDirectory()) {
    const entries = fs.readdirSync(entryPath);
    for (const entry of entries) {
      files.push(...walk(path.join(entryPath, entry)));
    }
  } else {
    files.push(entryPath);
  }
  return files;
}

// Compute SHA-256 hash of all input files
function computeHash() {
  const crypto = require('crypto');
  const files = [];
  
  for (const input of INPUT_PATHS) {
    files.push(...walk(input));
  }

  // Normalize paths and sort
  const normalize = (p) => p.split(path.sep).join('/');
  files.sort((a, b) => normalize(a).localeCompare(normalize(b)));

  const hash = crypto.createHash('sha256');
  for (const filePath of files) {
    const rel = normalize(path.relative(ROOT_DIR, filePath));
    hash.update(rel);
    hash.update('\0');
    hash.update(fs.readFileSync(filePath));
    hash.update('\0');
  }

  return hash.digest('hex');
}

try {
  const current_hash = computeHash();
  
  // Check if we need to rebuild
  if (fs.existsSync(HASH_FILE) && fs.existsSync(OUTPUT_FILE)) {
    const previous_hash = fs.readFileSync(HASH_FILE, 'utf8').trim();
    if (previous_hash === current_hash) {
      console.log('A2UI bundle up to date; skipping');
      process.exit(0);
    }
  }

  console.log('Building A2UI bundle...');
  execSync('pnpm -s exec tsc -p "' + path.join(A2UI_RENDERER_DIR, 'tsconfig.json') + '"', { stdio: 'inherit' });
  execSync('rolldown -c "' + path.join(A2UI_APP_DIR, 'rolldown.config.mjs') + '"', { stdio: 'inherit' });
  
  // Write the new hash
  fs.writeFileSync(HASH_FILE, current_hash);
  console.log('A2UI bundle built successfully');
  process.exit(0);

} catch (error) {
  console.error('Error bundling A2UI:', error.message);
  // If bundling fails, check if we have an existing bundle
  if (fs.existsSync(OUTPUT_FILE)) {
    console.warn('Using existing A2UI bundle (build failed)');
    process.exit(0);
  } else {
    console.error('No existing A2UI bundle found');
    process.exit(1);
  }
}
