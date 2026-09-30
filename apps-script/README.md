# Apps Script — Nhận lời chúc & xác nhận tham dự

Script nhận dữ liệu từ form thiệp cưới (React SPA) và ghi vào Google Sheets.

| File | Vai trò |
| --- | --- |
| `Code.gs` | Toàn bộ mã nguồn. Dán file này vào trình soạn thảo. |
| `appsscript.json` | Manifest. Chỉ hiện trong Project Settings sau khi bật "Show appsscript.json manifest file in editor". |

---

## Vì sao cần đọc kỹ phần này trước khi làm

Trang thiệp cưới là một React SPA (static site) deploy trên Render — **không có backend Node**. Nghĩa là form phải POST thẳng từ trình duyệt sang Web App của Apps Script.

Điều này tạo ra một vướng lớn: **Apps Script không bao giờ gửi header CORS.**

Nếu React gửi `Content-Type: application/json`, trình duyệt coi đó là "non-simple request" nên nó gửi một request `OPTIONS` (preflight) trước. Apps Script không trả header CORS cho preflight → request bị chặn → form hỏng, dù phía Apps Script hoàn toàn có thể nhận dữ liệu.

**Cách xử lý bắt buộc (phía React):** gửi với

```js
headers: { 'Content-Type': 'text/plain;charset=utf-8' }
```

Đây là Content-Type thuộc nhóm "simple" nên **không có preflight**, Apps Script nhận được dữ liệu bình thường.

Hệ quả: khi gửi kiểu `text/plain`, Apps Script **không** coi là form submission, nên `e.parameter` sẽ **rỗng**. Toàn bộ JSON nằm trong `e.postData.contents` (chuỗi thô). Vì vậy `Code.gs` ưu tiên `JSON.parse(e.postData.contents)` và mới fallback sang `e.parameter` — nhờ vậy script vẫn chạy đúng qua proxy hoặc khi test bằng form HTML thuần.

Mẫu fetch phía React (tham khảo, không bắt buộc phải giống):

```js
await fetch(import.meta.env.VITE_RSVP_ENDPOINT, {
  method: 'POST',
  mode: 'no-cors',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify({ guest, relation, wish, attending, source, device }),
});
```

Lưu ý: với `mode: 'no-cors'`, phía React **không đọc được** phản hồi (response bị opaque). Nên hãy hiển thị thông báo thành công ngay sau khi gửi. Nếu sau này cần biết server báo lỗi gì, hãy dựng một proxy nhỏ (Render/Vercel/Cloudflare) — khi đó đọc kết quả bình thường.

---

## Phần A — Tạo file Sheets mới

1. Mở trình duyệt, vào <https://sheets.google.com> và đăng nhập tài khoản Google của bạn.
2. Bấm nút trống màu xanh (+) ở góc trên bên trái để tạo spreadsheet mới.
3. Đặt tên file cho dễ nhớ, ví dụ: `Thiep Cuoi - Loi chuc` (Google Sheets chưa cho đổi tên file ngay khi tạo — đổi tên sau cũng được, không quan trọng).
4. Để nguyên tab mặc định `Sheet1`, không cần xoá hay đổi tên. Script sẽ tự tạo tab `Lời chúc & Xác nhận`.

> Không dùng lại sheet cũ có ID `11DzmjfIMBGYYFBQYHymWIvORA8EYAAmdM7QTTTAThmU`. Hãy tạo sheet mới hoàn toàn như hướng dẫn này.

---

## Phần B — Cài Apps Script vào file Sheets

1. Mở file Sheets vừa tạo.
2. Vào menu **Extensions** (Tiện ích mở rộng) → **Apps Script**.
   Một tab mới mở ra, giao diện kiểu Code Editor.
