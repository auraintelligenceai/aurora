#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildWorkspaceSkillStatus } from './dist/agents/skills-status.js';
import { installSkill } from './dist/agents/skills-install.js';
import { loadConfig } from './dist/config/config.js';
import { resolveAgentWorkspaceDir, resolveDefaultAgentId } from './dist/agents/agent-scope.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🎯 Starting to install Windows-compatible skills...');
  
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
    
    // Filter skills that:
    // 1. Are not eligible
    // 2. Have install options
    // 3. Are compatible with Windows (not macOS-only)
    const installableSkills = skillStatusReport.skills.filter(
      (skill) => !skill.eligible && skill.install.length > 0 && skill.missing.os.length === 0
    );
    
    console.log(`🔧 Found ${installableSkills.length} Windows-compatible skills that need installation`);
    
    if (installableSkills.length === 0) {
      console.log('✅ All Windows-compatible skills are already installed and eligible');
      return;
    }
    
    // Install each skill
    let successCount = 0;
    let failureCount = 0;
    
    for (const skill of installableSkills) {
      console.log(`\n🔄 Installing ${skill.emoji || '📦'} ${skill.name}`);
      console.log(`   Description: ${skill.description}`);
      
      try {
        // Use the first available install option
        const installOption = skill.install[0];
        console.log(`   Using installer: ${installOption.label}`);
        
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
    console.log(`   📊 Total: ${installableSkills.length}`);
    
    // Check final status
    const finalStatus = buildWorkspaceSkillStatus(workspaceDir, { config });
    const eligibleSkills = finalStatus.skills.filter((skill) => skill.eligible);
    console.log(`\n✅ ${eligibleSkills.length} skills are now eligible for use`);
    
    const stillMissing = finalStatus.skills.filter(
      (skill) => !skill.eligible && !skill.disabled && !skill.blockedByAllowlist && skill.missing.os.length === 0
    );
    
    if (stillMissing.length > 0) {
      console.log(`\n⚠️  ${stillMissing.length} Windows-compatible skills still need requirements:`);
      stillMissing.forEach((skill) => {
        const missing = [];
        if (skill.missing.bins.length > 0) missing.push(`bins: ${skill.missing.bins.join(', ')}`);
        if (skill.missing.env.length > 0) missing.push(`env: ${skill.missing.env.join(', ')}`);
        if (skill.missing.config.length > 0) missing.push(`config: ${skill.missing.config.join(', ')}`);
        
        console.log(`   ${skill.emoji || '📦'} ${skill.name}: ${missing.join('; ')}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
