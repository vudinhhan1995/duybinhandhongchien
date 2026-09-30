# Huong dan deploy thiep cuoi len Render

Tài liệu này giai thích vì sao lần deploy vừa rồi thất bại, và hai cách triển khai
đúng cho repo nay.

---

## 1. Vi sao deploy vua fail

Log Render:

```
==> Using Python version 3.14.3 (default)
==> Running build command `pip install -r requirements.txt`...
ERROR: Could not open requirements file: [Errno 2] No such file or directory: `requirements.txt`
==> Build failed
```

**Day la su doan sai ngon ngu cua Render, khong phai loi code.**

Render tu dong phat hien ngon ngu du an bang cach QUET CAC FILE O THU MUC GOC repo:

| File Render tìm ở goc | Có trong repo nay khong |
|---|---|
| `package.json` | Khong |
| `requirements.txt` | Khong |
| `go.mod` | Khong |
| `Gemfile` | Khong |

Toan bo ma nguon React nam trong thu muc `web/`. O goc repo chi co `render.yaml`,
`README.md`, `.gitignore` va `apps-script/` — khong co file nhan dien ngon ngu nao.

Khi khong tim thay file nao, Render **mac dinh chon Python**, build command mac
dinh la `pip install -r requirements.txt`, va file do khong ton tai nen build
that bai ngay.

Xac nhan tren dia:

```
root package.json:     False
root requirements.txt: False
root go.mod:          False
root Gemfile:         False
web/package.json:     True
web/package-lock.json: True
```

Hai nguyen nhan phu tiem an can luu y:

1. **Service co the da duoc tao tay qua Dashboard, khong phai qua Blueprint.**
   Render chi doc file `render.yaml` khi tao service bang `New > Blueprint`.
   Neu tao tay qua `New > Web Service`, Render bo qua `render.yaml` hoan toan
   va dung bo dem mac dinh (doan Python).
2. **Commit dang deploy chi co `README.md`.** Commit `e18dd4e` ("first commit")
   chi them dung 1 file, nen du co chay `npm install` thi cung khong co gi de
   build. Phai push ma nguon `web/` len truoc.

---

## 2. Cach A — Tao bang Blueprint (khuyen nghi)

Day la cach duy nhat doc duoc `render.yaml`, nen it nhat phai cau hinh tay.

**Buoc 1 — Xoa service cu bi fail**

Dashboard Render > chon service `srv-dau95go93c1s73d8sr5g` > Settings > Delete.
(Neu giu lai, service moi se lay lai config Python cu va van fail tiep.)

**Buoc 2 — Tao moi bang Blueprint**

1. Vao Dashboard Render.
2. Chon **New > Blueprint**.
3. Chon **Connect repository**: `vudinhhan1995/thiepcuoitemplace`.
4. Chon **Branch**: `main`.
5. Render hien thi preview cau hinh doc tu `render.yaml` — kiem tra lai:
   - Name: `thiep-cuoi`
   - Runtime: `static`
   - Build Command: `cd web && npm ci && npm run build`
   - Publish Path: `./web/dist`
6. Bam **Apply** / **Create**.

Render tu doc va ap dung blueprint, khong con buoc doan ngon ngu, nen khong
the nao chay nham `pip install` nua.

**Neu Blueprint bao loi khi tao**, thuong la do:

- Chua push code len `main` (thu muc `web/` chua co trong repo).
- `render.yaml` co loi cu phap YAML.
- Chon nham repository.

---

## 3. Cach B — Tao tay qua Dashboard

Dung cach nay neu khong muon xoa service cu, hoac Blueprint khong tao duoc.

Khi Render hoi chon loai dich vu, chon **Static Site** (KHONG phai Web Service).
Static Site dung cho file tinh, nhanh hon, va ho tro `staticPublishPath`.

Bang dien tung truong:

| Truong | Gia tri |
|---|---|
| Runtime | Node |
| Root Directory | `web` |
| Build Command | `npm ci && npm run build` |
| Publish Path | `dist` |
| Node version | 20.x hoac de mac dinh |

**Luong y quan trong nhat:** `Root Directory = web` la thu truong then chot.
Nho set, Render se tim `package.json` o goc repo (noi khong co gi) va lai doan
sai thanh Python. Set `web`, Render moi thay dung `web/package.json`.

`Publish Path = dist` (khong phai `web/dist`) vi `staticPublishPath` duoc
hieu la duong dan tinh theo `Root Directory`.

Neu Render khong co truong `routes` trong UI, them thu cong:

```
/*  ->  /index.html
```

Dieu nay giup F5 tren duong dan con (vi du `/lich`, `/rsvp`) khong bao loi 404.

---

## 4. Cau hinh form RSVP

Form RSVP gui thong tin ve Google Sheets thong qua Google Apps Script.

**Buoc 1 — Tao script phia Google Sheets**

Lam theo huong dan trong `apps-script/README.md` (tao Google Sheet, dan
`Code.gs` vao Extensions > Apps Script, deploy o dang Web App).

**Buoc 2 — Lay URL `/exec`**

Sau khi deploy Apps Script, ban se co duong dan dang:

