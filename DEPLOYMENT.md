# Super Note 部署指南

## 部署前準備

### 1. 環境變數設定
複製 `env.example` 為 `.env` 並填入實際值：

```bash
cp env.example .env
```

#### 必要環境變數：
- `DB_USER`: 資料庫用戶名
- `DB_PASS`: 資料庫密碼
- `DB_SERVER`: 資料庫伺服器地址
- `DB_NAME`: 資料庫名稱
- `SESSION_SECRET`: JWT 密鑰（建議使用長且隨機的字串）
- `GOOGLE_CLIENT_ID`: Google OAuth 應用程式 ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth 應用程式密鑰
- `GITHUB_CLIENT_ID`: GitHub OAuth 應用程式 ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth 應用程式密鑰
- `NODE_ENV`: 設為 `production`
- `PORT`: 應用程式端口（預設 3000）
- `APP_URL`: 您的網域 URL（例如：https://your-domain.com）

### 2. 資料庫設定
確保您的 SQL Server 資料庫已經建立並包含必要的表格。

### 3. OAuth 應用程式設定

#### Google OAuth：
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用 Google+ API
4. 建立 OAuth 2.0 憑證
5. 設定授權重新導向 URI：`https://your-domain.com/api/auth/google/callback`

#### GitHub OAuth：
1. 前往 [GitHub Developer Settings](https://github.com/settings/developers)
2. 建立新的 OAuth App
3. 設定 Authorization callback URL：`https://your-domain.com/api/auth/github/callback`

## 部署步驟

### 方法一：使用 PM2（推薦）

```bash
# 安裝 PM2
npm install -g pm2

# 安裝專案依賴
npm install

# 啟動應用程式
pm2 start app.js --name "super-note"

# 設定開機自動啟動
pm2 startup
pm2 save
```

### 方法二：使用 Docker

```bash
# 建立 Dockerfile
docker build -t super-note .

# 運行容器
docker run -d -p 3000:3000 --env-file .env --name super-note-app super-note
```

### 方法三：直接部署

```bash
# 安裝依賴
npm install

# 啟動應用程式
npm start
```

## 反向代理設定（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL 憑證設定

使用 Let's Encrypt 免費 SSL 憑證：

```bash
# 安裝 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 取得 SSL 憑證
sudo certbot --nginx -d your-domain.com
```

## 監控和維護

### 查看應用程式狀態
```bash
pm2 status
pm2 logs super-note
```

### 重新啟動應用程式
```bash
pm2 restart super-note
```

### 更新應用程式
```bash
git pull
npm install
pm2 restart super-note
```

## 安全性檢查清單

- [ ] 所有敏感資訊都使用環境變數
- [ ] 資料庫連線使用加密
- [ ] JWT 密鑰足夠複雜
- [ ] CORS 設定正確
- [ ] Cookie 設定為 httpOnly 和 secure
- [ ] 使用 HTTPS
- [ ] 定期更新依賴套件
- [ ] 設定防火牆規則
- [ ] 定期備份資料庫

## 故障排除

### 常見問題：

1. **資料庫連線失敗**
   - 檢查資料庫伺服器是否運行
   - 確認環境變數設定正確
   - 檢查防火牆設定

2. **OAuth 登入失敗**
   - 確認 OAuth 應用程式設定正確
   - 檢查回調 URL 是否匹配
   - 確認網域已加入授權清單

3. **CORS 錯誤**
   - 確認 `APP_URL` 設定正確
   - 檢查前端請求的 origin

4. **Cookie 問題**
   - 確認使用 HTTPS
   - 檢查 cookie 設定 