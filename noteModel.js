// const { poolPromise } = require('./db');
// const bcrypt = require('bcryptjs');

// // 新增筆記
// async function createNote(userId, title, content, dueDate) {
//     const pool = await poolPromise;

//     const result = await pool.request()
//         .input('userId', userId)
//         .input('title', title)
//         .input('content', content)
//         .input('dueDate', dueDate)
//         .query(`
//             INSERT INTO Notes (user_id, title, content, due_date) 
//             OUTPUT INSERTED.id, INSERTED.title, INSERTED.content, INSERTED.due_date
//             VALUES (@userId, @title, @content, @dueDate)
//         `);

//     return {
//         id: result.recordset[0].id,
//         title: result.recordset[0].title,
//         content: result.recordset[0].content,
//         dueDate: result.recordset[0].due_date,
//     };
// }

// async function deleteNote(noteId, userId) {
//     const pool = await poolPromise;
//     await pool.request()
//         .input('noteId', noteId)
//         .input('userId', userId)
//         .query(`
//             DELETE FROM Notes 
//             WHERE id = @noteId AND user_id = @userId
//         `);
// }

// async function getNotesByUserId(userId) {
//     const pool = await poolPromise;
//     const result = await pool.request()
//         .input('userId', userId)
//         .query('SELECT * FROM Notes WHERE user_id = @userId ORDER BY due_date ASC');
//     return result.recordset;
// }

// module.exports = { createNote, deleteNote, getNotesByUserId };

const { pool } = require('./db'); // 改為使用 PostgreSQL 的 pool
const bcrypt = require('bcryptjs');

// 新增筆記
async function createNote(userId, title, content, dueDate) {
    const result = await pool.query(
        `
        INSERT INTO notes (user_id, title, content, due_date) 
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, content, due_date
        `,
        [userId, title, content, dueDate]
    );

    const note = result.rows[0];
    return {
        id: note.id,
        title: note.title,
        content: note.content,
        dueDate: note.due_date,
    };
}

// 刪除筆記
async function deleteNote(noteId, userId) {
    await pool.query(
        `
        DELETE FROM notes 
        WHERE id = $1 AND user_id = $2
        `,
        [noteId, userId]
    );
}

// 取得指定使用者的所有筆記（按到期日排序）
async function getNotesByUserId(userId) {
    const result = await pool.query(
        `
        SELECT * FROM notes 
        WHERE user_id = $1 
        ORDER BY due_date ASC
        `,
        [userId]
    );

    return result.rows;
}

module.exports = {
    createNote,
    deleteNote,
    getNotesByUserId
};