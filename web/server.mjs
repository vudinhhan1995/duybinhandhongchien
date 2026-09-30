/**
 * ============================================================================
 * STATIC SERVER ZERO-DEPENDENCY CHO THIỆP CƯỚI (React + Vite)
 * ============================================================================
 *
 * TẠI SAO KHÔNG DÙNG `vite preview`?
 * ---------------------------------
 * Log Render lúc 01:11 cho thấy `vite preview` thực ra ĐÃ sống trên port 10000
 * (dòng "Local: http://localhost:10000/"), nhưng Render vẫn báo:
 *
 *     01:15:39 PM *** Timed out
 *     01:15:40 PM ==> No open ports detected, continuing to scan...
 *     01:15:55 PM ==> Detected service running on port 10000
 *
 * Tức là Render chờ ~4 phút 22 giây cho health check rồi timeout, MỚI quét ra
 * port. Quá trễ nên deploy fail. Nguyên nhân gốc: `vite preview` là server
 * dành cho DEV — nó phải nạp toàn bộ config Vite, plugin, middleware trước khi
 * `listen()`, nên khởi động chậm (log cho thấy ~2 giây) và cộng thêm thời gian
 * dựng config, quá ngưỡng chờ của Render.
 *
 * File này thay thế nó bằng một static server viết tay chỉ dùng module built-in
 * của Node (`node:http`, `node:fs`, `node:path`, `node:url`). KHÔNG import bất
 * kỳ package nào — kể cả `vite`. `listen()` gần như tức thì vì không phải dựng
 * gì, chỉ mở socket.
 *
 * Đây không phải server production-grade nói chung, nhưng đủ dùng cho MỘT trang
 * thiệp cưới tĩnh: không form động, không database, không WebSocket, không
 * cần reverse proxy phức tạp.
 *
 * CÁCH CHẠY
 * ---------
 *   cd web && npm run serve          # tự đọc process.env.PORT
 *   PORT=5055 node server.mjs        # ép cổng cụ thể (POSIX)
 *   $env:PORT='5055'; node server.mjs # ép cổng cụ thể (PowerShell)
 *
 * ============================================================================
 */

// Chỉ dùng module built-in của Node — không phụ thuộc package nào.
import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// ----------------------------------------------------------------------------
// CẤU HÌNH
// ----------------------------------------------------------------------------

// Thư mục chứa file server.mjs này (dùng làm phương án dự phòng cho ROOT).
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))

// Render cấp cổng ngẫu nhiên qua biến môi trường PORT. Local thì mặc định 3000
// để khớp cổng AI Studio.
const PORT = Number(process.env.PORT) || 3000

// 0.0.0.0 = nghe trên mọi interface. Render nối vào container qua IP nội bộ,
// nếu chỉ bind localhost thì bên ngoài không vào được.
const HOST = process.env.HOST || '0.0.0.0'

// Thư mục gốc chứa file tĩnh sau khi `vite build`. Ưu tiên `dist` nằm cạnh lệnh
// chạy (đúng khi `cd web && npm run serve`), nếu không có thì lùi về `dist`
// cạnh chính file này — để `node web/server.mjs` chạy từ gốc repo cũng được.
let ROOT = resolve(process.cwd(), 'dist')
if (!existsSync(ROOT) && existsSync(resolve(SCRIPT_DIR, 'dist'))) {
  ROOT = resolve(SCRIPT_DIR, 'dist')
}

// Tiền tố chuẩn để so khớp đường dẫn: `C:\dist` phải khớp `C:\dist\...`,
// KHÔNG được khớp `C:\dist-evil\...`.
const ROOT_PREFIX = ROOT.endsWith(sep) ? ROOT : ROOT + sep

// File trang chủ — luôn trả về 200 để React Router tự xử lý (SPA fallback).
const INDEX_FILE = join(ROOT, 'index.html')

// ----------------------------------------------------------------------------
// BẢNG MIME
// ----------------------------------------------------------------------------

// Không khai báo `Content-Type` thì trình duyệt tải file về thay vì chạy —
// đặc biệt nguy hiểm với `.js` và `.css`.
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.map': 'application/json; charset=utf-8'
}

// ----------------------------------------------------------------------------
// KIỂM TRA ĐU TIÊN: THƯ MỤC dist PHẢI TỒN TẠI
// ----------------------------------------------------------------------------

// Render chạy `buildCommand` trước, nên bình thường `dist` luôn có. Nhưng nếu
// ai đó sửa cấu hình sai (bỏ build command, hoặc `start` chạy trước khi
// build xong) thì server sẽ chạy được rồi trả về 404 cho MỌI đường dẫn — triệu
// chứng rất khó đoán. Thà báo lỗi rõ ràng và dừng hẳn.
if (!existsSync(INDEX_FILE)) {
  console.error(`Khong tim thay thu muc dist: ${ROOT}`)
  console.error("Hay chay 'npm run build' truoc.")
  process.exit(1)
}

