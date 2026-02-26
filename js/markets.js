// ─────────────────────────────────────────────────────────────────────
// markets.js — Render markets list, create market, vote modal
// ─────────────────────────────────────────────────────────────────────

// Prediction constants
const MAX_PREDICTION_AMOUNT = 500000;  // Maximum tokens per prediction
const PREDICTION_FEE = 20;             // Fixed fee per prediction
const MIN_STAKE = 25;                  // Minimum total (20 fee + 5 stake)

// ── Real-time unsubscribe functions ───────────────────────────────────
let _marketsUnsubscribe = null;
let _marketVotesUnsubscribe = {};

// ── Search / sort state (read by renderMarkets) ───────────────────────
let _marketSearchQuery = '';
let _marketSortBy      = 'newest';

// ── Helper: find a market by id across ALL sources ────────────────────
function findMarketById(marketId) {
  const id = String(marketId);
  const all = [
    ...State.firestoreMarkets.map(m => ({ ...m, id: String(m.firestoreId || m.id) })),
    ...State.userCreatedMarkets.map(m => ({ ...m, id: String(m.firestoreId || m.id) }))
  ];
  return all.find(m => m.id === id) || null;
}

// ── Days-remaining helper ─────────────────────────────────────────────
function getDaysRemaining(endsStr) {
  if (!endsStr || endsStr === '—') return null;
  try {
    const end = new Date(endsStr);
    if (isNaN(end.getTime())) return null;
    const diff = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0)  return 'Ended';
    if (diff === 0) return 'Closes today ⚡';
    if (diff === 1) return '1 day left ⚡';
    if (diff <= 7)  return `${diff} days left ⚡`;
    return `${diff} days left`;
  } catch { return null; }
}

// ── Start real-time listener for live markets ─────────────────────────
function startMarketsListener() {
  if (demoMode || !db) return;
  if (_marketsUnsubscribe) _marketsUnsubscribe();

  _marketsUnsubscribe = db.collection('markets')
    .where('status', 'in', ['live', 'approved'])
    .onSnapshot(snapshot => {
      const markets = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        markets.push({ id: doc.id, firestoreId: doc.id, ...data, status: 'live' });
      });

      markets.sort((a, b) => {
        const tA = a.approvedAt?.seconds || a.createdAt?.seconds || 0;
        const tB = b.approvedAt?.seconds || b.createdAt?.seconds || 0;
        return tB - tA;
      });

      State.firestoreMarkets = markets;
      renderMarkets(_currentMarketFilter);

      if (typeof updateHomeMarketsPreview === 'function') updateHomeMarketsPreview();
      if (typeof updateCommunityPage     === 'function') updateCommunityPage();

      markets.forEach(m => startMarketVotesListener(m.firestoreId));
    }, err => {
      console.warn('Markets listener error:', err);
      const list = document.getElementById('markets-list');
      if (list) {
        list.innerHTML = `
          <div style="text-align:center;padding:4rem 2rem;color:var(--red);
                      font-family:var(--font-mono);font-size:0.85rem;">
            ⚠️ Failed to load markets. Please check your connection and refresh.
          </div>`;
      }
      showToast('Failed to load markets — please refresh', 'red');
    });
}

// ── Real-time votes listener for a single market ──────────────────────
function startMarketVotesListener(marketId) {
  if (demoMode || !db) return;
  if (_marketVotesUnsubscribe[marketId]) _marketVotesUnsubscribe[marketId]();

  _marketVotesUnsubscribe[marketId] = db.collection('markets')
    .doc(marketId)
    .collection('votes')
    .onSnapshot(snapshot => {
      let tokensA = 0, tokensB = 0, voteCount = 0;
      snapshot.forEach(doc => {
        const v = doc.data();
        voteCount++;
        if (v.option === 'a') tokensA += v.amount || 0;
        else if (v.option === 'b') tokensB += v.amount || 0;
      });

      const market = State.firestoreMarkets.find(m => m.firestoreId === marketId);
      if (market) {
        market.tokensA     = tokensA;
        market.tokensB     = tokensB;
        market.totalTokens = tokensA + tokensB;
        market.voteCount   = voteCount;
        market.pctA        = market.totalTokens > 0
          ? Math.round((tokensA / market.totalTokens) * 100)
          : 50;

        renderMarkets(_currentMarketFilter);
        if (typeof updateHomeMarketsPreview === 'function') updateHomeMarketsPreview();
        if (typeof updateCommunityPage     === 'function') updateCommunityPage();
        if (State.activeMarketId === marketId) updateVoteModalOdds(market);
      }
    }, err => console.warn(`Votes listener error for ${marketId}:`, err));
}

// ── Update open vote modal with live odds ─────────────────────────────
function updateVoteModalOdds(market) {
  const pctA  = market.pctA || 50;
  const pctB  = 100 - pctA;
  const oddsA = pctA > 0 ? (100 / pctA).toFixed(2) : '∞';
  const oddsB = pctB > 0 ? (100 / pctB).toFixed(2) : '∞';

  const btnA = document.querySelector('.outcome-btn[data-option="a"]');
  const btnB = document.querySelector('.outcome-btn[data-option="b"]');

  if (btnA) {
    const pctEl  = btnA.querySelector('[data-pct]');
    const oddsEl = btnA.querySelector('[data-odds]');
    if (pctEl)  pctEl.textContent  = pctA + '%';
    if (oddsEl) oddsEl.textContent = oddsA + 'x payout';
  }
  if (btnB) {
    const pctEl  = btnB.querySelector('[data-pct]');
    const oddsEl = btnB.querySelector('[data-odds]');
    if (pctEl)  pctEl.textContent  = pctB + '%';
    if (oddsEl) oddsEl.textContent = oddsB + 'x payout';
  }

  const mulEl = document.getElementById('payout-multiplier');
  if (mulEl && State.selectedVoteOption) {
    const odds = State.selectedVoteOption === 'a' ? oddsA : oddsB;
    mulEl.textContent = odds + 'x';
    currentOdds = parseFloat(odds);
    updatePotentialWinnings();
  }
}

