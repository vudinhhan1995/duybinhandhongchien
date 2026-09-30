import { couple } from '../data/weddingData'
import { useAnimation } from '../hooks/useAnimation'

/**
 * ============================================================================
 *  CouplePhotosSection — section `w-kzm77mp6` (420 × 298px) · ảnh đôi
 * ============================================================================
 *
 *  Hai `com-image-block` nằm cạnh nhau, mỗi cái animate vào từ một phía:
 *    • `w-6yhej1sl`  left 12.5px · 194 × 290 · fadeInLeft  3s · chú rể
 *    • `w-j5c07h6f`  left 213.5px · 194 × 290 · fadeInRight 3s · cô dâu
 *  Toạ độ + keyframe đã nằm sẵn trong global.css theo id, không viết style tay.
 *
 *  Lệch có chủ đích so với DOM gốc:
 *   1. Bỏ class `lazy` (xem `HeroSection.jsx`) — `.lazy` là `background:none
 *      !important`, giữ lại thì mất ảnh.
 *   2. `w-j5c07h6f .image-background` trong global.css vẫn trỏ URL CDN
 *      `.../3e9e5b97...jpeg.jpg` (ảnh chân dung cô dâu CHƯA được mirror về
 *      `public/`). `weddingData.js` đã xử lý sẵn bằng cách đổi
 *      `couple.bride.portrait` sang `/assets/couple-2.jpg`, nên
 *      `backgroundImage` được đặt inline để ghi đè ĐÚNG lớp ảnh — giữ nguyên
 *      `center center / cover no-repeat` của shorthand gốc nên hộp cắt ảnh
 *      không đổi một pixel nào. Không sửa global.css.
 *      (`w-6yhej1sl` trỏ `/assets/groom.jpg` — khớp đúng `couple.groom.portrait`
 *      nên không cần override.)
 */

export default function CouplePhotosSection() {
  const animGroom = useAnimation() // w-6yhej1sl  fadeInLeft  3s
  const animBride = useAnimation() // w-j5c07h6f  fadeInRight 3s

  return (
    <div id="w-kzm77mp6" className="com-section" data-section="">
      <div className="section-wrapper full-width full-height p-relative">
        <div className="section-background p-absolute full-width full-height" />
        <div className="section-container full-height p-relative">

          {/* Ảnh chú rể */}
          <div
            id="w-6yhej1sl"
            className={`com-image-block p-absolute is-animation ${animGroom}`}
          >
            <div className="image-block-css p-relative full-width full-height full-mask-size mask-position">
              <div
                className="image-background p-absolute"
                data-image={couple.groom.portrait}
                role="img"
                aria-label={`Ảnh chú rể ${couple.groom.name}`}
              />
              <div className="image-gradient-border" />
            </div>
          </div>

          {/* Ảnh cô dâu — override lớp ảnh về bản local (xem ghi chú đầu file) */}
          <div
            id="w-j5c07h6f"
            className={`com-image-block p-absolute is-animation ${animBride}`}
          >
            <div className="image-block-css p-relative full-width full-height full-mask-size mask-position">
              <div
                className="image-background p-absolute"
                data-image={couple.bride.portrait}
                style={{ backgroundImage: `url(${couple.bride.portrait})` }}
                role="img"
                aria-label={`Ảnh cô dâu ${couple.bride.name}`}
              />
              <div className="image-gradient-border" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