```
https://script.google.com/macros/s/AKfycbXXXXXXXXXXXX/exec
```

Day la URL can dung.

**Buoc 3 — Dat bien moi truong tren Render (cach DUNG)**

Vao service Render > Environment > Add Environment Variable:

| Key | Value |
|---|---|
| `VITE_RSVP_ENDPOINT` | `https://script.google.com/macros/s/AKfycbXXXXXXXXXXXX/exec` |

**Day la cach DUNG, va la cach duy nhat khan cho moi truong Render.**

Ly do: `VITE_` la bien tien goc — Vite thay the bien moi truong VAO CODE luc
build, khong phai luc chay. Render Static Site build mot lan luc deploy, nen
bien moi truong **phai co san TRUOC khi Render bat dau build**. Neu them bien
sau khi deploy xong, ban phai bam Manual Deploy lai, neu khong code da bundle
se van chua gia tri.

**Khong nen tao file `web/.env` va commit**

File `.env` da nam trong `.gitignore`, va dung ra khong nen commit. No cung
chi co hieu luc tren may local cua ban, khong dua duoc len Render.

Neu muon dung `.env` o local de test: copy tu `web/.env.example` thanh
`web/.env`, dan URL vao, va khoi dong lai `npm run dev`.

---

## 5. Kiem tra sau khi deploy

Sau khi Render bao "Live", mo duong dan Render tra ve va kiem tra lan luot:

| Muc | Ky vong |
|---|---|
| Tien cua hai nguoi | "Pham Duy Binh" va "Pham Thi Hong Chien" hien thi dung dau |
| Anh cua doi | Anh `hero-couple.jpg` va `couple-2.jpg` hien, khong phai anh vo |
| Ngan | `29.11.2026` hien o the ngay va o phan thong tin su kien |
| Lich tu sinh | Keo xuong, lich thang 11/2026 co khoang ngay 29 duoc danh dau |
| Ban do | Ban do Poseidon (Ho Chi Minh) hien, nut "Xem Chi Duong" bam duoc |
| Form RSVP | Dien ten, quan he, loi chuc, chon co/ khong, bam "Xac Nhan Tham Du" |
| Popup cam on | Sau khi gui form, popup "Cam on" hien len |
| Nut nhac | Nut loa o goc tren phai, bam duoc, nhac phat |
| Popup qua | Bam vao pham "qua" o section cua doi, popup so tai khoan hien |
| Khong loi | Mo DevTools > Console, khong co loi React hoac loi 404 asset |

Neu trang trang: mo DevTools > Network, tim request `/assets/index-*.js`.
Neu file do tra 404, kiem tra lai `Root Directory` va `Publish Path`.

---

## 6. Bao mat

**URL `/exec` cua Google Apps Script la cong khai.**

Day la han ch quan trong cua kieu App Script deploy dang "Anyone". Bat ky ai
biet duong dan do deu co the gui du lieu vao Google Sheet cua ban — ke ca
nguoi xem ngam tinh, khong can vao duoc website.

Bien `VITE_RSVP_ENDPOINT` tren Render co chua dung URL do. Vite bien bien moi
truong vao bundle JavaScript ma moi nguoi deu tai duoc, nen k co the lam bi mat
duong dan. Nhung chinh vi vay, URL nay phai duoc coi nhu cong khai.

**Bien phap neu bi spam:**

1. **Them CAPTCHA** — hieu qua nhat. Ban co the dung Google reCAPTCHA v3
   (chi kiem tra diem, khong hien checkbox) va chap nhan chi gui du lieu khi
   `score` vuot nguong. Cach nay chan duoc bot ma hoa dong da phu.
2. **Gioi han rate** — trong `Code.gs`, bo dem so luot goi trong mot khung
   thoi gian, tu choi request vuot nguong.
3. **Kiem tra du lieu dau vao** — xac thuc ten, gioi han do dai, loai bo
   ky tu la, chuan hoa dau so dien thoai.
4. **Lam moi deploy Apps Script** — tai tao deployment moi va thay URL tren
   Render (roi Manual Deploy lai). Cach nay khong chan ngam tinh cu nhung lam
   URL cu ket thuc.

Luon luon giu file `.env` khoi commit, va khong chia se URL `/exec` cong khai
trong file README, anh chup man hinh, hay tin nhan.

---

## 7. Tom tat hai cach deploy

| | Cach A — Blueprint | Cach B — Tao tay |
|---|---|---|
| Da duoc Render doc `render.yaml` | Co | Khong |
| So cau hinh phai nhap | 2 (repo + branch) | 5 truong |
| Nguy co ca nham ve Runtime | Rat thap | Cao — hay quen `Root Directory` |
| Khi sua cau hinh sau nay | Sua trong `render.yaml` roi commit | Phai vao Dashboard sua lai |
| Khi doi nhanh | Xoa service, tao lai Blueprint | Sua trong UI |
| **Khuyen nghi** | **Co** | Duong backup |

Chon **Cach A** neu dang lam lai tu dau. Chi dung **Cach B** khi can giu nguyen
service cu, hoac Blueprint khong tao duoc vi ly do gi.
