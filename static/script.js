let currentUser = null;
let selectedDrinkType = 'Water';

async function checkAuth() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        document.getElementById('authOverlay').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
        document.getElementById('bubbles').style.display = 'none';
    } else {
        document.getElementById('authOverlay').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('bubbles').style.display = 'block';
        initBubbles();
        await loadProfile(userId);
    }
}

function initBubbles() {
    const container = document.getElementById('bubbles');
    if (!container || container.children.length > 0) return;
    for (let i = 0; i < 15; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const size = Math.random() * 40 + 10;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.animationDuration = `${Math.random() * 5 + 5}s`;
        bubble.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(bubble);
    }
}

function toggleAuthMode(mode) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (mode === 'register') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    }
}

async function handleRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const weight = document.getElementById('regWeight').value;
    const password = document.getElementById('regPass').value;

    if (!name || !email || !weight || !password) return alert("Please fill all fields");

    const btn = document.getElementById('regBtn');
    btn.innerText = "CREATING...";
    btn.disabled = true;

    try {
        const response = await fetch('/user/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, weight_kg: parseFloat(weight), password })
        });
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Registration failed");
        }

        alert("Registered successfully! Please login.");
        toggleAuthMode('login');
    } catch (error) {
        alert(error.message);
    } finally {
        btn.innerText = "CREATE ACCOUNT";
        btn.disabled = false;
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;

    if (!email || !password) return alert("Please enter email and password");

    const btn = document.getElementById('loginBtn');
    btn.innerText = "AUTHENTICATING...";
    btn.disabled = true;

    try {
        const response = await fetch('/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error("Invalid credentials");
        }

        const data = await response.json();
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('token', data.access_token);
        
        await checkAuth();
    } catch (error) {
        alert(error.message);
    } finally {
        btn.innerText = "ENTER DASHBOARD";
        btn.disabled = false;
    }
}

function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    location.reload();
}

async function loadProfile(userId) {
    try {
        const response = await fetch(`/user/${userId}`);
        if (!response.ok) throw new Error("User not found");
        
        currentUser = await response.json();
        document.getElementById('userWelcome').innerText = `Hello, ${currentUser.name}`;
        document.getElementById('goalDisplay').innerText = `Goal: ${currentUser.daily_goal_ml}ml`;
        
        document.getElementById('settingGoal').value = currentUser.custom_daily_goal_ml || '';
        document.getElementById('settingReminders').checked = currentUser.reminder_enabled;

        updateDashboard();
    } catch (error) {
        logout();
    }
}

function selectDrink(type, element) {
    selectedDrinkType = type;
    document.querySelectorAll('.drink-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
}

async function updateDashboard() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`/water/today?user_id=${currentUser.id}`);
        const data = await response.json();
        
        const total = data.total_amount_ml || 0;
        const entries = data.entries || [];
        const goal = currentUser.daily_goal_ml;
        const percent = Math.min((total / goal) * 100, 200);

        document.getElementById('currentAmount').innerText = `${total}`;
        document.getElementById('progressPercent').innerText = `${Math.round(percent)}% COMPLETE`;

        const waterLevel = document.getElementById('waterLevel');
        waterLevel.style.height = `${Math.min(percent, 100)}%`;

        // Badges
        if (total > 0) document.getElementById('badge-drop').classList.add('unlocked');
        if (percent >= 50) document.getElementById('badge-half').classList.add('unlocked');
        if (percent >= 100) {
            if (!document.getElementById('badge-full').classList.contains('unlocked')) {
                confettiEffect();
            }
            document.getElementById('badge-full').classList.add('unlocked');
        }
        if (entries.some(e => e.amount_ml >= 1000)) document.getElementById('badge-turbo').classList.add('unlocked');

        // History
        const logHistory = document.getElementById('logHistory');
        logHistory.innerHTML = entries.slice(-5).reverse().map(e => `
            <div class="log-item-ultra">
                <div>
                   <span style="font-weight: 700;">+${e.amount_ml}ml ${getDrinkEmoji(e.drink_type)}</span>
                   <p style="color: var(--text-muted); font-size: 0.75rem">${new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <button onclick="deleteLog(${e.id})" class="btn-delete-ultra">✕</button>
            </div>
        `).join('');

        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        document.getElementById('dateDisplay').innerText = new Date().toLocaleDateString('en-US', options);

        updateWeeklyChart(total);
    } catch (error) {
        console.error("Dashboard update error:", error);
    }
}

function getDrinkEmoji(type) {
    const emojis = { 'Water': '💧', 'Coffee': '☕', 'Tea': '🍵', 'Juice': '🧃', 'Soda': '🥤' };
    return emojis[type] || '💧';
}

