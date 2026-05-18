# Interior Design Engine — Bản cập nhật lớn (v2)

**Ngày phát hành nội bộ:** 2026-05-18
**Phạm vi:** Cải tiến toàn diện qua 5 giai đoạn (Phase 1 → Phase 5).
**Tương thích ngược:** Model JSON cũ vẫn render bình thường; public API `window.InteriorDesigner` không đổi signature, chỉ thêm phương thức mới.

---

## 1. Bảng so sánh tính năng

### 1.1 Kiến trúc & nền tảng

| Phiên bản cũ | Phiên bản mới (v2) |
|---|---|
| Một file `interior-design-engine.js` ~1174 dòng tải qua `<script>` cổ điển. | Thư viện chia thành 34 ES module có cấu trúc rõ ràng (`core/`, `renderers/`, `catalog/`, `ai/`, `ui/`, `editor/`); load qua `<script type="module">`. |
| Chuỗi ký tự tiếng Việt nằm rải rác trong code, khó dịch. | Tất cả chuỗi UI gom về `i18n` trung tâm với 2 ngôn ngữ vi/en; chuyển ngôn ngữ qua một tham số duy nhất. |
| Không có cơ chế plugin element. | Hệ thống **Catalog Registry** plug-in được; có thể đăng ký element tự định nghĩa (cánh, kệ, tay nắm, thanh treo...) bên ngoài thư viện lõi. |
| Không có quy ước id cho item; sửa/xóa item phải thao tác mảng thủ công. | **BoxService** chuẩn hóa CRUD (`create / update / delete / intersect / contains`) với id auto-generate ổn định. |
| Schema JSON cố định. | Schema mở rộng tương thích ngược: thêm `catalogId` và `props` (đều optional). |

### 1.2 Bản vẽ 2D (Front / Side / Plan)

| Phiên bản cũ | Phiên bản mới (v2) |
|---|---|
| Mọi item là hình hộp đơn giản với màu nền + viền. | Item có `catalogId` được catalog vẽ riêng: cánh Shaker có khung viền, núm tròn, thanh treo dạng đường thẳng trên Plan, ngăn kéo có rãnh tay nắm... |
| Không có khái niệm "selectable item" — bản vẽ chỉ để xem. | Mỗi item có `data-detail-id`, có thể click để chọn (kết hợp với chế độ Editor). |
| Không có chức năng review chi tiết catalog. | Review panel cảnh báo khi model dùng `catalogId` không tồn tại trong registry. |

### 1.3 Bản vẽ 3D

| Phiên bản cũ | Phiên bản mới (v2) |
|---|---|
| Tab 3D vẽ bằng Canvas 2D mô phỏng phối cảnh thủ công (hình hộp tô đậm/nhạt theo mặt). Không phải 3D thật. | Tab 3D dùng **Three.js (PBR + Soft Shadow)** thật sự: chiếu sáng, đổ bóng mềm, vật liệu vật lý, camera xoay quanh mô hình. |
| Không có vật liệu, chỉ có màu phẳng. | **8 preset vật liệu PBR** sẵn dùng: gỗ sồi, gỗ óc chó, laminate trắng, laminate đen mờ, kính khói, kim loại chải, kim loại đen mờ, vải lanh. |
| Không có đổ bóng. | Đổ bóng mềm `PCFSoftShadowMap` 2048², chiều ánh sáng từ trên xuống chếch 45°. |
| Không có tone mapping. | `ACESFilmicToneMapping` cho cảm giác ảnh điện ảnh. |
| Camera tĩnh, dùng chuột kéo để xoay nhưng không có zoom/pan chuẩn. | **OrbitControls**: kéo trái xoay, lăn chuột zoom, chuột phải pan, damping mượt. |
| Chỉ có chế độ phối cảnh ngầm định. | Nút chuyển **Phối cảnh ⇄ Trực giao** (Perspective ⇄ Orthographic). |
| Không có nhãn kích thước trên 3D. | Nút bật/tắt **Hiển thị kích thước**: nhãn `cm` overlay trên các module lớn, luôn hướng về camera. |
| Cần internet để load thư viện 3D. | **Vendor offline**: thư viện Three.js đã được copy về `alpha-studio/public/vendor/three/` (~1.4MB); shell tự chuyển sang vendor khi `navigator.onLine === false`. |
| Nếu WebGL không khả dụng → vỡ tab 3D. | Tự phát hiện thiếu WebGL → fallback về Canvas 2D cũ; thêm tham số `?renderer=canvas` để cưỡng chế dùng fallback. |

