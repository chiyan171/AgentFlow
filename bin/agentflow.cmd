@echo off
setlocal

:: AgentFlow Windows Launcher (CMD)
:: 简体中文输出

:: 1. 设置环境变量
if not defined AGENTFLOW_HOME (
    set "AGENTFLOW_HOME=%USERPROFILE%\.agentflow"
)
set "JS_ENTRY=%AGENTFLOW_HOME%\.github\scripts\agentflow.js"

:: 2. 检查 node 是否安装
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ 错误: 未找到 'node'。请先安装 Node.js。
    exit /b 1
)

:: 3. 检查核心脚本是否存在
if not exist "%JS_ENTRY%" (
    :: 开发环境兼容：如果全局路径不存在，尝试使用相对路径
    set "DEV_ENTRY=%~dp0..\.github\scripts\agentflow.js"
    if exist "%DEV_ENTRY%" (
        set "JS_ENTRY=%DEV_ENTRY%"
    ) else (
        echo ❌ 错误: 未找到核心脚本: %JS_ENTRY%
        exit /b 1
    )
)

:: 4. 调用 Node.js 脚本并传递所有参数
node "%JS_ENTRY%" %*

:: 5. 处理错误
if %ERRORLEVEL% neq 0 (
    echo ⚠️  AgentFlow 执行过程中出错 (退出码: %ERRORLEVEL%)。
    exit /b %ERRORLEVEL%
)

endlocal
