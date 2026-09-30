import { useAnimation } from '../hooks/useAnimation'
import { wedding } from '../data/weddingData'

/**
 * Section bản đồ — `#w-j7s4utwr` (420 × 353px).
 * `w-tam1vool` là html-box nhúng iframe Google Maps, `w-068i77jq` là nút mở chỉ đường.
 */
export default function MapSection() {
  const buttonAnim = useAnimation()

  return (
    <div id="w-j7s4utwr" className="com-section" data-section>
      <div className="section-wrapper full-width full-height p-relative">
        <div className="section-background p-absolute full-width full-height lazy" />
        <div className="section-container full-height p-relative">
          <div id="w-tam1vool" className="com-html-box p-absolute">
            <div className="frame-html-box full-width full-height">
              <iframe
                src={wedding.map.embedUrl}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title="Bản đồ địa điểm tổ chức tiệc"
              />
            </div>
          </div>

          <a
            id="w-068i77jq"
            href={wedding.map.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`com-button p-absolute is-animation ${buttonAnim}`}
            title="Mở Google Maps"
          >
            {/* Bản gốc có class "lazy" ở đây nhưng JS WebCake gỡ đi sau khi
                nạp; bản port không có JS đó và `.lazy` đặt
                `background: none !important` nên sẽ mất nền trắng của nút. */}
            <div className="button-css full-height full-width">
              <span className="button-loader" />
              <div className="button-text full-width u-select-none">
                {wedding.map.buttonLabel}
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}
