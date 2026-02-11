# AgentFlow Windows Launcher (PowerShell)
# 简体中文输出

# 1. 设置环境变量
if (-not (Test-Path env:AGENTFLOW_HOME)) {
    $env:AGENTFLOW_HOME = "$env:USERPROFILE\.agentflow"
}
$JS_ENTRY = "$env:AGENTFLOW_HOME\.github\scripts\agentflow.js"

# 2. 检查 node 是否安装
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误: 未找到 'node'。请先安装 Node.js。" -ForegroundColor Red
    exit 1
}

# 3. 检查核心脚本是否存在
if (-not (Test-Path $JS_ENTRY)) {
    # 开发环境兼容：如果全局路径不存在，尝试使用相对路径
    $ScriptDir = Split-Path $MyInvocation.MyCommand.Path
    $DEV_ENTRY = Join-Path $ScriptDir "..\.github\scripts\agentflow.js"
    if (Test-Path $DEV_ENTRY) {
        $JS_ENTRY = $DEV_ENTRY
    } else {
        Write-Host "❌ 错误: 未找到核心脚本: $JS_ENTRY" -ForegroundColor Red
        exit 1
    }
}

# 4. 调用 Node.js 脚本并传递所有参数
# 使用 $args 传递参数
node "$JS_ENTRY" $args

# 5. 处理错误
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  AgentFlow 执行过程中出错 (退出码: $LASTEXITCODE)。" -ForegroundColor Yellow
    exit $LASTEXITCODE
}
