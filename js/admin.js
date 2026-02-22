// ─────────────────────────────────────────────────────────────────────
// admin.js — Hidden admin panel: market review, accounts, token stats
// ─────────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = 'founder@crowdverse.in';

function isAdmin() {
  return !!(State.currentUser && State.currentUser.email === ADMIN_EMAIL);
}

// ── Pending markets cache (keyed by docId for safe button callbacks) ──
let _adminMarketsCache = {};

// ── Build page shell — called once on DOMContentLoaded ────────────────
function buildAdminPage() {
  const el = document.getElementById('page-admin');
  if (!el) return;

  el.innerHTML = `
    <!-- ── Auth wall ─────────────────────────────────────────────── -->
    <div id="admin-auth-wall" class="coming-soon-wrap">
      <div style="font-size:3.5rem;margin-bottom:1rem">🔐</div>
      <h2 style="font-family:var(--font-display)">Admin Access Only</h2>
      <p>This area is restricted to CrowdVerse administrators.</p>
      <button class="btn btn-primary btn-lg" onclick="openAuth()">Log In as Admin</button>
    </div>

    <!-- ── Main panel ────────────────────────────────────────────── -->
    <div id="admin-panel-content" style="display:none">

      <!-- Top bar -->
      <div style="background:rgba(255,85,85,0.07);border-bottom:1px solid rgba(255,85,85,0.2);
                  padding:0.65rem 2rem;display:flex;align-items:center;gap:0.75rem;
                  font-family:var(--font-mono);font-size:0.76rem;">
        <span style="color:#ff8888;font-weight:700;">🔴 ADMIN PANEL</span>
        <span style="color:var(--border2);">|</span>
        <span id="admin-email-label" style="color:var(--white3)">—</span>
        <span style="margin-left:auto;padding:0.2rem 0.65rem;background:rgba(255,85,85,0.12);
                     border:1px solid rgba(255,85,85,0.3);border-radius:20px;color:#ff8888;
                     font-size:0.68rem;letter-spacing:0.06em;">RESTRICTED</span>
      </div>

      <!-- Page header -->
      <div class="page-header">
        <div class="section-label" style="margin-bottom:0.5rem;color:#ff8888;">⚙️ Administration</div>
        <h1>CrowdVerse Admin Panel</h1>
        <p>Manage markets, monitor accounts, and track the token economy.</p>
      </div>

      <div style="max-width:1100px;margin:0 auto;padding:0 2rem 4rem;">

        <!-- ── Stat cards ─────────────────────────────────────────── -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
                    gap:1.25rem;margin-bottom:3rem;">

          <div style="background:var(--off-black);border:1px solid var(--border);
                      border-radius:var(--radius-md);padding:1.5rem;">
            <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);
                        text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.5rem;">
              Total Accounts
            </div>
            <div id="admin-stat-accounts"
                 style="font-family:var(--font-display);font-size:2.5rem;font-weight:800;color:var(--green);">—</div>
            <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--white3);margin-top:0.2rem;">
              registered users
            </div>
          </div>

          <div style="background:var(--off-black);border:1px solid var(--border);
                      border-radius:var(--radius-md);padding:1.5rem;">
            <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);
                        text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.5rem;">
              Tokens in Flow
            </div>
            <div id="admin-stat-tokens"
                 style="font-family:var(--font-display);font-size:2.5rem;font-weight:800;color:var(--yellow);">—</div>
            <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--white3);margin-top:0.2rem;">
              total across all wallets
            </div>
          </div>

          <div style="background:var(--off-black);border:1px solid rgba(255,215,0,0.3);
                      border-radius:var(--radius-md);padding:1.5rem;position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;right:0;width:3px;height:100%;background:var(--yellow);"></div>
            <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--yellow);
                        text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.5rem;">
              Pending Review
            </div>
            <div id="admin-stat-pending"
                 style="font-family:var(--font-display);font-size:2.5rem;font-weight:800;color:var(--yellow);">—</div>
            <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--white3);margin-top:0.2rem;">
              markets awaiting approval
            </div>
          </div>

          <div style="background:var(--off-black);border:1px solid var(--border);
                      border-radius:var(--radius-md);padding:1.5rem;">
            <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);
                        text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.5rem;">
              Total Predictions
            </div>
            <div id="admin-stat-predictions"
                 style="font-family:var(--font-display);font-size:2.5rem;font-weight:800;color:var(--white);">—</div>
            <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--white3);margin-top:0.2rem;">
              placed by all users
            </div>
          </div>

        </div>

        <!-- ── Pending markets ────────────────────────────────────── -->
        <div style="margin-bottom:3rem;">
          <div class="section-label" style="margin-bottom:1.25rem;">Markets Awaiting Review</div>
          <div id="admin-pending-list">
            <div style="text-align:center;padding:3rem;font-family:var(--font-mono);
                        font-size:0.82rem;color:var(--white3);">Loading…</div>
          </div>
        </div>

        <!-- ── Accounts table ─────────────────────────────────────── -->
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;flex-wrap:wrap;gap:1rem;">
            <div class="section-label" style="margin-bottom:0;">All Accounts</div>
            <button onclick="loadAdminData()" 
                    style="background:none;border:1px solid var(--border2);border-radius:var(--radius-sm);
                           padding:0.4rem 0.85rem;font-family:var(--font-mono);font-size:0.72rem;
                           color:var(--white3);cursor:pointer;transition:all 0.2s;"
                    onmouseover="this.style.color='var(--white)'"
                    onmouseout="this.style.color='var(--white3)'">
              ↺ Refresh
            </button>
          </div>
          <div id="admin-accounts-list">
            <div style="text-align:center;padding:3rem;font-family:var(--font-mono);
                        font-size:0.82rem;color:var(--white3);">Loading…</div>
          </div>
        </div>

      </div>
    </div>
  `;
}

