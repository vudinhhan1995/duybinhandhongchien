import { couple } from '../data/weddingData'
import { useAnimation } from '../hooks/useAnimation'

/**
 * ============================================================================
 *  PhotoSection — section `w-ubtq6ntw` (420 × 361px)
 * ============================================================================
 *
 *  Một group gồm: khung trắng, ảnh đôi, và đường kẻ bên dưới.
 *
 *  Ảnh gốc trỏ CDN `content.pancake.vn/.../9d1b29d6...jpg`; `global.css` đã
 *  được port sang bản local `/assets/couple-2.jpg` nên không cần gì thêm ở đây.
 *  `data-image` chỉ để giữ liên kết với `weddingData` (attribute vô hại, URL
 *  thật vẫn do `#w-i0djb3fi .image-background` trong global.css quyết định).
 *
 *  Bỏ class `lazy` khỏi `.rectangle-css` / `.image-background` — xem giải thích
 *  ở HeroSection.
 */

export default function PhotoSection() {
  const animGroup = useAnimation() // w-qj312suo  fadeInUp 2s
  const animLine = useAnimation() // w-7rctms59  zoomIn   3s

  return (
    <div id="w-ubtq6ntw" className="com-section" data-section="">
      <div className="section-wrapper full-width full-height p-relative">
        <div className="section-background p-absolute full-width full-height" />
        <div className="section-container full-height p-relative">

          <div
            id="w-qj312suo"
            className={`p-absolute is-animation group-auto-scroll sroll-size ${animGroup}`}
          >
            <div className="group-container">

              <div id="w-8grm4rnu" className="com-rectangle p-absolute">
                <div className="rectangle-css full-mask-size mask-position full-height full-width">
                  <div className="rectangle-gradient-border" />
                </div>
              </div>

              <div id="w-i0djb3fi" className="com-image-block p-absolute">
                <div className="image-block-css p-relative full-width full-height full-mask-size mask-position">
                  <div
                    className="image-background p-absolute"
                    data-image={couple.bride.portrait}
                    role="img"
                    aria-label=""
                  />
                  <div className="image-gradient-border" />
                </div>
              </div>

              <div
                id="w-7rctms59"
                className={`p-absolute is-animation ${animLine}`}
              >
                <div className="line-css full-width">
                  <div className="line-container" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}