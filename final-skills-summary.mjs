#!/usr/bin/env node
import fs from 'fs';

const preInstall = JSON.parse(fs.readFileSync('skills-status-clean.json', 'utf8'));
const postInstall = JSON.parse(fs.readFileSync('skills-status-post-install-clean.json', 'utf8'));

console.log('🎯 Final Skills Status Summary');
console.log('=============================');
console.log(`Total Skills: ${preInstall.skills.length}`);
console.log(`Eligible Skills: ${postInstall.skills.filter(skill => skill.eligible).length}`);
console.log(`Ineligible Skills: ${postInstall.skills.filter(skill => !skill.eligible).length}`);
console.log('');

const preEligibleNames = new Set(preInstall.skills.filter(skill => skill.eligible).map(skill => skill.name));
const postEligibleNames = new Set(postInstall.skills.filter(skill => skill.eligible).map(skill => skill.name));

const newlyEligible = Array.from(postEligibleNames).filter(name => !preEligibleNames.has(name));
const lostEligibility = Array.from(preEligibleNames).filter(name => !postEligibleNames.has(name));

if (newlyEligible.length > 0) {
  console.log('✨ Newly Eligible Skills:');
  newlyEligible.forEach(name => {
    const skill = postInstall.skills.find(s => s.name === name);
    console.log(`  ${skill.emoji || '📦'} ${name}`);
  });
  console.log('');
}

if (lostEligibility.length > 0) {
  console.log('⚠️  Lost Eligibility:');
  lostEligibility.forEach(name => {
    const skill = postInstall.skills.find(s => s.name === name);
    console.log(`  ${skill.emoji || '📦'} ${name}`);
  });
  console.log('');
}

console.log('🔍 Failed Install Attempts (Windows):');
console.log('====================================');

// Windows incompatible skills (macOS-only)
const macOSOnly = postInstall.skills.filter(skill => 
  !skill.eligible && 
  (skill.missing.os?.length || 0) > 0 && 
  (skill.install?.length || 0) > 0
);
if (macOSOnly.length > 0) {
  console.log('  🖥️  macOS-only Skills (not compatible with Windows):');
  macOSOnly.forEach(skill => {
    console.log(`    ${skill.emoji || '📦'} ${skill.name}`);
  });
  console.log('');
}

// Skills that need brew but it's not installed
const needsBrew = postInstall.skills.filter(skill => 
  !skill.eligible && 
  (skill.install || []).some(inst => inst.kind === 'brew') && 
  (skill.missing.os?.length || 0) === 0
);
if (needsBrew.length > 0) {
  console.log('  🍺 Needs Homebrew (brew not installed on Windows):');
  needsBrew.forEach(skill => {
    console.log(`    ${skill.emoji || '📦'} ${skill.name}`);
  });
  console.log('');
}

// Skills that need node packages but pnpm not available
const needsNode = postInstall.skills.filter(skill => 
  !skill.eligible && 
  (skill.install || []).some(inst => inst.kind === 'node') && 
  (skill.missing.os?.length || 0) === 0
);
if (needsNode.length > 0) {
  console.log('  📦 Needs Node Package Manager (npm available, but may need pnpm):');
  needsNode.forEach(skill => {
    console.log(`    ${skill.emoji || '📦'} ${skill.name}`);
  });
  console.log('');
}

// Skills with other installation issues
const otherIssues = postInstall.skills.filter(skill => 
  !skill.eligible && 
  (skill.missing.os?.length || 0) === 0 && 
  (skill.install?.length || 0) > 0 && 
  !needsBrew.includes(skill) && 
  !needsNode.includes(skill)
);
if (otherIssues.length > 0) {
  console.log('  🚫 Other Installation Issues:');
  otherIssues.forEach(skill => {
    console.log(`    ${skill.emoji || '📦'} ${skill.name}`);
  });
  console.log('');
}

// Skills with no install options
const noInstallOptions = postInstall.skills.filter(skill => 
  !skill.eligible && 
  (skill.missing.os?.length || 0) === 0 && 
  (skill.install?.length || 0) === 0
);
if (noInstallOptions.length > 0) {
  console.log('  ❓ No Install Options Available:');
  noInstallOptions.forEach(skill => {
    console.log(`    ${skill.emoji || '📦'} ${skill.name}`);
  });
}
