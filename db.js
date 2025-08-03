const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'Note',
  options: {
    encrypt: true, // 啟用加密連線
    trustServerCertificate: process.env.NODE_ENV !== 'production', // 生產環境不信任未受信任的憑證
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
