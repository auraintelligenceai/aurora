#!/usr/bin/env node
import fs from 'fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawContent = fs.readFileSync(path.join(__dirname, 'skills-status-post-install.json'), 'utf8');
const cleanContent = rawContent.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
const jsonStart = cleanContent.indexOf('{');
const jsonEnd = cleanContent.lastIndexOf('}') + 1;
const jsonContent = cleanContent.slice(jsonStart, jsonEnd);
const parsed = JSON.parse(jsonContent);

const eligible = parsed.skills.filter(skill => skill.eligible);
const ineligible = parsed.skills.filter(skill => !skill.eligible);

console.log('🎯 Post-Install Skills Status');
console.log('===========================');
console.log(`Total Skills: ${parsed.skills.length}`);
console.log(`Eligible Skills: ${eligible.length}`);
console.log(`Ineligible Skills: ${ineligible.length}`);
console.log('');

console.log('✅ Eligible Skills:');
eligible.forEach(skill => {
    console.log(`  ${skill.emoji || '📦'} ${skill.name}`);
});