function updateWeeklyChart(todayTotal) {
    const chart = document.getElementById('weeklyChart');
    if (!chart) return;
    const mockData = [1200, 2100, 1800, 2500, 1500, 2200, todayTotal];
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const max = 3000;

    chart.innerHTML = mockData.map((val, i) => {
        const height = (val / max) * 100;
        return `
            <div class="chart-bar" title="${val}ml">
                <div class="chart-bar-fill" style="height: ${height}%"></div>
                <div class="chart-label">${days[i]}</div>
            </div>
        `;
    }).join('');
}

function confettiEffect() {
    const card = document.getElementById('liquidCard');
    if (card) {
        card.style.boxShadow = "0 0 100px var(--primary-color)";
        setTimeout(() => card.style.boxShadow = "", 3000);
    }
}

async function showLeaderboard() {
    toggleLeaderboard();
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '<p class="subtitle" style="text-align:center; padding: 20px;">Fetching rankings...</p>';

    try {
        const response = await fetch('/social/leaderboard');
        const data = await response.json();
        
        list.innerHTML = data.map((user, i) => `
            <div class="leaderboard-item">
                <div class="rank-circle ${i < 3 ? 'rank-' + (i+1) : ''}">${i + 1}</div>
                <div class="leader-name">${user.name}</div>
                <div class="leader-percent">${user.percentage}%</div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = '<p class="subtitle">Error loading leaderboard.</p>';
    }
}

function toggleLeaderboard() {
    const overlay = document.getElementById('leaderboardOverlay');
    overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
}

async function logWater(amount) {
    if (!currentUser) return;
    try {
        const response = await fetch('/water/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount_ml: amount, 
                user_id: currentUser.id,
                drink_type: selectedDrinkType
            })
        });
        if (response.ok) updateDashboard();
    } catch (error) {
        console.error("Log error:", error);
    }
}

function logCustom() {
    const val = parseInt(document.getElementById('customInput').value);
    if (val > 0) {
        logWater(val);
        document.getElementById('customInput').value = '';
    }
}

async function deleteLog(logId) {
    if (!currentUser) return;
    try {
        const response = await fetch(`/water/${logId}?user_id=${currentUser.id}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            updateDashboard();
            if (document.getElementById('historyOverlay').style.display === 'flex') {
                showFullHistory();
            }
        }
    } catch (error) {
        console.error("Delete error:", error);
    }
}

function toggleHistory() {
    const overlay = document.getElementById('historyOverlay');
    overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
}

async function showFullHistory() {
    if (!currentUser) return;
    toggleHistory();
    const container = document.getElementById('fullLogHistory');
    container.innerHTML = '<p class="subtitle" style="text-align:center; padding: 20px;">Fetching history...</p>';

    try {
        const response = await fetch(`/water/today?user_id=${currentUser.id}`);
        const data = await response.json();
        const entries = data.entries || [];

        if (entries.length === 0) {
            container.innerHTML = '<p class="subtitle" style="text-align:center; padding: 20px;">No logs found for today.</p>';
            return;
        }

        container.innerHTML = entries.slice().reverse().map(e => `
            <div class="log-item-ultra" style="margin-bottom: 12px; transform: scale(1.02);">
                <div>
                   <span style="font-weight: 800; font-size: 1.1rem; color: var(--primary-color);">+${e.amount_ml}ml ${getDrinkEmoji(e.drink_type)}</span>
                   <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 4px;">Logged at ${new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </div>
                <button onclick="deleteLog(${e.id})" class="btn-delete-ultra" style="opacity: 0.8; font-size: 1.4rem;">✕</button>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p class="subtitle">Error loading history.</p>';
    }
}

async function fetchInsights() {
    if (!currentUser) return;
    const btn = document.getElementById('insightBtn');
    const content = document.getElementById('aiContent');
    btn.style.opacity = "0.5";
    btn.disabled = true;
    content.innerText = "Analyzing your hydration trends...";

    try {
        const response = await fetch(`/ai/insights?user_id=${currentUser.id}`);
        const data = await response.json();
        content.innerText = data.insights || "No insights available yet.";
        btn.style.opacity = "1";
        btn.disabled = false;
    } catch (error) {
        content.innerText = "Error analyzing trends. Please check your API key.";
        btn.style.opacity = "1";
        btn.disabled = false;
    }
}

function toggleSettings() {
    const overlay = document.getElementById('settingsOverlay');
    overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
}

async function updateSettings() {
    if (!currentUser) return;
    const goal = document.getElementById('settingGoal').value;
    const reminders = document.getElementById('settingReminders').checked;
    
    try {
        const response = await fetch(`/user/${currentUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                custom_daily_goal_ml: goal ? parseInt(goal) : null,
                reminder_enabled: reminders
            })
        });
        if (response.ok) {
            await loadProfile(currentUser.id);
            toggleSettings();
        }
    } catch (error) {
        alert("Error saving settings");
    }
}

function resetApp() {
    if (confirm("Reset all data and start over?")) {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        location.reload();
    }
}

// Initial load
checkAuth();
