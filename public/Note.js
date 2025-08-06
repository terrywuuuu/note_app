const dropdownBtn = document.querySelector('.dropdown-btn');
const dropdownMenu = document.querySelector('.dropdown-menu');
let userId;

// 儲存所有筆記的數組
let notes = [];

let originalContent = `
    <div id="calendar"></div>
    <button onclick="addNote()" class="btn">新增筆記</button>
`;

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

dropdownBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    
    // 判斷菜單當前的 display 狀態，並切換
    if (dropdownMenu.style.display === "block") {
        dropdownBtn.innerHTML = `&#9654;`;
        dropdownMenu.style.display = "none"; // 隱藏菜單
    } else {
        dropdownBtn.innerHTML = `&#9662;`;
        dropdownMenu.style.display = "block"; // 顯示菜單
    }
});

document.addEventListener('click', (event) => {
    if (!dropdownBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
        if (dropdownMenu.style.display === "block") {
            dropdownMenu.style.display = "none"; // 隱藏菜單
        }
    }
});

// 關閉彈窗
document.getElementById('closeAvatarModal').addEventListener('click', () => {
    document.getElementById('blurBg').style.display = 'none';
    document.getElementById('avatarModal').style.display = 'none';
});

// 點擊 "登出" 會執行的操作
document.getElementById('logout').addEventListener('click', () => {
    // 清除所有登入相關的資料
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    dropdownMenu.classList.remove('show'); // 關閉下拉選單

    fetch('https://supernote-l6k9.onrender.com/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
    }).then(response => {
        if (response.ok) {
            alert('登出成功');
            window.location.href = 'Origin.html';
        } else {
            alert('登出失敗');
        }
    });
});

// 名稱修改相關事件
document.getElementById('cancelNameChange').addEventListener('click', () => {
    document.getElementById('blurBg').style.display = 'none';
    document.getElementById('nameModal').style.display = 'none';
    document.getElementById('newUsername').value = ''; // 清空輸入框
});

document.getElementById('confirmNameChange').addEventListener('click', async () => {
    const newUsername = document.getElementById('newUsername').value.trim();
    
    if (!newUsername) {
        alert('請輸入新的用戶名');
        return;
    }
    
    if (newUsername.length > 20) {
        alert('用戶名不能超過20個字符');
        return;
    }
    
    const userId = localStorage.getItem('userId');
    
    try {
        const response = await fetch('https://supernote-l6k9.onrender.com/api/auth/updateUsername', {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, username: newUsername }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('username', newUsername);
            document.getElementById('userlbl').textContent = newUsername;
            document.getElementById('blurBg').style.display = 'none';
            document.getElementById('nameModal').style.display = 'none';
            document.getElementById('newUsername').value = '';
            alert('用戶名更新成功！');
        } else {
            alert("更新用戶名失敗！");
        }
    } catch (error) {
        console.error('Error updating username:', error);
        alert("更新用戶名失敗！");
    }
});

// 只在頁面載入時綁定一次
function bindAvatarClick() {
    const avatarList = document.querySelectorAll('.avatar-option');
    avatarList.forEach(avatar => {
        avatar.addEventListener('click', async () => {
            const userId = localStorage.getItem('userId');
            let avatarPath = avatar.src.replace(window.location.origin + '/', '');

            document.getElementById('avatarImg').src = avatar.src;
            document.getElementById('blurBg').style.display = 'none';
            document.getElementById('avatarModal').style.display = 'none';

            const response = await fetch('https://supernote-l6k9.onrender.com/api/auth/updateAvatar', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, avatar: avatarPath }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('avatar', data.userAvatar);
                alert('頭像更新成功！');
            }
            else {
                alert("更新頭像失敗！");
            }
        });
    });

    document.getElementById('changeAvatar').addEventListener('click', () => {
        document.getElementById('blurBg').style.display = 'block';
        document.getElementById('avatarModal').style.display = 'block';
    });

    document.getElementById('changeName').addEventListener('click', () => {
        document.getElementById('blurBg').style.display = 'block';
        document.getElementById('nameModal').style.display = 'block';
    });
};

