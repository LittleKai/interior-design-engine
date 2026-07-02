# Project Summary

*Latest Session: Completed Interior Design Phase D: backend geometry warnings, one-shot AI repair loop, template dimension defaults, shell warning panel, and public mirror sync.*

## 1. Project Overview

- **Type:** Static browser library and demo for interior design visualization (chuyên tủ áo built-in).
- **Tech Stack:** HTML, CSS, JavaScript, SVG, Canvas 2D.
- **Package Manager:** None (no build tool; sẽ thêm importmap cho Three.js ở Phase 3).
- **i18n:** Hiện đang phân tán trong code; Phase 1 sẽ centralize vào `src/core/i18n.js` (vi/en).
- **State Management:** In-memory JavaScript model object với `runs`, `modules`, `details`, `specs`. Legacy top-level `modules[]` is normalized into a default east run.
- **Styling:** Plain CSS với prefix `ide-`.
- **Deployment:** Mở `tu_quan_ao_engine_demo.html` (project root) trực tiếp trong browser, serve folder statically, hoặc dùng bản copy ở `alpha-studio/public/interior-design/` được serve qua `/studio/interior-design`.

---

## 2. File Structure

### Key Directories (hiện tại — pre-Phase 1)

```text
tools/interior-design-engine/
├── claude.md
├── README.md
├── SPEC.md                            ← Architect output, ready for Builder
├── ai-model-instructions.md
├── interior-design-workflow.md
├── interior-design-model.schema.json
├── interior-design-engine.css
├── interior-design-engine.js          ← 1174 dòng monolith (sẽ split ở Phase 1)
└── .claude/
    ├── PROJECT_SUMMARY.md
    ├── CONVENTIONS.md
    ├── SETUP_REPORT.md
    └── tu_quan_ao_engine_demo.html    ← Demo page (live here, not at project root)
```

### Current Structure (post-Phase 11/14/15 — Three.js đã bị xoá, thay bằng iso renderer + template engine)

```text
tools/interior-design-engine/
├── interior-design-engine.js          ← 4-dòng shim: import "./src/index.js"
├── interior-design-engine.css
├── tu_quan_ao_engine_demo.html        ← Demo page (đã chuyển ra project root)
├── IMPROVEMENT_PLAN.md                ← Phân tích vấn đề + roadmap hoàn thiện (2026-07-02)
├── skills/                            ← Domain skills cho backend agent (kitchen-l-shape, wardrobe-sliding...)
├── src/
│   ├── index.js                       ← ES module entry, expose window.InteriorDesigner
│   ├── core/
│   │   ├── dom.js
│   │   ├── model.js
│   │   ├── i18n.js
│   │   ├── box-resolver.js            ← resolveItemBoxes: template boxes → world-space boxes (3D-as-truth)
│   │   ├── validation.js              ← validateModel (Phase 15)
│   │   └── debug.js
│   ├── renderers/
│   │   ├── svg-renderer.js            ← front/side/plan chiếu từ resolved 3D boxes
│   │   └── iso-renderer.js            ← Canvas 2D isometric 3D (drag rotate/zoom, exportPNG)
│   ├── template-engine/
│   │   ├── interpreter.js             ← renderTemplate/projectBoxToView (box, roundedBox, cylinder)
│   │   ├── expression.js              ← DSL expression AST whitelist ({{ expr }})
│   │   ├── color-tokens.js            ← 8 palettes + material tokens ($woodFront, $metal, $fabric, $stone...)
│   │   ├── loader.js                  ← catalog: builtin + static manifest + backend /templates
│   │   ├── builtin-templates.js       ← bundle inline của templates JSON
│   │   └── dispatcher.js
│   ├── templates/                     ← 14 seed template JSON + manifest.json
│   ├── ai/
│   │   ├── prompt-builder.js
│   │   └── image-analyzer.js          ← analyzeImage/generateRender + resize ≤1600px + presigned B2 upload
│   ├── editor/
│   │   ├── index.js, selection.js, property-panel.js, history.js, history-panel.js, keyboard.js
│   └── ui/
│       ├── main-renderer.js           ← mount3dTab: IsoRenderer
│       ├── review-panel.js, ai-export-panel.js, upload-panel.js, compare-slider.js
└── .claude/
    ├── PROJECT_SUMMARY.md, CONVENTIONS.md, MODEL_CONTRACT.md, SETUP_REPORT.md
```

