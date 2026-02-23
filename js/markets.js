// ─────────────────────────────────────────────────────────────────────
// markets.js — Render markets list, create market, vote modal
// ─────────────────────────────────────────────────────────────────────

// ── Helper: find a market by id across ALL sources ────────────────────
function findMarketById(marketId) {
  // Normalise to string for safe comparison
  const id = String(marketId);
  const all = [
    ...SAMPLE_MARKETS.map(m => ({ ...m, id: String(m.id) })),
    ...State.firestoreMarkets.map(m => ({ ...m, id: String(m.firestoreId || m.id) })),
    ...State.userCreatedMarkets.map(m => ({ ...m, id: String(m.firestoreId || m.id) }))
  ];
  return all.find(m => m.id === id) || null;
}

// ── Load live markets from Firestore, then render ─────────────────────
async function loadAndRenderMarkets() {
  renderMarkets(); // instant render with seed data

  if (demoMode || !db) return;

  const fetched = [];

  try {
    const snapLive = await db.collection('markets')
      .where('status', '==', 'live')
      .get();
    snapLive.forEach(doc => {
      fetched.push({ id: doc.id, firestoreId: doc.id, ...doc.data(), status: 'live' });
    });
  } catch (e) { console.warn('Failed to fetch live markets:', e); }

  try {
    const snapApproved = await db.collection('markets')
      .where('status', '==', 'approved')
      .get();
    snapApproved.forEach(doc => {
      fetched.push({ id: doc.id, firestoreId: doc.id, ...doc.data(), status: 'live' });
    });
  } catch (e) { console.warn('Failed to fetch approved markets:', e); }

  // Deduplicate
  const seen = new Set();
  const unique = fetched.filter(m => {
    const k = m.firestoreId;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  unique.sort((a, b) => {
    const tA = a.approvedAt?.seconds || a.createdAt?.seconds || 0;
    const tB = b.approvedAt?.seconds || b.createdAt?.seconds || 0;
    return tB - tA;
  });

  State.firestoreMarkets = unique;
  renderMarkets();
}

// ── Render all markets on the Markets page ────────────────────────────
function renderMarkets(filter = 'all') {
  const list = document.getElementById('markets-list');
  const emptyEl = document.getElementById('markets-empty-state');
  if (!list) return;

  // Always show the list container
  list.style.display = '';
  if (emptyEl) emptyEl.style.display = 'none';

  // Combine all non-rejected sources
  const firestoreMarkets = (State.firestoreMarkets || []).filter(m => m.status !== 'rejected');
  const userMarkets = (State.userCreatedMarkets || []).filter(m => m.status !== 'rejected');

  let allMarkets = [...SAMPLE_MARKETS, ...firestoreMarkets, ...userMarkets];

  // Apply category filter
  if (filter && filter !== 'all') {
    allMarkets = allMarkets.filter(m => {
      const cat = (m.cat || '').toLowerCase();
      return cat.includes(filter.toLowerCase());
    });
  }

  // Sort: newest first (firestore markets by approval time, others by creation)
  allMarkets.sort((a, b) => {
    const getTime = m => {
      if (m.approvedAt?.seconds) return m.approvedAt.seconds * 1000;
      if (m.approvedAt?.toMillis) return m.approvedAt.toMillis();
      if (m.createdAt?.seconds) return m.createdAt.seconds * 1000;
      if (m.createdAt?.toMillis) return m.createdAt.toMillis();
      const p = new Date(m.createdAt || '2020-01-01').getTime();
      return isNaN(p) ? 0 : p;
    };
    return getTime(b) - getTime(a);
  });

  if (allMarkets.length === 0) {
    list.innerHTML = `
      <div style="text-align:center;padding:4rem 2rem;color:var(--white3);font-family:var(--font-mono);font-size:0.85rem;">
        No markets found for this filter.
      </div>`;
    return;
  }

  list.innerHTML = '';
  allMarkets.forEach(m => {
    const pctB = 100 - (m.pctA || 50);
    const marketId = String(m.firestoreId || m.id);
    const isLive = m.status === 'live';
    const isUserOwned = !!m.createdBy;
    const isCurrentUserMarket = isUserOwned && m.createdBy === State.currentUser?.uid;
    const creatorName = m.createdByName || '';

    const card = document.createElement('div');
    card.className = 'market-card-full';
    card.dataset.marketId = marketId;

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.75rem;">
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
          <div class="market-status ${isLive ? 'status-live' : 'status-pending'}">
            ${isLive ? '● Live' : '⏳ Under Review'}
          </div>
          ${isCurrentUserMarket ? `<span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--yellow);background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.25);padding:0.15rem 0.45rem;border-radius:4px;">Your Market</span>` : ''}
        </div>
        <button onclick="event.stopPropagation();shareMarket('${marketId}', '${escHtml(m.question).replace(/'/g, "\\'")}', 'markets')"
                style="background:var(--white1);border:none;border-radius:50%;width:36px;height:36px;min-width:36px;
                       cursor:pointer;display:flex;align-items:center;justify-content:center;
                       transition:all 0.2s;font-size:1rem;"
                title="Share this market"
                onmouseover="this.style.background='var(--green)'"
                onmouseout="this.style.background='var(--white1)'">
          🔗
        </button>
      </div>

      <div class="market-cat" style="margin-bottom:0.5rem;">${escHtml(m.cat || '')}</div>
      <h3 style="margin-bottom:1rem;">${escHtml(m.question)}</h3>

      <!-- Probability bar -->
      <div style="display:flex;align-items:center;gap:0.75rem;margin:1rem 0;">
        <div style="text-align:center;min-width:52px;">
          <div style="font-size:1.4rem;font-weight:800;color:var(--green);line-height:1;">${m.pctA}%</div>
          <div style="font-size:0.7rem;color:var(--white3);margin-top:2px;">${escHtml(m.optA || 'Yes')}</div>
        </div>
        <div style="flex:1;height:10px;background:var(--white1);border-radius:5px;overflow:hidden;position:relative;">
          <div style="position:absolute;left:0;top:0;height:100%;width:${m.pctA}%;background:var(--green);transition:width 0.4s;"></div>
          <div style="position:absolute;right:0;top:0;height:100%;width:${pctB}%;background:#ff5555;transition:width 0.4s;"></div>
        </div>
        <div style="text-align:center;min-width:52px;">
          <div style="font-size:1.4rem;font-weight:800;color:#ff5555;line-height:1;">${pctB}%</div>
          <div style="font-size:0.7rem;color:var(--white3);margin-top:2px;">${escHtml(m.optB || 'No')}</div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.75rem;
                  font-family:var(--font-mono);font-size:0.72rem;color:var(--white3);flex-wrap:wrap;gap:0.5rem;">
        <span>📅 Ends: ${escHtml(String(m.ends || '—'))}</span>
        <span style="color:var(--green-dim);">🎟️ ${(m.tokens || 0).toLocaleString()} pooled</span>
      </div>

      ${creatorName ? `
        <div style="margin-top:0.5rem;font-family:var(--font-mono);font-size:0.7rem;color:var(--white3);">
          Created by
          <button onclick="event.stopPropagation();viewUserProfile('${escHtml(m.createdBy || '')}','${escHtml(creatorName)}')"
                  style="background:none;border:none;color:var(--green);cursor:pointer;font-family:var(--font-mono);font-size:0.7rem;padding:0;text-decoration:underline;">
            ${escHtml(creatorName)}
          </button>
        </div>
      ` : ''}

      ${isLive
        ? `<div style="display:flex;gap:0.75rem;margin-top:1rem;">
             <button onclick="event.stopPropagation();openVote('${marketId}','a',event)"
                     style="flex:1;padding:0.875rem;background:var(--green);color:var(--black);
                            border:none;border-radius:8px;font-weight:700;cursor:pointer;
                            transition:all 0.2s;font-size:0.9rem;"
                     onmouseover="this.style.filter='brightness(1.15)'"
                     onmouseout="this.style.filter=''">
               ${escHtml(m.optA || 'Yes')}
             </button>
             <button onclick="event.stopPropagation();openVote('${marketId}','b',event)"
                     style="flex:1;padding:0.875rem;background:#ff5555;color:var(--white);
                            border:none;border-radius:8px;font-weight:700;cursor:pointer;
                            transition:all 0.2s;font-size:0.9rem;"
                     onmouseover="this.style.filter='brightness(1.15)'"
                     onmouseout="this.style.filter=''">
               ${escHtml(m.optB || 'No')}
             </button>
           </div>`
        : `<div style="margin-top:1rem;padding:0.75rem;background:var(--white1);border-radius:8px;
                       font-family:var(--font-mono);font-size:0.72rem;color:var(--yellow);text-align:center;">
             🕐 Awaiting admin approval before going live
           </div>`
      }
    `;
    list.appendChild(card);
  });
}

// ── View a user's public profile (from market card) ───────────────────
function viewUserProfile(uid, name) {
  // For now, show a toast. Could expand to a modal or page navigation.
  showToast(`👤 Viewing ${name}'s profile…`, 'green');
  // If you want to navigate to a profile page for that user:
  // showPage('profile') + load their data — stub for now
}

// ── Polymarket-style Vote Modal ───────────────────────────────────────
function openVote(marketId, preselectedOpt, e) {
  if (e && e.stopPropagation) e.stopPropagation();
  if (!State.currentUser) { openAuth(); return; }

  const id = String(marketId);
  const m = findMarketById(id);
  if (!m) {
    // Might be a firestore market not yet loaded — try fetching
    if (!demoMode && db) fetchAndShowMarketModal(id);
    else showToast('Market not found', 'red');
    return;
  }

  if (m.status === 'rejected') {
    showToast('This market has been removed.', 'red');
    return;
  }
  if (m.status !== 'live') {
    showToast('This market is still under review.', 'yellow');
    return;
  }

  State.activeMarketId = id;
  State.selectedVoteOption = preselectedOpt || null;

  const pctA = m.pctA || 50;
  const pctB = 100 - pctA;
  const oddsA = pctA > 0 ? (100 / pctA).toFixed(2) : '∞';
  const oddsB = pctB > 0 ? (100 / pctB).toFixed(2) : '∞';

  currentOdds = preselectedOpt === 'a' ? parseFloat(oddsA)
              : preselectedOpt === 'b' ? parseFloat(oddsB)
              : 1;
  currentMarketProb = pctA;

  // Create / reuse modal element
  let modal = document.getElementById('polymarket-vote-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'polymarket-vote-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal" style="max-width:420px;padding:0;overflow:hidden;background:var(--off-black);border:1px solid var(--border2);">
      <!-- Header -->
      <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;">
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.72rem;color:var(--green);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.25rem;">${escHtml(m.cat || '')}</div>
            <h3 style="font-size:1rem;line-height:1.4;margin:0;color:var(--white);">${escHtml(m.question)}</h3>
          </div>
          <button onclick="closePolymarketVoteModal()"
                  style="background:none;border:none;color:var(--white3);font-size:1.5rem;cursor:pointer;
                         padding:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;
                         border-radius:50%;flex-shrink:0;">✕</button>
        </div>
        <div style="margin-top:0.5rem;font-size:0.78rem;color:var(--white3);">Ends: ${escHtml(String(m.ends || '—'))}</div>
      </div>

      <!-- Outcome + Amount -->
      <div style="padding:1.25rem 1.5rem;">
        <div style="font-size:0.72rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.75rem;">Select Outcome</div>

        <div style="display:flex;flex-direction:column;gap:0.6rem;">
          <button class="outcome-btn ${preselectedOpt === 'a' ? 'selected' : ''}"
                  onclick="selectOutcome('a', ${pctA}, ${oddsA})" data-option="a"
                  style="display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1rem;
                         background:var(--dark);border:2px solid ${preselectedOpt === 'a' ? 'var(--green)' : 'var(--border)'};
                         border-radius:10px;cursor:pointer;transition:all 0.2s;width:100%;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div class="radio-circle" style="width:18px;height:18px;border:2px solid ${preselectedOpt === 'a' ? 'var(--green)' : 'var(--white3)'};border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${preselectedOpt === 'a' ? '<div style="width:8px;height:8px;background:var(--green);border-radius:50%;"></div>' : ''}
              </div>
              <span style="font-weight:600;color:var(--white);font-size:0.95rem;">${escHtml(m.optA || 'Yes')}</span>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.2rem;font-weight:800;color:var(--green);">${pctA}%</div>
              <div style="font-size:0.68rem;color:var(--white3);">${oddsA}x payout</div>
            </div>
          </button>

          <button class="outcome-btn ${preselectedOpt === 'b' ? 'selected' : ''}"
                  onclick="selectOutcome('b', ${pctB}, ${oddsB})" data-option="b"
                  style="display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1rem;
                         background:var(--dark);border:2px solid ${preselectedOpt === 'b' ? '#ff5555' : 'var(--border)'};
                         border-radius:10px;cursor:pointer;transition:all 0.2s;width:100%;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div class="radio-circle" style="width:18px;height:18px;border:2px solid ${preselectedOpt === 'b' ? '#ff5555' : 'var(--white3)'};border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${preselectedOpt === 'b' ? '<div style="width:8px;height:8px;background:#ff5555;border-radius:50%;"></div>' : ''}
              </div>
              <span style="font-weight:600;color:var(--white);font-size:0.95rem;">${escHtml(m.optB || 'No')}</span>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.2rem;font-weight:800;color:#ff5555;">${pctB}%</div>
              <div style="font-size:0.68rem;color:var(--white3);">${oddsB}x payout</div>
            </div>
          </button>
        </div>

        <!-- Amount -->
        <div style="margin-top:1.25rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
            <span style="font-size:0.72rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.05em;">Amount</span>
            <span style="font-size:0.8rem;color:var(--white3);">Balance: <strong style="color:var(--green);">${State.userTokens.toLocaleString()}</strong></span>
          </div>

          <input type="range" id="vote-amount-slider" min="10" max="${Math.max(10, Math.min(State.userTokens, 5000))}" value="50"
                 oninput="updatePotentialWinnings()"
                 style="width:100%;height:6px;-webkit-appearance:none;appearance:none;background:var(--white1);border-radius:3px;outline:none;cursor:pointer;margin-bottom:0.75rem;">

          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
            <input type="number" id="vote-amount-input" value="50" min="10" max="${State.userTokens}"
                   oninput="syncSliderWithInput()"
                   style="flex:1;padding:0.75rem;background:var(--white1);border:1px solid var(--border2);border-radius:8px;
                          color:var(--white);font-size:1rem;font-weight:600;text-align:center;outline:none;">
            <span style="color:var(--white3);font-size:0.8rem;white-space:nowrap;">tokens</span>
          </div>

          <div style="display:flex;gap:0.4rem;">
            ${[10, 50, 100, 'Half', 'Max'].map(v => `
              <button onclick="setAmount(${v === 'Half' ? 'Math.floor(State.userTokens/2)' : v === 'Max' ? 'State.userTokens' : v})"
                      style="flex:1;padding:0.45rem 0.25rem;background:var(--white1);border:none;border-radius:6px;
                             color:var(--white3);font-size:0.72rem;cursor:pointer;transition:all 0.15s;"
                      onmouseover="this.style.background='var(--dark2)';this.style.color='var(--white)'"
                      onmouseout="this.style.background='var(--white1)';this.style.color='var(--white3)'">${v}</button>
            `).join('')}
          </div>
        </div>

        <!-- Potential winnings -->
        <div style="margin-top:1.25rem;padding:1rem;background:linear-gradient(135deg,rgba(0,255,127,0.1),rgba(0,255,127,0.05));
                    border:1px solid rgba(127,255,127,0.3);border-radius:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;">
            <span style="font-size:0.72rem;color:var(--white3);">Potential Return</span>
            <span style="font-size:0.72rem;color:var(--green);font-weight:600;" id="payout-multiplier">${preselectedOpt ? (preselectedOpt === 'a' ? oddsA : oddsB) : '—'}x</span>
          </div>
          <div style="font-size:2rem;font-weight:800;color:var(--green);" id="potential-return">
            ${preselectedOpt ? '+' + Math.floor(50 * (preselectedOpt === 'a' ? parseFloat(oddsA) : parseFloat(oddsB))) : '—'}
          </div>
          <div style="font-size:0.72rem;color:var(--white3);margin-top:0.2rem;">tokens if you win</div>
        </div>
      </div>

      <!-- Confirm Button -->
      <div style="padding:1rem 1.5rem 1.5rem;">
        <button id="confirm-vote-btn" onclick="confirmPolymarketVote()"
                style="width:100%;padding:1rem;background:var(--green);color:var(--black);border:none;
                       border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;transition:all 0.2s;
                       opacity:${preselectedOpt ? '1' : '0.5'};pointer-events:${preselectedOpt ? 'auto' : 'none'};">
          ${preselectedOpt ? 'Place Prediction' : 'Select an Outcome First'}
        </button>
      </div>
    </div>
  `;

  // Inject slider thumb style once
  if (!document.getElementById('vote-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'vote-modal-styles';
    style.textContent = `
      #vote-amount-slider::-webkit-slider-thumb {
        -webkit-appearance:none; width:20px; height:20px;
        background:var(--green); border-radius:50%; cursor:pointer;
        box-shadow:0 0 8px rgba(0,255,127,0.5);
      }
      .outcome-btn:hover { transform: translateY(-1px); }
    `;
    document.head.appendChild(style);
  }

  modal.style.display = 'flex';
  void modal.offsetWidth;
  modal.classList.add('active');
  
  // On mobile, ensure the confirm button is visible after modal opens
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
  State.activeMarketId = null;
}

let currentOdds = 1;
let currentMarketProb = 50;

function selectOutcome(opt, prob, odds) {
  State.selectedVoteOption = opt;
  currentOdds = parseFloat(odds);

  document.querySelectorAll('.outcome-btn').forEach(btn => {
    btn.classList.remove('selected');
    btn.style.borderColor = 'var(--border)';
    btn.style.background = 'var(--dark)';
    const radio = btn.querySelector('.radio-circle');
    if (radio) { radio.style.borderColor = 'var(--white3)'; radio.innerHTML = ''; }
  });

  const sel = document.querySelector(`.outcome-btn[data-option="${opt}"]`);
  if (sel) {
    sel.classList.add('selected');
    const col = opt === 'a' ? 'var(--green)' : '#ff5555';
    sel.style.borderColor = col;
    sel.style.background = opt === 'a' ? 'rgba(0,255,127,0.08)' : 'rgba(255,85,85,0.08)';
    const radio = sel.querySelector('.radio-circle');
    if (radio) {
      radio.style.borderColor = col;
      radio.innerHTML = `<div style="width:8px;height:8px;background:${col};border-radius:50%;"></div>`;
    }
  }

  const mulEl = document.getElementById('payout-multiplier');
  if (mulEl) mulEl.textContent = odds + 'x';
  updatePotentialWinnings();

  const btn = document.getElementById('confirm-vote-btn');
  if (btn) {
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.textContent = 'Place Prediction';
  }
  
  // Scroll to confirm button after selecting outcome
  scrollToConfirmButton();
}

function setAmount(amount) {
  const slider = document.getElementById('vote-amount-slider');
  const input = document.getElementById('vote-amount-input');
  if (!slider || !input) return;
  const valid = Math.min(Math.max(Number(amount) || 10, 10), State.userTokens);
  slider.value = valid;
  input.value = valid;
  updatePotentialWinnings();
  // Scroll to confirm button after setting amount
  scrollToConfirmButton();
}

function syncSliderWithInput() {
  const slider = document.getElementById('vote-amount-slider');
  const input = document.getElementById('vote-amount-input');
  if (!slider || !input) return;
  let val = parseInt(input.value) || 10;
  val = Math.min(Math.max(val, 10), State.userTokens);
  slider.value = val;
  input.value = val;
  updatePotentialWinnings();
  // Scroll to confirm button after input change
  scrollToConfirmButton();
}

function scrollToConfirmButton() {
  // On mobile, scroll the button into view after a short delay
  if (window.innerWidth <= 640) {
    setTimeout(() => {
      const btn = document.getElementById('confirm-vote-btn');
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }
}

function updatePotentialWinnings() {
  const slider = document.getElementById('vote-amount-slider');
  const input = document.getElementById('vote-amount-input');
  if (!slider || !input) return;
  const amount = parseInt(slider.value) || 50;
  input.value = amount;
  const potentialReturn = Math.floor(amount * currentOdds);
  const returnEl = document.getElementById('potential-return');
  if (returnEl) returnEl.textContent = State.selectedVoteOption ? '+' + potentialReturn : '—';
  
  // Scroll to confirm button so it's visible after adjusting amount
  scrollToConfirmButton();
}

function confirmPolymarketVote() {
  if (!State.selectedVoteOption) { showToast('Select an outcome first', 'yellow'); return; }

  const slider = document.getElementById('vote-amount-slider');
  if (!slider) return;
  const amount = parseInt(slider.value, 10);
  if (!amount || amount < 10) { showToast('Minimum stake is 10 tokens', 'yellow'); return; }
  if (amount > State.userTokens) { showToast('Not enough tokens!', 'red'); return; }

  const m = findMarketById(String(State.activeMarketId));
  if (!m) { showToast('Market not found', 'red'); return; }

  const optLabel = State.selectedVoteOption === 'a' ? m.optA : m.optB;
  const potentialWin = Math.floor(amount * currentOdds);

  State.userTokens -= amount;
  State.userPredictions.push({
    marketId: State.activeMarketId,
    question: m.question,
    option: optLabel,
    amount,
    potentialWin,
    odds: currentOdds,
    status: 'pending'
  });

  updateTokenDisplay();
  closePolymarketVoteModal();
  showToast(`🎯 ${amount} tokens on "${optLabel}" — potential win: ${potentialWin}!`, 'green');

  if (!demoMode && typeof saveUserData === 'function') saveUserData();
  if (typeof renderProfile === 'function') {
    const histEl = document.getElementById('prediction-history');
    if (histEl) renderProfile();
  }
}

// ── Old fallback vote modal stubs ─────────────────────────────────────
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