async function fetchNotes(userId) {
    const response = await fetch(`https://supernote-l6k9.onrender.com/api/auth/list?userId=${userId}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (response.ok) {
        const notesFromServer = await response.json();

        // 更新前端的 notes 数组
        notes = notesFromServer.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content,
            dueDate: note.due_date,  
        }));
    } else if (response.status === 401 || response.status === 403) {
        // Token 無效或過期
        alert('登入已過期，請重新登入');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.location.href = 'Start.html?mode=login';
    } else {
        alert('Failed to fetch notes');
    }
}

function renderFullCalendar(notes) {
    // 轉換 notes 為 FullCalendar 事件格式
    const events = notes.map(note => ({
        title: note.title,
        start: note.dueDate, // 確保是 ISO 格式
        extendedProps: {
            content: note.content,
            id: note.id
        }
    }));

    // 清空舊日曆（避免重複渲染）
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';

    // 初始化 FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'zh-tw', // 中文介面
        height: 650,
        events: events,
        eventClick: function(info) {
            // 點擊事件時顯示詳細內容
            alert(`標題: ${info.event.title}\n內容: ${info.event.extendedProps.content}`);
        },
        eventDidMount: function(arg) {
            // 這裡可以加右鍵事件
            arg.el.addEventListener('contextmenu', function(e) {
                e.preventDefault(); // 不顯示預設右鍵選單
                
                // 彈出確認視窗
                if (confirm(`確定要刪除這個筆記嗎？\n標題: ${arg.event.title}\n內容: ${arg.event.extendedProps.content}`)) {
                    deleteNote(arg.event.extendedProps.id);
                }
            });
        }
    });
    calendar.render();
}

function isGoogleAvatar(url) {
    return url && url.startsWith('https://lh3.googleusercontent.com/');
}

function isGitHubAvatar(url) {
    return url && (
        url.startsWith('https://avatars.githubusercontent.com/') ||
        url.startsWith('https://github.com/') ||
        url.includes('githubusercontent.com')
    );
}

window.onload = async function() {
    // 如果網址有 userId/username/avatar，則覆蓋 localStorage
    const urlUserId = getQueryParam('userId');
    const urlUsername = getQueryParam('username');
    const urlAvatar = getQueryParam('avatar');

    if (urlUserId && urlUsername) {
        localStorage.setItem('userId', urlUserId);
        localStorage.setItem('username', urlUsername);
        localStorage.setItem('avatar', urlAvatar);

        if(isGoogleAvatar(urlAvatar) || isGitHubAvatar(urlAvatar)){
            localStorage.setItem('google-avatar', urlAvatar);
        }

        const avatarList = document.getElementById('avatarList');
        const googleImg = document.createElement('img');
        const storedAvatar = localStorage.getItem('google-avatar');

        if(storedAvatar){
            googleImg.src = storedAvatar;
            googleImg.className = 'avatar-option';
            avatarList.appendChild(googleImg);
        }
    }
    
    // 檢查是否有有效的登入狀態
    const username = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');
    const storedAvatar = localStorage.getItem('avatar');
    
    // 如果沒有使用者資訊，重定向到登入頁面
    if (!username || !storedUserId) {
        alert('請先登入');
        window.location.href = 'Start.html?mode=login';
        return;
    }

    // 從 localStorage 讀取用戶名稱
    userId = localStorage.getItem('userId');
    const userlabel = document.getElementById('userlbl');
    const list = document.getElementById('note');
    await fetchNotes(userId);
    renderFullCalendar(notes);
    originalContent = document.getElementById('note').innerHTML;

    //list.innerHTML = originalContent;
    
    if (username) {
        userlabel.innerText = username;
    }

    if (storedAvatar) {
        const avatarImg = document.getElementById('avatarImg');
        avatarImg.src = storedAvatar;
    }
    bindAvatarClick();
};

function addNote(){
    const add = document.getElementById('note');

    add.innerHTML = `
        <h2 style = "text-align: center;">新增記事本</h2>
        <form class="newNote" style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
            <input type="text" name="title" placeholder="標題" id="title" required>
            <input type="text" name="content" placeholder="內容" id="content" required>
            <input type="datetime-local" name="dueDate" placeholder="截止日期" id="dueDate" required>
        
            <div class="button-container" style="display: flex; gap: 20px;">
                <button class="btn" type="button" onclick="cancel()">取消</button>
                <button class="btn" type="button" onclick="finish()">完成</button>
            </div>
        </form>
    `;
}

function cancel(){
    const add = document.getElementById('note');
    add.innerHTML = originalContent; // 恢復原本的內容
    renderFullCalendar(notes);
}

async function finish(){
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    let dueDate = document.getElementById('dueDate').value;
    
    // 假設這裡您需要新增筆記的處理邏輯
    if (title && content && dueDate) {
        const date = new Date(dueDate);
        dueDate = date.toISOString();

        // 保存新筆記
        const response = await fetch('https://supernote-l6k9.onrender.com/api/auth/add', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, title, content, dueDate }),
        });
    
        if (response.ok) {
            alert('Note added successfully');

            const addedNote = await response.json();

            // 將新筆記加入陣列
            const newNote = {
                id: addedNote.id,  // 從後端返回的 ID
                title: addedNote.title,
                content: addedNote.content,
                dueDate: addedNote.dueDate,
            };
            notes.push(newNote); // 將新筆記加入數組

            // 更新 originalContent 顯示已經新增的筆記
            // originalContent = `
            //     <select id="noteDropdown" size="8">
            //         ${notes.map(notes => `<option value="${notes.id}">${notes.title} - ${notes.content} (Due: ${notes.dueDate})</option>`).join('')}
            //     </select>
            //     <div class="button-container" style="display: flex; gap: 10px; justify-content: start;">
            //         <button class="btn" type="button" onclick="addNote()">新增筆記</button>
            //         <button class="btn" type="button" onclick="deleteNote()">刪除筆記</button>
            //     </div>
            // `;

            // 恢復到原本的顯示
            const add = document.getElementById('note');
            add.innerHTML = originalContent;
            renderFullCalendar(notes);
        } else if (response.status === 401 || response.status === 403) {
            // Token 無效或過期
            alert('登入已過期，請重新登入');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            window.location.href = 'Start.html?mode=login';
        } else {
            alert('Failed to add note');
        }
    } 
    else {
        alert('Please fill in all fields');
    }
}

async function deleteNote(noteId) {
    if (!noteId) {
        alert('請選擇要刪除的筆記');
        return;
    }

    const response = await fetch('https://supernote-l6k9.onrender.com/api/auth/delete', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noteId, userId }),
    });

    if (response.ok) {
        alert('筆記刪除成功');
        // 從 notes 陣列移除
        notes = notes.filter(note => note.id !== parseInt(noteId));
        renderFullCalendar(notes);
    } else if (response.status === 401 || response.status === 403) {
        alert('登入已過期，請重新登入');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.location.href = 'Start.html?mode=login';
    } else {
        alert('刪除筆記失敗');
    }
}