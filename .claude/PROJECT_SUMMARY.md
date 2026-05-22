# Project Summary

**Session #27 Update (2026-05-22):** Template DSL now supports whitelisted curved primitives inside `boxes`: `roundedBox` and `cylinder`. The interpreter/projection layer, box resolver, SVG renderer, and Canvas isometric renderer preserve/render primitive metadata. Added seed template `cab-base-rounded-end` and synced the public mirror; backend seed now imports 14 templates.

**Session #26 Update (2026-05-21):** `skills/kitchen-l-shape.md` now explicitly treats the requested L return length as the full perpendicular leg length and gives the agent a concrete `origin:{x:W,z:0}` / `width:L` rule, avoiding tiny leftover return stubs for "nhánh L 1m" requests. Public mirror was updated under `alpha-studio/public/interior-design/skills/`.

**Phase 14 Update (2026-05-20):** Engine templates now use `boxes` as the 3D source of truth. Built-in JSON templates and `builtin-templates.js` no longer carry `frontSvg`/`sideSvg`/`planSvg`; SVG views are projected from resolved world-space boxes via `core/box-resolver.js` and `projectBoxToView()`. Template param min/max is advisory only, so render dimensions no longer clamp away from the module's declared size.

**Phase 13 Update (2026-05-20):** Added `skills/` with six interior agent domain recipes (kitchen L/galley, wardrobe built-in/sliding, study desk L, child bedroom). Template catalog now has 13 seed JSON files: the original seven plus six kitchen modules (`base-cabinet-2door`, `base-drawer-stack`, `wall-cabinet-2door`, `tall-cabinet`, `corner-cabinet`, `sink-base`). Public mirror under `alpha-studio/public/interior-design/` includes both `src/` and `skills/`.

**Phase 12 Update (2026-05-19):** Self-extending template library wired in. The engine loader now merges seed templates (static manifest + bundled `builtin-templates.js`) with backend approved/seed rows fetched from `GET /api/interior/templates`. Inline templates from `model.inlineTemplates` still take precedence per render. No engine code change beyond `loader.js` — Phase 11 renderer + DSL interpreter unchanged.

**Phase 11 Update (2026-05-19):** Builder completed the dependency-free template DSL + Canvas 2D isometric renderer. Three.js, CSG vendor code, import maps, and the old catalog registry/BoxService are removed from runtime. Model JSON now supports `palette`, `inlineTemplates`, and `modules[].tpl/style`; the seven built-in templates are `upper-2door`, `upper-glass-2door`, `sliding-2door`, `sliding-3door`, `ac-recess-fold`, `open-bookshelf`, and `l-desk-return`. The public mirror under `alpha-studio/public/interior-design/` is synced from this source and no longer ships Three/CSG vendor folders.