3. Xoá hết code mặc định trong file `Code.gs` (dòng `function myFunction() {}`).
4. Mở file `Code.gs` trong thư mục `apps-script/` của dự án, copy **toàn bộ** nội dung, dán vào ô trình soạn thảo. Lưu (Ctrl+S hoặc Cmd+S).
5. Thêm manifest `appsscript.json`:
   - Trong trình soạn thảo Apps Script, bấm biểu tượng bánh răng (Project Settings) ở góc trên bên phải.
   - Bật công tắc **"Show `appsscript.json` manifest file in editor"**.
   - Quay lại tab Files, bạn sẽ thấy file `appsscript.json` xuất hiện. Mở nó, xoá nội dung mặc định, dán toàn bộ nội dung file `appsscript.json` trong dự án, rồi lưu.

### Về quyền truy cập (oauthScopes) trong `appsscript.json`

Manifest dùng scope:

```
https://www.googleapis.com/auth/spreadsheets
```

Đây là scope **đầy đủ** (đọc/ghi mọi spreadsheet bạn có quyền), và nó là scope **bắt buộc** cho trường hợp này vì script dùng `SpreadsheetApp.openById(SHEET_ID)` — hàm này cần mở một file bất kỳ bằng ID, không phụ thuộc file đang mở.

Ngược lại, scope hẹp hơn là `https://www.googleapis.com/auth/spreadsheets.currentonly` chỉ cho phép truy cập **file Sheets đang gắn với script**. Nhìn thì "an toàn hơn", nhưng khi chạy dưới dạng Web App thì script không còn gắn với file nào cả → mọi lời chúc sẽ báo lỗi quyền truy cập. Đây chính là lý do ta cố ý dùng scope rộng. Vấn đề bảo mật của scope rộng được giảm thiểu bằng cách: Web App chỉ nhận dữ liệu công khai, và mọi thao tác ghi đều đi qua script do chính bạn sở hữu.

---

## Phần C — Lấy SHEET_ID và dán vào Code.gs

1. Quay lại tab Google Sheets (file vừa tạo).
2. Nhìn vào thanh địa chỉ trình duyệt, URL có dạng:

   ```
   https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit#gid=0
   ```

3. Phần ID chính là chuỗi nằm giữa `/d/` và `/edit`:

   ```
   1AbCdEfGhIjKlMnOpQrStUvWxYz
   ```

   (Bỏ qua cả `#gid=0` ở cuối — đó không phải ID.)
4. Quay lại trình soạn thảo Apps Script, tìm dòng hằng số trong `Code.gs`:

   ```js
   var SHEET_ID = '';
   ```

   Dán ID vào giữa hai dấu nháy:

   ```js
   var SHEET_ID = '1AbCdEfGhIjKlMnOpQrStUvWxYz';
   ```

5. Lưu lại (Ctrl+S / Cmd+S).

---

## Phần D — Chạy setupSheet() một lần

1. Trong trình soạn thảo Apps Script, ở thanh công cụ phía trên có ô chọn hàm (mặc định hiện `myFunction`). Bấm vào đó và chọn **`setupSheet`**.
2. Bấm nút **Run** (hình play ▶).
3. Lần chạy đầu tiên sẽ hiện thông báo **"Google hasn't verified this app"** — đây là hành vi bình thường với mọi Apps Script tự viết, không phải lỗi.
   - Bấm **Advanced** (Nâng cao)
   - Bấm **Go to <tên dự án>** (mở bằng Google Apps Script)
   - Bấm **Allow** (Cho phép) để cấp quyền ghi vào Sheets
4. Khi chạy xong, quay lại Google Sheets: bạn sẽ thấy tab mới tên **"Lời chúc & Xác nhận"** đã được tạo, có hàng tiêu đề in đậm nền xanh, cột đã rộng vừa, và dòng 1 đã được khoá khi cuộn.

Nếu thấy thông báo lỗi kiểu "Không tìm thấy tệp" hoặc "Requested entity was not found", gần như chắc chắn bạn dán sai SHEET_ID — kiểm tra lại Phần C.

---

## Phần E — Deploy Web App

