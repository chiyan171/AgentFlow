---
applyTo: "**"
---

# 项目上下文指令

**每次会话开始时，必须**：

1. 读取 `.github/project-memory.md` 获取项目上下文
2. 读取 `.github/agentflow.yml` 获取模型配置
3. 根据项目类型适配工作方式

## 跨平台支持

AgentFlow 适用于任何语言/平台/架构：
- **语言**：Swift / Python / TypeScript / Go / Rust / Java / Kotlin / C++ / C# / Ruby / PHP
- **平台**：iOS / macOS / Android / Web / Server / Desktop / Embedded
- **架构**：单体 / 微服务 / Serverless / 混合

## 跨会话记忆

`.github/project-memory.md` 是跨会话持久化文件：
- **读取**：每次会话开始时自动加载
- **写入**：完成重要任务后更新学习记录
- **内容**：项目架构、技术栈、重要约定、学习经验

### 更新时机
- 发现项目重要特性时
- 完成架构决策时
- 遇到并解决坑时
- 完成重大功能开发时
