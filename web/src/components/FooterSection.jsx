import { copy } from '../data/weddingData'

/**
 * ============================================================================
 *  FooterSection — section `w-79vxed47` (420 × 48px) · chân trang
 * ============================================================================
 *
 *  Cả footer là MỘT group `w-iwzop4o3` dịch sang `left: -250px` (rộng 670px)
 *  — chữ canh phải (`text-align: end`) đọc là dòng credit chạy dọc mép phải
 *  khung 420px. Group chứa:
 *    • `w-nt7j2itd`  h1 credit (canh end)
 *    • `w-tafxd6ez`  line 423px
 *    • `w-g9uwq0t5`  `<a>` trong suốt 427 × 46 phủ đè lên nhóm credit
 *
 *  Lệch có chủ ý so với DOM gốc:
 *   1. Bỏ class `lazy` (xem `HeroSection.jsx`) — nếu không, các khốa nền mất
 *      nền trắng.
 *   2. ĐÃ BỎ 3 logo nhà cung cấp `w-kel7rhmc` / `w-pzk6ix51` / `w-o6p6mgaf`
 *      (xem chú thích ngay tại vị trí bỏ, và mục "3 logo" bên dưới).
 *   3. Bổ sung `target="_blank" rel="noopener noreferrer"` cho link vendor
 *      (bản gốc không có) — bắt buộc về mặt an toàn khi mở tab ngoài.
 *
 *  3 LOGO ĐÃ BỎ — `w-kel7rhmc`, `w-pzk6ix51`, `w-o6p6mgaf`:
 *  cả 3 là logo mạng xã hội (Facebook / Messenger / Instagram) của WebCake —
 *  tức NHÀ CUNG CẤP DỊCH VỤ dựng trang, không liên quan gì tới đôi Duy Bình &
 *  Hồng Chiên. Cả 3 rule trong `global.css` đều trỏ CDN `content.pancake.vn`
 *  chưa được mirror về `web/public/`. Giữ chúng ⇒ thiệp cưới mang branding
 *  bên thứ ba + phụ thuộc CDN ngoài cho 3 icon trang trí 25px. Bỏ đi không
 *  đổi layout (credit `w-nt7j2itd` rộng 660px canh phải, không phụ thuộc).
 */

/* ⚠ Còn `w-g9uwq0t5`: `<a>` trong suốt 427 × 46px
   (`background: rgba(80,110,228,0)`) trỏ `VENDOR_URL`. Ở bản gốc nó nằm đè
   lên nhóm logo nên khách bấm vào logo là ra trang nhà cung cấp. Sau khi bỏ
   3 logo, nó trở thành vùng bấm vô hình đè lên dòng credit — tệ hơn logo vì
   khách không hề biết mình đang bấm ra ngoài. GIỮ NGUYÊN theo phạm vi được
   giao (chỉ bỏ 3 logo) và báo lại để quyết định; nếu muốn bỏ thì xoá hẳn
   thẻ <a> này — không cần sửa `global.css`. */
const VENDOR_URL = 'https://www.ewedinvite.site/info'

export default function FooterSection() {
  return (
    <div id="w-79vxed47" className="com-section" data-section="">
      <div className="section-wrapper full-width full-height p-relative">
        <div className="section-background p-absolute full-width full-height" />
        <div className="section-container full-height p-relative">

          <div id="w-iwzop4o3" className="p-absolute group-auto-scroll sroll-size">
            <div className="group-container">

              {/* Dòng credit — canh phải */}
              <div id="w-nt7j2itd" className="com-text-block p-absolute">
                <div className="text-block">
                  <h1 className="text-block-css full-width">{copy.footerBrand}</h1>
                </div>
              </div>

              {/* ⚠ ĐÃ BỎ 3 LOGO `w-kel7rhmc` (25×25) · `w-pzk6ix51` (42×42) ·
                  `w-o6p6mgaf` (25×25) — KHÔNG render.
                  Lý do: đây là logo mạng xã hội của NHÀ CUNG CẤP DỊCH VỤ
                  (WebCake / ewedinvite), không liên quan gì tới đôi Duy Bình &
                  Hồng Chiên. Cả 3 rule trong `global.css` đều trỏ CDN
                  `content.pancake.vn` chưa được mirror về `public/` ⇒ nếu giữ,
                  trang thiệp cưới sẽ (1) mang branding của bên thứ ba và
                  (2) phụ thuộc CDN ngoài cho 3 icon trang trí 25px. Bỏ đi không
                  đổi layout: khối credit `w-nt7j2itd` (top 15.5 · rộng 660 ·
                  canh phải) và đường kẻ `w-tafxd6ez` đều không phụ thuộc vị trí
                  của 3 logo này. Các rule CSS tương ứng vẫn còn trong
                  `global.css` nhưng không còn id nào trong DOM trỏ tới ⇒ vô
                  hại, không cần sửa CSS.
                  Nếu sau này muốn có lại icon, dùng icon SVG inline hoặc mirror
                  file về `web/public/assets/` rồi khai báo `background-image`
                  ở một rule CSS riêng (không trỏ CDN nhà cung cấp). */}

              {/* Line kẻ ngang */}
              <div id="w-tafxd6ez" className="p-absolute">
                <div className="line-css full-width">
                  <div className="line-container" />
                </div>
              </div>

              {/* Vùng trong suốt bấm được — link vendor gốc (xem VENDOR_URL) */}
              <a
                href={VENDOR_URL}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open link ${VENDOR_URL}`}
                id="w-g9uwq0t5"
                className="com-rectangle p-absolute"
              >
                <div className="rectangle-css full-mask-size mask-position full-height full-width">
                  <div className="rectangle-gradient-border" />
                </div>
              </a>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