// ── Load live markets then begin real-time listener ───────────────────
async function loadAndRenderMarkets() {
  startMarketsListener();
  renderMarkets();

  // ── Fallback one-time fetch ───────────────────────────────────────
  // If the real-time listener takes too long or fails silently,
  // do a direct .get() to ensure markets always appear on page load.
  if (!demoMode && db) {
    try {
      const snap = await db.collection('markets')
        .where('status', 'in', ['live', 'approved'])
        .get();

      if (snap.empty) return; // Nothing to show

      const fetched = [];
      snap.forEach(doc => {
        const data = doc.data();
        fetched.push({ id: doc.id, firestoreId: doc.id, ...data, status: 'live' });
      });

      // Merge with any markets already loaded by the listener
      const existingIds = new Set(State.firestoreMarkets.map(m => m.firestoreId));
      let changed = false;
      fetched.forEach(m => {
        if (!existingIds.has(m.firestoreId)) {
          State.firestoreMarkets.push(m);
          changed = true;
        }
      });

      if (changed) {
        renderMarkets(_currentMarketFilter);
        if (typeof updateHomeMarketsPreview === 'function') updateHomeMarketsPreview();
        fetched.forEach(m => startMarketVotesListener(m.firestoreId));
      }
    } catch (e) {
      console.warn('Fallback markets fetch failed:', e);
    }
  }
}

