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
      console.log('TODO: 刷新文档门户');
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

main();
