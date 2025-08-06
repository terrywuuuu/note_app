require('dotenv').config();
// 导入模块
const express = require('express');
const authRoutes = require('./user');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const passport = require('./passport-config');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');

// 根據環境設定 CORS
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.APP_URL 
        : `http://localhost:${port}`,
    credentials: true
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());

// 初始化 Passport
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 路由设置
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Origin.html'));
});

app.use('/api/auth', authRoutes);

// 启动服务器
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
