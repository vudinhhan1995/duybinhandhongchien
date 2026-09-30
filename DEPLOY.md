# Huong dan deploy thiep cuoi len Render

Tai lieu nay giai thich vi sao cac lan deploy vua roi that bai, va hai cach trien
khai dung cho repo nay.

---

## 1. Vi sao deploy vua fail

### 1a. Loi moi nhat: `vite: not found` (deploy 12:47)

Log Render:

```
Running 'npm run start'
> thiepcuoitemplace@1.0.0 start
> cd web && npm ci && npm run build
added 5 packages, and audited 6 packages in 9s
> thiep-cuoi-duy-binh-hong-chien@1.0.0 build
> vite build
sh: 1: vite: not found
Exited with status 127
```

Render da dung Node va `npm ci` chay duoc, nen luoi doan sai ngon ngu (1b) da
duoc sua. Con lai mot loi moi: **Render dat `NODE_ENV=production` luc build.**

**Bang chung trong log: `added 5 packages`.** Trong khi `web/package.json` khai
63 package. Con 5 package do khong phai ngau nhien — chinh xac la:

```
react, react-dom, scheduler, loose-envify, js-tokens
```

= toan bo phan `dependencies`. `devDependencies` **bi bo qua hoan toan**. Vite
nam o `devDependencies` nen khong duoc cai, nen `vite build` khong tim thay
binary -> `sh: 1: vite: not found` (exit 127).

Kiem chung nguyen tac: khi `NODE_ENV=production`, npm coi `npm ci` la cai
production nen mac dinh bo qua `devDependencies`.

### Da sua: chuyen vite sang `dependencies`

Trong `web/package.json`, `vite` va `@vitejs/plugin-react` da chuyen tu
`devDependencies` sang `dependencies`, va khoi `devDependencies` da bi xoa han.

**Ly do khong chi them `--include=dev`:** `--include=dev` la lenh phai truyen
khi chay `npm ci` — con dung o `dependencies` thi khong can truyen gi ca. Cach
nay **chac chan dung bat ke** moi truong build co dat `NODE_ENV=production`,
`NPM_CONFIG_PRODUCTION=true` hay khong. Cong cu build can luc deploy thi ve ban
chat no la **dependency cua qua trinh deploy**, khong phai dependency phat
trien.

`web/package-lock.json` da dong bo lai (khong con `"dev": true` nao), nen
`npm ci` khong fail.

### Lop phong thu thu hai: `--include=dev`

`package.json` o goc repo, script `build`:

```json
"build": "cd web && npm ci --include=dev && npm run build"
```

Hai lop nay doc lap nhau. Lop 1 (dependencies) la lop chinh; lop 2 bao ve cho
truong hop sau nay co them package dev khac.

### Da sua: `start` chang tu "build lai" sang "phuc vu"

`package.json` o goc, script `start` **truoc day**:

```json
"start": "cd web && npm ci && npm run build"    <-- SAI
```

Render goi `npm run start` luc **RUNTIME** (log: `Running 'npm run start'`).
Nen ban cu **build lai ca lan moi khoi dong** — vua lai phi, vua sai ban chat:
`start` phai phuc vu file da build, khong phai bien file do thanh moi.

**Banh sau khi sua:**

```json
"start": "cd web && npm run preview -- --host 0.0.0.0 --port ${PORT:-4173}"
```

`vite preview` dung la phuc vu thu muc `web/dist`. `${PORT:-4173}` lay port
Render cap, fallback 4173 khi chay local.

> **LUU Y KHI CHAY LOCAL TREN WINDOWS/CMD:**
> `${PORT:-4173}` la cu phap **POSIX shell** (`sh`). Render chay Linux nen
> binh thuong. Nhung tren Windows, npm chay script bang `cmd.exe`, nen bien
> `${PORT:-4173}` duoc truyen nguyen van cho vite va bao loi
> `EACCES: permission denied ${PORT:-4173}`. Neu can chay `npm run start` tren
> may Windows, thay bang port cu the:
> `cd web && npm run preview -- --host 0.0.0.0 --port 4173`
> (Dung `npm run dev` de phat trien binh thuong — `start` chi de kiem tra ban
> build.)

### `start` duoc dung khi nao

| Loai dich vu | Script nao chay |
|---|---|
| **Static Site** (khuyen nghi) | Chi `buildCommand`. KHONG dung `start`. |
| **Web Service** | `buildCommand` luc build + `start` (= `vite preview`) luc chay |

Render phuc vu file tinh qua CDN nen Static Site khong can tien trinh node nao
sau khi build xong.

### Kiem chung bang chung (chay tai may, da PASS)

