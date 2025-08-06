// 切換登入與註冊表單
function toggleForms(formType) {
    const loginForm = document.getElementById('login-form');
    const formContainer = document.querySelector('.form-container');
    
    if (formType === 'register') {
        formContainer.innerHTML = `
            <h2>註冊</h2>
            <form id="registerForm">
                <input type="text" name="username" placeholder="用戶名" id = "username" required>
                <input type="email" name="email" placeholder="電子郵件" id = "remail" required>
                <input type="password" name="password" placeholder="密碼" id = "rpassword" required>
                <button type="submit">註冊</button>
            </form>
            <div class="toggle-links">
                <p>已經有帳號? <a href="#" onclick="toggleForms('login')">登入</a></p>
            </div>
        `;
    } else {
        formContainer.innerHTML = `
            <h2>登入</h2>
            <!-- 登入表單 -->
            <form id="loginForm">
                <input type="text" name="email" placeholder="電子郵件" id = "email" required>
                <input type="password" name="password" placeholder="密碼" id = "password" required>
                <button type="submit">登入</button>
            </form>
            <div style="margin-top: 20px;">
                        <a href="/api/auth/google">
              <button type="button" style="background:#4285F4;color:white;padding:8px 16px;border:none;border-radius:4px;">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" style="height: 20px; vertical-align: middle;">
                使用 Google 登入
              </button>
            </a>
            <a href="/api/auth/github">
              <button type="button" style="background:#333;color:white;padding:8px 16px;border:none;border-radius:4px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: middle; margin-right: 8px;">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                使用 GitHub 登入
              </button>
            </a>
            <!-- Facebook 登入功能暫時停用
            <a href="/api/auth/facebook">
              <button type="button" style="background:#3b5998;color:white;padding:8px 16px;border:none;border-radius:4px;">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg" alt="Facebook Logo" style="height: 20px; vertical-align: middle;">
                使用 Facebook 登入
              </button>
            </a>
            -->
            </div>
            <div class="toggle-links">
                <p>沒有帳號? <a href="#" onclick="toggleForms('register')">註冊</a></p>
            </div>
        `;
    }
}

window.onload = function(){
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    if(mode === 'register'){
        toggleForms('register');
    }
}

document.querySelector('.form-container').addEventListener('submit', async (e) => {
    e.preventDefault(); // 防止頁面重新加載

    // 只處理註冊或登入的表單
    if (e.target.id === 'loginForm') {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('https://supernote-l6k9.onrender.com/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            alert('登入成功!');
            localStorage.setItem('username', data.username);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('avatar', data.avatar);
            setTimeout(() => {
                window.location.href = 'Note.html';
            }, 1000);
        } else {
            alert("不存在的帳號或密碼！");
        }
    }

    if (e.target.id === 'registerForm') {
        const name = document.getElementById('username').value;
        const email = document.getElementById('remail').value;
        const password = document.getElementById('rpassword').value;
        const avatar = "images/Pic1.png";

        const response = await fetch('https://supernote-l6k9.onrender.com/api/auth/register', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name, avatar }),
        });

        if (response.ok) {
            const data = await response.json();
            alert('註冊成功!');
            localStorage.setItem('username', data.username);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('avatar', data.avatar);
            setTimeout(() => {
                window.location.href = 'Note.html';
            }, 1000);
        } else {
            alert("已存在的帳號！");
        }
    }
});