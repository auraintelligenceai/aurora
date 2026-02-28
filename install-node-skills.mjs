#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildWorkspaceSkillStatus } from './dist/agents/skills-status.js';
import { installSkill } from './dist/agents/skills-install.js';
import { loadConfig } from './dist/config/config.js';
import { resolveAgentWorkspaceDir, resolveDefaultAgentId } from './dist/agents/agent-scope.js';
import { runCommandWithTimeout } from './dist/process/exec.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🎯 Starting to install Node.js-based skills...');
  
  try {
    // Load configuration
    const config = loadConfig();
    
    // Get default workspace directory
    const agentId = resolveDefaultAgentId(config);
    const workspaceDir = resolveAgentWorkspaceDir(config, agentId);
    
    console.log(`📁 Using workspace directory: ${workspaceDir}`);
    
    // Get all skills status
    const skillStatusReport = buildWorkspaceSkillStatus(workspaceDir, { config });
    
    console.log(`📊 Found ${skillStatusReport.skills.length} skills`);
    
    // Filter skills that need node installation
    const nodeSkills = skillStatusReport.skills.filter(
      (skill) => !skill.eligible && skill.install.some(inst => inst.kind === 'node')
    );
    
    console.log(`🔧 Found ${nodeSkills.length} Node.js-based skills that need installation`);
    
    if (nodeSkills.length === 0) {
      console.log('✅ All Node.js-based skills are already installed and eligible');
      return;
    }
    
    // Check if npm is available
    try {
      const result = await runCommandWithTimeout(['npm', '--version'], { timeoutMs: 5000 });
      if (result.code !== 0) {
        console.error('❌ npm not available');
        return;
      }
      console.log(`✅ npm version: ${result.stdout.trim()}`);
    } catch (error) {
      console.error('❌ npm not available:', error);
      return;
    }
    
    // Install each node skill
    let successCount = 0;
    let failureCount = 0;
    
    for (const skill of nodeSkills) {
      console.log(`\n🔄 Installing ${skill.emoji || '📦'} ${skill.name}`);
      console.log(`   Description: ${skill.description}`);
      
      try {
        // Find node install option
        const installOption = skill.install.find(inst => inst.kind === 'node');
        if (!installOption) {
          console.log(`   ❌ No node install option found`);
          failureCount++;
          continue;
        }
        
        console.log(`   Using installer: ${installOption.label}`);
        
        // Try to install with npm (the skills install function might default to npm if pnpm isn't available)
        const result = await installSkill({
          workspaceDir,
          skillName: skill.name,
          installId: installOption.id,
          config
        });
        
        if (result.ok) {
          console.log(`   ✅ Success: ${result.message}`);
          successCount++;
        } else {
          console.log(`   ❌ Failed: ${result.message}`);
          if (result.stderr) {
            console.log(`   Error details: ${result.stderr}`);
          }
          failureCount++;
        }
      } catch (error) {
        console.log(`   ❌ Exception: ${error}`);
        failureCount++;
      }
    }
    
    // Summary
    console.log('\n📈 Installation Summary:');
    console.log(`   ✅ Installed successfully: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   📊 Total: ${nodeSkills.length}`);
    
    // Check final status
    const finalStatus = buildWorkspaceSkillStatus(workspaceDir, { config });
    const eligibleSkills = finalStatus.skills.filter((skill) => skill.eligible);
    console.log(`\n✅ ${eligibleSkills.length} skills are now eligible for use`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
