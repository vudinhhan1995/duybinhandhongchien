import { copy } from '../data/weddingData'

/**
 * ============================================================================
 *  InviteTitleSection — section `w-bghp2fwb` (420 × 101px)
 * ============================================================================
 *
 *  Tiêu đề "Trân Trọng Kính Mời" + đường kẻ ngang bên dưới.
 *
 *  Hai element này KHÔNG có animation trong trang gốc (đã kiểm tra cả
 *  `_reference/css-spec.json` và `global.css`), nên không gọi `useAnimation`.
 *  Đường kẻ dùng `border-style: outset` do rule `#w-40fhpwfn .line-container`.
 */

export default function InviteTitleSection() {
  return (
    <div id="w-bghp2fwb" className="com-section" data-section="">
      <div className="section-wrapper full-width full-height p-relative">
        <div className="section-background p-absolute full-width full-height" />
        <div className="section-container full-height p-relative">

          <div id="w-1qbithzq" className="com-text-block p-absolute">
            <div className="text-block">
              <h2 className="text-block-css full-width">{copy.inviteTitle}</h2>
            </div>
          </div>

          <div id="w-40fhpwfn" className="p-absolute">
            <div className="line-css full-width">
              <div className="line-container" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}