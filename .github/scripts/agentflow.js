#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    case 'version':
    case '--version':
    case '-v':
      showVersion();
      break;
    case 'init':
      handleInit(args.slice(1));
      break;
    case 'validate':
      validateProject(args.slice(1)[0]);
      break;
    case 'docs-refresh':
      handleDocsRefresh();
      break;
    case 'portal':
    case 'open-portal':
      handleOpenPortal();
      break;
    case 'update':
      handleUpdate(args.slice(1));
      break;
    case 'skills':
      handleSkills(args.slice(1));
      break;
    default:
      if (!command) {
        showHelp();
      } else {
        console.error(`未知命令: ${command}`);
        showHelp();
        process.exit(1);
      }
  }
}

function validateProject(dir = '.') {
  const projectRoot = path.resolve(process.cwd(), dir);
  const githubDir = path.join(projectRoot, '.github');
  
  console.log(`🔍 正在验证 AgentFlow 项目结构 (${projectRoot})...`);

  let allValid = true;

  // 1. 检查 .github 目录
  if (!fs.existsSync(githubDir)) {
    console.log('❌ 未找到 .github 目录，这可能不是一个有效的 AgentFlow 项目');
    process.exit(1);
  }
  console.log('✅ .github 目录已存在');

  // 2. 检查 .github/agents (count 5)
  const agentsDir = path.join(githubDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    const agents = fs.readdirSync(agentsDir).filter(f => f.endsWith('.agent.md'));
    if (agents.length === 5) {
      console.log(`✅ .github/agents 目录完整 (共 ${agents.length} 个 Agent)`);
    } else {
      console.log(`❌ .github/agents 目录不完整 (预期 5 个，实际发现 ${agents.length} 个)`);
      allValid = false;
    }
  } else {
    console.log('❌ 未找到 .github/agents 目录');
    allValid = false;
  }

  // 3. 检查 .github/prompts (count 7)
  const promptsDir = path.join(githubDir, 'prompts');
  if (fs.existsSync(promptsDir)) {
    const prompts = fs.readdirSync(promptsDir).filter(f => f.endsWith('.prompt.md'));
    if (prompts.length === 7) {
      console.log(`✅ .github/prompts 目录完整 (共 ${prompts.length} 个 Prompt)`);
    } else {
      console.log(`❌ .github/prompts 目录不完整 (预期 7 个，实际发现 ${prompts.length} 个)`);
      allValid = false;
    }
  } else {
    console.log('❌ 未找到 .github/prompts 目录');
    allValid = false;
  }

  // 4. 检查 .github/agentflow.yml
  const configPath = path.join(githubDir, 'agentflow.yml');
  if (fs.existsSync(configPath)) {
    console.log('✅ .github/agentflow.yml 配置文件已存在');
  } else {
    console.log('❌ 未找到 .github/agentflow.yml 配置文件');
    allValid = false;
  }

  if (allValid) {
    console.log('\n✨ 项目验证通过！这是一个有效的 AgentFlow 项目。');
  } else {
    console.log('\n⚠️ 项目验证失败，请检查上述错误。');
    process.exit(1);
  }
}

function handleInit(args) {
  const force = args.includes('--force') || args.includes('-f');
  const isUpdate = args.includes('--update') || args.includes('-u');
  const targetDir = args.find(arg => !arg.startsWith('-')) || '.';
  const targetPath = path.resolve(process.cwd(), targetDir);
  const templatePath = path.resolve(__dirname, '../../template');

  if (fs.existsSync(targetPath)) {
    if (!force && !isUpdate) {
      if (targetDir !== '.') {
        console.error(`❌ 错误: 目标目录 '${targetDir}' 已存在。请使用 --force 覆盖。`);
        process.exit(1);
      }
      const hasGithub = fs.existsSync(path.join(targetPath, '.github'));
      const hasVscode = fs.existsSync(path.join(targetPath, '.vscode'));
      if (hasGithub || hasVscode) {
        console.error('❌ 错误: 当前目录已包含 AgentFlow 配置 (.github 或 .vscode)。请使用 --force 覆盖或 --update 更新。');
        process.exit(1);
      }
    } else {
      const projectMemoryPath = path.join(targetPath, '.github', 'project-memory.md');
      const agentflowYmlPath = path.join(targetPath, '.github', 'agentflow.yml');
      const docsPath = path.join(targetPath, '.github', 'docs');

      if (isUpdate) {
        console.log('🔄 正在更新 AgentFlow 模板...');
      } else {
        if (fs.existsSync(projectMemoryPath)) {
          const backupPath = projectMemoryPath + '.bak';
          fs.copyFileSync(projectMemoryPath, backupPath);
          console.log(`📦 已备份 project-memory.md 到 ${backupPath}`);
        }

        if (fs.existsSync(docsPath)) {
          const backupDocsPath = docsPath + '_backup';
          fs.cpSync(docsPath, backupDocsPath, { recursive: true });
          console.log(`📦 已备份 docs 目录 到 ${backupDocsPath}`);
        }
      }
    }
  } else {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  console.log(`🚀 正在${isUpdate ? '更新' : '初始化'} AgentFlow 到 ${targetPath}...`);
  try {
    if (!fs.existsSync(templatePath)) {
        console.error(`❌ 错误: 模板目录不存在: ${templatePath}`);
        process.exit(1);
    }
    
    const copyTemplate = (src, dest) => {
      const files = fs.readdirSync(src);
      for (const file of files) {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);
        
        if (isUpdate) {
          if (file === 'project-memory.md' || file === 'agentflow.yml') {
            if (fs.existsSync(destFile)) {
              console.log(`  ⏭️  跳过 ${file} (保留用户配置)`);
              continue;
            }
          }
          if (fs.statSync(srcFile).isDirectory()) {
            if (!fs.existsSync(destFile)) fs.mkdirSync(destFile, { recursive: true });
            copyTemplate(srcFile, destFile);
            continue;
          }
        }
        
        fs.cpSync(srcFile, destFile, { recursive: true });
      }
    };

    copyTemplate(templatePath, targetPath);
    
    if (isUpdate) {
      console.log('✅ AgentFlow 更新成功！');
      handleDocsRefresh();
    } else {
      console.log('✅ AgentFlow 初始化成功！');
    }
  } catch (err) {
    console.error(`❌ ${isUpdate ? '更新' : '初始化'}失败:`, err);
    process.exit(1);
  }
}

