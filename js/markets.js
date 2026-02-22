// ─────────────────────────────────────────────────────────────────────
// markets.js — Render markets list, create market, vote modal
// ─────────────────────────────────────────────────────────────────────

// ── Load live markets from Firestore, then render ─────────────────────
async function loadAndRenderMarkets() {
  renderMarkets(); // instant render with what we have

  if (demoMode || !db) return;

  try {
    // Simple .where() only — no orderBy needed, avoids composite index error
    const snap = await db.collection('markets')
      .where('status', '==', 'live')
      .get();

    const fetched = [];
    snap.forEach(doc => {
      fetched.push({ id: doc.id, firestoreId: doc.id, ...doc.data() });
    });

    // Sort newest-approved first, done client-side
    fetched.sort((a, b) => {
      const tA = a.approvedAt?.seconds || 0;
      const tB = b.approvedAt?.seconds || 0;
      return tB - tA;
    });

    State.firestoreMarkets = fetched;
    renderMarkets(); // re-render with full live dataset
  } catch (e) {
    console.warn('Failed to load Firestore markets:', e);
  }
}

// ── Render all markets on the Markets page ────────────────────────────
function renderMarkets() {
  const allMarkets = [
    ...SAMPLE_MARKETS,
    ...(State.firestoreMarkets || []),
    ...State.userCreatedMarkets
  ];
  const list = document.getElementById('markets-list');
  if (!list) return;
  
  list.innerHTML = '';

  allMarkets.forEach(m => {
    const pctB = 100 - m.pctA;
    const isUser = !!m.createdBy;
    const card = document.createElement('div');
    card.className = 'market-card-full';
    card.innerHTML = `
      <div class="market-status ${m.status === 'live' ? 'status-live' : 'status-pending'}">
        ${m.status === 'live' ? '● Live' : '⏳ Under Review'}
        ${isUser ? ' · Your Market' : ''}
      </div>
      <h3>${escHtml(m.question)}</h3>
      <div class="market-cat" style="margin-bottom:0.75rem">${m.cat}</div>
      
      <!-- Polymarket-style probability bar -->
      <div class="prob-container" style="display:flex;align-items:center;gap:1rem;margin:1rem 0;">
        <div class="prob-yes" style="text-align:center;flex:1;">
          <div style="font-size:1.5rem;font-weight:800;color:var(--green);">${m.pctA}%</div>
          <div style="font-size:0.75rem;color:var(--white3);">${escHtml(m.optA)}</div>
        </div>
        <div class="prob-bar-wrapper" style="flex:2;height:12px;background:var(--white1);border-radius:6px;overflow:hidden;position:relative;">
          <div class="prob-fill-yes" style="position:absolute;left:0;top:0;height:100%;width:${m.pctA}%;background:var(--green);"></div>
          <div class="prob-fill-no" style="position:absolute;right:0;top:0;height:100%;width:${pctB}%;background:#ff5555;"></div>
        </div>
        <div class="prob-no" style="text-align:center;flex:1;">
          <div style="font-size:1.5rem;font-weight:800;color:#ff5555;">${pctB}%</div>
          <div style="font-size:0.75rem;color:var(--white3);">${escHtml(m.optB)}</div>
        </div>
      </div>
      
      <div class="market-meta" style="margin-top:0.75rem;display:flex;justify-content:space-between;">
        <span>Ends: ${m.ends}</span>
        <span class="vol" style="color:var(--green);font-weight:600;">${m.tokens.toLocaleString()} tokens pooled</span>
      </div>
      
      ${m.status === 'live'
        ? `<div class="vote-buttons" style="display:flex;gap:0.75rem;margin-top:1rem;">
             <button class="vote-btn vote-yes" onclick="openVote(${m.id}, 'a', event)" style="flex:1;padding:0.875rem;background:var(--green);color:var(--black);border:none;border-radius:8px;font-weight:700;cursor:pointer;transition:all 0.2s;">
               ${escHtml(m.optA)}
             </button>
             <button class="vote-btn vote-no" onclick="openVote(${m.id}, 'b', event)" style="flex:1;padding:0.875rem;background:#ff5555;color:var(--black);border:none;border-radius:8px;font-weight:700;cursor:pointer;transition:all 0.2s;">
               ${escHtml(m.optB)}
             </button>
           </div>`
        : `<div style="margin-top:1rem;padding:0.75rem;background:var(--white1);border-radius:8px;font-family:var(--font-mono);font-size:0.72rem;color:var(--yellow);text-align:center;">
             🕐 Awaiting admin approval before going live
           </div>`
      }
    `;
    list.appendChild(card);
  });
}