1. Trong trình soạn thảo Apps Script, bấm nút **Deploy** ở góc trên bên phải → **New deployment**.
2. Bấm biểu tượng bánh răng ⚙ cạnh chữ **Select type** → chọn **Web app**.
3. Điền vài trường:
   - **Description**: gõ tên chẳng hạn `Loi chuc thiep cuoi v1`
   - **Execute as**: chọn **Me** (tài khoản của bạn)
   - **Who has access**: chọn **Anyone**
4. Bấm **Deploy**.
5. Màn hình hiện ra thông báo quyền lần nữa. Nếu gặp cảnh báo "unverified app" thì làm y hệt Phần D: **Advanced → Go to <tên dự án> → Allow**. Sau đó bấm **Authorize**.
6. Xong, bạn sẽ thấy URL web app dạng:

   ```
   https://script.google.com/macros/s/AKfycbXXXXXXXX/exec
   ```

### Hai điểm cực kỳ quan trọng

**Phải chọn "Anyone", không phải "Only myself".**
Nếu chọn "Only myself", khách mời (người không đăng nhập Google) sẽ không gửi được lời chúc, và trang web sẽ báo lỗi đăng nhập. Chọn "Anyone" là bắt buộc vì khách truy cập website của bạn là người lạ.

**Phải dùng URL kết thúc bằng `/exec`, không phải `/dev`.**
Deploy cung cấp hai URL:
- `/dev` — chỉ chạy được với tài khoản **sở hữu** script và dùng cho gỡ lỗi, có màn hình nhập quyền thêm nữa.
- `/exec` — URL production, ai có URL cũng gọi được. **Đây là URL dùng cho website.**

Có thể phân biệt: URL chứa đoạn `/dev` hoặc `/dev/` giữa chuỗi là URL gỡ lỗi.

**Sau khi deploy xong, lưu lại URL `/exec`.** Bạn sẽ dán URL này vào file `.env` của dự án React ở Phần F. Lưu ý: mỗi lần deploy lại sẽ sinh URL mới (URL cũ vẫn chạy được).

---

## Phần F — Test web app

1. Mở một tab trình duyệt mới, dán URL `/exec` vào thanh địa chỉ, Enter.
2. Bạn phải thấy nội dung JSON trông như sau:

   ```json
   {"ok": true, "status": "ready", "sheet": "Lời chúc & Xác nhận", "rows": 1}
   ```

   - `ok: true` — web app đang chạy tốt.
   - `status: ready` — server đã sẵn sàng nhận POST.
   - `rows: 1` — hiện có 1 dòng (dòng tiêu đề).

   Nếu thấy `ok: false`, đọc phần `error` trong JSON — thường là do chưa dán SHEET_ID hoặc chưa chạy `setupSheet()`.
3. Test thử việc gửi dữ liệu (không bắt buộc, nhưng nên làm để chắc chắn mọi thứ hoạt động trước khi lên website). Mở DevTools (F12) trên bất kỳ trang nào, vào tab **Console**, dán và Enter:

   ```js
   fetch('https://script.google.com/macros/s/AKfycbXXXXXXXX/exec', {
     method: 'POST',
     mode: 'no-cors',
     headers: { 'Content-Type': 'text/plain;charset=utf-8' },
     body: JSON.stringify({
       guest: 'Nguyễn Văn Test',
       relation: 'Bạn thân chú rể',
       wish: 'Chúc hai bạn trăm năm hạnh phúc!',
       attending: 'Có Thể Tham Dự',
       source: 'https://example.com/thiep-cuoi',
       device: 'Chrome / Windows'
     })
   }).then(() => console.log('da gui'));
   ```

4. Quay lại Google Sheets: tab "Lời chúc & Xác nhận" phải có thêm 1 dòng mới.
5. Dán URL `/exec` vào file `.env` của dự án React (tạo file này ở thư mục gốc dự án nếu chưa có):

   ```
   VITE_RSVP_ENDPOINT=https://script.google.com/macros/s/AKfycbXXXXXXXX/exec
   ```

