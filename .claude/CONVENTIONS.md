# Conventions - Interior Design Engine

**Last Updated:** 2026-09-16

| Quy uoc | Vi du that |
|---|---|
| Model duoc validate tai boundary truoc render | `src/core/validation.js::validateModel`, `src/ui/main-renderer.js::mount3dTab` |
| 3D boxes la source truth; renderer chi project tu boxes | `src/core/box-resolver.js::resolveItemBoxes`, `src/template-engine/interpreter.js::projectBoxToView` |
| Template DSL di qua interpreter whitelist, khong dung `eval` | `src/template-engine/interpreter.js::renderTemplate`, `src/template-engine/expression.js::evalExpr` |
| Renderer co class/module rieng va dung chung resolver | `src/renderers/iso-renderer.js::IsoRenderer`, `src/renderers/svg-renderer.js::renderSvg` |

## Cuong che bang cong cu

| Quy uoc | Cong cu cuong che |
|---|---|
| JavaScript syntax | `node --check src/index.js` va file JS bi sua |
| Model/template invariants | `node --test src/**/__tests__/*.test.mjs` |
| Source va mirror khop | so sanh `src/**` voi `alpha-studio/public/interior-design/src/**` |

## Co che & Kien truc chi tiet

> Chuyen nguyen van tu `.claude/PROJECT_SUMMARY.md` ngay 2026-09-17 (nang cap v2 giu gon).

| Tinh nang / Module | Co che & kien truc chi tiet |
|---|---|
| Multi-run layouts | Top-level `runs[]` với `{id, origin:{x,z}, direction, modules}` cho L/U/island/galley. **Quy ước tọa độ (thống nhất 2026-07-03):** trong mọi run, module `x` = vị trí DỌC trục run tính từ origin, `z` = offset vuông góc từ tường; east=+x, west=-x, south=+z, north=-z (north cần origin.z ở đầu xa). Auto-offset theo thứ tự module khi không có x>0 nào. `normalizeModel()` convert legacy `modules[]` → default run, resolve về world coords (idempotent — item đã có `_runDirection` giữ nguyên). Backend `interiorModelGeometry.js` mirror cùng logic. |
| History preview panel | Phase 9 stores snapshot metadata (`id`, `timestamp`, `label`, optional `renderUrl`), renders a sidebar timeline, supports non-destructive preview mode with read-only properties and disabled edit shortcuts, restores snapshots explicitly, and attaches `generateRender()` URLs as thumbnails. |
| Gemini image-to-design pipeline | Frontend: `analyzeImage(file, opts)` resize ≤1600px → presigned B2 upload → POST /analyze-image. Debug console logs are gated by `?debug=1` or `localStorage.ide:debug=1`; unsupported schema requests log as `[ide:ai] unsupported:`. `normalizeModel()` records `_validationWarnings` for invalid void/glass material semantics. Compare-slider web component (pointer drag + clip-path). Upload panel with drop zone + hints textarea + status. Backend: analyze flow has 24h cache via sha256(imageUrl+hints), robust JSON extraction before repair loop, repair loop max 2 retries, Gemini Flash 3 default → Pro 3.1 escalate when hints contain "complex" or override="pro". AI may return `meta.unsupportedRequests[]` for unsupported schema requests and is instructed not to misuse `glass-smoked` / `kind:"void"`. Generate-render endpoint validates modelJson, uploads viewBase64 to `interior-design/conditioning/`, persists InteriorRender record. **Image-gen upstream đã wire** qua `GoogleGenAI` (`INTERIOR_IMAGE_MODEL`, default `gemini-2.5-flash-image`) — render thật upload lên `interior-design/renders/`; khi thiếu API key/lỗi thì fallback trả conditioning URL + `meta.pending=true` + `fallbackReason`. Rate limit 5/24h/user via `interiorQuotaCheck` middleware (bypass for admin/mod, disable via `INTERIOR_QUOTA_ENABLED=false`). |
| Simple property editor | `InteriorDesigner.enableEditor({mount, model, language, onChange})` orchestrates click-to-select on front/side/plan SVG views + sidebar property form (label, x/y/z, w/h/d, color, material preset dropdown, catalog id dropdown). Every edit goes through `BoxService.update` → re-render all tabs → push metadata snapshot into `History` (max 50). Keyboard: Ctrl+Z undo, Ctrl+Y/Ctrl+Shift+Z redo, Delete remove selected (via `BoxService.delete`), Escape clear selection or closes preview. Sidebar includes undo/redo/delete plus Phase 9 History preview/restore panel. Backward compat: items render unchanged when editor not mounted. |
| Template 3D-as-truth rendering | Phase 14 replaces independent `frontSvg`/`sideSvg`/`planSvg` template views with `boxes` only. SVG front/side/plan views project resolved 3D boxes, and min/max param bounds are advisory rather than render-time clamps. |
| Raw box color + per-module style.colors | Raw box có `color` → faces shade từ màu đó. Template modules nhận `style.colors` với semantic keys (front, body, handle, metal, stone...) override token palette. 8 palette (thêm white-oak, navy-brass, green-sage, grey-minimal) + token mới (metal, fabric, stone, ceramic, plantGreen, ledWarm, accent2). |
| Auto-seed templates + workshop | Server start upsert 14 builtin (status seed) + 42 workshop components (status approved), có normalize `side`→left/right và token alias, validate qua `templateValidator`. Đường dẫn assets có fallback: ưu tiên `tools/` (dev), fallback `server/assets/interior/` (bundle cho Fly image, sinh bởi `npm run sync:interior-assets` — chạy lại trước khi deploy nếu assets đổi). Skills agent cũng fallback tương tự. |
| Geometry validation + repair loop | Sau AI output: check occupied-length vs model dims, out-of-bounds, overlap từng cặp, z tủ trên/tủ dưới → warnings (không block). Có warnings → 1 vòng repair gọi lại AI với danh sách lỗi. Template thiếu dims → fill từ `params.default` (DB definitions + engine normalizeItems). |
