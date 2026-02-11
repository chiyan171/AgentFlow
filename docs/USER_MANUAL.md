# AgentFlow 操作手册

> 📖 完整功能参考与最佳实践  
> 版本：v1.0.0 | 更新：2026-02-08

---

## 快速导航

- [Agent 系统](#agent-系统) - 5 个专家 Agent 使用指南
- [Prompt 工作流](#prompt-工作流) - 7 个预设工作流
- [CLI 命令](#cli-命令) - 命令行工具完整参考
- [跨平台支持](#跨平台支持) - Windows / macOS / Linux
- [文档门户](#文档门户) - 全局知识库与离线阅读
- [Git 工作流](#git-工作流) - 自动化提交与更新
- [配置管理](#配置管理) - agentflow.yml / project-memory.md
- [最佳实践](#最佳实践) - 日常开发推荐流程
- [故障排查](#故障排查) - 常见问题解决方案

---

## Agent 系统

### 5 个专家 Agent

| Agent | 模型 | 职责 | 使用场景 |
|-------|------|------|----------|
| **@plan** | Claude Sonnet 4 | 需求分析、架构设计 | 新功能设计、技术选型、方案对比 |
| **@implement** | Claude Sonnet 4 | 代码实现 | 编写代码、修改文件、执行构建 |
| **@reviewer** | Claude Sonnet 4 | 代码审查 | 质量检查、安全审计、性能分析 |
| **@tester** | Claude Sonnet 4 | 测试编写 | 单元测试、集成测试、覆盖率分析 |
| **@debug** | Claude Opus 4 | 根因分析 | Bug 诊断、性能问题、系统故障 |

### 使用方式

```
@plan 设计用户权限管理模块
@implement 实现上述权限接口
@reviewer 审查 auth.ts 的安全性
@tester 为登录功能编写测试
@debug 为什么数据库查询这么慢？
```

---

## Prompt 工作流

### 7 个预设 Prompt

| Prompt | 调度链 | 示例 |
|--------|--------|------|
| `/auto` | 自动识别 → 调度 Agent | `/auto 优化首页加载速度` |
| `/plan-and-execute` | Plan → Implement → Review → Test | `/plan-and-execute 实现 OAuth 登录` |
| `/fix-bug` | Debug → Implement → Review | `/fix-bug 用户上传文件失败` |
| `/add-feature` | Plan → Implement → Test | `/add-feature 增加导出 PDF 功能` |
| `/code-review` | Review → Implement | `/code-review 审查 payment.ts` |
| `/refactor` | Plan → Implement → Test | `/refactor UserController 太臃肿` |
| `/generate-changelog` | 直接执行 | `/generate-changelog 生成 v2.0.0 日志` |

---

## CLI 命令

### agentflow init

```bash
agentflow init [目录]         # 初始化项目
agentflow init --force         # 强制覆盖
agentflow init --minimal       # 最小化安装
```

### agentflow version

```bash
agentflow version              # 显示版本：1.0.0
```

### agentflow status

```bash
agentflow status               # 检查安装状态
```

**输出示例**：
```
✅ Agents: 5/5
✅ Prompts: 7/7
✅ Configuration: Valid
⚠️  project-memory.md: 50% complete
```

### agentflow update

```bash
agentflow update               # 更新到最新版本
```

### agentflow validate

```bash
agentflow validate             # 验证配置完整性
```

### agentflow docs

```bash
agentflow docs                 # 打开文档目录
```

### agentflow docs-refresh

```bash
agentflow docs-refresh         # 刷新全局文档索引
```

**功能**：
- 扫描项目中所有 Markdown 文件
- 生成 `docs/manifest.json` 索引
- 更新 `docs/index.html` 离线阅读器
- 提供统一的知识库入口

---

## 💻 跨平台支持

AgentFlow v1.0.0+ 实现了工业级的跨平台兼容性，原生支持 Windows、macOS 和 Linux。

### Windows 支持 (Native)
- **CMD/PowerShell**: 原生支持，无需 WSL 或 Git Bash。
- **安装脚本**: `scripts\install-global.cmd`
- **CLI**: `bin\agentflow.cmd` 自动调用核心逻辑。
- **路径兼容**: 自动处理 `\` 和 `/` 路径分隔符，确保文件操作准确。

### macOS / Linux 支持 (POSIX Compliant)
- **标准 Shell**: 核心脚本 `bin/agentflow` 采用标准 `/bin/sh` 编写，移除对 `zsh` 的依赖。
- **广泛兼容**: 支持 Alpine Linux、Ubuntu Minimal 等精简环境。
- **权限管理**: 安装过程自动处理 `chmod +x`。

---

## 📚 文档门户 (Global Knowledge Hub)

AgentFlow 提供了一个内置的文档门户，用于集中管理和阅读项目文档。

### 核心功能
1.  **全局索引**: `agentflow docs-refresh` 命令会自动扫描 `docs/`、`.github/docs/` 以及项目根目录下的所有 Markdown 文件。
2.  **离线阅读**: 生成的 `docs/index.html` 是一个单页应用 (SPA)，无需联网即可使用。
3.  **分类管理**: 自动识别文档类型（计划、报告、参考资料等）并分类展示。

### 使用方法
1.  运行 `agentflow docs-refresh` 更新索引。
2.  打开 `docs/index.html` (或运行 `agentflow docs`) 在浏览器中查看。

---

## 🔄 Git 工作流自动化

为了规范团队协作，AgentFlow 提供了 `scripts/git-workflow.js` 脚本来自动化 Git 操作。

### 提交代码 (Submit)

```bash
node scripts/git-workflow.js submit "你的提交信息"
```

**流程**：
1.  自动生成 CHANGELOG 条目。
2.  执行 `git add .`。
3.  执行 `git commit`。
4.  执行 `git pull --rebase` (自动处理 master/main 分支)。
5.  执行 `git push`。

### 更新代码 (Update)

```bash
node scripts/git-workflow.js update
```

**流程**：
1.  自动 `git stash` 保存本地修改。
2.  执行 `git pull --rebase` 拉取远程更新。
3.  自动 `git stash pop` 恢复本地修改。

---

## 配置管理

### agentflow.yml（模型配置）

```yaml
agents:
  primary:
    model: claude-sonnet-4.5
    temperature: 0.7
  advanced:
    model: claude-opus-4.5
    temperature: 0.5
```

**切换模型**：
```yaml
primary:
  model: gpt-5.2              # 或 gemini-2.5-pro
```

### project-memory.md（项目记忆）

**必填字段**：
- 基本信息（项目名称、技术栈）
- 架构概览（MVVM / MVC）
- 核心模块（路径、职责）
- 构建与测试（命令）
- 重要约定（代码规范）

**作用**：
- AI 每次对话自动加载项目上下文
- 避免重复解释"我们用什么框架"
- 生成代码更符合项目规范

---

## 最佳实践

### Bug 修复流程

```
1. /fix-bug 描述问题（附错误日志）
2. @debug 分析根因
3. @implement 修复代码
4. @reviewer 审查修复
5. @tester 补充回归测试
6. /generate-changelog 记录变更
```

### 新功能开发流程

```
1. /add-feature 描述需求
2. @plan 设计方案
3. @implement 分阶段实现（先 MVP）
4. @tester 编写测试
5. @reviewer 最终审查
6. /generate-changelog 记录变更
```

### 代码审查流程

```
1. /code-review 指定文件
2. @reviewer 全面检查
3. @implement 修复问题
4. @tester 补充测试
5. 再次 /code-review 确认
```

### 重构流程

```
1. /refactor 指定模块
2. @plan 识别坏味道 + 设计目标结构
3. @implement 小步快跑重构
4. @tester 确保测试通过
5. @reviewer 验证改进效果
```

---

## 故障排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Agent 不可用 | VS Code 未识别 | `Cmd+Shift+P` → `Reload Window` |
| Prompt 不生效 | 文件格式错误 | 检查 YAML front matter |
| project-memory.md 不加载 | 路径错误 | 确保在 `.github/` 目录 |
| 终端无法执行 | 权限未启用 | 设置 `executeCommand.enabled: true` |
| 响应慢 | 使用 Opus 或输入过多 | 切换 Sonnet，精简 project-memory.md |
| 成本高 | 频繁调用 Opus | 配置 costControl 限额 |

---

## 高级技巧

### Agent 链式调用

```
@plan 设计支付模块
（完成后）
@implement 按上述方案实现
（完成后）
@reviewer 审查支付安全性
（完成后）
@tester 编写支付测试
```

### 上下文引用

```
@plan 基于 project-memory.md 的架构，增加权限模块
@implement 参考 user.service.ts 的写法，实现 role.service.ts
```

### 多文件操作

```
@implement 重构以下文件：
1. UserController.ts → 拆分为 Controller + Service
2. RoleController.ts → 同样拆分
3. 创建 BaseController.ts 提取公共逻辑
```

---

## 文档体系

| 文档 | 说明 |
|------|------|
| [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) | 10 分钟集成教程 |
| [USER_MANUAL.md](USER_MANUAL.md) | 本文档 |
| [COMPARISON.md](COMPARISON.md) | 竞品对比 |
| [VERSION_HISTORY.md](VERSION_HISTORY.md) | 版本迭代记录 |

---

**AgentFlow v1.0.0 操作手册 | 2026-02-08**
