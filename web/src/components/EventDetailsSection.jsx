import { useAnimation } from '../hooks/useAnimation'
import { wedding } from '../data/weddingData'

/**
 * Section thông tin tiệc — `#w-im3pxp9o` (420 × 320px).
 * Toạ độ từng khối nằm trong `global.css` theo id, không set inline.
 */
export default function EventDetailsSection() {
  const titleAnim = useAnimation()
  const lineAnim = useAnimation()
  const timeAnim = useAnimation()
  const dateAnim = useAnimation()
  const lunarAnim = useAnimation()
  const atAnim = useAnimation()
  const venueAnim = useAnimation()
  const addressAnim = useAnimation()

  return (
    <div id="w-im3pxp9o" className="com-section" data-section>
      <div className="section-wrapper full-width full-height p-relative">
        <div className="section-background p-absolute full-width full-height lazy" />
        <div className="section-container full-height p-relative">
          <div
            id="w-0pxu27tu"
            className={`com-text-block p-absolute is-animation ${timeAnim}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">
                {`VÀO LÚC ${wedding.time} - ${wedding.dayLabel}`}
                <br />
              </p>
            </div>
          </div>

          <div
            id="w-afaknanm"
            className={`com-text-block p-absolute is-animation ${dateAnim}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">
                {wedding.dateParts.join(' | ')}
                <br />
              </p>
            </div>
          </div>

          <div
            id="w-44z6qo7q"
            className={`com-text-block p-absolute is-animation ${lunarAnim}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">
                {wedding.lunarNote}
                <br />
              </p>
            </div>
          </div>

          <div
            id="w-6wnismlg"
            className={`com-text-block p-absolute is-animation ${atAnim}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">
                {wedding.venue.addressLabel}
                <br />
              </p>
            </div>
          </div>

          <div
            id="w-7ef8d17j"
            className={`com-text-block p-absolute is-animation ${titleAnim}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">
                {wedding.title}
                <br />
              </p>
            </div>
          </div>

          <div
            id="w-5kxmzkjd"
            className={`com-text-block p-absolute is-animation ${venueAnim}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width" style={{ whiteSpace: 'pre-line' }}>
                {wedding.venue.fullName}
              </p>
            </div>
          </div>

          <div
            id="w-ttfn08oi"
            className={`com-text-block p-absolute is-animation ${addressAnim}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">
                {wedding.venue.address}
                <br />
              </p>
            </div>
          </div>

          <div id="w-wd0oiw7y" className={`p-absolute is-animation ${lineAnim}`}>
            <div className="line-css full-width">
              <div className="line-container" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
