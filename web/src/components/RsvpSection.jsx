import { copy, rsvp } from '../data/weddingData'
import { useAnimation } from '../hooks/useAnimation'
import { RSVP_LIMITS, useRsvpSubmit } from '../hooks/useRsvpSubmit'

const STATUS_COLOR = {
  success: '#1b7f3b',
  error: '#c0392b',
  sending: '#536077',
}

/**
 * Section xác nhận tham dự — `#w-1nyt13tc` (420 × 457px).
 *
 * @param {{onSuccess?: (data: {guest: string, relation: string, wish: string, attending: string}) => void}} props
 *        `onSuccess` được gọi ngay khi gửi thành công — App dùng để mở popup cảm ơn.
 */
export default function RsvpSection({ onSuccess } = {}) {
  const titleAnim = useAnimation()
  const lineAnim = useAnimation()
  const { form, set, status, message, submit } = useRsvpSubmit({ onSuccess })

  return (
    <div id="w-1nyt13tc" className="com-section" data-section>
      <div className="section-wrapper full-width full-height p-relative">
        <div className="section-background p-absolute full-width full-height lazy" />
        <div className="section-container full-height p-relative">
          <div
            id="w-5bzhufjm"
            className={`com-text-block p-absolute is-animation ${titleAnim}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">
                {copy.saveTheDateTitle}
              </p>
            </div>
          </div>

          <div id="w-cztebelr" className={`p-absolute is-animation ${lineAnim}`}>
            <div className="line-css full-width">
              <div className="line-container" />
            </div>
          </div>

          <div id="w-rvcrbrxh" className="p-absolute">
            <form id="rvcrbrxh" className="full-width full-height" onSubmit={submit} noValidate>
              <div id="w-z925obrg" className="p-absolute">
                <div className="input-css full-width full-height">
                  <input
                    id="wi-z925obrg"
                    type="text"
                    className="full-width full-height"
                    name={rsvp.fields.guest.name}
                    placeholder={rsvp.fields.guest.placeholder}
                    value={form.guest}
                    onChange={(e) => set('guest', e.target.value)}
                    maxLength={RSVP_LIMITS.guest}
                    required={rsvp.fields.guest.required}
                    aria-label={rsvp.fields.guest.label}
                  />
                </div>
              </div>

              <div id="w-zuwe8zoz" className="p-absolute">
                <div className="input-css full-width full-height">
                  <input
                    id="wi-zuwe8zoz"
                    type="text"
                    className="full-width full-height"
                    name={rsvp.fields.relation.name}
                    placeholder={rsvp.fields.relation.placeholder}
                    value={form.relation}
                    onChange={(e) => set('relation', e.target.value)}
                    maxLength={RSVP_LIMITS.relation}
                    required={rsvp.fields.relation.required}
                    aria-label={rsvp.fields.relation.label}
                  />
                </div>
              </div>

              <div id="w-og9c0zwi" className="p-absolute">
                <div className="input-css full-width full-height">
                  <input
                    id="wi-og9c0zwi"
                    type="text"
                    className="full-width full-height"
                    name={rsvp.fields.wish.name}
                    placeholder={rsvp.fields.wish.placeholder}
                    value={form.wish}
                    onChange={(e) => set('wish', e.target.value)}
                    maxLength={RSVP_LIMITS.wish}
                    required={rsvp.fields.wish.required}
                    aria-label={rsvp.fields.wish.label}
                  />
                </div>
              </div>

              <div id="w-4okcahhg" className="p-absolute">
                <div className="select-css full-width full-height p-relative">
                  <select
                    id="ws-4okcahhg"
                    className="full-width full-height"
                    name={rsvp.attending.name}
                    value={form.attending}
                    onChange={(e) => set('attending', e.target.value)}
                    required={rsvp.attending.required}
                    data-required="1"
                    aria-label={rsvp.attending.label}
                  >
                    <option value="" disabled>
                      {rsvp.attending.placeholder}
                    </option>
                    {rsvp.attending.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <div className="chevron">
                    <span className="icon" />
                  </div>
                </div>
              </div>

              <div id="w-attendees" className="p-absolute">
                <div className="input-css full-width full-height">
                  <input
                    id="wi-attendees"
                    type="text"
                    className="full-width full-height"
                    name={rsvp.fields.attendees.name}
                    placeholder={rsvp.fields.attendees.placeholder}
                    value={form.attendees}
                    onChange={(e) => set('attendees', e.target.value)}
                    maxLength={RSVP_LIMITS.attendees}
                    required={rsvp.fields.attendees.required}
                    aria-label={rsvp.fields.attendees.label}
                  />
                </div>
              </div>

              <div id="w-vx45iwpu" className="com-button p-absolute">
                {/* Không dùng class "lazy" — xem chú thích ở MapSection.jsx. */}
                <div className="button-css full-height full-width">
                  <span className="button-loader" />
                  <div className="button-text full-width u-select-none">
                    {status === 'sending' ? 'ĐANG GỬI...' : rsvp.submitLabel}
                  </div>
                </div>
                {/* LỚP BẤM THẬT — bắt buộc, KHÔNG bỏ.
                    Bản gốc WebCake để nút submit nằm trong `.button-css` và nó là
                    thẻ bấm được. Bản port trước đây đặt `<button type="submit">`
                    với `display:none` còn `div.button-css` thì KHÔNG có onClick
                    ⇒ bấm "GỬI NGAY" không hề gửi gì (chỉ gõ Enter trong ô mới
                    submit được). Đây là `<button>` thật phủ kín hộp: trong suốt,
                    nên 1 pixel nào cũng không đổi so với bản gốc, nhưng bấm
                    chuột, chạm (mobile) và Tab+Enter đều hoạt động. */}
                <button
                  type="submit"
                  className="p-absolute"
                  disabled={status === 'sending'}
                  aria-busy={status === 'sending'}
                  aria-label={status === 'sending' ? 'ĐANG GỬI...' : rsvp.submitLabel}
                  style={{ inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
              </div>

              {message && (
                <p
                  role="status"
                  aria-live="polite"
                  className="p-absolute"
                  style={{
                    top: 355,
                    left: 0,
                    width: '100%',
                    margin: 0,
                    textAlign: 'center',
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: 12,
                    lineHeight: 1.4,
                    color: STATUS_COLOR[status] || '#000',
                  }}
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
