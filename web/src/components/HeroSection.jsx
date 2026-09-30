import { useRef } from 'react'
import { couple, wedding, hero } from '../data/weddingData'
import { useAnimation } from '../hooks/useAnimation'
import { useAutoScrollGroup } from '../hooks/useAutoScrollGroup'

/**
 * ============================================================================
 *  HeroSection — section `w-oo7mkglu` (420 × 800px)
 * ============================================================================
 *
 *  Toàn bộ vị trí/kích thước/kiểu chữ đã nằm sẵn trong `global.css` theo id
 *  (`#w-oltk5ygk`, `#w-r2sccdsn`, ...). Component này chỉ việc render lại đúng
 *  DOM gốc với đúng `id` + đúng class, không viết thêm style nào.
 *
 *  Hai điểm cố ý lệch về *markup* so với DOM gốc — xem `README` mục "Lệch so với DOM gốc":
 *   1. Bỏ class `lazy` trên `.image-background` / `.rectangle-css`
 *      (`.lazy` trong global.css là `background: none !important`; WebCake gỡ
 *      class này bằng JS sau khi ảnh nạp, còn bản port không có JS đó. Giữ
 *      class `lazy` ⇒ mất ảnh phủ hero và mất nền trắng thẻ ngày).
 *   2. Thêm `data-image` (attribute vô hại) để ảnh vẫn lấy từ `weddingData`
 *      thay vì hardcode — URL thật vẫn do `#id .image-background` trong
 *      global.css quyết định.
 *
 *  `w-azwkevop` (html-box chứa script text-replacer của bản gốc) bị bỏ hẳn:
 *  React đã render thẳng dữ liệu đã mapping từ `weddingData`, không cần script.
 *  `w-vw5iaqhx` (audio + nút nhạc) KHÔNG render ở đây: `MusicToggle.jsx` đã
 *  render trọn khối gốc (audio + `#music-toggle`) và App gắn nó ở gốc cây.
 *  Trước đây file này có một div placeholder rỗng cùng id → trùng id, HTML
 *  không hợp lệ; placeholder đã bị xoá.
 *
 *  ĐIỂM CỐ Ý LỆCH THỨ BA — `w-pg4ud0dq` được kéo vào khung
 *  ------------------------------------------------------------------
 *  Group "Trân Trọng Kính Mời: / Quý Khách" nằm ở `left:-423px` nên vô hình.
 *  Bản gốc mang class `group-auto-scroll sroll-size` trông như có cơ chế tự
 *  kéo, nhưng điều tra runtime WebCake + đo bằng Chrome thật đã kết luận 2 class
 *  đó là class chết (không CSS, không JS áp dụng cho group) — bản gốc cũng
 *  vô hình. Chi tiết bằng chứng nằm trong `hooks/useAutoScrollGroup.js`.
 *  Vì đây là nội dung quan trọng của thiệp cưới nên ở đây ta chủ động dịch nó
 *  vào khung bằng `useAutoScrollGroup` (transform, không đụng `global.css`).
 *
 *  Vì sao 442px mà không phải 423px:
 *  `423` chỉ đủ đưa mép trái group về `x=0`, nhưng group rộng 382px trong khung
 *  420px ⇒ tâm group rơi vào `x=191` còn tâm khung là `210`, lệch 19px (4,5%
 *  bề ngang) — nhìn rõ là lệch. Thêm 19px ở giữa khung cho group rộng 382px:
 *  `(420 - 382) / 2 = 19`. Tổng dịch = `19 - (-423)` = **442px**.
 *  Các con bên trong đã tự canh giữa quanh tâm group: `w-a0356azn` ("Quý Khách")
 *  `left:31 width:320` ⇒ tâm 191; `w-er17bmp4` (line) `left:71 width:240` ⇒ tâm
 *  191. Nên chỉ cần canh group là cả khối đúng giữa.
 *  Muốn dùng đúng 423 thì đổi hằng `INVITE_GROUP_SHIFT` xuống 423.
 *
 *  DỊCH XUỐNG DƯỚI THẺ NGÀY (đo bằng Chrome, không phải suy đoán)
 *  ------------------------------------------------------------------
 *  Ở `top:596px` (vị trí gốc) khối này ĐÈ LÊN chữ ngày cưới của thẻ:
 *  `w-t9sm3xwe` (glyph `y 584.5..609.5`) vs "Trân Trọng Kính Mời:"
 *  (glyph `y 598..623`) ⇒ **chồng lấn 11.5px, ngang tính cả chiều rộng**.
 *  Khối này chỉ "đúng" ở bản gốc vì nó nằm ngoài khung. Vì vậy ở đây ta hạ nó
 *  xuống `INVITE_GROUP_TOP = 640`, tức dưới đáy thẻ ngày (`w-uqk6fl7m`
 *  `235..647`, khung trắng `w-z9yzl7fd` cùng đáy 647) một khoảng 8px.
 *  Hệ quả: cả 4 khối Nhà Trai/Nhà Gái phải nằm dưới tiếp (xem `FAMILY_*`).
 *
 *  BỐ CỤC 4 KHỐI "NHÀ TRAI / NHÀ GÁI" — BẢNG 2×2, VÌ SỐ HỌC KHÔNG CHO PHÉP HƠN
 *  ------------------------------------------------------------------
 *  Bản gốc xếp 4 khối thành MỘT cột ở `left:686px` (`top` 532/558/625/651,
 *  rộng 180px, `text-align:end`) ⇒ cao 27+25.5+27+25.5 = **105px**. Kéo vào
 *  khung đúng kiểu gốc (mép phải 420px, `shift = -446px`) thì cột đó phải nằm
 *  dưới khối mời. Ngân sách dọc còn lại của hero:
 *    đáy thẻ ngày 647 → đáy hero 800 = **153px** < 84 (khối mời) + 105 (4 dòng)
 *    + 2 khoảng đệm ≥ 16 ⇒ cần ≥ 205px. VƯỢT quá 52px ⇒ bố cục 1 cột là bất khả
 *    thi trong khung cao 800px mà không sửa `global.css` (cấm) hoặc bóp méo font.
 *  ⇒ Chọn lưới **2 cột × 2 hàng**: `Nhà Trai | Nhà Gái` / `PH Trai | PH Gái`.
 *    Cao chỉ còn 27+25.5 = **52.5px** ⇒ vừa khít 153px còn lại.
 *  Cột trái = bên nhà trai, cột phải = bên nhà gái (đúng thứ tự đọc của thiệp cưới:
 *  tên đôi → SAVE THE DATE → thẻ ngày → "Trân Trọng Kính Mời: Quý Khách"
 *  → Nhà Trai / Nhà Gái).
 *
 *  VÌ SAO GHI ĐÈ `text-align:center` (bản gốc là `end`)
 *  ------------------------------------------------------------------
 *  Hai cột rộng 180px mỗi cột chỉ chừa 60px cho 2 lề ngoài; mà chữ thực tế
 *  chỉ dài 80.67px ("NHÀ TRAI") / 71.47px ("NHÀ GÁI") (đo bằng Range). Giữ
 *  `text-align:end` thì mép phải của chữ bám vào mép phải cột ⇒ lề trái 129.3px
 *  vs lề phải 30px, lệch 99px, nhìn lệch hẳn. Căn giữa mỗi cột cho lề ngoài
 *  79.7px (trái) và 84.2px (phải) — lệch 4.5px, coi như cân. Ghi đè bằng inline
 *  style trên CHÍNH `.text-block-css` (không phải wrapper): rule id
 *  `#w-08zr1r86 .text-block-css{text-align:end}` gắn thẳng vào con nên
 *  `textAlign` đặt ở wrapper sẽ không xuống được.
 *
 *  VÌ SAO HẠ THẺ NGÀY 15PX
 *  ------------------------------------------------------------------
 *  Ngân sách dọc dưới đáy thẻ ngày chỉ còn 153px mà cần 84 + 52.5 + đệm. Để cót
 *  chỗ mà không sửa `global.css`, ta đặt inline `top` cho thẻ ngày: 235 → 220
 *  (đáy 632, còn 168px). Tên cô dâu `w-hlgaaavc` có glyph kết thúc ở `y=195`,
 *  khung trắng của thẻ bắt đầu ở 220 ⇒ còn 25px đệm, an toàn.
 *  Lưới 2×2 rồi bố trí: thẻ 220..632 · khối mời 640..724 (đệm 8) ·
 *  hàng "Nhà.." 731..758 (đệm 7) · hàng "PH .." 762..787.5 (đệm 4) ·
 *  còn 12.5px chân trang tới đáy hero (800).
 */

