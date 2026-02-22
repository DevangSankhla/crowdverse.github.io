// ─────────────────────────────────────────────────────────────────────
// admin.js — Admin Panel Logic
// ─────────────────────────────────────────────────────────────────────

// ── Admin Configuration ───────────────────────────────────────────────
const ADMIN_CREDENTIALS = {
  email: 'founder@crowdverse.in',
  password: 'Admin@1234'
};

const ADMIN_UIDS = []; // Will be populated with admin user UIDs after first login

// ── Admin State ───────────────────────────────────────────────────────
const AdminState = {
  currentAdmin: null,
  users: [],
  markets: [],
  tokenTransactions: [],
  currentFilter: 'pending',
  selectedMarketForRejection: null
};

// ── Initialize Admin Panel ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAdminSession();
});

// ── Admin Authentication ─────────────────────────────────────────────
async function handleAdminLogin() {
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  const errorEl = document.getElementById('admin-error');
  
  // Basic validation
  if (!email || !password) {
    showAdminError('Please enter both email and password.');
    return;
  }
  
  // Check against hardcoded admin credentials
  if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
    showAdminError('Invalid admin credentials.');
    return;
  }
  
  // Attempt Firebase login (or create session)
  try {
    if (!demoMode && auth) {
      // Try to sign in with Firebase
      try {
        const result = await auth.signInWithEmailAndPassword(email, password);
        AdminState.currentAdmin = result.user;
      } catch (firebaseError) {
        // If user doesn't exist in Firebase, create a session-based login
        console.log('Using session-based admin login');
        AdminState.currentAdmin = {
          uid: 'admin_' + Date.now(),
          email: email,
          displayName: 'Admin'
        };
      }
    } else {
      // Demo mode - create session
      AdminState.currentAdmin = {
        uid: 'admin_demo',
        email: email,
        displayName: 'Admin'
      };
    }
    
    // Save session
    sessionStorage.setItem('adminSession', JSON.stringify({
      email: email,
      timestamp: Date.now()
    }));
    
    // Show dashboard
    showAdminDashboard();
    showAdminToast('Welcome to Admin Panel', 'green');
    
  } catch (e) {
    showAdminError('Login failed. Please try again.');
    console.error('Admin login error:', e);
  }
}

function handleAdminLogout() {
  // Clear session
  sessionStorage.removeItem('adminSession');
  AdminState.currentAdmin = null;
  
  // Sign out from Firebase if connected
  if (!demoMode && auth) {
    auth.signOut().catch(() => {});
  }
  
  // Show login screen
  document.getElementById('admin-login-screen').style.display = 'flex';
  document.getElementById('admin-dashboard').classList.add('hidden');
  
  // Clear password field
  document.getElementById('admin-password').value = '';
}

function checkAdminSession() {
  const session = sessionStorage.getItem('adminSession');
  if (session) {
    const sessionData = JSON.parse(session);
    // Check if session is not too old (24 hours)
    if (Date.now() - sessionData.timestamp < 24 * 60 * 60 * 1000) {
      AdminState.currentAdmin = {
        email: sessionData.email,
        displayName: 'Admin'
      };
      showAdminDashboard();
    } else {
      sessionStorage.removeItem('adminSession');
    }
  }
}

function showAdminError(msg) {
  const errorEl = document.getElementById('admin-error');
  errorEl.textContent = msg;
  errorEl.style.display = 'block';
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

function showAdminDashboard() {
  document.getElementById('admin-login-screen').style.display = 'none';
  document.getElementById('admin-dashboard').classList.remove('hidden');
  document.getElementById('admin-user-email').textContent = AdminState.currentAdmin.email;
  
  // Load all data
  loadAllAdminData();
}

// ── Load Admin Data ──────────────────────────────────────────────────
async function loadAllAdminData() {
  await Promise.all([
    loadUsers(),
    loadMarkets(),
    loadTokenTransactions()
  ]);
  
  updateOverviewStats();
  renderTokensTab();
  renderAccountsTab();
  renderMarketsTab();
}

// ── Tab Switching ────────────────────────────────────────────────────
function switchAdminTab(tabName) {
  // Update nav tabs
  document.querySelectorAll('.admin-nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  // Update tab content
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.toggle('active', tab.id === `tab-${tabName}`);
  });
  
  // Refresh data for the tab
  if (tabName === 'overview') updateOverviewStats();
  if (tabName === 'tokens') renderTokensTab();
  if (tabName === 'accounts') renderAccountsTab();
  if (tabName === 'markets') renderMarketsTab();
}