| Kiem tra | Ket qua |
|---|---|
| `NODE_ENV=production` + `npm run build` o goc | `added 63 packages` (truoc la 5), `vite build` chay duoc, `built in 904ms` |
| `NODE_ENV=production` + `npm ci` (khong co `--include=dev`) | `added 63 packages`, `node_modules/.bin/vite` ton tai — lop 1 hoat dong doc lap |
| `npm ci` trong `web/` | PASS, khong loi "lock file out of sync" |
| `npm run build` trong `web/` | PASS, 51 modules, `built in 762ms` |
| `vite preview` tren port 4173 | HTTP 200, `<div id="root">` co trong HTML |
| `vite preview` tren port 5123 | HTTP 200, `<div id="root">` — co hoi port dynamic |

### 1b. Loi truoc do: Render doan sai ngon ngu

Log Render:

```
==> Using Python version 3.14.3 (default)
==> Running build command `pip install -r requirements.txt`...
ERROR: Could not open requirements file: [Errno 2] No such file or directory: `requirements.txt`
==> Build failed
```

**Day la su doan sai ngon ngu cua Render, khong phai loi code.**

Render tu dong phat hien ngon ngu du an bang cach QUET CAC FILE O THU MUC GOC repo:

| File Render tìm ở goc | Luc deploy fail | Hien tai |
|---|---|---|
| `package.json` | Khong | **Co** (da them de sua loi nay) |
| `requirements.txt` | Khong | Khong |
| `go.mod` | Khong | Khong |
| `Gemfile` | Khong | Khong |

Toan bo ma nguon React nam trong thu muc `web/`. O goc repo chi co `render.yaml`,
`README.md`, `.gitignore` va `apps-script/` — khong co file nhan dien ngon ngu nao.

Khi khong tim thay file nao, Render **mac dinh chon Python**, build command mac
dinh la `pip install -r requirements.txt`, va file do khong ton tai nen build
that bai ngay.

Xac nhan luc do (truoc khi sua):

```
root package.json:     False
root requirements.txt: False
root go.mod:          False
root Gemfile:         False
web/package.json:     True
web/package-lock.json: True
```

### Da sua xong: them `package.json` o GOC repo

Goc repo hien da co `package.json` + `package-lock.json` duoc commit san:

```
thiepcuoi/
├── package.json        <- CỔNG DÒ NGÔN NGỮ (không có dependency)
├── package-lock.json
└── web/
    ├── package.json    <- dự án thật (React + Vite)
    └── ...
```

Render quét thay goc repo, thay `package.json` -> **tu chon Node.js**, khong con
roi ve Python nua. File o goc khong khai bao `dependencies` va khong khai bao
`workspaces` — no chi la file wrapper, script cua no delegate xuong that:

```json
"build": "cd web && npm ci --include=dev && npm run build"
```

=> Chay `npm run build` o goc repo cho ra y het ket qua build trong `web/`.
=> Service moi tao tren Render **tu do dung Node**, khong can chinh tay gi.
=> Render Static Site chi can dat Build Command = `npm run build` (khong can
   `cd web &&` nua, script goc da tu delegate).

Hai nguyen nhan phu tiem an can luu y:

1. **Service co the da duoc tao tay qua Dashboard, khong phai qua Blueprint.**
   Render chi doc file `render.yaml` khi tao service bang `New > Blueprint`.
   Neu tao tay qua `New > Web Service`, Render bo qua `render.yaml` hoan toan
   va dung bo dem mac dinh (doan Python).
2. **Commit dang deploy chi co `README.md`.** Commit `e18dd4e` ("first commit")
   chi them dung 1 file, nen du co chay `npm install` thi cung khong co gi de
   build. Phai push ma nguon `web/` len truoc.

### QUAN TRONG — service cu KHONG can xoa lai

> **Cap nhat sau deploy 12:47: KHONG con dung phan "xoa service" ben duoi.**
> Log deploy 12:47 da chung minh service hien tai **da chay dung Node**:
>
> ```
> > thiepcuoitemplace@1.0.0 start
> > cd web && npm ci && npm run build
> ```
>
> `thiepcuoitemplace` chinh la ten trong `package.json` o GOC repo, va
> `cd web && npm ci` chinh xac la script cua no. Nghia la loi doan sai ngon ngu
> (Python) **da duoc sua xong**. Service dang dung, chi con 1 loi rieng: thieu
> `vite` (muc 1a).
>
> **=> Bay gio chi can bam Manual Deploy. KHONG xoa service, KHONG tao lai.**

Phan duoi giu lai lam tham khao cho truong hop ban muon tao service moi tu dau.

### Tham khao — service co the da duoc tao tay qua Dashboard

Service `srv-dau95go93c1s73d8sr5g` **da tung luu runtime Python vao database cua
Render** luc tao. Day la setting da luu, khong phai cai gi Render quet lai
moi lan deploy. Neu ban gap `pip install` trong log, nghia la service do chua
duoc sua config, khi do phai:

1. **Sua lai cau hinh trong Dashboard** (Settings > Environment > Runtime), hoac
2. **Xoa service** va tao lai tu dau (Cach A hoac Cach B ben duoi).

