// const { poolPromise } = require('./db');
// const bcrypt = require('bcryptjs');

// // 註冊新用戶
// async function createUser(email, password, name, avatar) {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const pool = await poolPromise;
//     const result = await pool.request()
//         .input('email', email)
//         .input('password', hashedPassword)
//         .input('name', name)
//         .input('avatar_url', avatar)
//         .query('INSERT INTO Users (username, email, password, avatar_url) OUTPUT INSERTED.id VALUES (@name, @email, @password, @avatar_url)');

//     return result.recordset[0].id;
// }

// // 根據 Email 查找用戶
// async function findUserByEmail(email) {
//     const pool = await poolPromise;
//     const result = await pool.request()
//         .input('email', email)
//         .query('SELECT * FROM Users WHERE email = @email');
    
//     if (result.recordset.length > 0) {
//         return result.recordset[0];
//     }
//     return null;
// }

// // 更新用戶頭像
// async function updateUserAvatar(userId, avatar) {
//     const pool = await poolPromise;
//     const result = await pool.request()
//         .input('userId', userId)
//         .input('avatar_url', avatar)
//         .query('UPDATE Users SET avatar_url = @avatar_url OUTPUT INSERTED.avatar_url WHERE id = @userId');

//     if (result.recordset.length > 0) {
//         return result.recordset[0];
//     }
//     return null;
// }

// // 更新用戶名稱
// async function updateUserUsername(userId, username) {
//     const pool = await poolPromise;
//     const result = await pool.request()
//         .input('userId', userId)
//         .input('username', username)
//         .query('UPDATE Users SET username = @username OUTPUT INSERTED.username WHERE id = @userId');

//     if (result.recordset.length > 0) {
//         return result.recordset[0];
//     }
//     return null;
// }

// // 根據 OAuth ID 查找用戶
// async function findUserByOAuthId(oauthId, provider) {
//     const pool = await poolPromise;
//     const result = await pool.request()
//         .input('oauthId', oauthId)
//         .input('provider', provider)
//         .query('SELECT * FROM Users WHERE oauth_id = @oauthId AND oauth_provider = @provider');
    
//     if (result.recordset.length > 0) {
//         return result.recordset[0];
//     }
//     return null;
// }

// // 創建 OAuth 用戶
// async function createOAuthUser(profile, provider) {
//     const pool = await poolPromise;
    
//     // 處理不同 OAuth 提供者的資料結構
//     let email, name, avatar;
    
//     if (provider === 'github') {
//         // GitHub 的資料結構
//         email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.username}@github.local`;
//         name = profile.displayName || profile.username || 'GitHub User';
//         avatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
//     } else {
//         // Google 和其他提供者的資料結構
//         email = profile.emails[0].value;
//         name = profile.displayName || profile.name.givenName + ' ' + profile.name.familyName;
//         avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
//     }
    
//     const result = await pool.request()
//         .input('email', email)
//         .input('name', name)
//         .input('oauthId', profile.id)
//         .input('provider', provider)
//         .input('avatar', avatar)
//         .query(`
//             INSERT INTO Users (username, email, oauth_id, oauth_provider, avatar_url) 
//             OUTPUT INSERTED.id 
//             VALUES (@name, @email, @oauthId, @provider, @avatar)
//         `);

//     return result.recordset[0].id;
// }

// // 更新用戶的 OAuth 資訊
// async function updateUserOAuthInfo(userId, oauthId, provider, avatar = null) {
//     const pool = await poolPromise;
//     await pool.request()
//         .input('userId', userId)
//         .input('oauthId', oauthId)
//         .input('provider', provider)
//         .input('avatar', avatar)
//         .query(`
//             UPDATE Users 
//             SET oauth_id = @oauthId, oauth_provider = @provider, avatar_url = @avatar 
//             WHERE id = @userId
//         `);
// }

// module.exports = { 
//     createUser, 
//     findUserByEmail, 
//     updateUserAvatar,
//     updateUserUsername,
//     findUserByOAuthId, 
//     createOAuthUser, 
//     updateUserOAuthInfo 
// };

const { pool } = require('./db');
const bcrypt = require('bcryptjs');

// 註冊新用戶
async function createUser(email, password, name, avatar) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
        INSERT INTO users (username, email, password, avatar_url)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
    `;
    const values = [name, email, hashedPassword, avatar];
    
    const res = await pool.query(query, values);
    return res.rows[0].id;  // 返回新創建的用戶 ID
}

// 根據 Email 查找用戶
async function findUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const res = await pool.query(query, [email]);
    
    if (res.rows.length > 0) {
        return res.rows[0];
    }
    return null;
}

// 更新用戶頭像
async function updateUserAvatar(userId, avatar) {
    const query = `
        UPDATE users
        SET avatar_url = $1
        WHERE id = $2
        RETURNING avatar_url;
    `;
    const res = await pool.query(query, [avatar, userId]);
    
    if (res.rows.length > 0) {
        return res.rows[0];
    }
    return null;
}

// 更新用戶名稱
async function updateUserUsername(userId, username) {
    const query = `
        UPDATE users
        SET username = $1
        WHERE id = $2
        RETURNING username;
    `;
    const res = await pool.query(query, [username, userId]);
    
    if (res.rows.length > 0) {
        return res.rows[0];
    }
    return null;
}

// 根據 OAuth ID 查找用戶
async function findUserByOAuthId(oauthId, provider) {
    const query = `
        SELECT * FROM users
        WHERE oauth_id = $1 AND oauth_provider = $2;
    `;
    const res = await pool.query(query, [oauthId, provider]);
    
    if (res.rows.length > 0) {
        return res.rows[0];
    }
    return null;
}

// 創建 OAuth 用戶
async function createOAuthUser(profile, provider) {
    // 處理不同 OAuth 提供者的資料結構
    let email, name, avatar;
    
    if (provider === 'github') {
        // GitHub 的資料結構
        email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.username}@github.local`;
        name = profile.displayName || profile.username || 'GitHub User';
        avatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
    } else {
        // Google 和其他提供者的資料結構
        email = profile.emails[0].value;
        name = profile.displayName || profile.name.givenName + ' ' + profile.name.familyName;
        avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
    }
    
    try {
        const result = await pool.query(`
            INSERT INTO Users (username, email, oauth_id, oauth_provider, avatar_url) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, [name, email, profile.id, provider, avatar]);

        return result.rows[0].id;  // 返回插入的 id
    } catch (error) {
        console.error('Error inserting OAuth user:', error);
        throw error;
    }
}

// 更新用戶的 OAuth 資訊
async function updateUserOAuthInfo(userId, oauthId, provider, avatar = null) {
    const query = `
        UPDATE users
        SET oauth_id = $1, oauth_provider = $2, avatar_url = $3
        WHERE id = $4;
    `;
    await pool.query(query, [oauthId, provider, avatar, userId]);
}

module.exports = { 
    createUser, 
    findUserByEmail, 
    updateUserAvatar,
    updateUserUsername,
    findUserByOAuthId, 
    createOAuthUser, 
    updateUserOAuthInfo
};
