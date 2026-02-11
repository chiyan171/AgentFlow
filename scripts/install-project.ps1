# AgentFlow 项目级安装脚本 (Windows PowerShell)
# 用途: 在当前目录初始化 AgentFlow

$ErrorActionPreference = "Stop"

$AF_ROOT = Split-Path -Parent $PSScriptRoot
$AF_JS = Join-Path $AF_ROOT "bin\agentflow.js"

if (-not (Test-Path $AF_JS)) {
    Write-Host "❌ 错误: 未找到 agentflow.js: $AF_JS" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 正在当前目录初始化 AgentFlow..." -ForegroundColor Cyan
node "$AF_JS" init .

Write-Host "`n✅ AgentFlow 初始化完成！" -ForegroundColor Green
Write-Host "请用 VS Code 打开此目录开始使用。"
