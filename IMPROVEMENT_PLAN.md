# Kế hoạch hoàn thiện Interior Design Engine (`/studio/interior-design`)

**Ngày phân tích:** 2026-07-02
**Phạm vi kiểm tra:** `tools/interior-design-engine/src/`, `alpha-studio-backend/server/routes/interior.js`, `server/tools/interior/`, `server/utils/templateValidator.js`, `tools/interior-component-workshop/`, `alpha-studio/src/pages/InteriorDesignPage.tsx`, mirror `alpha-studio/public/interior-design/`.

Các phát hiện đánh dấu **[VERIFIED]** đã được xác minh bằng cách đọc code hoặc chạy test thực tế. Các phát hiện đánh dấu **[SUSPECTED]** cần kiểm tra thêm trên môi trường chạy thật (DB/prod).

---

## 1. Tóm tắt: Triệu chứng → Nguyên nhân gốc

| # | Triệu chứng user báo cáo | Nguyên nhân gốc | Mức độ |
|---|--------------------------|-----------------|--------|
| 1 | AI không dùng assets có sẵn | Catalog trong prompt hard-code chỉ 7/14 template; 42 component workshop không bao giờ xuất hiện trong prompt `/chat`; few-shot examples dạy AI dùng raw box | 🔴 Cao |
| 2 | Không có màu sắc đa dạng | Renderer **bỏ qua hoàn toàn** `item.color`/`materialRef`; toàn bộ model chỉ có 1 palette toàn cục (4 lựa chọn); template chỉ dùng token palette cố định | 🔴 Cao |
| 3 | Chiều/kích thước tủ không đúng | Agent mode không có quy tắc kích thước & domain hints; không có geometric validation sau khi AI sinh model; module thiếu dims default = kích thước cả model | 🟠 Trung bình |
| 4 | Không có bo góc | Template bo góc duy nhất (`cab-base-rounded-end`) **crash khi render** (ternary không được hỗ trợ); renderer 3D vẽ `roundedBox` như box vuông; AI không biết template này tồn tại | 🔴 Cao |
| 5 | Không làm được chi tiết | Template seed ít chi tiết nội bộ; 42 component chi tiết (đèn, cây, rèm, thiết bị...) nằm chết trong workshop; prompt không yêu cầu AI thêm chi tiết | 🟠 Trung bình |

---

## 2. Phát hiện chi tiết

### 2.1. AI không sử dụng assets có sẵn

#### F1. Catalog trong prompt chỉ liệt kê 7/14 template **[VERIFIED]**

`INTERIOR_CATALOG_VI` / `INTERIOR_CATALOG_EN` (`alpha-studio-backend/server/routes/interior.js:460-512`) là bảng **hard-code viết tay** chỉ chứa 7 template:
`upper-2door, upper-glass-2door, sliding-2door, sliding-3door, ac-recess-fold, open-bookshelf, l-desk-return`.

Trong khi `src/templates/manifest.json` có **14 template**. AI không hề biết sự tồn tại của:

- `base-cabinet-2door` (tủ bếp dưới 2 cánh)
- `base-drawer-stack` (chồng ngăn kéo)
- `wall-cabinet-2door` (tủ bếp trên)
- `tall-cabinet` (tủ đứng cao)
- `corner-cabinet` (tủ góc)
- `sink-base` (tủ chậu rửa)
- `cab-base-rounded-end` (**tủ bo đầu tròn** — chính là template giải quyết yêu cầu "bo góc")

→ Với yêu cầu tủ bếp, AI buộc phải chọn giữa raw box xấu hoặc tự chế `tplNew` (dễ sai, dễ bị reject).

#### F2. Catalog là chuỗi tĩnh, không sinh từ DB **[VERIFIED]**

Backend đã có collection `InteriorTemplate` (seed + approved) và endpoint `GET /api/interior/templates` trả về catalog merge đầy đủ, nhưng prompt `/chat` không dùng — nó dùng chuỗi tĩnh. Mọi template mới (AI commit, workshop import, admin approve) **vĩnh viễn vô hình** với AI ở luồng `/chat`.

#### F3. 42 component workshop không đến được AI **[VERIFIED]**