function handleOpenPortal() {
  let indexPath = path.join(process.cwd(), '.github', 'docs', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    // Try finding it in current dir (if we are in .github)
    const altPath = path.join(process.cwd(), 'docs', 'index.html');
    if (fs.existsSync(altPath)) {
      indexPath = altPath;
    } else {
       // Try finding it in parent dir (if we are in a subdir)
       const parentPath = path.join(process.cwd(), '..', '.github', 'docs', 'index.html');
       if (fs.existsSync(parentPath)) {
         indexPath = parentPath;
       }
    }
  }

  if (!fs.existsSync(indexPath)) {
    console.error('❌ 文档门户尚未生成，请先运行 agentflow docs-refresh');
    return;
  }

  const { exec } = require('child_process');
  const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
  exec(`${start} "${indexPath}"`);
  console.log(`🚀 正在打开文档门户: ${indexPath}`);
}

function handleUpdate(args) {
  handleInit([...args, '--update', '--force']);
}

function showHelp() {
  console.log(`
用法: agentflow <命令> [选项]

命令:
  init          初始化 AgentFlow 环境
  update        更新 AgentFlow 模板和门户
  validate      验证当前项目的 AgentFlow 配置
  docs-refresh  更新文档索引和门户
  portal        打开文档门户
  version, -v   显示版本信息
  help, -h      显示帮助信息
`);
}

function showVersion() {
  const versionPath = path.join(process.cwd(), 'VERSION');
  let version = '1.0.0';
  if (fs.existsSync(versionPath)) {
    try {
      version = fs.readFileSync(versionPath, 'utf8').trim();
    } catch (err) {
      version = '1.0.0';
    }
  }
  console.log(`AgentFlow 版本: ${version}`);
}

function handleSkills(args) {
  const { options, commandArgs } = parseArgs(args);
  const subCommand = commandArgs[0] || 'list';
  const skillName = commandArgs[1];

  switch (subCommand) {
    case 'list':
    case 'ls':
      listSkills(options);
      break;
    case 'add':
    case 'new':
      addSkill(skillName, options);
      break;
    case 'show':
    case 'view':
      showSkill(skillName);
      break;
    case 'remove':
    case 'rm':
    case 'delete':
      removeSkill(skillName);
      break;
    case 'help':
    case '--help':
    case '-h':
      showSkillsHelp();
      break;
    default:
      if (validateSkillName(subCommand, true)) {
        showSkill(subCommand);
      } else {
        console.error(`❌ 未知 skills 命令: ${subCommand}`);
        showSkillsHelp();
        process.exit(1);
      }
  }
}

function parseArgs(args) {
  const options = { global: false };
  const commandArgs = [];
  
  for (const arg of args) {
    if (arg === '-g' || arg === '--global') {
      options.global = true;
    } else {
      commandArgs.push(arg);
    }
  }
  return { options, commandArgs };
}

function getGlobalSkillsDir() {
  const xdgConfig = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(xdgConfig, 'opencode', 'skills');
}

function getProjectSkillsDir() {
  return path.join(process.cwd(), '.github', 'skills');
}