### 1.4 AI tích hợp

| Phiên bản cũ | Phiên bản mới (v2) |
|---|---|
| Chỉ có **AI export panel**: xuất bộ file (ảnh tham chiếu PNG, prompt EN/VI, hướng dẫn, model JSON) để user dán vào công cụ AI bên ngoài (Midjourney, Stable Diffusion...). | Vẫn giữ AI export panel cũ + **Upload Panel mới**: chọn ảnh phòng → AI tự sinh ra `cabinetModel` JSON ngay trong trình duyệt. |
| Không có pipeline ảnh → model. | Endpoint backend `POST /api/interior/analyze-image`: nhận URL ảnh + gợi ý → Gemini Flash 3.0 mặc định (hoặc Gemini Pro 3.1 khi hint chứa "complex"); kết quả cache 24h theo SHA256. |
| Không có pipeline tạo ảnh từ model. | Endpoint backend `POST /api/interior/generate-render` đã có khung sườn: nhận `modelJson` + `stylePrompt` + ảnh 3D PNG (base64) → upload conditioning lên B2 → trả URL render. **Image-gen upstream chưa được kích hoạt** — endpoint hiện trả lại ảnh conditioning kèm cờ `meta.pending: true`. |
| Không giới hạn số lần gọi AI cho cá nhân. | **Rate limit 5 lần / 24 giờ / user** cho mỗi endpoint (analyze, render). Admin/Mod được bypass. Tắt qua `INTERIOR_QUOTA_ENABLED=false`. |
| Không có UI so sánh trước/sau. | **Compare Slider**: web component thuần JS so sánh ảnh gốc vs render 3D bằng `clip-path`, kéo handle hoặc click + bàn phím để di chuyển. |
| Backend chỉ track 1 collection cho interior chat. | Thêm 3 collection MongoDB: `interior_analysis` (cache 24h), `interior_renders` (lưu render), `interior_quota` (đếm theo ngày). |
| Orphan checker (`/admin/storage/orphaned`) không scan các file mới. | Đã cập nhật scan thêm `interior_analysis.imageUrl`, `interior_renders.viewUrl`, `interior_renders.renderUrl` để tránh xóa nhầm. |

### 1.5 Chế độ chỉnh sửa (Editor Mode)

| Phiên bản cũ | Phiên bản mới (v2) |
|---|---|
| Không có. Muốn chỉnh model phải sửa JSON tay rồi render lại. | **`InteriorDesigner.enableEditor()`**: click vào item trên bản vẽ → sidebar bên phải hiện form chỉnh thuộc tính. |
| – | Form gồm: Tên (label), tọa độ x/y/z, kích thước w/h/d, màu (color picker), preset vật liệu (dropdown), id catalog (dropdown). |
| – | Mọi chỉnh sửa cập nhật đồng thời trên cả 4 tab (Front / Side / Plan / 3D). |
| – | **Undo / Redo** (lưu tối đa 50 snapshot bằng `structuredClone`). |
| – | **Phím tắt**: `Ctrl+Z` undo, `Ctrl+Y` hoặc `Ctrl+Shift+Z` redo, `Delete` xóa item đã chọn, `Escape` bỏ chọn. Phím bị bỏ qua khi đang gõ trong textbox (trừ Escape). |
| – | Nút trên sidebar đồng bộ với phím tắt (Hoàn tác / Làm lại / Xóa chi tiết). Nút tự disable khi không có thao tác hợp lệ. |
| – | Tab đang hoạt động được giữ nguyên qua mỗi lần re-render — không bị nhảy về Front view khi sửa. |

### 1.6 Tài liệu & quy trình

| Phiên bản cũ | Phiên bản mới (v2) |
|---|---|
| `PROJECT_SUMMARY.md` mô tả tình trạng pre-Phase-1 (monolith). | Đã cập nhật qua các session #8 → #12, phản ánh cấu trúc `src/` hiện tại + 5 phase đã hoàn thành. |
| `README.md` chỉ có hướng dẫn dùng cơ bản. | Thêm mục **Editor Mode** với ví dụ code `enableEditor()`. |
| `DATABASE.md` chỉ có schema `interiorprojects`. | Thêm section 16/17/18 cho 3 collection mới. |
| Không có file ghi rõ luồng cập nhật. | **File này** (`UPGRADE_NOTES.md`) tóm tắt thay đổi tính năng dành cho người dùng cuối. |

