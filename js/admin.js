// ─────────────────────────────────────────────────────────────────────
// admin.js — Admin panel: market review, accounts, token management
// ─────────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = 'founder@crowdverse.in';

function isAdmin() {
  return !!(State.currentUser && State.currentUser.email === ADMIN_EMAIL);
}

let _adminMarketsCache = {};
let _adminUsersCache = [];

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
  if (content) {
    content.style.display = '';
    _buildAdminPanelHtml(content);
  }

  await loadAdminData();
}

function _buildAdminPanelHtml(container) {
  container.innerHTML = `
    <!-- Top bar -->
    <div style="background:rgba(255,85,85,0.07);border-bottom:1px solid rgba(255,85,85,0.2);
                padding:0.65rem 2rem;display:flex;align-items:center;gap:0.75rem;
                font-family:var(--font-mono);font-size:0.76rem;flex-wrap:wrap;">
      <span style="color:#ff8888;font-weight:700;">🔴 ADMIN PANEL</span>
      <span style="color:var(--border2);">|</span>
      <span id="admin-email-label" style="color:var(--white3);">${State.currentUser?.email || '—'}</span>
      <span style="margin-left:auto;padding:0.2rem 0.65rem;background:rgba(255,85,85,0.12);
                   border:1px solid rgba(255,85,85,0.3);border-radius:20px;color:#ff8888;
                   font-size:0.68rem;letter-spacing:0.06em;">RESTRICTED</span>
    </div>

    <div class="page-header">
      <div class="section-label" style="margin-bottom:0.5rem;color:#ff8888;">⚙️ Administration</div>
      <h1>CrowdVerse Admin Panel</h1>
      <p>Manage markets, monitor accounts, and control the token economy.</p>
    </div>

    <div style="max-width:1200px;margin:0 auto;padding:0 2rem 5rem;">

      <!-- Stat cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:2.5rem;">
        ${[
          { id:'admin-stat-accounts', icon:'👤', label:'Total Accounts', color:'var(--green)' },
          { id:'admin-stat-tokens', icon:'🎟️', label:'Tokens in Flow', color:'var(--yellow)' },
          { id:'admin-stat-pending', icon:'⏳', label:'Pending Review', color:'var(--yellow)' },
          { id:'admin-stat-live', icon:'📈', label:'Live Markets', color:'var(--green)' }
        ].map(s => `
          <div style="background:var(--off-black);border:1px solid var(--border);border-radius:var(--radius-md);padding:1.25rem;">
            <div style="font-size:1.5rem;margin-bottom:0.5rem;">${s.icon}</div>
            <div id="${s.id}" style="font-family:var(--font-display);font-size:2rem;font-weight:800;color:${s.color};">—</div>
            <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--white3);margin-top:0.2rem;">${s.label}</div>
          </div>
        `).join('')}
      </div>

      <!-- Refresh button -->
      <div style="display:flex;justify-content:flex-end;margin-bottom:1rem;">
        <button onclick="loadAdminData()"
                style="background:none;border:1px solid var(--border2);border-radius:var(--radius-sm);
                       padding:0.45rem 1rem;font-family:var(--font-mono);font-size:0.75rem;
                       color:var(--white3);cursor:pointer;transition:all 0.2s;"
                onmouseover="this.style.color='var(--white)'"
                onmouseout="this.style.color='var(--white3)'">↺ Refresh All Data</button>
      </div>

      <!-- Pending markets -->
      <div style="margin-bottom:2.5rem;">
        <div class="section-label" style="margin-bottom:1rem;">⏳ Markets Awaiting Review</div>
        <div id="admin-pending-list">
          <div style="text-align:center;padding:2rem;font-family:var(--font-mono);color:var(--white3);">Loading…</div>
        </div>
      </div>

      <!-- Live markets with VETO -->
      <div style="margin-bottom:2.5rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
          <div class="section-label" style="margin-bottom:0;color:var(--green);">✅ Live Markets</div>
          <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--white3);">🛡️ Admin VETO power active</span>
        </div>
        <div id="admin-live-list">
          <div style="text-align:center;padding:2rem;font-family:var(--font-mono);color:var(--white3);">Loading…</div>
        </div>
      </div>

      <!-- Accounts table -->
      <div>
        <div class="section-label" style="margin-bottom:1rem;">👥 All Accounts — Token Management</div>
        <div id="admin-accounts-list">
          <div style="text-align:center;padding:2rem;font-family:var(--font-mono);color:var(--white3);">Loading…</div>
        </div>
      </div>
    </div>
  `;
}

