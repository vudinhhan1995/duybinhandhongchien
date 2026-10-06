/**
 * ============================================================================
 *  weddingData.js — NGUỒN SỰ THẬT DUY NHẤT cho toàn bộ nội dung thiệp cưới
 * ============================================================================
 *
 *  BỐI CẢNH
 *  ---------
 *  Trang gốc là thiệp WebCake: www.ewedinvite.online/DUYBINH&HONGCHIEN.html
 *  Toàn bộ chữ nằm sẵn trong HTML đều là PLACEHOLDER mặc định của template
 *  WebCake (người mẫu "Nguyễn Tuấn Kiệt" / "Trần Thị Thanh Thảo", ngày
 *  "15.01.2026" / "0.0.2026", "(Tức Ngày 0 Tháng 0 Năm Ất Tỵ)"...).
 *  Một script tên là `MAPPING` nằm cuối trang gốc sẽ tự động ghi đè các
 *  text node đó bằng dữ liệu thật của đôi PHẠM DUY BINH & PHẠM THỊ HỒNG CHIÊN.
 *
 *  File này là bản "chuyển tay" của script MAPPING: mọi giá trị dưới đây đều
 *  là giá trị ĐÃ MAPPING (giá trị thật), KHÔNG phải placeholder. Component
 *  React import từ đây — tuyệt đối không hardcode lại text trong component.
 *
 *  CÁCH ĐỌC GHI CHÚ MAPPING
 *  ------------------------
 *  Mỗi hằng số có tag `w-xxxxxxxx` là `id` của element WebCake gốc, giúp
 *  đối chiếu nhanh: mở file HTML gốc, tìm id đó, đọc script MAPPING ở cuối
 *  trang để thấy giá trị thật tương ứng.
 *
 *  QUY ƯỚC HIỂN THỊ
 *  -----------------
 *  1. Mọi chuỗi có ký tự `\n` PHẢI được render với CSS `white-space: pre-line`
 *     (script MAPPING gốc tự bật thuộc tính này khi phát hiện `\n`; CSS gốc
 *     của WebCake cũng đã bật sẵn cho các block text/calendar).
 *  2. Giữ nguyên văn chữ tiếng Việt có dấu và phân biệt HOA/thường — cả hai
 *     đều có ý nghĩa thị giác trong thiệp (ví dụ "Nhà Trai" so với "NHÀ TRAI").
 *  3. File dùng ES module + `import.meta.env` nên chỉ chạy được qua Vite.
 */

/* ==========================================================================
 * 1. couple — THÔNG TIN ĐÔI
 * ========================================================================== */

/**
 *  Ảnh chân dung cô dâu gốc (`3e9e5b97...jpeg.jpg`) ĐÃ được tải về local.
 *  Mirror HTTrack chỉ bắt được bản `.webjoptimized` dùng chung của đôi, nên bản
 *  `.jpg` gốc phải tải tay từ CDN — nay nằm ở `web/public/assets/bride-aodai.jpg`
 *  (1024 × 1536, ảnh chân dung cô dâu mặc áo dài hồng) và được rule
 *  `#w-j5c07h6f .image-background` trong `global.css` trỏ thẳng tới.
 *  `CouplePhotosSection.jsx` vẫn override `backgroundImage` inline bằng
 *  `couple.bride.portrait` — ghi đè đúng lớp ảnh, giữ nguyên shorthand gốc.
 *
 *  URL gốc vẫn được lưu ở `BRIDE_PORTRAIT_ORIGINAL_URL` bên dưới để đối chiếu.
 */
export const BRIDE_PORTRAIT_ORIGINAL_URL =
  'https://content.pancake.vn/web-media-263/42/81/30/9b/3e9e5b97412c70a791a996c6cc1071826fdae0d91830e04e32c65c7f-w:1024-h:1536-l:163667-t:image/jpeg.jpg'