---

## 2. Hướng dẫn cài đặt / triển khai

Bản cập nhật v2 **không thêm dependency mới** ở frontend lib (vẫn là static lib, không build tool). Backend đã có sẵn các dependency cần thiết (`mongoose`, `@aws-sdk/client-s3`, ...). Vì vậy không cần `npm install` riêng cho bản này.

### 2.1 Frontend lib (dùng nội bộ)

Không cần install. Nếu nhúng vào trang HTML khác:

```html
<link rel="stylesheet" href="./interior-design-engine.css?v=20260518">
<!-- Importmap tự inject để chọn CDN hoặc vendor offline (xem shell.html mẫu) -->
<script type="module" src="./interior-design-engine.js?v=20260518"></script>
```

### 2.2 Alpha Studio (frontend Vercel + iframe)

Đã đồng bộ sẵn ở `alpha-studio/public/interior-design/`. Khi deploy frontend:
- File vendor Three.js (~1.4MB) nằm ở `alpha-studio/public/vendor/three/` đã commit; Vercel sẽ serve tự động khi user offline.
- Không cần env var mới cho frontend.

### 2.3 Backend (alpha-studio-backend, Fly.io)

**Env var đã có (giữ nguyên):**
- `GCLI_API_KEY` — key gọi Gemini qua gcli proxy.
- `GCLI_DIRECT_URL` — endpoint gcli proxy (mặc định `https://gcli.ggchan.dev/v1/chat/completions`).
- `B2_*` (`B2_ENDPOINT`, `B2_REGION`, `B2_ACCESS_KEY_ID`, `B2_SECRET_ACCESS_KEY`, `B2_BUCKET_NAME`, `CDN_BASE_URL`) — lưu trữ B2.
- `MONGODB_URI` — kết nối MongoDB.

**Env var mới (tùy chọn):**
- `INTERIOR_QUOTA_ENABLED` — đặt `false` để tắt rate limit 5/24h/user. Mặc định: bật. Ví dụ:
  ```bash
  fly secrets set INTERIOR_QUOTA_ENABLED=false
  ```

**Database:** 3 collection mới (`interior_analysis`, `interior_renders`, `interior_quota`) sẽ được Mongoose tự tạo ngay khi có request đầu tiên. Index TTL trên `interior_analysis.expiresAt` cũng tự được apply. **Không cần migration script.**

**B2 bucket:** không cần tạo folder thủ công — endpoint sẽ tự upload vào `interior-design/uploads/`, `interior-design/conditioning/`, `interior-design/renders/` khi cần.

### 2.4 Kiểm thử sau deploy

| Mục | Cách kiểm tra |
|---|---|
| Tab 3D Three.js render được | Mở `/studio/interior-design` (hoặc demo HTML) → click tab **3D** → thấy tủ có shadow, kéo chuột xoay. |
| Fallback Canvas 2D | Trong Chrome DevTools, vào `chrome://flags`, disable WebGL → reload demo → tab 3D hiện hint "WebGL không khả dụng". |
| Offline vendor | DevTools Network → đặt Offline → reload `/studio/interior-design` → 3D vẫn render. |
| Phân tích ảnh AI | Mở demo HTML hoặc shell → cuộn xuống panel **Phân tích ảnh phòng** → kéo ảnh phòng tủ vào → bấm **Phân tích**. Kết quả: model JSON + meta sau ~5–15s. |
| Rate limit | Spam 6 lần `/analyze-image` trong 24h → lần 6 trả `429 { message: "Đã hết lượt phân tích..." }`. |
| Editor | Mở demo → gọi `InteriorDesigner.enableEditor({mount:"#editor", model: cabinetModel, language:"vi"})` từ console → click một cánh tủ → sidebar hiện form → sửa width → bản vẽ và 3D đồng bộ realtime. |
| Compare slider | Sau khi phân tích ảnh xong, nếu callback `renderPreview` trả ảnh 3D PNG → so sánh slider hiện ảnh gốc vs render. |
| Orphan checker | Trong Admin → Storage → Orphaned → các file trong `interior-design/uploads/` / `conditioning/` / `renders/` đang được dùng KHÔNG xuất hiện trong danh sách orphan. |

