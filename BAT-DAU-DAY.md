# Bắt đầu tại đây — Kết nối form thiệp cưới với Google Sheets

Hiện tại nút **"GỬI NGAY"** trên thiệp cưới báo lỗi *"Chưa cấu hình máy chủ nhận đăng ký"*, vì thiếp chưa có **địa chỉ nhận** (link) để gửi lời chúc về.

Bạn cần làm **4 việc**, làm xong là khách gửi lời chúc sẽ tự động xuất hiện trong Google Sheets. Mất khoảng **10 phút**.

Cứ làm theo đúng thứ tự Phần 1 → Phần 5 nhé.

---

## Phần 0 — Kiểm tra trước

- Mở file Sheets này: <https://docs.google.com/spreadsheets/d/1WN6uaF4asheIiGjeyGXiD1-Ku-UTZNwLPVPWWZ8lj9E/edit>
- Đây là file tên **DUYBINH&HONGCHIEN**, tab đầu tiên cùng tên, đã có sẵn 5 cột: THỜI GIAN / TÊN CỦA BẠN LÀ? / BẠN LÀ GÌ CỦA DÂU RỂ NHỈ? / GỞI LỜI CHÚC ĐẾN DÂU RỂ NHÉ! / BẠN CÓ THAM DỰ KHÔNG?
- **Gặp lỗi gì cứ làm tiếp, hoặc xem Phần 6** để tra cứu cách sửa.

---

## Phần 1 — Tạo code Apps Script (3 phút)

1. **Mở tab Google Sheets đã có** ở Phần 0. **KHÔNG tạo sheet mới.**
2. Trên thanh menu, bấm **Extensions** (Tiện ích mở rộng) > **Apps Script**.
3. Mở file `apps-script\Code.gs` trên máy bằng **Notepad** (hoặc Notepad++), bấm **Ctrl+A** rồi **Ctrl+C** để copy toàn bộ code.
4. Quay lại cửa sổ Apps Script, **xoá hết code mặc định** trong khung `Code.gs` (bấm **Ctrl+A** rồi phím **Delete**), rồi bấm **Ctrl+V** để dán vào.
5. Bấm **Save** (biểu tượng hình chiếc đĩa) hoặc nhấn **Ctrl+S**.

> **Dấu hiệu thành công:** trong thanh chọn hàm phía trên, bạn nhìn thấy các hàm `doGet`, `doPost`, `setupSheet`.

---

## Phần 2 — Tạo tab và tiêu đề cột (2 phút)

1. Trong Apps Script, ở thanh chọn hàm phía trên (đang hiện chữ "Chức năng"), chọn **setupSheet**.
2. Bấm nút **Run** (hình tam giác ▶).
3. Lần đầu sẽ hiện cảnh báo *"Google hasn't verified this app"* — **đây là bình thường**, làm theo:
   - Bấm **Advanced**
   - Bấm **Go to (tên dự án)** — tên dự án là `DUYBINH&HONGCHIEN`
   - Bấm **Allow**
4. Chờ vài giây, quay lại tab Sheets. Tab `DUYBINH&HONGCHIEN` phải có **5 cột tiêu đề in hoa, nền đỏ**.

> **Ghi chú:** nếu tab đã có dữ liệu cũ thì script **KHÔNG ghi đè tiêu đề** — đó là chủ ý, không phải lỗi.

---

## Phần 3 — Deploy lấy đường dẫn (3 phút)

1. Trong Apps Script, bấm nút **Deploy** ở góc trên bên phải > **New deployment**.
2. Ở mục "Select type", bấm vào dòng có biểu tượng bánh răng ⚙️ rồi chọn **Web app**.
   - **KHÔNG chọn "Add-on"** (loại này sai).
3. Điền 2 ô:
   - **Execute as**: chọn **Me (email của bạn)**
   - **Who has access**: chọn **Anyone**
4. Bấm **Deploy**.
5. Có thể hiện màn hình "Authorize" → bấm **Authorize** > chọn tài khoản > **Allow**.
6. Xong sẽ hiện **Deployment ID** và đường dẫn dạng:
   ```text
   https://script.google.com/macros/s/AKfycb.../exec
   ```
