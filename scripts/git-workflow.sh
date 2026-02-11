#!/bin/bash

# AgentFlow Git Workflow Script
# Usage: ./scripts/git-workflow.sh [submit|update|changelog] [message]

set -e

CHANGELOG_FILE="CHANGELOG.md"
DATE=$(date "+%Y-%m-%d %H:%M:%S")

generate_changelog() {
    local message="$1"
    if [ -z "$message" ]; then
        echo "请输入提交信息 (Please enter commit message):"
        read message
    fi

    if [ -z "$message" ]; then
        echo "❌ 提交信息不能为空 (Commit message cannot be empty)"
        exit 1
    fi

    echo "📝 生成变更日志..."
    
    local changes=$(git status --short)
    local entry="## [$DATE] $message\n\n### 变更文件:\n\`\`\`\n$changes\n\`\`\`\n"
    
    if [ ! -f "$CHANGELOG_FILE" ]; then
        echo "# AgentFlow Changelog\n\n" > "$CHANGELOG_FILE"
    fi
    
    echo -e "$entry\n$(cat "$CHANGELOG_FILE")" > "$CHANGELOG_FILE"
    
    echo "✅ 变更日志已更新: $CHANGELOG_FILE"
    export COMMIT_MESSAGE="$message"
}

submit() {
    echo "🚀 开始提交流程 (Starting Submit Workflow)..."
    
    generate_changelog "$1"
    
    echo "📦 添加变更..."
    git add .
    
    echo "💾 提交变更..."
    git commit -m "$COMMIT_MESSAGE"
    
    echo "🔄 拉取远程更新 (Rebase)..."
    git pull --rebase origin master || git pull --rebase origin main
    
    echo "⬆️ 推送到远程..."
    git push origin master || git push origin main
    
    echo "✅ 提交完成!"
}

update() {
    echo "🔄 开始更新流程 (Starting Update Workflow)..."
    
    echo "📦 暂存本地变更..."
    git stash save "Auto stash before update $(date)"
    
    echo "⬇️ 拉取远程更新 (Rebase)..."
    git pull --rebase origin master || git pull --rebase origin main
    
    echo "📂 恢复本地变更..."
    if git stash pop; then
        echo "✅ 更新完成!"
    else
        echo "⚠️ 恢复暂存时发生冲突，请手动解决 (Conflict during stash pop, please resolve manually)"
        exit 1
    fi
}

case "$1" in
    submit)
        submit "$2"
        ;;
    update)
        update
        ;;
    changelog)
        generate_changelog "$2"
        ;;
    *)
        echo "用法: $0 {submit|update|changelog} [message]"
        exit 1
        ;;
esac