Bản mirror runtime: `alpha-studio/public/interior-design/src/**` (phải đồng bộ với `tools/.../src/**` sau mọi thay đổi). Three.js vendor/importmap không còn được engine sử dụng.

### Critical Files

| File | Purpose | Notes |
|------|---------|-------|
| `interior-design-engine.js` | Reusable browser library | IIFE; Phase 1 sẽ chuyển thành ES modules. Public API `window.InteriorDesigner` giữ nguyên signature. |
| `interior-design-engine.css` | Library/demo styling | `ide-` prefix, tabs + drawings + spec cards + AI export panel + design review panel. |
| `tu_quan_ao_engine_demo.html` | Demo page (project root) | Chứa `cabinetModel` data, gọi `render()`, `attachDesignReviewPanel()`, `attachAiImageExportPanel()`. |
| `interior-design-model.schema.json` | AI output contract | JSON Schema cho validate AI-generated design models. |
| `ai-model-instructions.md` | AI prompt template | System/developer instruction để convert user request → model JSON. |
| `interior-design-workflow.md` | AI workflow docs | Intake checklist, design directions, review gate, AI image export. |
| `SPEC.md` | Architect specification | Phase-based roadmap from hybrid-ai-skills Architect. |
| `.claude/MODEL_CONTRACT.md` | Public model contract doc | Current model shape, runtime validation contract, template model, and source/generated-output boundary. |
| `claude.md` | Instructions for future Claude sessions | Read `.claude/PROJECT_SUMMARY.md` first. |
| `.claude/CONVENTIONS.md` | Coding conventions | Derived from this static library project. |
| `.claude/SETUP_REPORT.md` | Initial setup report | Historical setup artifact. |

---

## 3. Architecture & Patterns

### Component Structure

Static browser library exposed as `window.InteriorDesigner`. HTML demo định nghĩa model data và gọi public API. Logic reusable nằm trong `interior-design-engine.js` (Phase 1 sẽ chuyển sang `src/`).

### State Management

Design model là plain JavaScript object:

- `modules`: large design zones hoặc main structures.
- `details`: precise parts như panels, doors, handles, shelves, rods, appliances.

Front/side/plan SVG, 3D Canvas, specs, AI prompts, review results, exported images đều derive từ cùng model object.

### Styling Approach

CSS dùng prefix `ide-`. Phase 1 sẽ giữ nguyên, Phase 3 sẽ thêm `.ide-dim-label` cho dimension overlay và Phase 4 thêm `.ide-compare-slider`.

### AI Workflow Layer

- `interior-design-workflow.md` document intake checklist, direction advisor, model generation rules, review gate, AI image export.
- `getDesignDirections()` → Practical modern / Warm Japandi / Compact luxury.
- `buildIntakeChecklist()` → checklist brief cho AI hoặc UI.
- `reviewModel()` → check functional zoning, detail density, geometry bounds, materials, technical openings.
- `attachDesignReviewPanel()` render review trước AI export panel.
- AI export panel có direction selector + EN/VI prompt + download package PNG/TXT/JSON.

### API Integration

Hiện tại browser library KHÔNG gọi network API. AI export tạo file PNG/TXT/JSON trong browser để user dùng với công cụ AI bên ngoài.

Phase 4 sẽ thêm backend pipeline qua `alpha-studio-backend/server/routes/interior.js`:
- `POST /api/interior/analyze-image` — Gemini Vision phân tích ảnh upload → trả model JSON
- `POST /api/interior/generate-render` — Gemini image gen từ model + 3D view

### Routing

No router. In-page tab buttons.

---

## 4. Active Features & Status

