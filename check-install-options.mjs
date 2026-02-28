#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildWorkspaceSkillStatus } from './dist/agents/skills-status.js';
import { loadConfig } from './dist/config/config.js';
import { resolveAgentWorkspaceDir, resolveDefaultAgentId } from './dist/agents/agent-scope.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    // Load configuration
    const config = loadConfig();
    
    // Get default workspace directory
    const agentId = resolveDefaultAgentId(config);
    const workspaceDir = resolveAgentWorkspaceDir(config, agentId);
    
    // Get all skills status
    const skillStatusReport = buildWorkspaceSkillStatus(workspaceDir, { config });
    
    // Filter skills that have install options and are not already eligible
    const installableSkills = skillStatusReport.skills.filter(
      (skill) => !skill.eligible && skill.install.length > 0
    );
    
    console.log('🎯 Skills with Install Options');
    console.log('============================');
    console.log(`Total Installable Skills: ${installableSkills.length}`);
    console.log('');
    
    if (installableSkills.length === 0) {
      console.log('✅ All skills are already installed or have no install options');
      return;
    }
    
    // Group by install kind
    const installKinds = {};
    installableSkills.forEach(skill => {
      skill.install.forEach(installOption => {
        if (!installKinds[installOption.kind]) {
          installKinds[installOption.kind] = [];
        }
        installKinds[installOption.kind].push({
          skill: skill.name,
          emoji: skill.emoji,
          option: installOption
        });
      });
    });
    
    Object.entries(installKinds).forEach(([kind, skills]) => {
      console.log(`🔧 ${kind.toUpperCase()} Installable Skills (${skills.length}):`);
      skills.forEach(item => {
        console.log(`  ${item.emoji || '📦'} ${item.skill}: ${item.option.label}`);
      });
      console.log('');
    });
    
    // Show detailed install info for each skill
    console.log('📋 Detailed Install Information');
    console.log('==============================');
    installableSkills.forEach(skill => {
      console.log(`${skill.emoji || '📦'} ${skill.name}:`);
      skill.install.forEach(installOption => {
        console.log(`  - ${installOption.kind}: ${installOption.label}`);
        if (installOption.bins && installOption.bins.length > 0) {
          console.log(`    Bins: ${installOption.bins.join(', ')}`);
        }
      });
      console.log('');
    });
    
    // Summary of bins that would be installed
    const allBins = new Set();
    installableSkills.forEach(skill => {
      skill.install.forEach(installOption => {
        if (installOption.bins) {
          installOption.bins.forEach(bin => allBins.add(bin));
        }
      });
    });
    
    console.log('🗑️  Total Unique Bins to Install:', allBins.size);
    console.log('   Bins:', Array.from(allBins).join(', '));
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
