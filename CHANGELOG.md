## [2026-02-11 18:33:35] refactor: make bin/agentflow POSIX compliant & update docs for max compatibility

### 变更文件:
```
M docs/USER_MANUAL.md
```

## [2026-02-11 18:26:03] Update documentation for Windows support, Global Docs Portal, and Git Workflow

### 变更文件:
```
M .github/scripts/agentflow.js
 M README.md
 M docs/USER_MANUAL.md
 D scripts/git-workflow.sh
?? bin/agentflow.cmd
?? bin/agentflow.ps1
?? scripts/git-workflow.js
```

## [2026-02-11 18:12:25] 配置 Git: 启用 .sisyphus 目录追踪 (共享 OpenCode AI 记忆)

### 变更文件:
```
 M .gitignore
?? .sisyphus/
?? src/
```

## [2026-02-11 18:07:11] 配置 Git 忽略规则以支持 AI 协作 (保留核心配置，忽略本地日志)

### 变更文件:
```
 M .gitignore
?? scripts/git-workflow.sh
```

# Changelog

All notable changes to AgentFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.1] - 2026-02-10

### Fixed
- 修复文档门户中的 CORS 问题，允许通过 file:// 协议离线访问。

## [2.0.0] - 2026-02-10

**AgentFlow 2.0.0 重大架构升级：Node.js 迁移与通用安装器**

> 此次更新带来了底层的彻底重构，从 Shell 脚本迁移至 Node.js，提供了更稳健的跨平台支持和更强大的扩展能力。

### 🚀 Major Changes

#### 1. Node.js 迁移 (Migration to Node.js)
- **核心重构**：CLI 工具从 Zsh 脚本完全重写为 Node.js 应用，显著提升了在 Windows 和复杂环境下的稳定性。
- **性能提升**：更快的启动速度和命令执行效率。
- **生态兼容**：更好地集成 npm 生态系统工具。

#### 2. 通用安装器 (Universal Installer)
- **统一分发**：支持通过 npm/yarn/pnpm 全局安装 (`npm install -g agentflow`)。
- **跨平台一致性**：确保 macOS, Linux, Windows (WSL/PowerShell) 拥有一致的安装体验。
- **零依赖**：内置所需运行时，不再依赖系统 Python 或特定 Shell 版本。

#### 3. 瘦包装器 (Thin Wrapper)
- **架构精简**：AgentFlow 现在作为一个轻量级的 "瘦包装器" (Thin Wrapper) 运行，专注于连接 VS Code、Copilot 和本地工具链。
- **低侵入性**：减少了对项目文件的直接修改，更多配置通过运行时注入。

#### 4. 卫生协议 (Hygiene Protocols)
- **严格规范**：引入了严格的代码和文档 "卫生协议"，确保生成的代码和文档符合最高质量标准。
- **自动清理**：CLI 包含自动清理和格式化功能，保持项目结构整洁。
- **最佳实践强制**：内置检查机制，防止 "屎山" 代码堆积。

### Added
- **核心定位文档**：📐 在 copilot-instructions.md 和 README 中明确 AgentFlow 的核心定位
  - **第一层（核心基础）**：完全建立在 VS Code + GitHub Copilot 之上
  - **第二层（衍生动机）**：因不满足 opencode、oh-my-opencode、vibing coding、git workflow 的局限性而诞生
  - **第三层（目标）**：在 VS Code + Copilot Chat 中获得所有 AI 编程工具的能力之和
  - **核心公式**：`AgentFlow = VS Code + Copilot + (opencode ∪ oh-my-opencode ∪ vibing ∪ git-workflow ∪ ...)`
  - **架构层次图**：清晰展示 VS Code → Copilot → AgentFlow 的层次关系
  - **共享机制表**：VS Code、Copilot、Skills、.github/ 的共享说明
- **Skills 模块**：🧠 完整的技能管理系统（三级架构）
  - **三级架构**：
    - **全局 Skills**：`~/.config/opencode/skills/`，与 opencode 共享共用共维护
    - **项目级 AgentFlow Skills**：`.github/skills/`，AgentFlow 独有，CLI 管理
    - **项目级 VS Code Skills**：`.github/instructions/*.instructions.md`，Copilot 原生机制
  - **自动触发**：三级 skills 都自动加载、自动触发
  - **CLI 命令**：
    - `agentflow skills list` - 列出所有 skills（三级）
    - `agentflow skills add <name>` - 创建项目级 AgentFlow skill
    - `agentflow skills add -g <name>` - 创建全局 skill（与 opencode 共享）
    - `agentflow skills edit <name>` - 编辑 skill
    - `agentflow skills show <name>` - 显示 skill 内容
    - `agentflow skills remove <name>` - 删除 skill
  - **SKILL.md 格式**：兼容 opencode 的 YAML frontmatter 格式
- **文档门户系统**：HTML 门户页面，统一管理所有文档
  - `index.html` - 可视化文档中心，分类展示
  - `manifest.json` - 文档清单，追踪版本和状态
  - 支持新增/更新/归档状态追踪
- **CLI trust 命令**：🔑 一键配置 VS Code 信任设置，消除 Allow 弹窗
  - 自动检测并更新用户全局 settings.json
  - 支持 macOS 和 Linux
  - 自动备份原设置