export const couple = {
  groom: {
    // w-r2sccdsn gốc: "Tuấn Kiệt"          → mapping: "Duy Bình"
    // w-m7ni6fwc gốc: "Nguyễn Tuấn Kiệt"   → mapping: "Phạm Duy Bình"
    name: 'Phạm Duy Bình',
    shortName: 'Duy Bình',
    // w-08zr1r86 gốc: "Nhà Trai" → mapping: "Nhà Trai" (giữ nguyên chữ hoa đầu)
    role: 'NHÀ TRAI',
    // w-xjdsrgp5 gốc: "PH Trai" → không nằm trong MAPPING, giữ nguyên gốc
    parentLabel: 'PH Trai',
    bank: {
      // w-visl8dkg gốc (text block trong popup mừng cưới):
      //   "VIETINBANK  PHAM DUY BINH 104004433500" — tách theo <br> gốc
      name: 'VIETINBANK',
      accountHolder: 'PHAM DUY BINH',
      accountNumber: '104004433500',
      qrImage: '/assets/qr-vietinbank.webp',
    },
    // w-9l8pfk6j (image-block) — ảnh chân dung chú rể đã được mirror về public/
    portrait: '/assets/groom.jpg',
  },
  bride: {
    // w-hlgaaavc gốc: "Thanh Thảo"                  → mapping: "Hồng Chiên"
    // w-yffc4isu gốc: "Trần Thị Thanh Thảo"        → mapping: "Phạm Thị Hồng Chiên"
    name: 'Phạm Thị Hồng Chiên',
    shortName: 'Hồng Chiên',
    // w-j59hkrv8 gốc: "Nhà Gái" → mapping: "Nhà Gái" (giữ nguyên chữ hoa đầu)
    role: 'NHÀ GÁI',
    // w-k4vnjy9f gốc: "PH Gái" → không nằm trong MAPPING, giữ nguyên gốc
    parentLabel: 'PH Gái',
    bank: {
      // w-4hekxrbu gốc (text block trong popup mừng cưới):
      //   "VIETCOMBANK  PHAM THI HONG CHIEN 0611001913311" — tách theo <br> gốc
      name: 'VIETCOMBANK',
      accountHolder: 'PHAM THI HONG CHIEN',
      accountNumber: '0611001913311',
      qrImage: '/assets/qr-vietcombank.webp',
    },
    // Ảnh chân dung cô dâu gốc, đã tải về public/assets/bride-aodai.jpg
    // (xem ghi chú BRIDE_PORTRAIT_ORIGINAL_URL ở đầu file).
    portrait: '/assets/bride-aodai.jpg',
  },
}

/* ==========================================================================
 * 2. wedding — THÔNG TIN SỰ KIỆN
 * ========================================================================== */