const INVITE_GROUP_SHIFT = 442
const INVITE_GROUP_DURATION = 1200
const INVITE_GROUP_DELAY = 2200
const INVITE_GROUP_TOP = 640

/** `top` gốc của thẻ ngày là 235px; hạ lên 220px để nhường chỗ cho lưới 2×2. */
const DATE_CARD_TOP = 220

/** Hàng 1 của lưới 2×2: "NHÀ TRAI" (trái) và "NHÀ GÁI" (phải). */
const FAMILY_ROLE_TOP = 731
/** Hàng 2 của lưới 2×2: "PH Trai" (trái) và "PH Gái" (phải). */
const FAMILY_PARENT_TOP = 762
/** Cột trái của lưới: `left` gốc 686px → dịch về 30px ⇒ `shift = 30 - 686`. */
const FAMILY_LEFT_COLUMN = 30
/** Cột phải của lưới: `left` gốc 686px → dịch về 210px ⇒ `shift = 210 - 686`. */
const FAMILY_RIGHT_COLUMN = 210
const FAMILY_DURATION = 1200
/** Lệch 250ms giữa 4 khối, theo THỨ TỰ ĐỌC (hàng 1 trái→phải, rồi hàng 2). */
const FAMILY_DELAYS = [3400, 3650, 4000, 4250]