// ----------------------------------------------------------------------------
// HÀM PHỤ
// ----------------------------------------------------------------------------

/**
 * Chọn `Cache-Control` dựa trên tên file.
 *
 * Vite đặt hash nội dung vào tên file khi build (`index-BvD3TGJw.js`,
 * `index-C1x9dZ0a.css`). Hash đó chỉ đổi khi nội dung đổi, nên file đó có thể
 * cache vĩnh viễn — 1 năm — trình duyệt không bao giờ hỏi lại.
 *
 * `index.html` thì ngược lại: nó chứa đường dẫn tới các file hash ở trên. Nếu
 * cache index.html, khách sẽ tải HTML cũ trỏ tới asset đã bị xoá. Nên
 * `no-cache` — vẫn lưu cache nhưng phải hỏi lại server mỗi lần tải trang.
 */
function cacheControlFor(filePath) {
  const name = filePath.slice(ROOT.length)
  if (name === '/index.html' || name.endsWith(`${sep}index.html`)) return 'no-cache'

  // Tên file có dấu `-` + tối thiểu 8 ký tự ngẫu nhiên trước phần mở rộng.
  // Chấp nhận cả chữ/số/gạch nối/gạch dưới vì hash của Vite dùng base64url.
  //
  // Nhưng chỉ tên "trông giống hash" thôi chưa đủ. File trong `public/` được
  // copy nguyên tên vào `dist/`, nên tên dài cũng dễ khớp — ví dụ
  // `qr-vietcombank.webp` có `-vietcombank` (11 ký tự) rõ ràng là TỪ TIẾNG
  // VIỆT, không phải hash. Nếu gán `immutable` nhầm cho nó thì thay ảnh QR mới
  // (sửa số tài khoản) khách vẫn thấy QR cũ VĨNH VIỄN — QR sai ngân hàng
  // thì mất tiền thật.
  //
  // Vì vậy phần hash phải có ít nhất MỘT CHỮ HOA hoặc MỘT CHỮ SỐ:
  //   - Hash Vite luôn trộn lẫn ký tự. Xác suất một hash 8 ký tự toàn chữ
  //     thường là (26/64)^8 ≈ 0,0002% — gần như không bao giờ.
  //   - Tên file tiếng Việt/nguồn bình thường thì toàn chữ thường.
  // Rủi ro lệch pha: gán `immutable` nhầm là lỗi NẶNG (cache vĩnh viễn), bỏ
  // sót thì chỉ mất tối ưu nhẹ (rơi về 1 giờ) — nên chọn thiên về bỏ sót.
  const hash = /-([A-Za-z0-9_-]{8,})\.[A-Za-z0-9]+$/.exec(name)
  if (hash && /[A-Z0-9]/.test(hash[1])) return 'public, max-age=31536000, immutable'

  return 'public, max-age=3600'
}

/**
 * Chuyển URL pathname thành đường dẫn file an toàn trong `dist`.
 *
 * ĐÂY LÀ CHỖ NHẠY CẢM NHẤT của cả server: đường dẫn do client gửi lên, nếu
 * không chặn `..` thì attacker đọc được bất kỳ file nào trên container
 * (`/etc/passwd`, `.env`, khoá API...). Vì vậy chặn 3 lớp:
 *   1. `decodeURIComponent` — URL-encode `..` thành `%2e%2e` để lách regex.
 *   2. `normalize` — rút gọn `..` thành dạng chuẩn, và với đường dẫn bắt đầu bằng
 *      `/` thì Node tự bỏ các `..` ở đầu.
 *   3. So `filePath` với `ROOT_PREFIX` — lưới an toàn cuối cùng, chặn cả trường
 *      hợp `ROOT` mà không có dấu `/` phía sau.
 */
function resolveSafePath(pathname) {
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    // `%` không hợp lệ (vd `/%`) làm decodeURIComponent ném lỗi URIError.
    return null
  }

  // Ký tự NUL (`%00`) làm lời gọi hệ thống tệ file ném lỗi — cắt hẳn.
  if (decoded.includes('\0')) return null

  // Bỏ query string và fragment phòng khi URL được truyền vào thẳng.
  const cleanPath = decoded.split('?')[0].split('#')[0]

  // `normalize` xử lý `a/../../b` -> `../b`; regex này dọn nốt `..` còn sót ở đầu.
  const safePath = normalize(cleanPath).replace(/^(\.\.[/\\])+/, '')

  // `join` KHÔNG tự bảo vệ: `join('/a', '../../etc/passwd')` vẫn ra `/etc/passwd`.
  // Vì vậy phải so sánh lại sau khi join.
  const filePath = join(ROOT, safePath)
  if (filePath !== ROOT && !filePath.startsWith(ROOT_PREFIX)) return null

  return filePath
}

