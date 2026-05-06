// Stock Portfolio Tracker App
const FINNHUB_API_KEY = 'd7tgc8hr01qugn0ah1b0d7tgc8hr01qugn0ah1bg';
const FINNHUB_API = 'https://finnhub.io/api/v1';

let transactions = [];
let prices = {};
let portfolios = {};
let exchangeRates = { USD: 1, HKD: 7.8, EUR: 1.1 };

const PORTFOLIO_NAMES = [
    'Sofi Stock',
    'LB ETF',
    'OSL Crypto',
    'Duka Crypto',
    'Cash',
    'Time Deposit'
];

// UI Elements
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const addBtn = document.getElementById('addBtn');
const refreshBtn = document.getElementById('refreshBtn');
const menuBtn = document.getElementById('menuBtn');
const addModal = document.getElementById('addModal');
const transactionForm = document.getElementById('transactionForm');
const cancelBtn = document.getElementById('cancelBtn');
const modalClose = document.querySelector('.modal-close');
const portfolioSelect = document.getElementById('portfolioSelect');

// Event Listeners
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        switchTab(tabName);
    });
});

addBtn.addEventListener('click', () => {
    addModal.classList.add('active');
});

refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    await updatePrices();
    renderAll();
    refreshBtn.disabled = false;
});

modalClose.addEventListener('click', () => {
    addModal.classList.remove('active');
});

cancelBtn.addEventListener('click', () => {
    addModal.classList.remove('active');
});

transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addTransaction();
});

// Tab Switching
function switchTab(tabName) {
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Initialize Portfolio Select
function initializePortfolioSelect() {
    portfolioSelect.innerHTML = '<option value="">Select portfolio</option>';
    PORTFOLIO_NAMES.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        portfolioSelect.appendChild(option);
    });
}