**Last Updated:** 2026-05-22 (Session #27 - curved template primitives)
**Session:** #27 - Added `roundedBox` and `cylinder` template primitives, seed/public `cab-base-rounded-end`, renderer/backend/workshop tests, and MongoDB seed update.
**Session:** #26 - Fixed kitchen L-shape skill guidance so AI preserves full return-leg length and the public mirror stays aligned.
**Session:** #25 - Phase 15 completed: added `MODEL_CONTRACT.md`, dependency-free runtime `validateModel`, centralized debug logging, validation tests, schema/docs alignment, and public mirror sync.
**Session:** #24 - Phase 15 spec is ready for Builder: Articraft-inspired model contract, runtime validation, public `validateModel`, debug logging cleanup, focused Node tests, and public mirror sync.
**Session:** #23 - Phase 14: `boxes` replaces per-view template SVG shapes, `box-resolver.js` shares world-space box resolution between SVG and 3D renderers, and public mirror is synced.
**Session:** #22 — F23: `allItems` now returns all modules for every view mode (front/side previously dropped non-first runs). F24: iso-renderer applies `_runDirection` rotation to box geometry via `transformBox()` so 3D matches 2D footprint for L-shape kitchens.
**Session:** #21 — Phase 12 build: backend InteriorTemplate model + /api/interior/templates GET/POST + admin review endpoints, AI tplNew escape extracted into modelJson.inlineTemplates, frontend commit UX + admin tab.

---

## 1. Project Overview

- **Type:** Static browser library and demo for interior design visualization (chuyên tủ áo built-in).
- **Tech Stack:** HTML, CSS, JavaScript, SVG, Canvas 2D.
- **Package Manager:** None (no build tool; sẽ thêm importmap cho Three.js ở Phase 3).
- **i18n:** Hiện đang phân tán trong code; Phase 1 sẽ centralize vào `src/core/i18n.js` (vi/en).
- **State Management:** In-memory JavaScript model object với `runs`, `modules`, `details`, `specs`. Legacy top-level `modules[]` is normalized into a default east run.
- **Styling:** Plain CSS với prefix `ide-`.
- **Deployment:** Mở `.claude/tu_quan_ao_engine_demo.html` trực tiếp trong browser, serve folder statically, hoặc dùng bản copy ở `alpha-studio/public/interior-design/` được serve qua `/studio/interior-design`.

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

### Current Structure (post-Phase 3)

```text
tools/interior-design-engine/
├── interior-design-engine.js          ← 4-dòng shim: import "./src/index.js"
├── interior-design-engine.css         ← + .ide-three-stage, .ide-three-toolbar, .ide-three-toggle, .ide-dim-label
├── importmap.json                     ← Three.js 0.169.0 CDN map
├── src/
│   ├── index.js                       ← ES module entry, expose window.InteriorDesigner
│   ├── core/
│   │   ├── dom.js
│   │   ├── model.js
│   │   └── i18n.js
│   ├── renderers/
│   │   ├── svg-renderer.js
│   │   ├── canvas-2d-renderer.js      ← fallback khi WebGL không khả dụng
│   │   ├── three-renderer.js          ← ThreeRenderer class, mount/update/exportPNG/setMode/setShadowEnabled/setDimensionsVisible/dispose
│   │   └── three/
│   │       ├── materials.js           ← 8 PBR preset (wood-oak, wood-walnut, laminate-white, laminate-black-matte, glass-smoked, metal-brushed, metal-black, fabric-linen)
│   │       ├── geometry-factories.js  ← createGeometry theo catalogId
│   │       ├── csg-service.js         ← Phase 7 CSG hints: roundCorner, drawerCutout, glassCutout
│   │       ├── lighting.js            ← hemi + directional shadow + 2 point fills
│   │       └── dimensions.js          ← CSS2DRenderer dimension labels
│   ├── catalog/
│   │   ├── registry.js
│   │   ├── index.js
│   │   ├── elements/                  ← 8 element specs
│   │   └── services/box-service.js
│   ├── ai/
│   │   ├── prompt-builder.js
│   │   └── image-analyzer.js          ← analyzeImage/generateRender + client-side resize ≤1600px + presigned B2 upload
│   ├── editor/
│   │   ├── index.js                   ← enableEditor: orchestrates selection + property panel + history + keyboard
│   │   ├── selection.js               ← enableSelection/setSelected/clearSelected — data-detail-id click delegation
│   │   ├── property-panel.js          ← attachPropertyPanel — name/x/y/z/w/h/d/color/material/catalog form
│   │   ├── history.js                 ← History class, structuredClone, max 50 metadata snapshots
│   │   ├── history-panel.js           ← Phase 9 snapshot timeline with preview/restore controls
│   │   └── keyboard.js                ← bindEditorKeyboard — Ctrl+Z/Y, Delete, Escape; ignores typing targets
│   └── ui/
│       ├── main-renderer.js           ← mount3dTab: WebGL detect → ThreeRenderer hoặc Canvas 2D fallback
│       ├── review-panel.js
│       ├── ai-export-panel.js
│       ├── upload-panel.js            ← drop zone + hints + analyze + compare slider on done
│       └── compare-slider.js          ← pointer-drag before/after with clip-path
└── .claude/
    └── tu_quan_ao_engine_demo.html
```

Vendor (offline fallback): `alpha-studio/public/vendor/three/` chứa `three.module.js` (~1.3MB) + addons (`controls/OrbitControls.js`, `geometries/RoundedBoxGeometry.js`, `renderers/CSS2DRenderer.js`, `loaders/SVGLoader.js`). `shell.html` inject importmap động dựa trên `navigator.onLine`.

### Critical Files

| File | Purpose | Notes |
|------|---------|-------|
| `interior-design-engine.js` | Reusable browser library | IIFE; Phase 1 sẽ chuyển thành ES modules. Public API `window.InteriorDesigner` giữ nguyên signature. |
| `interior-design-engine.css` | Library/demo styling | `ide-` prefix, tabs + drawings + spec cards + AI export panel + design review panel. |
| `.claude/tu_quan_ao_engine_demo.html` | Demo page | Chứa `cabinetModel` data, gọi `render()`, `attachDesignReviewPanel()`, `attachAiImageExportPanel()`. |
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
| 3D photoreal renderer | Done | `src/renderers/three-renderer.js`, `src/renderers/three/*.js`, `src/ui/main-renderer.js`, `interior-design-engine.css` | Three.js 0.169.0, PerspectiveCamera fov=45 + OrthographicCamera toggle, shadows default OFF with toolbar toggle, PCFSoftShadowMap when enabled, ACESFilmicToneMapping, OrbitControls (damping), 8 PBR preset, RoundedBoxGeometry cho panel, LatheGeometry cho knob, CylinderGeometry cho rod, CSS2DRenderer dimension labels (toggle), Canvas 2D fallback khi WebGL không khả dụng hoặc `?renderer=canvas`. Phase 10 widens directional shadow bounds to ±600cm/far 2000 and reduces bias to keep large/L-shaped cabinets shadowed. Vendor offline fallback ở `alpha-studio/public/vendor/three/` qua dynamic importmap. |
| CSG hint rendering | Done | `src/renderers/three/csg-service.js`, `src/renderers/three-renderer.js`, schema JSON, demo HTML | Phase 7 adds optional `csgHints[]` per item. Whitelist supports `roundCorner:<corner>:<radius>`, `drawerCutout:<edge>:<size>`, and `glassCutout:<x>:<y>:<w>:<h>`. Unknown hints warn and keep rendering. Vendor deps: `three-bvh-csg@0.0.17` + `three-mesh-bvh@0.8.3` under `alpha-studio/public/vendor/`. |
| Multi-run layouts | Done | `src/core/model.js`, `src/renderers/svg-renderer.js`, `src/renderers/three-renderer.js`, `src/renderers/three/dimensions.js`, schema JSON | Phase 8 adds top-level `runs[]` with `{id, origin:{x,z}, direction, modules}` for L/U/island/galley layouts. `normalizeModel()` converts legacy `modules[]` into `runs:[default]`, resolves run modules to absolute coordinates, plan/3D render all runs, and front/side render the first run plus absolute details. |
| History preview panel | Done | `src/editor/history.js`, `src/editor/history-panel.js`, `src/editor/index.js`, `src/editor/property-panel.js`, `src/core/i18n.js`, `src/ai/image-analyzer.js`, CSS | Phase 9 stores snapshot metadata (`id`, `timestamp`, `label`, optional `renderUrl`), renders a sidebar timeline, supports non-destructive preview mode with read-only properties and disabled edit shortcuts, restores snapshots explicitly, and attaches `generateRender()` URLs as thumbnails. |
| Solid material opacity guard | Done | `src/renderers/three/materials.js`, public mirror | Phase 10 forces solid body presets (`wood-*`, laminate, metal, fabric) to opaque when AI/legacy JSON sets `opacity < 1`, while preserving glass and void transparency. |
| AI image export package | Done | `interior-design-engine.js`, `.css`, demo HTML | Exports reference PNGs, EN/VI prompt files, hướng dẫn VN, model JSON. |
| Export options panel | Done | `interior-design-engine.js`, `.css`, demo HTML | Preset VN, design direction, EN/VI prompt, copy EN prompt. |
| Design direction workflow | Done | `interior-design-engine.js`, workflow MD, README, AI instructions | 3 directions built-in + intake checklist. |
| Model review panel/API | Done | `interior-design-engine.js`, `.css`, demo HTML, README | `reviewModel()` + `attachDesignReviewPanel()`. |
| AI model contract docs | Done | README, schema JSON, AI instructions MD | Document model JSON shape cho AI consumers. |
| Documentation system | Done | `claude.md`, `.claude/*`, `SPEC.md` | Architect SPEC.md ready cho Builder. |
| Alpha Studio embed assets | Done | `alpha-studio/public/interior-design/*`, `InteriorDesignPage.tsx` | Source ở `tools/interior-design-engine`, copy static được serve qua `/studio/interior-design`. |
| Alpha Studio AI shell | Done | `shell.html`, `InteriorDesignPage.tsx`, `routes/interior.js` | MongoDB project storage, B2 reference image upload, postMessage flow. |
| ES module refactor | Done | `src/core/*`, `src/renderers/*`, `src/ai/*`, `src/ui/*`, `src/index.js`, `importmap.json` | Monolith 1174 dòng đã split. `interior-design-engine.js` giờ là 4-dòng shim re-export `./src/index.js`. Demo HTML + shell.html dùng `<script type="module">`. i18n centralize tại `src/core/i18n.js` (vi + en). |
| Catalog registry | Done | `src/catalog/registry.js`, `src/catalog/index.js`, `src/catalog/elements/*.js`, `src/catalog/services/box-service.js` | 8 element built-in: door-shaker, door-flat, drawer-front, handle-bar, handle-knob, rod-hanging, shelf-fixed, void-cavity. Registry API: `registerElement`, `getElement`, `listElements`, `factoryElement`. BoxService: create/update/delete/intersect/contains. SVG renderer auto-delegate khi item có `catalogId`; reviewModel cảnh báo khi `catalogId` không tồn tại. JSON schema mở rộng `catalogId` + `props`. |
| Gemini image-to-design pipeline | Done | `src/ai/image-analyzer.js`, `src/ui/upload-panel.js`, `src/ui/compare-slider.js`, `src/core/model.js`, backend `routes/interior.js` (+/analyze-image, +/generate-render), `middleware/interiorQuota.js`, models `InteriorAnalysis`/`InteriorRender`/`InteriorQuota` | Frontend: `analyzeImage(file, opts)` resize ≤1600px → presigned B2 upload → POST /analyze-image. Debug console logs are gated by `?debug=1` or `localStorage.ide:debug=1`; unsupported schema requests log as `[ide:ai] unsupported:`. `normalizeModel()` records `_validationWarnings` for invalid void/glass material semantics. Compare-slider web component (pointer drag + clip-path). Upload panel with drop zone + hints textarea + status. Backend: analyze flow has 24h cache via sha256(imageUrl+hints), robust JSON extraction before repair loop, repair loop max 2 retries, Gemini Flash 3 default → Pro 3.1 escalate when hints contain "complex" or override="pro". AI may return `meta.unsupportedRequests[]` for unsupported schema requests and is instructed not to misuse `glass-smoked` / `kind:"void"`. Generate-render endpoint validates modelJson, uploads viewBase64 to `interior-design/conditioning/`, persists InteriorRender record. **Image-gen upstream not yet wired** — returns conditioning URL as renderUrl placeholder + meta.pending=true. Rate limit 5/24h/user via `interiorQuotaCheck` middleware (bypass for admin/mod, disable via `INTERIOR_QUOTA_ENABLED=false`). |
| Simple property editor | Done | `src/editor/{index,selection,property-panel,history,history-panel,keyboard}.js`, `src/renderers/svg-renderer.js` (g-wrapper with `data-detail-id`), `interior-design-engine.css` (`.ide-selected`, `.ide-editor-*`, `.ide-prop-*`, `.ide-history-*`) | `InteriorDesigner.enableEditor({mount, model, language, onChange})` orchestrates click-to-select on front/side/plan SVG views + sidebar property form (label, x/y/z, w/h/d, color, material preset dropdown, catalog id dropdown). Every edit goes through `BoxService.update` → re-render all tabs → push metadata snapshot into `History` (max 50). Keyboard: Ctrl+Z undo, Ctrl+Y/Ctrl+Shift+Z redo, Delete remove selected (via `BoxService.delete`), Escape clear selection or closes preview. Sidebar includes undo/redo/delete plus Phase 9 History preview/restore panel. Backward compat: items render unchanged when editor not mounted. |
| Template 3D-as-truth rendering | Done | `src/core/box-resolver.js`, `src/template-engine/interpreter.js`, `src/renderers/svg-renderer.js`, `src/renderers/iso-renderer.js`, `src/templates/*.json` | Phase 14 replaces independent `frontSvg`/`sideSvg`/`planSvg` template views with `boxes` only. SVG front/side/plan views project resolved 3D boxes, and min/max param bounds are advisory rather than render-time clamps. |
| Curved template primitives | Done | `src/template-engine/interpreter.js`, `src/core/box-resolver.js`, `src/renderers/svg-renderer.js`, `src/renderers/iso-renderer.js`, `src/templates/cab-base-rounded-end.json` | Boxes DSL now supports regular boxes plus `roundedBox` and `cylinder` for bo goc panels, round knobs, rods, legs, and tube frames. |
| Model contract and runtime validation | Done | `.claude/MODEL_CONTRACT.md`, `src/core/validation.js`, `src/core/debug.js`, `src/__tests__/validation.test.mjs`, `README.md`, schema JSON, AI docs | Phase 15 adds lightweight validation and docs inspired by Articraft's contract-first workflow without adding dependencies or changing existing public API signatures. `InteriorDesigner.validateModel()` is exposed in source and public mirror. |

---

## 5. Known Issues & TODOs

### High Priority

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

- Browser DOM APIs, SVG, Canvas 2D
- JavaScript `Blob` / data URL / download via anchor
- **Three.js 0.169.0** qua importmap CDN (jsDelivr) — `three`, `three/addons/controls/OrbitControls.js`, `three/addons/geometries/RoundedBoxGeometry.js`, `three/addons/renderers/CSS2DRenderer.js`. SVGLoader đã vendor cho Phase 4.
- Vendor offline: `alpha-studio/public/vendor/three/` (5 file ~1.4MB) cho khi `navigator.onLine === false`.
- CSG vendor offline: `alpha-studio/public/vendor/three-bvh-csg/index.module.js` (`0.0.17`) và `alpha-studio/public/vendor/three-mesh-bvh/three-mesh-bvh.module.js` (`0.8.3`). These are the latest checked versions compatible with `three@0.169.0`; `three-bvh-csg@0.0.18` requires `three>=0.179.0`.

### Planned Dependencies (theo SPEC.md)

- **Phase 4:** Backend Gemini SDK + B2 client (đã có trong alpha-studio-backend).

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

Per CLAUDE.md workspace rule: nếu code thực tế khác PROJECT_SUMMARY.md, **PHẢI** cập nhật md ngay trong cùng task. Bump `Last Updated` + session number.

### Testing checklist:

- [ ] `node --check interior-design-engine.js` (hoặc `src/**/*.js` sau Phase 1) sau mỗi JS edit.
- [ ] Mở `.claude/tu_quan_ao_engine_demo.html` trong browser — verify front/side/plan/3D/specs tab.
- [ ] Verify design review panel render trước AI export panel.
- [ ] Test AI export panel sau khi sửa logic export.
- [ ] `alpha-studio dev server` → `/studio/interior-design` → iframe shell flow OK.

- [x] Phase 15 verification: `node --check` for edited runtime modules, `node --test` validation + box resolver tests, schema JSON parse, public `src/` hash comparison, and schema `fc` comparison.

### Don't forget to:

- Update file's `Last Updated` + session number sau mỗi task.
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
.claude/tu_quan_ao_engine_demo.html
```

---

**CRITICAL:** Read this entire file before making any changes to the project.
