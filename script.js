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

// 1. THEME SWITCHER FUNCTIONALITY
function changeTheme(themeName) {
    document.body.className = themeName;
    localStorage.setItem('user_theme', themeName);
    document.getElementById('theme-selector').value = themeName;
}

// Load Saved Theme on Startup
const savedTheme = localStorage.getItem('user_theme') || 'theme-slate';
changeTheme(savedTheme);

setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
}, 3000);

async function checkUserSession() {
    if (!db) return;
    try {
        const { data: { session } } = await db.auth.getSession();
        if (session) {
            currentUser = session.user;
            document.getElementById('btn-logout').style.display = 'block';
            showPage('page-dashboard');
            initMonthDropdowns();
            await setupDefaultCategoriesForNewUser();
            await loadCategories();
            loadDashboard();
        } else {
            document.getElementById('btn-logout').style.display = 'none';
            showPage('page-auth');
        }
    } catch(e) {
        console.error(e);
    }
}

// 2. NEW USER DEFAULT CATEGORIES ONBOARDING
async function setupDefaultCategoriesForNewUser() {
    if (!currentUser) return;
    
    const { data } = await db.from('category_budgets').select('*').eq('user_id', currentUser.id);
    
    if (!data || data.length === 0) {
        const defaultCategories = [
            { category_name: '🍔 Food & Snacks', monthly_limit: 3000, is_active: true, user_id: currentUser.id },
            { category_name: '🏠 Rent & Bills', monthly_limit: 5000, is_active: true, user_id: currentUser.id },
            { category_name: '🚗 Travel & Fuel', monthly_limit: 2000, is_active: true, user_id: currentUser.id },
            { category_name: '🛍️ Shopping', monthly_limit: 2500, is_active: true, user_id: currentUser.id },
            { category_name: '🎬 Entertainment', monthly_limit: 1500, is_active: true, user_id: currentUser.id }
        ];
        await db.from('category_budgets').insert(defaultCategories);
    }
}

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
    const submitBtn = document.getElementById('btn-auth-submit');
    const title = document.getElementById('auth-title');

    document.getElementById('link-signup').style.display = mode === 'login' ? 'block' : 'none';
    document.getElementById('link-forgot').style.display = mode === 'login' ? 'block' : 'none';
    document.getElementById('link-login').style.display = mode !== 'login' ? 'block' : 'none';

    if (mode === 'login') {
        title.innerText = 'Login to Your Account';
        submitBtn.innerText = 'Login';
        passwordInput.style.display = 'block';
        passwordInput.required = true;
        confirmPasswordInput.style.display = 'none';
        confirmPasswordInput.required = false;
    } else if (mode === 'signup') {
        title.innerText = 'Create New Account';
        submitBtn.innerText = 'Sign Up';
        passwordInput.style.display = 'block';
        passwordInput.required = true;
        confirmPasswordInput.style.display = 'block';
        confirmPasswordInput.required = true;
    } else if (mode === 'forgot') {
        title.innerText = 'Reset Password via Email';
        submitBtn.innerText = 'Send Reset Link';
        passwordInput.style.display = 'none';
        passwordInput.required = false;
        confirmPasswordInput.style.display = 'none';
        confirmPasswordInput.required = false;
    }
}

async function handleAuthSubmit(event) {
    if (event) event.preventDefault();
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const confirmPassword = document.getElementById('auth-confirm-password').value;

    if (!email) return alert('Please enter Email Address!');

    try {
        if (authMode === 'login') {
            const { data, error } = await db.auth.signInWithPassword({ email, password });
            if (error) return alert(error.message);
            checkUserSession();
        } else if (authMode === 'signup') {
            if (password !== confirmPassword) {
                return alert('Error: Password and Re-entered Password do not match!');
            }
            if (password.length < 6) {
                return alert('Password must be at least 6 characters long!');
            }

            const { data, error } = await db.auth.signUp({ email, password });
            if (error) return alert(error.message);
            alert('Account created! Verification link sent to your Email.');
            toggleAuthMode('login');
        } else if (authMode === 'forgot') {
            const { error } = await db.auth.resetPasswordForEmail(email);
            if (error) return alert(error.message);
            alert('Password Reset Link has been sent to your Email!');
            toggleAuthMode('login');
        }
    } catch(err) {
        alert("Error: " + err.message);
    }
}

async function handleLogout() {
    if (db) await db.auth.signOut();
    currentUser = null;
    checkUserSession();
}

function showPage(pageId) {
    document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0,0);
}

function initMonthDropdowns() {
    const dashSelect = document.getElementById('month-filter-dash');
    const histSelect = document.getElementById('month-filter-hist');
    dashSelect.innerHTML = '';
    histSelect.innerHTML = '';

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
    catFilter.innerHTML = `<option value="all">All Categories</option>`;
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
            catGrid.innerHTML += `<button type="button" class="btn-cat-chip" onclick="selectCategory('${c.category_name}', this)">${c.category_name}</button>`;
        });
    } else {
        const incomeSources = ['💰 Salary', '🎁 Bonus', '💻 Freelance', '🏷️ Cashback', '➕ Other Income'];
        incomeSources.forEach(src => {
            catGrid.innerHTML += `<button type="button" class="btn-cat-chip" onclick="selectCategory('${src}', this)">${src}</button>`;
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

    if (!amount || !category || !entryDate) return alert('Enter valid Date, Category and Amount!');

    await db.from('transactions').insert([{ 
        type: selectedType, 
        category: category, 
        amount: amount, 
        created_at: new Date(entryDate).toISOString(),
        user_id: currentUser.id
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
        category_name: name, 
        monthly_limit: limit, 
        is_active: true,
        user_id: currentUser.id
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
                <strong>${c.category_name}</strong>
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
        data: { labels, datasets: [{ data, backgroundColor: ['#ef4444', '#38bdf8', '#f59e0b', '#10b981', '#a78bfa'] }] },
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

checkUserSession();
