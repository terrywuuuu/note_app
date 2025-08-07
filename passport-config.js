const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken');
const { findUserByOAuthId, createOAuthUser, findUserByEmail, updateUserOAuthInfo } = require('./backend/userModel');

// Google OAuth 策略
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    callbackURL: process.env.NODE_ENV === 'production' 
        ? `https://supernote-l6k9.onrender.com/api/auth/google/callback`
        : "http://localhost:3000/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // 檢查是否已有此 Google 用戶
        let user = await findUserByOAuthId(profile.id, 'google');
        
        if (!user) {
            // 檢查是否有相同 email 的用戶
            const existingUser = await findUserByEmail(profile.emails[0].value);
            
            if (existingUser) {
                // 如果用戶存在但沒有 OAuth 資訊，更新用戶資訊
                await updateUserOAuthInfo(
                    existingUser.id, 
                    profile.id, 
                    'google', 
                    profile.photos && profile.photos[0] ? profile.photos[0].value : null
                );
                user = existingUser;
            } else {
                // 創建新用戶
                const userId = await createOAuthUser(profile, 'google');
                user = await findUserByOAuthId(profile.id, 'google');
            }
        }
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// GitHub OAuth 策略
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
    callbackURL: process.env.NODE_ENV === 'production' 
        ? `https://supernote-l6k9.onrender.com/api/auth/github/callback`
        : "http://localhost:3000/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // 檢查是否已有此 GitHub 用戶
        let user = await findUserByOAuthId(profile.id, 'github');
        
        // GitHub 的 email 處理方式不同
        const userEmail = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.username}@github.local`;
        
        if (!user) {
            // 檢查是否有相同 email 的用戶
            const existingUser = await findUserByEmail(userEmail);
            
            if (existingUser) {
                // 如果用戶存在但沒有 OAuth 資訊，更新用戶資訊
                await updateUserOAuthInfo(
                    existingUser.id, 
                    profile.id, 
                    'github', 
                    profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
                );
                user = existingUser;
            } else {
                // 創建新用戶
                const userId = await createOAuthUser(profile, 'github');
                user = await findUserByOAuthId(profile.id, 'github');
            }
        }
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Facebook OAuth 策略 - 暫時停用
// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
//     clientSecret: process.env.FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
//     callbackURL: "http://localhost:3000/api/auth/facebook/callback",
//     profileFields: ['id', 'displayName', 'photos', 'email']
// }, async (accessToken, refreshToken, profile, done) => {
//     try {
//         // 檢查是否已有此 Facebook 用戶
//         let user = await findUserByOAuthId(profile.id, 'facebook');
//         const fbAvatar = `https://graph.facebook.com/${profile.id}/picture?type=large`;
//         
//         if (!user) {
//             // 檢查是否有相同 email 的用戶
//             const existingUser = await findUserByEmail(profile.emails[0].value);
//             
//             if (existingUser) {
//                 // 如果用戶存在但沒有 OAuth 資訊，更新用戶資訊
//                 await updateUserOAuthInfo(
//                     existingUser.id, 
//                     profile.id, 
//                     'facebook', 
//                     fbAvatar
//                 );
//                 user = existingUser;
//             } else {
//                 // 創建新用戶
//                 const userId = await createOAuthUser(
//                     { ...profile, photos: [{ value: fbAvatar }] }, 
//                     'facebook'
//                 );
//                 user = await findUserByOAuthId(profile.id, 'facebook');
//             }
//         }
//         return done(null, user);
//     } catch (error) {
//         return done(error, null);
//     }
// }));

// 序列化用戶
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// 反序列化用戶
passport.deserializeUser(async (id, done) => {
    try {
        // 這裡可以添加從資料庫獲取用戶資訊的邏輯
        done(null, { id });
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport; 