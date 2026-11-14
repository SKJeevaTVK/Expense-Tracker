// TRANSLATION DICTIONARY
const translations = {
    en: {
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
        opt_all_tx: "All Transactions",
        opt_credit_only: "Credit Only",
        opt_debit_only: "Debit Only",
        allowance_overview_title: "Total Monthly Allowance Overview",
        limit_label: "Limit",
        spent_label: "Spent",
        left_label: "Left",
        cat_balances_title: "Category Allowances & Balances",
        add_new_cat_title: "Add New Allowance Category",
        btn_add_cat: "+ Add Category",
        lang_settings_title: "🌐 Language / மொழி",
        theme_settings_title: "🎨 App Theme (12 Variations)",
        btn_how_to_use: "How to Use App Guide",
        help_title: "📖 How to Use the App",
        btn_close: "Close"
    },
    ta: {
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
        opt_all_tx: "எல்லா பரிவர்த்தனைகளும்",
        opt_credit_only: "வரவு மட்டும்",
        opt_debit_only: "செலவு மட்டும்",
        allowance_overview_title: "மாதாந்திர மொத்த வரம்பு மேலோட்டம்",
        limit_label: "வரம்பு",
        spent_label: "செலவழித்தது",
        left_label: "மீதமுள்ளது",
        cat_balances_title: "வகை வரம்புகள் மற்றும் இருப்புகள்",
        add_new_cat_title: "புதிய செலவு வரம்பை சேர்க்க",
        btn_add_cat: "+ வகையைச் சேர்க்கவும்",
        lang_settings_title: "🌐 Language / மொழி",
        theme_settings_title: "🎨 பயன்பாட்டு தீம் (12 விருப்பங்கள்)",
        btn_how_to_use: "எப்படி பயன்படுத்துவது?",
        help_title: "📖 பயன்பாட்டு வழிகாட்டி",
        btn_close: "மூடுக"
    }
};

// LOCAL STORAGE DATABASE KEYS
const STORAGE_KEY_TX = 'local_expenses_transactions';
const STORAGE_KEY_CAT = 'local_expenses_categories';

let currentTransactions = [];
let categories = [];
let selectedMonth = '';
let selectedType = null;
let selectedCategory = null;
let chartInstance = null;
let currentLang = 'en';

// 1. SPLASH SCREEN ANIMATION
function createCashAnimation() {
    const container = document.getElementById('cash-container');
    if(!container) return;
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
}, 2500);

// 2. DEFAULT CATEGORIES SETUP
function initDefaultCategories() {
    let savedCats = localStorage.getItem(STORAGE_KEY_CAT);
    if (!savedCats) {
        categories = [
            { id: 1, category_name: '🍔 Food & Snacks', monthly_limit: 3000 },
            { id: 2, category_name: '🏠 Rent & Bills', monthly_limit: 5000 },
            { id: 3, category_name: '🚗 Travel & Fuel', monthly_limit: 2000 },
            { id: 4, category_name: '🛍️ Shopping', monthly_limit: 2500 }
        ];
        localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(categories));
    } else {
        categories = JSON.parse(savedCats);
    }
}

// 3. APP INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    initDefaultCategories();
    initMonthDropdowns();
    loadCategoriesDropdown();
    loadDashboard();
    
    const savedTheme = localStorage.getItem('user_theme') || 'theme-slate';
    changeTheme(savedTheme);

    const savedLang = localStorage.getItem('user_lang') || 'en';
    changeLanguage(savedLang);
});

// LANGUAGE & THEME
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

function changeTheme(themeName) {
    document.body.className = themeName;
    localStorage.setItem('user_theme', themeName);
}

function showPage(pageId) {
    document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0,0);
    if(pageId === 'page-categories') {
        loadCategoriesPage();
    }
}

// MONTH DROPDOWNS
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
    const dateInput = document.getElementById('entry-date');
    if(dateInput) dateInput.valueAsDate = new Date();
}

