// State Management
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let myChart = null;

// DOM Elements
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const netBalanceEl = document.getElementById('netBalance');
const transactionForm = document.getElementById('transactionForm');
const transactionList = document.getElementById('transactionList');
const searchInput = document.getElementById('searchInput');
const exportBtn = document.getElementById('exportBtn');
const themeToggle = document.getElementById('themeToggle');
const dateInput = document.getElementById('date');

// Set Today's Date as Default
dateInput.valueAsDate = new Date();

// Theme Toggle Logic
themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
});

// Add New Transaction
transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTx = {
        id: Date.now(),
        desc: document.getElementById('desc').value,
        amount: parseFloat(document.getElementById('amount').value),
        type: document.getElementById('type').value,
        category: document.getElementById('category').value,
        tag: document.getElementById('tag').value,
        date: document.getElementById('date').value
    };

    transactions.push(newTx);
    saveAndRender();
    transactionForm.reset();
    dateInput.valueAsDate = new Date();
});

// Save to LocalStorage & Re-render
function saveAndRender() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateSummary();
    renderList(transactions);
    updateChart();
}

// Calculate Summary Totals
function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    totalIncomeEl.textContent = `₹${income.toFixed(2)}`;
    totalExpenseEl.textContent = `₹${expense.toFixed(2)}`;
    netBalanceEl.textContent = `₹${balance.toFixed(2)}`;
}

// Render Transaction List UI
function renderList(listData) {
    transactionList.innerHTML = '';

    if (listData.length === 0) {
        transactionList.innerHTML = '<li style="text-align:center; color: var(--text-secondary); padding: 10px;">No transactions found.</li>';
        return;
    }

    listData.slice().reverse().forEach(t => {
        const li = document.createElement('li');
        li.className = `transaction-item ${t.type}`;

        const isIncome = t.type === 'income';
        const sign = isIncome ? '+' : '-';
        const colorClass = isIncome ? 'var(--income-color)' : 'var(--expense-color)';

        li.innerHTML = `
            <div class="item-info">
                <span class="item-desc">${t.desc} <span class="badge">${t.tag}</span></span>
                <span class="item-meta">${t.category} • ${t.date}</span>
            </div>
            <div class="item-amount-action">
                <span style="font-weight: bold; color: ${colorClass}">${sign}₹${t.amount.toFixed(2)}</span>
                <button class="btn-delete" onclick="deleteTransaction(${t.id})">🗑️</button>
            </div>
        `;
        transactionList.appendChild(li);
    });
}

// Delete Transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveAndRender();
}

// Search Filter
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = transactions.filter(t => 
        t.desc.toLowerCase().includes(term) || 
        t.category.toLowerCase().includes(term)
    );
    renderList(filtered);
});

// Export to CSV Functionality
exportBtn.addEventListener('click', () => {
    if (transactions.length === 0) return alert('No data to export!');

    let csvContent = "data:text/csv;charset=utf-8,ID,Description,Amount,Type,Category,Tag,Date\n";
    transactions.forEach(t => {
        csvContent += `${t.id},"${t.desc}",${t.amount},${t.type},${t.category},${t.tag},${t.date}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expense_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Category Donut Chart Updates
function updateChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Group Expense by Category
    const categoryTotals = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Initial Load
saveAndRender();
