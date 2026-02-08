# AgentFlow 集成教程

> 🚀 10 分钟从零到上手 AgentFlow
> 版本：v1.0.0 | 更新：2026-02-08

---

## 目标读者

- 新项目想集成 AI 辅助开发
- 现有项目想提升开发效率
- 团队想标准化 AI 协作流程

## 前置条件

| 分类 | 项目 | 说明 |
|------|------|------|
| ✅ 必需 | VS Code | 最新稳定版 |
| ✅ 必需 | GitHub Copilot | 个人 $10/月 或企业版 |
| ✅ 必需 | macOS / Linux / WSL | zsh 或 bash |
| ⚠️ 可选 | Git | 版本管理 |
| ⚠️ 可选 | Xcode / Node.js / Python | 根据项目语言 |

---

## 🚀 Step 1：全局安装（5 分钟）

### 1.1 获取安装包

```bash
# 方式 A：从 Git 仓库
git clone <agentflow-repo-url>
cd AgentFlow-Package

# 方式 B：解压离线包
unzip AgentFlow-v1.0.0.zip
cd AgentFlow
```

### 1.2 执行安装

```bash
./scripts/install-global.sh
```

**安装过程**：
1. 检测环境（OS、Shell、VS Code、Copilot）
2. 备份已有安装（如存在）
3. 复制模板到 `~/.agentflow/`
4. 安装 CLI 到 `~/.agentflow/bin/agentflow`
5. 写入环境变量到 `~/.zshrc`
6. 自动验证安装

### 1.3 使环境生效

```bash
source ~/.zshrc
```

### 1.4 验证

```bash
agentflow version   # → 1.0.0
agentflow status    # → 检查所有组件状态
```

✅ **全局安装完成**

---

## 📦 Step 2：项目初始化（3 分钟）

### 2.1 进入项目

```bash
cd /path/to/your/project
```

### 2.2 初始化

```bash
agentflow init
```

### 2.3 生成结构

```
your-project/
├── .github/
│   ├── agents/                 # 5 个专家 Agent
│   │   ├── plan.agent.md       #   需求分析、架构设计
│   │   ├── implement.agent.md  #   代码实现
│   │   ├── reviewer.agent.md   #   代码审查
│   │   ├── tester.agent.md     #   测试编写
│   │   └── debug.agent.md      #   根因分析
│   ├── prompts/                # 7 个工作流
│   │   ├── auto.prompt.md
│   │   ├── plan-and-execute.prompt.md
│   │   ├── fix-bug.prompt.md
│   │   ├── add-feature.prompt.md
│   │   ├── code-review.prompt.md
│   │   ├── refactor.prompt.md
│   │   └── generate-changelog.prompt.md
│   ├── instructions/           # 代码规范
│   ├── docs/                   # 文档体系
│   │   ├── agentflow/          #   框架文档（5286 行）
│   │   ├── changelog/          #   变更日志
│   │   ├── plan/               #   开发计划
│   │   ├── reports/            #   工作报告
│   │   └── references/         #   参考资料
│   ├── agentflow.yml           # 模型配置
│   ├── copilot-instructions.md # 行为规范
│   └── project-memory.md       # 项目记忆（⭐ 重要）
└── .vscode/
    └── settings.json
```

### 2.4 配置项目记忆（⭐ 核心步骤）

编辑 `.github/project-memory.md`：

```markdown
# 项目记忆：MyProject

## 基本信息
- **项目名称**：MyProject
- **技术栈**：TypeScript / React / Node.js
- **构建系统**：npm / vite
- **最低版本**：Node 20+

## 架构概览
MVVM 架构 + 微前端

## 核心模块
| 模块 | 路径 | 职责 |
|------|------|------|
| UI | src/views/ | 视图层 |
| Services | src/services/ | 业务逻辑 |
| Models | src/models/ | 数据模型 |

## 构建与测试
npm run build
npm test

## 重要约定
- ESLint + Prettier
- 组件使用函数式
- 中文注释
```

**为什么要填写？**
- AI 每次对话都自动加载项目上下文
- 避免重复解释"我们用什么框架""命名规范是什么"
- 代码生成更符合项目风格

### 2.5 可选：启用终端执行

```json
// VS Code settings.json
{
  "github.copilot.chat.executeCommand.enabled": true
}
```

---

## 🎯 Step 3：开始使用（2 分钟）

### 3.1 打开 VS Code

```bash
code .
```

### 3.2 打开 Copilot Chat

`Cmd+Shift+I`（macOS）或 `Ctrl+Shift+I`

### 3.3 测试

```
@plan 你好，分析一下这个项目的架构
```

```
/auto 帮我找到项目中的 TODO 注释
```

✅ **AgentFlow 就绪**

---

## 🎓 Step 4：实战场景

### 修复 Bug
```
/fix-bug 用户登录时报 500 错误
```
调度链：Debug → Implement → Reviewer

### 新功能
```
/add-feature 增加用户头像上传功能
```
调度链：Plan → Implement → Tester

### 代码审查
```
/code-review 审查 src/services/auth.ts
```
调度链：Reviewer → Implement

### 完整开发流
```
/plan-and-execute 实现 OAuth 2.0 登录
```
调度链：Plan → Implement → Reviewer → Tester

### 重构
```
/refactor UserController 太臃肿
```
调度链：Plan → Implement → Tester

---

## 🔧 常见问题

### Q1：找不到 agentflow 命令

```bash
source ~/.zshrc
# 或手动：export PATH="$HOME/.agentflow/bin:$PATH"
```

### Q2：Copilot Chat 看不到 Agent

1. `Cmd+Shift+P` → `Reload Window`
2. 检查 `.github/agents/*.agent.md` 格式

### Q3：Agent 不遵循项目规范

完善 `.github/project-memory.md` + `.github/instructions/*.instructions.md`

### Q4：切换模型

编辑 `.github/agentflow.yml`：
```yaml
agents:
  primary:
    model: gpt-5.2  # 或 gemini-2.5-pro
```

---

## ✅ 检查清单

- [ ] 全局安装 `agentflow version → 1.0.0`
- [ ] 项目初始化 `agentflow init`
- [ ] 填写 `project-memory.md`
- [ ] 测试 `@plan` Agent
- [ ] 测试 `/auto` Prompt
- [ ] 在真实任务中使用

---

## 📖 下一步

| 文档 | 说明 |
|------|------|
| [USER_MANUAL.md](USER_MANUAL.md) | 详细操作手册 |
| [COMPARISON.md](COMPARISON.md) | 竞品对比 |
| [VERSION_HISTORY.md](VERSION_HISTORY.md) | 版本记录 |