function validateSkillName(name, silent = false) {
  if (!name) return false;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    if (!silent) {
      console.error(`❌ skill 名称无效: ${name}`);
      console.error("📋 命名规则: 1-64 字符，小写字母数字，连字符分隔");
      console.error("   示例: my-skill, code-review, git-workflow");
    }
    return false;
  }
  if (name.length > 64) {
    if (!silent) console.error("❌ skill 名称过长（最大 64 字符）");
    return false;
  }
  return true;
}

function listSkills(options) {
  console.log("📚 Skills 技能列表（三级架构）");
  console.log("================================");
  console.log("");

  console.log("🌐 全局 Skills（~/.config/opencode/skills/）");
  console.log("   与 opencode/VS Code 共享共用共维护");
  console.log("");

  const globalDir = getGlobalSkillsDir();
  if (fs.existsSync(globalDir)) {
    const skills = fs.readdirSync(globalDir).filter(f => {
      try { return fs.statSync(path.join(globalDir, f)).isDirectory(); } catch { return false; }
    });
    if (skills.length === 0) {
      console.log("   (无全局 skills)");
    } else {
      skills.forEach(skill => {
        const skillFile = path.join(globalDir, skill, 'SKILL.md');
        let desc = "(无描述)";
        if (fs.existsSync(skillFile)) {
          try {
            const content = fs.readFileSync(skillFile, 'utf8');
            const match = content.match(/^description:\s*(.+)$/m);
            if (match) desc = match[1].trim();
          } catch (e) {}
        }
        console.log(`   ✅ ${skill}`);
        console.log(`      └─ ${desc}`);
      });
      console.log(`\n   共 ${skills.length} 个全局 skill`);
    }
  } else {
    console.log("   (目录不存在，运行 'agentflow skills add -g <name>' 创建)");
  }

  console.log("");

  console.log("📦 项目级 AgentFlow Skills（.github/skills/）");
  console.log("   AgentFlow 独有，SKILL.md 格式");
  console.log("");

  const projectDir = getProjectSkillsDir();
  if (fs.existsSync(projectDir)) {
    const skills = fs.readdirSync(projectDir).filter(f => {
      try { return fs.statSync(path.join(projectDir, f)).isDirectory(); } catch { return false; }
    });
    if (skills.length === 0) {
      console.log("   (无项目级 AgentFlow skills)");
    } else {
      skills.forEach(skill => {
        const skillFile = path.join(projectDir, skill, 'SKILL.md');
        let desc = "(无描述)";
        if (fs.existsSync(skillFile)) {
          try {
            const content = fs.readFileSync(skillFile, 'utf8');
            const match = content.match(/^description:\s*(.+)$/m);
            if (match) desc = match[1].trim();
          } catch (e) {}
        }
        console.log(`   ✅ ${skill}`);
        console.log(`      └─ ${desc}`);
      });
      console.log(`\n   共 ${skills.length} 个项目级 AgentFlow skill`);
    }
  } else {
    console.log("   (目录不存在，运行 'agentflow skills add <name>' 创建)");
  }

  console.log("");
  
  console.log("📋 项目级 VS Code Skills（.github/instructions/）");
  console.log("   VS Code/Copilot 原生机制，自动加载");
  console.log("");
  
  const instructionsDir = path.join(process.cwd(), '.github', 'instructions');
  if (fs.existsSync(instructionsDir)) {
      const files = fs.readdirSync(instructionsDir).filter(f => f.endsWith('.instructions.md'));
      if (files.length === 0) {
          console.log("   (无 VS Code instructions)");
      } else {
          files.forEach(file => {
              const name = file.replace('.instructions.md', '');
              let applyTo = "**";
              try {
                const content = fs.readFileSync(path.join(instructionsDir, file), 'utf8');
                const match = content.match(/^applyTo:\s*(.+)$/m);
                if (match) applyTo = match[1].trim().replace(/"/g, '');
              } catch (e) {}
              console.log(`   ✅ ${name}`);
              console.log(`      └─ 适用: ${applyTo}`);
          });
          console.log(`\n   共 ${files.length} 个 VS Code instruction`);
      }
  } else {
      console.log("   (目录不存在)");
  }
  
  console.log("");
  console.log("💡 提示:");
  console.log("   创建全局 skill:     agentflow skills add -g <name>");
  console.log("   创建项目级 skill:   agentflow skills add <name>");
  console.log("   VS Code instruction: 编辑 .github/instructions/*.instructions.md");
  console.log("   查看 skill:         agentflow skills show <name>");
}

function addSkill(name, options) {
  if (!name) {
    console.error("❌ 请指定 skill 名称");
    showSkillsHelp();
    return;
  }

  if (!validateSkillName(name)) return;

  const isGlobal = options.global;
  const baseDir = isGlobal ? getGlobalSkillsDir() : getProjectSkillsDir();
  const skillDir = path.join(baseDir, name);
  const skillType = isGlobal ? "全局" : "项目级";

  if (isGlobal) {
    console.log(`🌐 创建全局 skill: ${name}`);
    console.log(`   路径: ${skillDir}/`);
    console.log("   共享: 与 opencode 共享共用共维护");
  } else {
    console.log(`📦 创建项目级 AgentFlow skill: ${name}`);
    console.log(`   路径: ${skillDir}/`);
  }

  if (fs.existsSync(skillDir)) {
    console.error(`❌ skill 已存在: ${skillDir}`);
    return;
  }

  try {
    fs.mkdirSync(skillDir, { recursive: true });
    const skillFile = path.join(skillDir, 'SKILL.md');
    const timestamp = new Date().toISOString().split('T')[0];

    const template = `---
name: ${name}
description: 在此描述技能的用途和触发条件
license: MIT
compatibility: opencode
metadata:
  author: AgentFlow
  created: ${timestamp}
---

## 技能描述

描述这个技能的主要功能和使用场景。

## 触发条件

说明何时应该使用这个技能：
- 当用户请求...
- 当代码包含...
- 当项目需要...

## 执行步骤

1. 第一步操作
2. 第二步操作
3. 第三步操作

## 输出格式

描述技能执行后的输出格式和内容。

## 注意事项

- 任何需要注意的限制或前提条件
- 可能的失败情况及处理方式
`;

    fs.writeFileSync(skillFile, template);

    console.log("");
    console.log(`✅ 已创建${skillType} skill: ${name}`);
    console.log(`📄 文件: ${skillFile}`);
    console.log("");
    console.log("下一步:");
    console.log("  1. 编辑 SKILL.md 定义技能行为");
    console.log(`  2. 运行 'agentflow skills show ${name}' 查看`);
  } catch (err) {
    console.error(`❌ 创建失败: ${err.message}`);
  }
}

function showSkill(name) {
  if (!name) {
    console.error("❌ 请指定 skill 名称");
    return;
  }

  const projectDir = getProjectSkillsDir();
  const globalDir = getGlobalSkillsDir();
  
  let skillFile = path.join(projectDir, name, 'SKILL.md');
  let skillType = "项目级 AgentFlow";

  if (!fs.existsSync(skillFile)) {
    skillFile = path.join(globalDir, name, 'SKILL.md');
    skillType = "全局（与 opencode 共享）";
  }

  if (!fs.existsSync(skillFile)) {
    console.error(`❌ skill 不存在: ${name}`);
    console.log("");
    console.log("💡 运行 'agentflow skills' 查看可用 skills");
    return;
  }

  console.log(`📚 Skill 详情: ${name}`);
  console.log("================");
  console.log("");
  console.log(`类型: ${skillType}`);
  console.log(`路径: ${skillFile}`);
  console.log("");
  console.log("─── 内容 ───");
  try {
    console.log(fs.readFileSync(skillFile, 'utf8'));
  } catch (err) {
    console.error(`❌ 读取失败: ${err.message}`);
  }
}

function removeSkill(name) {
  if (!name) {
    console.error("❌ 请指定 skill 名称");
    return;
  }

  const projectDir = getProjectSkillsDir();
  const globalDir = getGlobalSkillsDir();
  
  let skillDir = path.join(projectDir, name);
  let skillType = "项目级 AgentFlow";

  if (!fs.existsSync(skillDir)) {
    skillDir = path.join(globalDir, name);
    skillType = "全局";
  }

  if (!fs.existsSync(skillDir)) {
    console.error(`❌ skill 不存在: ${name}`);
    return;
  }

  console.log(`⚠️  即将删除${skillType} skill: ${name}`);
  console.log(`📁 路径: ${skillDir}`);
  if (skillType === "全局") {
    console.log("🌐 注意: 此操作将影响 opencode 共享的 skills");
  }
  
  try {
    fs.rmSync(skillDir, { recursive: true, force: true });
    console.log(`✅ 已删除 skill: ${name}`);
  } catch (e) {
    console.error(`❌ 删除失败: ${e.message}`);
  }
}

function showSkillsHelp() {
  console.log("Skills 技能管理命令（三级架构）");
  console.log("");
  console.log("用法: agentflow skills <命令> [参数]");
  console.log("");
  console.log("命令:");
  console.log("  list              列出所有 skills（默认）");
  console.log("  add <name>        添加项目级 AgentFlow skill");
  console.log("  add -g <name>     添加全局 skill（与 opencode 共享）");
  console.log("  show <name>       显示 skill 详情");
  console.log("  remove <name>     删除 skill");
  console.log("");
  console.log("三级路径:");
  console.log("  全局:     ~/.config/opencode/skills/<name>/SKILL.md");
  console.log("            与 opencode 共享共用共维护");
  console.log("");
  console.log("  项目级:   .github/skills/<name>/SKILL.md");
  console.log("            AgentFlow 独有，通过 CLI 管理");
  console.log("");
  console.log("  VS Code:  .github/instructions/*.instructions.md");
  console.log("            Copilot 原生机制，直接编辑文件");
}

function handleDocsRefresh() {
  const docsDir = path.join(process.cwd(), '.github', 'docs');
  const manifestPath = path.join(docsDir, 'manifest.json');
  const manifestJsPath = path.join(docsDir, 'manifest.js');
  const docsContentJsPath = path.join(docsDir, 'docs-content.js');
  const indexPath = path.join(docsDir, 'index.html');
  const viewerPath = path.join(docsDir, 'viewer.html');
  
  if (!fs.existsSync(docsDir)) {
    console.error('❌ .github/docs 目录不存在');
    return;
  }

  console.log('🔄 正在刷新文档门户...');

  let projectName = path.basename(process.cwd());
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name) projectName = pkg.name;
    } catch (e) {}
  }

  let existingDocs = {};
  if (fs.existsSync(manifestPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      (data.documents || []).forEach(doc => {
        existingDocs[doc.path] = doc;
      });
    } catch (e) {}
  }

  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString().replace('T', ' ').split('.')[0];
  const newDocs = [];
  const docsContent = {};
  let addedCount = 0;
  let modifiedCount = 0;
  
  // Helper to process a file
  function processFile(filePath, type, status = 'active') {
    const relPath = path.relative(process.cwd(), filePath);
    // Normalize path separators for Windows compatibility
    const normalizedPath = relPath.split(path.sep).join('/');
    
    // Check if we already processed this file (to avoid duplicates)
    if (newDocs.find(d => d.path === normalizedPath)) return;

    const oldDoc = existingDocs[normalizedPath];
    
    const isNew = !oldDoc;
    let changeType = isNew ? 'added' : 'modified';
    if (status === 'archived') changeType = 'archived';

    if (isNew) addedCount++;
    else modifiedCount++;

    // Determine Category
    let category = 'Project';
    if (normalizedPath.startsWith('.sisyphus/')) category = 'OpenCode';
    else if (normalizedPath.startsWith('.github/')) category = 'AgentFlow';
    else if (normalizedPath.startsWith('src/') || !normalizedPath.includes('/')) category = 'Project';
    else {
        const parts = normalizedPath.split('/');
        category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }

    // Format Title
    let title = path.basename(filePath, '.md');
    let content = '';
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      console.error(`⚠️ 无法读取文件内容: ${filePath}`);
      return;
    }

    let extractedTitle = null;
    const lines = content.split('\n');
    // Check first line for # Title
    if (lines.length > 0 && lines[0].trim().startsWith('# ')) {
        extractedTitle = lines[0].trim().substring(2).trim();
    }
    
    // Fallback to title: metadata if not found in first line
    if (!extractedTitle) {
        const titleMatch = content.match(/^title:\s*(.+)$/m);
        if (titleMatch) extractedTitle = titleMatch[1].trim().replace(/['"]/g, '');
    }

    if (extractedTitle) {
      title = extractedTitle;
    } else {
      title = title.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    newDocs.push({
      path: normalizedPath,
      status: status,
      created: isNew ? today : oldDoc.created,
      updated: today,
      type: type,
      category: category,
      title: title,
      changeType: changeType
    });

    docsContent[normalizedPath] = content;
  }

  // 1. Scan Standard Docs (.github/docs/*)
  function scanStandardDir(subDir, type) {
    const dirPath = path.join(docsDir, subDir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') && f !== 'README.md');
      files.forEach(f => {
        const filePath = path.join(dirPath, f);
        let status = 'active';
        if (subDir === 'archive') status = 'archived';
        processFile(filePath, type, status);
      });
    }
  }

  scanStandardDir('plan', 'plan');
  scanStandardDir('reports', 'report');
  scanStandardDir('references', 'reference');
  scanStandardDir('changelog', 'changelog');
  scanStandardDir('archive', 'archive');

  // 2. Scan Global Docs (Recursive)
  const globalExclusions = ['node_modules', '.git', 'dist', 'build', 'coverage', 'tmp', 'temp', 'vendor'];
  
  function scanGlobal(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const relPath = path.relative(process.cwd(), fullPath);
      const normalizedRelPath = relPath.split(path.sep).join('/');
      
      // Skip if it's in .github/docs (already handled)
      if (normalizedRelPath.startsWith('.github/docs')) continue;

      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (globalExclusions.includes(file)) continue;
          scanGlobal(fullPath);
        } else if (file.endsWith('.md')) {
          processFile(fullPath, 'knowledge');
        }
      } catch (e) {
        // Ignore errors (e.g. permission denied)
      }
    }
  }

  // Start global scan from root
  scanGlobal(process.cwd());

  newDocs.sort((a, b) => a.title.localeCompare(b.title));

  let version = '1.0.0';
  try {
      version = fs.readFileSync(path.join(process.cwd(), 'VERSION'), 'utf8').trim();
  } catch (e) {}

  const manifestData = {
    version: version,
    lastUpdated: now,
    documents: newDocs
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));

  const jsContent = `window.AGENTFLOW_MANIFEST = ${JSON.stringify(manifestData, null, 2)};`;
  fs.writeFileSync(manifestJsPath, jsContent);

  const contentJsContent = `window.AGENTFLOW_CONTENT = ${JSON.stringify(docsContent, null, 2)};`;
  fs.writeFileSync(docsContentJsPath, contentJsContent);

  const htmlContent = generateHtmlIndex(version, now, projectName);
  fs.writeFileSync(indexPath, htmlContent);

  const viewerContent = generateViewerHtml();
  fs.writeFileSync(viewerPath, viewerContent);
  
  console.log(`✅ 文档门户已刷新 (共 ${newDocs.length} 个文档)`);
  console.log(`   - JSON: ${manifestPath}`);
  console.log(`   - JS:   ${manifestJsPath} (离线支持)`);
  console.log(`   - Content: ${docsContentJsPath} (离线支持)`);
  console.log(`   - HTML: ${indexPath}`);
  console.log(`   - View: ${viewerPath}`);
}

