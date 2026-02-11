#!/bin/zsh
# ==================== AgentFlow 全局安装脚本 ====================
# 版本: v1.0.0
# 用途: 安装到 ~/.agentflow，全局可用
set -e

AGENTFLOW_HOME="$HOME/.agentflow"
AGENTFLOW_VERSION="1.0.0"
SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "\033[0;34m[INFO]\033[0m 安装 AgentFlow v$AGENTFLOW_VERSION..."
echo "\033[0;34m[INFO]\033[0m 安装目录: $AGENTFLOW_HOME"

# ==================== 备份已有安装 ====================
if [[ -d "$AGENTFLOW_HOME" ]]; then
    BACKUP="$AGENTFLOW_HOME.backup.$(date +%Y%m%d_%H%M%S)"
    echo "\033[1;33m[WARNING]\033[0m 检测到已有安装，备份到: $BACKUP"
    mv "$AGENTFLOW_HOME" "$BACKUP"
fi

# ==================== 创建目录 ====================
mkdir -p "$AGENTFLOW_HOME/template"
mkdir -p "$AGENTFLOW_HOME/bin"
mkdir -p "$AGENTFLOW_HOME/docs"
mkdir -p "$AGENTFLOW_HOME/scripts"

# ==================== 复制模板 ====================
echo "\033[0;34m[INFO]\033[0m 复制模板文件..."
if [[ -d "$SOURCE_DIR/template" ]]; then
    cp -r "$SOURCE_DIR/template/." "$AGENTFLOW_HOME/template/"
    echo "\033[0;32m[SUCCESS]\033[0m 模板目录复制完成"
else
    echo "\033[1;31m[ERROR]\033[0m template/ 目录不存在"
    exit 1
fi

if [[ -f "$SOURCE_DIR/VERSION" ]]; then
    cp "$SOURCE_DIR/VERSION" "$AGENTFLOW_HOME/"
    echo "\033[0;32m[SUCCESS]\033[0m VERSION 文件复制完成"
else
    echo "\033[1;31m[ERROR]\033[0m VERSION 文件不存在"
    exit 1
fi

# 复制文档
if [[ -d "$SOURCE_DIR/docs" ]]; then
    cp -r "$SOURCE_DIR/docs/." "$AGENTFLOW_HOME/docs/"
    echo "\033[0;32m[SUCCESS]\033[0m 文档目录复制完成"
fi

# 复制其他必要文件
[[ -f "$SOURCE_DIR/README.md" ]] && cp "$SOURCE_DIR/README.md" "$AGENTFLOW_HOME/"
[[ -f "$SOURCE_DIR/CHANGELOG.md" ]] && cp "$SOURCE_DIR/CHANGELOG.md" "$AGENTFLOW_HOME/"

# ==================== 安装 CLI 工具 ====================
if [[ -f "$SOURCE_DIR/bin/agentflow" ]]; then
    cp "$SOURCE_DIR/bin/agentflow" "$AGENTFLOW_HOME/bin/agentflow"
    chmod +x "$AGENTFLOW_HOME/bin/agentflow"
    echo "\033[0;32m[SUCCESS]\033[0m CLI 工具安装完成"
else
    echo "\033[1;31m[ERROR]\033[0m bin/agentflow 不存在"
    exit 1
fi

# ==================== 配置环境变量 ====================
if ! grep -q "AGENTFLOW_HOME" ~/.zshrc 2>/dev/null; then
    echo '' >> ~/.zshrc
    echo '# AgentFlow' >> ~/.zshrc
    echo 'export AGENTFLOW_HOME="$HOME/.agentflow"' >> ~/.zshrc
    echo 'export PATH="$AGENTFLOW_HOME/bin:$PATH"' >> ~/.zshrc
    echo "\033[0;32m[SUCCESS]\033[0m 环境变量已添加到 ~/.zshrc"
else
    echo "\033[0;34m[INFO]\033[0m 环境变量已存在，跳过"
fi

# ==================== 配置 VS Code 全局设置 ====================
VSCODE_SETTINGS="$HOME/Library/Application Support/Code/User/settings.json"
VSCODE_SETTINGS_LINUX="$HOME/.config/Code/User/settings.json"

if [[ -f "$VSCODE_SETTINGS" ]]; then
    SETTINGS_FILE="$VSCODE_SETTINGS"
elif [[ -f "$VSCODE_SETTINGS_LINUX" ]]; then
    SETTINGS_FILE="$VSCODE_SETTINGS_LINUX"
else
    SETTINGS_FILE=""
fi

echo ""
echo "\033[1;33m[配置 VS Code 全局设置]\033[0m"
echo "为实现「全自动执行，无 Allow 弹窗」，需要配置以下设置："
echo ""
echo '  "github.copilot.chat.runCommand.enabled": true,'
echo '  "github.copilot.chat.allowFileOperations": true,'
echo '  "terminal.integrated.allowWorkspaceConfiguration": true,'
echo '  "security.workspace.trust.enabled": true'
echo ""

if [[ -n "$SETTINGS_FILE" && -f "$SETTINGS_FILE" ]]; then
    echo "检测到 VS Code 设置文件: $SETTINGS_FILE"
    
    if grep -q "github.copilot.chat.runCommand.enabled" "$SETTINGS_FILE" 2>/dev/null; then
        echo "\033[0;34m[INFO]\033[0m Copilot 终端设置已存在，跳过"
    else
        echo ""
        read -q "REPLY?是否自动添加到 VS Code 全局设置? (y/N) " || true
        echo ""
        if [[ "$REPLY" =~ ^[Yy]$ ]]; then
            cp "$SETTINGS_FILE" "$SETTINGS_FILE.agentflow-backup"
            
            python3 << PYEOF
import json
import os

settings_file = "$SETTINGS_FILE"
with open(settings_file, 'r') as f:
    try:
        settings = json.load(f)
    except:
        settings = {}

agentflow_settings = {
    "github.copilot.chat.runCommand.enabled": True,
    "github.copilot.chat.allowFileOperations": True,
    "terminal.integrated.allowWorkspaceConfiguration": True,
    "security.workspace.trust.enabled": True,
    "github.copilot.chat.agent.enabled": True,
    "chat.agent.enabled": True
}

for key, value in agentflow_settings.items():
    if key not in settings:
        settings[key] = value

with open(settings_file, 'w') as f:
    json.dump(settings, f, indent=2)

print("设置已添加")
PYEOF
            echo "\033[0;32m[SUCCESS]\033[0m VS Code 全局设置已更新"
            echo "\033[0;34m[INFO]\033[0m 原设置已备份到: $SETTINGS_FILE.agentflow-backup"
        else
            echo "\033[0;34m[INFO]\033[0m 跳过自动配置"
        fi
    fi
else
    echo "\033[1;33m[WARNING]\033[0m 未检测到 VS Code，请手动配置"
fi

# ==================== 完成 ====================
echo ""
echo "\033[0;32m===================================================\033[0m"
echo "\033[0;32m  AgentFlow v$AGENTFLOW_VERSION 安装成功!\033[0m"
echo "\033[0;32m===================================================\033[0m"
echo ""
echo "下一步:"
echo "  1. source ~/.zshrc"
echo "  2. agentflow init /path/to/project"
echo "  3. 用 VS Code 打开项目"
echo "  4. 在 Copilot Chat 中测试: @plan 你好"
echo ""
