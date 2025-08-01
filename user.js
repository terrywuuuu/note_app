const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { createUser, findUserByEmail, updateUserAvatar, updateUserUsername} = require('./userModel');
const { createNote, deleteNote, getNotesByUserId } = require('./noteModel');
const router = express.Router();

// JWT 驗證中間件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).send({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.SESSION_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// 註冊 API
router.post('/register', async (req, res) => {
    const { email, password, name, avatar } = req.body;
    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).send({ error: 'User already exists' });
        }
        const userId = await createUser(email, password, name, avatar);
        const token = jwt.sign({ id: userId }, process.env.SESSION_SECRET, { expiresIn: '1h' });
        res.status(201).send({ message: 'User registered successfully', token, username: name, userId: userId, avatar: avatar});
    } catch (error) {
        res.status(500).send({ error: 'Registration failed' });
    }
});

// 登入 API
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).send({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.SESSION_SECRET, { expiresIn: '1h' });
        res.send({ token, userId: user.id, username: user.username, avatar: user.avatar_url});
    } catch (error) {
        res.status(500).send({ error: 'Login failed' });
    }
});

router.put('/updateAvatar', authenticateToken, async (req, res) => {
    const { userId, avatar } = req.body;
    try {
        const updatedUser = await updateUserAvatar(userId, avatar);
        res.status(200).send({ userAvatar: updatedUser.avatar_url});
    } catch (error) {
        res.status(500).send({ error: 'Failed to update avatar' });
    }
});

router.put('/updateUsername', authenticateToken, async (req, res) => {
    const { userId, username } = req.body;
    try {
        const updatedUser = await updateUserUsername(userId, username);
        res.status(200).send({ username: updatedUser.username });
    } catch (error) {
        res.status(500).send({ error: 'Failed to update username' });
    }
});

// Google OAuth 登入路由
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth 回調路由
router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
    try {
        const token = jwt.sign({ id: req.user.id }, process.env.SESSION_SECRET, { expiresIn: '1h' });
        
        // 重定向到前端並帶上 token
        res.redirect(`/Note.html?token=${token}&userId=${req.user.id}&username=${req.user.username}&avatar=${req.user.avatar_url}`);
    } catch (error) {
        res.redirect('/public/Origin.html?error=oauth_failed');
    }
});

// Facebook OAuth 登入路由 - 暫時停用
// router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook OAuth 回調路由 - 暫時停用
// router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), (req, res) => {
//     try {
//         const token = jwt.sign({ id: req.user.id }, process.env.SESSION_SECRET, { expiresIn: '1h' });
//         
//         // 重定向到前端並帶上 token
//         res.redirect(`/Note.html?token=${token}&userId=${req.user.id}&username=${req.user.username}&avatar=${req.user.avatar_url}`);
//     } catch (error) {
//         res.redirect('/public/Origin.html?error=oauth_failed');
//     }
// });

// GitHub OAuth 登入路由
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub OAuth 回調路由
router.get('/github/callback', passport.authenticate('github', { session: false }), (req, res) => {
    try {
        const token = jwt.sign({ id: req.user.id }, process.env.SESSION_SECRET, { expiresIn: '1h' });
        
        // 重定向到前端並帶上 token
        res.redirect(`/Note.html?token=${token}&userId=${req.user.id}&username=${req.user.username}&avatar=${req.user.avatar_url}`);
    } catch (error) {
        res.redirect('/public/Origin.html?error=oauth_failed');
    }
});

router.post('/add', authenticateToken, async (req, res) => {
    const { userId, title, content, dueDate } = req.body;  // 從前端接收資料
    try {
        const newNote = await createNote(userId, title, content, dueDate);
        res.status(201).send(newNote);
    } catch (error) {
        res.status(500).send({ error: 'Failed to add note' });
    }
});

router.delete('/delete', authenticateToken, async (req, res) => {
    const { noteId, userId } = req.body;  // 從前端接收資料
    try {
        await deleteNote(noteId, userId);
        res.status(200).send({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to delete note' });
    }
});

// 查詢筆記
router.get('/list', authenticateToken, async (req, res) => {
    const { userId } = req.query;  // 從前端接收使用者 ID
    try {
        const notes = await getNotesByUserId(userId);
        res.status(200).send(notes);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch notes' });
    }
});

module.exports = router;