function generateHtmlIndex(version, lastUpdated, projectName) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName} - AgentFlow 文档门户</title>
    <!-- 引入 manifest.js 用于离线/CORS 支持 -->
    <script src="manifest.js"></script>
    <style>
        :root {
            --primary: #4F46E5;
            --primary-hover: #4338ca;
            --success: #10B981;
            --warning: #F59E0B;
            --danger: #EF4444;
            --bg: #F3F4F6;
            --card: #FFFFFF;
            --text: #1F2937;
            --muted: #6B7280;
            --border: #E5E7EB;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        
        header { text-align: center; margin-bottom: 3rem; }
        header h1 { font-size: 2.5rem; color: var(--primary); margin-bottom: 0.5rem; font-weight: 800; letter-spacing: -0.025em; }
        header p { color: var(--muted); font-size: 1.1rem; }

        .search-container { max-width: 600px; margin: 2rem auto 0; position: relative; }
        .search-input { width: 100%; padding: 1rem 1.5rem; border-radius: 9999px; border: 1px solid var(--border); font-size: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.2s; outline: none; }
        .search-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2); }

        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
        .stat { background: var(--card); padding: 1.5rem; border-radius: 16px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: transform 0.2s; }
        .stat:hover { transform: translateY(-2px); }
        .stat-value { font-size: 2.5rem; font-weight: 800; color: var(--primary); line-height: 1; margin-bottom: 0.5rem; }
        .stat-label { color: var(--muted); font-size: 0.875rem; font-weight: 500; }

        .main-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 2rem; }
        
        /* Left Column: Plans, Reports, Changelog */
        .sidebar { grid-column: span 4; display: flex; flex-direction: column; gap: 2rem; }
        
        /* Right Column: Knowledge Base */
        .content-area { grid-column: span 8; }

        @media (max-width: 768px) {
            .main-grid { display: flex; flex-direction: column; }
        }

        .section { background: var(--card); border-radius: 16px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 2rem; }
        .section:last-child { margin-bottom: 0; }
        .section h2 { font-size: 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; color: var(--text); border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
        .section-icon { font-size: 1.5rem; }
        
        .doc-list { list-style: none; }
        .doc-item { padding: 0.75rem 0; border-bottom: 1px solid var(--bg); display: flex; justify-content: space-between; align-items: center; transition: background 0.2s; }
        .doc-item:last-child { border-bottom: none; }
        .doc-item:hover { background: #F9FAFB; padding-left: 0.5rem; padding-right: 0.5rem; margin: 0 -0.5rem; border-radius: 8px; }
        
        .doc-link { color: var(--text); text-decoration: none; font-weight: 500; display: block; }
        .doc-link:hover { color: var(--primary); }
        .doc-meta { font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem; }
        
        .badge { padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-added { background: #D1FAE5; color: #065F46; }
        .badge-modified { background: #DBEAFE; color: #1E40AF; }
        .badge-archived { background: #F3F4F6; color: #374151; }

        .kb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; }
        .kb-group { margin-bottom: 2rem; }
        .kb-group-title { font-size: 1rem; font-weight: 600; color: var(--muted); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.5rem; }
        .kb-group-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

        .empty { color: var(--muted); font-style: italic; padding: 1rem 0; text-align: center; }
        
        footer { text-align: center; margin-top: 4rem; color: var(--muted); font-size: 0.875rem; border-top: 1px solid var(--border); padding-top: 2rem; }
        #lastUpdated { font-weight: 500; color: var(--text); }
        .error-msg { color: var(--danger); text-align: center; padding: 1rem; display: none; background: #FEF2F2; border-radius: 8px; margin-bottom: 2rem; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📚 ${projectName} 文档门户</h1>
            <p>AI 辅助开发工作流系统 | 文档中心 v${version}</p>
            <div class="search-container">
                <input type="text" id="searchInput" class="search-input" placeholder="🔍 搜索文档 (标题, 路径, 类别)...">
            </div>
        </header>
        
        <div id="errorContainer" class="error-msg"></div>

        <div class="stats">
            <div class="stat">
                <div class="stat-value" id="totalDocs">-</div>
                <div class="stat-label">总文档数</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="activePlans">-</div>
                <div class="stat-label">进行中计划</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="totalReports">-</div>
                <div class="stat-label">工作报告</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="knowledgeDocs">-</div>
                <div class="stat-label">知识库</div>
            </div>
        </div>
        
        <div class="main-grid">
            <div class="sidebar">
                <div class="section">
                    <h2><span class="section-icon">📝</span> 开发计划</h2>
                    <ul class="doc-list" id="planList">
                        <li class="empty">加载中...</li>
                    </ul>
                </div>
                
                <div class="section">
                    <h2><span class="section-icon">📊</span> 工作报告</h2>
                    <ul class="doc-list" id="reportList">
                        <li class="empty">加载中...</li>
                    </ul>
                </div>

                <div class="section">
                    <h2><span class="section-icon">📋</span> 变更日志</h2>
                    <ul class="doc-list" id="changelogList">
                        <li class="empty">加载中...</li>
                    </ul>
                </div>
                
                <div class="section">
                    <h2><span class="section-icon">📦</span> 历史归档</h2>
                    <ul class="doc-list" id="archiveList">
                        <li class="empty">加载中...</li>
                    </ul>
                </div>
            </div>

            <div class="content-area">
                <div class="section">
                    <h2><span class="section-icon">📚</span> 知识库</h2>
                    <div id="knowledgeList">
                        <div class="empty">加载中...</div>
                    </div>
                </div>

                <div class="section">
                    <h2><span class="section-icon">📖</span> 参考资料</h2>
                    <ul class="doc-list" id="referenceList">
                        <li class="empty">加载中...</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <footer>
            <p>最后更新: <span id="lastUpdated">${lastUpdated}</span></p>
            <p>由 AgentFlow v${version} 自动管理</p>
        </footer>
    </div>
    
    <script>
        let allDocs = [];

        async function loadManifest() {
            try {
                let data;
                if (window.AGENTFLOW_MANIFEST) {
                    console.log('Loaded from manifest.js (Offline Mode)');
                    data = window.AGENTFLOW_MANIFEST;
                } else {
                    console.log('Fetching manifest.json (Server Mode)');
                    const response = await fetch('./manifest.json?t=' + new Date().getTime());
                    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
                    data = await response.json();
                }
                renderData(data);
            } catch (error) {
                console.error('Error loading manifest:', error);
                document.getElementById('errorContainer').textContent = '无法加载文档清单。请确保 manifest.js 或 manifest.json 存在。';
                document.getElementById('errorContainer').style.display = 'block';
            }
        }

        function renderData(data) {
            document.getElementById('lastUpdated').textContent = data.lastUpdated;
            allDocs = data.documents || [];
            
            // Stats
            document.getElementById('totalDocs').textContent = allDocs.length;
            document.getElementById('activePlans').textContent = allDocs.filter(d => d.type === 'plan' && d.status === 'active').length;
            document.getElementById('totalReports').textContent = allDocs.filter(d => d.type === 'report').length;
            document.getElementById('knowledgeDocs').textContent = allDocs.filter(d => d.type === 'knowledge').length;
            
            filterAndRender();
        }

        function filterAndRender() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            
            const filteredDocs = allDocs.filter(d => {
                return (d.title && d.title.toLowerCase().includes(query)) || 
                       (d.path && d.path.toLowerCase().includes(query)) ||
                       (d.category && d.category.toLowerCase().includes(query));
            });

            const plans = filteredDocs.filter(d => d.type === 'plan' && d.status === 'active');
            const reports = filteredDocs.filter(d => d.type === 'report' && d.status !== 'archived');
            const knowledge = filteredDocs.filter(d => d.type === 'knowledge');
            const changelogs = filteredDocs.filter(d => d.type === 'changelog');
            const refs = filteredDocs.filter(d => d.type === 'reference');
            const archived = filteredDocs.filter(d => d.status === 'archived');

            renderList('planList', plans);
            renderList('reportList', reports);
            renderKnowledgeList('knowledgeList', knowledge);
            renderList('changelogList', changelogs);
            renderList('referenceList', refs);
            renderList('archiveList', archived);
        }
        
        function renderList(id, items) {
            const el = document.getElementById(id);
            if (items.length === 0) {
                el.innerHTML = '<li class="empty">暂无文档</li>';
                return;
            }
            el.innerHTML = items.map(d => \`
                <li class="doc-item">
                    <div>
                        <a href="viewer.html?doc=\${encodeURIComponent(d.path)}" class="doc-link">\${d.title || d.path}</a>
                        <div class="doc-meta">\${d.updated}</div>
                    </div>
                    <span class="badge badge-\${d.changeType}">\${d.changeType === 'added' ? '新增' : d.changeType === 'modified' ? '更新' : '归档'}</span>
                </li>
            \`).join('');
        }

        function renderKnowledgeList(id, items) {
            const el = document.getElementById(id);
            if (items.length === 0) {
                el.innerHTML = '<div class="empty">暂无文档</div>';
                return;
            }

            // Group by Category
            const groups = {};
            items.forEach(item => {
                const cat = item.category || 'Other';
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(item);
            });

            // Sort categories
            const sortedCategories = Object.keys(groups).sort();

            let html = '<div class="kb-grid">';
            sortedCategories.forEach(cat => {
                html += \`
                    <div class="kb-group">
                        <div class="kb-group-title">\${cat}</div>
                        <ul class="doc-list">
                            \${groups[cat].map(d => \`
                                <li class="doc-item">
                                    <div>
                                        <a href="viewer.html?doc=\${encodeURIComponent(d.path)}" class="doc-link">\${d.title}</a>
                                    </div>
                                </li>
                            \`).join('')}
                        </ul>
                    </div>
                \`;
            });
            html += '</div>';
            el.innerHTML = html;
        }

        document.getElementById('searchInput').addEventListener('input', filterAndRender);

        loadManifest();
    </script>
</body>
</html>`;
}

function generateViewerHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgentFlow 文档查看器</title>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="docs-content.js"></script>
    <style>
        :root {
            --primary: #4F46E5;
            --bg: #F9FAFB;
            --card: #FFFFFF;
            --text: #1F2937;
            --border: #E5E7EB;
        }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: var(--bg); 
            color: var(--text); 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
        }
        .nav-header { 
            background: var(--card);
            padding: 1rem 2rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .back-link { 
            color: var(--primary); 
            text-decoration: none; 
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .back-link:hover { text-decoration: underline; }
        .doc-path { 
            color: #6B7280; 
            margin-left: 1rem; 
            font-size: 0.875rem;
            font-family: monospace;
        }
        .content-container {
            max-width: 900px;
            margin: 2rem auto;
            padding: 2rem;
            background: var(--card);
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        /* Markdown Styles */
        .markdown-body { font-size: 16px; }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; line-height: 1.25; }
        .markdown-body h1 { font-size: 2em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
        .markdown-body h2 { font-size: 1.5em; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
        .markdown-body p { margin-bottom: 1em; }
        .markdown-body ul, .markdown-body ol { margin-bottom: 1em; padding-left: 2em; }
        .markdown-body code { font-family: monospace; background: #F3F4F6; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; }
        .markdown-body pre { background: #1F2937; color: #F9FAFB; padding: 1em; border-radius: 8px; overflow-x: auto; margin-bottom: 1em; }
        .markdown-body pre code { background: transparent; color: inherit; padding: 0; }
        .markdown-body blockquote { border-left: 4px solid var(--border); color: #6B7280; padding-left: 1em; margin: 0 0 1em 0; }
        .markdown-body img { max-width: 100%; border-radius: 8px; }
        .markdown-body table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        .markdown-body th, .markdown-body td { border: 1px solid var(--border); padding: 0.5em; }
        .markdown-body th { background: #F9FAFB; font-weight: 600; }
        .markdown-body a { color: var(--primary); text-decoration: none; }
        .markdown-body a:hover { text-decoration: underline; }
        
        .loading { text-align: center; padding: 2rem; color: #6B7280; }
        .error { color: #EF4444; padding: 1rem; background: #FEF2F2; border-radius: 8px; border: 1px solid #FECACA; }
    </style>
</head>
<body>
    <div class="nav-header">
        <a href="index.html" class="back-link">← 返回门户</a>
        <span id="docPath" class="doc-path"></span>
    </div>
    
    <div class="content-container">
        <div id="content" class="markdown-body">
            <div class="loading">正在加载文档...</div>
        </div>
    </div>

    <script>
        const params = new URLSearchParams(window.location.search);
        const docPath = params.get('doc');
        
        if (!docPath) {
            document.getElementById('content').innerHTML = '<div class="error">❌ 未指定文档路径</div>';
        } else {
            document.getElementById('docPath').textContent = docPath;
            
            const content = window.AGENTFLOW_CONTENT && window.AGENTFLOW_CONTENT[docPath];
            if (content) {
                document.getElementById('content').innerHTML = marked.parse(content);
            } else {
                document.getElementById('content').innerHTML = \`<div class="error">❌ 无法加载文档: 未找到内容<br>路径: \${docPath}</div>\`;
            }
        }
    </script>
</body>
</html>`;
}

main();
