#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const CHANGELOG_FILE = 'CHANGELOG.md';

function runCommand(command, options = {}) {
  try {
    return execSync(command, { stdio: 'inherit', encoding: 'utf8', ...options });
  } catch (error) {
    if (options.ignoreError) {
      return null;
    }
    console.error(`❌ 命令执行失败: ${command}`);
    process.exit(1);
  }
}

function getCommandOutput(command) {
  try {
    return execSync(command, { stdio: 'pipe', encoding: 'utf8' }).trim();
  } catch (error) {
    return '';
  }
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function generateChangelog(message) {
  if (!message) {
    console.log("请输入提交信息 (Please enter commit message):");
    message = await prompt("> ");
  }

  if (!message) {
    console.error("❌ 提交信息不能为空 (Commit message cannot be empty)");
    process.exit(1);
  }

  console.log("📝 生成变更日志...");

  const changes = getCommandOutput('git status --short');
  const date = getCurrentDate();
  const entry = `## [${date}] ${message}\n\n### 变更文件:\n\`\`\`\n${changes}\n\`\`\`\n`;

  if (!fs.existsSync(CHANGELOG_FILE)) {
    fs.writeFileSync(CHANGELOG_FILE, "# AgentFlow Changelog\n\n", 'utf8');
  }

  const currentContent = fs.readFileSync(CHANGELOG_FILE, 'utf8');
  fs.writeFileSync(CHANGELOG_FILE, entry + '\n' + currentContent, 'utf8');

  console.log(`✅ 变更日志已更新: ${CHANGELOG_FILE}`);
  return message;
}

async function submit(message) {
  console.log("🚀 开始提交流程 (Starting Submit Workflow)...");

  const commitMessage = await generateChangelog(message);

  console.log("📦 添加变更...");
  runCommand('git add .');

  console.log("💾 提交变更...");
  runCommand(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);

  console.log("🔄 拉取远程更新 (Rebase)...");
  try {
    runCommand('git pull --rebase origin master', { stdio: 'inherit' });
  } catch (e) {
    console.log("⚠️  尝试 master 分支失败，尝试 main 分支...");
    runCommand('git pull --rebase origin main');
  }

  console.log("⬆️ 推送到远程...");
  try {
    runCommand('git push origin master', { stdio: 'inherit' });
  } catch (e) {
    console.log("⚠️  尝试 master 分支失败，尝试 main 分支...");
    runCommand('git push origin main');
  }

  console.log("✅ 提交完成!");
}

function update() {
  console.log("🔄 开始更新流程 (Starting Update Workflow)...");

  console.log("📦 暂存本地变更...");
  const date = getCurrentDate();
  runCommand(`git stash save "Auto stash before update ${date}"`);

  console.log("⬇️ 拉取远程更新 (Rebase)...");
  try {
    runCommand('git pull --rebase origin master', { stdio: 'inherit' });
  } catch (e) {
    console.log("⚠️  尝试 master 分支失败，尝试 main 分支...");
    runCommand('git pull --rebase origin main');
  }

  console.log("📂 恢复本地变更...");
  try {
    runCommand('git stash pop');
    console.log("✅ 更新完成!");
  } catch (e) {
    console.error("⚠️ 恢复暂存时发生冲突，请手动解决 (Conflict during stash pop, please resolve manually)");
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const message = args[1];

  switch (command) {
    case 'submit':
      await submit(message);
      break;
    case 'update':
      update();
      break;
    case 'changelog':
      await generateChangelog(message);
      break;
    default:
      console.log(`用法: node ${path.basename(__filename)} {submit|update|changelog} [message]`);
      process.exit(1);
  }
}

main();