export const wedding = {
  // w-t9sm3xwe gốc: "15.01.2026" → mapping: "29.11.2026"  (dùng ở hero)
  heroDate: '29.11.2026',
  // w-xykbkqrm gốc: "0.0.2026"   → mapping: "29.11.2026"  (dùng ở section tên)
  dateShort: '29.11.2026',
  // w-afaknanm gốc: "0 | 0 | 2026" → mapping: "29 | 11 | 2026"
  //   (mảng 3 phần tử để render "29 | 11 | 2026" mà không cần tách chuỗi)
  dateParts: ['29', '11', '2026'],
  // Định dạng dd.mm.yyyy — dùng cho input type="text" của calendar (parseInput)
  calendarDateInput: '29.11.2026',
  // Lịch hiển thị tiếng Việt
  calendarLang: 'vi',
  // w-qz3qdpb0 gốc: "Vào lúc  0:00 - Thứ " → mapping: "Vào lúc  "
  // w-0pxu27tu gốc: "VÀO LÚC 0:00 - THỨ " → mapping: "VÀO LÚC 11:00 - CHỦ NHẬT"
  time: '11:00',
  dayLabel: 'CHỦ NHẬT',
  // w-44z6qo7q gốc: "(Tức Ngày 0 Tháng 0 Năm Ất Tỵ)"
  //                  → mapping: "(Tức Ngày 21 Tháng 10 Năm Bính Ngọ)"
  lunarNote: '(Tức Ngày 21 Tháng 10 Năm Bính Ngọ)',
  // w-7ef8d17j gốc: "TIỆC MỪNG LỄ THÀNH HÔN" → mapping: "TIỆC BÁO HỶ"
  title: 'TIỆC BÁO HỶ',
  // w-5n79dm9x gốc (đã đúng sẵn, không mapping) — giữ nguyên
  announce: 'TRÂN TRỌNG BÁO TIN LỄ THÀNH HÔN CỦA:',
  venue: {
    // w-5kxmzkjd gốc: "ĐỊA ĐIỂM"
    //                  → mapping: "HỘI TRƯỜNG POSEIDON - TẦNG 3 \nTRUNG TÂM TIỆC CƯỚI LẠC HỒNG"
    hall: 'HỘI TRƯỜNG POSEIDON - TẦNG 3',
    center: 'TRUNG TÂM TIỆC CƯỚI LẠC HỒNG',
    // Bản ghép sẵn 2 dòng trên bằng "\n" để calendar/text-block hiển thị đúng
    // (bắt buộc CSS white-space: pre-line). Giữ đồng bộ với hall + center.
    fullName: 'HỘI TRƯỜNG POSEIDON - TẦNG 3\nTRUNG TÂM TIỆC CƯỚI LẠC HỒNG',
    // w-ttfn08oi gốc: "Địa chỉ" → mapping: "Số 20A Lê Hồng Phong, Gia Viên, Hải Phòng"
    address: 'Số 20A Lê Hồng Phong, Gia Viên, Hải Phòng',
    // w-6wnismlg gốc: "TẠI" → giữ nguyên
    addressLabel: 'TẠI',
  },
  map: {
    // w-tam1vool (html-box) — src của <iframe> bản đồ nhúng.
    // ⚠ COPY NGUYÊN VĂN, không tự gõ lại: sai 1 ký tự là iframe hỏng.
    embedUrl:
      'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3728.6404120812126!2d106.7074167!3d20.8462222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjDCsDUwJzQ2LjQiTiAxMDbCsDQyJzI2LjciRQ!5e0!3m2!1svi!2s!4v1790469337502!5m2!1svi!2s',
    // w-068i77jq (button "Xem Chỉ Đường Trên Google Maps") — target mở link.
    // ⚠ COPY NGUYÊN VĂN từ HTML gốc. Chứa ký tự `'` (phút giây) và `&`
    //   hợp lệ trong thuộc tính href — KHÔNG encode thành %27 / &amp; khi dùng
    //   trong React (React tự escape khi render attribute).
    directionsUrl:
      "https://www.google.com/maps/place/20%C2%B050'46.4%22N+106%C2%B042'26.7%22E/@20.8462222,106.7074167,17z/data=!3m1!4b1!4m4!3m3!8m2!3d20.8462222!4d106.7074167?entry=ttu&g_ep=EgoyMDI2MDkyMy4wIKXMDSoASAFQAw%3D%3D",
    // w-068i77jq gốc: "Xem Chỉ Đường Trên Google Maps"
    buttonLabel: 'Xem Chỉ Đường Trên Google Maps',
  },
}

/* ==========================================================================
 * 3. hero — KHOẢNG "SAVE THE DATE" (phần mở đầu thiệp)
 * ========================================================================== */

export const hero = {
  // w-80qtaa9a gốc: "SAVE" → giữ nguyên; w-96kvstdo gốc: "DATE" → giữ nguyên
  words: { first: 'SAVE', second: 'DATE' },
  // w-adxgp7e3 gốc: "The" — font chữ ký NVN-Motherland-Signature, đặt giữa 2 từ
  connector: 'The',
  // w-guq16spj gốc: "&" → giữ nguyên
  ampersand: '&',
  // w-r2sccdsn gốc: "Tuấn Kiệt"   → mapping: "Duy Bình"
  title: 'Duy Bình',
  // w-hlgaaavc gốc: "Thanh Thảo"   → mapping: "Hồng Chiên"
  subtitle: 'Hồng Chiên',
  // Ảnh đôi trong THẺ NGÀY ở hero (`#w-9l8pfk6j .image-background`) — đã mirror
  // về public/assets/.
  photo: '/assets/couple-2.jpg',
  // Ảnh đôi ở section ảnh `w-ubtq6ntw` (`#w-i0djb3fi .image-background`).
  // `photo` và `photoSection` đã được ĐỔI NGƯỢC so với trước (yêu cầu chủ
  // thiệp) — giữ hai field riêng để `data-image` của mỗi section khớp đúng
  // với URL mà `global.css` thực sự vẽ.
  photoSection: '/assets/hero-couple.jpg',
  // Phong bì mở — ảnh phủ lên hero. (Kèm thêm phong bì đóng tại
  // '/assets/envelope-closed.webp' nếu cần hiệu ứng đóng/mở.)
  envelope: '/assets/envelope-open.webp',
}

