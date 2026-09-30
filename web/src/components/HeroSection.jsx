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
 */

const INVITE_GROUP_SHIFT = 442
const INVITE_GROUP_DURATION = 1200
const INVITE_GROUP_DELAY = 2200

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
  const inviteGroupRef = useRef(null)
  useAutoScrollGroup(inviteGroupRef, INVITE_GROUP_SHIFT, true, {
    duration: INVITE_GROUP_DURATION,
    delay: INVITE_GROUP_DELAY,
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

          {/* Thẻ ngày cưới */}
          <div
            id="w-uqk6fl7m"
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
              Cả 4 đều ở `left:686px` — ngoài khung `.pageview` 420px nên không
              được vẽ. Đo bằng Chrome trên BẢN GỐC: `getBoundingClientRect().left
              === 686` ⇒ bản gốc cũng vô hình, không phải thiếu do bản port.
              Trong `event_data` chúng là `type:"text-block"`, `$parent:"oo7mkglu"`
              (con trực tiếp của section, KHÔNG nằm trong group nào) và không
              mang class `group-auto-scroll` ⇒ không có cơ chế nào kéo chúng.
              Giữ nguyên vị trí gốc theo yêu cầu; muốn hiện thì dịch
              `translateX(-446px)` bằng cùng hook `useAutoScrollGroup`
              (mép phải 180px → 420px, giữ `text-align: end` của bản gốc). */}

          {/* Nhà Trai */}
          <div
            id="w-08zr1r86"
            className={`com-text-block p-absolute is-animation ${animGroomRole}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">{couple.groom.role}<br /></p>
            </div>
          </div>

          {/* PH Trai */}
          <div
            id="w-xjdsrgp5"
            className={`com-text-block p-absolute is-animation ${animGroomParent}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">{couple.groom.parentLabel}<br /></p>
            </div>
          </div>

          {/* Nhà Gái */}
          <div
            id="w-j59hkrv8"
            className={`com-text-block p-absolute is-animation ${animBrideRole}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">{couple.bride.role}<br /></p>
            </div>
          </div>

          {/* PH Gái */}
          <div
            id="w-k4vnjy9f"
            className={`com-text-block p-absolute is-animation ${animBrideParent}`}
          >
            <div className="text-block">
              <p className="text-block-css full-width">{couple.bride.parentLabel}<br /></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}