// SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://rjinxqbqiypcimtthcbv.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_cOp1rCjsTMyShJRMitbsng_jkxpmJ2m'; 

let db = null;
try {
    db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch(e) {
    console.error("Supabase config error:", e);
}

let authMode = 'login';
let currentUser = null;
let categories = [];
let currentTransactions = [];
let selectedMonth = '';
let selectedType = null;
let selectedCategory = null;
let chartInstance = null;
let currentLang = 'en';

// TRANSLATION DICTIONARY
const translations = {
    en: {
        auth_login_title: "Login to Your Account",
        auth_signup_title: "Create New Account",
        auth_forgot_title: "Reset Password via Email",
        btn_login: "Login",
        btn_signup: "Sign Up",
        btn_reset: "Send Reset Link",
        btn_google: "Continue with Google",
        link_signup: "Don't have an account? Sign Up",
        link_forgot: "Forgot Password?",
        link_login: "Back to Login",
        add_entry_title: "Add Entry",
        step1_label: "1. Select Transaction Type",
        btn_debit: "🔴 Debit (Expense)",
        btn_credit: "🟢 Credit (Income)",
        step2_label: "2. Select Category / Description",
        step3_label: "3. Enter Date & Amount (₹)",
        btn_save_tx: "💾 Save Transaction",
        select_month_label: "Select Month History:",
        income_label: "Income",
        expense_label: "Expense",
        balance_label: "Balance",
        nav_history: "📜 View Detailed History Page",
        nav_categories: "🏷️ Manage Category Allowances Page",
        nav_dashboard: "🏠 Go to Dashboard",
        tx_history_title: "Transaction History",
        filter_type_label: "Type Filter",
        filter_cat_label: "Category Filter",
        opt_all_tx: "All Transactions",
        opt_credit_only: "Credit Only",
        opt_debit_only: "Debit Only",
        allowance_overview_title: "Total Monthly Allowance Overview",
        limit_label: "Limit",
        spent_label: "Spent",
        left_label: "Left",
        cat_balances_title: "Category Allowances & Balances",
        add_new_cat_title: "Add New Allowance Category",
        cat_name_label: "Category Name",
        monthly_limit_label: "Monthly Limit (₹)",
        btn_add_cat: "+ Add Category",
        lang_settings_title: "🌐 Language / மொழி",
        select_lang_label: "Select Application Language:",
        theme_settings_title: "🎨 App Theme (12 Variations)",
        security_title: "🔒 Security Options",
        btn_go_to_change_pass: "🔑 Change Password",
        btn_back_to_settings: "⬅️ Back to Settings",
        change_pass_title: "🔒 Change Password",
        old_pass_label: "Old Password",
        new_pass_label: "New Password",
        confirm_new_pass_label: "Confirm New Password",
        btn_update_pass: "Update Password",
        btn_how_to_use: "How to Use App Guide",
        help_title: "📖 How to Use the App",
        btn_close: "Close"
    },
    ta: {
        auth_login_title: "உங்கள் கணக்கில் நுழையவும்",
        auth_signup_title: "புதிய கணக்கை உருவாக்கவும்",
        auth_forgot_title: "கடவுச்சொல்லை மீட்டமைக்கவும்",
        btn_login: "உள்நுழைக (Login)",
        btn_signup: "பதிவு செய்க (Sign Up)",
        btn_reset: "மீட்டமைப்பு இணைப்பு அனுப்பு",
        btn_google: "Google மூலம் தொடரவும்",
        link_signup: "கணக்கு இல்லையா? பதிவு செய்க",
        link_forgot: "கடவுச்சொல் மறந்துவிட்டதா?",
        link_login: "மீண்டும் லாகின் செல்லவும்",
        add_entry_title: "வரவு/செலவு சேர்க்க",
        step1_label: "1. பரிவர்த்தனை வகையைத் தேர்ந்தெடுக்கவும்",
        btn_debit: "🔴 பற்று (செலவு)",
        btn_credit: "🟢 வரவு (வருமானம்)",
        step2_label: "2. வகை / விளக்கத்தைத் தேர்ந்தெடுக்கவும்",
        step3_label: "3. தேதி மற்றும் தொகையை உள்ளிடவும் (₹)",
        btn_save_tx: "💾 சேமிக்கவும்",
        select_month_label: "மாத வரலாற்றைத் தேர்ந்தெடுக்கவும்:",
        income_label: "வருமானம்",
        expense_label: "செலவு",
        balance_label: "மீதி",
        nav_history: "📜 விரிவான வரலாற்றுப் பக்கம்",
        nav_categories: "🏷️ வகை வரம்புகள் பக்கம்",
        nav_dashboard: "🏠 முகப்புப் பக்கத்திற்குச் செல்",
        tx_history_title: "பரிவர்த்தனை வரலாறு",
        filter_type_label: "வகை வடிகட்டி",
        filter_cat_label: "பிரிவு வடிகட்டி",
        opt_all_tx: "எல்லா பரிவர்த்தனைகளும்",
        opt_credit_only: "வரவு மட்டும்",
        opt_debit_only: "செலவு மட்டும்",
        allowance_overview_title: "மாதாந்திர மொத்த வரம்பு மேலோட்டம்",
        limit_label: "வரம்பு",
        spent_label: "செலவழித்தது",
        left_label: "மீதமுள்ளது",
        cat_balances_title: "வகை வரம்புகள் மற்றும் இருப்புகள்",
        add_new_cat_title: "புதிய செலவு வரம்பை சேர்க்க",
        cat_name_label: "வகை பெயர்",
        monthly_limit_label: "மாதாந்திர வரம்பு (₹)",
        btn_add_cat: "+ வகையைச் சேர்க்கவும்",
        lang_settings_title: "🌐 Language / மொழி",
        select_lang_label: "பயன்பாட்டு மொழியைத் தேர்ந்தெடுக்கவும்:",
        theme_settings_title: "🎨 பயன்பாட்டு தீம் (12 விருப்பங்கள்)",
        security_title: "🔒 பாதுகாப்பு அமைப்புகள்",
        btn_go_to_change_pass: "🔑 கடவுச்சொல்லை மாற்றவும்",
        btn_back_to_settings: "⬅️ செட்டிங்ஸுக்குத் திரும்புக",
        change_pass_title: "🔒 கடவுச்சொல்லை மாற்றவும்",
        old_pass_label: "பழைய கடவுச்சொல்",
        new_pass_label: "புதிய கடவுச்சொல்",
        confirm_new_pass_label: "புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்",
        btn_update_pass: "கடவுச்சொல்லை புதுப்பிக்கவும்",
        btn_how_to_use: "எப்படி பயன்படுத்துவது?",
        help_title: "📖 பயன்பாட்டு வழிகாட்டி",
        btn_close: "மூடுக"
    }
};

// 1. SPLASH SCREEN & CASH ANIMATION
function createCashAnimation() {
    const container = document.getElementById('cash-container');
    const items = ['💵', '🪙', '💰', '💸', '₹'];
    for (let i = 0; i < 30; i++) {
        const cash = document.createElement('div');
        cash.className = 'cash-item';
        cash.innerText = items[Math.floor(Math.random() * items.length)];
        cash.style.left = Math.random() * 100 + '%';
        cash.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        cash.style.animationDelay = (Math.random() * 1.5) + 's';
        container.appendChild(cash);
    }
}
createCashAnimation();

setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
}, 3000);