### Kiem tra service cua ban la Static Site hay Web Service

Log deploy 12:47 co dong `Running 'npm run start'`. **Render Static Site KHONG
chay `start`** — no chi chay `buildCommand` roi phuc vu file qua CDN. Vay dong
do nghia la service cua ban **da duoc cau hinh chay `npm run start`**, dung
Web Service (hoac start command bi dat tay).

| Service type | Build phase | Runtime | `start` co dung khong? |
|---|---|---|---|
| **Static Site** | `npm run build` | Render phuc vu `web/dist` qua CDN | **Khong** |
| **Web Service** | `npm run build` | `npm run start` = `vite preview` | **Co** |

Cach kiem tra: Dashboard > chon service > Settings, xem dong **Type**. Hoac xem
Render co hien thi dong "Start Command" khong — chi Web Service moi co.

Neu la **Web Service**: `start` moi chay, va `vite preview` la dung thu can
phuc vu. Nhớ phai dat **Health Check Path** = `/` neu Render yeu cau.

Neu la **Static Site**: chi `buildCommand` chay, va `staticPublishPath` phai
khop `web/dist`.

---

## 2. Cach A — Tao bang Blueprint (khuyen nghi)

> **CHI LAM MUC NAY NEU BAN MUON TAO SERVICE MOI.** Service hien tai da chay
> dung Node roi — xem muc 1. Neu chi can deploy lai, bam **Manual Deploy** la
> xong, khong can tao lai gi ca.

Day la cach duy nhat doc duoc `render.yaml`, nen it nhat phai cau hinh tay.

**Buoc 1 — Xoa service cu bi fail (chi khi tao moi)**

Dashboard Render > chon service `srv-dau95go93c1s73d8sr5g` > Settings > Delete.

> Chi can buoc nay khi ban thuc su tao lai service moi va service cu dang
> config sai runtime. Khong xoa service dang chay dung.

**Buoc 2 — Tao moi bang Blueprint**

1. Vao Dashboard Render.
2. Chon **New > Blueprint**.
3. Chon **Connect repository**: `vudinhhan1995/thiepcuoitemplace`.
4. Chon **Branch**: `main`.
5. Render hien thi preview cau hinh doc tu `render.yaml` — kiem tra lai:
   - Name: `thiep-cuoi`
   - Runtime: `static`
   - Build Command: `npm run build`
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

Dung cach nay neu khong muon dung `render.yaml`, hoac Blueprint khong tao duoc.

Khi Render hoi chon loai dich vu, chon **Static Site** (KHONG phai Web Service).
Static Site dung cho file tinh, nhanh hon, va ho tro `staticPublishPath`.

Bang dien tung truong:

| Truong | Gia tri |
|---|---|
| Loai dich vu | **Static Site** (KHONG phai Web Service) |
| Root Directory | **DE TRONG** (repo root — KHONG phai `web`) |
| Build Command | `npm run build` |
| Publish Path | `web/dist` |
| Node version | 20.x hoac de mac dinh |

**Luong y quan trong nhat: `Root Directory` de TRONG, khong dat `web`.**

Ly do: o goc repo da co san `package.json` (them de sua loi Render doan sai
ngon ngu — xem muc 1), nen Render **tu do dung Node.js** ma khong can chi tay
gi. Build command `npm run build` chay o goc, script do tu `cd web` vao
build that:

```
npm run build  ==  cd web && npm ci --include=dev && npm run build
```

`Publish Path` cung vay phai la `web/dist` (KHONG phai `dist`), vi
`Root Directory` de trong nen duong dan publish duoc hieu theo repo root.
`render.yaml` cung dung cap hinh nay: `staticPublishPath: ./web/dist`.

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
Neu file do tra 404, kiem tra lai `Publish Path` (phai la `web/dist`, dung
`Root Directory` de trong).

Neu **trang trang** va log Render lai bao `pip install`, nghinh la: service
do chua duoc tao lai. Xem lai muc 1 — service cu da luu cung runtime Python.

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
| `Root Directory` | De trong (repo root) | De trong (repo root) |
| Build Command | `npm run build` | `npm run build` |
| Publish Path | `./web/dist` | `web/dist` |
| Nguy co ca nham ve Runtime | Rat thap | Rat thap — `package.json` o goc repo da lo chuyen nay |
| Khi sua cau hinh sau nay | Sua trong `render.yaml` roi commit | Phai vao Dashboard sua lai |
| Khi doi nhanh | Xoa service, tao lai Blueprint | Sua trong UI |
| **Khuyen nghi** | **Co** | Duong backup |

Hai cach deu **khong con** lo so Render doan sai Python, vi `package.json` o
goc repo da duoc commit san lam cong do ngon ngu (muc 1).

Chon **Cach A** neu dang lam lai tu dau. Chi dung **Cach B** khi can giu nguyen
service cu, hoac Blueprint khong tao duoc vi ly do gi.
