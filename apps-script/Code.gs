/**
 * ============================================================================
 *  THIỆP CƯỚI — Apps Script nhận lời chúc & xác nhận tham dự
 * ============================================================================
 *
 *  VÌ SAO CẦN ĐẾN FILE NÀY?
 *  --------------------------------------------------------------------------
 *  Trang thiệp cưới là một React SPA (static site) deploy trên Render — KHÔNG
 *  có backend Node. Nên form phải POST thẳng từ trình duyệt sang Web App
 *  của Apps Script.
 *
 *  VẤN ĐỀ CỐT LÕI: CORS
 *  --------------------------------------------------------------------------
 *  Apps Script KHÔNG bao giờ gửi header CORS (Access-Control-Allow-Origin) cho
 *  câu trả lời. Nếu React gọi:
 *
 *      fetch(ENDPOINT, {
 *        method: 'POST',
 *        mode:   'no-cors',                       // bắt buộc, vì server không có CORS
 *        headers:{ 'Content-Type': 'application/json' }
 *      })
 *
 *  thì trình duyệt coi đây là request KHÔNG đơn giản (non-simple) nên nó gửi
 *  một request preflight OPTIONS trước. Apps Script không có hàm doOptions và
 *  không trả header CORS, nên preflight bị chặn -> toàn bộ POST fail, dù thực
 *  tế Apps Script hoàn toàn có thể nhận dữ liệu.
 *
 *  GIẢI PHÁP (bắt buộc phải làm ở phía React):
 *      fetch(ENDPOINT, {
 *        method: 'POST',
 *        mode:   'no-cors',
 *        headers:{ 'Content-Type': 'text/plain;charset=utf-8' },  // <-- chốt
 *        body:   JSON.stringify(payload)                          // chuỗi thô
 *      })
 *
 *  'text/plain;charset=utf-8' là Content-Type DUY NHẤT thuộc nhóm "simple"
 *  mà không cần preflight. Vì vậy trình duyệt gửi thẳng POST, không hỏi trước,
 *  và Apps Script nhận được đầy đủ.
 *
 *  HỆ QUẢ CẦN XỬ LÝ Ở ĐÂY: khi dùng 'text/plain', Apps Script KHÔNG coi là
 *  form submission, nên e.parameter sẽ RỖNG. Toàn bộ JSON nằm trong
 *  e.postData.contents (dạng chuỗi thô). Vì vậy hàm doPost bên dưới ưu tiên
 *  parse e.postData.contents, rồi mới fallback sang e.parameter — nhờ vậy
 *  script vẫn hoạt động nếu sau này deploy qua proxy (Apps Script, Zapier,
 *  Cloudflare Worker...) hoặc nếu ai đó gửi bằng form HTML thuần.
 *
 *  LƯU Ý VỀ `mode: 'no-cors'`:
 *  - Response trả về sẽ là opaque, nên phía React KHÔNG đọc được body/kết quả.
 *  - Muốn đọc được kết quả (ok/loi), React phải bỏ 'no-cors' — nhưng khi đó
 *    nếu request thành preflight thì vẫn hỏng. Hai lựa chọn thực tế:
 *      a) Chấp nhận fire-and-forget (phổ biến nhất, đơn giản nhất): no-cors +
 *         text/plain, hiển thị thông báo thành công ngay, không cần đọc phản hồi.
 *      b) Thêm một proxy nhỏ (Render/Vercel/Cloudflare) để né CORS hoàn toàn.
 *  Hàm doPost ở đây vẫn trả JSON đầy đủ, nên khi dùng proxy hoặc khi test bằng
 *  curl/Postman thì bạn sẽ thấy {"ok":true,...} bình thường.
 */

/* ==========================================================================
 * 1. CẤU HÌNH
 * ======================================================================== */