// 2. LANGUAGE SWITCHER
function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('user_lang', lang);
    const langSel = document.getElementById('language-selector');
    if (langSel) langSel.value = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}

// 3. THEME SWITCHER
function changeTheme(themeName) {
    document.body.className = themeName;
    localStorage.setItem('user_theme', themeName);
}

const savedTheme = localStorage.getItem('user_theme') || 'theme-slate';
changeTheme(savedTheme);

const savedLang = localStorage.getItem('user_lang') || 'en';
changeLanguage(savedLang);

// 4. REAL-TIME AUTH STATE OBSERVER
if (db) {
    db.auth.onAuthStateChange(async (event, session) => {
        if (session) {
            currentUser = session.user;
            document.getElementById('btn-logout').style.display = 'inline-block';
            document.getElementById('btn-settings').style.display = 'inline-block';
            showPage('page-dashboard');
            initMonthDropdowns();
            await setupDefaultCategoriesForNewUser();
            await loadCategories();
            loadDashboard();
        } else {
            currentUser = null;
            document.getElementById('btn-logout').style.display = 'none';
            document.getElementById('btn-settings').style.display = 'none';
            showPage('page-auth');
        }
    });
}

async function setupDefaultCategoriesForNewUser() {
    if (!currentUser) return;
    const { data } = await db.from('category_budgets').select('*').eq('user_id', currentUser.id);
    
    if (!data || data.length === 0) {
        const defaultCategories = [
            { category_name: '🍔 Food & Snacks', monthly_limit: 3000, is_active: true, user_id: currentUser.id },
            { category_name: '🏠 Rent & Bills', monthly_limit: 5000, is_active: true, user_id: currentUser.id },
            { category_name: '🚗 Travel & Fuel', monthly_limit: 2000, is_active: true, user_id: currentUser.id },
            { category_name: '🛍️ Shopping', monthly_limit: 2500, is_active: true, user_id: currentUser.id }
        ];
        await db.from('category_budgets').insert(defaultCategories);
    }
}

