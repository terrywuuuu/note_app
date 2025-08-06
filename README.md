# Super Note

一個功能完整的筆記應用程式，支援用戶註冊、登入、OAuth 認證，以及筆記的增刪改查功能。

## 功能特色

- 🔐 用戶認證系統（本地註冊/登入 + OAuth）
- 📝 筆記管理（新增、刪除、查看）
- 📅 日曆視圖顯示筆記
- 👤 用戶資料管理（頭像、用戶名）
- 🎨 現代化 UI 設計
- 🔒 安全的 JWT 認證
- 🍪 Cookie 基礎的會話管理

## 技術棧

- **後端**: Node.js, Express.js
- **資料庫**: PostgreSQL
- **認證**: Passport.js, JWT
- **前端**: HTML5, CSS3, JavaScript
- **日曆**: FullCalendar.js

## 快速開始

### 本地開發

1. 克隆專案
```bash
git clone <repository-url>
cd note_app
```

2. 安裝依賴
```bash
npm install
```

3. 設定環境變數
```bash
cp env.example .env
# 編輯 .env 檔案，填入您的設定
```

4. 啟動開發伺服器
```bash
npm run dev
```

5. 開啟瀏覽器訪問 `http://localhost:3000`

## 部署

專案已成功部署在：

前端： Vercel

後端 + 資料庫： Render

詳細的部署說明請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 環境變數

請參考 `env.example` 檔案了解所需的環境變數。

## 授權

MIT License, ，詳見 [LICENSE](./LICENSE)

## 聯絡方式

如需刪除帳號或資料，請聯絡開發者：t940408wu@gmail.com