function syncMonthAndLoad(source) {
    if (source === 'dash') {
        selectedMonth = document.getElementById('month-filter-dash').value;
        const hist = document.getElementById('month-filter-hist');
        if(hist) hist.value = selectedMonth;
    } else {
        selectedMonth = document.getElementById('month-filter-hist').value;
        const dash = document.getElementById('month-filter-dash');
        if(dash) dash.value = selectedMonth;
    }
    loadDashboard();
}

// CATEGORIES DROPDOWN
function loadCategoriesDropdown() {
    const catFilter = document.getElementById('filter-category');
    if (!catFilter) return;
    
    catFilter.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(c => {
        catFilter.innerHTML += `<option value="${c.category_name}">${c.category_name}</option>`;
    });
}

// TRANSACTION FLOW
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

    document.getElementById('step-category').style.display = 'block';
    document.getElementById('step-amount').style.display = 'none';
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
    document.getElementById('step-amount').style.display = 'block';
}





function addTransaction() {
    let category = selectedCategory;
    if (category === '➕ Other Income') {
        category = document.getElementById('custom-cat-input').value || 'Other Income';
    }

    const amount = parseFloat(document.getElementById('amount').value);
    const entryDate = document.getElementById('entry-date').value;

    if (!amount || !category || !entryDate) return alert('Enter valid Details!');

    let txs = JSON.parse(localStorage.getItem(STORAGE_KEY_TX)) || [];
    txs.unshift({ 
        id: Date.now(),
        type: selectedType, 
        category: category, 
        amount: amount, 
        created_at: new Date(entryDate).toISOString()
    });
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(txs));
    
    document.getElementById('amount').value = '';
    document.getElementById('step-category').style.display = 'none';
    document.getElementById('step-amount').style.display = 'none';
    document.querySelectorAll('.type-selector button').forEach(b => b.classList.remove('selected'));
    
    loadDashboard();
    alert('Transaction saved successfully!');
}

function deleteTransaction(id) {
    if(confirm("Delete this entry?")) {
        let txs = JSON.parse(localStorage.getItem(STORAGE_KEY_TX)) || [];
        txs = txs.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(txs));
        loadDashboard();
    }
}

// ADD & MANAGE CATEGORY
function addCategory() {
    const name = document.getElementById('new-cat-name').value;
    const limit = parseFloat(document.getElementById('new-cat-limit').value);
    if(!name || !limit) return alert("Enter Category Name & Limit!");

    categories.push({ id: Date.now(), category_name: name, monthly_limit: limit });
    localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(categories));

    document.getElementById('new-cat-name').value = '';
    document.getElementById('new-cat-limit').value = '';
    loadCategoriesDropdown();
    loadCategoriesPage();
    alert("Category added successfully!");
}

function editCategory(id, currentName, currentLimit) {
    const newName = prompt("Edit Category Name:", currentName);
    if (!newName) return;
    
    const newLimit = prompt("Edit Monthly Limit (₹):", currentLimit);
    if (!newLimit || isNaN(newLimit)) return;

    categories = categories.map(c => c.id === id ? { ...c, category_name: newName, monthly_limit: parseFloat(newLimit) } : c);
    localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(categories));

    loadCategoriesDropdown();
    loadCategoriesPage();
    loadDashboard();
}

function deleteCategory(id) {
    if (confirm("Are you sure you want to delete this Category?")) {
        categories = categories.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEY_CAT, JSON.stringify(categories));
        loadCategoriesDropdown();
        loadCategoriesPage();
        loadDashboard();
    }
}