// 5. EDIT & DELETE CATEGORIES FOR ALL (BOTH DEFAULT & NEWLY ADDED)
async function editCategory(id, currentName, currentLimit) {
    const newName = prompt("Edit Category Name:", currentName);
    if (!newName) return;
    
    const newLimit = prompt("Edit Monthly Limit (₹):", currentLimit);
    if (!newLimit || isNaN(newLimit)) return;

    await db.from('category_budgets').update({
        category_name: newName,
        monthly_limit: parseFloat(newLimit)
    }).eq('id', id);

    await loadCategories();
    loadDashboard();
}

async function deleteCategory(id) {
    if (confirm("Are you sure you want to delete this Category?")) {
        await db.from('category_budgets').delete().eq('id', id);
        await loadCategories();
        loadDashboard();
    }
}

// 6. HOW TO USE MODAL LOGIC
function openHelpModal() {
    const helpBody = document.getElementById('help-body');
    if (currentLang === 'ta') {
        helpBody.innerHTML = `
            <ol style="padding-left: 20px; line-height: 1.8; color:#cbd5e1;">
                <li><b>பரிவர்த்தனை சேர்க்க:</b> Debit (செலவு) அல்லது Credit (வரவு) பட்டனை தேர்ந்தெடுக்கவும்.</li>
                <li><b>வகை தேர்வு:</b> பட்டியலிலிருந்து பொருத்தமான வகையை தேர்ந்தெடுக்கவும்.</li>
                <li><b>சேமிக்க:</b> தொகையை உள்ளிட்டு 'Save Transaction' பட்டனை அழுத்தவும்.</li>
                <li><b>வரம்புகள் திருத்த:</b> 'Manage Category Allowances' பக்கம் சென்று எடிட் (✏️) அல்லது டெலிட் (🗑️) செய்யலாம்.</li>
            </ol>
        `;
    } else {
        helpBody.innerHTML = `
            <ol style="padding-left: 20px; line-height: 1.8; color:#cbd5e1;">
                <li><b>Add Entry:</b> Select Debit (Expense) or Credit (Income).</li>
                <li><b>Category:</b> Choose a category from the grid.</li>
                <li><b>Save:</b> Enter the amount & date, then click 'Save Transaction'.</li>
                <li><b>Manage Budgets:</b> Go to 'Manage Category Allowances' to Edit (✏️) or Delete (🗑️) limit entries.</li>
            </ol>
        `;
    }
    document.getElementById('help-modal').style.display = 'flex';
}

function closeHelpModal() {
    document.getElementById('help-modal').style.display = 'none';
}