// ── Load all data from Firestore ──────────────────────────────────────
async function loadAdminData() {
  if (demoMode || !db) { _renderAdminDemoFallback(); return; }

  ['admin-pending-list','admin-live-list','admin-accounts-list'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div style="text-align:center;padding:2rem;font-family:var(--font-mono);font-size:0.82rem;color:var(--white3);">Loading…</div>`;
  });

  try {
    const usersSnap = await db.collection('users').get();
    const users = [];
    let totalTokens = 0, totalPredictions = 0;
    usersSnap.forEach(doc => {
      const d = doc.data();
      users.push({ uid: doc.id, ...d });
      totalTokens += (d.tokens || 0);
      totalPredictions += (d.predictions || []).length;
    });
    _adminUsersCache = users;

    const marketsSnap = await db.collection('markets').orderBy('createdAt', 'desc').get();
    const pending = [], live = [];
    _adminMarketsCache = {};
    marketsSnap.forEach(doc => {
      const d = { docId: doc.id, ...doc.data() };
      _adminMarketsCache[doc.id] = d;
      if (d.status === 'pending') pending.push(d);
      else if (d.status === 'live' || d.status === 'approved') live.push(d);
    });

    const sa = document.getElementById('admin-stat-accounts');
    const st = document.getElementById('admin-stat-tokens');
    const sp = document.getElementById('admin-stat-pending');
    const sl = document.getElementById('admin-stat-live');
    if (sa) sa.textContent = users.length;
    if (st) st.textContent = totalTokens.toLocaleString();
    if (sp) sp.textContent = pending.length;
    if (sl) sl.textContent = live.length;

    _renderAdminPendingMarkets(pending);
    _renderAdminLiveMarkets(live);
    _renderAdminAccounts(users);

  } catch (e) {
    console.error('Admin load error:', e);
    showToast('Failed to load: ' + e.message, 'red');
  }
}

// ── Pending markets ───────────────────────────────────────────────────
function _renderAdminPendingMarkets(markets) {
  const el = document.getElementById('admin-pending-list');
  if (!el) return;
  if (markets.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:2rem;background:var(--off-black);border:1px solid var(--border);border-radius:var(--radius-md);">
      <div style="font-size:2rem;margin-bottom:0.5rem;">✅</div>
      <p style="font-family:var(--font-mono);color:var(--white3);font-size:0.85rem;">All caught up! No pending markets.</p>
    </div>`;
    return;
  }

  el.innerHTML = markets.map(m => `
    <div id="admin-mkt-${m.docId}"
         style="background:var(--off-black);border:1px solid rgba(255,215,0,0.22);
                border-left:4px solid var(--yellow);
                border-radius:var(--radius-md);padding:1.25rem;margin-bottom:0.75rem;transition:all 0.35s;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.6rem;">
            <span style="font-family:var(--font-mono);font-size:0.65rem;background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);color:var(--yellow);padding:0.15rem 0.5rem;border-radius:4px;text-transform:uppercase;">⏳ Pending</span>
            <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--green);">${escHtml(m.cat || '')}</span>
          </div>
          <h3 style="font-family:var(--font-display);font-size:1rem;font-weight:700;margin-bottom:0.5rem;line-height:1.4;">${escHtml(m.question)}</h3>
          ${m.description ? `<p style="font-size:0.82rem;color:var(--white2);margin-bottom:0.6rem;">${escHtml(m.description)}</p>` : ''}
          <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--white3);display:flex;gap:1rem;flex-wrap:wrap;">
            <span>👤 <strong style="color:var(--white2);">${escHtml(m.createdByName || 'Unknown')}</strong></span>
            <span>📧 ${escHtml(m.createdByEmail || '—')}</span>
            <span>📅 Ends: ${escHtml(m.ends || '—')}</span>
          </div>
          <div style="margin-top:0.5rem;display:flex;gap:0.6rem;font-family:var(--font-mono);font-size:0.72rem;">
            <span style="padding:0.2rem 0.6rem;background:rgba(127,255,127,0.08);border:1px solid rgba(127,255,127,0.2);border-radius:4px;color:var(--green);">✔ ${escHtml(m.optA || 'Yes')}</span>
            <span style="padding:0.2rem 0.6rem;background:rgba(255,85,85,0.08);border:1px solid rgba(255,85,85,0.2);border-radius:4px;color:#ff8888;">✖ ${escHtml(m.optB || 'No')}</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.5rem;flex-shrink:0;min-width:120px;">
          <button id="approve-btn-${m.docId}" onclick="approveMarket('${m.docId}')"
                  style="padding:0.65rem 1.25rem;background:var(--green);color:var(--black);border:none;
                         border-radius:var(--radius-sm);font-weight:700;font-size:0.82rem;cursor:pointer;
                         transition:all 0.2s;font-family:var(--font-mono);">✅ Approve</button>
          <button id="reject-btn-${m.docId}" onclick="rejectMarket('${m.docId}')"
                  style="padding:0.65rem 1.25rem;background:rgba(255,85,85,0.1);color:#ff8888;
                         border:1px solid rgba(255,85,85,0.3);border-radius:var(--radius-sm);
                         font-weight:700;font-size:0.82rem;cursor:pointer;transition:all 0.2s;
                         font-family:var(--font-mono);">❌ Reject</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Live markets with VETO ────────────────────────────────────────────
function _renderAdminLiveMarkets(markets) {
  const el = document.getElementById('admin-live-list');
  if (!el) return;
  if (markets.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:2rem;background:var(--off-black);border:1px solid var(--border);border-radius:var(--radius-md);">
      <p style="font-family:var(--font-mono);color:var(--white3);">No live markets yet.</p>
    </div>`;
    return;
  }

  el.innerHTML = markets.map(m => `
    <div id="admin-live-mkt-${m.docId}"
         style="background:var(--off-black);border:1px solid rgba(0,255,127,0.18);
                border-left:4px solid var(--green);
                border-radius:var(--radius-md);padding:1.25rem;margin-bottom:0.75rem;transition:all 0.35s;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.6rem;">
            <span style="font-family:var(--font-mono);font-size:0.65rem;background:rgba(0,255,127,0.1);border:1px solid rgba(0,255,127,0.3);color:var(--green);padding:0.15rem 0.5rem;border-radius:4px;text-transform:uppercase;">● LIVE</span>
            <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--green);">${escHtml(m.cat || '')}</span>
          </div>
          <h3 style="font-family:var(--font-display);font-size:1rem;font-weight:700;margin-bottom:0.5rem;line-height:1.4;">${escHtml(m.question)}</h3>
          <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--white3);display:flex;gap:1rem;flex-wrap:wrap;">
            <span>👤 ${escHtml(m.createdByName || 'CrowdVerse')}</span>
            <span>📅 Ends: ${escHtml(m.ends || '—')}</span>
            <span>🎟️ ${(m.tokens || 0).toLocaleString()} pooled</span>
          </div>
        </div>
        <div style="flex-shrink:0;">
          <button id="veto-btn-${m.docId}" onclick="deleteMarket('${m.docId}')"
                  style="padding:0.65rem 1.25rem;background:rgba(255,85,85,0.15);color:#ff5555;
                         border:2px solid #ff5555;border-radius:var(--radius-sm);
                         font-weight:700;font-size:0.82rem;cursor:pointer;transition:all 0.2s;
                         font-family:var(--font-mono);white-space:nowrap;">
            🛡️ VETO DELETE
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ── Accounts table with token management ─────────────────────────────
function _renderAdminAccounts(users) {
  const el = document.getElementById('admin-accounts-list');
  if (!el) return;
  if (users.length === 0) {
    el.innerHTML = `<p style="font-family:var(--font-mono);color:var(--white3);">No users found.</p>`;
    return;
  }

  users.sort((a, b) => {
    if (a.email === ADMIN_EMAIL) return 1;
    if (b.email === ADMIN_EMAIL) return -1;
    return (b.tokens || 0) - (a.tokens || 0);
  });

  el.innerHTML = `
    <div style="background:var(--off-black);border:1px solid var(--border);border-radius:var(--radius-md);overflow:hidden;">
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:0.82rem;min-width:700px;">
          <thead>
            <tr style="background:var(--dark2);border-bottom:1px solid var(--border2);">
              <th style="padding:0.9rem 1rem;text-align:left;font-family:var(--font-mono);font-size:0.65rem;color:var(--white3);text-transform:uppercase;font-weight:500;">#</th>
              <th style="padding:0.9rem 1rem;text-align:left;font-family:var(--font-mono);font-size:0.65rem;color:var(--white3);text-transform:uppercase;font-weight:500;">User</th>
              <th style="padding:0.9rem 1rem;text-align:left;font-family:var(--font-mono);font-size:0.65rem;color:var(--white3);text-transform:uppercase;font-weight:500;">Email</th>
              <th style="padding:0.9rem 1rem;text-align:right;font-family:var(--font-mono);font-size:0.65rem;color:var(--white3);text-transform:uppercase;font-weight:500;">Tokens</th>
              <th style="padding:0.9rem 1rem;text-align:right;font-family:var(--font-mono);font-size:0.65rem;color:var(--white3);text-transform:uppercase;font-weight:500;">Predictions</th>
              <th style="padding:0.9rem 1rem;text-align:center;font-family:var(--font-mono);font-size:0.65rem;color:var(--white3);text-transform:uppercase;font-weight:500;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map((u, i) => {
              const isAdminUser = u.email === ADMIN_EMAIL;
              return `
                <tr style="border-bottom:1px solid var(--border);${isAdminUser ? 'opacity:0.5;' : ''}"
                    onmouseover="this.style.background='var(--dark)'"
                    onmouseout="this.style.background=''">
                  <td style="padding:0.9rem 1rem;font-family:var(--font-mono);font-size:0.72rem;color:var(--white3);">${i + 1}</td>
                  <td style="padding:0.9rem 1rem;">
                    <div style="font-weight:600;">${escHtml(u.displayName || '—')}
                      ${isAdminUser ? '<span style="font-family:var(--font-mono);font-size:0.6rem;background:rgba(255,85,85,0.15);color:#ff8888;padding:0.1rem 0.4rem;border-radius:3px;margin-left:6px;">ADMIN</span>' : ''}
                    </div>
                  </td>
                  <td style="padding:0.9rem 1rem;font-family:var(--font-mono);font-size:0.75rem;color:var(--white2);">${escHtml(u.email || '—')}</td>
                  <td style="padding:0.9rem 1rem;font-family:var(--font-mono);font-size:0.85rem;color:var(--green);font-weight:700;text-align:right;" id="token-display-${u.uid}">
                    ${(u.tokens || 0).toLocaleString()}
                  </td>
                  <td style="padding:0.9rem 1rem;font-family:var(--font-mono);font-size:0.78rem;color:var(--white3);text-align:right;">
                    ${(u.predictions || []).length}
                  </td>
                  <td style="padding:0.9rem 1rem;text-align:center;">
                    <div style="display:flex;gap:0.4rem;justify-content:center;flex-wrap:wrap;">
                      <button onclick="adminAdjustTokens('${u.uid}','${escHtml(u.displayName || u.email || '')}',true)"
                              title="Add 100 tokens"
                              style="padding:0.3rem 0.6rem;background:rgba(127,255,127,0.12);color:var(--green);
                                     border:1px solid rgba(127,255,127,0.3);border-radius:var(--radius-sm);
                                     font-size:0.75rem;cursor:pointer;font-family:var(--font-mono);transition:all 0.2s;"
                              onmouseover="this.style.background='rgba(127,255,127,0.2)'"
                              onmouseout="this.style.background='rgba(127,255,127,0.12)'">+100</button>
                      <button onclick="adminAdjustTokens('${u.uid}','${escHtml(u.displayName || u.email || '')}',false)"
                              title="Remove 100 tokens"
                              style="padding:0.3rem 0.6rem;background:rgba(255,85,85,0.12);color:#ff8888;
                                     border:1px solid rgba(255,85,85,0.3);border-radius:var(--radius-sm);
                                     font-size:0.75rem;cursor:pointer;font-family:var(--font-mono);transition:all 0.2s;"
                              onmouseover="this.style.background='rgba(255,85,85,0.2)'"
                              onmouseout="this.style.background='rgba(255,85,85,0.12)'">−100</button>
                      <button onclick="openAdminUserModal('${u.uid}')"
                              title="View user details"
                              style="padding:0.3rem 0.6rem;background:var(--dark2);color:var(--white3);
                                     border:1px solid var(--border2);border-radius:var(--radius-sm);
                                     font-size:0.75rem;cursor:pointer;font-family:var(--font-mono);transition:all 0.2s;"
                              onmouseover="this.style.color='var(--white)'"
                              onmouseout="this.style.color='var(--white3)'">👁️ View</button>
                    </div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ── Admin adjust tokens ───────────────────────────────────────────────
async function adminAdjustTokens(uid, userName, isAdd) {
  if (!db) return;
  const amount = isAdd ? 100 : -100;
  const action = isAdd ? 'Added' : 'Removed';

  try {
    await db.collection('users').doc(uid).update({
      tokens: firebase.firestore.FieldValue.increment(amount)
    });

    // Update display in table
    const dispEl = document.getElementById('token-display-' + uid);
    if (dispEl) {
      const user = _adminUsersCache.find(u => u.uid === uid);
      if (user) {
        user.tokens = (user.tokens || 0) + amount;
        dispEl.textContent = user.tokens.toLocaleString();
      }
    }

    // If adjusting own tokens (admin), update local state too
    if (uid === State.currentUser?.uid) {
      State.userTokens = Math.max(0, State.userTokens + amount);
      updateTokenDisplay();
    }

    showToast(`${action} ${Math.abs(amount)} tokens ${isAdd ? 'to' : 'from'} ${userName}`, isAdd ? 'green' : 'yellow');
  } catch (e) {
    showToast('Token adjustment failed: ' + e.message, 'red');
  }
}

// ── Admin view user modal ─────────────────────────────────────────────
function openAdminUserModal(uid) {
  const user = _adminUsersCache.find(u => u.uid === uid);
  if (!user) { showToast('User not found', 'red'); return; }

  // Remove existing modal
  const existing = document.getElementById('admin-user-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'admin-user-modal';
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.style.zIndex = '3000';

  const predictions = user.predictions || [];
  const joinedDate = user.createdAt
    ? new Date(user.createdAt.seconds ? user.createdAt.seconds * 1000 : user.createdAt).toLocaleDateString('en-IN')
    : '—';

  modal.innerHTML = `
    <div class="modal" style="max-width:520px;max-height:85vh;overflow-y:auto;">
      <button onclick="document.getElementById('admin-user-modal').remove()"
              class="modal-close">✕</button>
      <div class="section-label" style="margin-bottom:0.75rem;">User Profile</div>
      <h2 style="margin-bottom:0.25rem;">${escHtml(user.displayName || '—')}</h2>
      <p style="font-family:var(--font-mono);font-size:0.75rem;color:var(--white3);margin-bottom:1.5rem;">${escHtml(user.email || '—')}</p>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;margin-bottom:1.5rem;text-align:center;">
        <div style="background:var(--dark);border:1px solid var(--border);border-radius:var(--radius-md);padding:1rem;">
          <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--green);">${(user.tokens || 0).toLocaleString()}</div>
          <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);text-transform:uppercase;">Tokens</div>
        </div>
        <div style="background:var(--dark);border:1px solid var(--border);border-radius:var(--radius-md);padding:1rem;">
          <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--white);">${predictions.length}</div>
          <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);text-transform:uppercase;">Predictions</div>
        </div>
        <div style="background:var(--dark);border:1px solid var(--border);border-radius:var(--radius-md);padding:1rem;">
          <div style="font-family:var(--font-display);font-size:0.9rem;font-weight:700;color:var(--white);">${joinedDate}</div>
          <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);text-transform:uppercase;">Joined</div>
        </div>
      </div>

      <!-- Manual token adjustment -->
      <div style="background:var(--dark);border:1px solid var(--border);border-radius:var(--radius-md);padding:1.25rem;margin-bottom:1.5rem;">
        <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.75rem;">Adjust Token Balance</div>
        <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
          <input type="number" id="admin-token-adjust-amount" value="100" min="1"
                 style="flex:1;min-width:80px;padding:0.6rem;background:var(--dark2);border:1px solid var(--border2);
                        border-radius:var(--radius-sm);color:var(--white);font-size:0.9rem;outline:none;">
          <button onclick="adminAdjustTokensCustom('${uid}','${escHtml(user.displayName || '')}',true)"
                  style="padding:0.6rem 1rem;background:var(--green);color:var(--black);border:none;border-radius:var(--radius-sm);font-weight:700;cursor:pointer;">+ Add</button>
          <button onclick="adminAdjustTokensCustom('${uid}','${escHtml(user.displayName || '')}',false)"
                  style="padding:0.6rem 1rem;background:#ff5555;color:var(--white);border:none;border-radius:var(--radius-sm);font-weight:700;cursor:pointer;">− Remove</button>
        </div>
      </div>

      <!-- Prediction history -->
      ${predictions.length > 0 ? `
        <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.5rem;">Prediction History</div>
        <div style="max-height:200px;overflow-y:auto;">
          ${predictions.map(p => `
            <div style="padding:0.6rem 0;border-bottom:1px solid var(--border);font-size:0.8rem;">
              <div style="color:var(--white);margin-bottom:0.2rem;">${escHtml(p.question || '—')}</div>
              <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--white3);">
                ${escHtml(p.option || '—')} · ${p.amount || 0} tokens · 
                <span style="color:${p.status === 'won' ? 'var(--green)' : p.status === 'lost' ? '#ff8888' : 'var(--yellow)'}">
                  ${p.status || 'pending'}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `<p style="font-family:var(--font-mono);font-size:0.82rem;color:var(--white3);">No predictions yet.</p>`}
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('active'));

  // Close on backdrop
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.remove();
  });
}

