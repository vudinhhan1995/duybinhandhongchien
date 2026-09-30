import { couple, wedding, copy } from '../data/weddingData'
import { useAnimation } from '../hooks/useAnimation'

/**
 * ============================================================================
 *  CoupleNamesSection — section `w-q53it7fi` (420 × 448px)
 * ============================================================================
 *
 *  Ngày cưới ở góc phải, tên chú rể / cô dâu / "and", và dòng thông báo.
 *
 *  Ghi chú: `w-xykbkqrm` (ngày) trong DOM gốc nằm thẳng trong `.text-block`,
 *  KHÔNG có wrapper `full-width full-height` như 3 khối h1 (`w-m7ni6fwc`,
 *  `w-yffc4isu`, `w-ysm6s9rn`). Component giữ nguyên cấu trúc gốc vì
 *  `#w-m7ni6fwc > div`, `#w-yffc4isu > div`, `#w-ysm6s9rn > div` trong
 *  global.css đang nhắm đúng wrapper đó (transform rotate 0deg).
 *
 *  `w-0hctu405` xoay 90° nhờ rule sẵn có `#w-0hctu405 > div { transform:
 *  rotate(90deg) perspective(1000px); }` ⇒ không cần inline style.
 */

export default function CoupleNamesSection() {
  const animDate = useAnimation() // w-xykbkqrm  fadeInRight    3s
  const animGroom = useAnimation() // w-m7ni6fwc  slideInRight   3s
  const animBride = useAnimation() // w-yffc4isu  slideInRight   3s
  const animAnd = useAnimation() // w-ysm6s9rn  fadeInLeft     3s
  const animAnnounce = useAnimation() // w-5n79dm9x fadeInRight     2s

  return (
    <div id="w-q53it7fi" className="com-section" data-section="">
      <div className="section-wrapper full-width full-height p-relative">
        <div className="section-background p-absolute full-width full-height" />
        <div className="section-container full-height p-relative">

          {/* Đường kẻ ngang */}
          <div id="w-n3c8cwt3" className="p-absolute">
            <div className="line-css full-width">
              <div className="line-container" />
            </div>
          </div>

          {/* Đường kẻ dọc (xoay 90° bằng rule #w-0hctu405 > div) */}
          <div id="w-0hctu405" className="p-absolute">
            <div className="full-width full-height">
              <div className="line-css full-width">
                <div className="line-container" />
              </div>
            </div>
          </div>

          {/* Ngày cưới */}
          <div
            id="w-xykbkqrm"
            className={`com-text-block p-absolute is-animation ${animDate}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">{wedding.dateShort}<br /></p>
            </div>
          </div>

          {/* Tên chú rể đầy đủ */}
          <div
            id="w-m7ni6fwc"
            className={`com-text-block p-absolute is-animation ${animGroom}`}
          >
            <div className="full-width full-height">
              <div className="text-block">
                <h1 className="text-block-css full-width">{couple.groom.name}</h1>
              </div>
            </div>
          </div>

          {/* Tên cô dâu đầy đủ */}
          <div
            id="w-yffc4isu"
            className={`com-text-block p-absolute is-animation ${animBride}`}
          >
            <div className="full-width full-height">
              <div className="text-block">
                <h1 className="text-block-css full-width">{couple.bride.name}</h1>
              </div>
            </div>
          </div>

          {/* "and" */}
          <div
            id="w-ysm6s9rn"
            className={`com-text-block p-absolute is-animation ${animAnd}`}
          >
            <div className="full-width full-height">
              <div className="text-block">
                <h1 className="text-block-css full-width">{copy.andWord}</h1>
              </div>
            </div>
          </div>

          {/* Dòng thông báo lễ cưới */}
          <div
            id="w-5n79dm9x"
            className={`com-text-block p-absolute is-animation ${animAnnounce}`}
          >
            <div className="text-block">
              <h2 className="text-block-css full-width">{wedding.announce}<br /></h2>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}