// AUTHENTICATION AND NAVIGATION
async function handleGoogleLogin() {
    if (!db) return alert("Database connection missing!");
    const { error } = await db.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href }
    });
    if (error) alert(error.message);
}

function toggleAuthMode(mode) {
    authMode = mode;
    const passwordInput = document.getElementById('auth-password');
    const confirmPasswordInput = document.getElementById('auth-confirm-password');

    document.getElementById('link-signup').style.display = mode === 'login' ? 'block' : 'none';
    document.getElementById('link-forgot').style.display = mode === 'login' ? 'block' : 'none';
    document.getElementById('link-login').style.display = mode !== 'login' ? 'block' : 'none';

    if (mode === 'login') {
        passwordInput.style.display = 'block'; passwordInput.required = true;
        confirmPasswordInput.style.display = 'none'; confirmPasswordInput.required = false;
    } else if (mode === 'signup') {
        passwordInput.style.display = 'block'; passwordInput.required = true;
        confirmPasswordInput.style.display = 'block'; confirmPasswordInput.required = true;
    } else if (mode === 'forgot') {
        passwordInput.style.display = 'none'; passwordInput.required = false;
        confirmPasswordInput.style.display = 'none'; confirmPasswordInput.required = false;
    }
    changeLanguage(currentLang);
}

async function handleAuthSubmit(event) {
    if (event) event.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const confirmPassword = document.getElementById('auth-confirm-password').value;

    if (!email) return alert('Please enter Email Address!');

    try {
        if (authMode === 'login') {
            const { error } = await db.auth.signInWithPassword({ email, password });
            if (error) return alert(error.message);
        } else if (authMode === 'signup') {
            if (password !== confirmPassword) return alert('Password mismatch!');
            if (password.length < 6) return alert('Password must be at least 6 characters!');
            const { error } = await db.auth.signUp({ email, password });
            if (error) return alert(error.message);
            alert('Account created! Verification link sent to Email.');
            toggleAuthMode('login');
        } else if (authMode === 'forgot') {
            const { error } = await db.auth.resetPasswordForEmail(email);
            if (error) return alert(error.message);
            alert('Password Reset Link sent to your Email!');
            toggleAuthMode('login');
        }
    } catch(err) {
        alert("Error: " + err.message);
    }
}

async function handlePasswordChange(event) {
    event.preventDefault();
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;

    if (newPassword !== confirmNewPassword) return alert("Passwords do not match!");
    if (newPassword.length < 6) return alert("Password must be at least 6 characters!");

    try {
        const { error: signInError } = await db.auth.signInWithPassword({
            email: currentUser.email, password: oldPassword
        });
        if (signInError) return alert("Incorrect Old Password!");

        const { error: updateError } = await db.auth.updateUser({ password: newPassword });
        if (updateError) return alert(updateError.message);

        alert("Password updated successfully!");
        document.getElementById('old-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-new-password').value = '';
        showPage('page-settings');
    } catch (err) {
        alert("Error: " + err.message);
    }
}

async function handleLogout() {
    if (db) await db.auth.signOut();
}

function showPage(pageId) {
    document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0,0);
}

function initMonthDropdowns() {
    const dashSelect = document.getElementById('month-filter-dash');
    const histSelect = document.getElementById('month-filter-hist');
    if (!dashSelect || !histSelect) return;
    
    dashSelect.innerHTML = ''; histSelect.innerHTML = '';
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthVal = date.toISOString().slice(0, 7);
        const monthText = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const opt1 = document.createElement('option');
        opt1.value = monthVal; opt1.innerText = monthText;
        dashSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = monthVal; opt2.innerText = monthText;
        histSelect.appendChild(opt2);
    }
    selectedMonth = dashSelect.value;
    document.getElementById('entry-date').valueAsDate = new Date();
}

function syncMonthAndLoad(source) {
    if (source === 'dash') {
        selectedMonth = document.getElementById('month-filter-dash').value;
        document.getElementById('month-filter-hist').value = selectedMonth;
    } else {
        selectedMonth = document.getElementById('month-filter-hist').value;
        document.getElementById('month-filter-dash').value = selectedMonth;
    }
    loadDashboard();
}

