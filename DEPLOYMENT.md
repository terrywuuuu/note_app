# 🚀 Super Note 部署指南

本專案為一個功能完整的筆記應用程式，支援使用者註冊、登入、OAuth 認證（Google、GitHub），以及筆記的新增、刪除、更新與查詢功能。

部署方式使用：
- **前端**：Vercel（靜態網站託管）
- **後端**：Render Web Service（Node.js + Express）
- **資料庫**：Render PostgreSQL

---

## 📦 部署流程總覽

### 🔐 1. 設定環境變數

在 Render 部署後端服務時，前往「Environment」頁籤設定以下變數：

| 變數名稱 | 說明 |
|----------|------|
| `DATABASE_URL` | Render 提供的 PostgreSQL 連線字串 |
| `SESSION_SECRET` | JWT 加密用的隨機長字串 |
| `GOOGLE_CLIENT_ID` | Google OAuth 憑證 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 憑證密鑰 |
| `GITHUB_CLIENT_ID` | GitHub OAuth 憑證 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth 憑證密鑰 |
| `APP_URL` | 前端網址（例：`https://note-app-ten-chi.vercel.app`） |
| `NODE_ENV` | 設為 `production` |

---

### 🗄️ 2. 部署資料庫（Render PostgreSQL）

1. 前往 [https://dashboard.render.com/](https://dashboard.render.com/)
2. 建立 PostgreSQL 資料庫服務
3. 複製 `External Database URL`，作為 `DATABASE_URL`
4. 使用 `pgAdmin` 或 `psql` 匯入你建立的資料表：
   - 使用 Render 提供的帳號、密碼、host 進行連線
   - 匯入 `schema.sql` 或你自己的建表語句

---

### 🌐 3. 部署後端（Render）

1. 建立 Render Web Service
2. 選擇連接你的 GitHub 儲存庫
3. Branch：選擇 `main` 或你的主要分支
4. Build Command（若有）：`npm install`
5. Start Command：`npm start`
6. 設定好上方的環境變數
7. Render 會自動偵測 `PORT`，並啟動應用程式

---

### 🎨 4. 部署前端（Vercel）

1. 前往 [https://vercel.com/](https://vercel.com/)
2. 新增專案 → 選擇此專案的 GitHub Repository
3. 建立後：
   - 將 `/public` 設為根目錄或上傳作為靜態網站
   - 確保 OAuth 的回呼網址已設為 `https://<vercel-url>/api/auth/...`

---

## 🔑 5. 設定 OAuth 登入（Google / GitHub）

### Google OAuth：

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立 OAuth 憑證
3. 設定回呼網址為：
https://your-backend-url.onrender.com/api/auth/google/callback

markdown
複製
編輯

### GitHub OAuth：

1. 前往 [https://github.com/settings/developers](https://github.com/settings/developers)
2. 建立 OAuth App
3. 設定回呼網址為：
https://your-backend-url.onrender.com/api/auth/github/callback

yaml
複製
編輯

---

## ✅ 測試應用程式

- 開啟你的 Vercel 前端網址（例：`https://note-app-ten-chi.vercel.app`）
- 嘗試註冊 / 登入 / OAuth / 新增筆記
- 檢查前後端是否成功連接、cookie 是否正常儲存

---

## 📂 附註

- 若 cookie 登入無效，請確認：
  - 後端設為 `secure: true` 且使用 HTTPS
  - cookie `sameSite` 設定為 `Strict` 或 `None`
  - Render 的後端服務網址與前端網域一致（允許跨域）

- 若 OAuth 回呼錯誤，請檢查：
  - `.env` 中的 `APP_URL`、回呼網址是否與平台設定一致
  - 前端是否從正確網域呼叫 API