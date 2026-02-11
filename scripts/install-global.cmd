@echo off
setlocal enabledelayedexpansion

:: ==================== AgentFlow 全局安装脚本 (Windows) ====================
:: 版本: v1.0.0
:: 用途: 安装到 %USERPROFILE%\.agentflow，全局可用

set "AGENTFLOW_HOME=%USERPROFILE%\.agentflow"
set "AGENTFLOW_VERSION=1.0.0"
set "SOURCE_DIR=%~dp0.."

echo [INFO] 正在安装 AgentFlow v%AGENTFLOW_VERSION%...
echo [INFO] 安装目录: %AGENTFLOW_HOME%

:: ==================== 备份已有安装 ====================
if exist "%AGENTFLOW_HOME%" (
    set "TIMESTAMP=%DATE:~0,4%%DATE:~5,2%%DATE:~8,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
    set "TIMESTAMP=!TIMESTAMP: =0!"
    set "BACKUP=%AGENTFLOW_HOME%.backup.!TIMESTAMP!"
    echo [WARNING] 检测到已有安装，备份到: !BACKUP!
    move "%AGENTFLOW_HOME%" "!BACKUP!"
)

:: ==================== 创建目录 ====================
mkdir "%AGENTFLOW_HOME%\template"
mkdir "%AGENTFLOW_HOME%\bin"
mkdir "%AGENTFLOW_HOME%\docs"
mkdir "%AGENTFLOW_HOME%\scripts"

:: ==================== 复制模板 ====================
echo [INFO] 复制模板文件...
if exist "%SOURCE_DIR%\template" (
    xcopy /E /I /Y "%SOURCE_DIR%\template\*" "%AGENTFLOW_HOME%\template\" >nul
    echo [SUCCESS] 模板目录复制完成
) else (
    echo [ERROR] template/ 目录不存在
    exit /b 1
)

if exist "%SOURCE_DIR%\VERSION" (
    copy /Y "%SOURCE_DIR%\VERSION" "%AGENTFLOW_HOME%\" >nul
    echo [SUCCESS] VERSION 文件复制完成
)

:: 复制文档
if exist "%SOURCE_DIR%\docs" (
    xcopy /E /I /Y "%SOURCE_DIR%\docs\*" "%AGENTFLOW_HOME%\docs\" >nul
    echo [SUCCESS] 文档目录复制完成
)

:: 复制其他必要文件
if exist "%SOURCE_DIR%\README.md" copy /Y "%SOURCE_DIR%\README.md" "%AGENTFLOW_HOME%\" >nul
if exist "%SOURCE_DIR%\CHANGELOG.md" copy /Y "%SOURCE_DIR%\CHANGELOG.md" "%AGENTFLOW_HOME%\" >nul

:: ==================== 复制 CLI 工具 ====================
if exist "%SOURCE_DIR%\bin\agentflow.cmd" (
    copy /Y "%SOURCE_DIR%\bin\agentflow.cmd" "%AGENTFLOW_HOME%\bin\" >nul
)
if exist "%SOURCE_DIR%\bin\agentflow.ps1" (
    copy /Y "%SOURCE_DIR%\bin\agentflow.ps1" "%AGENTFLOW_HOME%\bin\" >nul
)
if exist "%SOURCE_DIR%\bin\agentflow.js" (
    copy /Y "%SOURCE_DIR%\bin\agentflow.js" "%AGENTFLOW_HOME%\bin\" >nul
)
echo [SUCCESS] CLI 工具复制完成

:: ==================== 提示环境变量 ====================
echo.
echo [SUCCESS] AgentFlow 安装完成！
echo.
echo 请将以下路径添加到您的系统环境变量 PATH 中:
echo   %AGENTFLOW_HOME%\bin
echo.
echo 完成后，您可以在任意终端运行 'agentflow init' 来初始化项目。
echo.

endlocal
pause
