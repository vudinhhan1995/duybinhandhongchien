/* ============================================================================
 *  utils/calendar.js — port nguyên văn logic của <script> calendar trong
 *  html-box `w-x3qlo4n9` của trang gốc WebCake.
 *
 *  Script gốc là IIFE tự dựng DOM. Ở đây tách thành 2 hàm thuần (pure) để
 *  React render bằng `useMemo`, giữ nguyên hành vi:
 *    - Hàng thứ tiếng Việt bắt đầu từ THỨ 2 (T2…CN), tiếng Anh bắt đầu từ SUN.
 *    - Ô trống đầu tháng = offset ô.
 *    - Chủ Nhật in đậm, ngày được chọn in đậm + ảnh trái tim.
 * ========================================================================== */

/** Hàng thứ theo ngôn ngữ. `vi` bắt đầu từ T2, `en` bắt đầu từ SUN. */
export const DOWS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
export const DOWS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/** Tên tháng tiếng Anh dùng cho tiêu đề lịch khi `calendarLang === 'en'`. */
export const MONTH_FULL_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Đọc chuỗi ngày kiểu "29.11.2026" (hoặc "1,15.11.2026" — nhiều ngày) rồi trả
 * về `{ days, month, year }`. Trả `null` nếu chuỗi sai định dạng — giống hàm
 * `parseInput` gốc vốn `if(!m) return;`.
 *
 * Regex cho phép dấu phân cách ngày là `.`, `/` hoặc `-` (nguồn gốc vốn vậy),
 * và phần ngày là chuỗi số + dấu phẩy + khoảng trắng.
 */
export function parseDateInput(str) {
  const m = /^([\d,\s]+)[/\.\-](\d{1,2})[/\.\-](\d{4})$/.exec(String(str ?? '').trim())
  if (!m) return null

  const days = m[1]
    .split(',')
    .map((x) => parseInt(x.trim(), 10))
    .filter((x) => !Number.isNaN(x))

  const month = parseInt(m[2], 10)
  const year = parseInt(m[3], 10)

  if (!days.length || !month || !year) return null
  return { days, month, year }
}

/**
 * Gom toàn bộ tính toán của `renderCalendar` gốc thành một object thuần để
 * `useMemo` hoá. Component chỉ việc map ra JSX.
 *
 * @param {string} dateInput  chuỗi ngày, ví dụ wedding.calendarDateInput
 * @param {'vi'|'en'} lang    ngôn ngữ hiển thị
 * @returns {{title:string, dows:string[], offset:number, total:number,
 *            days:number[], selectedDays:number[], isSunday:Function}|null}
 */
export function buildCalendarModel(dateInput, lang = 'vi') {
  const parsed = parseDateInput(dateInput)
  if (!parsed) return null

  const { days: selectedDays, month, year } = parsed
  const isEn = lang === 'en'

  // `en` hiển thị tên tháng đầy đủ; `vi` dùng "Tháng <số>".
  const title = isEn
    ? `${MONTH_FULL_EN[month - 1]} - ${year}`
    : `Tháng ${month} - ${year}`

  // `en`: tuần bắt đầu từ Chủ Nhật (offset = getDay()), CN ở cột 0.
  // `vi`: tuần bắt đầu từ Thứ 2 (offset = (getDay() + 6) % 7), CN ở cột 6.
  const first = new Date(year, month - 1, 1)
  const offset = isEn ? first.getDay() : (first.getDay() + 6) % 7
  const isSunday = isEn ? (col) => col === 0 : (col) => col === 6

  const total = new Date(year, month, 0).getDate()
  const days = Array.from({ length: total }, (_, i) => i + 1)

  return {
    title,
    dows: isEn ? DOWS_EN : DOWS_VI,
    offset,
    total,
    days,
    selectedDays,
    isSunday,
  }
}