// ── Admin custom token adjustment from user modal ─────────────────────
async function adminAdjustTokensCustom(uid, userName, isAdd) {
  const input = document.getElementById('admin-token-adjust-amount');
  const amount = parseInt(input?.value) || 0;
  if (amount <= 0) { showToast('Enter a valid amount', 'yellow'); return; }
  if (!db) return;

  const delta = isAdd ? amount : -amount;
  try {
    await db.collection('users').doc(uid).update({
      tokens: firebase.firestore.FieldValue.increment(delta)
    });
    const user = _adminUsersCache.find(u => u.uid === uid);
    if (user) user.tokens = (user.tokens || 0) + delta;

    // Update table cell
    const dispEl = document.getElementById('token-display-' + uid);
    if (dispEl && user) dispEl.textContent = user.tokens.toLocaleString();

    if (uid === State.currentUser?.uid) {
      State.userTokens = Math.max(0, State.userTokens + delta);
      updateTokenDisplay();
    }
    showToast(`${isAdd ? 'Added' : 'Removed'} ${amount} tokens ${isAdd ? 'to' : 'from'} ${userName}`, isAdd ? 'green' : 'yellow');
    document.getElementById('admin-user-modal')?.remove();
  } catch (e) {
    showToast('Adjustment failed: ' + e.message, 'red');
  }
}

