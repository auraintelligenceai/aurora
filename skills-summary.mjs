#!/usr/bin/env node
import fs from 'fs';

const parsed = JSON.parse(fs.readFileSync('skills-status-clean.json', 'utf8'));

const eligible = parsed.skills.filter(skill => skill.eligible);
const ineligible = parsed.skills.filter(skill => !skill.eligible);

console.log('🎯 Skills Status Summary');
console.log('========================');
console.log(`Total Skills: ${parsed.skills.length}`);
console.log(`Eligible Skills: ${eligible.length}`);
console.log(`Ineligible Skills: ${ineligible.length}`);
console.log('');

console.log('✅ Eligible Skills:');
eligible.forEach(skill => {
    console.log(`  ${skill.emoji || '📦'} ${skill.name}`);
});
console.log('');

console.log('❌ Ineligible Skills by Category:');
const categories = {
    missingBins: [],
    missingEnv: [],
    missingConfig: [],
    osRestricted: []
};

ineligible.forEach(skill => {
    if (skill.missing.bins.length > 0) categories.missingBins.push(skill);
    if (skill.missing.env.length > 0) categories.missingEnv.push(skill);
    if (skill.missing.config.length > 0) categories.missingConfig.push(skill);
    if (skill.missing.os.length > 0) categories.osRestricted.push(skill);
});

console.log(`  📦 Missing Bins (${categories.missingBins.length}):`);
categories.missingBins.forEach(skill => {
    console.log(`    ${skill.emoji || '📦'} ${skill.name}: ${skill.missing.bins.join(', ')}`);
});

console.log(`\n  🔑 Missing Env Variables (${categories.missingEnv.length}):`);
categories.missingEnv.forEach(skill => {
    console.log(`    ${skill.emoji || '📦'} ${skill.name}: ${skill.missing.env.join(', ')}`);
});

console.log(`\n  ⚙️ Missing Config (${categories.missingConfig.length}):`);
categories.missingConfig.forEach(skill => {
    console.log(`    ${skill.emoji || '📦'} ${skill.name}: ${skill.missing.config.join(', ')}`);
});

console.log(`\n  🖥️ OS Restricted (${categories.osRestricted.length}):`);
categories.osRestricted.forEach(skill => {
    console.log(`    ${skill.emoji || '📦'} ${skill.name}: ${skill.missing.os.join(', ')}`);
});

// Detailed view of why some skills are ineligible (for troubleshooting)
const hasMultipleIssues = ineligible.filter(skill => 
    (skill.missing.bins.length > 0) + 
    (skill.missing.env.length > 0) + 
    (skill.missing.config.length > 0) + 
    (skill.missing.os.length > 0) > 1
);

if (hasMultipleIssues.length > 0) {
    console.log(`\n⚠️  Skills with Multiple Issues (${hasMultipleIssues.length}):`);
    hasMultipleIssues.forEach(skill => {
        const issues = [];
        if (skill.missing.bins.length > 0) issues.push('bins');
        if (skill.missing.env.length > 0) issues.push('env');
        if (skill.missing.config.length > 0) issues.push('config');
        if (skill.missing.os.length > 0) issues.push('os');
        console.log(`    ${skill.emoji || '📦'} ${skill.name}: ${issues.join(', ')}`);
    });
}