// ── Render all markets on the Markets page ────────────────────────────
function renderMarkets(filter = 'all') {
  const list    = document.getElementById('markets-list');
  const emptyEl = document.getElementById('markets-empty-state');
  if (!list) return;

  list.style.display = '';
  if (emptyEl) emptyEl.style.display = 'none';

  let allMarkets = [
    ...(State.firestoreMarkets  || []).filter(m => m.status !== 'rejected'),
    ...(State.userCreatedMarkets || []).filter(m => m.status !== 'rejected')
  ];

  // Category filter
  if (filter && filter !== 'all') {
    allMarkets = allMarkets.filter(m =>
      (m.cat || '').toLowerCase().includes(filter.toLowerCase())
    );
  }

  // Search filter
  if (_marketSearchQuery) {
    allMarkets = allMarkets.filter(m =>
      m.question.toLowerCase().includes(_marketSearchQuery) ||
      (m.cat || '').toLowerCase().includes(_marketSearchQuery)
    );
  }

  // Sort
  const getTime = m => {
    if (m.approvedAt?.seconds) return m.approvedAt.seconds * 1000;
    if (m.createdAt?.seconds)  return m.createdAt.seconds * 1000;
    return new Date(m.createdAt || 0).getTime();
  };

  if (_marketSortBy === 'volume') {
    allMarkets.sort((a, b) =>
      (b.totalTokens || b.tokens || 0) - (a.totalTokens || a.tokens || 0)
    );
  } else if (_marketSortBy === 'closing') {
    allMarkets.sort((a, b) => {
      const dA = new Date(a.ends || '9999').getTime();
      const dB = new Date(b.ends || '9999').getTime();
      return dA - dB;
    });
  } else {
    allMarkets.sort((a, b) => getTime(b) - getTime(a));
  }

  if (allMarkets.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:4rem 2rem;color:var(--white3);
                  font-family:var(--font-mono);font-size:0.85rem;">
        ${_marketSearchQuery
          ? `No markets found for "<strong>${escHtml(_marketSearchQuery)}</strong>"`
          : demoMode
            ? 'Demo mode: No markets yet. Create one on the Community page!'
            : 'No markets available yet. Check back soon!'}
      </div>`;
    return;
  }

  list.innerHTML = '';
  allMarkets.forEach(m => _renderMarketCard(m, list));
}

// ── Render a single market card into a container ──────────────────────
function _renderMarketCard(m, container) {
  const pctA        = m.pctA || 50;
  const pctB        = 100 - pctA;
  const totalTokens = m.totalTokens || m.tokens || 0;
  const marketId    = String(m.firestoreId || m.id);
  const isLive      = m.status === 'live';
  const daysLeft    = getDaysRemaining(m.ends);
  const hasVoted    = State.userPredictions.some(p => String(p.marketId) === marketId);

  const card = document.createElement('div');
  card.className    = 'market-card-full';
  card.dataset.marketId = marketId;

  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.75rem;">
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
        <div class="market-status ${isLive ? 'status-live' : 'status-pending'}">
          ${isLive ? '● Live' : '⏳ Under Review'}
        </div>
        ${hasVoted ? `<span style="font-family:var(--font-mono);font-size:0.62rem;color:var(--white3);
                              background:var(--white1);border:1px solid var(--border2);
                              padding:0.1rem 0.4rem;border-radius:4px;">✓ Predicted</span>` : ''}
        <button class="read-btn" onclick="event.stopPropagation();openReadModal('${marketId}')">
          Read
        </button>
      </div>
      <button onclick="event.stopPropagation();shareMarket('${marketId}','${escHtml(m.question).replace(/'/g, "\\'")}','markets')"
              style="background:var(--white1);border:none;border-radius:50%;width:34px;height:34px;min-width:34px;
                     cursor:pointer;display:flex;align-items:center;justify-content:center;
                     transition:all 0.2s;font-size:0.9rem;color:var(--white3);"
              title="Share this market"
              onmouseover="this.style.background='rgba(127,255,127,0.15)';this.style.color='var(--green)'"
              onmouseout="this.style.background='var(--white1)';this.style.color='var(--white3)'">
        🔗
      </button>
    </div>

    <div class="market-cat" style="margin-bottom:0.4rem;">${escHtml(m.cat || '')}</div>
    <h3 style="margin-bottom:1rem;">${escHtml(m.question)}</h3>

    <!-- Probability bar -->
    <div style="display:flex;align-items:center;gap:0.75rem;margin:1rem 0;">
      <div style="text-align:center;min-width:48px;">
        <div style="font-size:1.3rem;font-weight:800;color:var(--green);line-height:1;">${pctA}%</div>
        <div style="font-size:0.68rem;color:var(--white3);margin-top:2px;">${escHtml(m.optA || 'Yes')}</div>
      </div>
      <div style="flex:1;height:8px;background:var(--white1);border-radius:4px;overflow:hidden;position:relative;">
        <div style="position:absolute;left:0;top:0;height:100%;width:${pctA}%;
                    background:var(--green);opacity:0.75;transition:width 0.5s ease;"></div>
        <div style="position:absolute;right:0;top:0;height:100%;width:${pctB}%;
                    background:var(--red);opacity:0.65;transition:width 0.5s ease;"></div>
      </div>
      <div style="text-align:center;min-width:48px;">
        <div style="font-size:1.3rem;font-weight:800;color:var(--red);line-height:1;">${pctB}%</div>
        <div style="font-size:0.68rem;color:var(--white3);margin-top:2px;">${escHtml(m.optB || 'No')}</div>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.75rem;
                font-family:var(--font-mono);font-size:0.7rem;color:var(--white3);flex-wrap:wrap;gap:0.4rem;">
      ${daysLeft ? `<span style="color:${daysLeft.includes('⚡') ? 'var(--yellow)' : 'var(--white3)'};">${daysLeft}</span>` : `<span>Ends: ${escHtml(String(m.ends || '—'))}</span>`}
      <span style="color:var(--green-dim);">🎟️ ${totalTokens.toLocaleString()} pooled</span>
    </div>

    ${isLive
      ? `<div style="display:flex;gap:0.6rem;margin-top:1rem;">
           <button onclick="event.stopPropagation();openVote('${marketId}','a',event)"
                   style="flex:1;padding:0.8rem;background:rgba(127,255,127,0.1);color:var(--green);
                          border:1px solid rgba(127,255,127,0.25);border-radius:8px;font-weight:700;
                          cursor:pointer;transition:all 0.2s;font-size:0.9rem;"
                   onmouseover="this.style.background='rgba(127,255,127,0.18)'"
                   onmouseout="this.style.background='rgba(127,255,127,0.1)'">
             ${escHtml(m.optA || 'Yes')}
           </button>
           <button onclick="event.stopPropagation();openVote('${marketId}','b',event)"
                   style="flex:1;padding:0.8rem;background:rgba(224,80,80,0.1);color:var(--red);
                          border:1px solid rgba(224,80,80,0.25);border-radius:8px;font-weight:700;
                          cursor:pointer;transition:all 0.2s;font-size:0.9rem;"
                   onmouseover="this.style.background='rgba(224,80,80,0.18)'"
                   onmouseout="this.style.background='rgba(224,80,80,0.1)'">
             ${escHtml(m.optB || 'No')}
           </button>
         </div>`
      : `<div style="margin-top:1rem;padding:0.65rem;background:var(--white1);border-radius:8px;
                     font-family:var(--font-mono);font-size:0.7rem;color:var(--white3);text-align:center;">
           ⏳ Awaiting admin approval before going live
         </div>`
    }
  `;
  container.appendChild(card);
}

// ── View a user's public profile (stub) ──────────────────────────────
function viewUserProfile(uid, name) {
  showToast(`👤 Viewing ${name}'s profile…`, 'green');
}

