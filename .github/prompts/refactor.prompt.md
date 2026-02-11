---
name: refactor
description: 一键重构。安全地重构代码：分析 → 规划 → 重构 → 验证。全自动执行。
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

# 重构工作流

> **全自动执行，禁止暂停等待用户确认。所有 shell 操作通过 terminalCommand 执行。**

重构目标：${input:target:描述要重构的模块/文件/模式}

### 1. 现状分析
- 阅读要重构的代码
- 理解现有设计意图
- 列出所有调用点和依赖

### 2. 问题诊断
- 识别代码坏味道（僵化/冗余/耦合/脆弱/晦涩）
- 区分"风格不喜欢"和"确有硬伤"

### 3. 重构方案
- 目标架构描述
- 迁移路径（增量步骤，表格对比方案优劣）
- 每步可独立验证
- **输出方案后立即开始执行，不停顿**

### 4. 安全执行
- 每步用 `editFiles` 修改后立即用 `terminalCommand` 构建验证
- 保持测试通过
- 不引入功能变更

### 5. 验证 & 变更记录
- 用 `terminalCommand` 运行全部测试，确认无功能退化
- 追加到 `.github/docs/changelog/CHANGELOG.md`
- 输出总结