6. Khởi động lại dev server của dự án React (`npm run dev`) để biến `import.meta.env` được nạp lại.

---

## Phần G — Cấu trúc bảng dữ liệu

Mỗi lượt gửi form tạo thêm đúng 1 dòng, với các cột:

| Cột | Nội dung | Ví dụ |
| --- | --- | --- |
| Thời gian gửi | Thời điểm khách bấm nút, theo múi giờ `Asia/Ho_Chi_Minh` | 30/09/2026 10:24:31 |
| Tên khách mời | Họ tên khách nhập vào form (tối đa 200 ký tự) | Nguyễn Thị Lan |
| Quan hệ với Dâu Rể | Quan hệ khách tự khai (tối đa 200 ký tự, có thể để trống) | Bạn thân cô dâu |
| Lời chúc | Nội dung lời chúc (tối đa 2000 ký tự, có thể để trống) | Mừng hai bạn trăm năm hạnh phúc |
| Có tham dự không | Chỉ có 2 giá trị: `Có Thể Tham Dự` hoặc `Không Thể Tham Dự` | Có Thể Tham Dự |
| Nguồn truy cập | URL trang mà khách đang xem | https://ten-domain/thiep-cuoi |
| Thiết bị | User agent rút gọn, tiện khi cần thống kê | Chrome / Windows |

Ghi chú về hai giá trị cố định ở cột "Có tham dự không":

- **`Có Thể Tham Dự`** — khách sẽ tới dự. Script cũng chấp nhận input `có`, `yes`, `true`, `1` và quy về đúng giá trị này.
- **`Không Thể Tham Dự`** — khách không tới được (đi công tác, ở xa...). Script chấp nhận input `không`, `no`, `false`, `0` và quy về đúng giá trị này.

Bất kỳ giá trị nào khác đều bị từ chối với `ok: false` — cố tình làm vậy để bảng không bị lẫn lộn dữ liệu rác.

Cột "Thời gian gửi" dùng định dạng ngày giờ của Sheets nên bạn có thể sort, lọc, hoặc tính tổng số lời chúc theo ngày.

---

## Phần H — Xử lý sự cố

### 1. Báo `Script function not found: doPost`

Có nghĩa bạn đang gọi URL sai loại. Kiểm tra:

- URL có kết thúc bằng `/exec` không? Nếu là `/dev` thì chỉ tài khoản sở hữu mới gọi được.
- Bạn đã Deploy (Phần E) sau lần sửa code cuối cùng chưa?

### 2. Bị chặn CORS, console báo lỗi mạng

Gần như luôn là do gửi sai `Content-Type` ở phía React. Kiểm tra trong DevTools > Network:

- Nếu thấy một request `OPTIONS` bị fail trước khi POST chạy → sai, phải đổi sang `text/plain;charset=utf-8`.
- Nếu thấy POST có status 200 nhưng response báo `(failed) net::ERR_FAILED` → đó là hành vi bình thường của `mode: 'no-cors'`, không phải lỗi. Hãy kiểm tra dữ liệu trong Sheets.

Nếu vẫn lỗi sau khi đã làm đúng `text/plain`, hãy dựng proxy nhỏ (Render/Vercel/Cloudflare) để nhận POST rồi proxy sang Apps Script.

### 3. Quota: 500 lần gọi mỗi ngày

Tài khoản Google miễn phí (gmail.com) giới hạn:

- Apps Script: **500 lần gọi Cloud Function mỗi ngày** (tính cả mỗi lần bấm Run lẫn mỗi lần có người gửi lời chúc).
- Google Sheets API: quota thấp hơn nữa.

Điều này có nghĩa: nếu trang thiệp cưới được nhiều người chia sẻ, khả năng chạm trần rất cao. Khi chạm trần, mọi lời chúc sẽ **không được ghi** mà không có cảnh báo rõ ràng.