/**
 * ID của Google Spreadsheet đích.
 *
 * - ĐỂ TRỐNG ('') thì script sẽ tự tìm theo thứ tự:
 *     1) Script Property tên 'SPREADSHEET_ID'
 *     2) SpreadsheetApp.getActive()  (chỉ chạy được khi bấm Run từ trình soạn thảo)
 *   Với Web App đang deploy, KHÔNG có "active spreadsheet" -> nếu cả hai đều
 *   rỗng, hàm getSheet_() sẽ ném lỗi kèm hướng dẫn rõ ràng cho người dùng,
 *   thay vì báo lỗi chung chung khó hiểu.
 *
 * - CÁCH LẤY ID: mở Google Sheets, URL có dạng
 *     https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit
 *   thì <SHEET_ID> là phần nằm giữa "/d/" và "/edit".
 *
 * - ID đã điền sẵn cho thiệp cưới Duy Bình & Hồng Chiên:
 *     https://docs.google.com/spreadsheets/d/1WN6uaF4asheIiGjeyGXiD1-Ku-UTZNwLPVPWWZ8lj9E/edit
 */
var SHEET_ID = '1WN6uaF4asheIiGjeyGXiD1-Ku-UTZNwLPVPWWZ8lj9E';

/**
 * Tên tab (sheet tab) sẽ ghi dữ liệu. Sẽ tự tạo nếu chưa có.
 *
 * ĐÃ ĐỔI theo file Sheets thật: tab đầu tiên tên là 'DUYBINH&HONGCHIEN' và
 * ĐÃ CÓ SẴN DỮ LIỆU (3 dòng lời chúc cũ). Nếu để tên khác, getSheet_() sẽ
 * `insertSheet` ra một tab MỚI rỗng và dữ liệu sẽ nằm rời rạc khỏi bảng cũ.
 *
 * Muốn ghi vào tab khác thì đổi tên ở đây, nhớ sửa cả giá trị trong
 * `getSheet_()` cho khớp.
 */
var SHEET_NAME = 'DUYBINH&HONGCHIEN';

/**
 * Hàng tiêu đề cột — thứ tự này phải khớp với thứ tự dữ liệu ghi xuống.
 *
 * ĐÃ ĐỐI CHIẾU VỚI FILE SHEETS THẬT (ID 1WN6uaF4...): file có sẵn 5 cột do
 * chủ thiệp tạo tay từ trước. Danh sách dưới đây bám theo ĐÚNG 5 cột đó,
 * kể cả chính tả lỗi "GỞI" (thiếu dấu huyền) — giữ nguyên để khớp tuyệt đối
 * với file đang có, tránh tạo thêm cột thừa làm bảng lệch.
 *
 * Cột F, G, H trong file là cột trống, không thuộc form → không ghi.
 */
var HEADER_ROW = [
  'THỜI GIAN',
  'TÊN CỦA BẠN LÀ?',
  'BẠN LÀ GÌ CỦA DÂU RỂ NHỈ?',
  'GỞI LỜI CHÚC ĐẾN DÂU RỂ NHÉ!',
  'BẠN CÓ THAM DỰ KHÔNG?'
];

/** Thời gian tối đa chờ giành LockService, tính bằng mili-giây (30 giây). */
var LOCK_TIMEOUT_MS = 30000;

/** Cửa sổ chống gửi trùng: cùng guest+attending+wish trong 60s sẽ bị bỏ qua. */
var DEDUPE_WINDOW_MS = 60000;

/** Độ dài tối đa của từng trường. Vượt quá sẽ BỊ CẮT (không từ chối request). */
var MAX_LEN = {
  guest: 200,      // tên khách mời
  relation: 200,   // quan hệ với dâu rể
  wish: 2000,      // lời chúc
  source: 500,     // URL trang
  device: 200      // user agent rút gọn
};

/** Giá trị hợp lệ của trường 'attending'. */
var ATTENDING_YES = 'Có Thể Tham Dự';
var ATTENDING_NO = 'Không Thể Tham Dự';

/* ==========================================================================
 * 2. WEB APP ENTRY POINTS
 * ======================================================================== */

