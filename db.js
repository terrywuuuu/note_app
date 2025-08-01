const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'Note',
  options: {
    encrypt: true, // 啟用加密連線
    trustServerCertificate: true, // 信任未受信任的憑證（僅在測試環境使用）
  },
  authentication: {
    type: 'default',  // 使用 SQL Server 驗證
    options: {
      userName: process.env.DB_USER,  // 使用 SQL Server 驗證的用戶名
      password: process.env.DB_PASS,  // 使用 SQL Server 驗證的密碼
    }
  }
};

sql.connect(config)
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Connection failed:', err);
  });

const poolPromise = sql.connect(config);
module.exports = { poolPromise };