/* ==========================================================================
 * 4. copy — CÁC CHUỖI TIÊU ĐỀ / CHỮ HIỂN THỊ
 * ========================================================================== */

export const copy = {
  // w-pg4ud0dq gốc: "Trân Trọng Kính Mời:"  (dấu ":" là <br> trong gốc)
  // w-bghp2fwb gốc: "Trân Trọng Kính Mời"    (bản không dấu ":" trong block phụ)
  // Ở đây lưu bản không dấu hai chấm; nếu muốn hiện dấu ":" thì thêm vào.
  inviteTitle: 'Trân Trọng Kính Mời',
  // w-ysm6s9rn gốc: "and" → giữ nguyên
  andWord: 'and',
  // w-5bzhufjm gốc: "Xác Nhận Tham Dự" → giữ nguyên
  saveTheDateTitle: 'Xác Nhận Tham Dự',
  // w-gr20jchq + w-igy0tluk gốc: "Thank You!" → giữ nguyên
  thankYou: 'Thank You!',
  // w-juz3up03 gốc: "Rất Hân Hạnh Được Đón Tiếp!" → giữ nguyên
  thankYouSub: 'Rất Hân Hạnh Được Đón Tiếp!',
  // w-1bubiyix gốc: "Cảm Ơn Quý Khách Đã Phản Hồi,<br>Rất Hân Hạnh Được Đón Tiếp!"
  //   → chuỗi dùng \n thay cho <br> (render với white-space: pre-line)
  popupThankYou: 'Cảm Ơn Quý Khách Đã Phản Hồi,\nRất Hân Hạnh Được Đón Tiếp!',
  // w-3xw1sikm gốc: "Gửi Mừng Cưới<br>CHÚ RỂ"
  giftGroom: 'Gửi Mừng Cưới\nCHÚ RỂ',
  // w-pxcay859 gốc: "Gửi Mừng Cưới<br>CÔ DÂU"
  giftBride: 'Gửi Mừng Cưới\nCÔ DÂU',
  // w-79vxed47 gốc: "| THIỆP CƯỚI ONLINE LONG THỊNH"
  //   → mapping: "| THIỆP CƯỚI ONLINE"  (bỏ tên shop "LONG THỊNH")
  footerBrand: '| THIỆP CƯỚI ONLINE',
}

/* ==========================================================================
 * 5. rsvp — CẤU HÌNH FORM XÁC NHẬN THAM DỰ
 * ========================================================================== */

export const rsvp = {
  // Endpoint nhận POST JSON. Đọc từ biến môi trường Vite hoặc dùng Web App mặc định:
  endpoint:
    import.meta.env.VITE_RSVP_ENDPOINT ||
    'https://script.google.com/macros/s/AKfycbyznIhxeFlENedZOptEZB8cW5s_qjC-25uN0rKYPhGQrlGU8i0KoIrStiTh1oE2K22XQA/exec',
  fields: {
    // Input gốc: name="guest" (wi-z925obrg), placeholder "Tên của bạn là?", required
    guest: {
      name: 'guest',
      label: 'Tên của bạn là?',
      placeholder: 'Tên của bạn là?',
      required: true,
      type: 'text',
    },
    // Input gốc: name="text_input_1" (wi-zuwe8zoz), placeholder
    //   "Bạn là gì của Dâu Rể nhỉ?" — đã đổi tên field cho dễ đọc.
    relation: {
      name: 'relation',
      label: 'Bạn là gì của Dâu Rể nhỉ?',
      placeholder: 'Bạn là gì của Dâu Rể nhỉ?',
      required: false,
      type: 'text',
    },
    // Input gốc: name="text_input_2" (wi-og9c0zwi), placeholder
    //   "Gửi lời chúc đến Dâu Rể nhé!" — đã đổi tên field cho dễ đọc.
    wish: {
      name: 'wish',
      label: 'Gửi lời chúc đến Dâu Rể nhé!',
      placeholder: 'Gửi lời chúc đến Dâu Rể nhé!',
      required: false,
      type: 'text',
    },
    // Input số người tham dự: name="attendees", placeholder "Số người tham dự"
    attendees: {
      name: 'attendees',
      label: 'Số người tham dự',
      placeholder: 'Số người tham dự',
      required: false,
      type: 'text',
    },
  },
  attending: {
    // w-4okcahhg gốc: "Bạn Có Tham Dự Không?" với 2 option (select)
    name: 'attending',
    label: 'Bạn Có Tham Dự Không?',
    placeholder: 'Bạn Có Tham Dự Không?',
    required: true,
    // Giá trị <option> gốc (đọc thẳng từ thuộc tính value="..." trong HTML)
    options: ['Có Thể Tham Dự', 'Không Thể Tham Dự'],
  },
  // w-1nyt13tc gốc (button submit): "GỬI NGAY"
  submitLabel: 'GỬI NGAY',
  // Chữ trong popup cảm ơn sau khi gửi thành công
  successTitle: 'Cảm ơn bạn!',
  successMessage: 'Lời chúc của bạn đã được gửi tới Dâu Rể.',
  errorMessage: 'Gửi không thành công. Vui lòng thử lại sau.',
  offlineMessage: 'Không gửi được — vui lòng kiểm tra kết nối mạng rồi thử lại.',
  // Riêng cho case `endpoint` rỗng (thiếu VITE_RSVP_ENDPOINT lúc build).
  // KHÔNG dùng `errorMessage` ở đây: "gửi không thành công" khiến khách tưởng
  // lỗi mạng rồi bấm GỬI NGAY liên tục, trong khi thực ra chưa có máy chủ nhận.
  notConfiguredMessage:
    'Chưa cấu hình máy chủ nhận đăng ký. Vui lòng liên hệ Dâu Rể.',
}

