# Draft: AgentFlow Docs Portal Upgrade

## Initial Analysis
- **Goal**: Upgrade `agentflow docs` with Global Indexing (scan root) and Smart Preview (HTML renderer).
- **Current Architecture**: `bin/agentflow` (Zsh + Python3). No Node.js dependency listed in `AGENTS.md`.
- **Constraint Conflict**: User mentioned "Node.js glob/fs" but project philosophy is "No binary dependencies" and strict Zsh/Python.
- **Technical Challenge**: Client-side `fetch('file://...')` is blocked by CORS in modern browsers. Opening `viewer.html` directly from disk won't work for fetching other local files unless we use a server or embed data.

## Open Questions
1. **Tech Stack**: Stick to Zsh/Python (compliant) or introduce Node.js (user request)?
2. **Preview Mechanism**: How to bypass local CORS?
   - Option A: `agentflow docs-serve` (Python HTTP server)
   - Option B: Embed ALL doc content into a `.js` file during refresh (Static, no server needed, but scales poorly with large docs)
   - Option C: User accepts "allow file access" browser flags (Bad UX)
3. **Markdown Library**: `marked.js` or `markdown-it` (via CDN or bundled?). Since it's local, we might need to bundle a single file or rely on internet access for CDN.

## Scope
- IN: Global scan of `.md` files.
- IN: `viewer.html` for rendering.
- IN: Exclude `node_modules`, `.git`, `dist`, `build`.