// Load Transactions from Firebase
async function loadTransactions() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        transactions = [];
        portfolios = {};
        PORTFOLIO_NAMES.forEach(name => portfolios[name] = []);

        const snapshot = await db.collection('transactions')
            .where('userId', '==', user.uid)
            .orderBy('date', 'asc')
            .get();

        snapshot.forEach(doc => {
            const data = doc.data();
            transactions.push({ id: doc.id, ...data });
            
            if (portfolios[data.portfolio]) {
                portfolios[data.portfolio].push({
                    symbol: data.symbol,
                    name: data.name,
                    exchange: data.exchange,
                    shares: data.shares,
                    price: data.price,
                    date: data.date,
                    currency: data.currency
                });
            }
        });
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Fetch Real-time Prices from Finnhub
async function updatePrices() {
    const symbols = new Set();
    
    transactions.forEach(t => {
        if (t.symbol && !t.symbol.includes('CASH')) {
            symbols.add(t.symbol);
        }
    });

    prices = {};
    
    for (const symbol of symbols) {
        try {
            const response = await fetch(
                `${FINNHUB_API}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
            );
            const data = await response.json();
            if (data.c) {
                prices[symbol] = {
                    current: data.c,
                    change: data.d || 0,
                    changePercent: data.dp || 0
                };
            }
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
        }
    }
}

// Add Transaction
async function addTransaction() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const portfolio = document.getElementById('portfolioSelect').value;
        const symbol = document.getElementById('symbolInput').value.toUpperCase();
        const name = document.getElementById('nameInput').value;
        const exchange = document.getElementById('exchangeInput').value;
        const currency = document.getElementById('currencySelect').value;
        const shares = parseFloat(document.getElementById('sharesInput').value);
        const price = parseFloat(document.getElementById('priceInput').value);
        const date = document.getElementById('dateInput').value;
        const time = document.getElementById('timeInput').value;
        const exchangeRate = parseFloat(document.getElementById('exchangeRateInput').value) || 1;
        const notes = document.getElementById('notesInput').value;

        if (!portfolio || !symbol || !name || !shares || !price || !date) {
            alert('Please fill in all required fields');
            return;
        }

        await db.collection('transactions').add({
            userId: user.uid,
            portfolio,
            symbol,
            name,
            exchange,
            currency,
            shares,
            price,
            date,
            time,
            exchangeRate,
            notes,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Reset form
        transactionForm.reset();
        addModal.classList.remove('active');

        // Reload
        await loadTransactions();
        await updatePrices();
        renderAll();
    } catch (error) {
        console.error('Error adding transaction:', error);
        alert('Error adding transaction: ' + error.message);
    }
}

// Calculate Portfolio Stats
function calculateStats(holdings) {
    let totalValue = 0;
    let totalCost = 0;
    let totalDaily = 0;

    holdings.forEach(h => {
        const priceData = prices[h.symbol] || { current: h.price, change: 0 };
        const currentPrice = priceData.current;
        const value = h.shares * currentPrice;
        const cost = h.shares * h.price;
        const daily = (priceData.change || 0) * h.shares;

        totalValue += value;
        totalCost += cost;
        totalDaily += daily;
    });

    return {
        value: totalValue,
        cost: totalCost,
        gain: totalValue - totalCost,
        daily: totalDaily,
        gainPercent: totalCost > 0 ? (((totalValue - totalCost) / totalCost) * 100) : 0,
        dailyPercent: totalCost > 0 ? ((totalDaily / totalCost) * 100) : 0
    };
}

// Format Currency
function formatCurrency(value, currency = 'HKD') {
    const symbol = currency === 'HKD' ? 'HK$' : currency === 'EUR' ? '€' : '$';
    return symbol + value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Render Overview Tab
function renderOverview() {
    let totalValue = 0;
    let totalCost = 0;
    let totalDaily = 0;

    Object.values(portfolios).forEach(holdings => {
        const stats = calculateStats(holdings);
        totalValue += stats.value;
        totalCost += stats.cost;
        totalDaily += stats.daily;
    });

    const gain = totalValue - totalCost;
    const gainPercent = totalCost > 0 ? ((gain / totalCost) * 100) : 0;
    const dailyPercent = totalCost > 0 ? ((totalDaily / totalCost) * 100) : 0;

    // Update summary
    document.getElementById('totalValue').textContent = formatCurrency(totalValue);
    document.getElementById('totalValue').className = gain >= 0 ? 'summary-value' : 'summary-value negative';

    document.getElementById('dailyChange').textContent = formatCurrency(totalDaily);
    document.getElementById('dailyChange').className = totalDaily >= 0 ? 'summary-value positive' : 'summary-value negative';
    document.getElementById('dailyPercent').textContent = (totalDaily >= 0 ? '+' : '') + dailyPercent.toFixed(2) + '%';
    document.getElementById('dailyPercent').className = totalDaily >= 0 ? 'summary-percent positive' : 'summary-percent negative';

    document.getElementById('totalGain').textContent = formatCurrency(gain);
    document.getElementById('totalGain').className = gain >= 0 ? 'summary-value positive' : 'summary-value negative';
    document.getElementById('totalPercent').textContent = (gain >= 0 ? '+' : '') + gainPercent.toFixed(2) + '%';
    document.getElementById('totalPercent').className = gain >= 0 ? 'summary-percent positive' : 'summary-percent negative';

    // Portfolio List
    const portfolioList = document.getElementById('portfolioList');
    portfolioList.innerHTML = '';

    Object.entries(portfolios).forEach(([name, holdings]) => {
        if (holdings.length === 0) return;
        const stats = calculateStats(holdings);
        
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.innerHTML = `
            <div class="portfolio-item-info">
                <h3>${name}</h3>
                <p>${holdings.length} Transactions</p>
            </div>
            <div class="portfolio-item-stats">
                <div class="portfolio-item-value">${formatCurrency(stats.value)}</div>
                <div class="portfolio-item-value" style="color: #999; font-size: 12px; margin-bottom: 4px;">${formatCurrency(stats.cost)}</div>
                <div class="portfolio-item-change ${stats.daily >= 0 ? 'positive' : 'negative'}">
                    ${formatCurrency(stats.daily)} (${(stats.daily >= 0 ? '+' : '')}${stats.dailyPercent.toFixed(2)}%)
                </div>
            </div>
        `;
        portfolioList.appendChild(item);
    });
}

// Render Portfolios Tab
function renderPortfolios() {
    const table = document.getElementById('portfolioTable');
    table.innerHTML = '';

    Object.entries(portfolios).forEach(([name, holdings]) => {
        if (holdings.length === 0) return;
        const stats = calculateStats(holdings);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td>${formatCurrency(stats.value)}</td>
            <td>${formatCurrency(stats.cost)}</td>
            <td class="${stats.gain >= 0 ? 'value-positive' : 'value-negative'}">${formatCurrency(stats.gain)}</td>
            <td class="${stats.gainPercent >= 0 ? 'value-positive' : 'value-negative'}">${(stats.gainPercent >= 0 ? '+' : '')}${stats.gainPercent.toFixed(2)}%</td>
        `;
        table.appendChild(row);
    });
}

// Render Holdings Tab
function renderHoldings() {
    const container = document.getElementById('holdingsContainer');
    container.innerHTML = '';

    let hasHoldings = false;
    
    Object.entries(portfolios).forEach(([portfolio, holdings]) => {
        holdings.forEach(holding => {
            hasHoldings = true;
            const priceData = prices[holding.symbol] || { current: holding.price, change: 0, changePercent: 0 };
            const currentPrice = priceData.current;
            const value = holding.shares * currentPrice;
            const cost = holding.shares * holding.price;
            const gain = value - cost;
            const gainPercent = cost > 0 ? ((gain / cost) * 100) : 0;

            const card = document.createElement('div');
            card.className = 'holdings-card';
            card.innerHTML = `
                <div class="holdings-card-header">
                    <div class="holdings-card-symbol">${holding.symbol}</div>
                    <div class="holdings-card-name">${holding.name}</div>
                </div>
                <div class="holdings-card-info">
                    <div class="holdings-info-item">
                        <span class="holdings-info-label">Price</span>
                        <span class="holdings-info-value">${formatCurrency(currentPrice)}</span>
                    </div>
                    <div class="holdings-info-item">
                        <span class="holdings-info-label">Daily</span>
                        <span class="holdings-info-value ${priceData.change >= 0 ? 'positive' : 'negative'}">${formatCurrency(priceData.change)}</span>
                    </div>
                    <div class="holdings-info-item">
                        <span class="holdings-info-label">Shares</span>
                        <span class="holdings-info-value">${holding.shares.toFixed(8)}</span>
                    </div>
                    <div class="holdings-info-item">
                        <span class="holdings-info-label">Value</span>
                        <span class="holdings-info-value">${formatCurrency(value)}</span>
                    </div>
                    <div class="holdings-info-item">
                        <span class="holdings-info-label">Cost Basis</span>
                        <span class="holdings-info-value">${formatCurrency(cost)}</span>
                    </div>
                    <div class="holdings-info-item">
                        <span class="holdings-info-label">Gain/Loss</span>
                        <span class="holdings-info-value ${gain >= 0 ? 'positive' : 'negative'}">${formatCurrency(gain)} (${(gainPercent >= 0 ? '+' : '')}${gainPercent.toFixed(2)}%)</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    });

    if (!hasHoldings) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <h3>No holdings yet</h3>
                <p>Click the + button to add your first transaction</p>
            </div>
        `;
    }
}

// Render All
function renderAll() {
    renderOverview();
    renderPortfolios();
    renderHoldings();
}

// Load App
async function loadApp() {
    initializePortfolioSelect();
    await loadTransactions();
    await updatePrices();
    renderAll();
}

// Initialize on page load
window.addEventListener('load', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            loadApp();
        }
    });
});
