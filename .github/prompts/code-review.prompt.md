---
name: code-review
description: 一键代码审查。对当前改动或指定文件进行全面审查，发现问题自动修复。
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

# 代码审查工作流

> **全自动执行。发现问题后直接修复，不等待用户确认。**

审查范围：${input:scope:输入要审查的文件路径、PR 描述或"当前改动"}

### 1. 收集上下文
- 阅读目标文件及其依赖
- 用 `terminalCommand` 执行 `git diff` 查看当前改动
- 搜索所有调用点和影响范围

### 2. 审查检查清单
| 维度 | 检查内容 |
|------|----------|
| 正确性 | 逻辑正确？边界情况？ |
| 架构 | 符合 MVVM？模块边界？ |
| 质量 | 命名？单一职责？坏味道？ |
| 安全 | 输入校验？数据泄漏？ |
| 性能 | 不必要开销？内存泄漏？ |
| 测试 | 覆盖率？可测试性？ |

### 3. 问题处理
- 输出问题列表（严重度 + 修复建议）
- **对严重问题：直接用 `editFiles` 修复，用 `terminalCommand` 构建验证**
- 对建议性优化：列出但不强制修复

### 4. 输出报告
```markdown
## 审查结论：✅ 通过 / ⚠️ 需修改 / ❌ 打回
### 发现的问题
| # | 严重度 | 文件 | 问题描述 | 处理状态 |
### 正面评价
### 可选优化
```

### 5. 归档报告
- 将审查报告保存到 `.github/docs/reports/YYYY-MM-DD-code-review-描述.md`
- 如有代码修复，追加变更记录到 `.github/docs/changelog/CHANGELOG.md`
- 如发现重要模式或经验，追加到 `.github/project-memory.md` 学习记录