`tools/interior-component-workshop/components/` có 42 component chất lượng (đèn ngủ, cây cảnh, rèm, sofa cushion, TV panel, điều hòa, quạt trần, thảm...). Chuỗi phụ thuộc để chúng đến được AI:

```
components/*.json → user mở component-library.html → tick chọn → POST /templates/import
  → status approved (chỉ khi admin/mod) → template.list (CHỈ agent mode) → AI thấy
```

Ngay cả khi đã import + approved, chúng chỉ lộ ra qua tool `template.list`/`template.suggest` ở **agent mode** — luồng `/chat` mặc định vẫn không thấy. **[SUSPECTED]**: cần kiểm tra DB prod xem đã import chưa.

#### F4. Few-shot examples dạy AI dùng raw box **[VERIFIED]**

`INTERIOR_FEW_SHOT` (`interior.js:529-535`) có 4 ví dụ, trong đó **2 ví dụ đầu** (tủ áo cánh trượt, tủ bếp chữ L — 2 use case phổ biến nhất) dùng toàn raw box với `materialRef`/`color`. Chỉ ví dụ 3 dùng `tpl`. LLM bắt chước ví dụ đầu tiên mạnh nhất → thiên vị raw box.

#### F5. Agent mode: prompt gần như trống **[VERIFIED]**

- `buildAgentInitialPrompt()` (`interior.js:688-706`): chỉ có luật gọi tool, KHÔNG có `INTERIOR_DOMAIN_HINTS`, KHÔNG có `INTERIOR_DIMENSION_ANCHOR_RULE_VI`, KHÔNG có catalog table, KHÔNG có runs rule.
- `buildAgentSystemPrompt()` (`interior.js:708-720`): chỉ liệt kê tên tool + tên skill.

AI ở agent mode phải "tự nguyện" gọi `skill.read`/`template.list` mới có kiến thức domain — không có gì ép buộc. Đây là lý do agent mode ra kích thước sai và không dùng template dù có tool.

#### F6. Seed template là bước thủ công **[SUSPECTED]**

`scripts/seed-interior-templates.mjs` phải chạy tay (`node scripts/seed-interior-templates.mjs`). Nếu chưa chạy trên môi trường Fly.io → `InteriorTemplate` rỗng → `template.list`/`template.suggest` trả về rỗng → agent mode hoàn toàn không có catalog. Cần xác minh trên DB prod.

---

### 2.2. Màu sắc không đa dạng

#### F7. Renderer bỏ qua hoàn toàn `item.color` — bug nặng nhất về màu **[VERIFIED]**

`src/core/box-resolver.js:46-62` — với raw box (không có `tpl`):

```js
return [{
  ...transformBox(item, {...}),
  faces: defaultFaces(palette),   // ← LUÔN là tông gỗ của palette
  opacity: item.opacity
}];
```

`defaultFaces()` luôn trả `woodTop/woodFront/woodSide/...` từ palette — **không đọc `item.color` hay `item.materialRef`**.

Ở SVG 2D (`src/renderers/svg-renderer.js:105`): `const fill = rect.fill || item.color || ...` — nhưng `rect.fill` luôn được set từ `faces.front` ở trên, nên `item.color` **không bao giờ được dùng**. Ở 3D iso cũng vậy.

**Hệ quả:** AI có set `"color": "#1a1a2e"` (xanh navy) hay `materialRef: "laminate-white"` thì tủ vẫn render ra màu gỗ sồi. Prompt còn dặn AI dùng `materialRef + color như cũ` (`interior.js:484`) — tức là backend hứa một tính năng mà engine đã bỏ từ Phase 11.

#### F8. Một palette toàn cục cho cả model, chỉ có 4 palette **[VERIFIED]**

`src/template-engine/color-tokens.js`: `wood-oak`, `wood-walnut`, `laminate-white`, `dark-modern`. Palette là thuộc tính model-level (`model.palette`) — mọi module trong cùng thiết kế bắt buộc cùng tông. Không thể làm "thân tủ trắng + cánh gỗ + tay nắm đen vàng đồng" theo yêu cầu user.

#### F9. Prompt quảng cáo màu mà engine không render được **[VERIFIED]**

