import { useCallback, useState } from 'react'
import HeroSection from './components/HeroSection.jsx'
import CoupleNamesSection from './components/CoupleNamesSection.jsx'
import PhotoSection from './components/PhotoSection.jsx'
import InviteTitleSection from './components/InviteTitleSection.jsx'
import EventDetailsSection from './components/EventDetailsSection.jsx'
import MapSection from './components/MapSection.jsx'
import CalendarSection from './components/CalendarSection.jsx'
import RsvpSection from './components/RsvpSection.jsx'
import GiftSection from './components/GiftSection.jsx'
import CouplePhotosSection from './components/CouplePhotosSection.jsx'
import ThankYouSection from './components/ThankYouSection.jsx'
import FooterSection from './components/FooterSection.jsx'
import BankPopup from './components/BankPopup.jsx'
import ThankYouPopup from './components/ThankYouPopup.jsx'
import MusicToggle from './components/MusicToggle.jsx'

/**
 * ============================================================================
 *  App — khung ghép toàn bộ trang thiệp cưới
 * ============================================================================
 *
 *  Trang là MỘT cột dọc 420px; `.pageview` (max-width 420 · margin auto) là
 *  khung chứa, mọi `.com-section` xếp chồng theo chiều dọc bằng `position:
 *  relative` + chiều cao cố định đã khai trong `global.css`. Vì vậy App KHÔNG
 *  viết style nào — chỉ render đúng thứ tự DOM của bản gốc.
 *
 *  THỨ TỰ 12 SECTION (khớp 1:1 với DOM gốc, đã đối chiếu
 *  `www.ewedinvite.online/DUYBINH&HONGCHIEN.html`):
 *    1. HeroSection            w-oo7mkglu  420×800  phong bì mở · tên đôi · ngày
 *    2. CoupleNamesSection     w-q53it7fi  420×448  ngày · tên đôi đầy đủ · "and"
 *    3. PhotoSection           w-ubtq6ntw  420×361  khung trắng + ảnh đôi
 *    4. InviteTitleSection     w-bghp2fwb  420×101  "Trân Trọng Kính Mời"
 *    ── w-90c2m1yt            w-90c2m1yt  420×249  BỎ QUA — xem ghi chú bên dưới
 *    5. EventDetailsSection    w-im3pxp9o  420×320  giờ · ngày dương/âm · địa điểm
 *    6. MapSection             w-j7s4utwr  420×353  iframe Google Maps + nút chỉ đường
 *    7. CalendarSection        w-xr8n7pvd  420×366  lịch tháng 11/2026, tim ngày 29
 *    8. RsvpSection            w-1nyt13tc  420×457  form xác nhận tham dự
 *    9. GiftSection            w-2lvco2h8  420×180  2 thẻ "Gửi Mừng Cưới"
 *   10. CouplePhotosSection    w-kzm77mp6  420×298  ảnh chú rể · ảnh cô dâu
 *   11. ThankYouSection       w-irpujf29  420×404  nền tối + "Thank You!"
 *   12. FooterSection          w-79vxed47  420×48   credit cuối trang
 *
 *  Vì sao đúng thứ tự này: đây là luồng đọc một trang thiệp cưới — mở phong bì
 *  và thấy tên đôi (1-2) → xem ảnh (3) → đọc lời mời (4) → biết giờ/chỗ (5-6)
 *  → đánh dấu lịch (7) → phản hồi tham dự (8) → gửi mừng cưới (9) → thêm ảnh
 *  đôi (10) → lời cảm ơn (11) → credit (12). Trang gốc dùng đúng trình tự này
 *  nên mọi vị trí tuyệt đối trong `global.css` vẫn khớp.
 *
 *  ⚠ BỎ QUA CÓ CHỦ Ý — section `w-90c2m1yt` (ceremony-time, 7 element con):
 *  bản gốc CÓ render section này trong DOM nhưng CSS đặt
 *  `#w-90c2m1yt { display: none }` (global.css dòng 656) ⇒ người dùng không
 *  bao giờ thấy. Nội dung của nó ("Vào lúc 0:00 - Thứ", "LỄ THÀNH HÔN",
 *  "Tại ...") còn là dữ liệu placeholder chưa điền ở bản gốc, và phần thông tin
 *  thật đã nằm ở section kế tiếp `w-im3pxp9o` (giờ · ngày âm · địa điểm).
 *  Render nó ở đây sẽ chỉ tạo 249px khoảng trống/rác; bỏ hẳn khớp đúng hành vi
 *  bản gốc và giữ `margin-bottom:-1px` của các section còn lại không bị lệch.
 *
 *  ⚠ MỘT STATE CHUNG cho popup — bắt buộc về mặt kỹ thuật:
 *  `BankPopup` và `ThankYouPopup` CÙNG dùng id `#popup-backdrop` (giống hệt DOM
 *  gốc — gốc chỉ có 1 backdrop dùng chung cho cả 3 popup) và cả hai đều khoá
 *  `document.body.style.overflow` rồi trả lại giá trị cũ khi đóng. Nếu tách
 *  2 state riêng, chúng có thể mở đồng thời ⇒ (1) trùng id `popup-backdrop`
 *  trong DOM, (2) giá trị `overflow` cũ mà popup thứ 2 lưu lại chính là
 *  `'hidden'`, nên đóng popup thứ nhất sẽ KHÔNG khôi phục được cuộn ⇒ kẹt trang
 *  vĩnh viễn. Vì vậy dùng MỘT biến `popup` phân biệt 3 trạng thái
 *  (`null | 'groom' | 'bride' | 'thanks'`) ⇒ loại trừ được cả hai lỗi trên.
 *
 *  Ghi chú vị trí `<MusicToggle />`: khối gốc `w-vw5iaqhx` là `position: fixed`
 *  nên đặt ở bất kỳ đâu trong cây cũng cho CÙNG vị trí hiển thị. Đặt ở gốc
 *  App (ngoài `.pageview`) để nó không bị `overflow: hidden` của `.pageview`
 *  cắt mất, và để anh/chị đọc thấy ngay: nó là phần tử dùng chung cho cả trang.
 */

