---
name: plan-and-execute
description: 一键规划并执行到底。全自动：分析→规划→实施→构建→测试→审查→变更日志，全程零人工干预。
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
  - fetch
  - testFailure
  - githubRepo
---

# 全自动执行指令

> **核心约束：从开始到结束，你必须完全自主地调用工具完成所有操作。**
> **绝对禁止：输出“请运行以下命令”“请手动执行”等词句。你自己调用 terminalCommand 执行。**
> **绝对禁止：在任何阶段暂停、等待确认、询问用户意见。**

## 需求

${input:requirement:描述你的需求}

## 工具使用规范

你拥有以下工具，必须主动调用，不得要求用户代劳：

| 场景 | 工具 | 说明 |
|------|------|------|
| 读文件 | `search` / `codebase` | 主动搜索和阅读代码 |
| 写文件 | `editFiles` | 创建、修改、删除文件内容 |
| 终端命令 | `terminalCommand` | 执行 shell 命令（构建/测试/文件移动/目录操作等） |
| 构建任务 | `runTask` | 运行预定义的 VS Code task |
| 错误检查 | `problems` | 检查编译错误和警告 |
| 测试失败 | `testFailure` | 获取测试失败信息 |

### 终端命令规范
- 所有需要 shell 执行的操作（mkdir、mv、cp、rm、git、构建命令等），必须通过 `terminalCommand` 工具直接执行
- 传递非交互式标志（如 `-y`、`--no-input`、`echo y |`），避免等待用户输入
- 长时间运行的命令在后台执行

## 全流程（必须全部执行完毕）

### 阶段 1：分析与规划
1. 分析需求，读取 `.github/project-memory.md` 获取项目上下文
2. 搜索现有代码库，阅读相关模块代码，理解架构和约束
3. 制定结构化实施计划：
   - 需求理解（一句话）
   - 影响范围（涉及哪些文件/模块）
   - 方案对比（至少 2 个方案，表格对比优劣）
   - 选定方案的步骤分解（每步可验证）
4. **输出计划后立即开始实施，不停顿**

### 阶段 2：逐步实施
5. 按计划修改代码（用 `editFiles` 工具）
6. 需要文件/目录操作时，直接用 `terminalCommand` 执行（mkdir/mv/cp/rm 等）
7. **每完成一组相关修改后，根据项目类型执行构建验证**：
   - Swift/Xcode: `xcodebuild -project "Project.xcodeproj" -scheme "Scheme" build`
   - Python: `python -m pytest` 或 `ruff check .`
   - TypeScript: `npm run build` 或 `npm run lint`
   - Go: `go build ./...` 或 `go test ./...`
   - Rust: `cargo build` 或 `cargo clippy`
8. 构建失败→用 `problems` 查看错误→用 `editFiles` 修复→重新构建，循环直到成功
9. 遵循 `.github/copilot-instructions.md` 和项目特定规范

### 阶段 3：测试验证
10. **根据项目类型执行测试**：
    - Swift/Xcode: `xcodebuild test -project "Project.xcodeproj" -scheme "Scheme" -destination 'platform=macOS'`
    - Python: `pytest -v` 或 `python -m pytest tests/`
    - TypeScript: `npm test` 或 `jest --coverage`
    - Go: `go test ./... -v`
    - Rust: `cargo test`
11. 测试失败→用 `testFailure` 获取详情→修复→重新测试，循环直到通过
12. 若测试失败是环境问题（证书、权限等非代码问题），记录并跳过

### 阶段 4：自我审查
13. 审查所有修改：
    - 正确性：逻辑正确？边界情况处理？
    - 架构一致性：符合项目架构模式？
    - 代码质量：命名清晰？单一职责？无坏味道？
14. 发现问题→立即修复→重新构建验证

### 阶段 5：变更记录 & 总结
15. 用 `editFiles` 将变更追加到 `.github/docs/changelog/CHANGELOG.md`
16. 输出最终修改总结：
    - 修改了哪些文件，每个文件改了什么
    - 构建和测试状态
    - 需要注意的事项
