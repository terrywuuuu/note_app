function checkLoginStatus() {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    const authButtons = document.getElementById('auth-buttons');

    if (username && userId) {
        // 已登入狀態
        authButtons.innerHTML = `
            <a href="Origin.html">首頁</a>
            <a href="Note.html" style="margin-right: 100px;">編輯筆記</a>
            <img id="avatarImg" src="images/Pic1.png" alt="headshot" style="height: 40px; vertical-align: middle; width: 40px; border-radius: 50%; border: 2px solid #ccc;">
            <label for="user" id="userlbl" style="font-size: 20px; margin: 0 10px;">${username}</label>
            <div class="dropdown" style="display: inline-block;">
                <button class="dropdown-btn">&#9654;</button>
                <ul class="dropdown-menu" style="width: 150px; text-align: left;">
                    <li><a href="#" id="changeAvatar">更改頭像</a></li>
                    <li><a href="#" id="changeName">更改名稱</a></li>
                    <li><a href="#" id="logout">登出</a></li>
                </ul>
            </div>

            <!-- 模糊背景 -->
            <div id="blurBg"></div>

            <!-- 選擇頭像的彈窗 -->
            <div id="avatarModal">
                <h3>選擇頭像</h3>
                <div id="avatarList">
                    <img src="images/Pic1.png" class="avatar-option">
                    <img src="images/Pic2.png" class="avatar-option">
                    <img src="images/Pic3.png" class="avatar-option">
                    <img src="images/Pic4.png" class="avatar-option">
                    <img src="images/Pic5.png" class="avatar-option">
                    <img src="images/Pic6.png" class="avatar-option">
                </div>
                <br>
                <button id="closeAvatarModal" style="margin-top:20px;">取消</button>
            </div>

            <!-- 更改名稱的彈窗 -->
            <div id="nameModal">
                <h3>輸入新用戶名</h3>
                <div class="input-container">
                    <input type="text" id="newUsername" placeholder="請輸入新的用戶名" maxlength="20">
                </div>
                <div class="button-container">
                    <button id="confirmNameChange" class="confirm-btn">確認</button>
                    <button id="cancelNameChange" class="cancel-btn">取消</button>
                </div>
            </div>
        `;

        const storedAvatar = localStorage.getItem('avatar');
        if (storedAvatar) {
            const avatarImg = document.getElementById('avatarImg');
            avatarImg.src = storedAvatar;
        }

        // 加入下拉選單的事件監聽器
        setTimeout(() => {
            const dropdownBtn = document.querySelector('.dropdown-btn');
            const dropdownMenu = document.querySelector('.dropdown-menu');
            const logoutBtn = document.getElementById('logout');
            const changeAvatarBtn = document.getElementById('changeAvatar');
            const closeAvatarModalBtn = document.getElementById('closeAvatarModal');
            const changeNameBtn = document.getElementById('changeName');
            const closeNameModalBtn = document.getElementById('cancelNameChange');

            if (dropdownBtn && dropdownMenu) {
                dropdownBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    
                    if (dropdownMenu.style.display === "block") {
                        dropdownBtn.innerHTML = `&#9654;`;
                        dropdownMenu.style.display = "none";
                    } else {
                        dropdownBtn.innerHTML = `&#9662;`;
                        dropdownMenu.style.display = "block";
                    }
                });

                document.addEventListener('click', (event) => {
                    if (!dropdownBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
                        if (dropdownMenu.style.display === "block") {
                            dropdownMenu.style.display = "none";
                        }
                    }
                });
            }

            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
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
            }

            // 綁定更改頭像彈窗開啟
            if (changeAvatarBtn) {
                changeAvatarBtn.addEventListener('click', () => {
                    document.getElementById('blurBg').style.display = 'block';
                    document.getElementById('avatarModal').style.display = 'block';
                });
            }

            // 綁定更改頭像彈窗開啟
            if (changeNameBtn) {
                changeNameBtn.addEventListener('click', () => {
                    document.getElementById('blurBg').style.display = 'block';
                    document.getElementById('nameModal').style.display = 'block';
                });
            }

            // 綁定關閉彈窗
            if (closeAvatarModalBtn) {
                closeAvatarModalBtn.addEventListener('click', () => {
                    document.getElementById('blurBg').style.display = 'none';
                    document.getElementById('avatarModal').style.display = 'none';
                });
            }

            // 綁定關閉彈窗
            if (closeNameModalBtn) {
                closeNameModalBtn.addEventListener('click', () => {
                    document.getElementById('blurBg').style.display = 'none';
                    document.getElementById('nameModal').style.display = 'none';
                });
            }

            // 綁定頭像選擇
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
        }, 100);
    } else {
        // 未登入狀態 - 保持原本的內容
        authButtons.innerHTML = `
            <a href="Origin.html">首頁</a>
            <a href="Note.html">編輯筆記</a>
            <button class="login-btn" onclick="window.location.href='Start.html?mode=login'">登入</button>
            <button class="register-btn" onclick="window.location.href='Start.html?mode=register'">註冊</button>
        `;
    }
}

window.addEventListener('storage', function (e) {
    if (e.key === 'token' && !e.newValue) {
        window.location.reload();
    }
});

// 頁面載入時檢查登入狀態
window.onload = function() {
    checkLoginStatus();
};