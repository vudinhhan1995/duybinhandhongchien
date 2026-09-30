import { useEffect } from 'react'
import { copy } from '../data/weddingData'
import { useAnimation } from '../hooks/useAnimation'

/**
 * ============================================================================
 *  ThankYouPopup — popup cảm ơn sau khi gửi form RSVP
 * ============================================================================
 *
 *  Bản gốc: `w-__popup_default__` — popup mặc định của WebCake, 400 × 500px.
 *    • `w-3hkjex1b`  nút đóng ✕ 29 × 29 (top 0 · left 371)
 *    • `w-yuvcbgge`  banner 390 × 340, bo góc trên `10px 10px 0 0`
 *    • `w-1bubiyix`  h2 "Cảm Ơn Quý Khách…" · fadeInUp 4s · Cormorant 20px
 *    • `w-igy0tluk`  p  "Thank You!"            · Pinyon 30px
 *
 *  ⚠ `w-1bubiyix` có `left: -62.5px` và rộng 525px trong khi popup chỉ rộng
 *    400px — tức là khối chữ CỐ TÝNH tràn ra ngoài mép trái. Đây là lỗi bố cục
 *    có sẵn của bản gốc (WebCake đặt nhầm left), nhưng yêu cầu là clone 1:1
 *    nên GIỮ NGUYÊN: toạ độ nằm trong global.css theo id, component không
 *    sửa gì cả.
 *
 *  Lệch có chủ đích so với DOM gốc:
 *   1. Bỏ class `lazy` (xem `HeroSection.jsx`).
 *   2. Bản gốc luôn nằm trong DOM, bật/tắt bằng `d-none`; ở đây `open === false`
 *      ⇒ trả về `null` nên không cần `d-none`.
 *   3. `<br>` trong `<h2>` gốc → `white-space: pre-line` + `\n`
 *      (`copy.popupThankYou` vốn đã chứa `\n`). Bỏ `<br>` thừa cuối chuỗi gốc:
 *      dòng rỗng đó nằm ngoài khung 60px nên không ảnh hưởng thị giác.
 *   4. Nút ✕ thêm `role="button"` + `tabIndex` + `aria-label` cho bàn phím.
 *
 *  `id="popup-backdrop"` là id dùng chung với `BankPopup.jsx` — cả hai đều chỉ
 *  render backdrop khi đang mở, nên chỉ tồn tại đúng 1 bản nếu App mở popup
 *  bằng MỘT state chung (xem ghi chú bàn giao).
 */

export default function ThankYouPopup({ open = false, onClose = () => {} }) {
  // Escape đóng popup + khoá cuộn body. Khai báo trước lệnh return null.
  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  // `w-1bubiyix` chạy fadeInUp 4s ngay khi popup xuất hiện → hook phải được
  // gọi ở mọi render, nên đặt trước lệnh return null.
  const animHeading = useAnimation()

  if (!open) return null

  return (
    <>
      <div
        id="popup-backdrop"
        className="popup-backdrop full-width full-height"
        onClick={onClose}
        aria-hidden="true"
      />

      <div id="w-__popup_default__" className="com-popup popup-center" role="dialog" aria-modal="true">
        <div className="popup-wrapper p-absolute full-width full-height">
          <div className="popup-background p-absolute full-width full-height" />

          {/* Nút đóng ✕ */}
          <div
            id="w-3hkjex1b"
            className="com-rectangle p-absolute"
            onClick={onClose}
            role="button"
            tabIndex={0}
            aria-label="Đóng"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClose()
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="rectangle-css full-mask-size mask-position full-height full-width">
              <div className="rectangle-gradient-border" />
            </div>
          </div>

          {/* "Thank You!" */}
          <div id="w-igy0tluk" className="com-text-block p-absolute">
            <div className="text-block">
              <p className="text-block-css full-width">{copy.thankYou}</p>
            </div>
          </div>

          {/* "Cảm Ơn Quý Khách Đã Phản Hồi,\nRất Hân Hạnh Được Đón Tiếp!" */}
          <div
            id="w-1bubiyix"
            className={`com-text-block p-absolute is-animation ${animHeading}`}
          >
            <div className="text-block">
              <h2 className="text-block-css full-width" style={{ whiteSpace: 'pre-line' }}>
                {copy.popupThankYou}
              </h2>
            </div>
          </div>

          {/* Banner đầu popup */}
          <div id="w-yuvcbgge" className="com-image-block p-absolute">
            <div className="image-block-css p-relative full-width full-height full-mask-size mask-position">
              <div
                className="image-background p-absolute"
                data-image="/assets/hero-couple.jpg"
                role="img"
                aria-label="Ảnh đôi"
              />
              <div className="image-gradient-border" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