| Feature | Status | Files Involved | Notes |
|---------|--------|----------------|-------|
| Shared model rendering | Done | `interior-design-engine.js`, demo HTML | Front/side/plan/3D/specs derive từ một model. |
| Front/side/plan tabs | Done | `interior-design-engine.js` | SVG views từ model bounds. |
| 3D iso renderer (thay Three.js) | Done | `src/renderers/iso-renderer.js`, `src/ui/main-renderer.js` | Phase 11 xoá Three.js. Canvas 2D isometric: drag rotate, wheel zoom, dblclick reset, palette-based faces, per-face luminance shading, exportPNG. Raw `item.color` and template `style.colors` overrides now render; `roundedBox` still renders as box in 3D until Phase E. |
| CSG hint rendering | Removed (Phase 11) | — | `csgHints[]` chỉ tồn tại ở ThreeRenderer (Phase 7), đã bị xoá cùng Three.js. Bo góc nay dùng primitive `roundedBox` trong template DSL. |
| Multi-run layouts | Done | `src/core/model.js`, `src/renderers/svg-renderer.js`, `src/renderers/three-renderer.js`, `src/renderers/three/dimensions.js`, schema JSON | Phase 8 adds top-level `runs[]` with `{id, origin:{x,z}, direction, modules}` for L/U/island/galley layouts. `normalizeModel()` converts legacy `modules[]` into `runs:[default]`, resolves run modules to absolute coordinates, plan/3D render all runs, and front/side render the first run plus absolute details. |
| History preview panel | Done | `src/editor/history.js`, `src/editor/history-panel.js`, `src/editor/index.js`, `src/editor/property-panel.js`, `src/core/i18n.js`, `src/ai/image-analyzer.js`, CSS | Phase 9 stores snapshot metadata (`id`, `timestamp`, `label`, optional `renderUrl`), renders a sidebar timeline, supports non-destructive preview mode with read-only properties and disabled edit shortcuts, restores snapshots explicitly, and attaches `generateRender()` URLs as thumbnails. |
| Solid material opacity guard | Superseded (Phase 11) | `src/core/model.js` | Bản gốc Phase 10 nằm ở `three/materials.js` (đã xoá). Normalizer hiện ghi `_validationWarnings` cho material semantics đáng ngờ; iso renderer áp `opacity` trực tiếp per-box. |
| AI image export package | Done | `interior-design-engine.js`, `.css`, demo HTML | Exports reference PNGs, EN/VI prompt files, hướng dẫn VN, model JSON. |
| Export options panel | Done | `interior-design-engine.js`, `.css`, demo HTML | Preset VN, design direction, EN/VI prompt, copy EN prompt. |
| Design direction workflow | Done | `interior-design-engine.js`, workflow MD, README, AI instructions | 3 directions built-in + intake checklist. |
| Model review panel/API | Done | `interior-design-engine.js`, `.css`, demo HTML, README | `reviewModel()` + `attachDesignReviewPanel()`. |
| Shell validation warning panel | Done | `src/ui/main-renderer.js`, `src/core/i18n.js`, `src/core/model.js`, `interior-design-engine.css`, public mirror | Phase D surfaces backend/runtime `_validationWarnings` and `reviewModel()` issues directly below the shell header with vi/en labels. Template modules missing dimensions use `params.default` instead of full-model fallback. |
| AI model contract docs | Done | README, schema JSON, AI instructions MD | Document model JSON shape cho AI consumers. |
| Documentation system | Done | `claude.md`, `.claude/*`, `SPEC.md` | Architect SPEC.md ready cho Builder. |
| Alpha Studio embed assets | Done | `alpha-studio/public/interior-design/*`, `InteriorDesignPage.tsx` | Source ở `tools/interior-design-engine`, copy static được serve qua `/studio/interior-design`. |
| Alpha Studio AI shell | Done | `shell.html`, `InteriorDesignPage.tsx`, `routes/interior.js` | MongoDB project storage, B2 reference image upload, postMessage flow. |
| ES module refactor | Done | `src/core/*`, `src/renderers/*`, `src/ai/*`, `src/ui/*`, `src/index.js`, `importmap.json` | Monolith 1174 dòng đã split. `interior-design-engine.js` giờ là 4-dòng shim re-export `./src/index.js`. Demo HTML + shell.html dùng `<script type="module">`. i18n centralize tại `src/core/i18n.js` (vi + en). |
| Template catalog (thay catalog registry cũ) | Done | `src/template-engine/loader.js`, `src/templates/*.json`, backend `GET /api/interior/templates` | Folder `src/catalog/` (Phase 2) đã bị thay bởi template engine Phase 11. Catalog = builtin bundle + static manifest (14 template) + backend rows (seed/approved từ `InteriorTemplate`). `getTemplate()` ưu tiên inline → catalog. |
| Gemini image-to-design pipeline | Done | `src/ai/image-analyzer.js`, `src/ui/upload-panel.js`, `src/ui/compare-slider.js`, `src/core/model.js`, backend `routes/interior.js` (+/analyze-image, +/generate-render), `middleware/interiorQuota.js`, models `InteriorAnalysis`/`InteriorRender`/`InteriorQuota` | Frontend: `analyzeImage(file, opts)` resize ≤1600px → presigned B2 upload → POST /analyze-image. Debug console logs are gated by `?debug=1` or `localStorage.ide:debug=1`; unsupported schema requests log as `[ide:ai] unsupported:`. `normalizeModel()` records `_validationWarnings` for invalid void/glass material semantics. Compare-slider web component (pointer drag + clip-path). Upload panel with drop zone + hints textarea + status. Backend: analyze flow has 24h cache via sha256(imageUrl+hints), robust JSON extraction before repair loop, repair loop max 2 retries, Gemini Flash 3 default → Pro 3.1 escalate when hints contain "complex" or override="pro". AI may return `meta.unsupportedRequests[]` for unsupported schema requests and is instructed not to misuse `glass-smoked` / `kind:"void"`. Generate-render endpoint validates modelJson, uploads viewBase64 to `interior-design/conditioning/`, persists InteriorRender record. **Image-gen upstream not yet wired** — returns conditioning URL as renderUrl placeholder + meta.pending=true. Rate limit 5/24h/user via `interiorQuotaCheck` middleware (bypass for admin/mod, disable via `INTERIOR_QUOTA_ENABLED=false`). |
| Simple property editor | Done | `src/editor/{index,selection,property-panel,history,history-panel,keyboard}.js`, `src/renderers/svg-renderer.js` (g-wrapper with `data-detail-id`), `interior-design-engine.css` (`.ide-selected`, `.ide-editor-*`, `.ide-prop-*`, `.ide-history-*`) | `InteriorDesigner.enableEditor({mount, model, language, onChange})` orchestrates click-to-select on front/side/plan SVG views + sidebar property form (label, x/y/z, w/h/d, color, material preset dropdown, catalog id dropdown). Every edit goes through `BoxService.update` → re-render all tabs → push metadata snapshot into `History` (max 50). Keyboard: Ctrl+Z undo, Ctrl+Y/Ctrl+Shift+Z redo, Delete remove selected (via `BoxService.delete`), Escape clear selection or closes preview. Sidebar includes undo/redo/delete plus Phase 9 History preview/restore panel. Backward compat: items render unchanged when editor not mounted. |
| Template 3D-as-truth rendering | Done | `src/core/box-resolver.js`, `src/template-engine/interpreter.js`, `src/renderers/svg-renderer.js`, `src/renderers/iso-renderer.js`, `src/templates/*.json` | Phase 14 replaces independent `frontSvg`/`sideSvg`/`planSvg` template views with `boxes` only. SVG front/side/plan views project resolved 3D boxes, and min/max param bounds are advisory rather than render-time clamps. |
| Curved template primitives | Done | `src/template-engine/interpreter.js`, `src/core/box-resolver.js`, `src/renderers/svg-renderer.js`, `src/renderers/iso-renderer.js`, `src/templates/cab-base-rounded-end.json` | Boxes DSL now supports regular boxes plus `roundedBox` and `cylinder` for bo goc panels, round knobs, rods, legs, and tube frames. |
| Model contract and runtime validation | Done | `.claude/MODEL_CONTRACT.md`, `src/core/validation.js`, `src/core/debug.js`, `src/__tests__/validation.test.mjs`, `README.md`, schema JSON, AI docs | Phase 15 adds lightweight validation and docs inspired by Articraft's contract-first workflow without adding dependencies or changing existing public API signatures. `InteriorDesigner.validateModel()` is exposed in source and public mirror. |

