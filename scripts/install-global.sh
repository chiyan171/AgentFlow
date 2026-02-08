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

# ==================== 生成 CLI 工具 ====================
if [[ -f "$SOURCE_DIR/bin/agentflow" ]]; then
    cp "$SOURCE_DIR/bin/agentflow" "$AGENTFLOW_HOME/bin/agentflow"
else
    cat > "$AGENTFLOW_HOME/bin/agentflow" << 'ENDCLI'
#!/bin/zsh
# AgentFlow CLI v1.0.0
AGENTFLOW_HOME="${AGENTFLOW_HOME:-$HOME/.agentflow}"

show_help() {
    cat << HELP
AgentFlow - AI 辅助开发工作流系统 v1.0.0

用法: agentflow <命令> [参数]

命令:
  init [目录]    初始化 AgentFlow（默认当前目录）
  version        显示版本号
  docs           打开文档
  help           显示帮助

示例:
  agentflow init
  agentflow init /path/to/project

Agent:  @plan @implement @reviewer @tester @debug
Prompt: /auto /fix-bug /add-feature /code-review /refactor
HELP
}

init_project() {
    local target="${1:-.}"
    [[ ! -d "$target" ]] && mkdir -p "$target"
    target="$(cd "$target" && pwd)"
    echo "初始化 AgentFlow 到: $target"
    if [[ -d "$target/.github/agents" ]]; then
        echo "警告: 已存在 AgentFlow 配置"
        read -q "REPLY?是否覆盖? (y/N) " || true
        echo
        [[ ! "$REPLY" =~ ^[Yy]$ ]] && echo "取消" && return 1
    fi
    cp -r "$AGENTFLOW_HOME/template/.github" "$target/"
    cp -r "$AGENTFLOW_HOME/template/.vscode" "$target/"
    echo ""
    echo "✓ AgentFlow 初始化完成!"
    echo ""
    echo "下一步:"
    echo "  1. 编辑 .github/project-memory.md 填写项目信息"
    echo "  2. 用 VS Code 打开项目"
    echo "  3. 在 Copilot Chat 中测试: @plan 你好"
}

case "${1:-help}" in
    init)    init_project "$2" ;;
    version) cat "$AGENTFLOW_HOME/VERSION" 2>/dev/null || echo "1.0.0" ;;
    docs)    open "$AGENTFLOW_HOME/template/.github/docs/agentflow" 2>/dev/null || echo "文档: $AGENTFLOW_HOME/template/.github/docs/agentflow" ;;
    help|--help|-h) show_help ;;
    *)       echo "未知命令: $1"; show_help; exit 1 ;;
esac
ENDCLI
fi
chmod +x "$AGENTFLOW_HOME/bin/agentflow"
echo "\033[0;32m[SUCCESS]\033[0m CLI 工具创建完成"

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

# ==================== 配置 VS Code 全局设置（消除 Allow 弹窗） ====================
VSCODE_SETTINGS="$HOME/Library/Application Support/Code/User/settings.json"
VSCODE_SETTINGS_LINUX="$HOME/.config/Code/User/settings.json"

# 检测平台
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
    
    # 检查是否已有相关设置
    if grep -q "github.copilot.chat.runCommand.enabled" "$SETTINGS_FILE" 2>/dev/null; then
        echo "\033[0;34m[INFO]\033[0m Copilot 终端设置已存在，跳过"
    else
        echo ""
        read -q "REPLY?是否自动添加到 VS Code 全局设置? (y/N) " || true
        echo ""
        if [[ "$REPLY" =~ ^[Yy]$ ]]; then
            # 备份
            cp "$SETTINGS_FILE" "$SETTINGS_FILE.agentflow-backup"
            
            # 添加设置（在文件最后的 } 之前插入）
            # 使用 Python 来安全处理 JSON
            python3 << PYEOF
import json
import os

settings_file = "$SETTINGS_FILE"
with open(settings_file, 'r') as f:
    try:
        settings = json.load(f)
    except:
        settings = {}

# AgentFlow 推荐设置
agentflow_settings = {
    "github.copilot.chat.runCommand.enabled": True,
    "github.copilot.chat.allowFileOperations": True,
    "terminal.integrated.allowWorkspaceConfiguration": True,
    "security.workspace.trust.enabled": True,
    "github.copilot.chat.agent.enabled": True,
    "chat.agent.enabled": True
}

# 合并设置（不覆盖已有设置）
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
            echo ""
            echo "请手动在 VS Code 中添加上述设置："
            echo "  1. 按 Cmd+Shift+P（Mac）或 Ctrl+Shift+P（其他）"
            echo "  2. 输入 'Preferences: Open User Settings (JSON)'"
            echo "  3. 添加上述配置项"
        fi
    fi
else
    echo "\033[1;33m[WARNING]\033[0m 未检测到 VS Code，请手动配置"
    echo ""
    echo "在 VS Code 中："
    echo "  1. 按 Cmd+Shift+P（Mac）或 Ctrl+Shift+P（其他）"
    echo "  2. 输入 'Preferences: Open User Settings (JSON)'"
    echo "  3. 添加上述配置项"
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
echo "文档门户: agentflow portal"
echo "刷新文档: agentflow docs-refresh"
echo "帮助信息: agentflow help"