/** Căn giữa chữ trong cột — lý do kỹ thuật nằm ở khối doc ở trên. */
const FAMILY_TEXT_STYLE = { textAlign: 'center' }

export default function HeroSection() {
  // Mỗi element có animation gọi useAnimation() riêng — thứ tự gọi phải cố
  // định giữa các render (React Hooks rule). Trang gốc: đều delay 0s, chạy 1 lần.
  const animEnvelope = useAnimation() // w-oltk5ygk   fadeInUp   3s
  const animGroom = useAnimation() // w-r2sccdsn   fadeInLeft  4s
  const animBride = useAnimation() // w-hlgaaavc   fadeInRight 4s
  const animAmp = useAnimation() // w-guq16spj   zoomIn     4s
  const animSave = useAnimation() // w-dvk50tsn   fadeInDown 2s
  const animDate = useAnimation() // w-96kvstdo   fadeInDown 2s
  const animThe = useAnimation() // w-adxgp7e3   fadeInDown 2s
  const animDateCard = useAnimation() // w-uqk6fl7m   slideInUp  2s
  const animInviteBlock = useAnimation() // w-pg4ud0dq   fadeInLeft 2s
  const animInviteTitle = useAnimation() // w-u6bhn83l   fadeInUp   3s
  const animInviteLine = useAnimation() // w-er17bmp4   zoomIn     4s
  const animInviteGuest = useAnimation() // w-a0356azn   fadeInUp   3s
  const animGroomRole = useAnimation() // w-08zr1r86   fadeInLeft 3s
  const animGroomParent = useAnimation() // w-xjdsrgp5   fadeInLeft 3s
  const animBrideRole = useAnimation() // w-j59hkrv8   fadeInLeft 3s
  const animBrideParent = useAnimation() // w-k4vnjy9f   fadeInLeft 3s

  // w-pg4ud0dq nằm ở `left:-423px` (ngoài khung `.pageview` 420px) nên phải
  // dịch vào. `delay` 2200ms để khối này xuất hiện sau thẻ ngày (`w-uqk6fl7m`
  // chạy `slideInUp` 2s tính từ lúc trang tải) — nhịp chờ nằm trong hero đã
  // dài 800px nên người xem vẫn đang ở đúng vùng khi khối trượt vào.
  // `top` bị đặt tạm bằng inline style vì ở `top:596px` gốc nó đè lên chữ ngày
  // cưới của thẻ (đo được 11.5px chồng lấn) — xem khối doc ở đầu file.
  const inviteGroupRef = useRef(null)
  useAutoScrollGroup(inviteGroupRef, INVITE_GROUP_SHIFT, true, {
    duration: INVITE_GROUP_DURATION,
    delay: INVITE_GROUP_DELAY,
  })

  // 4 khối Nhà Trai / PH Trai / Nhà Gái / PH Gái ở `left:686px` — ngoài khung
  // `.pageview` 420px nên bản gốc cũng không vẽ được. Ở đây kéo vào khung bằng
  // CÙNG hook `useAutoScrollGroup`: nó ghi `transform: translateX()` inline nên
  // KHÔNG phải sửa `left` trong `global.css` và không đụng animation
  // `fadeInLeft` đang chạy trên `.text-block-css` (con).
  // Về tương tác với rule `#w-xxxx.animation{transform:perspective(1000px)}`:
  // style inline luôn thắng rule class, nên sau khi `useAnimation` gỡ class
  // `animation` thì `translateX` vẫn còn ⇒ vị trí không bị mất. Đổi lại
  // `perspective(1000px)` của bản gốc không còn áp dụng, nhưng vô hại: keyframe
  // `fadeInLeft` chỉ dùng `translate3d(x,0,0)` — thành phần z luôn bằng 0 nên
  // không có hiệu ứng phối cảnh nào để mất. Cùng cơ chế này đã được kiểm chứng
  // trên `w-pg4ud0dq`: sau khi animation kết thúc, class đã gỡ nhưng
  // `transform: matrix(1,0,0,1,442,0)` vẫn còn và `left` vẫn đúng 19px.
  const groomRoleRef = useRef(null)
  const groomParentRef = useRef(null)
  const brideRoleRef = useRef(null)
  const brideParentRef = useRef(null)

  // Thứ tự delay theo thứ tự đọc của lưới 2×2:
  // hàng 1 trái→phải (Nhà Trai, Nhà Gái) rồi hàng 2 trái→phải (PH Trai, PH Gái).
  useAutoScrollGroup(groomRoleRef, FAMILY_LEFT_COLUMN - 686, true, {
    duration: FAMILY_DURATION,
    delay: FAMILY_DELAYS[0],
  })
  useAutoScrollGroup(brideRoleRef, FAMILY_RIGHT_COLUMN - 686, true, {
    duration: FAMILY_DURATION,
    delay: FAMILY_DELAYS[1],
  })
  useAutoScrollGroup(groomParentRef, FAMILY_LEFT_COLUMN - 686, true, {
    duration: FAMILY_DURATION,
    delay: FAMILY_DELAYS[2],
  })
  useAutoScrollGroup(brideParentRef, FAMILY_RIGHT_COLUMN - 686, true, {
    duration: FAMILY_DURATION,
    delay: FAMILY_DELAYS[3],
  })

  return (
    <div id="w-oo7mkglu" className="com-section" data-section="">
      <div className="section-wrapper full-width full-height p-relative">
        <div className="section-background p-absolute full-width full-height" />
        <div className="section-container full-height p-relative">

          {/* Nền cố định toàn trang (position:fixed) */}
          <div id="w-xe82plbq" className="com-html-box p-absolute">
            <div className="frame-html-box full-width full-height">
              <div className="wc-bg-image" />
            </div>
          </div>

          {/* Phong bì mở phủ hero */}
          <div
            id="w-oltk5ygk"
            className={`com-image-block p-absolute is-animation ${animEnvelope}`}
          >
            <div className="image-block-css p-relative full-width full-height full-mask-size mask-position">
              <div
                className="image-background p-absolute"
                data-image={hero.envelope}
                role="img"
                aria-label=""
              />
              <div className="image-gradient-border" />
            </div>
          </div>

          {/* Tên chú rể */}
          <div
            id="w-r2sccdsn"
            className={`com-text-block p-absolute is-animation ${animGroom}`}
          >
            <div className="text-block">
              <h2 className="text-block-css full-width">{couple.groom.shortName} </h2>
            </div>
          </div>

          {/* Tên cô dâu */}
          <div
            id="w-hlgaaavc"
            className={`com-text-block p-absolute is-animation ${animBride}`}
          >
            <div className="text-block">
              <h2 className="text-block-css full-width">{couple.bride.shortName} </h2>
            </div>
          </div>

          {/* Dấu & */}
          <div
            id="w-guq16spj"
            className={`com-text-block p-absolute is-animation ${animAmp}`}
          >
            <div className="text-block">
              <h2 className="text-block-css full-width">{hero.ampersand}</h2>
            </div>
          </div>

          {/* SAVE / DATE / The */}
          <div id="w-80qtaa9a" className="p-absolute group-auto-scroll sroll-size">
            <div className="group-container">
              <div
                id="w-dvk50tsn"
                className={`com-text-block p-absolute is-animation ${animSave}`}
              >
                <div className="text-block">
                  <p className="text-block-css full-width">{hero.words.first}</p>
                </div>
              </div>
              <div
                id="w-96kvstdo"
                className={`com-text-block p-absolute is-animation ${animDate}`}
              >
                <div className="text-block">
                  <p className="text-block-css full-width">{hero.words.second}</p>
                </div>
              </div>
              <div
                id="w-adxgp7e3"
                className={`com-text-block p-absolute is-animation ${animThe}`}
              >
                <div className="text-block">
                  <p className="text-block-css full-width">{hero.connector}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Thẻ ngày cưới — `top` gốc 235px bị hạ lên 220px bằng inline style để
              nhường chỗ cho khối mời + lưới 2×2 phía dưới (xem khối doc đầu file). */}
          <div
            id="w-uqk6fl7m"
            style={{ top: DATE_CARD_TOP }}
            className={`p-absolute is-animation group-auto-scroll sroll-size ${animDateCard}`}
          >
            <div className="group-container">
              <div id="w-z9yzl7fd" className="com-rectangle p-absolute">
                <div className="rectangle-css full-mask-size mask-position full-height full-width">
                  <div className="rectangle-gradient-border" />
                </div>
              </div>
              <div id="w-9l8pfk6j" className="com-image-block p-absolute">
                <div className="image-block-css p-relative full-width full-height full-mask-size mask-position">
                  <div
                    className="image-background p-absolute"
                    data-image={hero.photo}
                    role="img"
                    aria-label=""
                  />
                  <div className="image-gradient-border" />
                </div>
              </div>
              <div id="w-n4zdbmhj" className="p-absolute">
                <div className="line-css full-width">
                  <div className="line-container" />
                </div>
              </div>
              <div id="w-t9sm3xwe" className="com-text-block p-absolute">
                <div className="text-block">
                  <h2 className="text-block-css full-width">{wedding.heroDate}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Rectangle nằm ngoài khung (left: -187.87px) — có trong DOM gốc, giữ lại */}
          <div id="w-pbiylxe0" className="com-rectangle p-absolute">
            <div className="rectangle-css full-mask-size mask-position full-height full-width">
              <div className="rectangle-gradient-border" />
            </div>
          </div>

          {/* "Trân Trọng Kính Mời: / Quý Khách" — group gốc nằm ngoài khung
              (left: -423px). Bản gốc có class `group-auto-scroll sroll-size`
              nhưng đó là class chết (không CSS/JS nào xử lý) nên bản gốc vô
              hiện; ở đây dịch vào khung bằng `useAutoScrollGroup`. */}
          <div
            id="w-pg4ud0dq"
            ref={inviteGroupRef}
            style={{ top: INVITE_GROUP_TOP }}
            className={`p-absolute is-animation group-auto-scroll sroll-size ${animInviteBlock}`}
          >
            <div className="group-container">
              <div
                id="w-u6bhn83l"
                className={`com-text-block p-absolute is-animation ${animInviteTitle}`}
              >
                <div className="text-block">
                  <h2 className="text-block-css full-width">Trân Trọng Kính Mời:<br /></h2>
                </div>
              </div>
              <div
                id="w-er17bmp4"
                className={`p-absolute is-animation ${animInviteLine}`}
              >
                <div className="line-css full-width">
                  <div className="line-container" />
                </div>
              </div>
              <div
                id="w-a0356azn"
                className={`com-text-block p-absolute is-animation ${animInviteGuest}`}
              >
                <div className="text-block">
                  <h2 className="text-block-css full-width">Quý Khách<br /></h2>
                </div>
              </div>
            </div>
          </div>

          {/* Nhà Trai / PH Trai / Nhà Gái / PH Gái
              Bản gốc: cả 4 ở `left:686px` — ngoài khung `.pageview` 420px nên không
              được vẽ. Đo bằng Chrome trên BẢN GỐC: `getBoundingClientRect().left
              === 686` ⇒ bản gốc cũng vô hình, không phải thiếu do bản port.
              Trong `event_data` chúng là `type:"text-block"`, `$parent:"oo7mkglu"`
              (con trực tiếp của section, KHÔNG nằm trong group nào) và không
              mang class `group-auto-scroll` ⇒ không có cơ chế nào kéo chúng.
              Tuy nhiên script `MAPPING` của bản gốc chủ động gán text cho
              `w-08zr1r86` → "Nhà Trai", `w-j59hkrv8` → "Nhà Gái" ⇒ tác giả MUỐN
              chúng hiện; chúng kẹt ngoài khung chỉ vì lỗi bố cục khi thiết kế.

              `left` trong `global.css` giữ nguyên 686px; chỉ `translateX` được
              ghi inline bởi `useAutoScrollGroup` (xem lệnh hook ở trên), và `top`
              đặt tạm bằng inline style vì bố cục gốc chồng lấn thẻ ngày.
              Bố cục 2×2 + lý do chọn: xem khối doc ở đầu file. */}

          {/* Nhà Trai — cột trái, hàng 1 */}
          <div
            id="w-08zr1r86"
            ref={groomRoleRef}
            style={{ top: FAMILY_ROLE_TOP }}
            className={`com-text-block p-absolute is-animation ${animGroomRole}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width" style={FAMILY_TEXT_STYLE}>{couple.groom.role}<br /></p>
            </div>
          </div>

          {/* PH Trai — cột trái, hàng 2 */}
          <div
            id="w-xjdsrgp5"
            ref={groomParentRef}
            style={{ top: FAMILY_PARENT_TOP }}
            className={`com-text-block p-absolute is-animation ${animGroomParent}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width" style={FAMILY_TEXT_STYLE}>{couple.groom.parentLabel}<br /></p>
            </div>
          </div>

          {/* Nhà Gái — cột phải, hàng 1 */}
          <div
            id="w-j59hkrv8"
            ref={brideRoleRef}
            style={{ top: FAMILY_ROLE_TOP }}
            className={`com-text-block p-absolute is-animation ${animBrideRole}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width" style={FAMILY_TEXT_STYLE}>{couple.bride.role}<br /></p>
            </div>
          </div>

          {/* PH Gái — cột phải, hàng 2 */}
          <div
            id="w-k4vnjy9f"
            ref={brideParentRef}
            style={{ top: FAMILY_PARENT_TOP }}
            className={`com-text-block p-absolute is-animation ${animBrideParent}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width" style={FAMILY_TEXT_STYLE}>{couple.bride.parentLabel}<br /></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}