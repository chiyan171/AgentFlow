#!/bin/zsh
# ==================== AgentFlow 卸载脚本 ====================

echo "AgentFlow 卸载程序"
echo ""
echo "将删除:"
echo "  - ~/.agentflow/ (所有 AgentFlow 文件)"
echo "  - ~/.zshrc 中的环境变量"
echo ""
read -q "REPLY?确认卸载? (y/N) " || true
echo

if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    rm -rf "$HOME/.agentflow"
    if [[ -f ~/.zshrc ]]; then
        cp ~/.zshrc ~/.zshrc.agentflow.backup
        grep -v "AGENTFLOW_HOME\|# AgentFlow" ~/.zshrc > ~/.zshrc.tmp
        mv ~/.zshrc.tmp ~/.zshrc
    fi
    echo "✓ AgentFlow 卸载完成"
else
    echo "取消卸载"
fi
