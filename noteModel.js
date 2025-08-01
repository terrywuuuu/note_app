const { poolPromise } = require('./db');
const bcrypt = require('bcryptjs');

// 新增筆記
async function createNote(userId, title, content, dueDate) {
    const pool = await poolPromise;

    const result = await pool.request()
        .input('userId', userId)
        .input('title', title)
        .input('content', content)
        .input('dueDate', dueDate)
        .query(`
            INSERT INTO Notes (user_id, title, content, due_date) 
            OUTPUT INSERTED.id, INSERTED.title, INSERTED.content, INSERTED.due_date
            VALUES (@userId, @title, @content, @dueDate)
        `);

    return {
        id: result.recordset[0].id,
        title: result.recordset[0].title,
        content: result.recordset[0].content,
        dueDate: result.recordset[0].due_date,
    };
}

async function deleteNote(noteId, userId) {
    const pool = await poolPromise;
    await pool.request()
        .input('noteId', noteId)
        .input('userId', userId)
        .query(`
            DELETE FROM Notes 
            WHERE id = @noteId AND user_id = @userId
        `);
}

async function getNotesByUserId(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('userId', userId)
        .query('SELECT * FROM Notes WHERE user_id = @userId ORDER BY due_date ASC');
    return result.recordset;
}

module.exports = { createNote, deleteNote, getNotesByUserId };