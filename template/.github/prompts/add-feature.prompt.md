---
name: add-feature
description: 一键添加新功能。完整流程：需求分析 → 规划 → TDD → 实施 → 审查。全自动执行。
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
  - fetch
---

# 新功能开发工作流

> **全自动执行，禁止暂停等待用户确认。所有 shell 操作通过 terminalCommand 执行。**

功能描述：${input:feature:描述你要添加的功能}

### 阶段 1：需求分析与设计
1. 理解功能需求与用户场景
2. 搜索现有代码，确认是否有可复用的实现
3. 设计方案（含 2-3 个备选，表格对比）
4. 确定影响范围和修改文件列表

### 阶段 2：任务分解
1. 将功能拆解为可独立验证的小步骤
2. 确定每步的输入/输出/验证方式
3. **输出计划后立即开始实施，不停顿**

### 阶段 3：实施
1. 按步骤用 `editFiles` 修改代码
2. 每步用 `terminalCommand` 构建验证
3. 编写单元测试
4. 用 `terminalCommand` 运行全部测试

### 阶段 4：自我审查
1. 代码质量检查（命名/职责/坏味道）
2. 架构一致性检查（MVVM）
3. 发现问题立即修复

### 阶段 5：变更记录
- 追加到 `.github/docs/changelog/CHANGELOG.md`
- 输出总结