// DASHBOARD & CHARTS
function loadDashboard() {
    if (!selectedMonth) return;
    let txs = JSON.parse(localStorage.getItem(STORAGE_KEY_TX)) || [];
    currentTransactions = txs.filter(t => t.created_at.startsWith(selectedMonth));

    let totIncome = currentTransactions.filter(t => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
    let totExpense = currentTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
    
    document.getElementById('sum-income').innerText = `₹${totIncome}`;
    document.getElementById('sum-expense').innerText = `₹${totExpense}`;
    document.getElementById('sum-balance').innerText = `₹${totIncome - totExpense}`;

    let chartLabels = [];
    let chartData = [];

    categories.forEach(c => {
        const catExpenses = currentTransactions
            .filter(t => t.category === c.category_name && t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        if(catExpenses > 0) {
            chartLabels.push(c.category_name);
            chartData.push(catExpenses);
        }
    });

    renderChart(chartLabels, chartData);
    renderHistory();
}

function renderChart(labels, data) {
    const canvas = document.getElementById('expenseChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if (chartInstance) chartInstance.destroy();
    if (data.length === 0) return;

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: ['#ef4444', '#38bdf8', '#f59e0b', '#10b981', '#a78bfa', '#00e676', '#ec4899', '#6366f1'] }] },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { size: 10 } } } } }
    });
}

function loadCategoriesPage() {
    let overallLimit = categories.reduce((sum, c) => sum + parseFloat(c.monthly_limit), 0);
    let overallSpent = 0;

    const budgetContainer = document.getElementById('budget-list');
    if(!budgetContainer) return;
    budgetContainer.innerHTML = '';

    let txs = JSON.parse(localStorage.getItem(STORAGE_KEY_TX)) || [];
    let monthTxs = txs.filter(t => t.created_at.startsWith(selectedMonth));

    categories.forEach(c => {
        const catExpenses = monthTxs
            .filter(t => t.category === c.category_name && t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        overallSpent += catExpenses;
        const remBalance = c.monthly_limit - catExpenses;
        let pct = Math.min(100, Math.round((catExpenses / c.monthly_limit) * 100)) || 0;
        let barColor = pct > 90 ? '#ef4444' : (pct > 70 ? '#f59e0b' : '#10b981');

        budgetContainer.innerHTML += `
            <div class="card" style="margin-bottom: 12px; padding: 15px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>${c.category_name}</strong>
                    <div>
                        <button type="button" class="glow-btn" style="padding:4px 8px; font-size:12px;" onclick="editCategory(${c.id}, '${c.category_name}', ${c.monthly_limit})">✏️</button>
                        <button type="button" class="glow-btn" style="padding:4px 8px; font-size:12px; background:#7f1d1d;" onclick="deleteCategory(${c.id})">🗑️</button>
                    </div>
                </div>
                <div style="font-size:13px; margin:5px 0;">Limit: ₹${c.monthly_limit} | Spent: ₹${catExpenses}</div>
                <div style="background:#334155; border-radius:4px; height:8px; width:100%; overflow:hidden;">
                    <div style="height:100%; width: ${pct}%; background: ${barColor};"></div>
                </div>
                <div style="font-size:12px; margin-top:4px;" class="${remBalance >= 0 ? '' : 'amount-debit'}">Left: ₹${remBalance} (${pct}%)</div>
            </div>
        `;
    });

    const limEl = document.getElementById('tot-budget-limit');
    const sptEl = document.getElementById('tot-budget-spent');
    const lftEl = document.getElementById('tot-budget-left');
    if(limEl) limEl.innerText = `₹${overallLimit}`;
    if(sptEl) sptEl.innerText = `₹${overallSpent}`;
    if(lftEl) lftEl.innerText = `₹${overallLimit - overallSpent}`;
}

function renderHistory() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const typeFilter = document.getElementById('filter-type').value;
    const catFilter = document.getElementById('filter-category').value;
    const listContainer = document.getElementById('transaction-list');
    if (!listContainer) return;
    
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
                    <small style="color:#94a3b8;">${new Date(t.created_at).toLocaleDateString()}</small>
                </div>
                <div>
                    <strong class="${isCredit ? 'amount-credit' : 'amount-debit'}">${isCredit ? '+' : '-'}₹${t.amount}</strong>
                    <button type="button" class="del-btn glow-btn" onclick="deleteTransaction(${t.id})">🗑️</button>
                </div>
            </div>
        `;
    });
}

// HELP MODAL
function openHelpModal() {
    const helpBody = document.getElementById('help-body');
    if(!helpBody) return;
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
                     