`INTERIOR_DOMAIN_HINTS` (`interior.js:434`) dạy AI về "Acrylic bóng #ffffff, #1a1a1a, #c41e3a; Kính trắng trong #e8f0f5" — AI sẽ hứa trong reply ("Đã áp dụng: cánh acrylic đỏ #c41e3a") nhưng do F7/F8, hình ra vẫn màu gỗ. User thấy AI "nói một đằng làm một nẻo".

#### F10. Từ vựng token nghèo + workshop component dùng token không tồn tại **[VERIFIED]**

Palette chỉ có ~21 token (wood*, cab*, desk*, handle, glass, dim, accent). Không có `$metal`, `$fabric`, `$stone`, `$plant`, `$ceramic`... Trong khi workshop component (vd `mod-decor-lamp-bedside.json`) dùng `"faces": { "side": "$metal" }`:
- `$metal` không resolve được → `resolveValue` trả nguyên chuỗi `"$metal"` → canvas fill không hợp lệ → màu bị bỏ qua.
- Face key `side` không nằm trong bộ face chuẩn (`top/front/right/left/back/bottom`) mà iso-renderer dùng.

→ Import workshop components vào cũng sẽ render sai màu. Cần chuẩn hoá bộ token + face keys, và validate token khi import.

#### F11. Iso renderer không có shading **[VERIFIED]**

`iso-renderer.js` vẽ flat color + stroke, không gradient/độ sáng theo hướng mặt, không texture vân gỗ. Kết hợp F7 → mọi thiết kế đều "một khối nâu phẳng".

---

### 2.3. Kích thước không đúng yêu cầu

#### F12. Quy tắc kích thước chỉ tồn tại ở luồng `/chat` **[VERIFIED]**

`INTERIOR_DIMENSION_ANCHOR_RULE_VI` ("5 mét = 500, KHÔNG nhân đôi...") chỉ được đưa vào `buildInteriorPrompt` (luồng `/chat`). Agent mode (xem F5) không có → agent tự do đặt sai chiều cao/chiều rộng.

#### F13. Module thiếu kích thước default = kích thước cả model **[VERIFIED]**

Theo `MODEL_CONTRACT.md`: "Modules default to the model size when dimensions are omitted". Nếu AI quên `height` cho 1 module tủ dưới → module đó phình ra cao 260cm chiếm cả thiết kế. Hợp lý hơn: default từ `params.default` của template, hoặc reject.

#### F14. Không có geometric sanity check sau khi AI trả model **[VERIFIED]**

`validateCabinetModel()` (backend, `interior.js:264`) chỉ check kiểu dữ liệu/số dương/limit số lượng. Không check:
- Tổng `width` các module trong run có khớp `model.width` không (hụt/thừa/chồng lấn).
- Module có nằm ngoài bounds `model.width/height/depth` không.
- Tủ trên có đặt đúng `z = depth_dưới - depth_trên` như hint không.

Engine có `reviewModel()` + `_validationWarnings` nhưng kết quả **không được feed ngược lại AI** để tự sửa — chỉ hiển thị (hoặc không) ở UI.

#### F15. Params bounds của template chỉ là advisory **[VERIFIED]**

Từ Phase 14, min/max của template params không clamp khi render mà chỉ push warning (`interpreter.js:74-87`). AI đặt `width: 400` cho `upper-2door` (max 200) vẫn render — cánh tủ bị kéo dãn biến dạng, user thấy "chiều tủ không đúng mong muốn".

---

### 2.4. Bo góc không hoạt động

#### F16. Template bo góc duy nhất bị crash — bug đã xác minh bằng test **[VERIFIED]**

`src/templates/cab-base-rounded-end.json:85` (và bản copy trong `builtin-templates.js:1241`):

```json
"x": "{{style.hand === 'right' ? width - 10 : 8}}"
```

Expression engine (`src/template-engine/expression.js`) **không hỗ trợ ternary (`? :`) lẫn `===`**. Test thực tế:

```
FAIL: "{{style.hand === 'right' ? width - 10 : 8}}" => Unexpected token "=".
FAIL: "{{width === 50}}"                            => Unexpected token "=".
OK  : "{{width == 50}}"                             => true
TEMPLATE RENDER THROWS: Unexpected token "=".
```

