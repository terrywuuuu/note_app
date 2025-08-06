// const sql = require('mssql');

// const config = {
//   server: process.env.DB_SERVER || 'localhost',
//   database: process.env.DB_NAME || 'Note',
//   options: {
//     encrypt: true, // 啟用加密連線
//     trustServerCertificate: process.env.NODE_ENV !== 'production', // 生產環境不信任未受信任的憑證
//   },
//   authentication: {
//     type: 'default',  // 使用 SQL Server 驗證
//     options: {
//       userName: process.env.DB_USER,  // 使用 SQL Server 驗證的用戶名
//       password: process.env.DB_PASS,  // 使用 SQL Server 驗證的密碼
//     }
//   }
// };

// sql.connect(config)
//   .then(pool => {
//     console.log('Connected to SQL Server');
//     return pool;
//   })
//   .catch(err => {
//     console.error('Connection failed:', err);
//   });

// const poolPromise = sql.connect(config);
// module.exports = { poolPromise };

const { Pool } = require('pg'); // 引入 pg 的 Pool 來管理資料庫連接池

// 設定 PostgreSQL 的連接配置
const config = {
  // user: process.env.DB_USER, // 使用的資料庫用戶
  // host: process.env.DB_SERVER, // 伺服器
  // database: process.env.DB_NAME, // 資料庫名稱
  // password: process.env.DB_PASS, // 密碼
  // port: process.env.DB_PORT || 5432, // 預設 PostgreSQL 端口
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
};

const pool = new Pool(config); // 用 Pool 管理多個連線

// 測試連接
pool.connect()
  .then(client => {
    console.log('Connected to PostgreSQL');
    client.release(); 
  })
  .catch(err => {
    console.error('Connection failed:', err);
  });

// 將 poolPromise 匯出
module.exports = { pool };