export default function App() {
  // 'groom' | 'bride' → BankPopup · 'thanks' → ThankYouPopup · null → đóng hết
  const [popup, setPopup] = useState(null)
  const closePopup = useCallback(() => setPopup(null), [])

  return (
    <>
      <div className="pageview">
        {/* Không gian chờ cho script cảnh báo của WebCake; bản gốc có sẵn, giữ
            nguyên id + style để không lệch nếu sau này còn dùng. */}
        <div
          id="webcake-alert-msg"
          className="w-alert-message-wrapper"
          style={{ display: 'none', zIndex: 9999999 }}
        />

        {/* 1. Trang bìa: phong bì mở, tên Duy Bình & Hồng Chiên, thẻ ngày cưới,
            lời mời "Quý Khách" + tên nhà trai / nhà gái. */}
        <HeroSection />

        {/* 2. Tên đôi đầy đủ + chữ "and" + dòng "TRÂN TRỌNG BÁO TIN LỄ THÀNH
            HÔN CỦA:" — ngay sau bìa để khách thấy tên ngay khi mở thiệp. */}
        <CoupleNamesSection />

        {/* 3. Ảnh đôi trong khung trắng — phần thị giác nghỉ giữa bìa và lời mời. */}
        <PhotoSection />

        {/* 4. Tiêu đề "Trân Trọng Kính Mời" + đường kẻ — mở đầu phần thông tin. */}
        <InviteTitleSection />

        {/* (bỏ w-90c2m1yt — display:none ở bản gốc, xem ghi chú đầu file) */}

        {/* 5. Giờ · ngày dương · ngày âm · địa điểm · địa chỉ. */}
        <EventDetailsSection />

        {/* 6. Bản đồ Google Maps + nút "Xem Chỉ Đường". */}
        <MapSection />

        {/* 7. Lịch tháng cưới, tim ở ngày cưới — để khách tự đánh dấu. */}
        <CalendarSection />

        {/* 8. Form "Xác Nhận Tham Dự"; gửi thành công → mở popup cảm ơn. */}
        <RsvpSection onSuccess={() => setPopup('thanks')} />

        {/* 9. Hai thẻ "Gửi Mừng Cưới"; bấm thẻ nào thì mở popup tài khoản
            của bên đó ('groom' | 'bride'). */}
        <GiftSection onOpen={(side) => setPopup(side)} />

        {/* 10. Ảnh chú rể và ảnh cô dâu đặt cạnh nhau. */}
        <CouplePhotosSection />

        {/* 11. Section nền tối "Thank You!" — chốt lại trước chân trang. */}
        <ThankYouSection />

        {/* 12. Chân trang / credit — luôn là khối cuối cùng của trang. */}
        <FooterSection />
      </div>

      {/* Nút nhạc nền + <audio> — `position: fixed`, đặt 1 lần ở gốc App. */}
      <MusicToggle />

      {/* Popup mừng cưới: truyền 'groom'/'bride' khi bấm thẻ, null khi đóng.
          `side` null ⇒ BankPopup trả null ⇒ không render backdrop. */}
      <BankPopup
        side={popup === 'groom' || popup === 'bride' ? popup : null}
        onClose={closePopup}
      />

      {/* Popup cảm ơn sau khi gửi form RSVP. */}
      <ThankYouPopup open={popup === 'thanks'} onClose={closePopup} />
    </>
  )
}
