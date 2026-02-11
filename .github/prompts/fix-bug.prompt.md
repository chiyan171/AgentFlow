---
name: fix-bug
description: 一键修 Bug。系统化调试：收集症状 → 生成假设 → 验证根因 → 修复 → 回归测试。全自动执行。
model:
  - "Claude Sonnet 4.5 (copilot)"
  - "Claude Opus 4.5 (copilot)"
  - "Gemini 2.5 Pro (copilot)"
  - "GPT-5.2 (copilot)"
  - "GPT-5.2 Codex (copilot)"
  - "Claude Opus 4.6 (copilot)"
tools:
  - search
  - editFiles
  - terminalCommand
  - runTask
  - codebase
  - problems
  - usages
  - testFailure
---

# Bug 修复工作流

> **全自动执行，禁止暂停等待用户确认。所有 shell 操作通过 terminalCommand 执行。**

Bug 描述：${input:bug:描述 Bug 的现象、错误信息、复现步骤}

### 1. 症状收集
- 分析用户描述的错误现象
- 搜索相关代码和日志
- 确定影响范围

### 2. 根因分析
- 生成 2-5 个假设
- 逐个验证排除
- 确认根本原因

### 3. 修复实施
- 针对根因做最小修改
- 用 `terminalCommand` 执行构建验证

### 4. 回归测试
- 添加回归测试用例
- 用 `terminalCommand` 运行测试套件
- 确认修复且无副作用

### 5. 变更记录
- 追加到 `.github/docs/changelog/CHANGELOG.md`
- 输出总结：根因、修改文件、测试结果