Vì `resolveShape`/`renderTemplate`/`collectProjectedItems` **không có try/catch**, bất kỳ model nào dùng template này sẽ làm **crash toàn bộ tab render**.

#### F17. AI viết `===`/ternary theo thói quen JS → bị chặn hoặc crash **[VERIFIED]**

- Backend validator (`templateValidator.js:11`): `ALLOWED_INNER` không chứa `?`/`:` → `tplNew` có ternary bị reject → module rơi về raw box xấu (đúng hành vi user mô tả).
- Nhưng `===` lại **pass** backend validator (regex cho phép `=`,`<`,`>`), rồi **crash** browser engine → validator và engine lệch nhau, tạo ra template "hợp lệ ở backend, chết ở browser".
- Cách chính thống để làm hình học có điều kiện là 2 shape với `"if"` — nhưng prompt catalog không hề dạy AI pattern này.

#### F18. Renderer 3D vẽ `roundedBox` như box vuông **[VERIFIED]**

`iso-renderer.js:draw()` chỉ phân nhánh `cylinder` vs `drawBox` — `roundedBox` rơi vào `drawBox` (6 mặt phẳng, góc vuông sắc). `radius` chỉ có tác dụng ở 2D SVG (`rx` của rect). → Dù template bo góc có chạy, **3D view vẫn không có bo góc**.

#### F19. CSG đã bị xoá cùng Three.js nhưng tài liệu vẫn ghi là "Done" **[VERIFIED]**

Phase 7 (`csgHints`: roundCorner, drawerCutout, glassCutout) chỉ tồn tại ở ThreeRenderer — đã xoá ở Phase 11. `PROJECT_SUMMARY.md` vẫn liệt kê "CSG hint rendering — Done" và cấu trúc `src/renderers/three/*` không còn tồn tại. AI docs (`ai-model-instructions.md`) có thể vẫn nhắc `csgHints` → AI sinh hint vô dụng.

---

### 2.5. Không làm được chi tiết

#### F20. Seed template nghèo chi tiết nội bộ **[VERIFIED]**

Vd `cab-base-rounded-end` chỉ có 3 boxes (thân + cánh + tay nắm). Không có: chân đế (plinth), phào, chỉ soi rãnh, mặt đá countertop, ray trượt, khung kính đổ chi tiết... Muốn thiết kế "có chi tiết" thì bản thân template phải chi tiết.

#### F21. `details[]` cũng dính bug màu F7 **[VERIFIED]**

Chi tiết (tay nắm, thanh treo, kệ...) khai báo dạng raw box với `color` → render ra màu palette gỗ, không phân biệt được với thân tủ → nhìn như "không có chi tiết".

#### F22. Prompt không yêu cầu mật độ chi tiết **[VERIFIED]**

Không có quy tắc kiểu "mỗi module phải có tối thiểu: cánh/mặt hộc + tay nắm + chân đế; tủ bếp phải có countertop + backsplash". `reviewModel()` có check "detail density" nhưng không nằm trong vòng lặp AI.

#### F23. Cylinder render thô **[VERIFIED]**

`drawCylinder` vẽ bằng 1 đường line dày + 2 hình tròn 2 đầu — tay nắm/chân tròn nhìn thô, không có highlight.

---

### 2.6. Tài liệu & hạ tầng

#### F24. PROJECT_SUMMARY.md drift lớn **[VERIFIED]**

Section 2 vẫn mô tả cấu trúc post-Phase 3 (Three.js, `three/*`, `catalog/`, `importmap.json`) — thực tế đã bị Phase 11 thay bằng `template-engine/` + `iso-renderer.js`, folder `src/catalog/` không còn. Feature table còn 3 dòng mô tả tính năng đã xoá là "Done". (Đã sửa một phần trong cùng task này — xem cuối file.)

#### F25. `/generate-render` vẫn là placeholder **[VERIFIED]**

Trả về conditioning URL + `meta.pending=true`, chưa nối image-gen upstream. Nghĩa là "ảnh cuối" user thấy chính là canvas iso — mọi khiếm khuyết render (màu, bo góc, chi tiết) đập thẳng vào mắt user, không có lớp AI render che.