- **CLI docs-refresh 命令**：扫描文档目录，刷新 manifest.json
- **CLI portal 命令**：打开项目文档门户
- **CLI sync 命令**：`agentflow sync` 同步更新，保留用户自定义配置
- **init --force 选项**：强制重置但备份 project-memory.md 和 docs/
- **审查报告归档**：code-review.prompt.md 自动保存报告到 reports/
- **模板预置文件**：
  - `template/.github/docs/index.html` - 文档门户预置
  - `template/.github/docs/manifest.json` - 文档清单预置
  - `template/.github/docs/*/README.md` - 各目录说明文件

### Enhanced
- **增量更新机制**：`docs-refresh` 保留原有 `created` 时间戳
  - 解析现有 manifest.json 获取历史创建日期
  - 区分 "新增" 和 "更新" 文档
  - 统计显示新增/更新数量
- **全自动执行支持**：
  - VS Code 工作区设置预配置（.vscode/settings.json）
  - agentflow-trust.yml 增强权限说明
  - 安装脚本自动引导配置全局设置
- **文档分类目录**：
  - `plan/` - 开发计划（进行中）
  - `reports/` - 工作报告（bugfix/decision/analysis）
  - `references/` - 参考资料
  - `archive/` - 历史归档（已完成/废弃）
- **文档命名规范**：YYYY-MM-DD-类型-描述.md
- **增量迭代**：所有文档变更追踪到 manifest.json
- **update 命令**：显示版本信息、更新策略和详细指南
- **项目版本追踪**：init/sync 时复制 VERSION 到项目 .github/ 目录
- **copilot-instructions.md**：增强 documentation_management 部分

### Planned
- VS Code 扩展：原生 AgentFlow 管理界面
- 更多语言模板：Kotlin/C++/Scala 等

---

## [1.0.0] - 2026-02-08

**AgentFlow 首个正式版本发布 🎉**

> 🚀 AI 辅助开发工作流系统 | 基于 VS Code + GitHub Copilot  
> 达到 opencode + oh-my-opencode 的等价功能 | 支持任何语言/平台/架构

### Added

#### 🤖 5 专家 Agent 系统
- `@plan` - 需求分析、架构设计（Claude Sonnet 4）
- `@implement` - 代码实现、功能开发（Claude Sonnet 4）
- `@reviewer` - 代码审查、质量把关（Claude Sonnet 4）
- `@tester` - 测试编写、覆盖率提升（Claude Sonnet 4）
- `@debug` - 根因分析、问题诊断（Claude Opus 4）

#### 📝 7 工作流 Prompt
- `/auto` - 智能路由，自动选择合适的 Agent
- `/plan-and-execute` - 完整开发流程（Plan → Implement → Review）
- `/fix-bug` - Bug 修复流程（Debug → Implement → Review）
- `/add-feature` - 功能开发流程（Plan → Implement → Tester）
- `/code-review` - 代码审查流程（Reviewer → Implement）
- `/refactor` - 重构流程（Plan → Implement → Tester）
- `/generate-changelog` - 自动生成变更日志

#### 🧠 跨会话记忆
- `project-memory.md` - 项目上下文记忆，跨会话持久化
- 自动记录：架构决策、技术栈、关键路径

#### 📊 自动文档化
- `.github/docs/changelog/` - 变更日志自动生成
- `.github/docs/plan/` - 开发计划目录
- `.github/docs/reports/` - 工作报告目录

#### ⚙️ 多模型支持
- Claude Sonnet 4 / Opus 4
- GPT-4o
- Gemini 2.5 Pro

#### 📦 一键部署
- `agentflow init` - 项目级初始化
- `agentflow status` - 检查安装状态
- `agentflow validate` - 验证配置完整性
- 全局安装 + 项目级安装两种方式

#### 🌍 全栈通用
- 支持任何编程语言：Swift/Python/TypeScript/Go/Rust/Java/Kotlin/C++ 等
- 支持任何平台：macOS/Linux/Windows
- 支持任何架构：Web/Mobile/Desktop/CLI/Server

### Technical Details

#### 包结构
```
AgentFlow/
├── VERSION                    # 版本号
├── README.md                  # 说明文档
├── CHANGELOG.md               # 变更日志
├── docs/                      # 完整文档
├── bin/agentflow             # CLI 工具
├── scripts/                   # 安装脚本
└── template/                  # 配置模板
    ├── .github/
    │   ├── agents/           # 5 个 Agent 定义
    │   ├── prompts/          # 7 个 Prompt 定义
    │   ├── instructions/     # 代码规范
    │   ├── skills/           # 可复用技能
    │   ├── docs/             # 文档目录结构
    │   ├── agentflow.yml     # 模型配置
    │   ├── copilot-instructions.md  # 核心行为规范
    │   └── project-memory.md        # 项目记忆模板
    └── .vscode/
        └── settings.json     # VS Code 配置
```

#### 与 opencode + oh-my-opencode 功能对比

| 功能 | opencode | AgentFlow |
|------|----------|-----------|
| AI 对话 | 终端 CLI | VS Code Chat 面板 |
| Agent 定义 | oh-my-opencode.json | .github/agents/*.agent.md |
| Skills | ~/.config/opencode/skills/ | .github/skills/*/SKILL.md |
| 工作流 | commands | .github/prompts/*.prompt.md |
| 项目记忆 | .sisyphus/ | .github/project-memory.md |
| MCP 服务器 | oh-my-opencode.json | .vscode/mcp.json |

---

[Unreleased]: https://github.com/user/agentflow/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/user/agentflow/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/user/agentflow/releases/tag/v1.0.0