// ── Polymarket-style Vote Modal with Potential Winnings ───────────────
function openVote(marketId, preselectedOpt, e) {
  if (e) e.stopPropagation();
  if (!State.currentUser) { 
    openAuth(); 
    return; 
  }

  const m = [...SAMPLE_MARKETS, ...State.userCreatedMarkets].find(x => x.id === marketId);
  if (!m) return;

  State.activeMarketId = marketId;
  State.selectedVoteOption = preselectedOpt || null;

  // Calculate odds (inverse of probability)
  const pctA = m.pctA || 50;
  const oddsA = pctA > 0 ? (100 / pctA).toFixed(2) : '∞';
  const oddsB = pctA < 100 ? (100 / (100 - pctA)).toFixed(2) : '∞';
  
  // Initialize current odds based on preselection
  currentOdds = preselectedOpt === 'a' ? parseFloat(oddsA) : preselectedOpt === 'b' ? parseFloat(oddsB) : 1;
  currentMarketProb = pctA;

  // Create modal if not exists
  let modal = document.getElementById('polymarket-vote-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'polymarket-vote-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const pctB = 100 - currentMarketProb;
  
  modal.innerHTML = `
    <div class="modal" style="max-width:420px;padding:0;overflow:hidden;background:var(--off-black);border:1px solid var(--border2);">
      <!-- Header -->
      <div style="padding:1.5rem;border-bottom:1px solid var(--border);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="font-size:0.75rem;color:var(--green);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.25rem;">${escHtml(m.cat)}</div>
            <h3 style="font-size:1.1rem;line-height:1.4;margin:0;color:var(--white);">${escHtml(m.question)}</h3>
          </div>
          <button onclick="closePolymarketVoteModal()" style="background:none;border:none;color:var(--white3);font-size:1.5rem;cursor:pointer;padding:0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%;transition:all 0.2s;">✕</button>
        </div>
        <div style="margin-top:0.75rem;font-size:0.8rem;color:var(--white3);">Ends: ${m.ends}</div>
      </div>
      
      <!-- Outcome Selection (Polymarket style) -->
      <div style="padding:1.5rem;">
        <div style="font-size:0.75rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.75rem;">Select Outcome</div>
        
        <div class="outcome-options" style="display:flex;flex-direction:column;gap:0.75rem;">
          <button class="outcome-btn ${preselectedOpt === 'a' ? 'selected' : ''}" 
                  onclick="selectOutcome('a', ${currentMarketProb}, ${oddsA})"
                  data-option="a"
                  style="display:flex;align-items:center;justify-content:space-between;padding:1rem;background:var(--dark);border:2px solid ${preselectedOpt === 'a' ? 'var(--green)' : 'var(--border)'};border-radius:12px;cursor:pointer;transition:all 0.2s;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div class="radio-circle" style="width:20px;height:20px;border:2px solid ${preselectedOpt === 'a' ? 'var(--green)' : 'var(--white3)'};border-radius:50%;display:flex;align-items:center;justify-content:center;">
                ${preselectedOpt === 'a' ? '<div style="width:10px;height:10px;background:var(--green);border-radius:50%;"></div>' : ''}
              </div>
              <span style="font-weight:600;color:var(--white);">${escHtml(m.optA)}</span>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.25rem;font-weight:800;color:var(--green);">${currentMarketProb}%</div>
              <div style="font-size:0.7rem;color:var(--white3);">${oddsA}x payout</div>
            </div>
          </button>
          
          <button class="outcome-btn ${preselectedOpt === 'b' ? 'selected' : ''}" 
                  onclick="selectOutcome('b', ${pctB}, ${oddsB})"
                  data-option="b"
                  style="display:flex;align-items:center;justify-content:space-between;padding:1rem;background:var(--dark);border:2px solid ${preselectedOpt === 'b' ? '#ff5555' : 'var(--border)'};border-radius:12px;cursor:pointer;transition:all 0.2s;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div class="radio-circle" style="width:20px;height:20px;border:2px solid ${preselectedOpt === 'b' ? '#ff5555' : 'var(--white3)'};border-radius:50%;display:flex;align-items:center;justify-content:center;">
                ${preselectedOpt === 'b' ? '<div style="width:10px;height:10px;background:#ff5555;border-radius:50%;"></div>' : ''}
              </div>
              <span style="font-weight:600;color:var(--white);">${escHtml(m.optB)}</span>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.25rem;font-weight:800;color:#ff5555;">${pctB}%</div>
              <div style="font-size:0.7rem;color:var(--white3);">${oddsB}x payout</div>
            </div>
          </button>
        </div>
        
        <!-- Token Amount Slider -->
        <div style="margin-top:1.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
            <span style="font-size:0.75rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.05em;">Amount</span>
            <span style="font-size:0.875rem;color:var(--white3);">Balance: <strong style="color:var(--green);">${State.userTokens} tokens</strong></span>
          </div>
          
          <div style="position:relative;margin-bottom:0.75rem;">
            <input type="range" id="vote-amount-slider" min="10" max="${Math.min(State.userTokens, 1000)}" value="50" 
                   oninput="updatePotentialWinnings()"
                   style="width:100%;height:6px;-webkit-appearance:none;background:var(--white1);border-radius:3px;outline:none;">
          </div>
          
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <input type="number" id="vote-amount-input" value="50" min="10" max="${State.userTokens}"
                   oninput="syncSliderWithInput()"
                   style="flex:1;padding:0.75rem;background:var(--white1);border:1px solid var(--white2);border-radius:8px;color:var(--white);font-size:1rem;font-weight:600;text-align:center;">
            <span style="color:var(--white3);font-size:0.875rem;">tokens</span>
          </div>
          
          <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
            <button onclick="setAmount(10)" style="flex:1;padding:0.4rem;background:var(--white1);border:none;border-radius:6px;color:var(--white3);font-size:0.75rem;cursor:pointer;">10</button>
            <button onclick="setAmount(50)" style="flex:1;padding:0.4rem;background:var(--white1);border:none;border-radius:6px;color:var(--white3);font-size:0.75rem;cursor:pointer;">50</button>
            <button onclick="setAmount(100)" style="flex:1;padding:0.4rem;background:var(--white1);border:none;border-radius:6px;color:var(--white3);font-size:0.75rem;cursor:pointer;">100</button>
            <button onclick="setAmount(Math.floor(State.userTokens / 2))" style="flex:1;padding:0.4rem;background:var(--white1);border:none;border-radius:6px;color:var(--white3);font-size:0.75rem;cursor:pointer;">Half</button>
            <button onclick="setAmount(State.userTokens)" style="flex:1;padding:0.4rem;background:var(--white1);border:none;border-radius:6px;color:var(--white3);font-size:0.75rem;cursor:pointer;">Max</button>
          </div>
        </div>
        
        <!-- Potential Winnings Display -->
        <div id="potential-winnings-box" style="margin-top:1.5rem;padding:1rem;background:linear-gradient(135deg, rgba(0,255,127,0.1), rgba(0,255,127,0.05));border:1px solid var(--green);border-radius:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
            <span style="font-size:0.75rem;color:var(--white3);">Potential Return</span>
            <span style="font-size:0.75rem;color:var(--green);font-weight:600;" id="payout-multiplier">${preselectedOpt ? (preselectedOpt === 'a' ? oddsA : oddsB) : '—'}x</span>
          </div>
          <div style="font-size:2rem;font-weight:800;color:var(--green);" id="potential-return">+${preselectedOpt ? Math.floor(50 * (preselectedOpt === 'a' ? oddsA : oddsB)) : '—'}</div>
          <div style="font-size:0.75rem;color:var(--white3);margin-top:0.25rem;">tokens if you win</div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="padding:1.5rem;border-top:1px solid var(--border);">
        <button id="confirm-vote-btn" onclick="confirmPolymarketVote()" 
                style="width:100%;padding:1rem;background:var(--green);color:var(--black);border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;transition:all 0.2s;opacity:${preselectedOpt ? '1' : '0.5'};pointer-events:${preselectedOpt ? 'auto' : 'none'};">
          ${preselectedOpt ? 'Place Prediction' : 'Select an Outcome'}
        </button>
      </div>
    </div>
  `;
  
  // Show modal - set display first, then add active for animation
  modal.style.display = 'flex';
  // Force reflow
  void modal.offsetWidth;
  modal.classList.add('active');
  
  // Add slider styling
  const style = document.createElement('style');
  style.textContent = `
    #vote-amount-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      background: var(--green);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(0,255,127,0.5);
    }
    .outcome-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .outcome-btn.selected[data-option="a"] {
      border-color: var(--green) !important;
      background: rgba(0,255,127,0.1) !important;
    }
    .outcome-btn.selected[data-option="b"] {
      border-color: #ff5555 !important;
      background: rgba(255,85,85,0.1) !important;
    }
  `;
  if (!document.getElementById('vote-modal-styles')) {
    style.id = 'vote-modal-styles';
    document.head.appendChild(style);
  }
}

function closePolymarketVoteModal() {
  const modal = document.getElementById('polymarket-vote-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      if (modal.parentNode) modal.remove();
    }, 300);
  }
  State.selectedVoteOption = null;
  State.activeMarketId = null;
}