#### F26. Không có vòng lặp phản hồi thị giác **[VERIFIED]**

AI sinh model "mù" — không bao giờ nhìn thấy kết quả render của chính nó để tự sửa (khác với flow của roomGPT reference). Agent mode có `model.preview` nhưng chỉ là JSON, không phải hình.

---

## 3. Kế hoạch hoàn thiện theo Phase

### Phase A — Hotfix (ưu tiên cao nhất, ~1-2 ngày)

**Status 2026-07-02:** Phase A completed and verified.

- [x] A1: `cab-base-rounded-end` ternary removed, builtin/template/mirror synced, DB seed upserted 14 templates.
- [x] A2: `renderTemplate` now skips invalid shapes and records validation warnings instead of crashing a whole view.
- [x] A3: `===` and `!==` aliases are supported in the browser expression tokenizer; backend validator tests cover alias pass vs ternary rejection.
- [x] A4: Raw `item.color` now renders through derived shaded faces in 2D/3D box resolution.
- [x] A5: Temporary backend prompt catalog now lists all 14 seed templates and teaches `"if"` conditional shapes instead of ternary.

| # | Việc | File | Verify |
|---|------|------|--------|
| A1 | Sửa `cab-base-rounded-end`: thay ternary bằng 2 shape dùng `"if": "{{style.hand == 'right'}}"` / `"{{style.hand != 'right'}}"`; sửa cả `builtin-templates.js` + templates JSON + mirror `public/interior-design` + re-seed DB | `src/templates/cab-base-rounded-end.json`, `src/template-engine/builtin-templates.js` | Node test render template không throw; demo HTML hiển thị bo góc 2D |
| A2 | Bọc `try/catch` quanh `resolveShape` (skip shape lỗi + đẩy vào `_validationWarnings`) để 1 template hỏng không giết cả view | `src/template-engine/interpreter.js` | Test: template chứa expression lỗi → view vẫn render các shape còn lại |
| A3 | Hỗ trợ `===`/`!==` trong tokenizer (alias về `==`/`!=`) — chống crash do thói quen JS của AI; cân nhắc thêm ternary vào cả engine + backend validator (2 phía phải cùng nhau) | `src/template-engine/expression.js`, `server/utils/templateValidator.js` | Node test 2 phía cùng pass/cùng fail một bộ expression |
| A4 | **Honor `item.color`**: trong `resolveItemBoxes`, nếu raw box có `color` → derive bộ faces từ màu đó (front = color, top = lighten 8%, side = darken 12%...) thay vì `defaultFaces(palette)` | `src/core/box-resolver.js` (+ helper darken/lighten) | Model có module `color:"#1a1a2e"` render ra đúng màu navy ở cả 2D + 3D |
| A5 | Cập nhật tạm `INTERIOR_CATALOG_VI/EN` liệt kê đủ 14 template (trước khi làm B1) + thêm dòng dạy pattern `"if"` thay ternary | `server/routes/interior.js` | Chat thử "tủ bếp có bo góc đầu tủ" → AI chọn `cab-base-rounded-end` |

### Phase B — Asset pipeline: đưa toàn bộ assets đến AI (~3-5 ngày)

**Status 2026-07-02:** Phase B completed and verified.

- [x] B1: `/chat`, proposal, and agent prompts now use a DB-backed catalog prompt section from `InteriorTemplate` (`seed` + `approved`), cached in memory for 5 minutes and capped/prioritized by request keywords.
- [x] B2: Backend startup auto-seeds built-in templates and workshop components idempotently after DB connect; `npm run seed:interior-templates` uses the same helper and logs counts.
- [x] B3: 42 current Workshop component JSON files were imported/upserted into DB as approved templates, with ingest normalization for `faces.side` and legacy `$metal`/`$wood`/`$woodLight` tokens.
- [x] B4: Active few-shot prompt examples now put common wardrobe and L-kitchen cases on `tpl` + `style` instead of raw boxes; raw box remains only as a final fallback/detail example.
- [x] B5: Agent initial/system prompts now include domain hints, dimension anchor rules, runs rule, dynamic catalog, and require `template.suggest` before the first module add/commit.