---

## 5. Known Issues & TODOs

> **2026-07-02:** Phase B asset pipeline completed. Backend prompts now build the catalog dynamically from `InteriorTemplate` seed/approved rows with 5-minute cache, backend startup auto-seeds built-ins + workshop components, 42 current workshop JSON components were upserted as approved templates, active few-shot examples favor `tpl`, agent prompts include domain/dimension/runs/catalog rules, and source/public mirror color tokens include small workshop aliases (`wood`, `woodLight`, `metal`).

> **2026-07-02:** Phase C color/material work completed. Palette vocabulary now includes VN-oriented `white-oak`, `navy-brass`, `green-sage`, `grey-minimal`; material tokens cover metal/fabric/stone/ceramic/plant/LED/accent variants; `module.style.colors` supports per-template-module overrides; iso renderer applies face luminance shading; backend validator rejects unknown `$token` references; source/public mirror and schema/model contract are synced.

> **2026-07-02:** Phase D dimension/repair work completed. `/chat` backend now attaches non-blocking geometry warnings, retries once with a focused repair prompt, applies template `params.default` dimensions before save, and shell UI renders `_validationWarnings` plus `reviewModel()` issues in a warning panel. Public mirror is hash-synced for changed runtime files.

> **2026-07-02:** Phase A hotfix completed. `cab-base-rounded-end` no longer uses ternary, per-shape template errors are skipped into validation warnings, `===`/`!==` aliases are supported, raw `item.color` renders with shaded faces, backend catalog prompt lists all 14 seed templates, public mirror is synced, and seed script upserted 14 DB templates.

