# Smoke Test Checklist — Interior Design Engine

**Mục đích:** Kiểm tra tay trước khi deploy. Chạy trên **trang nhúng thật** (`/studio/interior-design` của bản build alpha-studio), KHÔNG chỉ mở file demo từ đĩa.
Lý do: engine chạy trong production là **bản mirror** `alpha-studio/public/interior-design/src/**`, không phải `tools/interior-design-engine/src/**`. Mở demo local chỉ kiểm được bản nguồn — quên đồng bộ mirror là production vẫn chạy code cũ mà không có dấu hiệu gì.

---

## Trước khi test

- [ ] `node --check` sạch cho mọi file JS vừa sửa trong `src/**`
- [ ] 🔴 **Đã đồng bộ `tools/.../src/**` → `alpha-studio/public/interior-design/src/**`** và cache-bust asset shell/demo
- [ ] Xác nhận bằng `diff -r` giữa hai thư mục `src/` → không còn khác biệt
- [ ] `alpha-studio` build/dev server đang chạy; backend `alpha-studio-backend` cũng chạy (cho catalog template + AI)

## Luồng chính

- [ ] **Mở demo nguồn:** `tu_quan_ao_engine_demo.html` → 4 tab front / side / plan / 3D đều render, tab specs có số liệu
- [ ] **3D là nguồn sự thật:** so kích thước một chi tiết giữa tab 3D và front/side/plan → **khớp nhau** (mọi view chiếu từ `resolveItemBoxes`)
- [ ] **Iso renderer:** kéo xoay + zoom mượt trong tab 3D; `exportPNG` ra ảnh đúng góc nhìn đang xem
- [ ] **Template + primitive:** render một model dùng `roundedBox` và `cylinder` → không vỡ hình, màu theo đúng palette/token
- [ ] **Review gate:** panel design review hiện **trước** panel AI export, liệt kê đúng cảnh báo của `validateModel` / `reviewModel()`
- [ ] **AI export:** bấm download package → ra đủ PNG + TXT + JSON, prompt có cả EN và VI
- [ ] **Trang nhúng thật:** `/studio/interior-design/:projectId` → iframe `shell.html` nạp được, postMessage hai chiều hoạt động (chọn phiên bản model, rollback), preview đổi theo
- [ ] **Ảnh + AI:** upload một ảnh tham chiếu → resize ≤1600px, lên B2 qua presigned URL, `analyze-image` trả về model JSON hợp lệ

## Sau khi test

- [ ] Console không có lỗi (đặc biệt: module import fail, template không tìm thấy, expression bị chặn)
- [ ] Không có style `ide-` nào rò rỉ ra trang `/studio` bọc ngoài iframe
- [ ] Bản mirror và bản nguồn vẫn khớp sau khi test (không ai sửa một bên rồi quên bên kia)
- [ ] Không có key/token nào nằm trong `public/interior-design/**` (thư mục này công khai trên Internet)
- [ ] Ghi vấn đề phát hiện vào `Known Issues & TODOs` trong `.claude/PROJECT_SUMMARY.md`

---

**📌 NOTE:** Cập nhật checklist này khi có tab/renderer/luồng AI mới. Giữ ở mức 5–7 mục ở phần "Luồng chính" — đây là smoke test, không phải regression suite.
