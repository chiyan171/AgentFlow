---
name: generate-changelog
description: 生成本次改动的变更文档。分析 Git diff，追加结构化变更记录到 .github/docs/changelog/CHANGELOG.md。
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
  - codebase
---

分析当前 Git 工作区的所有未提交改动，生成结构化的变更记录。

## 执行步骤

1. 运行 `git status` 和 `git diff --stat` 查看所有改动文件
2. 对每个改动文件，运行 `git diff -- <file>` 分析具体变更内容
3. 将变更记录**追加**到 `.github/docs/changelog/CHANGELOG.md`（如不存在则创建目录和文件）
4. **更新文档清单**：将本次变更记录到 `.github/docs/manifest.json`

## 输出格式

在 CHANGELOG.md 中追加以下格式：

```markdown
## [YYYY-MM-DD] 变更标题

### 改动摘要
（一句话说明本次改动的目的）

### 修改文件
| 文件 | 变更类型 | 说明 |
|------|---------|------|
| path/to/file | 新增/修改/删除 | 具体改了什么 |

### 影响范围
- （列出受影响的模块/功能）

### 测试验证
- 构建状态：✅/❌
- 测试状态：✅/❌/未运行
```

**要求：直接执行，不要等待用户确认。**
