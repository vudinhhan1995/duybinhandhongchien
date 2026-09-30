import { useEffect, useRef } from 'react'

/**
 * ============================================================================
 *  useAutoScrollGroup — kéo một element `group-auto-scroll` vào khung `.pageview`
 * ============================================================================
 *
 *  BỐI CẢNH (điều tra bản gốc `www.ewedinvite.online`, xem báo cáo)
 *  ------------------------------------------------------------------
 *  Element `w-pg4ud0dq` (group "Trân Trọng Kính Mời: / Quý Khách") được WebCake
 *  render với `class="p-absolute is-animation group-auto-scroll sroll-size"`.
 *  Người ta tưởng class đó đi kèm một cơ chế tự động kéo group vào khung. Điều
 *  tra cho thấy **không có cơ chế nào cả**:
 *
 *   1. Trong bundle runtime `webcake/v4/c0c6ff37-…`, chuỗi `group-auto-scroll`
 *      xuất hiện ĐÚNG MỘT LẦN, trong private method `kr()` của lớp Survey:
 *
 *          function kr(){ var t = WebcakeScript.runtime.vm[this.vm.$parent];
 *            if ("form" == t.type) { var n = this.vm.$el;
 *              n.classList.remove("group-auto-scroll");
 *              … if (scrollAuto == "yes") { n.style.width = pageviewWidth + "px";
 *                                            n.style.left  = Math.abs(left) + "px";
 *                                            n.style.overflow  = "hidden";
 *                                            n.style.overflowX = "auto"; } } }
 *
 *      Nhánh này chỉ chạy khi `$parent.type === "form"`. `w-pg4ud0dq.$parent`
 *      là `oo7mkglu` có `type: "section"` ⇒ không bao giờ chạy. Kể cả khi chạy
 *      thì đó cũng chỉ là *thanh cuộn ngang do người dùng tự kéo*
 *      (`overflow-x: auto`), KHÔNG phải animation, không marquee, không chu kỳ.
 *   2. Trong HTML gốc, `sroll-size` và `group-auto-scroll` chỉ xuất hiện trong
 *      thuộc tính `class`, **không có một rule CSS nào** mang tên đó. Hai field
 *      `extra_css` / `extra_script` của `event_data` đều là chuỗi rỗng.
 *   3. Đo thực tế bằng Chrome, viewport 420px, chờ animation kết thúc:
 *      `w-pg4ud0dq` có `getBoundingClientRect().left === -423` trong khi
 *      `.pageview` chạy từ 0 → element nằm ngoài khung và không được vẽ.
 *
 *  ⇒ `group-auto-scroll` / `sroll-size` là class chết, sót lại từ trình biên
 *    tập WebCake (chính tả "sroll" cũng là dấu hiệu). Bản gốc **vô hình** ở
 *    vị trí này. Hook này port lại *ý nghĩa* của tên class (đưa nội dung quan
 *    trọng vào khung) chứ không port lại hành vi, vì bản gốc không có hành vi.
 *
 *  VÌ SAO DÙNG `transform` CHỨ KHÔNG SỬA `left`
 *  ------------------------------------------------------------------
 *  `global.css` đã bake vị trí gốc vào `#w-pg4ud0dq{left:-423px}`. Sửa `left`
 *  bằng JS sẽ đè lên id-scoped CSS và dễ lệch với các rule tĩnh khác. Dịch
 *  bằng `transform: translateX()` giữ nguyên `global.css`, chạy trên GPU, và
 *  không đụng vào animation `fadeInLeft` đang chạy trên `.group-container`
 *  (con trực tiếp của group) — animation đó nằm ở tầng con nên hai transform
 *  không đè lên nhau.
 *
 *  VÌ SAO GIỮ NGUYÊN `transform` GỐC CỦA CSS
 *  ------------------------------------------------------------------
 *  `#w-pg4ud0dq.animation { transform: perspective(1000px) }` — `useAnimation`
 *  gỡ class `animation` khi keyframe kết thúc, nên transform tĩnh đó có thể
 *  biến mất bất cứ lúc nào. Hook đọc transform tính sẳn một lần rồi ghép
 *  `translateX()` vào sau, để không làm mất `perspective` của rule gốc.
 *
 *  CẢI THIỂN SO VỚI BẢN GỐC
 *  ------------------------------------------------------------------
 *  - `prefers-reduced-motion: reduce` ⇒ đặt thẳng về vị trí cuối, không chạy
 *    animation. Bản gốc không có xử lý này.
 *  - Cleanup gọi `cancelAnimationFrame` + `clearTimeout` nên không rò rỉ frame
 *    khi component unmount giữa chừng.
 *  - `duration <= 0` hoặc `distance === 0` cũng rơi vào nhánh đặt thẳng.
 *
 *  @param {React.RefObject<HTMLElement>} ref       element group cần dịch
 *  @param {number} distance                         số px dịch (dương = sang phải)
 *  @param {boolean} [enabled]                       false ⇒ dịch về 0, dừng
 *  @param {{duration?: number, delay?: number}} [options]
 *  @returns {void}
 */
export function useAutoScrollGroup(ref, distance, enabled = true, options = {}) {
  const { duration = 1200, delay = 0 } = options

  // Giá trị px đang áp dụng, để khi `distance` đổi thì nối tiếp từ vị trí hiện
  // tại thay vì nhảy về 0. Cũng làm StrictMode (effect chạy 2 lần) không giật.
  const valueRef = useRef(0)
  // transform gốc từ CSS, chụp đúng một lần.
  const baseRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const target = enabled && Number.isFinite(distance) ? distance : 0

    if (baseRef.current === null) {
      const computed = window.getComputedStyle(el).transform
      baseRef.current = computed && computed !== 'none' ? computed : ''
    }
    const base = baseRef.current

    const apply = (px) => {
      valueRef.current = px
      el.style.transform = px === 0 ? base : `${base ? `${base} ` : ''}translateX(${px}px)`
    }

    // Nhánh không-animation: đặt thẳng vị trí cuối.
    if (target === 0) {
      apply(0)
      return undefined
    }
    if (duration <= 0 || prefersReducedMotion()) {
      apply(target)
      return undefined
    }

    const from = valueRef.current
    if (from === target) return undefined

    let frame = 0
    let startedAt = 0

    const step = (now) => {
      if (!startedAt) startedAt = now
      const t = Math.min(1, (now - startedAt) / duration)
      apply(from + (target - from) * easeOutCubic(t))
      frame = t < 1 ? window.requestAnimationFrame(step) : 0
    }

    const timer = window.setTimeout(() => {
      frame = window.requestAnimationFrame(step)
    }, delay)

    return () => {
      window.clearTimeout(timer)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [ref, distance, enabled, duration, delay])
}

/** easeOutCubic — bắt đầu nhanh rồi hãm dần, giống cảm giác `fadeInLeft`. */
function easeOutCubic(t) {
  const inv = 1 - t
  return 1 - inv * inv * inv
}

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