async function loadCategories() {
    const { data } = await db.from('category_budgets').select('*').eq('is_active', true);
    categories = data || [];
    
    const catFilter = document.getElementById('filter-category');
    if (!catFilter) return;
    
    catFilter.innerHTML = `<option value="all" data-i18n="opt_all_cat">All Categories</option>`;
    categories.forEach(c => {
        catFilter.innerHTML += `<option value="${c.category_name}">${c.category_name}</option>`;
    });
}

function selectType(type) {
    selectedType = type;
    selectedCategory = null;

    document.getElementById('btn-debit').classList.toggle('selected', type === 'expense');
    document.getElementById('btn-credit').classList.toggle('selected', type === 'income');

    const catGrid = document.getElementById('category-buttons-grid');
    catGrid.innerHTML = '';
    document.getElementById('custom-cat-container').style.display = 'none';

    if (type === 'expense') {
        categories.forEach(c => {
            catGrid.innerHTML += `<button type="button" class="btn-cat-chip glow-btn" onclick="selectCategory('${c.category_name}', this)">${c.category_name}</button>`;
        });
    } else {
        const incomeSources = ['💰 Salary', '🎁 Bonus', '💻 Freelance', '🏷️ Cashback', '➕ Other Income'];
        incomeSources.forEach(src => {
            catGrid.innerHTML += `<button type="button" class="btn-cat-chip glow-btn" onclick="selectCategory('${src}', this)">${src}</button>`;
        });
    }

    document.getElementById('step-category').classList.add('active');
    document.getElementById('step-amount').classList.remove('active');
}

function selectCategory(catName, btnElement) {
    selectedCategory = catName;
    document.querySelectorAll('.btn-cat-chip').forEach(b => b.classList.remove('selected'));
    if (btnElement) btnElement.classList.add('selected');

    if (catName === '➕ Other Income') {
        document.getElementById('custom-cat-container').style.display = 'block';
    } else {
        document.getElementById('custom-cat-container').style.display = 'none';
    }
    document.getElementById('step-amount').classList.add('active');
}

async function addTransaction() {
    let category = selectedCategory;
    if (category === '➕ Other Income') {
        category = document.getElementById('custom-cat-input').value || 'Other Income';
    }

    const amount = parseFloat(document.getElementById('amount').value);
    const entryDate = document.getElementById('entry-date').value;

    if (!amount || !category || !entryDate) return alert('Enter valid Details!');

    await db.from('transactions').insert([{ 
        type: selectedType, category: category, amount: amount, 
        created_at: new Date(entryDate).toISOString(), user_id: currentUser.id
    }]);
    
    document.getElementById('amount').value = '';
    document.getElementById('step-category').classList.remove('active');
    document.getElementById('step-amount').classList.remove('active');
    loadDashboard();
    alert('Transaction saved successfully!');
}

async function addCategory() {
    const name = document.getElementById('new-cat-name').value;
    const limit = parseFloat(document.getElementById('new-cat-limit').value);
    if(!name || !limit) return alert("Enter Category Name & Limit!");

    await db.from('category_budgets').insert([{ 
        category_name: name, monthly_limit: limit, is_active: true, user_id: currentUser.id
    }]);

    document.getElementById('new-cat-name').value = '';
    document.getElementById('new-cat-limit').value = '';
    await loadCategories();
    loadDashboard();
}

async function deleteTransaction(id) {
    if(confirm("Delete this entry?")) {
        await db.from('transactions').delete().eq('id', id);
        loadDashboard();
    }
}