| # | Việc | Ghi chú |
|---|------|--------|
| B1 | Sinh catalog prompt **động từ DB**: hàm `buildCatalogPromptSection()` query `InteriorTemplate` (seed+approved), cache in-memory 5 phút, format thành bảng như hiện tại. Dùng chung cho `/chat`, proposal, agent | Chấm dứt vĩnh viễn drift catalog. Giới hạn ~60 dòng, ưu tiên theo category liên quan đến message (match keyword) nếu vượt |
| B2 | Tự động seed khi server khởi động (idempotent, upsert như script hiện có) hoặc thêm vào quy trình deploy; log số template sau seed | Loại bỏ rủi ro F6 — prod DB rỗng |
| B3 | Import 42 workshop components vào DB (sau khi sửa token — xem C2); phân loại category/tags chuẩn | Kiểm tra từng component render đúng trong `design-preview.html` trước khi import |
| B4 | Viết lại `INTERIOR_FEW_SHOT`: ví dụ 1 + 2 (use case phổ biến nhất) phải dùng `tpl` + `style`; giữ 1 ví dụ raw box cuối cho trường hợp bất khả kháng | Đo tỷ lệ module dùng `tpl` trong `InteriorAiLog` trước/sau |
| B5 | Bổ sung vào agent prompt: `INTERIOR_DOMAIN_HINTS` + `INTERIOR_DIMENSION_ANCHOR_RULE_VI` + catalog rút gọn + bắt buộc gọi `template.suggest` trước khi `module.add` module đầu tiên | `buildAgentInitialPrompt`/`buildAgentSystemPrompt` |

### Phase C — Màu sắc & vật liệu (~1 tuần)

**Status 2026-07-02:** Phase C completed and verified.

- [x] C1: Token vocabulary expanded across all palettes (`metalDark`, `fabric`, `stone`, `ceramic`, `plantGreen`, `ledWarm`, `accent2`, etc.); backend validates unknown `$token` references and ingest normalizes `faces.side` before validation.
- [x] C2: Added `white-oak`, `navy-brass`, `green-sage`, and `grey-minimal` palettes with i18n labels; dropdown picks them up through `listPalettes()`.
- [x] C3: Added per-module `module.style.colors` overrides in the template interpreter, schema JSON, MODEL_CONTRACT, and prompt rules.
- [x] C4: Added iso-renderer face luminance shading (`top` lighter, side/back/bottom darker) with focused tests.
- [x] C5: Synced `INTERIOR_DOMAIN_HINTS`/catalog/agent prompt rules with actual renderable palettes, tokens, and per-module color overrides.

| # | Việc | Ghi chú |
|---|------|--------|
| C1 | Mở rộng token vocabulary: `metal`, `metalDark`, `fabric`, `stone`, `ceramic`, `plantGreen`, `ledWarm`, `accent2`... cho cả 4 palette; chuẩn hoá face keys (map `side` → `left`+`right` hoặc cấm khi import) | Sửa F10; validate `$token` tồn tại trong `templateValidator` khi import/tplNew |
| C2 | Thêm 3-4 palette mới theo thị hiếu VN: `white-oak` (trắng + gỗ sáng), `navy-brass` (navy + đồng), `green-sage`, `grey-minimal` | `color-tokens.js` + i18n labels + dropdown UI |
| C3 | **Per-module color override**: cho phép `module.style.colors = { front: "#...", body: "#..." }`; interpreter merge overrides vào ctx trước khi resolve `$token` (token bị override trả màu override) | Đây là thay đổi lớn nhất về khả năng biểu đạt màu — giải quyết triệt để "thân trắng cánh xanh". Cập nhật schema JSON + MODEL_CONTRACT + prompt |
| C4 | Shading iso-renderer: nhân luminance theo mặt (top ×1.1, front ×1.0, side ×0.85) để khối có chiều sâu kể cả khi cùng màu | `iso-renderer.js` — thuần canvas, không cần lib |
| C5 | Đồng bộ `INTERIOR_DOMAIN_HINTS` với năng lực thật của engine sau C1-C3 (chỉ quảng cáo màu/vật liệu render được) | Sửa F9 |

