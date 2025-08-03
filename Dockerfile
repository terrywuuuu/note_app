# 使用 Node.js 官方映像
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製應用程式程式碼
COPY . .

# 建立非 root 用戶
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 變更檔案擁有者
RUN chown -R nodejs:nodejs /app
USER nodejs

# 暴露端口
EXPOSE 3000

# 啟動應用程式
CMD ["npm", "start"] 