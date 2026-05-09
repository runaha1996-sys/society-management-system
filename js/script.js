// ==================== AUTH SYSTEM ====================
const API_URL = 'https://api.rahulpatel.online/api';


function checkAuth() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Role-based visibility
  if (role === 'member') {
    // Hide Admin-only menu items
    const membersLink = document.querySelector('a[href="members.html"]');
    const visitorsLink = document.querySelector('a[href="visitors.html"]');
    const reportsLink = document.querySelector('a[href="reports.html"]');
    const expensesLink = document.querySelector('a[href="expenses.html"]');
    const settingsLink = document.querySelector('a[href="settings.html"]');

    if (membersLink) membersLink.style.display = 'none';
    if (visitorsLink) visitorsLink.style.display = 'none';
    if (reportsLink) reportsLink.style.display = 'none';
    if (expensesLink) expensesLink.style.display = 'none';
    if (settingsLink) settingsLink.style.display = 'none';

    // Disable "Add" buttons on complaints and payments
    const addBtns = document.querySelectorAll('.btn-primary, .fab');
    addBtns.forEach(btn => {
      // If it's the complaint page, keep the add button but simplify it
      if (window.location.pathname.includes('complaints.html')) {
        // Keep it
      } else {
        btn.style.display = 'none';
      }
    });

    // Special handling for complaints modal for members
    const memberSelect = document.getElementById('complaintMemberId');
    if (memberSelect) {
      memberSelect.parentElement.style.display = 'none';
    }
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Run auth check on dashboard pages
const publicPages = ['home.html', 'login.html', ''];
const currentPage = window.location.pathname.split('/').pop() || 'home.html';
if (!publicPages.includes(currentPage) && currentPage !== 'home.html') {
  checkAuth();
}

// ==================== LOGIN ====================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const err = document.getElementById('loginError');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', data.user.name || data.user.username);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('member_id', data.user.member_id);
        window.location.href = 'index.html';
      } else {
        err.textContent = data.message || 'Invalid username or password!';
        err.style.display = 'block';
      }
    } catch (error) {
      err.textContent = 'Server connection failed!';
      err.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });
}

// ==================== SIDEBAR ====================
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');
if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    if (window.innerWidth <= 768) { sidebar.classList.toggle('open') }
    else { sidebar.classList.toggle('collapsed') }
  });
}

// Active menu
document.querySelectorAll('.sidebar-menu a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ==================== DROPDOWNS ====================
function toggleDropdown(id) {
  const menu = document.getElementById(id);
  document.querySelectorAll('.dropdown-menu').forEach(m => { if (m.id !== id) m.classList.remove('show') });
  if (menu) {
    menu.classList.toggle('show');
    if (id === 'notifMenu' && menu.classList.contains('show')) {
      localStorage.setItem('lastSeenNotif', Date.now().toString());
      const badge = document.querySelector('.icon-btn .badge');
      if (badge) badge.style.display = 'none';
    }
  }
}
document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
  }
});

// ==================== DARK MODE ====================
function toggleDarkMode() {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  const icon = document.querySelector('.dark-toggle i');
  if (icon) icon.className = document.body.classList.contains('dark') ? 'fas fa-sun' : 'fas fa-moon';
}
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
  const icon = document.querySelector('.dark-toggle i');
  if (icon) icon.className = 'fas fa-sun';
}

// ==================== MODAL ====================
function openModal(id) { const m = document.getElementById(id); if (m) m.classList.add('show') }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('show') }

// ==================== TABLE SEARCH ====================
function searchTable(inputId, tableId) {
  const filter = document.getElementById(inputId).value.toLowerCase();
  const rows = document.querySelectorAll('#' + tableId + ' tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
}

// ==================== FILTER ====================
function filterTable(selectId, tableId, colIndex) {
  const val = document.getElementById(selectId).value.toLowerCase();
  const rows = document.querySelectorAll('#' + tableId + ' tbody tr');
  rows.forEach(row => {
    const cell = row.cells[colIndex];
    if (!val || cell.textContent.toLowerCase().includes(val)) { row.style.display = '' }
    else { row.style.display = 'none' }
  });
}

// ==================== HOMEPAGE NAV SCROLL ====================
const homeNav = document.querySelector('.home-nav');
if (homeNav) {
  window.addEventListener('scroll', () => {
    homeNav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// Hamburger menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    if (navLinks) navLinks.classList.remove('open');
  });
});