### Phase D — Kích thước đúng & vòng lặp tự sửa (~1 tuần)

**Status 2026-07-02:** Phase D completed and verified.

- [x] D1: Backend now produces non-blocking geometry warnings for run occupied length, out-of-bounds modules, overlapping modules in the same run/y-range, and upper-vs-lower cabinet z alignment.
- [x] D2: `/chat` apply now retries once with a focused geometry-repair prompt when D1 warnings exist, then keeps the schema-valid model with warnings if repair fails.
- [x] D3: `/chat` applies missing `tpl` dimensions from `InteriorTemplate.params.default` and inline template defaults; engine normalization also uses template defaults instead of full model-size fallback for template modules.
- [x] D4: Shell render now shows `_validationWarnings` plus `reviewModel()` issues in a warning panel with vi/en i18n; source and `alpha-studio/public/interior-design/` mirror are synced.

| # | Việc | Ghi chú |
|---|------|--------|
| D1 | Geometric validation backend sau khi AI trả model: (a) tổng width module mỗi run vs model.width (lệch >2cm → cảnh báo), (b) module vượt bounds, (c) overlap giữa các module cùng run cùng y-range, (d) z của tủ trên khi có tủ dưới | Thêm vào `validateCabinetModel` dạng warnings (không block) |
| D2 | **Auto-repair loop**: nếu D1 ra warnings → gửi lại AI 1 lần duy nhất kèm danh sách lỗi cụ thể ("module X kết thúc ở 520 nhưng model.width=500...") — giống repair loop JSON hiện có của `/analyze-image` | Giới hạn 1 retry để kiểm soát cost |
| D3 | Module thiếu dims: default từ `params.default` của template (nếu có `tpl`), chỉ fallback model size cho legacy | `applyTemplateDimensionDefaults` đã có ở agent tools — dùng chung cho `/chat` |
| D4 | Hiển thị `_validationWarnings` + kết quả `reviewModel()` thành panel cảnh báo trong shell UI để user thấy ngay model lệch | UI shell + i18n vi/en |

### Phase E — Chi tiết & chất lượng render (~1-2 tuần, sau A-D)

| # | Việc | Ghi chú |
|---|------|--------|
| E1 | Nâng cấp seed templates: thêm plinth/chân đế, countertop cho base-cabinet, khung + soi rãnh cho cánh shaker, ray + bánh xe cho sliding, kệ trong nhìn qua kính | Mỗi template 6-12 boxes thay vì 2-3 |
| E2 | Quy tắc mật độ chi tiết trong prompt: mỗi module phải có cánh/mặt hộc + tay nắm; bếp phải có countertop + backsplash; tủ áo mở phải thấy thanh treo + kệ | Kèm vào catalog section |
| E3 | Vẽ `roundedBox` thật trong iso 3D: mặt front/top dùng path có arc tại 2 góc bo (đủ tốt ở mức iso; không cần mesh) | `iso-renderer.js` — sửa F18 |
| E4 | Cải thiện cylinder: thêm ellipse highlight + shading dọc trục | Sửa F23 |
| E5 | Wire `/generate-render` với image-gen upstream (Gemini Image/Imagen qua gcli-proxy) — dùng iso PNG làm conditioning image | TODO đã có sẵn trong PROJECT_SUMMARY; đây là lớp "che khuyết điểm" cuối cùng |
| E6 | (Tuỳ chọn, đánh giá lại sau E1-E5) Vòng lặp thị giác cho agent: tool `model.render` trả PNG iso → AI vision xem lại và tự sửa 1 vòng | Chi phí token cao; chỉ làm nếu E1-E5 chưa đủ |

---

## 4. Thứ tự thực hiện đề xuất & tiêu chí nghiệm thu

```
Tuần 1 : Phase A (A1→A5)  — hết crash, màu raw box đúng, AI thấy đủ 14 template
Tuần 2 : Phase B (B1→B5)  — catalog động, workshop components vào DB, agent có domain rules
Tuần 3 : Phase C (C1→C5)  — màu đa dạng thật sự, per-module override
Tuần 4 : Phase D (D1→D4)  — kích thước tự kiểm & tự sửa
Tuần 5+: Phase E           — chi tiết & render đẹp
```