/**
 * GET /exec — dùng để kiểm tra web app đã deploy đúng hay chưa.
 * Mở URL web app trong tab mới, phải thấy JSON {"ok":true,"status":"ready",...}
 */
function doGet(e) {
  try {
    var sheet = getSheet_();
    return jsonResponse_({
      ok: true,
      status: 'ready',
      sheet: sheet.getName(),
      rows: sheet.getLastRow()
    });
  } catch (err) {
    return jsonResponse_({ ok: false, status: 'error', error: err.message });
  }
}

/**
 * OPTIONS — Apps Script dùng ContentService nên KHÔNG gọi được doOptions cho
 * preflight thật sự, nhưng một số trường hợp server/proxy/redirect sẽ biến
 * "simple request" thành preflight. Hàm này là lớp phòng thủ: nếu nó được
 * gọi, ta trả về đủ header CORS để preflight không bị chặn.
 */
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .addHeader('Access-Control-Allow-Origin', '*')
    .addHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .addHeader('Access-Control-Allow-Headers', 'Content-Type')
    .addHeader('Access-Control-Max-Age', '86400');
}

/**
 * POST /exec — nhận một lời chúc + xác nhận tham dự rồi ghi vào Sheets.
 *
 * Luôn trả về JSON (kể cả khi lỗi) và KHÔNG bao giờ để lỗi ném ra ngoài.
 * Lý do: nếu để lỗi ném ra, Apps Script trả về trang HTML lỗi (ContentService
 * mặc định bắt exception), phía React không đọc được, và người dùng thấy
 * một trang web kỳ lạ thay vì thông báo "Thiếu tên khách mời".
 */