7. Bấm **Copy** đường dẫn đó (nút copy cạnh chữ *Web app URL*), hoặc bôi đen rồi **Ctrl+C**.

> **CẢNH BÁO QUAN TRỌNG:** đường dẫn phải kết thúc bằng **`/exec`**.
> Nếu nó kết thúc bằng `/dev` thì **sai — phải deploy lại**.

---

## Phần 4 — Dán vào Render (2 phút)

1. Mở <https://dashboard.render.com>, vào **service thiệp cưới**.
2. Menu bên trái > **Environment**.
3. Bấm **Add** (hoặc **Add Environment Variable**).
4. Điền 2 ô:
   - **Key**: `VITE_RSVP_ENDPOINT`
   - **Value**: dán đường dẫn `/exec` đã copy ở bước 3.7
5. Bấm **Save Changes**.

> **Chú ý chính tả:** key phải viết đúng `VITE_RSVP_ENDPOINT` (chữ **I** viết hoa, không có dấu chấm).

---

## Phần 5 — Build lại và kiểm tra (2 phút)

> **Bắt buộc phải build lại.** Thêm biến môi trường xong mà không deploy thì trang web vẫn dùng code cũ.

1. Menu bên trái > **Deploys**.
2. Bấm **Manual Deploy** > **Deploy latest commit**.
3. Chờ **2–5 phút**, xem trạng thái chuyển sang **Live** (màu xanh).

### Kiểm tra kết quả

a) Mở trang thiệp cưới trên điện thoại. Nhớ **tải lại trang** (xoá cache nếu cần).

b) Điền thử: tên của bạn + chọn **"Có Thể Tham Dự"** + viết lời chúc, rồi bấm **GỬI NGAY**.

c) Trang phải hiện **popup cảm ơn**, không báo lỗi.

d) Quay lại Google Sheets, tab `DUYBINH&HONGCHIEN` — dữ liệu phải xuất hiện ở **dòng mới nhất**.

> **SAU KHI TEST XONG:** xoá dòng test đó khỏi Sheets.
> Bấm chuột phải vào số dòng > **Xoá dòng**.

---

## Phần 6 — Nếu gặp lỗi

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Vẫn thấy "Chưa cấu hình máy chủ nhận đăng ký" | Chưa build lại sau khi thêm env, hoặc sai chính tả key | Kiểm tra key đúng `VITE_RSVP_ENDPOINT` (chữ I, viết hoa) rồi **Manual Deploy** lại |
| "Script function not found: doGet" | Deploy sai loại | Deploy lại, chọn đúng **Web app** |
| Không thấy mục "Anyone" ở Who has access | Tài khoản dùng bản doanh nghiệp | Deploy lại, xem lại **Execute as = Me**, hoặc dùng tài khoản Google cá nhân |
| Bấm GỬI NGAY không có gì xảy ra | Trình duyệt đang cache JS cũ | Nhấn **Ctrl+Shift+R** (xoá cache cứng) |
| Deploy trên Render báo lỗi | Xem Phần 7 | — |

---

## Phần 7 — Ghi chú thêm

- Link Apps Script là **công khai**: ai có link cũng gửi được dữ liệu vào sheet. Đừng dùng cho thông tin nhạy cảm. Nếu bị spam thì thêm Google reCAPTCHA.
- Quota tài khoản Google miễn phí: **500 lần gọi/ngày**. Với thiệp cưới thì dư sức.
- Mỗi lần **sửa code Apps Script** phải **deploy lại**, nếu không thay đổi sẽ không có hiệu lực:
  **Deploy > Manage deployments > Edit (bút chì) > Version: New version > Deploy**.
- Link Apps Script có thể thu hồi lúc nào bằng: **Deploy > Manage deployments > bút chì > Disable**.
- Toàn bộ hướng dẫn chi tiết hơn nằm trong file `apps-script/README.md`.
