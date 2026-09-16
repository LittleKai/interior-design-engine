# Instructions for Claude Code

---

## CORE PRINCIPLE

Read PROJECT_SUMMARY.md FIRST, not the entire codebase.
Update documentation AFTER every change.

---

## BEFORE ANY TASK

### 1. Read (in order):
```
.claude/PROJECT_SUMMARY.md     -> Project state, architecture, active features
Specific files user mentioned  -> Only if needed for implementation
```

### 2. DON'T Read:
- Entire project folders just to "understand project"
- Files already summarized in PROJECT_SUMMARY.md
- Generated downloads or AI export outputs unless requested

---

## AFTER ANY TASK

### Update PROJECT_SUMMARY.md

**Always update:**
- Section 4: Feature status
- Section 5: Mark completed TODOs or add new ones

**Update if changed:**
- Section 2: New files or dependencies

**CRITICAL:** PROJECT_SUMMARY.md chỉ phản ánh trạng thái hiện tại của dự án. Không dùng PROJECT_SUMMARY.md để ghi lịch sử thay đổi, changelog, recent changes, hoặc bug-fix log. Git history là nguồn lịch sử thay đổi.

---

## READING PRIORITY

```
1. ALWAYS    -> .claude/PROJECT_SUMMARY.md
2. IF NEEDED -> Files mentioned in user request
3. RARELY    -> Other source files
```

---

## SPECIAL CASES

**"Review entire project"** -> Exception: read all files and update full summary.  
**Summary outdated?** -> Ask user before proceeding.  
**Major refactor** -> Update Section 2 and architecture notes completely.  
**PROJECT_SUMMARY.md does not exist?** -> Treat as "Review entire project" and recreate it.

---

## Project Quick Reference

**Tech Stack:** Static HTML/CSS/JavaScript, SVG, Canvas.

**Key Files:**
- `interior-design-engine.js` - reusable rendering/export library.
- `interior-design-engine.css` - styles for tabs, drawings, specs, and AI export panel.
- `tu_quan_ao_engine_demo.html` - demo page with `cabinetModel` data.
- `.claude/PROJECT_SUMMARY.md` - current project state.
- `.claude/CONVENTIONS.md` - coding standards.

**Dev Commands:**
```bash
node --check interior-design-engine.js
```

Open `tu_quan_ao_engine_demo.html` directly in a browser for manual verification.

---

## Documentation Structure

```
interior_design_engine/
├── claude.md
└── .claude/
    ├── PROJECT_SUMMARY.md
    ├── CONVENTIONS.md
    └── SETUP_REPORT.md
```

---

## Notes for Claude

- This folder is now the active project root.
- Keep generated/demo HTML thin: model data plus calls into `InteriorDesigner`.
- Keep reusable logic in `interior-design-engine.js`.
- Keep styles in `interior-design-engine.css` with `ide-` prefixed class names.
- Avoid adding build tooling unless the user asks for packaging/minification.
- When in doubt, ask before changing the model schema or public API shape.

---

## Coding Rules

### 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them instead of picking silently.
- If a simpler approach exists, say so.
- If something is unclear, stop, name what is confusing, and ask.

### 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No flexibility or configurability that was not requested.
- No error handling for impossible scenarios.
- If 200 lines could be 50, rewrite it.

### 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

- Don't refactor unrelated code.
- Don't reformat entire files without need.
- Match existing style.
- Remove only imports/functions/variables made unused by your own change.

### 4. Goal-Driven Execution

Define success criteria and verify them.

For multi-step tasks, state a brief plan:
```
1. Inspect affected files -> verify: exact code path found
2. Apply scoped edit -> verify: syntax/manual check passes
3. Update docs if needed -> verify: PROJECT_SUMMARY.md reflects current state
```

---

**Remember:** Documentation = Single Source of Truth