async function loadDashboard() {
    if (!selectedMonth) return;
    const startDate = `${selectedMonth}-01T00:00:00.000Z`;
    const endDate = new Date(selectedMonth.split('-')[0], selectedMonth.split('-')[1], 0, 23, 59, 59).toISOString();

    const { data: transactions } = await db.from('transactions').select('*').gte('created_at', startDate).lte('created_at', endDate).order('created_at', { ascending: false });
    currentTransactions = transactions || [];

    let totIncome = currentTransactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
    let totExpense = currentTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
    
    document.getElementById('sum-income').innerText = `₹${totIncome}`;
    document.getElementById('sum-expense').innerText = `₹${totExpense}`;
    document.getElementById('sum-balance').innerText = `₹${totIncome - totExpense}`;

    let overallLimit = categories.reduce((sum, c) => sum + parseFloat(c.monthly_limit), 0);
    let overallSpent = 0;

    const budgetContainer = document.getElementById('budget-list');
    budgetContainer.innerHTML = '';

    let chartLabels = [];
    let chartData = [];

    categories.forEach(c => {
        const catExpenses = currentTransactions
            .filter(t => t.category === c.category_name && t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        overallSpent += catExpenses;
        if(catExpenses > 0) {
            chartLabels.push(c.category_name);
            chartData.push(catExpenses);
        }

        const remBalance = c.monthly_limit - catExpenses;
        let pct = Math.min(100, Math.round((catExpenses / c.monthly_limit) * 100)) || 0;
        let barColor = pct > 90 ? '#ef4444' : (pct > 70 ? '#f59e0b' : '#10b981');

        budgetContainer.innerHTML += `
            <div class="budget-card">
                <div class="budget-header">
                    <strong>${c.category_name}</strong>
                    <div class="budget-actions">
                        <button type="button" class="glow-btn" onclick="editCategory(${c.id}, '${c.category_name}', ${c.monthly_limit})">✏️</button>
                        <button type="button" class="glow-btn" onclick="deleteCategory(${c.id})">🗑️</button>
                    </div>
                </div>
                <span>Limit: ₹${c.monthly_limit}</span>
                <div class="budget-status ${remBalance >= 0 ? 'positive' : 'negative'}">₹${remBalance}</div>
                <div class="progress-bg"><div class="progress-fill" style="width: ${pct}%; background: ${barColor};"></div></div>
                <span>Spent: ₹${catExpenses} (${pct}%)</span>
            </div>
        `;
    });

    document.getElementById('tot-budget-limit').innerText = `₹${overallLimit}`;
    document.getElementById('tot-budget-spent').innerText = `₹${overallSpent}`;
    document.getElementById('tot-budget-left').innerText = `₹${overallLimit - overallSpent}`;

    renderChart(chartLabels, chartData);
    renderHistory();
}

function renderChart(labels, data) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    if (data.length === 0) return;

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: ['#ef4444', '#38bdf8', '#f59e0b', '#10b981', '#a78bfa', '#00e676'] }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 10 } } } } }
    });
}

function renderHistory() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const typeFilter = document.getElementById('filter-type').value;
    const catFilter = document.getElementById('filter-category').value;
    const listContainer = document.getElementById('transaction-list');
    
    let filtered = currentTransactions.filter(t => {
        const matchesSearch = t.category.toLowerCase().includes(searchQuery) || t.amount.toString().includes(searchQuery);
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        const matchesCategory = catFilter === 'all' || t.category === catFilter;
        return matchesSearch && matchesType && matchesCategory;
    });

    listContainer.innerHTML = '';
    if (filtered.length === 0) {
        listContainer.innerHTML = `<p style="color:#64748b; text-align:center; padding:10px;">No matching entries found.</p>`;
        return;
    }

    filtered.forEach(t => {
        const isCredit = t.type === 'income';
        listContainer.innerHTML += `
            <div class="list-item">
                <div>
                    <strong>${t.category}</strong><br>
                    <span>${new Date(t.created_at).toLocaleDateString()}</span>
                </div>
                <div>
                    <strong class="${isCredit ? 'amount-credit' : 'amount-debit'}">${isCredit ? '+' : '-'}₹${t.amount}</strong>
                    <button type="button" class="del-btn" onclick="deleteTransaction(${t.id})">🗑️</button>
                </div>
            </div>
        `;
    });
}
