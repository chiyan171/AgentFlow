#!/bin/zsh
# ==================== AgentFlow 项目级安装脚本 ====================
set -e

SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "AgentFlow 项目级安装"
echo "目标目录: $(pwd)"

if [[ -d ".github/agents" ]]; then
    echo "警告: 已存在 AgentFlow 配置"
    read -q "REPLY?是否覆盖? (y/N) " || true
    echo
    [[ ! "$REPLY" =~ ^[Yy]$ ]] && echo "取消" && exit 0
fi

cp -r "$SOURCE_DIR/template/.github" ./
cp -r "$SOURCE_DIR/template/.vscode" ./

echo ""
echo "✓ AgentFlow 安装完成!"
echo ""
echo "下一步:"
echo "  1. 编辑 .github/project-memory.md 填写项目信息"
echo "  2. 用 VS Code 打开项目"
echo "  3. 在 Copilot Chat 中测试: @plan 你好"