// ── Overview Tab ─────────────────────────────────────────────────────
function updateOverviewStats() {
  const totalUsers = AdminState.users.length || 1; // At least 1 for demo
  const totalTokens = AdminState.users.reduce((sum, u) => sum + (u.tokens || 1000), 1000);
  const liveMarkets = [...SAMPLE_MARKETS, ...AdminState.markets.filter(m => m.status === 'live')].length;
  const pendingMarkets = AdminState.markets.filter(m => m.status === 'pending').length;
  
  document.getElementById('overview-total-users').textContent = totalUsers.toLocaleString();
  document.getElementById('overview-total-tokens').textContent = totalTokens.toLocaleString();
  document.getElementById('overview-live-markets').textContent = liveMarkets.toLocaleString();
  document.getElementById('overview-pending-markets').textContent = pendingMarkets.toLocaleString();
  document.getElementById('pending-markets-badge').textContent = pendingMarkets;
  
  // Render recent activity
  renderRecentActivity();
}

function renderRecentActivity() {
  const activityList = document.getElementById('recent-activity-list');
  
  // Combine recent activities
  const activities = [];
  
  // Add user registrations (mock for demo)
  AdminState.users.slice(0, 3).forEach(user => {
    activities.push({
      icon: '👤',
      text: `New user registered: ${user.displayName || user.email}`,
      time: formatTimeAgo(user.createdAt || Date.now() - 86400000)
    });
  });
  
  // Add pending markets
  AdminState.markets.filter(m => m.status === 'pending').slice(0, 3).forEach(market => {
    activities.push({
      icon: '⏳',
      text: `Market pending review: "${market.question.substring(0, 40)}..."`,
      time: formatTimeAgo(market.createdAt || Date.now())
    });
  });
  
  // Sort by time (most recent first)
  activities.sort((a, b) => a.time.localeCompare(b.time));
  
  if (activities.length === 0) {
    activityList.innerHTML = '<p class="admin-empty">No recent activity</p>';
    return;
  }
  
  activityList.innerHTML = activities.map(a => `
    <div class="admin-activity-item">
      <span class="admin-activity-icon">${a.icon}</span>
      <span class="admin-activity-text">${escHtml(a.text)}</span>
      <span class="admin-activity-time">${escHtml(a.time)}</span>
    </div>
  `).join('');
}

