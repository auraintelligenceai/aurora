#!/usr/bin/env node
import fs from 'fs';

// Read the raw file
const rawContent = fs.readFileSync('skills-status.json', 'utf8');

// Remove ANSI escape codes
const cleanContent = rawContent.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');

// Find the start of JSON (after doctor warnings)
const jsonStart = cleanContent.indexOf('{');
const jsonEnd = cleanContent.lastIndexOf('}') + 1;
const jsonContent = cleanContent.slice(jsonStart, jsonEnd);

// Parse and reformat JSON
try {
    const parsed = JSON.parse(jsonContent);
    const formatted = JSON.stringify(parsed, null, 2);
    fs.writeFileSync('skills-status-clean.json', formatted);
    console.log('Successfully cleaned skills-status.json');
    
    // Display summary
    console.log(`\nTotal Skills: ${parsed.skills.length}`);
    const eligible = parsed.skills.filter(skill => skill.eligible);
    console.log(`Eligible Skills: ${eligible.length}`);
    const ineligible = parsed.skills.filter(skill => !skill.eligible);
    console.log(`Ineligible Skills: ${ineligible.length}`);
    
    console.log('\n✅ Eligible Skills:');
    eligible.forEach(skill => {
        console.log(`  ${skill.emoji || '📦'} ${skill.name}`);
    });
    
} catch (error) {
    console.error('Error parsing JSON:', error);
    console.error('Cleaned content preview:', jsonContent.slice(0, 200));
}