let currentOdds = 1;
let currentMarketProb = 50;

function selectOutcome(opt, prob, odds) {
  State.selectedVoteOption = opt;
  currentOdds = parseFloat(odds);
  
  // Update UI
  document.querySelectorAll('.outcome-btn').forEach(btn => {
    btn.classList.remove('selected');
    btn.style.borderColor = 'var(--border)';
    btn.style.background = 'var(--dark)';
    const radio = btn.querySelector('.radio-circle');
    if (radio) {
      radio.style.borderColor = 'var(--white3)';
      radio.innerHTML = '';
    }
  });
  
  const selectedBtn = document.querySelector(`.outcome-btn[data-option="${opt}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('selected');
    selectedBtn.style.borderColor = opt === 'a' ? 'var(--green)' : '#ff5555';
    selectedBtn.style.background = opt === 'a' ? 'rgba(0,255,127,0.1)' : 'rgba(255,85,85,0.1)';
    const selectedRadio = selectedBtn.querySelector('.radio-circle');
    if (selectedRadio) {
      selectedRadio.style.borderColor = opt === 'a' ? 'var(--green)' : '#ff5555';
      selectedRadio.innerHTML = `<div style="width:10px;height:10px;background:${opt === 'a' ? 'var(--green)' : '#ff5555'};border-radius:50%;"></div>`;
    }
  }
  
  // Update multiplier display
  const multiplierEl = document.getElementById('payout-multiplier');
  if (multiplierEl) multiplierEl.textContent = odds + 'x';
  
  // Update potential winnings
  updatePotentialWinnings();
  
  // Enable confirm button
  const confirmBtn = document.getElementById('confirm-vote-btn');
  if (confirmBtn) {
    confirmBtn.style.opacity = '1';
    confirmBtn.style.pointerEvents = 'auto';
    confirmBtn.textContent = 'Place Prediction';
  }
}

function setAmount(amount) {
  const slider = document.getElementById('vote-amount-slider');
  const input = document.getElementById('vote-amount-input');
  const validAmount = Math.min(Math.max(amount, 10), State.userTokens);
  
  slider.value = validAmount;
  input.value = validAmount;
  updatePotentialWinnings();
}

function syncSliderWithInput() {
  const slider = document.getElementById('vote-amount-slider');
  const input = document.getElementById('vote-amount-input');
  let val = parseInt(input.value) || 10;
  val = Math.min(Math.max(val, 10), State.userTokens);
  
  slider.value = val;
  input.value = val;
  updatePotentialWinnings();
}

function updatePotentialWinnings() {
  const slider = document.getElementById('vote-amount-slider');
  const input = document.getElementById('vote-amount-input');
  if (!slider || !input) return;
  
  const amount = parseInt(slider.value) || 50;
  input.value = amount;
  
  const potentialReturn = Math.floor(amount * currentOdds);
  const returnEl = document.getElementById('potential-return');
  if (returnEl) returnEl.textContent = '+' + potentialReturn;
}

function confirmPolymarketVote() {
  if (!State.selectedVoteOption) {
    showToast('Select an outcome first', 'yellow');
    return;
  }

  const slider = document.getElementById('vote-amount-slider');
  if (!slider) return;
  
  const amount = parseInt(slider.value, 10);
  if (!amount || amount < 10) { 
    showToast('Minimum stake is 10 tokens', 'yellow'); 
    return; 
  }
  if (amount > State.userTokens) { 
    showToast('Not enough tokens!', 'red'); 
    return; 
  }

  const m = [...SAMPLE_MARKETS, ...State.userCreatedMarkets]
    .find(x => x.id === State.activeMarketId);
  
  if (!m) {
    showToast('Market not found', 'red');
    return;
  }

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
  showToast(`${amount} tokens on "${optLabel}" — potential win: ${potentialWin} tokens! 🎯`, 'green');
  
  // Refresh profile page prediction history if visible
  const histEl = document.getElementById('prediction-history');
  if (histEl && typeof renderProfile === 'function') {
    renderProfile();
  }
  
  if (typeof demoMode !== 'undefined' && !demoMode && typeof saveUserData === 'function') {
    saveUserData();
  }
}

// ── Old Vote Modal (fallback) ─────────────────────────────────────────
function closeVoteModal() {
  const modal = document.getElementById('vote-modal');
  if (modal) modal.classList.remove('open');
}

function selectVoteOption(opt) {
  State.selectedVoteOption = opt;
  document.querySelectorAll('.vote-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('vote-opt-' + opt).classList.add('selected');
}

function confirmVote() {
  if (!State.selectedVoteOption) {
    showToast('Please select Yes or No', 'yellow');
    return;
  }
  const amount = parseInt(document.getElementById('vote-amount').value, 10);
  if (!amount || amount < 10) {
    showToast('Minimum stake is 10 tokens', 'yellow');
    return;
  }
  if (amount > State.userTokens) {
    showToast('Not enough tokens!', 'red');
    return;
  }
  
  // Use the polymarket modal instead for better UX
  closeVoteModal();
  if (State.activeMarketId) {
    openVote(State.activeMarketId, State.selectedVoteOption);
  }
}

// ── Escape HTML to prevent XSS in dynamic content ────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
