document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    // State
    let charts = {};

    // Tab Logic
    function switchTab(tabId) {
        console.log('Switching to:', tabId);
        
        // Buttons
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Content
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.toggle('active', section.id === tabId);
        });

        // Header Title
        const titles = {
            'performance': 'Performance Analytics',
            'admin': 'Partner Administration',
            'legal': 'Legal Repository',
            'marketing': 'Campaign Strategy'
        };
        const titleEl = document.getElementById('tab-title');
        if (titleEl) titleEl.textContent = titles[tabId] || 'PartnerUp';

        // Filter visibility
        const filter = document.getElementById('partner-filter');
        if (filter) filter.style.display = (tabId === 'performance' ? 'block' : 'none');

        // Resize charts
        if (tabId === 'performance' && charts.revenue) {
            setTimeout(() => {
                charts.revenue.resize();
                charts.category.resize();
            }, 100);
        }
    }

    // Nav Click Listeners
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });

    // Dashboard Data
    function initCharts() {
        const c1 = document.getElementById('revenueChart');
        const c2 = document.getElementById('categoryChart');
        if (!c1 || !c2) return;

        charts.revenue = new Chart(c1.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Revenue',
                    data: [],
                    borderColor: '#ff6720',
                    backgroundColor: 'rgba(255, 103, 32, 0.08)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });

        charts.category = new Chart(c2.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ['#ff6720', '#0ea5e9', '#8b5cf6', '#10b981', '#f43f5e'],
                    borderWidth: 0
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function updateData(partner = 'all') {
        if (!window.performanceData) return;
        const data = partner === 'all' ? performanceData : performanceData.filter(d => d.partner_name === partner);
        
        let rev = 0, pts = 0, cost = 0;
        const cats = {}, trends = {};

        data.forEach(d => {
            const r = parseFloat(d.transaction_amount) || 0;
            const p = (parseInt(d.base_points_issued) || 0) + (parseInt(d.bonus_points_issued) || 0);
            const c = parseFloat(d.total_cost_to_partner) || 0;
            rev += r; pts += p; cost += c;
            cats[d.category] = (cats[d.category] || 0) + r;
            const m = new Date(d.transaction_date).toLocaleString('default', { month: 'short' });
            trends[m] = (trends[m] || 0) + r;
        });

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        set('total-revenue', `$${(rev/1000).toFixed(1)}k`);
        set('total-points', `${(pts/1000).toFixed(1)}k`);
        set('total-cost', `$${(cost/1000).toFixed(1)}k`);
        set('efficiency-ratio', (rev / (cost || 1)).toFixed(2));

        const order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const sorted = Object.keys(trends).sort((a,b) => order.indexOf(a) - order.indexOf(b));
        
        if (charts.revenue) {
            charts.revenue.data.labels = sorted;
            charts.revenue.data.datasets[0].data = sorted.map(m => trends[m]);
            charts.revenue.update();
        }
        if (charts.category) {
            charts.category.data.labels = Object.keys(cats);
            charts.category.data.datasets[0].data = Object.values(cats);
            charts.category.update();
        }
    }

    // Dynamic Lists
    function render() {
        const mList = document.getElementById('meetings-list');
        if (mList && window.meetingsData) {
            meetingsData.slice(0, 5).forEach(m => {
                mList.innerHTML += `<div class="list-item"><i data-lucide="video" style="color:var(--accent-blue)"></i><span>${m.Name.replace('.docx','')} (${m.Partner})</span></div>`;
            });
        }
        const cList = document.getElementById('contracts-list');
        if (cList && window.contractsData) {
            contractsData.forEach(c => {
                cList.innerHTML += `<div class="list-item"><i data-lucide="file-text"></i><span>${c.Name}</span></div>`;
            });
        }
        const grid = document.getElementById('calendar-grid');
        if (grid && window.marketingData) {
            const first = new Date(2026, 5, 1).getDay();
            const days = new Date(2026, 6, 0).getDate();
            for (let i = 0; i < first; i++) grid.innerHTML += '<div class="calendar-cell"></div>';
            for (let d = 1; d <= days; d++) {
                const ds = `2026-06-${d.toString().padStart(2, '0')}`;
                const camps = marketingData.filter(c => c.date.startsWith(ds));
                grid.innerHTML += `<div class="calendar-cell"><span class="calendar-day-num">${d}</span>${camps.map(c => `<div class="calendar-event ${c.priority.toLowerCase().replace(' ','-')}">${c.name}</div>`).join('')}</div>`;
            }
        }
        lucide.createIcons();
    }

    const filter = document.getElementById('partner-filter');
    if (filter) filter.addEventListener('change', e => updateData(e.target.value));

    // Initial Start
    initCharts();
    updateData();
    render();
    switchTab('performance');
});