/* ==========================================================================
 * 6. media — NHẠC NỀN, ICON, ẢNH CHIA CHẺ
 * ========================================================================== */

export const media = {
  /**
   * Nhạc nền — file MP3 dung lượng ~2.8MB nên KHÔNG được mirror về
   * `web/public/` (HTTrack bỏ qua do giới hạn kích thước), vẫn trỏ thẳng
   * URL CDN. Đây là <audio id="background-music" loop preload="none">
   * trong HTML gốc, mặc định volume 0.6, chỉ phát sau tương tác đầu tiên
   * của người dùng (click/touch) để không bị chặn autoplay.
   *
   * Nếu muốn chạy offline / không phụ thuộc CDN: tải file mp3 này về
   * `web/public/assets/background-music.mp3` rồi đổi giá trị bên dưới thành
   * '/assets/background-music.mp3'.
   */
  backgroundMusic:
    'https://statics.pancake.vn/web-media/5e/ee/bf/4a/afa10d3bdf98ca17ec3191ebbfd3c829d135d06939ee1f1b712d731d-w:0-h:0-l:2938934-t:audio/mpeg.mp3',
  // Icon PNG khi nhạc ĐANG TẮT (id="play-icon" gốc)
  musicOffIcon: '/assets/music-off.png',
  // Icon GIF khi nhạc ĐANG BẬT (id="pause-icon" gốc) + class "vibrating" gốc
  musicOnIcon: '/assets/music-on.gif',
  // Icon trái tim (w-9l8pfk6j / các image-block trái tim ở section mở thiệp)
  heartIcon: '/assets/heart.png',
  // Ảnh share khi gửi link lên Facebook/Zalo (og:image)
  ogImage: '/assets/og-image.jpg',
  favicon: '/assets/favicon.png',
}

/* ==========================================================================
 * 7. config — HẰNG SỐ KỸ THUẬT / TIỆN ÍCH CHUNG
 * ========================================================================== */

export const config = {
  // Bề rộng thiết kế (px) dùng cho toàn bộ scale px→vw. Trang gốc thiết kế
  // trên khung 420px, nên 1px gốc = 100/420 ≈ 0.2381vw.
  designWidth: 420,
  // Tổng số section cuộn dọc của thiệp (dùng cho thanh tiến trình / snap).
  sectionCount: 12,
  siteName: 'Thiệp cưới Duy Bình & Hồng Chiên',
}

/* ==========================================================================
 * EXPORT MẶC ĐỊNH — gộp tất cả lại cho tiện:
 *   import data, { couple, wedding } from '../data/weddingData'
 * ========================================================================== */

export default {
  couple,
  wedding,
  hero,
  copy,
  rsvp,
  media,
  config,
  BRIDE_PORTRAIT_ORIGINAL_URL,
}
