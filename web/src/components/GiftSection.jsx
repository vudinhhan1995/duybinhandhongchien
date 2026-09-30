import { copy } from '../data/weddingData'

/**
 * ============================================================================
 *  GiftSection — section `w-2lvco2h8` (420 × 180px) · "Gửi Mừng Cưới"
 * ============================================================================
 *
 *  Hai thẻ mừng cưới (chú rể / cô dâu), mỗi thẻ là MỘT group `p-absolute`
 *  bọc 3 element con (khung trắng · ảnh phong bì · dòng chữ).
 *  Toạ độ của group lấy từ `#w-k4iqbane` / `#w-8m43yk8r` (trong global.css),
 *  toạ độ 3 element con lấy từ chính id của chúng — không viết style tay.
 *
 *  Hai lệch có chủ đích so với DOM gốc:
 *   1. Bỏ class `lazy` (xem `HeroSection.jsx`): `.lazy` là `background:none
 *      !important` trong global.css, WebCake gỡ nó bằng JS sau khi ảnh nạp —
 *      bản React không có JS đó nên giữ class sẽ mất nền trắng thẻ + ảnh phong bì.
 *   2. `w-3xw1sikm` / `w-pxcay859` gốc dùng `<br>` giữa 2 dòng; ở đây dùng
 *      `white-space: pre-line` + chuỗi `copy.giftGroom` / `copy.giftBride`
 *      (vốn đã chứa `\n`) — hiển thị y hệt, nhưng chữ lấy từ `weddingData`.
 *      Bỏ luôn `<br>` thừa cuối chuỗi gốc: dòng rỗng đó nằm ngoài khung 57px
 *      nên không có tác động thị giác.
 *
 *  Ảnh phong bì ĐÓNG: `/assets/envelope-closed.webp`.
 *  ⚠ `weddingData.js` (file không được sửa theo quy ước dự án) mới chỉ xuất
 *  `hero.envelope` = phong bì MỞ, và chỉ ghi chú đường dẫn phong bì đóng ở
 *  phần comment. Vì vậy ở đây khai báo hằng số cục bộ thay vì import.
 *  URL thật vẫn do `#w-rz46lrjm .image-background` / `#w-hoao336k
 *  .image-background` trong global.css quyết định.
 */

const ENVELOPE_CLOSED = '/assets/envelope-closed.webp'

export default function GiftSection({ onOpen = () => {} }) {
  return (
    <div id="w-2lvco2h8" className="com-section" data-section="">
      <div className="section-wrapper full-width full-height p-relative">
        <div className="section-background p-absolute full-width full-height" />
        <div className="section-container full-height p-relative">

          {/* Thẻ 1 — mừng cưới CHÚ RỂ (mở popup w-srpvcq4i) */}
          <div
            id="w-k4iqbane"
            className="p-absolute group-auto-scroll sroll-size"
            onClick={() => onOpen('groom')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen('groom')
              }
            }}
            aria-label="Gửi mừng cưới chú rể"
            style={{ cursor: 'pointer' }}
          >
            <div className="group-container">
              <div id="w-pjjmn8ir" className="com-rectangle p-absolute">
                <div className="rectangle-css full-mask-size mask-position full-height full-width">
                  <div className="rectangle-gradient-border" />
                </div>
              </div>
              <div id="w-rz46lrjm" className="com-image-block p-absolute">
                <div className="image-block-css p-relative full-width full-height full-mask-size mask-position">
                  <div
                    className="image-background p-absolute"
                    data-image={ENVELOPE_CLOSED}
                    role="img"
                    aria-label="Phong bì mừng cưới chú rể"
                  />
                  <div className="image-gradient-border" />
                </div>
              </div>
              <div id="w-3xw1sikm" className="com-text-block p-absolute">
                <div className="text-block">
                  <p className="text-block-css full-width" style={{ whiteSpace: 'pre-line' }}>
                    {copy.giftGroom}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Thẻ 2 — mừng cưới CÔ DÂU (mở popup w-b48ilf5m) */}
          <div
            id="w-8m43yk8r"
            className="p-absolute group-auto-scroll sroll-size"
            onClick={() => onOpen('bride')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen('bride')
              }
            }}
            aria-label="Gửi mừng cưới cô dâu"
            style={{ cursor: 'pointer' }}
          >
            <div className="group-container">
              <div id="w-qv9vbb1z" className="com-rectangle p-absolute">
                <div className="rectangle-css full-mask-size mask-position full-height full-width">
                  <div className="rectangle-gradient-border" />
                </div>
              </div>
              <div id="w-hoao336k" className="com-image-block p-absolute">
                <div className="image-block-css p-relative full-width full-height full-mask-size mask-position">
                  <div
                    className="image-background p-absolute"
                    data-image={ENVELOPE_CLOSED}
                    role="img"
                    aria-label="Phong bì mừng cưới cô dâu"
                  />
                  <div className="image-gradient-border" />
                </div>
              </div>
              <div id="w-pxcay859" className="com-text-block p-absolute">
                <div className="text-block">
                  <p className="text-block-css full-width" style={{ whiteSpace: 'pre-line' }}>
                    {copy.giftBride}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
