import { useEffect, useState } from 'react'

/**
 * Trả về chuỗi class để kích hoạt animation của WebCake.
 *
 * Trang gốc (WebCake) render markup với class `is-animation`, sau đó script của
 * họ tự thêm class `animation` vào đúng element đó để chạy keyframe, rồi gỡ
 * class `animation` khi animation kết thúc. `global.css` đã port sẵn selector
 * dạng `#w-xxxx.animation .text-block-css { animation-name: ... }`.
 *
 * Hook này mô phỏng đúng cả hai bước:
 *   1. trả `''` lúc mount, rồi `'animation'` sau `delay` (mặc định 0s) để
 *      animation chạy 1 lần khi trang vừa tải — khớp toàn bộ animation của
 *      trang gốc (đều `delay: 0s`, `iteration-count: 1`).
 *   2. gỡ class `animation` ngay khi keyframe kết thúc, qua sự kiện
 *      `animationend` — đây là điều BẮT BUỘC: `animation-fill-mode` mặc định
 *      là `none`, nên giữ class sau khi chạy xong sẽ để `opacity`/`transform`
 *      rơi về giá trị gốc.
 *
 * VÌ SAO DÙNG LISTENER GIAI ĐOẠN Ở `document` THAY VÌ `ref` TỪNG PHẦN TỬ
 * ------------------------------------------------------------------------
 * 44 rule animation của bản gốc có 2 dạng target, nên vị trí element chạy
 * animation KHÔNG đồng nhất:
 *   - `#w-xxxx.animation  .text-block-css|.image-block-css|.line-css|.button-css`
 *     → animation nằm trên CON (wrapper chỉ mang class để bật rule).
 *   - `#w-xxxx.animation > .group-container`
 *     → animation nằm trên CON TRỰC TIẾP, wrapper lại không có animation
 *       nào (đây là `w-uqk6fl7m` slideInUp, `w-pg4ud0dq` fadeInLeft,
 *       `w-qj312suo` fadeInUp — cả 3 đều 2s).
 * Nếu gắn listener riêng lên wrapper thì với dạng thứ hai sẽ không bao giờ
 * bắt được `animationend` (nó phát ở `.group-container`), còn với dạng thứ
 * nhất thì `animationend` của con sẽ BUBBLE lên wrapper và gỡ class sớm mỗi
 * lần một con kết thúc — sai khi wrapper có nhiều con đang chạy (ví dụ
 * `w-pg4ud0dq` chứa 3 wrapper con có animation lần lượt 3s/4s/3s).
 *
 * `animationend` có tính chất bubble nên một listener gắn ở `document` bắt
 * được mọi trường hợp. Cách này giữ nguyên API của hook (`useAnimation(delay)`
 * → string) nên không phải sửa 10 component.
 *
 * Gỡ class bằng `classList.remove` trực tiếp trên DOM thay vì qua state: sau
 * khi `play` đã là `true`, mọi lần render tiếp theo đều truyền lại đúng
 * chuỗi className cũ nên React không chạm vào DOM — class đã gỡ không bị
 * React ghi đè lại.
 */

const ANIM_CLASS = 'animation'

/** Số hook đang dùng listener, để gỡ đúng lúc không còn ai dùng. */
let consumerCount = 0

/** true nếu còn animation hữu hạn nào trong `host` chưa chạy xong. */
function hasRunningAnimation(host) {
  // `getAnimations` có từ Chrome 84 / Safari 13.1 / FF 75. Thiếu thì coi như
  // đã xong để không kẹt class vĩnh viễn.
  if (typeof host.getAnimations !== 'function') return false

  // `Array.from` chứ không dùng `concat`: `concat` KHÔNG trải (spread) NodeList —
  // nó sẽ nhét nguyên NodeList vào mảng như một phần tử → `el.closest` không
  // phải function → handler ném lỗi và class không bao giờ được gỡ.
  const candidates = [host, ...host.querySelectorAll('*')]
  for (let i = 0; i < candidates.length; i += 1) {
    const el = candidates[i]
    // Bỏ qua wrapper con và mọi thứ bên trong nó: animation của chúng được
    // `useAnimation` của chính wrapper đó lo, không thuộc vòng đời class này.
    if (el.closest(`.${ANIM_CLASS}`) !== host) continue

    const animations = el.getAnimations()
    for (let j = 0; j < animations.length; j += 1) {
      const anim = animations[j]
      if (anim.playState !== 'running' && anim.playState !== 'pending') continue
      // Animation vô hạn (`iterations === Infinity`) không bao giờ bắn
      // `animationend` nên không được tính vào, nếu không class sẽ kẹt.
      const timing = anim.effect && anim.effect.getComputedTiming()
      if (timing && timing.iterations === Infinity) continue
      return true
    }
  }
  return false
}

function handleAnimationEnd(event) {
  const target = event.target
  if (!target || typeof target.closest !== 'function') return

  // `target` là element thực sự chạy animation (`.text-block-css`,
  // `.image-block-css`, `.line-css`, `.button-css` hoặc `.group-container`).
  // Dò ngược lên tìm wrapper gần nhất đang mang class `animation`.
  const host = target.closest(`.${ANIM_CLASS}`)
  if (!host) return

  if (hasRunningAnimation(host)) return
  host.classList.remove(ANIM_CLASS)
}

function subscribe() {
  if (typeof document === 'undefined') return () => {}
  consumerCount += 1
  if (consumerCount === 1) {
    document.addEventListener('animationend', handleAnimationEnd)
  }
  return () => {
    consumerCount -= 1
    if (consumerCount === 0) {
      document.removeEventListener('animationend', handleAnimationEnd)
    }
  }
}

export function useAnimation(delay = 0) {
  const [play, setPlay] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setPlay(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => subscribe(), [])

  return play ? ANIM_CLASS : ''
}
