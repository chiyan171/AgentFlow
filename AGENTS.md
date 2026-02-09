# AGENTS.md - AgentFlow Development Guide

## 1. Project Overview
AgentFlow is a workflow system built on VS Code + GitHub Copilot.
**Stack**: Zsh (CLI), Markdown (Prompts/Docs), JSON (Config).
**Core Components**:
- `bin/agentflow`: Main CLI tool (Zsh script).
- `template/.github/`: The "brain" of AgentFlow (Agents, Prompts, Instructions) copied to user projects.
- `scripts/`: Install/Uninstall scripts.

## 2. Build & Test
Since this is a shell-script based tool, there is no compilation step.
**Verification Commands**:
- **Validate Config**: `bin/agentflow validate .` (Checks integrity of the current repo's template structure).
- **Check Status**: `bin/agentflow status`.
- **Manual Test**: Run `bin/agentflow init test_dir` to verify initialization logic.

## 3. Code Style & Conventions
**Language**: Zsh / Bash
- **Indentation**: 4 spaces.
- **Naming**: `snake_case` for functions (`init_project`, `validate_skill_name`).
- **Variables**: `UPPER_CASE` for globals (`AGENTFLOW_HOME`), `snake_case` for locals.
- **Comments**: **Must use Simplified Chinese** for all comments and user-facing output.
- **Banners**: Use `# ==================== Title ====================` for section separators.

**Documentation**:
- **CHANGELOG.md**: Must be updated for every functional change.
- **Docs Portal**: `docs/` contains the source of truth.

## 4. Development Workflow
- **Modifying CLI**: Edit `bin/agentflow`. Ensure it remains POSIX/Zsh compatible.
- **Modifying Agents**: Edit files in `template/.github/agents/`.
- **Modifying Instructions**: Edit `template/.github/copilot-instructions.md`.
  - **WARNING**: This file defines the AI's behavior. Changes here affect ALL users.
- **Safe Edits**: When editing `bin/agentflow`, always ensure the `show_help` function is updated if arguments change.

## 5. Core Philosophy (from copilot-instructions.md)
Agents working on this repo must adhere to the same principles AgentFlow enforces:
- **Ultrathink**: Deep reasoning before action.
- **Simplicity**: "Code that disappears is better than code that works."
- **Good Taste**: Eliminate special cases; use uniform abstractions.
- **Docs as Memory**: Architecture changes *must* be reflected in documentation.

## 6. Critical Constraints
- **No External Dependencies**: The CLI should rely only on standard tools (git, curl, sed, awk, python3 for json).
- **Idempotency**: Scripts should be re-runnable without side effects (check existence before creating).
- **Error Handling**: Use `set -e` where appropriate, or check return codes explicitly.
- **User Interaction**: Use `read -q` for Zsh confirmation prompts.

## 7. Directory Structure
```
AgentFlow/
├── bin/            # CLI executable
├── template/       # Source template for user projects
│   └── .github/    # Agents, Prompts, Instructions
├── docs/           # Documentation
└── scripts/        # Installation scripts
```