> **2026-07-02:** Xem `IMPROVEMENT_PLAN.md` (project root) — phân tích 26 phát hiện (F1-F26) về việc AI không dùng template catalog, màu sắc bị renderer bỏ qua, template bo góc `cab-base-rounded-end` crash do ternary không được expression engine hỗ trợ, kích thước sai ở agent mode, và roadmap 5 phase (A-E) để khắc phục.

### High Priority

- [x] **[BUG — crash]** `cab-base-rounded-end` ternary/strict-equality crash fixed by splitting conditional handle shapes with `"if"` and adding `===`/`!==` aliases.
- [x] **[BUG]** `box-resolver.resolveItemBoxes` now honors raw `item.color` by deriving shaded faces from the provided color.
- [x] Prompt catalog backend (`INTERIOR_CATALOG_VI/EN`) now lists all 14 seed templates and documents the `"if"` pattern instead of ternary.
- [x] Workshop components are now dynamically included in `/chat`/proposal/agent prompts through the DB-backed `InteriorTemplate` catalog.

- [x] Phase 1: Split `interior-design-engine.js` (1174 dòng) thành ES modules + centralize i18n — completed 2026-05-17 session #8.
- [ ] Browser visual verification: mở `tu_quan_ao_engine_demo.html` + alpha-studio `/studio/interior-design` để confirm 4 tab + review panel + AI export panel render đúng sau khi chuyển sang ES modules.
- [ ] Verify Vietnamese text encoding in browser before bulk text edits; PowerShell output may show mojibake.
- [x] Phase 15: implement model contract docs, `validateModel`, validation tests, debug helper cleanup, and source/public mirror sync.

### Medium Priority

- [x] Phase 2: Catalog registry với 8 element ban đầu — completed 2026-05-17 session #9.
- [x] Phase 3: Three.js photoreal renderer thay Canvas 2D 3D tab — completed 2026-05-18 session #10.
- [x] Phase 4: Gemini image-to-design pipeline — completed 2026-05-18 session #11.
- [x] Phase 5: Simple property editor — completed 2026-05-18 session #12.
- [x] Phase 6: Quick wins — shadow toggle i18n, void/glass transparency guards, `_validationWarnings`, robust AI JSON extraction, unsupported request anchoring, gated console debug logs — completed 2026-05-18 session #14.
- [x] Phase 7: CSG integration — `csgHints[]` schema/normalizer, `csg-service.js`, ThreeRenderer wiring, vendor `three-bvh-csg`, demo fixture, and AI instructions — completed 2026-05-18 session #15.
- [x] Phase 8: Multi-run schema — top-level `runs[]`, `resolveRunCoord`, plan/3D multi-run rendering, backend validator/prompt, and docs — completed 2026-05-18 session #16.
- [x] Phase 9: History panel with thumbnail preview — metadata snapshots, non-destructive preview, explicit restore, read-only property panel, render thumbnail attachment, and docs — completed 2026-05-18 session #17.
- [x] Phase 10: Nhóm A bug fixes — solid material opacity guard, larger shadow camera bounds, demo opacity fixture, and backend prompt updates for `/chat` dimensions/runs/z-axis — completed 2026-05-18 session #18.
- [x] Phase 14: 3D-as-truth template refactor — completed 2026-05-20 session #23.
- [ ] Wire actual image-generation upstream (Imagen/Gemini Image API) so `/generate-render` returns real AI-render URL instead of conditioning URL.
- [ ] Add browser UI for pasting/validating AI-generated model JSON before rendering.

### Low Priority / Nice to Have

- [ ] Minified build nếu lib distribute ra ngoài workspace.

---

## 6. Dependencies & External Resources

### Key Dependencies (hiện tại)