---

## 3. Hạn chế đã biết & lưu ý

| Hạn chế | Ghi chú |
|---|---|
| `/generate-render` chưa thực sự gọi image-generation API. | Hiện trả về URL conditioning (ảnh 3D Three.js) kèm cờ `meta.pending: true`. Khi nào kích hoạt Imagen / Gemini Image API thì chỉ cần đổi một dòng (đã có comment `TODO`). |
| Quota dùng cửa sổ UTC midnight, không phải local time. | User Việt Nam (UTC+7) thấy reset lúc 7h sáng thay vì 0h. Có thể đổi sang local timezone sau nếu cần. |
| Editor mode không hỗ trợ kéo-thả, split module, hoặc xoay item. | Phạm vi Phase 5 cố tình chỉ là "select + edit". Có thể nâng cấp sau. |
| Property panel của editor chỉ list **detail prototype** trong dropdown catalog. | 8 element built-in đều là detail nên không ảnh hưởng. Nếu sau này có catalog cho module thì cần mở rộng. |
| Vẫn dùng Three.js qua CDN khi online. | Đã có vendor offline ~1.4MB để dự phòng; CDN tải nhanh hơn nên giữ làm mặc định. |

---

## 4. Lộ trình cải tiến tiềm năng (chưa lên kế hoạch chính thức)

| Hạng mục | Mô tả |
|---|---|
| **Image-gen thực** | Wire `/generate-render` đến Imagen 4 / Gemini 2.x Image Generation / FLUX hoặc tự host. Khi đó compare slider sẽ thấy render AI chất lượng cao thay vì view 3D gốc. |
| **Texture map cho material** | 8 preset hiện dùng màu phẳng. Có thể thêm albedo + normal + roughness map để gỗ có vân, vải có sợi, kim loại có chải xước thật. |
| **Catalog mở rộng** | Thêm tủ bếp (cánh trượt, ngăn kéo soft-close, máy rửa chén âm tủ), bàn làm việc (ngăn kéo treo, tray bàn phím), bồn rửa, thiết bị âm tủ. |
| **Editor kéo-thả** | Cho phép kéo item trực tiếp trong bản vẽ, snap vào parent module, xoay 90°. |
| **Module split** | Chia một module thành nhiều module con bằng đường kẻ (giống react-planner). |
| **AI suggest fix** | Khi review panel cảnh báo, nút "Để AI sửa" gọi backend xin chỉnh sửa cụ thể. |
| **Cộng tác realtime** | Nhiều người cùng sửa một project qua WebSocket, undo/redo riêng theo user. |
| **Xuất .gltf / .obj từ scene 3D** | Hiện chỉ xuất từ schematic; xuất từ Three.js scene sẽ giúp dựng AR/VR và đưa vào Blender/SketchUp. |
| **Animation** | Mô phỏng mở/đóng cánh, kéo ngăn để demo trải nghiệm sử dụng. |
| **AR/VR preview** | Dùng WebXR để xem tủ trong không gian thật qua điện thoại. |
| **Property panel nâng cao** | Slider thay number input, copy/paste/duplicate item, multi-select, group transform. |
| **Lịch sử ngữ nghĩa** | Hiện history lưu snapshot. Có thể chuyển sang command-pattern để hiển thị "đã sửa width của Cánh trái 50→55cm" trong undo stack. |
| **Mobile touch cho OrbitControls** | Đã hoạt động cơ bản; tinh chỉnh inertia + pinch-to-zoom mượt hơn. |
| **Performance khi model lớn** | Hiện re-render toàn bộ 4 tab mỗi lần edit. Có thể tách render incremental (chỉ update item bị sửa) khi model có >200 detail. |

---

## 5. Tóm tắt cho stakeholder

> Bản v2 nâng Interior Design Engine từ "công cụ vẽ kỹ thuật phẳng + xuất file cho AI ngoài" thành **studio 3D AI tích hợp**: người dùng có thể tải ảnh phòng, được AI sinh model, xem ngay phối cảnh 3D ánh sáng thật, chỉnh thuộc tính trực tiếp và so sánh trước/sau — tất cả không rời trình duyệt. Backend không thêm hạ tầng mới ngoài 3 collection MongoDB tự sinh. Frontend không thêm bundler. Mọi tính năng cũ (API, model JSON, export) vẫn chạy như cũ.
