# Project Conventions

**Last Updated:** 2026-05-14 02:00:00 +07:00

---

## File & Folder Naming

### Files
- Library files: kebab-case, for example `interior-design-engine.js` and `interior-design-engine.css`.
- Demo/reference HTML files: descriptive snake_case or Vietnamese-transliterated names, for example `tu_quan_ao_engine_demo.html`.
- Documentation: `claude.md` at project root and uppercase markdown names inside `.claude/`.

### Folders
- Project stays flat unless a new category is clearly needed.
- `.claude/` contains project documentation only.

**Examples:**
```
interior_design_engine/
├── claude.md
├── interior-design-engine.css
├── interior-design-engine.js
├── tu_quan_ao_engine_demo.html
└── .claude/
    ├── PROJECT_SUMMARY.md
    ├── CONVENTIONS.md
    └── SETUP_REPORT.md
```

---

## Component Structure

### JavaScript Library Template
```javascript
(function (global) {
  "use strict";

  function privateHelper() {
    // Keep helpers private unless part of the public API.
  }

  function publicMethod(options) {
    // Normalize options and render from shared model data.
  }

  global.InteriorDesigner = {
    publicMethod
  };
})(window);
```

### Demo HTML Pattern
```html
<link rel="stylesheet" href="./interior-design-engine.css">
<div id="app"></div>
<script src="./interior-design-engine.js"></script>
<script>
  const cabinetModel = {
    modules: [],
    details: []
  };

  InteriorDesigner.render({
    mount: "#app",
    model: cabinetModel
  });
</script>
```

### Component Organization
The project does not use framework components. The library owns rendering; HTML owns data and API calls.

---

## Code Style

### JavaScript Organization
```javascript
// 1. Constants
// 2. DOM/SVG helpers
// 3. Model normalization and geometry helpers
// 4. Renderers
// 5. Export/prompt helpers
// 6. Public API export
```

### Spacing & Formatting
- Indentation: 2 spaces in HTML/CSS/JavaScript.
- Quotes: double quotes in JavaScript and HTML attributes.
- Semicolons: yes in JavaScript.
- Trailing commas: avoid unless they improve readability in large data arrays.
- Comments: use sparingly for non-obvious geometry/rendering logic.

---

## TypeScript Conventions

This project does not use TypeScript.

### Type Definitions
Not applicable.

**Examples:**
```typescript
// No TypeScript files are used in this project.
```

### Type Imports
```typescript
// Not applicable.
```

---

## CSS/Styling Conventions

### Class Naming
- Pattern: prefixed kebab-case.
- Prefix: `ide-`.

Example:
```css
.ide-root {}
.ide-tabs {}
.ide-export-panel {}
.ide-spec-card {}
```

### File Organization
All reusable styles live in `interior-design-engine.css`. Avoid putting large style blocks in demo HTML.

---

## Naming Conventions

### Variables
- JavaScript variables/functions: camelCase.
- Constants: UPPER_CASE only for fixed global constants when useful.
- Model fields: lower camelCase (`colorScheme`, `roomLayout`, `hiddenIn3d`).
- Design object arrays: `modules` for major zones, `details` for precise parts.

### Functions
- Public API functions are verbs: `render`, `createAiImagePackage`, `downloadAiImagePackage`, `attachAiImageExportPanel`, `buildAiPrompt`.
- Private helpers are descriptive camelCase: `normalizeModel`, `renderSvgView`, `modelBounds`, `drawSvgItem`.

---

## Testing

### Test File Naming
No automated test files currently exist.

### Test Structure
For now, use syntax and manual browser checks:
```bash
node --check interior-design-engine.js
```

Manual checklist:
- Open `tu_quan_ao_engine_demo.html`.
- Check front, side, plan, 3D, and specs tabs.
- Check AI export panel prompt preview.
- If download logic changed, test image/prompt/model export in browser.

---

## Do / Don't

### Do:
- Keep demo HTML focused on model data and public API calls.
- Keep reusable render/export behavior inside `interior-design-engine.js`.
- Keep CSS classes prefixed with `ide-`.
- Update `.claude/PROJECT_SUMMARY.md` after changes.
- Run `node --check interior-design-engine.js` after JS edits.

### Don't:
- Do not copy full library implementation into generated HTML files.
- Do not introduce a framework or build system unless requested.
- Do not edit original files outside this project folder unless the user asks.
- Do not make unrelated visual redesigns while changing rendering logic.

---

**NOTE:** These conventions are derived from the current `interior_design_engine` project. When in doubt, follow nearby code.