// ── Approve a market ──────────────────────────────────────────────────
async function approveMarket(docId) {
  if (!db) return;
  const approveBtn = document.getElementById('approve-btn-' + docId);
  const rejectBtn  = document.getElementById('reject-btn-' + docId);
  if (approveBtn) { approveBtn.textContent = 'Approving…'; approveBtn.disabled = true; }
  if (rejectBtn)  rejectBtn.disabled = true;

  try {
    await db.collection('markets').doc(docId).update({
      status: 'live',
      approvedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    const card = document.getElementById('admin-mkt-' + docId);
    if (card) { card.style.opacity = '0'; card.style.transform = 'translateX(30px)'; setTimeout(() => card.remove(), 380); }
    const el = document.getElementById('admin-stat-pending');
    if (el) el.textContent = Math.max(0, parseInt(el.textContent || '0') - 1);
    const liveEl = document.getElementById('admin-stat-live');
    if (liveEl) liveEl.textContent = parseInt(liveEl.textContent || '0') + 1;
    showToast('✅ Market approved and now live!', 'green');
  } catch (e) {
    if (approveBtn) { approveBtn.textContent = '✅ Approve'; approveBtn.disabled = false; }
    if (rejectBtn)  rejectBtn.disabled = false;
    showToast('Approve failed: ' + e.message, 'red');
  }
}

// ── Reject a market and refund tokens ────────────────────────────────
async function rejectMarket(docId) {
  if (!db) return;
  const m = _adminMarketsCache[docId];
  if (!m) { showToast('Market data not found', 'red'); return; }

  const approveBtn = document.getElementById('approve-btn-' + docId);
  const rejectBtn  = document.getElementById('reject-btn-' + docId);
  if (rejectBtn)  { rejectBtn.textContent = 'Rejecting…'; rejectBtn.disabled = true; }
  if (approveBtn) approveBtn.disabled = true;

  try {
    const batch = db.batch();
    batch.update(db.collection('markets').doc(docId), {
      status: 'rejected',
      rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    if (m.createdByUid) {
      const shortQ = m.question.length > 70 ? m.question.substring(0, 70) + '…' : m.question;
      batch.update(db.collection('users').doc(m.createdByUid), {
        tokens: firebase.firestore.FieldValue.increment(100),
        notifications: firebase.firestore.FieldValue.arrayUnion({
          type: 'market_rejected',
          message: `We're sorry — your market "${shortQ}" wasn't approved. Your 100 tokens have been fully refunded. We appreciate your contribution! 🙏`,
          refundAmount: 100,
          marketId: docId,
          createdAt: new Date().toISOString(),
          read: false
        })
      });
    }
    await batch.commit();
    const card = document.getElementById('admin-mkt-' + docId);
    if (card) { card.style.opacity = '0'; card.style.transform = 'translateX(-30px)'; setTimeout(() => card.remove(), 380); }
    const el = document.getElementById('admin-stat-pending');
    if (el) el.textContent = Math.max(0, parseInt(el.textContent || '0') - 1);
    showToast('❌ Market rejected. 100 tokens refunded.', 'yellow');
  } catch (e) {
    if (rejectBtn)  { rejectBtn.textContent = '❌ Reject'; rejectBtn.disabled = false; }
    if (approveBtn) approveBtn.disabled = false;
    showToast('Reject failed: ' + e.message, 'red');
  }
}

// ── VETO delete a live market ─────────────────────────────────────────
async function deleteMarket(docId) {
  if (!db) return;
  if (!confirm('⚠️ VETO DELETE: This will permanently remove the market from the platform. Continue?')) return;

  const vetoBtn = document.getElementById('veto-btn-' + docId);
  if (vetoBtn) { vetoBtn.textContent = 'Deleting…'; vetoBtn.disabled = true; }

  try {
    await db.collection('markets').doc(docId).update({
      status: 'deleted',
      deletedAt: firebase.firestore.FieldValue.serverTimestamp(),
      deletedBy: State.currentUser?.email
    });
    const card = document.getElementById('admin-live-mkt-' + docId);
    if (card) { card.style.opacity = '0'; card.style.transform = 'scale(0.95)'; setTimeout(() => card.remove(), 380); }
    const liveEl = document.getElementById('admin-stat-live');
    if (liveEl) liveEl.textContent = Math.max(0, parseInt(liveEl.textContent || '0') - 1);
    showToast('🛡️ Market vetoed and removed from platform.', 'yellow');
  } catch (e) {
    if (vetoBtn) { vetoBtn.textContent = '🛡️ VETO DELETE'; vetoBtn.disabled = false; }
    showToast('Veto failed: ' + e.message, 'red');
  }
}

// ── Demo mode fallback ────────────────────────────────────────────────
function _renderAdminDemoFallback() {
  ['admin-stat-accounts','admin-stat-tokens','admin-stat-pending','admin-stat-live'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = 'N/A';
  });

  const msg = `
    <div style="text-align:center;padding:2.5rem;background:rgba(255,215,0,0.04);
                border:1px solid rgba(255,215,0,0.2);border-radius:var(--radius-md);">
      <div style="font-size:2rem;margin-bottom:0.75rem;">⚠️</div>
      <p style="font-family:var(--font-mono);color:var(--yellow);font-size:0.85rem;font-weight:700;margin-bottom:0.4rem;">Demo Mode — Firebase not connected</p>
      <p style="font-family:var(--font-mono);color:var(--white3);font-size:0.78rem;">Connect Firebase in config.js to see real data here.</p>
    </div>`;
  ['admin-pending-list','admin-live-list','admin-accounts-list'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = msg;
  });
}

// ── Check unread notifications ────────────────────────────────────────
async function checkUserNotifications() {
  if (demoMode || !db || !State.currentUser) return;
  try {
    const snap = await db.collection('users').doc(State.currentUser.uid).get();
    if (!snap.exists) return;
    const data = snap.data();
    const unread = (data.notifications || []).filter(n => !n.read);
    if (!unread.length) return;

    unread.forEach((n, i) => {
      setTimeout(() => showToast('📩 ' + n.message, n.type === 'market_rejected' ? 'yellow' : 'green'), i * 2200);
    });

    const refundTotal = unread.filter(n => n.refundAmount > 0).reduce((s, n) => s + n.refundAmount, 0);
    if (refundTotal > 0) { State.userTokens += refundTotal; updateTokenDisplay(); }

    const allNotifs = (data.notifications || []).map(n => ({ ...n, read: true }));
    await db.collection('users').doc(State.currentUser.uid).update({ notifications: allNotifs });
  } catch (e) { console.warn('Notification check failed:', e); }
}
