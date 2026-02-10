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
  const targetDir = args.find(arg => !arg.startsWith('-')) || '.';
  const targetPath = path.resolve(process.cwd(), targetDir);
  const templatePath = path.resolve(__dirname, '../../template');

  if (fs.existsSync(targetPath)) {
    if (!force) {
      if (targetDir !== '.') {
        console.error(`❌ 错误: 目标目录 '${targetDir}' 已存在。请使用 --force 覆盖。`);
        process.exit(1);
      }
      const hasGithub = fs.existsSync(path.join(targetPath, '.github'));
      const hasVscode = fs.existsSync(path.join(targetPath, '.vscode'));
      if (hasGithub || hasVscode) {
        console.error('❌ 错误: 当前目录已包含 AgentFlow 配置 (.github 或 .vscode)。请使用 --force 覆盖。');
        process.exit(1);
      }
    } else {
      const projectMemoryPath = path.join(targetPath, '.github/project-memory.md');
      const docsPath = path.join(targetPath, '.github/docs');

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
  } else {
    fs.mkdirSync(targetPath, { recursive: true });
  }

  console.log(`🚀 正在初始化 AgentFlow 到 ${targetPath}...`);
  try {
    if (!fs.existsSync(templatePath)) {
        console.error(`❌ 错误: 模板目录不存在: ${templatePath}`);
        process.exit(1);
    }
    const files = fs.readdirSync(templatePath);
    for (const file of files) {
      const srcFile = path.join(templatePath, file);
      const destFile = path.join(targetPath, file);
      fs.cpSync(srcFile, destFile, { recursive: true });
    }
    console.log('✅ AgentFlow 初始化成功！');
  } catch (err) {
    console.error('❌ 初始化失败:', err);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
用法: agentflow <命令> [选项]

命令:
  init          初始化 AgentFlow 环境
  validate      验证当前项目的 AgentFlow 配置
  docs-refresh  更新文档索引和门户
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
  const indexPath = path.join(docsDir, 'index.html');
  
  if (!fs.existsSync(docsDir)) {
    console.error('❌ .github/docs 目录不存在');
    return;
  }

  console.log('🔄 正在刷新文档门户...');

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
  let addedCount = 0;
  let modifiedCount = 0;
  
  function scanDir(subDir, type) {
    const dirPath = path.join(docsDir, subDir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') && f !== 'README.md');
      files.forEach(f => {
        const relPath = `${subDir}/${f}`;
        const oldDoc = existingDocs[relPath];
        
        const isNew = !oldDoc;
        let changeType = isNew ? 'added' : 'modified';
        let status = 'active';
        
        if (subDir === 'archive') {
            status = 'archived';
            changeType = 'archived';
        }

        if (isNew) addedCount++;
        else modifiedCount++;

        newDocs.push({
          path: relPath,
          status: status,
          created: isNew ? today : oldDoc.created,
          updated: today,
          type: type,
          title: f.replace('.md', ''),
          changeType: changeType
        });
      });
    }
  }

  scanDir('plan', 'plan');
  scanDir('reports', 'report');
  scanDir('references', 'reference');
  scanDir('changelog', 'changelog');
  scanDir('archive', 'archive');

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

  const htmlContent = generateHtmlIndex(version, now);
  fs.writeFileSync(indexPath, htmlContent);
  
  console.log(`✅ 文档门户已刷新 (共 ${newDocs.length} 个文档)`);
  console.log(`   - JSON: ${manifestPath}`);
  console.log(`   - JS:   ${manifestJsPath} (离线支持)`);
  console.log(`   - HTML: ${indexPath}`);
}

function generateHtmlIndex(version, lastUpdated) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgentFlow 文档门户</title>
    <!-- 引入 manifest.js 用于离线/CORS 支持 -->
    <script src="manifest.js"></script>
    <style>
        :root {
            --primary: #4F46E5;
            --success: #10B981;
            --warning: #F59E0B;
            --danger: #EF4444;
            --bg: #F9FAFB;
            --card: #FFFFFF;
            --text: #1F2937;
            --muted: #6B7280;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        header { text-align: center; margin-bottom: 2rem; }
        header h1 { font-size: 2rem; color: var(--primary); }
        header p { color: var(--muted); margin-top: 0.5rem; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat { background: var(--card); padding: 1.5rem; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2rem; font-weight: bold; color: var(--primary); }
        .stat-label { color: var(--muted); font-size: 0.875rem; }
        .sections { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .section { background: var(--card); border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .section h2 { font-size: 1.25rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .section-icon { font-size: 1.5rem; }
        .doc-list { list-style: none; }
        .doc-item { padding: 0.75rem 0; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; }
        .doc-item:last-child { border-bottom: none; }
        .doc-link { color: var(--primary); text-decoration: none; }
        .doc-link:hover { text-decoration: underline; }
        .doc-date { color: var(--muted); font-size: 0.75rem; }
        .badge { padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
        .badge-added { background: #D1FAE5; color: #065F46; }
        .badge-modified { background: #FEF3C7; color: #92400E; }
        .badge-archived { background: #E5E7EB; color: #374151; }
        .empty { color: var(--muted); font-style: italic; padding: 1rem 0; }
        footer { text-align: center; margin-top: 3rem; color: var(--muted); font-size: 0.875rem; }
        #lastUpdated { font-weight: 500; }
        .error-msg { color: var(--danger); text-align: center; padding: 1rem; display: none; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📚 AgentFlow 文档门户</h1>
            <p>AI 辅助开发工作流系统 | 文档中心 v${version}</p>
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
                <div class="stat-value" id="archivedDocs">-</div>
                <div class="stat-label">已归档</div>
            </div>
        </div>
        
        <div class="sections">
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
                <h2><span class="section-icon">📖</span> 参考资料</h2>
                <ul class="doc-list" id="referenceList">
                    <li class="empty">加载中...</li>
                </ul>
            </div>
            
            <div class="section">
                <h2><span class="section-icon">🗄️</span> 最近更新</h2>
                <ul class="doc-list" id="recentList">
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
        
        <footer>
            <p>最后更新: <span id="lastUpdated">${lastUpdated}</span></p>
            <p>由 AgentFlow v${version} 自动管理</p>
        </footer>
    </div>
    
    <script>
        async function loadManifest() {
            try {
                let data;
                
                // 策略 A: 优先检查全局变量 (支持 file:// 协议 / 离线模式)
                if (window.AGENTFLOW_MANIFEST) {
                    console.log('Loaded from manifest.js (Offline Mode)');
                    data = window.AGENTFLOW_MANIFEST;
                } 
                // 策略 B: 回退到 fetch (支持 HTTP 服务器环境)
                else {
                    console.log('Fetching manifest.json (Server Mode)');
                    // 添加时间戳防止缓存
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
            const docs = data.documents || [];
            
            // 统计
            document.getElementById('totalDocs').textContent = docs.length;
            document.getElementById('activePlans').textContent = docs.filter(d => d.type === 'plan' && d.status === 'active').length;
            document.getElementById('totalReports').textContent = docs.filter(d => d.type === 'report').length;
            document.getElementById('archivedDocs').textContent = docs.filter(d => d.status === 'archived').length;
            
            // 填充列表
            const plans = docs.filter(d => d.type === 'plan' && d.status === 'active');
            const reports = docs.filter(d => d.type === 'report' && d.status !== 'archived');
            const changelogs = docs.filter(d => d.type === 'changelog');
            const refs = docs.filter(d => d.type === 'reference');
            const archived = docs.filter(d => d.status === 'archived');
            const recent = [...docs].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 5);
            
            renderList('planList', plans);
            renderList('reportList', reports);
            renderList('changelogList', changelogs);
            renderList('referenceList', refs);
            renderList('archiveList', archived);
            renderList('recentList', recent);
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
                        <a href="\${d.path}" class="doc-link">\${d.title || d.path}</a>
                        <div class="doc-date">\${d.updated}</div>
                    </div>
                    <span class="badge badge-\${d.changeType}">\${d.changeType === 'added' ? '新增' : d.changeType === 'modified' ? '更新' : '归档'}</span>
                </li>
            \`).join('');
        }

        // 启动加载
        loadManifest();
    </script>
</body>
</html>`;
}

main();
