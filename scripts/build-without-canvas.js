#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Building TypeScript files...');
try {
  execSync('npx tsc -p tsconfig.json', { stdio: 'inherit' });
} catch (error) {
  console.error('TypeScript compilation failed:', error.message);
  process.exit(1);
}

console.log('Copying hook metadata...');
try {
  execSync('node --import tsx scripts/copy-hook-metadata.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to copy hook metadata:', error.message);
  process.exit(1);
}

console.log('Writing build info...');
try {
  execSync('node --import tsx scripts/write-build-info.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to write build info:', error.message);
  process.exit(1);
}

console.log('Build completed successfully (without Canvas A2UI bundle)');