// ── Tokens Tab ───────────────────────────────────────────────────────
function renderTokensTab() {
  const users = AdminState.users;
  const markets = [...SAMPLE_MARKETS, ...AdminState.markets];
  const transactions = AdminState.tokenTransactions;
  
  // Calculate stats
  const tokensCreated = users.length * 1000 + (users.length * 200); // signup + weekly
  const tokensInWallets = users.reduce((sum, u) => sum + (u.tokens || 1000), 1000);
  const tokensInMarkets = markets.reduce((sum, m) => sum + (m.tokens || 0), 0);
  const tokensRefunded = transactions
    .filter(t => t.type === 'refund')
    .reduce((sum, t) => sum + t.amount, 0);
  
  document.getElementById('tokens-created').textContent = tokensCreated.toLocaleString();
  document.getElementById('tokens-in-wallets').textContent = tokensInWallets.toLocaleString();
  document.getElementById('tokens-in-markets').textContent = tokensInMarkets.toLocaleString();
  document.getElementById('tokens-refunded').textContent = tokensRefunded.toLocaleString();
  
  // Render transactions table
  const tbody = document.getElementById('tokens-table-body');
  
  if (transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="admin-empty">No transactions yet</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = transactions.slice(0, 20).map(t => `
    <tr>
      <td>
        <div class="admin-user-cell">
          <div class="admin-user-avatar">👤</div>
          <div class="admin-user-info">
            <span class="admin-user-name">${escHtml(t.userName || 'User')}</span>
          </div>
        </div>
      </td>
      <td>${formatTransactionType(t.type)}</td>
      <td>
        <span class="admin-tokens-badge">
          ${t.amount > 0 ? '+' : ''}${t.amount} tokens
        </span>
      </td>
      <td>${escHtml(t.details || '-')}</td>
      <td>${formatTimeAgo(t.timestamp)}</td>
    </tr>
  `).join('');
}

function formatTransactionType(type) {
  const types = {
    signup: '<span style="color:var(--green)">🎁 Signup Bonus</span>',
    weekly: '<span style="color:var(--green)">🔄 Weekly Bonus</span>',
    market_creation: '<span style="color:var(--yellow)">📈 Market Creation</span>',
    prediction: '<span style="color:var(--yellow)">🎯 Prediction</span>',
    win: '<span style="color:var(--green)">🏆 Win</span>',
    loss: '<span style="color:var(--red)">❌ Loss</span>',
    refund: '<span style="color:var(--green)">↩️ Refund</span>'
  };
  return types[type] || type;
}

// ── Accounts Tab ─────────────────────────────────────────────────────
function renderAccountsTab() {
  const tbody = document.getElementById('accounts-table-body');
  const users = AdminState.users;
  
  if (users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="admin-empty">No users found</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>
        <div class="admin-user-cell">
          <div class="admin-user-avatar">👤</div>
          <div class="admin-user-info">
            <span class="admin-user-name">${escHtml(u.displayName || 'Anonymous')}</span>
            <span class="admin-user-id">${u.uid?.substring(0, 8) || '—'}...</span>
          </div>
        </div>
      </td>
      <td>${escHtml(u.email || '—')}</td>
      <td>
        <span class="admin-tokens-badge">${u.tokens || 1000} tokens</span>
      </td>
      <td>${(u.predictions || []).length}</td>
      <td>${formatDate(u.createdAt)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="viewUserDetails('${u.uid}')">View</button>
      </td>
    </tr>
  `).join('');
}

function searchAccounts() {
  const query = document.getElementById('accounts-search').value.toLowerCase();
  const rows = document.querySelectorAll('#accounts-table-body tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

function viewUserDetails(uid) {
  const user = AdminState.users.find(u => u.uid === uid);
  if (!user) return;
  
  alert(`User Details:\n\nName: ${user.displayName || 'Anonymous'}\nEmail: ${user.email || '—'}\nTokens: ${user.tokens || 1000}\nPredictions: ${(user.predictions || []).length}`);
}

// ── Markets Review Tab ───────────────────────────────────────────────
function filterMarkets(filter) {
  AdminState.currentFilter = filter;
  
  // Update filter buttons
  document.querySelectorAll('.admin-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  
  renderMarketsTab();
}

function renderMarketsTab() {
  const list = document.getElementById('markets-review-list');
  const allMarkets = [...SAMPLE_MARKETS.map(m => ({...m, isSample: true})), ...AdminState.markets];
  
  let filteredMarkets = allMarkets;
  
  if (AdminState.currentFilter !== 'all') {
    filteredMarkets = allMarkets.filter(m => {
      if (m.isSample) return AdminState.currentFilter === 'approved' || AdminState.currentFilter === 'live';
      return m.status === AdminState.currentFilter;
    });
  }
  
  // Sort: pending first, then by date
  filteredMarkets.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  
  if (filteredMarkets.length === 0) {
    list.innerHTML = `
      <div class="admin-empty" style="padding: 3rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📭</div>
        <p>No ${AdminState.currentFilter} markets found</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = filteredMarkets.map(m => renderMarketCard(m)).join('');
}

function renderMarketCard(market) {
  const status = market.status || 'live';
  const isSample = market.isSample || false;
  const creator = isSample ? 'CrowdVerse Team' : (market.createdByName || market.createdBy || 'Unknown');
  
  let actions = '';
  if (status === 'pending' && !isSample) {
    actions = `
      <button class="admin-btn-approve" onclick="approveMarket(${market.id})">✅ Approve</button>
      <button class="admin-btn-reject" onclick="openRejectModal(${market.id})">❌ Reject</button>
    `;
  } else if (status === 'approved' || status === 'live') {
    actions = `<span class="admin-status-badge approved">✅ Live on Markets Page</span>`;
  } else if (status === 'rejected') {
    actions = `<span class="admin-status-badge rejected">❌ Rejected — 100 tokens refunded</span>`;
  }
  
  return `
    <div class="admin-market-card ${status}">
      <div class="admin-market-header">
        <div>
          <div class="admin-market-title">${escHtml(market.question)}</div>
          <div class="admin-market-meta">
            <span>🏷️ ${escHtml(market.cat || 'Other')}</span>
            <span>👤 ${escHtml(creator)}</span>
            <span>📅 ${market.ends || '—'}</span>
            ${isSample ? '<span style="color:var(--green)">🌟 Official Market</span>' : `<span class="admin-status-badge ${status}">${status.toUpperCase()}</span>`}
          </div>
        </div>
      </div>
      
      <div class="admin-market-details">
        <div class="admin-market-detail">
          <span class="admin-market-detail-label">Option A (Yes)</span>
          <span class="admin-market-detail-value">${escHtml(market.optA || 'Yes')}</span>
        </div>
        <div class="admin-market-detail">
          <span class="admin-market-detail-label">Option B (No)</span>
          <span class="admin-market-detail-value">${escHtml(market.optB || 'No')}</span>
        </div>
        <div class="admin-market-detail">
          <span class="admin-market-detail-label">Initial Tokens</span>
          <span class="admin-market-detail-value">${market.tokens || 0} tokens</span>
        </div>
        <div class="admin-market-detail">
          <span class="admin-market-detail-label">Current Probability</span>
          <span class="admin-market-detail-value" style="color:var(--green)">${market.pctA || 50}% Yes</span>
        </div>
      </div>
      
      <div class="admin-market-actions">
        ${actions}
      </div>
    </div>
  `;
}

// ── Approve Market ───────────────────────────────────────────────────
async function approveMarket(marketId) {
  const marketIndex = AdminState.markets.findIndex(m => m.id === marketId);
  if (marketIndex === -1) return;
  
  const market = AdminState.markets[marketIndex];
  market.status = 'live';
  
  // Save to Firebase if connected
  if (!demoMode && db) {
    try {
      await db.collection('markets').doc(String(marketId)).update({
        status: 'live',
        approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
        approvedBy: AdminState.currentAdmin.email
      });
    } catch (e) {
      console.warn('Firebase update failed:', e);
    }
  }
  
  // Show success
  showAdminToast(`Market approved and is now live! ✅`, 'green');
  
  // Refresh
  updateOverviewStats();
  renderMarketsTab();
}

// ── Reject Market ────────────────────────────────────────────────────
function openRejectModal(marketId) {
  AdminState.selectedMarketForRejection = marketId;
  
  // Reset modal
  document.getElementById('rejection-reason').value = 'inappropriate';
  document.getElementById('custom-reason-group').style.display = 'none';
  document.getElementById('custom-rejection-reason').value = '';
  updateApologyPreview();
  
  // Show modal
  document.getElementById('rejection-modal').classList.add('active');
}

function closeRejectionModal() {
  document.getElementById('rejection-modal').classList.remove('active');
  AdminState.selectedMarketForRejection = null;
}

function toggleCustomReason() {
  const reason = document.getElementById('rejection-reason').value;
  const customGroup = document.getElementById('custom-reason-group');
  customGroup.style.display = reason === 'other' ? 'block' : 'none';
  updateApologyPreview();
}

function updateApologyPreview() {
  const reason = document.getElementById('rejection-reason').value;
  const customReason = document.getElementById('custom-rejection-reason').value;
  
  const reasons = {
    inappropriate: 'inappropriate content that violates our community guidelines',
    unclear: 'an unclear or ambiguous question that cannot be properly resolved',
    impossible: 'an outcome that cannot be objectively verified',
    duplicate: 'a duplicate of an existing market',
    spam: 'spam or low-quality content',
    other: customReason || 'the reason specified above'
  };
  
  const preview = `We're sorry, but your market could not be approved because it contains ${reasons[reason]}. Your 100 tokens have been refunded to your account. Thank you for understanding!`;
  
  document.getElementById('apology-preview').textContent = preview;
}

async function confirmRejectMarket() {
  const marketId = AdminState.selectedMarketForRejection;
  if (!marketId) return;
  
  const marketIndex = AdminState.markets.findIndex(m => m.id === marketId);
  if (marketIndex === -1) {
    closeRejectionModal();
    return;
  }
  
  const market = AdminState.markets[marketIndex];
  
  // Get rejection details
  const reasonSelect = document.getElementById('rejection-reason');
  const reason = reasonSelect.value;
  const customReason = document.getElementById('custom-rejection-reason').value;
  
  const reasonText = reason === 'other' ? customReason : reasonSelect.options[reasonSelect.selectedIndex].text;
  
  // Refund 100 tokens to creator
  const creatorUid = market.createdBy;
  if (creatorUid && creatorUid !== 'demo') {
    const userIndex = AdminState.users.findIndex(u => u.uid === creatorUid);
    if (userIndex !== -1) {
      AdminState.users[userIndex].tokens = (AdminState.users[userIndex].tokens || 1000) + 100;
      
      // Record refund transaction
      AdminState.tokenTransactions.push({
        type: 'refund',
        amount: 100,
        userId: creatorUid,
        userName: AdminState.users[userIndex].displayName || 'User',
        details: `Market rejected: "${market.question.substring(0, 30)}..."`,
        timestamp: Date.now()
      });
      
      // Save to Firebase if connected
      if (!demoMode && db) {
        try {
          await db.collection('users').doc(creatorUid).update({
            tokens: firebase.firestore.FieldValue.increment(100),
            notifications: firebase.firestore.FieldValue.arrayUnion({
              type: 'market_rejected',
              message: `Your market "${market.question}" was not approved. Reason: ${reasonText}. Your 100 tokens have been refunded.`,
              timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
          });
        } catch (e) {
          console.warn('Firebase refund failed:', e);
        }
      }
    }
  }
  
  // Update market status
  market.status = 'rejected';
  market.rejectionReason = reasonText;
  market.rejectedAt = Date.now();
  market.rejectedBy = AdminState.currentAdmin.email;
  
  // Save to Firebase if connected
  if (!demoMode && db) {
    try {
      await db.collection('markets').doc(String(marketId)).update({
        status: 'rejected',
        rejectionReason: reasonText,
        rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
        rejectedBy: AdminState.currentAdmin.email
      });
    } catch (e) {
      console.warn('Firebase update failed:', e);
    }
  }
  
  // Close modal and refresh
  closeRejectionModal();
  showAdminToast(`Market rejected. 100 tokens refunded to creator. ✅`, 'green');
  
  updateOverviewStats();
  renderTokensTab();
  renderMarketsTab();
}

// ── Load Data from Firebase/Local ────────────────────────────────────
async function loadUsers() {
  if (!demoMode && db) {
    try {
      const snapshot = await db.collection('users').get();
      AdminState.users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
    } catch (e) {
      console.warn('Failed to load users from Firebase:', e);
      loadDemoUsers();
    }
  } else {
    loadDemoUsers();
  }
}

function loadDemoUsers() {
  // Demo users for testing
  AdminState.users = [
    {
      uid: 'demo_user_1',
      email: 'arjun@example.com',
      displayName: 'Arjun_Predictor',
      tokens: 2450,
      predictions: [],
      createdAt: Date.now() - 7 * 86400000
    },
    {
      uid: 'demo_user_2',
      email: 'priya@example.com',
      displayName: 'Priya_Trader',
      tokens: 1800,
      predictions: [],
      createdAt: Date.now() - 3 * 86400000
    },
    {
      uid: 'demo_user_3',
      email: 'rahul@example.com',
      displayName: 'Rahul_Kumar',
      tokens: 950,
      predictions: [],
      createdAt: Date.now() - 1 * 86400000
    }
  ];
}

async function loadMarkets() {
  if (!demoMode && db) {
    try {
      const snapshot = await db.collection('markets').get();
      AdminState.markets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (e) {
      console.warn('Failed to load markets from Firebase:', e);
      loadDemoMarkets();
    }
  } else {
    loadDemoMarkets();
  }
}

function loadDemoMarkets() {
  // Demo pending markets for testing
  AdminState.markets = [
    {
      id: Date.now() - 100000,
      question: "Will India launch its own central bank digital currency (CBDC) by 2026?",
      cat: "📊 Economy",
      optA: "Yes",
      optB: "No",
      pctA: 50,
      tokens: 100,
      ends: "Dec 31, 2026",
      status: 'pending',
      createdBy: 'demo_user_2',
      createdByName: 'Priya_Trader',
      createdAt: Date.now() - 86400000
    },
    {
      id: Date.now() - 200000,
      question: "Will a new viral social media platform overtake Instagram in India by 2026?",
      cat: "💻 Technology",
      optA: "Yes",
      optB: "No",
      pctA: 50,
      tokens: 100,
      ends: "Dec 31, 2026",
      status: 'pending',
      createdBy: 'demo_user_3',
      createdByName: 'Rahul_Kumar',
      createdAt: Date.now() - 43200000
    }
  ];
}

async function loadTokenTransactions() {
  // In a real app, this would load from a transactions collection
  // For demo, we'll generate some sample transactions
  AdminState.tokenTransactions = [
    {
      type: 'signup',
      amount: 1000,
      userId: 'demo_user_1',
      userName: 'Arjun_Predictor',
      details: 'Welcome bonus',
      timestamp: Date.now() - 7 * 86400000
    },
    {
      type: 'market_creation',
      amount: -100,
      userId: 'demo_user_2',
      userName: 'Priya_Trader',
      details: 'Created: CBDC 2026 market',
      timestamp: Date.now() - 86400000
    },
    {
      type: 'market_creation',
      amount: -100,
      userId: 'demo_user_3',
      userName: 'Rahul_Kumar',
      details: 'Created: Social media market',
      timestamp: Date.now() - 43200000
    }
  ];
}

// ── Utilities ─────────────────────────────────────────────────────────
function formatTimeAgo(timestamp) {
  if (!timestamp) return '—';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(timestamp);
}

function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showAdminToast(message, color = 'green') {
  const toast = document.getElementById('admin-toast');
  toast.textContent = message;
  toast.style.background = color === 'red' ? 'var(--red)' : 'var(--green)';
  toast.style.color = color === 'red' ? 'var(--white)' : 'var(--black)';
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ── Listen for rejection reason changes ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const reasonSelect = document.getElementById('rejection-reason');
  const customReason = document.getElementById('custom-rejection-reason');
  
  if (reasonSelect) {
    reasonSelect.addEventListener('change', updateApologyPreview);
  }
  
  if (customReason) {
    customReason.addEventListener('input', updateApologyPreview);
  }
});
