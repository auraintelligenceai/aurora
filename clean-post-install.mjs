#!/usr/bin/env node
import fs from 'fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clean the skills status JSON file
function cleanSkillsStatus(filePath) {
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const cleanContent = rawContent.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
  const jsonStart = cleanContent.indexOf('{');
  const jsonEnd = cleanContent.lastIndexOf('}') + 1;
  const jsonContent = cleanContent.slice(jsonStart, jsonEnd);
  return JSON.parse(jsonContent);
}

try {
  const cleaned = cleanSkillsStatus('skills-status-post-install.json');
  fs.writeFileSync('skills-status-post-install-clean.json', JSON.stringify(cleaned, null, 2));
  console.log('✅ Successfully cleaned skills-status-post-install.json');
  
  const eligible = cleaned.skills.filter(skill => skill.eligible);
  const ineligible = cleaned.skills.filter(skill => !skill.eligible);
  
  console.log(`\n🎯 Post-Install Status: ${eligible.length} eligible, ${ineligible.length} ineligible`);
  
} catch (error) {
  console.error('❌ Error:', error);
  if (error instanceof SyntaxError) {
    console.error('\n❓ File content preview:', fs.readFileSync('skills-status-post-install.json', 'utf8').slice(0, 100));
  }
}