// ── Polymarket-style Vote Modal ───────────────────────────────────────
function openVote(marketId, preselectedOpt, e) {
  if (e && e.stopPropagation) e.stopPropagation();
  if (!State.currentUser) { openAuth(); return; }

  const id = String(marketId);
  const m  = findMarketById(id);
  if (!m) {
    if (!demoMode && db) fetchAndShowMarketModal(id);
    else showToast('Market not found', 'red');
    return;
  }

  if (m.status === 'rejected') { showToast('This market has been removed.', 'red'); return; }
  if (m.status !== 'live')     { showToast('This market is still under review.', 'yellow'); return; }
  
  // Check if market has ended
  const daysLeft = getDaysRemaining(m.ends);
  if (daysLeft === 'Ended') { showToast('This market has already ended.', 'red'); return; }

  State.activeMarketId      = id;
  State.selectedVoteOption  = preselectedOpt || null;

  const pctA   = m.pctA || 50;
  const pctB   = 100 - pctA;
  const oddsA  = pctA > 0 ? (100 / pctA).toFixed(2) : '∞';
  const oddsB  = pctB > 0 ? (100 / pctB).toFixed(2) : '∞';
  const total  = m.totalTokens || m.tokens || 0;
  const dLeft  = getDaysRemaining(m.ends);

  currentOdds       = preselectedOpt === 'a' ? parseFloat(oddsA)
                    : preselectedOpt === 'b' ? parseFloat(oddsB)
                    : 1;
  currentMarketProb = pctA;

  let modal = document.getElementById('polymarket-vote-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id        = 'polymarket-vote-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal" style="max-width:420px;padding:0;overflow:hidden;
                               background:var(--off-black);border:1px solid var(--border2);">
      <!-- Header -->
      <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);flex-shrink:0;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;">
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.68rem;color:var(--green);opacity:0.8;text-transform:uppercase;
                        letter-spacing:0.1em;margin-bottom:0.25rem;">${escHtml(m.cat || '')}</div>
            <h3 style="font-size:0.95rem;line-height:1.45;margin:0;color:var(--white);">${escHtml(m.question)}</h3>
          </div>
          <button onclick="closePolymarketVoteModal()"
                  style="background:none;border:none;color:var(--white3);font-size:1.4rem;cursor:pointer;
                         padding:0;width:32px;height:32px;display:flex;align-items:center;
                         justify-content:center;border-radius:50%;flex-shrink:0;">✕</button>
        </div>
        <div style="margin-top:0.5rem;font-size:0.72rem;color:var(--white3);font-family:var(--font-mono);">
          ${dLeft ? dLeft + ' · ' : ''}${total.toLocaleString()} tokens pooled
        </div>
      </div>

      <!-- Scrollable Content Area -->
      <div style="overflow-y:auto;max-height:calc(85vh - 200px);">
        <!-- AI Market Context Panel (populated async by groq.js) -->
        <div id="groq-context-panel" style="display:none;"></div>

      <!-- Outcome + Amount -->
      <div style="padding:1.25rem 1.5rem;">
        <div style="font-size:0.68rem;color:var(--white3);text-transform:uppercase;
                    letter-spacing:0.06em;margin-bottom:0.75rem;">Select Outcome</div>

        <div style="display:flex;flex-direction:column;gap:0.55rem;">
          <button class="outcome-btn ${preselectedOpt === 'a' ? 'selected' : ''}"
                  onclick="selectOutcome('a', ${pctA}, ${oddsA})" data-option="a"
                  style="display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1rem;
                         background:var(--dark);border:2px solid ${preselectedOpt === 'a' ? 'rgba(127,255,127,0.5)' : 'var(--border2)'};
                         border-radius:10px;cursor:pointer;transition:all 0.2s;width:100%;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div class="radio-circle" style="width:18px;height:18px;border:2px solid ${preselectedOpt === 'a' ? 'rgba(127,255,127,0.7)' : 'var(--white3)'};border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${preselectedOpt === 'a' ? '<div style="width:8px;height:8px;background:var(--green);border-radius:50%;opacity:0.9;"></div>' : ''}
              </div>
              <span style="font-weight:600;color:var(--white);font-size:0.9rem;">${escHtml(m.optA || 'Yes')}</span>
            </div>
            <div style="text-align:right;">
              <div data-pct style="font-size:1.1rem;font-weight:800;color:var(--green);opacity:0.9;">${pctA}%</div>
              <div data-odds style="font-size:0.65rem;color:var(--white3);">${oddsA}x payout</div>
            </div>
          </button>

          <button class="outcome-btn ${preselectedOpt === 'b' ? 'selected' : ''}"
                  onclick="selectOutcome('b', ${pctB}, ${oddsB})" data-option="b"
                  style="display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1rem;
                         background:var(--dark);border:2px solid ${preselectedOpt === 'b' ? 'rgba(224,80,80,0.5)' : 'var(--border2)'};
                         border-radius:10px;cursor:pointer;transition:all 0.2s;width:100%;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div class="radio-circle" style="width:18px;height:18px;border:2px solid ${preselectedOpt === 'b' ? 'rgba(224,80,80,0.7)' : 'var(--white3)'};border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${preselectedOpt === 'b' ? '<div style="width:8px;height:8px;background:var(--red);border-radius:50%;opacity:0.9;"></div>' : ''}
              </div>
              <span style="font-weight:600;color:var(--white);font-size:0.9rem;">${escHtml(m.optB || 'No')}</span>
            </div>
            <div style="text-align:right;">
              <div data-pct style="font-size:1.1rem;font-weight:800;color:var(--red);opacity:0.9;">${pctB}%</div>
              <div data-odds style="font-size:0.65rem;color:var(--white3);">${oddsB}x payout</div>
            </div>
          </button>
        </div>

        <!-- Amount -->
        <div style="margin-top:1.25rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
            <span style="font-size:0.68rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.05em;">Amount</span>
            <span style="font-size:0.78rem;color:var(--white3);">Balance: <strong style="color:var(--green);opacity:0.9;">${State.userTokens.toLocaleString()}</strong></span>
          </div>

          <input type="range" id="vote-amount-slider"
                 min="${MIN_STAKE}" max="${Math.min(Math.max(State.userTokens, MIN_STAKE), MAX_PREDICTION_AMOUNT)}" 
                 value="${Math.min(50, Math.max(State.userTokens, MIN_STAKE))}"
                 step="5"
                 oninput="updatePotentialWinnings()"
                 ${State.userTokens < MIN_STAKE ? 'disabled' : ''}
                 style="width:100%;height:5px;-webkit-appearance:none;appearance:none;
                        background:var(--white1);border-radius:3px;outline:none;cursor:${State.userTokens < MIN_STAKE ? 'not-allowed' : 'pointer'};margin-bottom:0.75rem;opacity:${State.userTokens < MIN_STAKE ? '0.5' : '1'};">

          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
            <input type="number" id="vote-amount-input" value="50" min="${MIN_STAKE}" max="${Math.min(State.userTokens, MAX_PREDICTION_AMOUNT)}" step="5"
                   oninput="syncSliderWithInput()"
                   style="flex:1;padding:0.7rem;background:var(--white1);border:1px solid var(--border2);
                          border-radius:8px;color:var(--white);font-size:1rem;font-weight:600;
                          text-align:center;outline:none;">
            <span style="color:var(--white3);font-size:0.78rem;white-space:nowrap;">tokens</span>
          </div>

          <div style="font-size:0.7rem;color:var(--white3);margin-bottom:0.5rem;text-align:center;">
            <span style="color:var(--yellow);">⚠️ 20 token fee applies</span> · Multiples of 5 only · Max 500,000
          </div>
          <div style="display:flex;gap:0.35rem;">
            ${[25, 100, 500, 'Half', 'Max'].map(v => `
              <button onclick="setAmount(${v === 'Half' ? 'Math.floor(Math.min(State.userTokens, MAX_PREDICTION_AMOUNT)/2)' : v === 'Max' ? 'Math.min(State.userTokens, MAX_PREDICTION_AMOUNT)' : v})"
                      style="flex:1;padding:0.4rem 0.2rem;background:var(--white1);border:none;
                             border-radius:6px;color:var(--white3);font-size:0.68rem;cursor:pointer;
                             transition:all 0.15s;font-family:var(--font-mono);"
                      onmouseover="this.style.background='var(--dark2)';this.style.color='var(--white)'"
                      onmouseout="this.style.background='var(--white1)';this.style.color='var(--white3)'">${v}</button>
            `).join('')}
          </div>
        </div>

        <!-- Potential winnings -->
        <div style="margin-top:1.25rem;padding:1rem;
                    background:rgba(127,255,127,0.04);
                    border:1px solid rgba(127,255,127,0.12);border-radius:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
            <span style="font-size:0.7rem;color:var(--white3);">Potential Return</span>
            <span style="font-size:0.7rem;color:var(--green);opacity:0.85;font-weight:600;" id="payout-multiplier">
              ${preselectedOpt ? (preselectedOpt === 'a' ? oddsA : oddsB) : '—'}x
            </span>
          </div>
          <div style="font-size:1.75rem;font-weight:800;color:var(--green);opacity:0.9;" id="potential-return">
            ${preselectedOpt ? '+' + Math.floor(50 * (preselectedOpt === 'a' ? parseFloat(oddsA) : parseFloat(oddsB))) : '—'}
          </div>
          <div style="font-size:0.7rem;color:var(--white3);margin-top:0.15rem;">tokens if you win</div>
        </div>
      </div>

      </div>

      <!-- Confirm -->
      <div style="padding:0.75rem 1.5rem 1.5rem;border-top:1px solid var(--border);flex-shrink:0;background:var(--off-black);">
        <button id="confirm-vote-btn" onclick="confirmPolymarketVote()"
                style="width:100%;padding:0.95rem;
                       background:${preselectedOpt ? 'var(--green)' : 'var(--white1)'};
                       color:${preselectedOpt ? 'var(--black)' : 'var(--white3)'};
                       border:none;border-radius:10px;font-size:0.95rem;font-weight:700;
                       cursor:${preselectedOpt ? 'pointer' : 'default'};transition:all 0.2s;">
          ${preselectedOpt ? 'Place Prediction' : 'Select an Outcome First'}
        </button>
      </div>
    </div>
  `;

  if (!document.getElementById('vote-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'vote-modal-styles';
    style.textContent = `
      #vote-amount-slider::-webkit-slider-thumb {
        -webkit-appearance:none; width:18px; height:18px;
        background:var(--green); border-radius:50%; cursor:pointer;
        opacity:0.85;
      }
      .outcome-btn:hover { transform: translateY(-1px); }
    `;
    document.head.appendChild(style);
  }

  modal.style.display = 'flex';
  void modal.offsetWidth;
  modal.classList.add('active');

  // Load AI context async — non-blocking
  if (typeof loadAndInjectContext === 'function') {
    loadAndInjectContext(id, m.question, m.cat || '');
  }

  if (preselectedOpt && window.innerWidth <= 640) {
    setTimeout(() => {
      const btn = document.getElementById('confirm-vote-btn');
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
  }
}

// ── Close vote modal ──────────────────────────────────────────────────
function closePolymarketVoteModal() {
  const modal = document.getElementById('polymarket-vote-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
  }
  State.selectedVoteOption = null;
  State.activeMarketId     = null;
}

// ── Open Read Modal (Read-only mode to view AI Summary) ─────────────────
function openReadModal(marketId) {
  const id = String(marketId);
  const m  = findMarketById(id);
  if (!m) {
    if (!demoMode && db) fetchAndShowMarketModal(id);
    else showToast('Market not found', 'red');
    return;
  }

  State.activeMarketId = id;
  State.selectedVoteOption = null;

  const pctA   = m.pctA || 50;
  const pctB   = 100 - pctA;
  const oddsA  = pctA > 0 ? (100 / pctA).toFixed(2) : '∞';
  const oddsB  = pctB > 0 ? (100 / pctB).toFixed(2) : '∞';
  const total  = m.totalTokens || m.tokens || 0;
  const dLeft  = getDaysRemaining(m.ends);

  let modal = document.getElementById('polymarket-vote-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id        = 'polymarket-vote-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal" style="max-width:420px;padding:0;overflow:hidden;
                               background:var(--off-black);border:1px solid var(--border2);">
      <!-- Header -->
      <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);flex-shrink:0;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;">
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.68rem;color:var(--green);opacity:0.8;text-transform:uppercase;
                        letter-spacing:0.1em;margin-bottom:0.25rem;">${escHtml(m.cat || '')}</div>
            <h3 style="font-size:0.95rem;line-height:1.45;margin:0;color:var(--white);">${escHtml(m.question)}</h3>
          </div>
          <button onclick="closePolymarketVoteModal()"
                  style="background:none;border:none;color:var(--white3);font-size:1.4rem;cursor:pointer;
                         padding:0;width:32px;height:32px;display:flex;align-items:center;
                         justify-content:center;border-radius:50%;flex-shrink:0;">✕</button>
        </div>
        <div style="margin-top:0.5rem;font-size:0.72rem;color:var(--white3);font-family:var(--font-mono);">
          ${dLeft ? dLeft + ' · ' : ''}${total.toLocaleString()} tokens pooled
        </div>
      </div>

      <!-- Scrollable Content Area -->
      <div style="overflow-y:auto;max-height:calc(85vh - 140px);padding:1.25rem 1.5rem;">
        <!-- AI Market Context Panel (populated async by groq.js) -->
        <div id="groq-context-panel" style="display:none;margin:0 0 1rem 0;"></div>

        <!-- Market Stats -->
        <div style="display:flex;flex-direction:column;gap:0.55rem;margin-bottom:1.5rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1rem;
                      background:var(--dark);border:1px solid var(--border2);border-radius:10px;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <span style="font-weight:600;color:var(--white);font-size:0.9rem;">${escHtml(m.optA || 'Yes')}</span>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.1rem;font-weight:800;color:var(--green);opacity:0.9;">${pctA}%</div>
              <div style="font-size:0.65rem;color:var(--white3);">${oddsA}x payout</div>
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1rem;
                      background:var(--dark);border:1px solid var(--border2);border-radius:10px;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <span style="font-weight:600;color:var(--white);font-size:0.9rem;">${escHtml(m.optB || 'No')}</span>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.1rem;font-weight:800;color:var(--red);opacity:0.9;">${pctB}%</div>
              <div style="font-size:0.65rem;color:var(--white3);">${oddsB}x payout</div>
            </div>
          </div>
        </div>

        <p style="font-size:0.8rem;color:var(--white3);line-height:1.6;margin:0 0 1rem 0;">
          Read the AI briefing above to understand the market context, then click below to place your prediction.
        </p>
      </div>

      <!-- Footer Actions -->
      <div style="padding:0.75rem 1.5rem 1.5rem;border-top:1px solid var(--border);flex-shrink:0;background:var(--off-black);">
        <button onclick="closePolymarketVoteModal();setTimeout(()=>openVote('${id}',null,null),300);"
                style="width:100%;padding:0.95rem;background:var(--green);color:var(--black);
                       border:none;border-radius:10px;font-size:0.95rem;font-weight:700;
                       cursor:pointer;transition:all 0.2s;">
          Place Prediction →
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  void modal.offsetWidth;
  modal.classList.add('active');

  // Load AI context async — non-blocking
  if (typeof loadAndInjectContext === 'function') {
    loadAndInjectContext(id, m.question, m.cat || '');
  }
}

let currentOdds = 1;
let currentMarketProb = 50;

function scrollToConfirmButton() {
  if (window.innerWidth <= 640) {
    setTimeout(() => {
      const btn = document.getElementById('confirm-vote-btn');
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
}

function selectOutcome(opt, prob, odds) {
  State.selectedVoteOption = opt;
  
  // Calculate current odds from the market data to ensure consistency
  const m = findMarketById(String(State.activeMarketId));
  if (m) {
    const pctA = m.pctA || 50;
    const pctB = 100 - pctA;
    if (opt === 'a' && pctA > 0) {
      currentOdds = 100 / pctA;
    } else if (opt === 'b' && pctB > 0) {
      currentOdds = 100 / pctB;
    } else {
      currentOdds = parseFloat(odds) || 2;
    }
  } else {
    currentOdds = parseFloat(odds) || 2;
  }

  document.querySelectorAll('.outcome-btn').forEach(btn => {
    btn.classList.remove('selected');
    btn.style.borderColor = 'var(--border2)';
    btn.style.background  = 'var(--dark)';
    const radio = btn.querySelector('.radio-circle');
    if (radio) { radio.style.borderColor = 'var(--white3)'; radio.innerHTML = ''; }
  });

  const sel = document.querySelector(`.outcome-btn[data-option="${opt}"]`);
  if (sel) {
    sel.classList.add('selected');
    const col    = opt === 'a' ? 'rgba(127,255,127,0.5)' : 'rgba(224,80,80,0.5)';
    const colSolid = opt === 'a' ? 'var(--green)' : 'var(--red)';
    sel.style.borderColor = col;
    sel.style.background  = opt === 'a' ? 'rgba(127,255,127,0.06)' : 'rgba(224,80,80,0.06)';
    const radio = sel.querySelector('.radio-circle');
    if (radio) {
      radio.style.borderColor = colSolid;
      radio.innerHTML = `<div style="width:8px;height:8px;background:${colSolid};border-radius:50%;opacity:0.9;"></div>`;
    }
  }

  const mulEl = document.getElementById('payout-multiplier');
  if (mulEl) mulEl.textContent = odds + 'x';
  updatePotentialWinnings();

  const btn = document.getElementById('confirm-vote-btn');
  if (btn) {
    btn.style.background    = 'var(--green)';
    btn.style.color         = 'var(--black)';
    btn.style.cursor        = 'pointer';
    btn.textContent         = 'Place Prediction';
  }

  scrollToConfirmButton();
}

function setAmount(amount) {
  const slider = document.getElementById('vote-amount-slider');
  const input  = document.getElementById('vote-amount-input');
  if (!slider || !input) return;
  // Round to nearest multiple of 5
  let valid = Math.round(Number(amount) / 5) * 5;
  // Ensure at least MIN_STAKE (25) and at most MAX_PREDICTION_AMOUNT or user's tokens
  valid = Math.min(Math.max(valid, MIN_STAKE), Math.min(State.userTokens, MAX_PREDICTION_AMOUNT));
  slider.value = valid;
  input.value  = valid;
  updatePotentialWinnings();
  scrollToConfirmButton();
}

function syncSliderWithInput() {
  const slider = document.getElementById('vote-amount-slider');
  const input  = document.getElementById('vote-amount-input');
  if (!slider || !input) return;
  // Round to nearest multiple of 5
  let val = Math.round((parseInt(input.value) || MIN_STAKE) / 5) * 5;
  // Ensure at least MIN_STAKE and at most MAX_PREDICTION_AMOUNT or user's tokens
  val = Math.min(Math.max(val, MIN_STAKE), Math.min(State.userTokens, MAX_PREDICTION_AMOUNT));
  slider.value = val;
  input.value  = val;
  updatePotentialWinnings();
  scrollToConfirmButton();
}

function updatePotentialWinnings() {
  const slider = document.getElementById('vote-amount-slider');
  const input  = document.getElementById('vote-amount-input');
  if (!slider || !input) return;
  
  // Clamp amount between MIN_STAKE and user's tokens (max 500,000), round to multiple of 5
  let amount = parseInt(slider.value) || MIN_STAKE;
  amount = Math.round(amount / 5) * 5;
  amount = Math.min(Math.max(amount, MIN_STAKE), Math.min(State.userTokens, MAX_PREDICTION_AMOUNT));
  
  slider.value = amount;
  input.value  = amount;
  
  // Only show potential return if an option is selected
  const returnEl = document.getElementById('potential-return');
  const mulEl = document.getElementById('payout-multiplier');
  
  if (State.selectedVoteOption) {
    // Calculate potential win based on stake amount (total - fee)
    const stakeAmount = Math.max(0, amount - PREDICTION_FEE);
    const potReturn = Math.floor(stakeAmount * currentOdds);
    if (returnEl) returnEl.textContent = '+' + potReturn.toLocaleString();
    if (mulEl) mulEl.textContent = currentOdds.toFixed(2) + 'x';
  } else {
    if (returnEl) returnEl.textContent = '—';
    if (mulEl) mulEl.textContent = '—';
  }
}

// ── Prevent double submission lock ────────────────────────────────────
let _isSubmittingPrediction = false;

// ── Confirm and submit a prediction — fully persisted ─────────────────
async function confirmPolymarketVote() {
  if (_isSubmittingPrediction) { return; } // Prevent double-click
  if (!State.selectedVoteOption) { showToast('Select an outcome first', 'yellow'); return; }

  // Get the slider and validate market exists
  const slider = document.getElementById('vote-amount-slider');
  if (!slider) { return; }
  
  const totalAmount = parseInt(slider.value, 10);
  if (!totalAmount || totalAmount < MIN_STAKE) { showToast('Minimum total is 25 tokens (20 fee + 5 stake)', 'yellow'); return; }
  
  // Validate amount is multiple of 5
  if (totalAmount % 5 !== 0) { showToast('Amount must be in multiples of 5', 'yellow'); return; }
  
  // The actual stake is total minus the fee
  const stakeAmount = totalAmount - PREDICTION_FEE;
  if (stakeAmount < 5) { showToast('Minimum stake after fee is 5 tokens', 'yellow'); return; }

  // Fetch fresh token balance from Firestore to prevent stale-state bugs
  let freshTokens = State.userTokens;
  if (!demoMode && db && State.currentUser) {
    try {
      const userSnap = await db.collection('users').doc(State.currentUser.uid).get();
      if (userSnap.exists && typeof userSnap.data().tokens === 'number') {
        freshTokens = userSnap.data().tokens;
        State.userTokens = freshTokens; // sync local state
        updateTokenDisplay();
      }
    } catch (_) { /* use local value if fetch fails */ }
  }
  
  if (totalAmount > freshTokens) { showToast(`Not enough tokens! Need ${totalAmount} (${stakeAmount} + ${PREDICTION_FEE} fee)`, 'red'); return; }

  const m = findMarketById(String(State.activeMarketId));
  if (!m) { showToast('Market not found', 'red'); return; }

  // Calculate odds and potential win (based on stake amount, not total)
  const pctA   = m.pctA || 50;
  const pctB   = 100 - pctA;
  const oddsA  = pctA > 0 ? (100 / pctA) : 2;
  const oddsB  = pctB > 0 ? (100 / pctB) : 2;
  const liveOdds = State.selectedVoteOption === 'a' ? oddsA : oddsB;
  const potentialWin = Math.floor(stakeAmount * liveOdds);
  const optLabel = State.selectedVoteOption === 'a' ? (m.optA || 'Yes') : (m.optB || 'No');

  // ── Attention gate: user must confirm they've read the context ──────
  const confirmed = await showAttentionOverlay(optLabel, totalAmount, potentialWin);
  if (!confirmed) return; // User bailed
  // ── End attention gate ─────────────────────────────────────────────
  
  // Prevent double submission - check flag immediately before any state changes
  if (_isSubmittingPrediction) { return; }
  _isSubmittingPrediction = true;
  
  // Build prediction entry - ensure no undefined values
  // Note: we record stakeAmount (total - fee), not totalAmount
  const predictionEntry = {
    marketId:    String(State.activeMarketId),
    question:    m.question || 'Unknown',
    option:      optLabel,
    amount:      stakeAmount,  // Actual stake after fee
    fee:         PREDICTION_FEE,  // Fee charged
    totalDeducted: totalAmount,  // Total deducted from user
    potentialWin: potentialWin,
    odds:        Math.round(liveOdds * 100) / 100, // Round to 2 decimal places
    status:      'pending',
    createdAt:   new Date().toISOString()
  };

  // Optimistic local update (ensure never goes below 0)
  // Deduct total amount (stake + fee)
  State.userTokens = Math.max(0, State.userTokens - totalAmount);
  State.userPredictions.push(predictionEntry);

  // Disable confirm button immediately to prevent double-submit
  const btn = document.getElementById('confirm-vote-btn');
  if (btn) { 
    btn.disabled = true; 
    btn.textContent = 'Confirming…';
    btn.style.opacity = '0.7';
    btn.style.cursor = 'not-allowed';
  }

  // Use a batch write for atomic operations
  if (!demoMode && db && State.currentUser) {
    try {
      const userRef = db.collection('users').doc(State.currentUser.uid);
      const mktRef = db.collection('markets').doc(State.activeMarketId);
      const voteRef = mktRef.collection('votes').doc();
      
      // Verify user has sufficient tokens before batch
      const userSnap = await userRef.get();
      const userData = userSnap.exists ? userSnap.data() : { tokens: 0 };
      const currentTokens = typeof userData.tokens === 'number' ? userData.tokens : 0;
      
      if (currentTokens < totalAmount) {
        State.userTokens += totalAmount;
        State.userPredictions.pop();
        if (btn) { btn.disabled = false; btn.textContent = 'Place Prediction'; }
        _isSubmittingPrediction = false;
        showToast(`Not enough tokens! Need ${totalAmount} (${stakeAmount} stake + ${PREDICTION_FEE} fee)`, 'red');
        return;
      }
      
      // Execute batch write for atomicity
      const batch = db.batch();
      
      // 1. Record the vote (stake amount only, fee goes to platform)
      batch.set(voteRef, {
        userId:    State.currentUser.uid,
        userName:  State.currentUser.displayName || State.currentUser.email?.split('@')[0] || 'User',
        option:    State.selectedVoteOption,
        amount:    stakeAmount,  // Only stake goes to market pool
        fee:       PREDICTION_FEE,  // Fee recorded
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // 2. Deduct user tokens (total = stake + fee) and add prediction
      batch.update(userRef, {
        tokens:      firebase.firestore.FieldValue.increment(-totalAmount),
        predictions: firebase.firestore.FieldValue.arrayUnion(predictionEntry)
      });
      
      // 3. Increment market token pool (only stake amount, not fee)
      batch.update(mktRef, {
        tokens: firebase.firestore.FieldValue.increment(stakeAmount)
      });
      
      await batch.commit();
      
    } catch (e) {
      // Rollback local state on failure
      State.userTokens += totalAmount;
      State.userPredictions.pop();
      console.error('Vote commit failed:', e);
      if (btn) { btn.disabled = false; btn.textContent = 'Place Prediction'; }
      _isSubmittingPrediction = false;
      const errorMsg = e.message || e.code || 'Unknown error';
      showToast('Failed: ' + errorMsg, 'red');
      return;
    }
  }

  updateTokenDisplay();
  closePolymarketVoteModal();
  showToast(`🎯 ${stakeAmount} tokens staked (+${PREDICTION_FEE} fee) — potential +${potentialWin} if correct!`, 'green');

  // Refresh markets to show "Predicted" badge
  renderMarkets(_currentMarketFilter);
  if (typeof updateHomeMarketsPreview === 'function') updateHomeMarketsPreview();
  if (typeof updateCommunityPage === 'function') updateCommunityPage();

  if (typeof renderProfile === 'function') {
    const histEl = document.getElementById('prediction-history');
    if (histEl) renderProfile();
  }
  
  _isSubmittingPrediction = false;
}

// ── Legacy fallback stubs ─────────────────────────────────────────────
function closeVoteModal() {
  const modal = document.getElementById('vote-modal');
  if (modal) modal.classList.remove('open');
}
function selectVoteOption(opt) {
  State.selectedVoteOption = opt;
  document.querySelectorAll('.vote-option').forEach(el => el.classList.remove('selected'));
  const el = document.getElementById('vote-opt-' + opt);
  if (el) el.classList.add('selected');
}
function confirmVote() {
  closeVoteModal();
  if (State.activeMarketId) openVote(State.activeMarketId, State.selectedVoteOption, null);
}