**Nghiệm thu tổng (acceptance test)** — chạy 5 prompt chuẩn sau mỗi phase, chấm bằng mắt + log:

1. "Tủ bếp chữ L 4m x 2.5m, tủ dưới gỗ óc chó, tủ trên trắng, có bo góc đầu tủ" → phải dùng `runs`, 2 màu khác nhau, có `cab-base-rounded-end`, kích thước đúng 400/250.
2. "Tủ áo cánh trượt 2m4 cao 2m6, khoang treo + 3 ngăn kéo" → dùng `sliding-2door` + `base-drawer-stack`, không raw box.
3. "Kệ sách 1m8 màu xanh navy đậm" → render đúng màu navy (test F7).
4. "Phòng ngủ có tủ áo + bàn làm việc + đèn ngủ + cây cảnh" → dùng workshop components (test B3).
5. "Tủ 5 mét" → `width` đúng 500 ở cả reply + JSON + hình (test dimension anchor).

Log-based metrics từ `InteriorAiLog` / `InteriorAgentLog`:
- % module dùng `tpl` (mục tiêu: >70% sau Phase B).
- Số `droppedTemplates` (tplNew bị reject) / tuần (mục tiêu: giảm >50% sau A3+B1).
- Số lần render throw ở client (thêm log gated `ide:debug`).

---

## 5. Câu hỏi mở cần quyết định trước khi triển khai

1. **DB prod đã seed template chưa? Workshop components đã import chưa?** — Chạy `GET /api/interior/templates` trên prod để xác minh (quyết định độ khẩn cấp của B2/B3).
2. **Có thêm ternary vào expression DSL không, hay chỉ dạy pattern `if`?** — Thêm ternary tiện cho AI nhưng phải sửa đồng thời tokenizer + parser + backend validator + docs; pattern `if` không cần sửa gì ngoài prompt. Đề xuất: trước mắt chỉ alias `===`→`==` (A3) + dạy `if` (A5); ternary để sau nếu thống kê `droppedTemplates` cho thấy AI vẫn cố dùng.
3. **Per-module color override (C3) đưa vào schema chính thức hay qua `inlineTemplates`?** — Đề xuất schema chính thức `module.style.colors` vì AI dùng trực tiếp được, không cần chế template mới cho mỗi biến thể màu.
4. **Có quay lại Three.js không?** — Không, trong phạm vi plan này. Iso canvas đủ cho bản vẽ kỹ thuật; chất lượng "ảnh đẹp" nên giải bằng E5 (AI image-gen) thay vì realtime 3D.

---

## 6. Bản đồ file tham chiếu nhanh

| Vấn đề | File cần sửa |
|--------|--------------|
| Catalog prompt tĩnh | `alpha-studio-backend/server/routes/interior.js` (`INTERIOR_CATALOG_VI/EN`, `buildInteriorPrompt`, `buildAgentInitialPrompt`) |
| Màu bị bỏ qua | `tools/interior-design-engine/src/core/box-resolver.js`, `src/renderers/svg-renderer.js`, `src/renderers/iso-renderer.js` |
| Palette/token | `src/template-engine/color-tokens.js` |
| Expression/ternary | `src/template-engine/expression.js`, `alpha-studio-backend/server/utils/templateValidator.js` |
| Template bo góc hỏng | `src/templates/cab-base-rounded-end.json`, `src/template-engine/builtin-templates.js` |
| Bo góc 3D | `src/renderers/iso-renderer.js` (`drawBox`) |
| Validation hình học | `alpha-studio-backend/server/routes/interior.js` (`validateCabinetModel`) |
| Seed/import assets | `alpha-studio-backend/scripts/seed-interior-templates.mjs`, `tools/interior-component-workshop/` |
| Mirror public | `alpha-studio/public/interior-design/src/**` (mọi sửa đổi engine phải copy sang đây) |

> **Lưu ý mirror:** engine nguồn ở `tools/interior-design-engine/src/`, bản chạy thật serve từ `alpha-studio/public/interior-design/src/` — 2 bản hiện đồng bộ (46 file, cùng timestamp 2026-05-22). Mọi fix phải áp dụng cho cả hai (hoặc thêm script copy).
