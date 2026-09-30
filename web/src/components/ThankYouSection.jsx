import { copy } from '../data/weddingData'
import { useAnimation } from '../hooks/useAnimation'

/**
 * ============================================================================
 *  ThankYouSection — section `w-irpujf29` (420 × 404px) · "Thank You!"
 * ============================================================================
 *
 *  Section nền tối: ảnh đôi phủ kín, làm mờ `brightness(50%)`, rồi hai dòng
 *  chữ trắng đè lên:
 *    • `w-mi9zkapg`  ảnh nền 420 × 405 · `filter: brightness(50%)` (trong global.css)
 *    • `w-gr20jchq`  "Thank You!"              · fadeInDown 3s · Summerfun 40px
 *    • `w-juz3up03`  "Rất Hân Hạnh Được Đón Tiếp!" · fadeInUp 3s · Pinyon 23px
 *
 *  Lệch có chủ đích so với DOM gốc:
 *   1. Bỏ class `lazy` (xem `HeroSection.jsx`).
 *   2. `w-mi9zkapg .image-background` trong global.css trỏ URL CDN chưa mirror
 *      `.../4df14d4d...jpeg.jpg`. Theo yêu cầu dự án (không sửa global.css,
 *      "kiểm tra global.css xem đang trỏ gì và giữ nguyên") ta GIỮ NGUYÊN URL
 *      đó — chỉ khai báo `data-image` để truy vết được, KHông override inline.
 *      Nếu sau này mirror được ảnh này về `public/assets/`, chỉ cần đổi 1 dòng
 *      trong global.css hoặc bỏ comment này và thêm `backgroundImage` như
 *      `CouplePhotosSection.jsx` đang làm cho `w-j5c07h6f`.
 */

export default function ThankYouSection() {
  const animThanks = useAnimation() // w-gr20jchq  fadeInDown 3s
  const animSub = useAnimation() // w-juz3up03  fadeInUp   3s

  return (
    <div id="w-irpujf29" className="com-section" data-section="">
      <div className="section-wrapper full-width full-height p-relative">
        <div className="section-background p-absolute full-width full-height" />
        <div className="section-container full-height p-relative">

          {/* Ảnh nền tối (brightness 50% do global.css đặt trên .image-block-css) */}
          <div id="w-mi9zkapg" className="com-image-block p-absolute">
            <div className="image-block-css p-relative full-width full-height full-mask-size mask-position">
              <div
                className="image-background p-absolute"
                data-image="/assets/couple-2.jpg"
                role="img"
                aria-label="Ảnh đôi"
              />
              <div className="image-gradient-border" />
            </div>
          </div>

          {/* "Rất Hân Hạnh Được Đón Tiếp!" */}
          <div
            id="w-juz3up03"
            className={`com-text-block p-absolute is-animation ${animSub}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">{copy.thankYouSub}</p>
            </div>
          </div>

          {/* "Thank You!" */}
          <div
            id="w-gr20jchq"
            className={`com-text-block p-absolute is-animation ${animThanks}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">{copy.thankYou}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