function doPost(e) {
  var payload = readPayload_(e);

  var guest     = clean_(payload.guest, MAX_LEN.guest);
  var relation  = clean_(payload.relation, MAX_LEN.relation);
  var wish      = clean_(payload.wish, MAX_LEN.wish);
  var attending = normalizeAttending_(payload.attending);
  var source    = clean_(payload.source, MAX_LEN.source);
  var device    = clean_(payload.device, MAX_LEN.device);

  // --- Validate: chỉ 2 trường là bắt buộc ---------------------------------
  // 'relation' và 'wish' được phép để trống vì nhiều khách chỉ muốn xác nhận
  // tham dự mà không viết lời chúc.
  if (!guest) {
    return jsonResponse_({ ok: false, error: 'Thiếu tên khách mời' });
  }
  if (!attending) {
    return jsonResponse_({
      ok: false,
      error: 'Thiếu hoặc không hợp lệ trường "attending" (giá trị hợp lệ: "' +
             ATTENDING_YES + '" hoặc "' + ATTENDING_NO + '")'
    });
  }

  // --- Chống gửi trùng (double-click, refresh, retry của trình duyệt) ----
  var dedupeKey = [guest, attending, wish].join('|');
  if (isDuplicate_(dedupeKey)) {
    return jsonResponse_({ ok: true, duplicated: true, message: 'Cảm ơn bạn!' });
  }

  // --- Ghi dữ liệu --------------------------------------------------------
  // Dùng LockService vì nhiều khách có thể bấm nút cùng lúc. Không có lock thì
  // mỗi request đều đọc lastRow rồi append -> hai request có thể ghi đè cùng
  // một dòng, mất dữ liệu.
  var lock = LockService.getScriptLock();
  var hasLock = false;
  try {
    hasLock = lock.tryLock(LOCK_TIMEOUT_MS);
  } catch (lockErr) {
    hasLock = false;
  }

  if (!hasLock) {
    return jsonResponse_({
      ok: false,
      error: 'Hệ thống bận, vui lòng thử lại'
    });
  }

  try {
    var sheet = getSheet_();
    ensureHeader_(sheet);

    // ĐÚNG 5 CỘT, khớp thứ tự HEADER_ROW và khớp file Sheets thật:
    //   A THỜI GIAN | B TÊN | C QUAN HỆ | D LỜI CHÚC | E CÓ THAM DỰ KHÔNG
    // `source` và `device` vẫn được đọc từ payload (hữu ích khi cần điều tra
    // spam) nhưng KHÔNG ghi ra sheet — file đích không có 2 cột đó.
    var row = [
      new Date(),  // Apps Script tự định dạng theo locale của file
      guest,
      relation,
      wish,
      attending
    ];

    // appendRow tự ghi vào dòng trống kế tiếp, không cần biết lastRow.
    sheet.appendRow(row);
    var rowNumber = sheet.getLastRow(); // header là dòng 1 nên đây là số thứ tự dòng

    rememberKey_(dedupeKey);

    return jsonResponse_({
      ok: true,
      id: rowNumber,
      message: 'Cảm ơn bạn!'
    });
  } catch (err) {
    return jsonResponse_({ ok: false, error: err.message || String(err) });
  } finally {
    // Phải luôn nhả lock, kể cả khi có lỗi, nếu không thì sau 30s mọi lời chúc
    // tiếp theo đều bị "Hệ thống bận".
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

/* ==========================================================================
 * 3. ĐỌC PAYLOAD — phần quan trọng nhất
 * ======================================================================== */

/**
 * Lấy dữ liệu từ request theo cả 2 đường.
 *
 * ĐƯỜNG 1 (đúng như thiết kế trong README, nhưng robust hơn):
 *   e.postData.contents = '{"guest":"Nam","attending":"..."}'  (string thô)
 *   -> JSON.parse được.
 *
 * ĐƯỜNG 2 (fallback):
 *   e.parameter = { guest:'Nam', attending:'...' }
 *   -> xảy ra khi request là form-encoded thật (form HTML, jQuery, proxy...).
 *
 * Thử đường 1 trước vì khi dùng 'text/plain;charset=utf-8' thì e.parameter
 * chắc chắn rỗng.
 */
function readPayload_(e) {
  if (!e) {
    return {};
  }

  // --- Đường 1: body thô ------------------------------------------------
  if (e.postData && e.postData.contents) {
    var raw = String(e.postData.contents);
    // Nếu client lỡ gửi form-urlencoded (vd: 'guest=Nam&attending=...') thì
    // vẫn cứu được bằng cách parse như query string.
    if (raw.charAt(0) === '{') {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch (parseErr) {
        // JSON hỏng -> rơi xuống bên dưới thử đường 2
      }
    }
    var fromString = parseQueryString_(raw);
    for (var k in fromString) {
      if (Object.prototype.hasOwnProperty.call(fromString, k)) {
        return fromString;
      }
    }
  }

  // --- Đường 2: e.parameter ---------------------------------------------
  return e.parameter || {};
}

/** Parse chuỗi 'a=1&b=2' thành object. Tự decode URI + dấu '+'. */
function parseQueryString_(str) {
  var out = {};
  if (!str) {
    return out;
  }
  var parts = String(str).split('&');
  for (var i = 0; i < parts.length; i++) {
    if (!parts[i]) {
      continue;
    }
    var idx = parts[i].indexOf('=');
    var key, val;
    if (idx === -1) {
      key = parts[i];
      val = '';
    } else {
      key = parts[i].substring(0, idx);
      val = parts[i].substring(idx + 1);
    }
    try {
      out[decodeURIComponent(key.replace(/\+/g, ' '))] =
        decodeURIComponent(val.replace(/\+/g, ' '));
    } catch (decodeErr) {
      out[key] = val;
    }
  }
  return out;
}

/* ==========================================================================
 * 4. CHUẨN HÓA DỮ LIỆU
 * ======================================================================== */

/**
 * Bỏ khoảng trắng thừa ở 2 đầu, gộp khoảng trắng trong, rồi CẮT bớt nếu quá dài.
 * Cắt bớt thay vì từ chối vì người dùng nhập sai 1 ký tự mà bị mất trắng cả
 * lời chúc thì rất tệ.
 */
function clean_(value, maxLength) {
  if (value === null || value === undefined) {
    return '';
  }
  var s = String(value).replace(/\s+/g, ' ').trim();
  if (maxLength && s.length > maxLength) {
    s = s.substring(0, maxLength);
  }
  return s;
}

/**
 * Chuẩn hóa 'attending' về đúng 2 giá trị được phép.
 * Chấp nhận cả 'có'/'không'/'yes'/'no'/true/false/1/0 để phía React hoặc
 * người test tay không bị bắt nhập đúng chuỗi tiếng Việt có dấu.
 * Trả về '' nếu không khớp giá trị nào -> doPost sẽ trả lỗi 400.
 */
function normalizeAttending_(value) {
  if (value === null || value === undefined) {
    return '';
  }
  var s = String(value).trim().toLowerCase().replace(/\s+/g, ' ');
  if (!s) {
    return '';
  }
  if (s === ATTENDING_YES.toLowerCase() || s === 'co' || s === 'có' ||
      s === 'yes' || s === 'true' || s === '1' || s === 'co the tham du' ||
      s === 'có thể tham dự') {
    return ATTENDING_YES;
  }
  if (s === ATTENDING_NO.toLowerCase() || s === 'khong' || s === 'không' ||
      s === 'no' || s === 'false' || s === '0' ||
      s === 'khong the tham du' || s === 'không thể tham dự') {
    return ATTENDING_NO;
  }
  return '';
}

/* ==========================================================================
 * 5. CHỐNG GỬI TRÙNG
 * ======================================================================== */

/** Bộ nhớ tạm cho các khoá vừa gửi. Mất khi script kết thúc — đây chỉ là chống double-click. */
var recentSubmissions_ = {};

/**
 * Trả về true nếu cùng nội dung vừa được gửi trong khoảng DEDUPE_WINDOW_MS.
 * Dùng CacheService là vì mọi lần gọi script đều là một instance mới, biến
 * toàn cục sẽ mất ngay; CacheService sống được vài giờ và dùng chung cho mọi
 * lần thực thi.
 */
function isDuplicate_(key) {
  try {
    var cache = CacheService.getScriptCache();
    var stamp = cache.get('sub:' + hashKey_(key));
    if (stamp) {
      return (new Date().getTime() - parseInt(stamp, 10)) < DEDUPE_WINDOW_MS;
    }
  } catch (cacheErr) {
    // Cache lỗi không được làm hỏng request, coi như không trùng.
    return false;
  }
  return false;
}

/** Ghi nhớ khoá vừa gửi, hết hạn sau DEDUPE_WINDOW_MS giây. */
function rememberKey_(key) {
  try {
    CacheService.getScriptCache().put(
      'sub:' + hashKey_(key),
      String(new Date().getTime()),
      Math.ceil(DEDUPE_WINDOW_MS / 1000)
    );
  } catch (cacheErr) {
    // Bỏ qua — chống trùng là tiện ích, không phải yêu cầu bắt buộc.
  }
}

/** Rút gọn khoá thành chuỗi ngắn để làm khoá CacheService. */
function hashKey_(key) {
  var s = String(key);
  var h = 5381;
  for (var i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h.toString(36) + '_' + s.length;
}

/* ==========================================================================
 * 6. SHEET
 * ======================================================================== */

/**
 * Tìm spreadsheet đích theo thứ tự ưu tiên:
 *   1) Hằng số SHEET_ID (nếu bạn đã dán ID vào code)
 *   2) Script Property 'SPREADSHEET_ID' (đặt qua Project Settings > Script
 *      Properties — tiện khi dùng chung một code cho nhiều sheet)
 *   3) SpreadsheetApp.getActive() — chỉ có tác dụng khi chạy tay từ trình soạn
 *      thảo gắn với 1 file Sheets. Web App đang deploy luôn rơi vào nhánh
 *      lỗi, vì vậy ta ném lỗi có hướng dẫn rõ ràng.
 */
function getSheet_() {
  var ss = null;

  if (SHEET_ID) {
    ss = SpreadsheetApp.openById(SHEET_ID);
  } else {
    var propId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (propId) {
      ss = SpreadsheetApp.openById(propId);
    } else {
      ss = SpreadsheetApp.getActive();
    }
  }

  if (!ss) {
    throw new Error(
      'Chưa xác định được Google Spreadsheet đích. ' +
      'Cách 1: dán ID vào hằng số SHEET_ID trong Code.gs. ' +
      'Cách 2: Project Settings > Script Properties, thêm key SPREADSHEET_ID. ' +
      'Lưu ý: Web App không có "spreadsheet đang mở", nên gần như chắc chắn ' +
      'bạn phải dùng Cách 1 hoặc Cách 2.'
    );
  }

  // Tự tạo tab nếu chưa có, để lần deploy đầu tiên không bị lỗi.
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

/** Nếu sheet trống thì ghi hàng tiêu đề. */
function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADER_ROW.length).setValues([HEADER_ROW]);
  }
}

/* ==========================================================================
 * 7. HÀM TIỆN ÍCH
 * ======================================================================== */

/**
 * Trả về JSON cho client.
 *
 * LƯU Ý QUAN TRỌNG: ContentService của Apps Script KHÔNG cho set HTTP status
 * code thật sự — mọi câu trả lời đều là HTTP 200 kèm Content-Type
 * text/html. Vì vậy quy ước ở đây là: LUÔN trả 200, và mã lỗi nằm trong body
 * dưới key 'ok' (ok:true = thành công, ok:false = lỗi). Phía React chỉ cần
 * parse JSON rồi kiểm tra 'ok'. Cách này đáng tin hơn là ném exception
 * (exception ra HTML lỗi, client không parse được).
 */
function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ==========================================================================
 * 8. CHẠY 1 LẦN TỪ TRÌNH SOẠN THẢO
 * ======================================================================== */

/**
 * Hàm tiện ích. Mở file Apps Script gắn với Sheets, chọn hàm 'setupSheet' ở
 * thanh chọn hàm rồi bấm Run, lần đầu sẽ phải Authorize.
 *
 * Tạo tab + hàng tiêu đề + định dạng (độ rộng cột, in đậm header, khoá dòng 1).
 * Chạy lại nhiều lần cũng được: dữ liệu cũ không bị xoá (chỉ ghi header khi
 * sheet còn trống).
 */
function setupSheet() {
  var sheet = getSheet_();

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADER_ROW.length).setValues([HEADER_ROW]);
  }

  var lastCol = HEADER_ROW.length;

  // Header: in đậm, nền đỏ, chữ trắng — KHỚP với file Sheets thật (nền đỏ
  // #a00, chữ trắng). Không ép lại màu nếu người dùng đã tự trang trí.
  sheet.getRange(1, 1, 1, lastCol)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#aa0000')
    .setFontColor('#ffffff');

  // Độ rộng cột — đúng 5 cột, cột "GỞI LỜI CHÚC" rộng nhất.
  var widths = [150, 200, 180, 380, 200];
  for (var c = 0; c < lastCol; c++) {
    sheet.setColumnWidth(c + 1, widths[c] || 150);
  }

  // Bọc chữ cho cột lời chúc và cột tên để không bị tràn khi xem trên Sheets.
  sheet.getRange(2, 2, Math.max(sheet.getMaxRows() - 1, 1), 1).setWrap(true);
  sheet.getRange(2, 4, Math.max(sheet.getMaxRows() - 1, 1), 1).setWrap(true);

  // Khoá dòng 1 để cuộn xuống vẫn thấy tiêu đề.
  sheet.setFrozenRows(1);

  Logger.log('Đã thiết lập xong tab "' + sheet.getName() +
             '" với ' + lastCol + ' cột. Số dòng hiện có: ' + sheet.getLastRow());
}