// ── Called on every navigation to /admin ─────────────────────────────
async function renderAdminPage() {
  const wall    = document.getElementById('admin-auth-wall');
  const content = document.getElementById('admin-panel-content');

  if (!State.currentUser) {
    if (wall)    wall.style.display = '';
    if (content) content.style.display = 'none';
    return;
  }

  if (!isAdmin()) {
    showToast('⛔ Admin access only.', 'red');
    showPage('home');
    return;
  }

  if (wall)    wall.style.display = 'none';
  if (content) content.style.display = '';

  const emailLabel = document.getElementById('admin-email-label');
  if (emailLabel) emailLabel.textContent = State.currentUser.email;

  await loadAdminData();
}

// ── Fetch all data from Firestore ─────────────────────────────────────
async function loadAdminData() {
  if (demoMode || !db) {
    _renderAdminDemoFallback();
    return;
  }

  // Show "loading…" while we fetch
  ['admin-pending-list', 'admin-accounts-list'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div style="text-align:center;padding:3rem;font-family:var(--font-mono);font-size:0.82rem;color:var(--white3);">Loading…</div>`;
  });

  try {
    // ── Fetch users ──────────────────────────────────────────────────
    const usersSnap = await db.collection('users').get();
    const users = [];
    let totalTokens = 0;
    let totalPredictions = 0;

    usersSnap.forEach(doc => {
      const d = doc.data();
      users.push({ uid: doc.id, ...d });
      totalTokens      += (d.tokens      || 0);
      totalPredictions += (d.predictions || []).length;
    });

    // ── Fetch markets ────────────────────────────────────────────────
    const marketsSnap = await db.collection('markets').orderBy('createdAt', 'desc').get();
    const pendingMarkets = [];
    _adminMarketsCache = {};

    marketsSnap.forEach(doc => {
      const d = { docId: doc.id, ...doc.data() };
      _adminMarketsCache[doc.id] = d;
      if (d.status === 'pending') pendingMarkets.push(d);
    });

    // ── Update stat cards ────────────────────────────────────────────
    document.getElementById('admin-stat-accounts').textContent    = users.length;
    document.getElementById('admin-stat-tokens').textContent      = totalTokens.toLocaleString();
    document.getElementById('admin-stat-pending').textContent     = pendingMarkets.length;
    document.getElementById('admin-stat-predictions').textContent = totalPredictions.toLocaleString();

    _renderAdminPendingMarkets(pendingMarkets);
    _renderAdminAccounts(users);

  } catch (e) {
    console.error('Admin load error:', e);
    showToast('Failed to load admin data: ' + e.message, 'red');
  }
}

// ── Render pending market review cards ───────────────────────────────
function _renderAdminPendingMarkets(markets) {
  const el = document.getElementById('admin-pending-list');
  if (!el) return;

  if (markets.length === 0) {
    el.innerHTML = `
      <div style="text-align:center;padding:3rem;background:var(--off-black);
                  border:1px solid var(--border);border-radius:var(--radius-md);">
        <div style="font-size:2.5rem;margin-bottom:0.75rem">✅</div>
        <p style="font-family:var(--font-mono);color:var(--white3);font-size:0.85rem;">
          No markets pending review. You're all caught up!
        </p>
      </div>`;
    return;
  }

  el.innerHTML = markets.map(m => `
    <div id="admin-mkt-${m.docId}"
         style="background:var(--off-black);border:1px solid rgba(255,215,0,0.22);
                border-radius:var(--radius-md);padding:1.5rem;margin-bottom:1rem;
                transition:all 0.35s ease;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;
                  gap:1rem;flex-wrap:wrap;">

        <!-- Left: market details -->
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:0.65rem;margin-bottom:0.75rem;flex-wrap:wrap;">
            <span style="font-family:var(--font-mono);font-size:0.65rem;
                         background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);
                         color:var(--yellow);padding:0.2rem 0.55rem;border-radius:4px;
                         text-transform:uppercase;letter-spacing:0.06em;">⏳ Pending</span>
            <span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--green);">
              ${escHtml(m.cat || '🔮 Other')}
            </span>
          </div>

          <h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;
                     margin-bottom:0.6rem;line-height:1.4;">
            ${escHtml(m.question)}
          </h3>

          ${m.description
            ? `<p style="font-size:0.85rem;color:var(--white2);margin-bottom:0.75rem;line-height:1.55;">
                 ${escHtml(m.description)}
               </p>`
            : ''}

          <div style="display:flex;gap:1.5rem;flex-wrap:wrap;font-family:var(--font-mono);
                      font-size:0.72rem;color:var(--white3);">
            <span>👤 <strong style="color:var(--white2);">${escHtml(m.createdByName  || 'Unknown')}</strong></span>
            <span>📧 <strong style="color:var(--white2);">${escHtml(m.createdByEmail || '—')}</strong></span>
            <span>📅 Ends: <strong style="color:var(--white2);">${escHtml(m.ends || '—')}</strong></span>
          </div>

          <div style="margin-top:0.6rem;display:flex;gap:0.75rem;font-family:var(--font-mono);font-size:0.72rem;">
            <span style="padding:0.25rem 0.6rem;background:rgba(127,255,127,0.08);
                         border:1px solid rgba(127,255,127,0.2);border-radius:4px;color:var(--green);">
              ✔ ${escHtml(m.optA || 'Yes')}
            </span>
            <span style="padding:0.25rem 0.6rem;background:rgba(255,85,85,0.08);
                         border:1px solid rgba(255,85,85,0.2);border-radius:4px;color:#ff8888;">
              ✖ ${escHtml(m.optB || 'No')}
            </span>
          </div>
        </div>

        <!-- Right: action buttons -->
        <div style="display:flex;flex-direction:column;gap:0.6rem;flex-shrink:0;">
          <button id="approve-btn-${m.docId}"
                  onclick="approveMarket('${m.docId}')"
                  style="padding:0.7rem 1.35rem;background:var(--green);color:var(--black);
                         border:none;border-radius:var(--radius-sm);font-weight:700;
                         font-size:0.85rem;cursor:pointer;transition:all 0.2s;
                         font-family:var(--font-mono);letter-spacing:0.02em;white-space:nowrap;">
            ✅ Approve
          </button>
          <button id="reject-btn-${m.docId}"
                  onclick="rejectMarket('${m.docId}')"
                  style="padding:0.7rem 1.35rem;background:rgba(255,85,85,0.1);color:#ff8888;
                         border:1px solid rgba(255,85,85,0.3);border-radius:var(--radius-sm);
                         font-weight:700;font-size:0.85rem;cursor:pointer;transition:all 0.2s;
                         font-family:var(--font-mono);letter-spacing:0.02em;white-space:nowrap;">
            ❌ Reject
          </button>
        </div>

      </div>
    </div>
  `).join('');
}

// ── Render accounts table ─────────────────────────────────────────────
function _renderAdminAccounts(users) {
  const el = document.getElementById('admin-accounts-list');
  if (!el) return;

  if (users.length === 0) {
    el.innerHTML = `<p style="font-family:var(--font-mono);color:var(--white3);font-size:0.85rem;">
      No users found in Firestore yet.
    </p>`;
    return;
  }

  // Sort by tokens descending; push admin to bottom
  users.sort((a, b) => {
    if (a.email === ADMIN_EMAIL) return 1;
    if (b.email === ADMIN_EMAIL) return -1;
    return (b.tokens || 0) - (a.tokens || 0);
  });

  el.innerHTML = `
    <div style="background:var(--off-black);border:1px solid var(--border);
                border-radius:var(--radius-md);overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
        <thead>
          <tr style="background:var(--dark2);border-bottom:1px solid var(--border2);">
            ${['#','Display Name','Email','Token Balance','Predictions'].map(h => `
              <th style="text-align:${['Token Balance','Predictions'].includes(h) ? 'right' : 'left'};
                         padding:0.9rem 1.25rem;font-family:var(--font-mono);font-size:0.65rem;
                         color:var(--white3);text-transform:uppercase;letter-spacing:0.06em;
                         font-weight:500;">${h}</th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${users.map((u, i) => {
            const isAdminUser = u.email === ADMIN_EMAIL;
            return `
              <tr style="border-bottom:1px solid var(--border);opacity:${isAdminUser ? '0.45' : '1'};
                         cursor:default;transition:background 0.15s;"
                  onmouseover="this.style.background='var(--dark)'"
                  onmouseout="this.style.background=''">
                <td style="padding:0.9rem 1.25rem;font-family:var(--font-mono);font-size:0.72rem;
                            color:var(--white3);">${i + 1}</td>
                <td style="padding:0.9rem 1.25rem;font-weight:500;">
                  ${escHtml(u.displayName || '—')}
                  ${isAdminUser
                    ? '<span style="font-family:var(--font-mono);font-size:0.6rem;background:rgba(255,85,85,0.15);color:#ff8888;padding:0.15rem 0.45rem;border-radius:3px;margin-left:7px;">ADMIN</span>'
                    : ''}
                </td>
                <td style="padding:0.9rem 1.25rem;font-family:var(--font-mono);font-size:0.78rem;
                            color:var(--white2);">${escHtml(u.email || '—')}</td>
                <td style="padding:0.9rem 1.25rem;font-family:var(--font-mono);font-size:0.85rem;
                            color:var(--green);font-weight:700;text-align:right;">
                  ${(u.tokens || 0).toLocaleString()}
                </td>
                <td style="padding:0.9rem 1.25rem;font-family:var(--font-mono);font-size:0.78rem;
                            color:var(--white3);text-align:right;">
                  ${(u.predictions || []).length}
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

// ── Approve a market ──────────────────────────────────────────────────
async function approveMarket(docId) {
  if (!db) return;

  const approveBtn = document.getElementById('approve-btn-' + docId);
  const rejectBtn  = document.getElementById('reject-btn-'  + docId);
  if (approveBtn) { approveBtn.textContent = 'Approving…'; approveBtn.disabled = true; }
  if (rejectBtn)  rejectBtn.disabled = true;

  try {
    await db.collection('markets').doc(docId).update({
      status:     'live',
      approvedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Animate card out
    const card = document.getElementById('admin-mkt-' + docId);
    if (card) {
      card.style.opacity   = '0';
      card.style.transform = 'translateX(30px)';
      setTimeout(() => card.remove(), 380);
    }

    // Decrement pending count
    const el = document.getElementById('admin-stat-pending');
    if (el) el.textContent = Math.max(0, parseInt(el.textContent || '0') - 1);

    showToast('✅ Market approved — it is now live!', 'green');
  } catch (e) {
    if (approveBtn) { approveBtn.textContent = '✅ Approve'; approveBtn.disabled = false; }
    if (rejectBtn)  rejectBtn.disabled = false;
    showToast('Approve failed: ' + e.message, 'red');
  }
}

// ── Reject a market and refund user's 100 tokens ─────────────────────
async function rejectMarket(docId) {
  if (!db) return;

  const m = _adminMarketsCache[docId];
  if (!m) { showToast('Market data not found', 'red'); return; }

  const approveBtn = document.getElementById('approve-btn-' + docId);
  const rejectBtn  = document.getElementById('reject-btn-'  + docId);
  if (rejectBtn)  { rejectBtn.textContent = 'Rejecting…'; rejectBtn.disabled = true; }
  if (approveBtn) approveBtn.disabled = true;

  try {
    const batch = db.batch();

    // Mark market as rejected
    batch.update(db.collection('markets').doc(docId), {
      status:     'rejected',
      rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Refund 100 tokens + add notification to user
    if (m.createdByUid) {
      const shortQ = m.question.length > 70
        ? m.question.substring(0, 70) + '…'
        : m.question;

      batch.update(db.collection('users').doc(m.createdByUid), {
        tokens: firebase.firestore.FieldValue.increment(100),
        notifications: firebase.firestore.FieldValue.arrayUnion({
          type:         'market_rejected',
          message:      `We're sorry — your market "${shortQ}" wasn't approved this time. Your 100 tokens have been fully refunded. We appreciate your contribution and hope you keep predicting! 🙏`,
          refundAmount: 100,
          marketId:     docId,
          createdAt:    new Date().toISOString(),
          read:         false
        })
      });
    }

    await batch.commit();

    // Animate card out
    const card = document.getElementById('admin-mkt-' + docId);
    if (card) {
      card.style.opacity   = '0';
      card.style.transform = 'translateX(-30px)';
      setTimeout(() => card.remove(), 380);
    }

    const el = document.getElementById('admin-stat-pending');
    if (el) el.textContent = Math.max(0, parseInt(el.textContent || '0') - 1);

    showToast('❌ Market rejected. 100 tokens refunded to user.', 'yellow');
  } catch (e) {
    if (rejectBtn)  { rejectBtn.textContent = '❌ Reject'; rejectBtn.disabled = false; }
    if (approveBtn) approveBtn.disabled = false;
    showToast('Reject failed: ' + e.message, 'red');
  }
}

// ── Demo mode fallback ────────────────────────────────────────────────
function _renderAdminDemoFallback() {
  document.getElementById('admin-stat-accounts').textContent    = 'N/A';
  document.getElementById('admin-stat-tokens').textContent      = 'N/A';
  document.getElementById('admin-stat-pending').textContent     = 'N/A';
  document.getElementById('admin-stat-predictions').textContent = 'N/A';

  const msg = `
    <div style="text-align:center;padding:2.5rem;background:rgba(255,215,0,0.04);
                border:1px solid rgba(255,215,0,0.2);border-radius:var(--radius-md);">
      <div style="font-size:2rem;margin-bottom:0.75rem">⚠️</div>
      <p style="font-family:var(--font-mono);color:var(--yellow);font-size:0.85rem;
                font-weight:700;margin-bottom:0.4rem;">Demo Mode — Firebase not connected</p>
      <p style="font-family:var(--font-mono);color:var(--white3);font-size:0.78rem;">
        Connect Firebase in config.js to see real data here.
      </p>
    </div>`;

  ['admin-pending-list', 'admin-accounts-list'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = msg;
  });
}

// ── Check and display unread notifications for current user ───────────
// (called from auth.js after login / session restore)
async function checkUserNotifications() {
  if (demoMode || !db || !State.currentUser) return;

  try {
    const snap = await db.collection('users').doc(State.currentUser.uid).get();
    if (!snap.exists) return;

    const data          = snap.data();
    const notifications = (data.notifications || []).filter(n => !n.read);
    if (notifications.length === 0) return;

    // Show toasts — stagger them so they don't stack instantly
    notifications.forEach((n, i) => {
      setTimeout(() => {
        const color = n.type === 'market_rejected' ? 'yellow' : 'green';
        showToast('📩 ' + n.message, color);
      }, i * 2200);
    });

    // Restore refunded tokens to local state
    const refundTotal = notifications
      .filter(n => (n.refundAmount || 0) > 0)
      .reduce((sum, n) => sum + n.refundAmount, 0);

    if (refundTotal > 0) {
      State.userTokens += refundTotal;
      updateTokenDisplay();
    }

    // Mark all as read in Firestore
    const allNotifs = (data.notifications || []).map(n => ({ ...n, read: true }));
    await db.collection('users').doc(State.currentUser.uid).update({ notifications: allNotifs });

  } catch (e) {
    console.warn('Notification check failed:', e);
  }
}