/** Ghi log một dòng cho mỗi request — dùng để chẩn đoán khi Render có sự cố. */
function logRequest(method, pathname, status) {
  console.log(`${method} ${pathname} -> ${status}`)
}

/** Trả về file bất kỳ với status cho trước. */
function serveFile(req, res, filePath, pathname, status = 200) {
  const headers = {
    'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': cacheControlFor(filePath),
    'X-Content-Type-Options': 'nosniff'
  }

  try {
    const stats = statSync(filePath)

    // Đường dẫn là thư mục (vd `/assets/`) -> xử lý như route của SPA.
    if (stats.isDirectory()) {
      serveIndex(req, res, pathname)
      return
    }

    // Khai báo trước khi stream: trình duyệt cần Content-Length để hiện thanh
    // tải, và Render health check cũng dựa vào response hoàn chỉnh.
    headers['Content-Length'] = stats.size
  } catch (err) {
    console.error(`Loi khi doc file ${filePath}: ${err.message}`)
    logRequest(req.method, pathname, 500)
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Internal Server Error')
    return
  }

  logRequest(req.method, pathname, status)
  res.writeHead(status, headers)

  // HEAD = chỉ xin header, không tải thân. Phải kết thúc luôn, nếu không
  // Render health check sẽ treo chờ một body không bao giờ tới.
  if (req.method === 'HEAD') {
    res.end()
    return
  }

  const stream = createReadStream(filePath)
  stream.on('error', (err) => {
    // Lỗi giữa chừng (file bị xoá, đĩa lỗi) — header đã gửi nên không đổi được
    // status, chỉ cắt kết nối để trình duyệt biết response hỏng.
    console.error(`Loi khi stream ${filePath}: ${err.message}`)
    res.destroy()
  })
  stream.pipe(res)
}

/** Phục vụ `index.html` — dùng cho root và cho SPA fallback. */
function serveIndex(req, res, pathname) {
  logRequest(req.method, pathname, 200)
  res.writeHead(200, {
    'Content-Type': MIME['.html'],
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  })

  if (req.method === 'HEAD') {
    res.end()
    return
  }

  const stream = createReadStream(INDEX_FILE)
  stream.on('error', (err) => {
    console.error(`Loi khi stream index.html: ${err.message}`)
    res.destroy()
  })
  stream.pipe(res)
}

// ----------------------------------------------------------------------------
// SERVER
// ----------------------------------------------------------------------------

const server = createServer((req, res) => {
  const method = req.method || 'GET'

  // Chỉ GET và HEAD có nghĩa với file tĩnh. POST/PUT/DELETE... trả 405 kèm
  // `Allow` để client biết server hỗ trợ gì.
  if (method !== 'GET' && method !== 'HEAD') {
    logRequest(method, req.url || '/', 405)
    res.writeHead(405, {
      Allow: 'GET, HEAD',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    })
    res.end('Method Not Allowed')
    return
  }

  // Tách pathname khỏi query string. `new URL` tự xử lý cả dạng tuyệt đối
  // lẫn dạng đường dẫn (`/lich?x=1` -> pathname `/lich`).
  let pathname
  try {
    pathname = new URL(req.url || '/', 'http://localhost').pathname
  } catch {
    logRequest(method, req.url || '/', 400)
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Bad Request')
    return
  }

  const filePath = resolveSafePath(pathname)
  if (!filePath) {
    // Path traversal bị chặn, hoặc URL không giải mã được.
    logRequest(method, pathname, 403)
    res.writeHead(403, {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    })
    res.end('Forbidden')
    return
  }

  // File có thật và là file -> stream ra. Còn lại (thư mục, 404) -> SPA fallback:
  // trả `index.html` với 200 để React Router tự quyết định hiển thị. Nếu trả
  // 404 thì mọi link nội bộ kiểu `/lich`, `/rsvp` sẽ hỏng khi bấm hay F5.
  if (existsSync(filePath)) {
    serveFile(req, res, filePath, pathname)
  } else {
    serveIndex(req, res, pathname)
  }
})

// In ra NGAY khi listen thành công, trước khi có request nào — để log Render
// cho thấy server đã sẵn sàng, không phải đang treo.
server.listen(PORT, HOST, () => {
  console.log(`Server dang lang nghe tren ${HOST}:${PORT}`)
  console.log(`Thu muc goc: ${ROOT}`)
})

// Lỗi cấp phát cổng (đã có tiến trình khác chiếm, port nằm ngoài 1-65535...)
// sẽ ném vào đây dưới dạng sự kiện 'error'. Không bắt thì process chết im lặng,
// log Render chỉ còn dòng trống rất khó đoán.
server.on('error', (err) => {
  console.error(`Khong khoi dong duoc server tren ${HOST}:${PORT}: ${err.message}`)
  process.exit(1)
})

// Render gửi SIGTERM khi khởi động lại instance. Đóng server cho sạch thay vì
// để bị giết giữa chừng.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0))
  })
}