Khuyến nghị xử lý, theo thứ tự ưu tiên:

1. Nâng cấp lên **Google Workspace** (Business hoặc Enterprise). Tài khoản có hạn mức cao hơn nhiều, và quota tính theo cả nhóm người dùng. Đây là cách sạch nhất.
2. Nếu không nâng cấp được, hãy dùng một **Form thật**: Google Form + Google Sheets, hoặc một dịch vụ thu thập form miễn phí khác (Formspree, Google Apps Script qua proxy có cache...).

Đừng dựa vào việc "gửi thử vài lần" để kết luận quota còn dư — quota tính cả những lần bạn tự test.

### 4. Sửa code mà không thấy thay đổi

Apps Script **không tự deploy lại**. Sau khi sửa `Code.gs` bạn phải:

1. Deploy → **Manage deployments** → bấm bút chỉnh (✏️) → chọn phiên bản mới (ví dụ `Version 2`) → **Deploy**.
2. Hoặc tạo deployment mới (New deployment).

Đây là nguyên nhân số 1 khiến người dùng nghĩ code của họ đúng nhưng vẫn không chạy.

### 5. Báo lỗi "Hệ thống bận, vui lòng thử lại"

Script không giành được khoá trong 30 giây, nghĩa là có một loạt lời chúc đến cùng lúc. Thử lại sau vài giây. Nếu xảy ra thường xuyên, kiểm tra xem bạn có vô tình thêm `Utilities.sleep()` hay một hàm chạy lâu vào trong script không.

### 6. Báo lỗi "Script function not found: doGet" khi mở URL

Bạn đang mở URL cũ từ một deployment đã bị xoá. Deploy lại và lấy URL mới.

---

## Phần I — Bảo mật

**URL `/exec` là URL công khai. Ai có URL cũng POST được vào sheet của bạn.**

Cụ thể:

- Bất kỳ ai đọc được mã nguồn React trên trình duyệt của mình cũng thấy URL này, vì URL phải nằm trong code client. Không có cách nào giấu URL khỏi trình duyệt.
- Họ có thể gửi lời chúc giả, hàng loạt, làm đầy sheet.

Giảm thiểu (script đã áp dụng sẵn):

- **Chống gửi trùng**: cùng một nội dung gửi lại trong 60 giây sẽ bị bỏ qua.
- **Cắt độ dài**: tên ≤ 200, quan hệ ≤ 200, lời chúc ≤ 2000 ký tự.
- **Chỉ nhận 2 giá trị hợp lệ** cho trường xác nhận tham dự, mọi thứ khác bị từ chối.
- **Khoá khi ghi**: `LockService` chống việc nhiều request cùng lúc làm hỏng dữ liệu.

Không được làm:

- Không dùng web app này cho dữ liệu nhạy cảm (họ tên + số điện thoại, CCCD, email, địa chỉ nhà...). Nếu cần thu email/SĐT để đến sự kiện, hãy cân nhắc dùng Google Form (cũng chống spam tốt hơn).
- Không dùng làm nơi lưu mật khẩu, khoá API, token.

Nếu bị spam:

1. Thêm **Google reCAPTCHA v3** ở phía React, chỉ gửi lời chúc khi điểm score >= 0.5 (reCAPTCHA v3 không hiện checkbox nên không ảnh hưởng trải nghiệm người dùng; miễn phí).
2. Hoặc chuyển sang dùng Google Form — có bộ lọc spam tích hợp sẵn.
3. Thêm giới hạn tần suất theo IP ở proxy nếu bạn dựng proxy.

Cuối cùng, quyền truy cập spreadsheet:

- Chia sẻ sheet với đúng những tài khoản cần xem, đặt quyền **Viewer/Commenter** thay vì **Editor**.
- Không chia sẻ sheet "Bất kỳ ai có đường liên kết" nếu bạn không muốn ai đọc được lời chúc.
