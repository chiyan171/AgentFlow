# AGENTS.md - AgentFlow Development Guide

## 1. Project Identity & Philosophy
**AgentFlow** is a workflow orchestration system built strictly on **VS Code + GitHub Copilot**.
We do not build a new IDE. We do not build a new LLM. We build the **workflow** that makes them powerful.

### Core Principles (The "Tao" of AgentFlow)
- **Ultrathink First**: Agents must reason deeply before acting. "Measure twice, cut once."
- **Simplicity**: Code that disappears is better than code that works. Avoid over-engineering.
- **Good Taste**: Uniform abstractions over special cases. If you see `if/else` chains, refactor.
- **Docs as Memory**: Architecture changes *must* be reflected in `docs/` and `CHANGELOG.md`.
- **Text-Based Configuration**: No databases. Everything is Markdown (`.md`), YAML (`.yml`), or JSON (`.json`).

## 2. System Architecture

### 2.1 Directory Structure
```
AgentFlow/
├── bin/                    # CLI executable (Zsh script)
│   └── agentflow           # Main entry point
├── template/               # The "Brain" (Copied to user projects)
│   └── .github/
│       ├── agents/         # 5 Expert Agents (@plan, @implement, etc.)
│       ├── prompts/        # 7 Workflow Prompts (/auto, /fix-bug, etc.)
│       ├── instructions/   # VS Code Native Skills (copilot instructions)
│       ├── skills/         # AgentFlow Project Skills
│       ├── docs/           # Documentation System (manifest.json, index.html)
│       ├── agentflow.yml   # Model Configuration
│       ├── copilot-instructions.md # Global Behavior Rules
│       └── project-memory.md # Long-term Context
├── docs/                   # AgentFlow Self-Documentation
└── scripts/                # Installation/Uninstallation scripts
```

### 2.2 Three-Tier Skills Architecture
AgentFlow enforces a strict hierarchy for skills (reusable knowledge):
1.  **Global Skills** (`~/.config/opencode/skills/`): Shared across all projects. Managed via `agentflow skills add -g`.
2.  **Project Skills** (`.github/skills/`): Specific to the current project. Managed via `agentflow skills add`.
3.  **Native Skills** (`.github/instructions/*.instructions.md`): VS Code/Copilot native instructions.

### 2.3 Documentation System
The system automatically tracks documentation via `.github/docs/manifest.json`.
- **Manifest**: Tracks status (`active`, `archived`), type (`plan`, `report`), and timestamps.
- **Portal**: `index.html` renders the manifest into a usable dashboard.
- **CLI**: `agentflow docs-refresh` updates the manifest using embedded Python scripts.

## 3. Development Workflow

### 3.1 Modifying the CLI (`bin/agentflow`)
- **Language**: Pure Zsh (POSIX compatible where possible).
- **Dependencies**: `git`, `curl`, `sed`, `awk`, `python3` (for robust JSON handling).
- **Style**:
    - Indentation: 4 spaces.
    - Naming: `snake_case` for functions (`init_project`), `UPPER_CASE` for globals.
    - Error Handling: Use `set -e` carefully. Check return codes.
    - UI: Use emojis for status (`✅`, `❌`, `⚠️`, `📦`). Output must be in **Simplified Chinese**.
    - Idempotency: All commands must be safe to re-run. Check existence before creating.

### 3.2 Modifying Agents (`template/.github/agents/`)
- Agents are defined in Markdown files (`.agent.md`).
- They *must* have a clear Role, Goal, and Interaction Protocol.
- They *must* reference the `project-memory.md` for context.

### 3.3 Configuration (`template/.github/agentflow.yml`)
- Defines model mappings (e.g., `primary: "Claude Sonnet 4.5 (copilot)"`).
- When adding new models, update this file and the validation logic in `bin/agentflow`.

## 4. Build & Verification

### 4.1 No Compilation
There is no build step. The `bin/agentflow` script is executed directly.

### 4.2 Verification Commands
Run these from the repo root to verify changes:

```bash
# 1. Static Analysis (Manual)
# Check for syntax errors in CLI
zsh -n bin/agentflow

# 2. Self-Validation
# Verifies the template structure integrity
bin/agentflow validate .

# 3. Functional Test (Sandbox)
# Create a test directory and initialize
mkdir -p test_sandbox
bin/agentflow init test_sandbox
# Check if files were copied correctly
ls -R test_sandbox/.github
# Clean up
rm -rf test_sandbox
```

### 4.3 Python Integration
For JSON manipulation (e.g., `settings.json`, `manifest.json`), use `python3 -c` or HEREDOCs within Zsh.
- **Do NOT** use `jq` (to avoid external dependency).
- **Do** ensure Python code handles exceptions (try/except).

## 5. Critical Constraints for Agents
If you are an AI agent working on this repo:
1.  **Do NOT** introduce binary dependencies.
2.  **Do NOT** change the `template/.github/copilot-instructions.md` without extreme caution (it affects all users).
3.  **Do NOT** use English for CLI output; use Simplified Chinese.
4.  **ALWAYS** run `bin/agentflow validate .` after changing the template structure.
5.  **ALWAYS** update `CHANGELOG.md` for functional changes.

## 6. Common Tasks & Snippets

### Adding a new CLI command
1.  Define function `handle_my_command` in `bin/agentflow`.
2.  Add case in the main `case` statement at the bottom.
3.  Update `show_help` function.

### Updating the Documentation Portal
The logic resides in `refresh_docs_portal` in `bin/agentflow`. It generates HTML from `manifest.json`.
- Keep the HTML/CSS in the HEREDOC simple and responsive.
- Do not use external CDNs for CSS/JS (keep it offline-capable).

## 7. Versioning
- `VERSION` file contains the semantic version (e.g., `1.0.0`).
- When releasing:
    1. Update `VERSION` file.
    2. Update `bin/agentflow` header.
    3. Update `CHANGELOG.md`.
    4. Run `scripts/install-global.sh` to test upgrade.