// ==================== CHARTS (Chart.js) ====================
function initDashboardCharts() {
  const ctx1 = document.getElementById('paymentChart');
  if (ctx1) {
    new Chart(ctx1, { type: 'doughnut', data: { labels: ['Paid', 'Pending', 'Overdue'], datasets: [{ data: [65, 25, 10], backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'], borderWidth: 0 }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } } } });
  }
  const ctx2 = document.getElementById('complaintChart');
  if (ctx2) {
    new Chart(ctx2, { type: 'bar', data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ label: 'Complaints', data: [12, 8, 15, 7, 10, 5], backgroundColor: 'rgba(99,102,241,.7)', borderRadius: 6 }] }, options: { responsive: true, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } } });
  }
}

function initReportCharts() {
  const ctx1 = document.getElementById('monthlyRevenue');
  if (ctx1) {
    new Chart(ctx1, { type: 'line', data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: [{ label: 'Revenue (₹)', data: [85000, 92000, 88000, 95000, 91000, 98000, 102000, 97000, 105000, 110000, 108000, 115000], borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.1)', fill: true, tension: .4 }] }, options: { responsive: true, scales: { y: { beginAtZero: true } } } });
  }
  const ctx2 = document.getElementById('memberGrowth');
  if (ctx2) {
    new Chart(ctx2, { type: 'bar', data: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], datasets: [{ label: 'New Members', data: [15, 22, 18, 28], backgroundColor: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc'], borderRadius: 8 }] }, options: { responsive: true, scales: { y: { beginAtZero: true } } } });
  }
  const ctx3 = document.getElementById('complaintAnalysis');
  if (ctx3) {
    new Chart(ctx3, { type: 'pie', data: { labels: ['Plumbing', 'Electrical', 'Parking', 'Noise', 'Other'], datasets: [{ data: [30, 20, 15, 25, 10], backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'] }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } } } });
  }
  const ctx4 = document.getElementById('occupancy');
  if (ctx4) {
    new Chart(ctx4, { type: 'doughnut', data: { labels: ['Occupied', 'Vacant'], datasets: [{ data: [85, 15], backgroundColor: ['#22c55e', '#e2e8f0'], borderWidth: 0 }] }, options: { responsive: true, plugins: { legend: { position: 'bottom' } } } });
  }
}

async function fetchDashboardStats() {
  const membersEl = document.getElementById('statTotalMembers');
  const complaintsEl = document.getElementById('statOpenComplaints');
  const paymentsEl = document.getElementById('statPaymentsCollected');
  const visitorsEl = document.getElementById('statVisitorsToday');
  const balanceEl = document.getElementById('statCurrentBalance');

  if (!membersEl && !complaintsEl && !paymentsEl && !visitorsEl && !balanceEl) return;

  try {
    const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

    // Fetch counts from various APIs
    const [mRes, cRes, pRes, vRes, eRes, sRes] = await Promise.all([
      fetch(`${API_URL}/members`, { headers: authHeader }),
      fetch(`${API_URL}/complaints`, { headers: authHeader }),
      fetch(`${API_URL}/payments`, { headers: authHeader }),
      fetch(`${API_URL}/visitors`, { headers: authHeader }),
      fetch(`${API_URL}/expenses`, { headers: authHeader }),
      fetch(`${API_URL}/settings`, { headers: authHeader })
    ]);

    const [members, complaints, payments, visitors, expenses, settings] = await Promise.all([
      mRes.json(), cRes.json(), pRes.json(), vRes.json(), eRes.json(), sRes.json()
    ]);

    if (membersEl) membersEl.textContent = members.length;
    if (complaintsEl) complaintsEl.textContent = complaints.filter(c => c.status === 'Open').length;

    // Role-based stats calculation
    if (localStorage.getItem('role') === 'member') {
      const memberId = localStorage.getItem('member_id');

      // Calculate outstanding based purely on database Pending/Overdue entries
      const memberPayments = payments.filter(p => p.member_id == memberId);
      const outstanding = memberPayments
        .filter(p => p.status.toLowerCase() === 'pending' || p.status.toLowerCase() === 'overdue')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      if (paymentsEl) {
        paymentsEl.parentElement.querySelector('p').textContent = 'Outstanding Balance';
        paymentsEl.textContent = `₹${outstanding.toLocaleString()}`;
        paymentsEl.style.color = outstanding > 0 ? 'var(--danger)' : 'var(--success)';
      }
    } else {
      // Admin view (Outstanding Collection)
      const outstandingCollection = payments
        .filter(p => p.status.toLowerCase() === 'pending' || p.status.toLowerCase() === 'overdue')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      if (paymentsEl) {
        paymentsEl.parentElement.querySelector('p').textContent = 'Outstanding Collection';
        paymentsEl.textContent = `₹${outstandingCollection.toLocaleString()}`;
        paymentsEl.style.color = outstandingCollection > 0 ? 'var(--danger)' : 'var(--text)';
      }

      // Calculate Current Balance
      if (balanceEl) {
        const openingBalance = parseFloat(settings.opening_balance) || 0;
        const totalPaid = payments
          .filter(p => p.status.toLowerCase() === 'paid')
          .reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

        const currentBalance = openingBalance + totalPaid - totalExpenses;
        balanceEl.textContent = `₹${currentBalance.toLocaleString()}`;
        balanceEl.style.color = currentBalance < 0 ? 'var(--danger)' : 'var(--success)';
      }
    }

    if (visitorsEl) {
      const today = new Date().toLocaleDateString();
      const count = visitors.filter(v => new Date(v.entry_time).toLocaleDateString() === today).length;
      visitorsEl.textContent = count;
    }

    // --- RECENT ACTIVITY LOGIC ---
    const activityBody = document.getElementById('recentActivityBody');
    if (activityBody) {
      const activities = [];

      // Add Payments to activities
      payments.slice(0, 5).forEach(p => {
        activities.push({
          type: 'Payment',
          member: p.member_name || 'Admin',
          date: new Date(p.payment_date || p.created_at),
          status: p.status,
          label: `Maintenance - ₹${p.amount}`
        });
      });

      // Add Complaints to activities
      complaints.slice(0, 5).forEach(c => {
        activities.push({
          type: 'Complaint',
          member: c.member_name || 'Admin',
          date: new Date(c.created_at),
          status: c.status,
          label: c.title
        });
      });

      // Sort by date (desc)
      activities.sort((a, b) => b.date - a.date);

      activityBody.innerHTML = '';
      activities.slice(0, 10).forEach(act => {
        const dateStr = act.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const row = `
          <tr>
            <td>${act.label}</td>
            <td>${act.member}</td>
            <td>${dateStr}</td>
            <td><span class="status ${act.status.toLowerCase()}">${act.status}</span></td>
          </tr>
        `;
        activityBody.insertAdjacentHTML('beforeend', row);
      });
    }

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
  }

  // --- NOTIFICATION LOGIC ---
  fetchNotifications();
}

async function fetchNotifications() {
  const notifList = document.getElementById('notifMenu');
  if (!notifList) return;

  const badge = document.querySelector('.icon-btn .badge');
  const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

  try {
    const [cRes, pRes, nRes] = await Promise.all([
      fetch(`${API_URL}/complaints`, { headers: authHeader }),
      fetch(`${API_URL}/payments`, { headers: authHeader }),
      fetch(`${API_URL}/notices`, { headers: authHeader })
    ]);

    const complaints = await cRes.json();
    const payments = await pRes.json();
    const notices = await nRes.json();

    const notifications = [];
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    // 1. Add Complaints (last 10 days)
    complaints.forEach(c => {
      const date = new Date(c.created_at);
      if (date >= tenDaysAgo) {
        notifications.push({
          text: `<b>${c.member_name || 'Member'}</b> filed a complaint: "${c.title}"`,
          time: date,
          icon: 'exclamation-circle'
        });
      }
    });

    // 2. Add Payments (last 10 days)
    payments.forEach(p => {
      const date = new Date(p.payment_date || p.created_at);
      if (date >= tenDaysAgo && p.status.toLowerCase() === 'paid') {
        notifications.push({
          text: `<b>${p.member_name || 'Member'}</b> paid ₹${p.amount} (${p.type})`,
          time: date,
          icon: 'check-circle'
        });
      }
    });

    // 3. Add Notices (last 10 days)
    notices.forEach(n => {
      const date = new Date(n.created_at || new Date());
      if (date >= tenDaysAgo) {
        notifications.push({
          text: `<b>Notice:</b> ${n.title}`,
          time: date,
          icon: 'bullhorn'
        });
      }
    });

    // Sort by date (newest first)
    notifications.sort((a, b) => b.time - a.time);

    const lastSeenStr = localStorage.getItem('lastSeenNotif');
    const lastSeenTime = lastSeenStr ? new Date(parseInt(lastSeenStr)) : new Date(0);
    const unseenNotifications = notifications.filter(n => n.time > lastSeenTime);

    // Clear and Render
    const header = notifList.querySelector('.notif-header');
    notifList.innerHTML = '';
    if (header) notifList.appendChild(header);

    if (unseenNotifications.length === 0) {
      notifList.insertAdjacentHTML('beforeend', '<div class="notif-item">No new notifications</div>');
      if (badge) badge.style.display = 'none';
    } else {
      unseenNotifications.forEach(notif => {
        const timeStr = notif.time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' +
          notif.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const item = `
          <div class="notif-item">
            ${notif.text}<br><small>${timeStr}</small>
          </div>
        `;
        notifList.insertAdjacentHTML('beforeend', item);
      });
      if (badge) {
        badge.textContent = unseenNotifications.length;
        badge.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
}

// ==================== CHART & ANALYTICS ====================
async function initDashboardCharts() {
  const ctx = document.getElementById('paymentChart')?.getContext('2d');
  if (!ctx) return;

  const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
  try {
    const response = await fetch(`${API_URL}/payments`, { headers: authHeader });
    const payments = await response.json();

    const paid = payments.filter(p => p.status.toLowerCase() === 'paid').length;
    const pending = payments.filter(p => p.status.toLowerCase() === 'pending').length;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Paid', 'Pending'],
        datasets: [{
          data: [paid, pending],
          backgroundColor: ['#10b981', '#f59e0b']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  } catch (err) { console.error(err); }
}

async function initReportCharts() {
  const revenueCtx = document.getElementById('monthlyRevenue')?.getContext('2d');
  const complaintCtx = document.getElementById('complaintAnalysis')?.getContext('2d');
  if (!revenueCtx && !complaintCtx) return;

  const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
  try {
    const [pRes, eRes, cRes, sRes] = await Promise.all([
      fetch(`${API_URL}/payments`, { headers: authHeader }),
      fetch(`${API_URL}/expenses`, { headers: authHeader }),
      fetch(`${API_URL}/complaints`, { headers: authHeader }),
      fetch(`${API_URL}/settings`, { headers: authHeader })
    ]);

    const payments = await pRes.json();
    const expenses = await eRes.json();
    const complaints = await cRes.json();
    const settings = await sRes.json();
    const openingBalance = parseFloat(settings.opening_balance) || 0;

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = new Array(12).fill(0);
    const expenseData = new Array(12).fill(0);

    payments.filter(p => p.status.toLowerCase() === 'paid').forEach(p => {
      const monthIdx = months.indexOf(p.month);
      if (monthIdx !== -1) revenueData[monthIdx] += parseFloat(p.amount);
    });

    expenses.forEach(e => {
      const monthIdx = months.indexOf(e.month);
      if (monthIdx !== -1) expenseData[monthIdx] += parseFloat(e.amount);
    });

    // Update Summary Stats
    const totalRev = revenueData.reduce((a, b) => a + b, 0);
    const totalExp = expenseData.reduce((a, b) => a + b, 0);

    if (document.getElementById('reportTotalRevenue')) document.getElementById('reportTotalRevenue').textContent = `₹${totalRev.toLocaleString()}`;
    if (document.getElementById('reportTotalExpenses')) document.getElementById('reportTotalExpenses').textContent = `₹${totalExp.toLocaleString()}`;
    if (document.getElementById('reportNetSavings')) document.getElementById('reportNetSavings').textContent = `₹${(openingBalance + totalRev - totalExp).toLocaleString()}`;
    if (document.getElementById('reportPendingComplaints')) document.getElementById('reportPendingComplaints').textContent = complaints.filter(c => c.status === 'Open').length;

    if (revenueCtx) {
      new Chart(revenueCtx, {
        type: 'bar',
        data: {
          labels: shortMonths,
          datasets: [
            { label: 'Revenue', data: revenueData, backgroundColor: '#4f46e5' },
            { label: 'Expenses', data: expenseData, backgroundColor: '#ef4444' }
          ]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    if (complaintCtx) {
      const open = complaints.filter(c => c.status === 'Open').length;
      const closed = complaints.filter(c => c.status === 'Closed').length;
      new Chart(complaintCtx, {
        type: 'pie',
        data: {
          labels: ['Open', 'Closed'],
          datasets: [{ data: [open, closed], backgroundColor: ['#f59e0b', '#10b981'] }]
        }
      });
    }
  } catch (err) { console.error(err); }
}

let allMembers = []; // Global to store fetched members

async function fetchMembers() {
  const tableBody = document.querySelector('#memberTable tbody');
  if (!tableBody) return;

  try {
    const response = await fetch(`${API_URL}/members`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    allMembers = await response.json();

    if (response.ok) {
      tableBody.innerHTML = '';
      allMembers.forEach((member, index) => {
        const row = `
          <tr>
            <td>${member.id}</td>
            <td>${member.name}</td>
            <td>${member.bungalow_no}</td>
            <td>${member.phone || '-'}</td>
            <td>${member.email || '-'}</td>
            <td><span class="status ${member.status.toLowerCase()}">${member.status}</span></td>
            <td>
              <button class="icon-btn" onclick='toggleMemberStatus(${member.id}, "${member.status}")' title="${member.status === 'Active' ? 'Deactivate' : 'Activate'}" style="color:${member.status === 'Active' ? 'var(--success)' : 'var(--warning)'}">
                <i class="fas fa-power-off"></i>
              </button>
              <button class="icon-btn" onclick="openEditMemberModalByIndex(${index})" style="color:var(--info)"><i class="fas fa-edit"></i></button>
              <button class="icon-btn" onclick="deleteMember(${member.id})" style="color:var(--danger)"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
      });
    }
  } catch (error) {
    console.error('Error fetching members:', error);
  }
}

async function addMember() {
  const modal = document.getElementById('addMemberModal');
  const name = modal.querySelector('input[placeholder="Enter full name"]').value;
  const bungalow_no = modal.querySelector('input[placeholder="e.g. A-101"]').value;
  const phone = modal.querySelector('input[placeholder="+91"]').value;
  const email = modal.querySelector('input[placeholder="email@example.com"]').value;
  const password = modal.querySelector('input[placeholder="Set member password"]').value;
  const saveBtn = modal.querySelector('.modal-footer .btn-primary');

  if (!name || !bungalow_no || !password) {
    alert('Please fill name, bungalow number and password');
    return;
  }

  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const response = await fetch(`${API_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name, bungalow_no, phone, email, password })
    });

    if (response.ok) {
      closeModal('addMemberModal');
      fetchMembers();
      // Clear inputs
      modal.querySelectorAll('input').forEach(i => i.value = '');
    } else {
      const data = await response.json();
      alert(data.message || 'Failed to add member');
    }
  } catch (error) {
    console.error('Error adding member:', error);
    alert('Server connection failed');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Member';
  }
}

async function deleteMember(id) {
  if (!confirm('Are you sure you want to delete this member? All associated payments and complaints will also be removed.')) return;

  try {
    const response = await fetch(`${API_URL}/members/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (response.ok) {
      fetchMembers();
    } else {
      alert('Failed to delete member');
    }
  } catch (error) {
    console.error('Error deleting member:', error);
  }
}

function openEditMemberModalByIndex(index) {
  if (!allMembers || !allMembers[index]) {
    console.error('Member not found at index:', index);
    return;
  }
  const member = allMembers[index];

  // Set values and ensure elements exist
  const fields = {
    'editMemberId': member.id,
    'editMemberName': member.name,
    'editMemberFlat': member.bungalow_no,
    'editMemberPhone': member.phone || '',
    'editMemberEmail': member.email || '',
    'editMemberStatus': member.status
  };

  for (const [id, val] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  openModal('editMemberModal');
}

async function updateMember() {
  const id = document.getElementById('editMemberId').value;
  const name = document.getElementById('editMemberName').value;
  const bungalow_no = document.getElementById('editMemberFlat').value;
  const phone = document.getElementById('editMemberPhone').value;
  const email = document.getElementById('editMemberEmail').value;
  const password = document.getElementById('editMemberPassword').value;
  const status = document.getElementById('editMemberStatus').value;

  try {
    const response = await fetch(`${API_URL}/members/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name, bungalow_no, phone, email, status, password })
    });

    if (response.ok) {
      closeModal('editMemberModal');
      document.getElementById('editMemberPassword').value = '';
      fetchMembers();
    } else {
      alert('Failed to update member');
    }
  } catch (error) {
    console.error('Error updating member:', error);
  }
}

async function toggleMemberStatus(id, currentStatus) {
  try {
    const response = await fetch(`${API_URL}/members/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: currentStatus })
    });

    if (response.ok) {
      fetchMembers();
    } else {
      alert('Failed to update status');
    }
  } catch (error) {
    console.error('Error toggling status:', error);
  }
}

// ==================== VISITOR MANAGEMENT ====================
async function fetchVisitors() {
  const tableBody = document.querySelector('#visitorTable tbody');
  if (!tableBody) return;

  try {
    const response = await fetch(`${API_URL}/visitors`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const visitors = await response.json();

    if (response.ok) {
      tableBody.innerHTML = '';
      visitors.forEach((visitor, index) => {
        const date = new Date(visitor.entry_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const time = new Date(visitor.entry_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${visitor.name}</td>
            <td>${visitor.purpose}</td>
            <td>${visitor.visiting_bungalow || '-'}</td>
            <td>${date}</td>
            <td>${time}</td>
          </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
      });
    }
  } catch (error) {
    console.error('Error fetching visitors:', error);
  }
}

async function addVisitor() {
  const modal = document.getElementById('addVisitorModal');
  const name = modal.querySelector('input[placeholder="Enter visitor name"]').value;
  const purpose = modal.querySelector('select').value;
  const visiting_bungalow = modal.querySelector('input[placeholder="e.g. A-101"]').value;
  const phone = modal.querySelector('input[placeholder="+91"]').value;
  const saveBtn = modal.querySelector('.modal-footer .btn-primary');

  if (!name || !visiting_bungalow) {
    alert('Please fill name and bungalow number');
    return;
  }

  try {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const response = await fetch(`${API_URL}/visitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name, purpose, visiting_bungalow, phone })
    });

    if (response.ok) {
      closeModal('addVisitorModal');
      fetchVisitors();
      modal.querySelectorAll('input').forEach(i => i.value = '');
    } else {
      const data = await response.json();
      alert(data.message || 'Failed to add visitor');
    }
  } catch (error) {
    console.error('Error adding visitor:', error);
    alert('Server connection failed');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

// ==================== COMPLAINT MANAGEMENT ====================
async function fetchComplaints() {
  const tableBody = document.querySelector('#complaintTable tbody');
  if (!tableBody) return;

  try {
    const response = await fetch(`${API_URL}/complaints`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const complaints = await response.json();

    if (response.ok) {
      tableBody.innerHTML = '';
      complaints.forEach((complaint, index) => {
        const date = new Date(complaint.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const row = `
          <tr>
            <td>${complaint.id}</td>
            <td>${complaint.member_name || 'Unknown'}</td>
            <td>${complaint.title}</td>
            <td style="max-width: 250px; overflow-wrap: break-word;">${complaint.description || '-'}</td>
            <td>${date}</td>
            <td><span class="status ${complaint.status.toLowerCase()}">${complaint.status}</span></td>
          </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
      });
    }
  } catch (error) {
    console.error('Error fetching complaints:', error);
  }
}

async function populateMemberDropdown() {
  const dropdown = document.getElementById('complaintMemberId');
  if (!dropdown) return;

  try {
    const response = await fetch(`${API_URL}/members`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const members = await response.json();

    if (response.ok) {
      dropdown.innerHTML = '<option value="">Select Member...</option>';
      members.forEach(m => {
        const opt = `<option value="${m.id}">${m.name} (${m.bungalow_no})</option>`;
        dropdown.insertAdjacentHTML('beforeend', opt);
      });
    }
  } catch (error) {
    console.error('Error populating member dropdown:', error);
  }
}

async function addComplaint() {
  const modal = document.getElementById('addComplaintModal');
  const role = localStorage.getItem('role');
  let member_id = document.getElementById('complaintMemberId').value;

  // If logged in as member, use their own ID automatically
  if (role === 'member') {
    member_id = localStorage.getItem('member_id');
  }

  const title = document.getElementById('complaintTitle').value;
  const description = document.getElementById('complaintDesc').value;
  const submitBtn = modal.querySelector('.modal-footer .btn-primary');

  if (!member_id || !title) {
    const errorMsg = role === 'member' ? 'Please enter a subject' : 'Please select a member and enter a subject';
    alert(errorMsg);
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const response = await fetch(`${API_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ member_id, title, description })
    });

    if (response.ok) {
      closeModal('addComplaintModal');
      fetchComplaints();
      document.getElementById('complaintMemberId').value = '';
      document.getElementById('complaintTitle').value = '';
      document.getElementById('complaintDesc').value = '';
    } else {
      const data = await response.json();
      alert(data.message || 'Failed to submit complaint');
    }
  } catch (error) {
    console.error('Error adding complaint:', error);
    alert('Server connection failed');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Complaint';
  }
}

// ==================== NOTICE MANAGEMENT ====================
async function fetchNotices() {
  const noticesGrid = document.querySelector('.notices-grid');
  if (!noticesGrid) return;

  try {
    const response = await fetch(`${API_URL}/notices`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const notices = await response.json();

    if (response.ok) {
      noticesGrid.innerHTML = '';
      notices.forEach(notice => {
        const date = new Date(notice.date || notice.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const card = `
          <div class="notice-card">
            <h4>${notice.title}</h4>
            <p class="date"><i class="fas fa-calendar"></i> ${date}</p>
            <p>${notice.content}</p>
          </div>
        `;
        noticesGrid.insertAdjacentHTML('beforeend', card);
      });
    }
  } catch (error) {
    console.error('Error fetching notices:', error);
  }
}

async function addNotice() {
  const modal = document.getElementById('addNoticeModal');
  const title = modal.querySelector('input[placeholder="Notice title"]').value;
  const content = modal.querySelector('textarea').value;
  const dateInput = modal.querySelector('input[type="date"]').value;
  const publishBtn = modal.querySelector('.modal-footer .btn-primary');

  if (!title || !content) {
    alert('Please fill title and content');
    return;
  }

  try {
    publishBtn.disabled = true;
    publishBtn.textContent = 'Publishing...';

    const response = await fetch(`${API_URL}/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ title, content, date: dateInput })
    });

    if (response.ok) {
      closeModal('addNoticeModal');
      fetchNotices();
      modal.querySelectorAll('input').forEach(i => i.value = '');
      modal.querySelector('textarea').value = '';
    } else {
      const data = await response.json();
      alert(data.message || 'Failed to publish notice');
    }
  } catch (error) {
    console.error('Error adding notice:', error);
    alert('Server connection failed');
  } finally {
    publishBtn.disabled = false;
    publishBtn.textContent = 'Publish';
  }
}

function exportPaymentsToExcel() {
  const table = document.getElementById('paymentTable');
  if (!table) return;

  let csvContent = "\uFEFF"; // BOM for Excel UTF-8

  const headers = [];
  const ths = table.querySelectorAll('thead th');
  ths.forEach(th => headers.push(`"${th.innerText}"`));
  csvContent += headers.join(",") + "\n";

  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    if (row.style.display !== 'none') {
      const rowData = [];
      const cells = row.querySelectorAll('td');
      cells.forEach(cell => {
        let text = cell.innerText.replace(/"/g, '""').replace(/\n/g, ' ').trim();
        rowData.push(`"${text}"`);
      });
      csvContent += rowData.join(",") + "\n";
    }
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Payments_Report_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==================== PAYMENT MANAGEMENT ====================
let allPayments = [];

async function fetchPayments() {
  const tableBody = document.querySelector('#paymentTable tbody');
  if (!tableBody) return;

  try {
    const response = await fetch(`${API_URL}/payments`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const payments = await response.json();

    if (response.ok) {
      tableBody.innerHTML = '';
      allPayments = payments;
      let totalCollected = 0;
      let totalPending = 0;

      payments.forEach((payment, index) => {
        const amt = parseFloat(payment.amount) || 0;
        if (payment.status.toLowerCase() === 'paid') totalCollected += amt;
        else totalPending += amt;

        const date = payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending';
        const isPending = payment.status.toLowerCase() === 'pending' || payment.status.toLowerCase() === 'overdue';
        const actionHtml = isPending
          ? `<button class="btn btn-sm btn-outline" onclick="printDocument(${payment.id}, 'invoice')" style="margin-right:5px;color:var(--primary);border-color:var(--primary)"><i class="fas fa-print"></i> Invoice</button>
             <button class="btn btn-sm btn-primary admin-only" onclick="markAsPaid(${payment.id})"><i class="fas fa-check"></i> Paid</button>`
          : `<button class="btn btn-sm btn-outline" onclick="printDocument(${payment.id}, 'receipt')" style="color:var(--success);border-color:var(--success)"><i class="fas fa-print"></i> Receipt</button>`;

        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${payment.member_name}</td>
            <td>${payment.bungalow_no}</td>
            <td>₹${payment.amount}</td>
            <td>${date}</td>
            <td>${payment.month || '-'}</td>
            <td>${payment.payment_method || '-'}</td>
            <td><span class="status ${payment.status.toLowerCase()}">${payment.status}</span></td>
            <td>${actionHtml}</td>
          </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
      });

      // Update stats if elements exist
      const collectedEl = document.getElementById('statTotalCollected');
      const pendingEl = document.getElementById('statTotalPending');
      if (collectedEl) collectedEl.textContent = `₹${totalCollected.toLocaleString()}`;
      if (pendingEl) pendingEl.textContent = `₹${totalPending.toLocaleString()}`;
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
  }
}

async function populatePaymentMemberDropdown() {
  const dropdown = document.getElementById('paymentMemberId');
  if (!dropdown) return;

  try {
    const response = await fetch(`${API_URL}/members`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const members = await response.json();

    if (response.ok) {
      dropdown.innerHTML = '<option value="">Select Member...</option>';
      members.forEach(m => {
        const opt = `<option value="${m.id}">${m.name} (${m.bungalow_no})</option>`;
        dropdown.insertAdjacentHTML('beforeend', opt);
      });
    }
  } catch (error) {
    console.error('Error populating payment member dropdown:', error);
  }
}

async function addPayment() {
  const modal = document.getElementById('addPaymentModal');
  const member_id = document.getElementById('paymentMemberId').value;
  const amount = document.getElementById('paymentAmount').value;
  const type = document.getElementById('paymentType').value;
  const month = document.getElementById('paymentMonth').value;
  const payment_date = document.getElementById('paymentDate').value;
  const payment_method = document.getElementById('paymentMethod').value;
  const status = 'Paid';
  const submitBtn = modal.querySelector('.modal-footer .btn-primary');

  if (!member_id || !amount) {
    alert('Please select a member and enter amount');
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const response = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ member_id, amount, status, type, payment_date, month, payment_method })
    });

    if (response.ok) {
      closeModal('addPaymentModal');
      fetchPayments();
      modal.querySelectorAll('input').forEach(i => i.value = '');
    } else {
      const data = await response.json();
      alert(data.message || 'Failed to save payment');
    }
  } catch (error) {
    console.error('Error adding payment:', error);
    alert('Server connection failed');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Payment';
  }
}

async function generateMonthlyDues() {
  const amount = prompt('Enter maintenance amount for this month:', '400');
  if (!amount) return;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = months[new Date().getMonth()];
  const month = prompt('Enter month for the dues (e.g. May):', currentMonth);
  if (!month) return;

  if (!confirm(`Are you sure you want to generate dues of ₹${amount} for ${month} for all active members?`)) return;

  try {
    const response = await fetch(`${API_URL}/payments/generate-dues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ amount, month, year: new Date().getFullYear() })
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      fetchPayments();
    } else {
      alert(data.message || 'Failed to generate dues');
    }
  } catch (error) {
    console.error('Error generating dues:', error);
    alert('Server connection failed');
  }
}

async function markAsPaid(id) {
  if (!confirm('Mark this invoice as Paid?')) return;
  const method = prompt('Enter payment method (e.g. Cash, UPI):', 'UPI');
  if (!method) return;

  try {
    const response = await fetch(`${API_URL}/payments/${id}/mark-paid`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ payment_method: method })
    });
    if (response.ok) {
      fetchPayments();
    } else {
      const data = await response.json();
      alert(data.message || 'Failed to mark as paid');
    }
  } catch (error) {
    console.error('Error marking as paid:', error);
    alert('Server connection failed');
  }
}

function printDocument(id, type) {
  const payment = allPayments.find(p => p.id === id);
  if (!payment) return;

  const societyName = "Ananda LIG-EWS Apartment";
  const title = type === 'invoice' ? 'INVOICE' : 'PAYMENT RECEIPT';
  const docDate = type === 'invoice' ? new Date().toLocaleDateString('en-GB') : new Date(payment.payment_date).toLocaleDateString('en-GB');

  const printWindow = window.open('', '_blank');

  const html = `
    <html>
      <head>
        <title>${title} - ${payment.member_name}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #4f46e5; }
          .header p { margin: 5px 0 0; color: #666; }
          .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; letter-spacing: 2px; }
          .details-table { width: 100%; margin-bottom: 40px; border-collapse: collapse; }
          .details-table td { padding: 8px; vertical-align: top; }
          .item-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          .item-table th, .item-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .item-table th { background-color: #f8fafc; color: #333; }
          .total-row { font-weight: bold; font-size: 18px; }
          .footer { text-align: center; margin-top: 50px; color: #666; font-size: 14px; }
          .stamp { display: inline-block; border: 2px solid ${type === 'receipt' ? '#10b981' : '#f59e0b'}; color: ${type === 'receipt' ? '#10b981' : '#f59e0b'}; padding: 10px 20px; font-weight: bold; font-size: 20px; transform: rotate(-5deg); margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${societyName}</h1>
          <p>Bijalpur Indore 452012 | Contact: 9685324380</p>
        </div>
        
        <div class="title">${title}</div>
        
        <table class="details-table">
          <tr>
            <td>
              <strong>To:</strong><br>
              ${payment.member_name}<br>
              Flat No: ${payment.bungalow_no}
            </td>
            <td style="text-align: right;">
              <strong>${type === 'invoice' ? 'Invoice No:' : 'Receipt No:'}</strong> ${type === 'invoice' ? 'INV' : 'REC'}-${payment.id.toString().padStart(5, '0')}<br>
              <strong>Date:</strong> ${docDate}<br>
              <strong>Status:</strong> ${payment.status}
            </td>
          </tr>
        </table>
        
        <table class="item-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Month</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${payment.type || 'Maintenance'}</td>
              <td>${payment.month || '-'}</td>
              <td>₹${payment.amount}</td>
            </tr>
            <tr class="total-row">
              <td colspan="2" style="text-align: right;">Total Amount:</td>
              <td>₹${payment.amount}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="text-align: center;">
          <div class="stamp">${payment.status.toUpperCase()}</div>
        </div>
        
        ${type === 'receipt' ? `<p style="margin-top:40px;"><strong>Payment Method:</strong> ${payment.payment_method || 'Cash'}</p>` : ''}
        
        <div class="footer">
          <p>Thank you for your cooperation!</p>
          <p>This is a computer-generated document and does not require a physical signature.</p>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// ==================== EXPENSE MANAGEMENT ====================
async function fetchExpenses() {
  const tableBody = document.querySelector('#expenseTable tbody');
  if (!tableBody) return;

  try {
    const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
    const [eRes, sRes] = await Promise.all([
      fetch(`${API_URL}/expenses`, { headers: authHeader }),
      fetch(`${API_URL}/settings`, { headers: authHeader })
    ]);
    const expenses = await eRes.json();
    const settings = await sRes.json();
    const openingBalance = parseFloat(settings.opening_balance) || 0;

    if (eRes.ok) {
      tableBody.innerHTML = '';
      let totalExp = 0;
      expenses.forEach((exp, index) => {
        const amt = parseFloat(exp.amount) || 0;
        totalExp += amt;
        const date = new Date(exp.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${exp.title}</td>
            <td>${exp.category || 'Misc'}</td>
            <td>₹${amt.toLocaleString()}</td>
            <td>${date}</td>
            <td>${exp.month}</td>
            <td>
              <button class="icon-btn" onclick="deleteExpense(${exp.id})" style="color:var(--danger)"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
      });

      // Update Stats
      const expEl = document.getElementById('statTotalExpenses');
      const openEl = document.getElementById('statOpeningBalance');
      const savingsEl = document.getElementById('statTotalSavings');

      // Total Collected (for Net Savings calculation)
      const pRes = await fetch(`${API_URL}/payments`, { headers: authHeader });
      const payments = await pRes.json();
      const totalCollected = payments.filter(p => p.status.toLowerCase() === 'paid').reduce((sum, p) => sum + parseFloat(p.amount), 0);

      if (expEl) expEl.textContent = `₹${totalExp.toLocaleString()}`;
      if (openEl) openEl.textContent = `₹${openingBalance.toLocaleString()}`;
      if (savingsEl) {
        const net = openingBalance + totalCollected - totalExp;
        savingsEl.textContent = `₹${net.toLocaleString()}`;
      }
    }
  } catch (error) {
    console.error('Error fetching expenses:', error);
  }
}

async function addExpense() {
  const title = document.getElementById('expenseTitle').value;
  const amount = document.getElementById('expenseAmount').value;
  const expense_date = document.getElementById('expenseDate').value;
  const month = document.getElementById('expenseMonth').value;

  if (!title || !amount || !expense_date) {
    alert('Please fill all required fields');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ title, amount, expense_date, month, category: title })
    });

    if (response.ok) {
      closeModal('addExpenseModal');
      fetchExpenses();
      document.getElementById('expenseTitle').value = '';
      document.getElementById('expenseAmount').value = '';
    } else {
      alert('Failed to save expense');
    }
  } catch (error) {
    console.error('Error adding expense:', error);
  }
}

async function deleteExpense(id) {
  if (!confirm('Delete this expense record?')) return;
  try {
    const response = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) fetchExpenses();
  } catch (error) {
    console.error('Error deleting expense:', error);
  }
}

// ==================== SETTINGS MANAGEMENT ====================
async function fetchSettings() {
  const openBalanceInput = document.getElementById('openingBalanceInput');
  const dueDayInput = document.getElementById('dueDayInput');
  if (!openBalanceInput) return;

  try {
    const response = await fetch(`${API_URL}/settings`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const settings = await response.json();
    if (response.ok) {
      openBalanceInput.value = settings.opening_balance;
      if (dueDayInput) dueDayInput.value = settings.due_day;
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
  }
}

async function updateSettings() {
  const opening_balance = document.getElementById('openingBalanceInput').value;
  const due_day = document.getElementById('dueDayInput')?.value || 10;
  try {
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ opening_balance, due_day, society_name: 'Aananda Society' })
    });
    if (response.ok) alert('Settings updated successfully');
  } catch (error) {
    console.error('Error updating settings:', error);
  }
}

// Init on load
window.addEventListener('DOMContentLoaded', () => {
  fetchNotifications(); // Initialize notifications on all pages
  if (document.getElementById('statTotalMembers')) fetchDashboardStats();
  if (document.getElementById('paymentChart')) initDashboardCharts();
  if (document.getElementById('monthlyRevenue')) initReportCharts();
  if (document.getElementById('memberTable')) fetchMembers();
  if (document.getElementById('visitorTable')) fetchVisitors();
  if (document.getElementById('expenseTable')) fetchExpenses();
  if (document.getElementById('openingBalanceInput')) fetchSettings();
  if (document.getElementById('complaintTable')) {
    fetchComplaints();
    populateMemberDropdown();
  }
  if (document.getElementById('paymentTable')) {
    fetchPayments();
    populatePaymentMemberDropdown();
  }
  if (document.querySelector('.notices-grid')) fetchNotices();

  // Update dynamic UI elements
  const userName = localStorage.getItem('user');
  if (userName) {
    const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
    document.querySelectorAll('.profile-btn .name').forEach(el => {
      el.textContent = formattedName;
    });
    document.querySelectorAll('.profile-btn .avatar').forEach(el => {
      el.textContent = userName.charAt(0).toUpperCase();
    });
    // Update welcome message if it exists
    document.querySelectorAll('h1').forEach(h1 => {
      if (h1.textContent.includes('Welcome back')) {
        h1.innerHTML = `Welcome back, ${formattedName} 👋`;
      }
    });

    // Update Settings page profile fields if they exist
    const settingsName = document.querySelector('.card-body input[value*="Admin"]');
    if (settingsName) settingsName.value = formattedName;
    const settingsEmail = document.querySelector('.card-body input[type="email"][value*="admin"]');
    if (settingsEmail) settingsEmail.value = `${userName.toLowerCase()}@aanandapremium.com`;
    const settingsRole = document.querySelector('.card-body input[value*="Admin"][disabled]');
    if (settingsRole) settingsRole.value = role.charAt(0).toUpperCase() + role.slice(1);
  }

  // Bind buttons
  const addMemberBtn = document.querySelector('#addMemberModal .btn-primary');
  if (addMemberBtn) addMemberBtn.onclick = addMember;

  const addVisitorBtn = document.querySelector('#addVisitorModal .btn-primary');
  if (addVisitorBtn) addVisitorBtn.onclick = addVisitor;

  const addComplaintBtn = document.querySelector('#addComplaintModal .btn-primary');
  if (addComplaintBtn) addComplaintBtn.onclick = addComplaint;

  const addNoticeBtn = document.querySelector('#addNoticeModal .btn-primary');
  if (addNoticeBtn) addNoticeBtn.onclick = addNotice;

  const addPaymentBtn = document.querySelector('#addPaymentModal .btn-primary');
  if (addPaymentBtn) addPaymentBtn.onclick = addPayment;
});

// ==================== COMMUNITY CHAT ====================
function injectChat() {
  const chatHTML = `
    <button class="chat-toggle" id="chatToggle" title="Community Chat"><i class="fas fa-comments"></i></button>
    <div class="chat-widget" id="chatWidget">
      <div class="chat-header"><span>Community Chat</span><button onclick="toggleChat()" style="background:none;border:none;color:#fff;cursor:pointer"><i class="fas fa-times"></i></button></div>
      <div class="chat-body" id="chatBody"></div>
      <div class="chat-footer">
        <input type="text" id="chatInput" placeholder="Type a message...">
        <button class="btn btn-primary btn-sm" onclick="sendChatMessage()" style="padding:8px 12px"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', chatHTML);
  document.getElementById('chatToggle').onclick = toggleChat;
  document.getElementById('chatInput').onkeypress = (e) => { if (e.key === 'Enter') sendChatMessage(); };

  // Start polling
  setInterval(fetchChatMessages, 5000);
}

function toggleChat() {
  const widget = document.getElementById('chatWidget');
  widget.classList.toggle('open');
  if (widget.classList.contains('open')) {
    fetchChatMessages();
    setTimeout(() => {
      const body = document.getElementById('chatBody');
      body.scrollTop = body.scrollHeight;
    }, 300);
  }
}

async function fetchChatMessages() {
  const body = document.getElementById('chatBody');
  if (!body || (!document.getElementById('chatWidget').classList.contains('open') && body.innerHTML !== '')) return;

  try {
    const response = await fetch(`${API_URL}/chat`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const messages = await response.json();
    const currentUser = localStorage.getItem('user');

    let html = '';
    messages.forEach(msg => {
      const isSent = msg.sender_name === currentUser;
      const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      html += `
        <div class="chat-msg ${isSent ? 'sent' : 'received'}">
          <span class="sender">${msg.sender_name} (${msg.sender_role})</span>
          ${msg.message}
          <span class="time">${time}</span>
        </div>
      `;
    });

    const wasAtBottom = body.scrollHeight - body.scrollTop <= body.clientHeight + 50;
    body.innerHTML = html;
    if (wasAtBottom) body.scrollTop = body.scrollHeight;
  } catch (err) { console.error('Chat fetch error:', err); }
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  try {
    await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        sender_name: localStorage.getItem('user'),
        sender_role: localStorage.getItem('role'),
        message
      })
    });
    input.value = '';
    fetchChatMessages();
  } catch (err) { console.error('Chat send error:', err); }
}

// Update name in profile and welcome header
const storedUser = localStorage.getItem('user');
if (storedUser) {
  const userNameDisplays = document.querySelectorAll('.profile-btn .name');
  userNameDisplays.forEach(el => el.textContent = storedUser);

  const avatars = document.querySelectorAll('.profile-btn .avatar');
  avatars.forEach(el => el.textContent = storedUser.charAt(0).toUpperCase());

  const welcomeHeader = document.querySelector('.content-header h1');
  if (welcomeHeader && welcomeHeader.textContent.includes('Welcome back')) {
    welcomeHeader.textContent = `Welcome back, ${storedUser} 👋`;
  }
}

// Role-based UI restriction
const role = localStorage.getItem('role');
if (role === 'member') {
  // Hide Admin-only items from sidebar
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');

  // Protect Settings page from manual entry
  if (window.location.pathname.includes('settings.html')) {
    window.location.href = 'index.html';
  }
}

// Close sidebar on mobile when clicking outside
document.addEventListener('click', e => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggleSidebar');
  if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
    if (!sidebar.contains(e.target) && toggleBtn && !toggleBtn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  }
});

// Initialize Chat
injectChat();

// ==================== SETTINGS ====================
async function loadSettings() {
  if (!document.getElementById('openingBalanceInput')) return;
  try {
    const response = await fetch(`${API_URL}/settings`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const settings = await response.json();
    document.getElementById('openingBalanceInput').value = settings.opening_balance || 0;
    document.getElementById('dueDayInput').value = settings.due_day || 10;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function updateSettings() {
  const opening_balance = document.getElementById('openingBalanceInput').value;
  const due_day = document.getElementById('dueDayInput').value;
  const btn = document.querySelector('button[onclick="updateSettings()"]');

  try {
    if (btn) { btn.textContent = 'Saving...'; btn.disabled = true; }

    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ opening_balance, due_day, society_name: 'Aananda Society' })
    });

    if (response.ok) {
      alert('Settings updated successfully!');
    } else {
      alert('Failed to update settings');
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    alert('Server connection failed!');
  } finally {
    if (btn) { btn.textContent = 'Save Settings'; btn.disabled = false; }
  }
}

if (window.location.pathname.includes('settings.html')) {
  loadSettings();
}
