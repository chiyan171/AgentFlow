# AgentFlow v1.0.0

> 🚀 AI 辅助开发工作流系统 | 完全建立在 VS Code + GitHub Copilot 之上  
> 在熟悉的 IDE 里，用熟悉的 Chat，获得所有 AI 编程工具的能力
> 
> ![Windows Support](https://img.shields.io/badge/Windows-Supported-blue) ![macOS Support](https://img.shields.io/badge/macOS-Supported-green) ![Linux Support](https://img.shields.io/badge/Linux-Supported-orange)

## 🎯 为什么需要 AgentFlow？

**核心基础**：AgentFlow 完全建立在 VS Code + GitHub Copilot 之上，这是不可动摇的基础。

**衍生动机**：现有 AI 编程工具各有精彩，但也各有局限：
- **opencode** - 优秀的终端 AI，但脱离了 IDE 的全部能力
- **oh-my-opencode** - 增强了 opencode，但仍困在终端里
- **vibing coding** - 有趣的编程体验，但缺乏结构化工作流
- **git workflow** - 规范的版本控制，但没有 AI 深度集成

**AgentFlow 的答案**：在 VS Code + Copilot Chat 中，获得所有这些工具的能力之和：

```
AgentFlow = VS Code + Copilot + (opencode ∪ oh-my-opencode ∪ vibing ∪ git-workflow ∪ ...)
```

## ✨ 核心特性

- 🤖 **5 专家 Agent**: Plan / Implement / Reviewer / Tester / Debug
- 🧠 **Skills 系统**: 三级架构（全局共享 + 项目级 AgentFlow + VS Code 原生）
- 📝 **7 工作流 Prompt**: /auto /fix-bug /add-feature /code-review /refactor /plan-and-execute /generate-changelog
- 🧠 **跨会话记忆**: project-memory.md 永久上下文
- 📊 **自动文档化**: CHANGELOG、开发计划、工作报告自动生成
- ⚙️ **多模型支持**: Claude Sonnet 4 / Opus 4 / GPT-4o / Gemini 2.5 Pro
- 🔄 **Agent 流转**: 自动调度适合的专家完成任务
- 📦 **一键部署**: 全局安装 + 项目级初始化
- 🪟 **Windows 支持**: 原生支持 Windows (.cmd/.ps1)，跨平台无缝体验
- 📚 **全局知识库**: `agentflow docs-refresh` 一键索引所有文档，提供离线阅读器
- 🌍 **全栈通用**: Swift/Python/TypeScript/Go/Rust/Java/Kotlin/C++ 均适用

## 🚀 快速开始

### 方式 1：全局安装（推荐）

#### macOS / Linux
```bash
# 1. 全局安装 AgentFlow
cd AgentFlow-Package
./scripts/install-global.sh

# 2. 使环境变量生效
source ~/.zshrc

# 3. 在任意项目中初始化
cd /path/to/your/project
agentflow init

# 4. 用 VS Code 打开项目，开始使用
code .
```

#### Windows
```cmd
:: 1. 全局安装 AgentFlow
cd AgentFlow-Package
.\scripts\install-global.cmd

:: 2. 在任意项目中初始化
cd \path\to\your\project
agentflow init

:: 3. 用 VS Code 打开项目，开始使用
code .
```

### 方式 2：项目级安装

```bash
# 在项目目录中直接安装
cd /path/to/your/project
/path/to/AgentFlow-Package/scripts/install-project.sh
```

## 📦 包结构

```
AgentFlow/
├── VERSION                         # 版本号 1.0.0
├── README.md                       # 本文件
├── CHANGELOG.md                    # 正式变更日志
├── docs/                           # 📚 完整文档
│   ├── INTEGRATION_GUIDE.md       # 集成教程（10 分钟上手）
│   ├── USER_MANUAL.md             # 操作手册（详尽参考）
│   ├── COMPARISON.md              # 竞品对比（vs opencode/Cursor/Claude）
│   ├── VERSION_HISTORY.md         # 版本迭代记录
│   └── ROADMAP.md                 # 🚀 产品路线图
├── bin/
│   └── agentflow                   # CLI 工具
├── scripts/
│   ├── install-global.sh           # 全局安装脚本
│   ├── install-project.sh          # 项目级安装脚本
│   └── uninstall.sh                # 卸载脚本
└── template/                       # 配置模板（复制到项目）
    ├── .github/
    │   ├── agents/                 # 5 个专家 Agent 定义
    │   ├── prompts/                # 7 个工作流 Prompt
    │   ├── instructions/           # 代码规范与项目约束
    │   ├── docs/
    │   │   ├── agentflow/          # AgentFlow 框架文档
    │   │   ├── changelog/          # 变更日志目录
    │   │   ├── plan/               # 开发计划目录
    │   │   ├── reports/            # 工作报告目录
    │   │   └── references/         # 参考资料目录
    │   ├── agentflow.yml           # 模型配置中枢
    │   ├── copilot-instructions.md # 核心行为规范（ultrathink 深度思考）
    │   └── project-memory.md       # 项目记忆（跨会话上下文）
    └── .vscode/
        └── settings.json           # VS Code 配置

```

## 🎯 使用方式

### Agent 调用（@ 提及）

在 Copilot Chat 中选择或提及：

| Agent | 模型 | 用途 | 示例 |
|-------|------|------|------|
| `@plan` | Claude Sonnet 4 | 需求分析、架构设计 | `@plan 设计用户登录模块` |
| `@implement` | Claude Sonnet 4 | 代码实现 | `@implement 实现登录接口` |
| `@reviewer` | Claude Sonnet 4 | 代码审查 | `@reviewer 审查这段代码` |
| `@tester` | Claude Sonnet 4 | 测试编写 | `@tester 为登录功能写测试` |
| `@debug` | Claude Opus 4 | 根因分析、问题诊断 | `@debug 为什么登录失败？` |

### 工作流 Prompt（/ 斜杠命令）

输入 `/` 选择预设工作流：

| 命令 | 功能 | 调度链 | 适用场景 |
|------|------|--------|----------|
| `/auto` | 智能路由 | 自动选择 Agent | 不确定找谁时 |
| `/plan-and-execute` | 完整开发流 | Plan → Implement → Review | 新功能从 0 到 1 |
| `/fix-bug` | Bug 修复 | Debug → Implement → Review | 已知 Bug 修复 |
| `/add-feature` | 功能开发 | Plan → Implement → Tester | 增量功能开发 |
| `/code-review` | 代码审查 | Reviewer → Implement | 代码质量检查 |
| `/refactor` | 代码重构 | Plan → Implement → Tester | 优化现有代码 |
| `/generate-changelog` | 生成日志 | 直接执行 | 发版前生成 CHANGELOG |

## 🛠️ CLI 命令

```bash
agentflow init [目录]      # 初始化 AgentFlow（默认当前目录）
agentflow version          # 显示版本号
agentflow update           # 更新到最新版本
agentflow status           # 检查安装状态
agentflow validate [目录]  # 验证配置完整性
agentflow docs             # 打开文档目录
agentflow help             # 显示帮助
```

## 📚 完整文档

| 文档 | 说明 | 位置 |
|------|------|------|
| **集成教程** | 10 分钟快速上手 | [docs/INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md) |
| **操作手册** | 详细功能参考 | [docs/USER_MANUAL.md](docs/USER_MANUAL.md) |
| **竞品对比** | vs opencode/Cursor/Claude | [docs/COMPARISON.md](docs/COMPARISON.md) |
| **版本历史** | 迭代记录 | [docs/VERSION_HISTORY.md](docs/VERSION_HISTORY.md) |
| **框架文档** | 5286 行完整指南 | [template/.github/docs/agentflow/](template/.github/docs/agentflow/) |

## 🗑️ 卸载

```bash
./scripts/uninstall.sh
```

## 🆚 为什么选择 AgentFlow？

| 维度 | AgentFlow | opencode | Cursor | Claude Desktop |
|------|-----------|----------|--------|---------------|
| **成本** | 免费（Copilot 订阅） | 免费 | $20/月 | $20/月 |
| **模型** | Claude Sonnet 4 / Opus 4 | GPT-4 | GPT-4 / Claude | Claude 3.5 |
| **多 Agent** | ✅ 5 个专家 | ✅ 自定义 | ❌ 单一 | ❌ 单一 |
| **工作流** | ✅ 7 个预设 | ✅ Skill | ⚠️ 有限 | ❌ 无 |
| **文档管理** | ✅ 自动生成 | ⚠️ 需配置 | ❌ 无 | ❌ 无 |
| **IDE 集成** | ✅ VS Code 原生 | ✅ VS Code | ✅ 独立 IDE | ❌ 独立应用 |
| **项目记忆** | ✅ project-memory.md | ✅ .sisyphus | ⚠️ 有限 | ❌ 无 |
| **本地优先** | ✅ 全本地配置 | ✅ | ⚠️ 云端为主 | ❌ 云端 |

**AgentFlow = VS Code + GitHub Copilot 实现 opencode + oh-my-opencode 全部功能**：
- 💰 无额外成本（已有 Copilot 订阅即可）
- 🤖 多 Agent 协作，专家分工
- 📝 自动文档化，知识沉淀
- 🔒 配置全本地，安全可控
- 🌍 全栈通用，任何语言/平台

详细对比见 [docs/COMPARISON.md](docs/COMPARISON.md)

## 📖 文档导航

- **快速入门**: [docs/INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md) - 10 分钟快速上手
- **完整手册**: [docs/USER_MANUAL.md](docs/USER_MANUAL.md) - 详尽功能参考
- **竞品对比**: [docs/COMPARISON.md](docs/COMPARISON.md) - vs opencode/Cursor/Claude 等
- **版本历史**: [docs/VERSION_HISTORY.md](docs/VERSION_HISTORY.md) - 演化轨迹
- **产品路线图**: [docs/ROADMAP.md](docs/ROADMAP.md) - 未来规划
- **变更日志**: [CHANGELOG.md](CHANGELOG.md) - 每个版本的详细变更

## �📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**快速链接**：  
[集成教程](docs/INTEGRATION_GUIDE.md) | [操作手册](docs/USER_MANUAL.md) | [竞品对比](docs/COMPARISON.md) | [版本历史](docs/VERSION_HISTORY.md)
