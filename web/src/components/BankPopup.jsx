import { useEffect } from 'react'
import { couple } from '../data/weddingData'

/**
 * ============================================================================
 *  BankPopup — popup mừng cưới (2 bản gốc gộp lại, chọn theo `side`)
 * ============================================================================
 *
 *  Bản gốc có HAI popup riêng biệt, giống nhau về bố cục chỉ khác id + ảnh QR:
 *    • `w-srpvcq4i`  400 × 400 · chú rể  · VIETINBANK
 *    • `w-b48ilf5m`  400 × 400 · cô dâu  · VIETCOMBANK
 *  Component này nhận `side` và render ĐÚNG id tương ứng (giữ nguyên cả 2 id
 *  gốc, không gộp thành một id chung) để CSS theo id vẫn khớp 1:1.
 *
 *  Cấu trúc popup trong DOM gốc:
 *    #w-xxx.com-popup.d-none.popup-center
 *      .popup-wrapper.p-absolute.full-width.full-height
 *        .popup-background.p-absolute.full-width.full-height
 *        … 6 element con (nút đóng · khung QR · ảnh QR · khung thông tin ·
 *          dòng tài khoản · banner) — cùng cấp với .popup-background
 *  Thứ tự 6 element con GIỮ NGUYÊN vì nó quyết định thứ tự vẽ chồng
 *  (banner đứng cuối nên nằm trên nút đóng, đúng như bản gốc).
 *
 *  Lệch có chủ đích so với DOM gốc:
 *   1. Bỏ class `lazy` (xem `HeroSection.jsx`) — `.lazy` là `background:none
 *      !important`, giữ lại thì mất nền trắng popup, nút ✕ và ảnh QR.
 *   2. Bản gốc luôn nằm trong DOM và bật/tắt bằng class `d-none`; ở đây
 *      component trả về `null` khi `side === null` (theo yêu cầu) nên không
 *      cần `d-none` — hiệu ứng thị giác tương đương.
 *   3. `<br>` trong `<h4>` tài khoản gốc → `white-space: pre-line` + `\n`
 *      (cùng cách `GiftSection.jsx` làm). Ba dòng vừa khít chiều cao 103.5px.
 *   4. Nút ✕ gốc là `<div>` tĩnh; thêm `role="button"` + `tabIndex` + `aria-label`
 *      để bàn phím dùng được (không đổi id, không đổi CSS).
 *
 *  Đóng popup theo 3 đường: nút ✕ · bấm backdrop · phím Escape.
 *  Khi mở, khoá cuộn body; khi đóng, trả lại đúng giá trị `overflow` cũ.
 */

const POPUPS = {
  groom: {
    rootId: 'w-srpvcq4i',
    closeId: 'w-c50m9vir',
    qrFrameId: 'w-s7z78rmj',
    qrId: 'w-h5ou2gsw',
    infoFrameId: 'w-grwaxngg',
    textId: 'w-visl8dkg',
    bannerId: 'w-pvla7yvu',
    bank: couple.groom.bank,
    closeLabel: 'Đóng thông tin tài khoản chú rể',
  },
  bride: {
    rootId: 'w-b48ilf5m',
    closeId: 'w-r8hickjx',
    qrFrameId: 'w-4oh06087',
    qrId: 'w-lnin8mq5',
    infoFrameId: 'w-69y84y3g',
    textId: 'w-4hekxrbu',
    bannerId: 'w-sf3oc8wx',
    bank: couple.bride.bank,
    closeLabel: 'Đóng thông tin tài khoản cô dâu',
  },
}

export default function BankPopup({ side = null, onClose = () => {} }) {
  // Escape đóng popup + khoá cuộn body. Phải khai báo TRƯỚC lệnh return null
  // (luật Hooks), nên `side` nằm trong deps và effect tự thoát sớm khi đóng.
  useEffect(() => {
    if (!side) return undefined

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
  }, [side, onClose])

  if (!side || !POPUPS[side]) return null

  const p = POPUPS[side]
  const accountText = `${p.bank.name}\n${p.bank.accountHolder}\n${p.bank.accountNumber}`

  return (
    <>
      {/* Backdrop nằm NGOÀI popup-root (đúng DOM gốc) và z-index thấp hơn nên
          bấm vùng tối quanh khung 400 × 400 sẽ đóng popup. */}
      <div
        id="popup-backdrop"
        className="popup-backdrop full-width full-height"
        onClick={onClose}
        aria-hidden="true"
      />

      <div id={p.rootId} className="com-popup popup-center" role="dialog" aria-modal="true">
        <div className="popup-wrapper p-absolute full-width full-height">
          <div className="popup-background p-absolute full-width full-height" />

          {/* Nút đóng ✕ — nền là mask base64 đặt trong global.css theo id */}
          <div
            id={p.closeId}
            className="com-rectangle p-absolute"
            onClick={onClose}
            role="button"
            tabIndex={0}
            aria-label={p.closeLabel}
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

          {/* Khung trắng 152 × 152 bên trái */}
          <div id={p.qrFrameId} className="com-rectangle p-absolute">
            <div className="rectangle-css full-mask-size mask-position full-height full-width">
              <div className="rectangle-gradient-border" />
            </div>
          </div>

          {/* Ảnh QR ngân hàng 140 × 140 */}
          <div id={p.qrId} className="com-image-block p-absolute">
            <div className="image-block-css p-relative full-width full-height full-mask-size mask-position">
              <div
                className="image-background p-absolute"
                data-image={p.bank.qrImage}
                role="img"
                aria-label={`Mã QR chuyển khoản ${p.bank.name}`}
              />
              <div className="image-gradient-border" />
            </div>
          </div>

          {/* Khung trắng bo góc 206 × 127 bên phải */}
          <div id={p.infoFrameId} className="com-rectangle p-absolute">
            <div className="rectangle-css full-mask-size mask-position full-height full-width">
              <div className="rectangle-gradient-border" />
            </div>
          </div>

          {/* Tên ngân hàng · chủ tài khoản · số tài khoản */}
          <div id={p.textId} className="com-text-block p-absolute">
            <div className="text-block">
              <h4 className="text-block-css full-width" style={{ whiteSpace: 'pre-line' }}>
                {accountText}
              </h4>
            </div>
          </div>

          {/* Banner đầu popup 390 × 224 */}
          <div id={p.bannerId} className="com-image-block p-absolute">
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
        </div>
      </div>
    </>
  )
}