- Browser DOM APIs, SVG, Canvas 2D — **zero runtime dependency** (Phase 11 đã xoá Three.js, importmap, và CSG vendor).
- JavaScript `Blob` / data URL / download via anchor.
- Backend: Gemini qua gcli-proxy + B2 client (đã có trong alpha-studio-backend) cho analyze-image / chat / agent.
- Lưu ý: các folder vendor `alpha-studio/public/vendor/three*` nếu còn tồn tại là dead asset của phase cũ, engine không import nữa.

### External APIs / Services

- Hiện tại: None.
- Phase 4: Gemini Pro 3.1 + Gemini Flash 3.0 qua backend proxy (KHÔNG gọi từ browser).

---

## 7. Important Notes for Claude

### When making changes to:

- **Library code:** Logic reusable nằm trong `interior-design-engine.js` (hiện tại) / `src/` (sau Phase 1).
- **Demo HTML:** Focused vào model data + calls public API. KHÔNG có implementation logic.
- **CSS:** Prefix `ide-`, không style global element.
- **3D renderer:** Coordinate consistent với front/side/plan views.
- **Workflow layer:** Intake/review/direction helpers lightweight, derive từ cùng model. KHÔNG introduce AI provider dependency trong browser library.

### Drift Check Rule

Per CLAUDE.md workspace rule: nếu code thực tế khác PROJECT_SUMMARY.md, **PHẢI** cập nhật md ngay trong cùng task.

### Testing checklist:

- [ ] `node --check interior-design-engine.js` (hoặc `src/**/*.js` sau Phase 1) sau mỗi JS edit.
- [ ] Mở `.claude/tu_quan_ao_engine_demo.html` trong browser — verify front/side/plan/3D/specs tab.
- [ ] Verify design review panel render trước AI export panel.
- [ ] Test AI export panel sau khi sửa logic export.
- [ ] `alpha-studio dev server` → `/studio/interior-design` → iframe shell flow OK.

- [x] Phase 15 verification: `node --check` for edited runtime modules, `node --test` validation + box resolver tests, schema JSON parse, public `src/` hash comparison, and schema `fc` comparison.

### Don't forget to:

- Follow `CONVENTIONS.md`.
- Demo/embed HTML KHÔNG chứa reusable implementation code.

---

## 8. Roadmap Reference

Architect SPEC files ở **workspace root** (`D:\Dev\NodeJS\alpha-studio\`):

- `SPEC.md` — index roadmap, lists active + done phases
- `SPEC-phase-6.md` → `SPEC-phase-10.md` — historical phase specs (đã build + review xong)
- `SPEC-phase-11.md` — **Active**: Drop Three.js + iso renderer + JSON DSL template engine + 7 seed templates port từ reference HTML
- `SPEC-phase-12.md` — **Planned (build ngay sau Phase 11)**: Self-extend template library — backend `InteriorTemplate` collection + AI `tplNew` escape hatch + user commit UX + admin review page
- `SPEC-phase-15.md` — **Done**: Articraft-inspired model contract, runtime validation, public `validateModel`, debug logging cleanup, focused Node tests, and mirror sync.
- `BUILDER_LOG.md` + `REVIEW_LOG.md` — Builder/Reviewer audit trail
- `.spec-archive/` — auto-archived old SPECs

**Reference cho Phase 11 implementation:**
- `tools/interior-design-engine/.claude/tu_quan_ao_thiet_ke.html` — Hand-crafted reference (~60KB): SVG views + Canvas 2D iso 3D với `project()` + `drawBox()` + ~30 sub-component renders. Port logic này thành 7 seed templates (upper-2door, upper-glass-2door, sliding-2door, sliding-3door, ac-recess-fold, open-bookshelf, l-desk-return).

**Reference projects khảo sát ban đầu (Phase 1-3):**
- `D:\Dev\2.reference_pj\Design-ref\roomGPT` — AI polling pipeline + before/after slider
- `D:\Dev\2.reference_pj\Design-ref\react-planner` — catalog registry + static service pattern
- ~~`D:\Dev\2.reference_pj\Design-ref\three.js`~~ — deprecated bởi Phase 11 (xoá Three.js)

---

## 9. Quick Commands

```bash
# From D:\Dev\NodeJS\alpha-studio\tools\interior-design-engine
node --check interior-design-engine.js
# (after Phase 1):
for f in src/**/*.js; do node --check "$f"; done

# Open demo directly
tu_quan_ao_engine_demo.html
```

---

**CRITICAL:** Read this entire file before making any changes to the project.
