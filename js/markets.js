// ─────────────────────────────────────────────────────────────────────
// markets.js — Render markets list, create market, vote modal
// ─────────────────────────────────────────────────────────────────────

// ── Render all markets on the Markets page ────────────────────────────
function renderMarkets() {
  const allMarkets = [...SAMPLE_MARKETS, ...State.userCreatedMarkets];
  const list       = document.getElementById('markets-list');
  if (!list) return;
  list.innerHTML   = '';

  allMarkets.forEach(m => {
    const pctB    = 100 - m.pctA;
    const isUser  = !!m.createdBy;
    const card    = document.createElement('div');
    card.className = 'market-card-full';
    card.innerHTML = `
      <div class="market-status ${m.status === 'live' ? 'status-live' : 'status-pending'}">
        ${m.status === 'live' ? '● Live' : '⏳ Under Review'}
        ${isUser ? ' · Community Market' : ''}
      </div>
      <h3>${escHtml(m.question)}</h3>
      <div class="market-cat" style="margin-bottom:0.75rem">${m.cat}</div>
      <div class="odds-bar" style="height:8px">
        <div class="odds-fill" style="width:${m.pctA}%"></div>
      </div>
      <div class="odds-labels" style="margin-top:0.4rem">
        <span style="color:var(--green)">
          ${escHtml(m.optA)}: ${m.pctA}%
        </span>
        <span style="color:#ff8888">
          ${escHtml(m.optB)}: ${pctB}%
        </span>
      </div>
      <div class="market-meta" style="margin-top:0.75rem">
        <span>Ends: ${m.ends}</span>
        <span class="vol">${m.tokens.toLocaleString()} tokens pooled</span>
      </div>
      ${m.status === 'live'
        ? `<div class="vote-buttons">
             <button class="vote-btn vote-yes" onclick="openVote(${m.id}, event)">
               ${escHtml(m.optA)} (${m.pctA}%)
             </button>
             <button class="vote-btn vote-no" onclick="openVote(${m.id}, event)">
               ${escHtml(m.optB)} (${pctB}%)
             </button>
           </div>`
        : `<div style="margin-top:1rem;font-family:var(--font-mono);font-size:0.72rem;color:var(--yellow)">
             🕐 Awaiting admin approval before going live
           </div>`
      }
    `;
    list.appendChild(card);
  });

  // Show create form only if logged in
  const formEl   = document.getElementById('create-market-form');
  const promptEl = document.getElementById('create-market-login-prompt');
  if (State.currentUser) {
    formEl.classList.remove('hidden');
    promptEl.classList.add('hidden');
  } else {
    formEl.classList.add('hidden');
    promptEl.classList.remove('hidden');
  }
}

// ── Submit a new user-created market ─────────────────────────────────
function submitMarket() {
  if (!State.currentUser) { openAuth(); return; }

  const q     = document.getElementById('mkt-question').value.trim();
  const cat   = document.getElementById('mkt-category').value;
  const optA  = document.getElementById('mkt-option-a').value.trim() || 'Yes';
  const optB  = document.getElementById('mkt-option-b').value.trim() || 'No';
  const ends  = document.getElementById('mkt-end-date').value;
  const stake = parseInt(document.getElementById('mkt-stake').value, 10);

  if (!q)            { showToast('Enter a market question', 'yellow'); return; }
  if (q.length < 15) { showToast('Question too short — be more descriptive', 'yellow'); return; }
  if (!ends)         { showToast('Select an end date', 'yellow'); return; }
  if (!stake || stake < 100) { showToast('Minimum stake is 100 tokens', 'yellow'); return; }
  if (stake > State.userTokens) { showToast('Not enough tokens!', 'red'); return; }

  const catEmojis = {
    sports:        '🏏 Sports',
    economy:       '📊 Economy',
    entertainment: '🎬 Entertainment',
    tech:          '💻 Technology',
    climate:       '🌿 Climate',
    other:         '🔮 Other'
  };

  const endFormatted = new Date(ends).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  State.userTokens -= stake;

  const newMarket = {
    id:        Date.now(),
    question:  q,
    cat:       catEmojis[cat] || '🔮 Other',
    optA,
    optB,
    pctA:      50,
    tokens:    stake,
    ends:      endFormatted,
    status:    'pending',
    createdBy: State.currentUser.uid || 'demo'
  };

  State.userCreatedMarkets.push(newMarket);
  updateTokenDisplay();
  renderMarkets();

  // Clear form
  document.getElementById('mkt-question').value = '';
  document.getElementById('mkt-stake').value    = '100';

  showToast('Market submitted for review! ✅', 'green');
  if (!demoMode) saveUserData();
}

// ── Vote modal ────────────────────────────────────────────────────────
function openVote(marketId, e) {
  if (e) e.stopPropagation();
  if (!State.currentUser) { openAuth(); return; }

  const m = [...SAMPLE_MARKETS, ...State.userCreatedMarkets].find(x => x.id === marketId);
  if (!m) return;

  State.activeMarketId     = marketId;
  State.selectedVoteOption = null;

  document.getElementById('vote-question').textContent = m.question;
  document.getElementById('vote-opt-a').textContent    = `${m.optA} (${m.pctA}%)`;
  document.getElementById('vote-opt-b').textContent    = `${m.optB} (${100 - m.pctA}%)`;
  document.getElementById('vote-opt-a').classList.remove('selected');
  document.getElementById('vote-opt-b').classList.remove('selected');
  document.getElementById('vote-balance').textContent  = State.userTokens;
  document.getElementById('vote-modal').classList.add('open');
}

function closeVoteModal() {
  document.getElementById('vote-modal').classList.remove('open');
}

function selectVoteOption(opt) {
  State.selectedVoteOption = opt;
  document.getElementById('vote-opt-a').classList.toggle('selected', opt === 'a');
  document.getElementById('vote-opt-b').classList.toggle('selected', opt === 'b');
}

function confirmVote() {
  if (!State.selectedVoteOption) {
    showToast('Select an option first', 'yellow');
    return;
  }

  const amount = parseInt(document.getElementById('vote-amount').value, 10);
  if (!amount || amount < 10)        { showToast('Minimum stake is 10 tokens', 'yellow'); return; }
  if (amount > State.userTokens)     { showToast('Not enough tokens!', 'red'); return; }

  const m = [...SAMPLE_MARKETS, ...State.userCreatedMarkets]
    .find(x => x.id === State.activeMarketId);

  const optLabel = State.selectedVoteOption === 'a' ? m.optA : m.optB;

  State.userTokens -= amount;
  State.userPredictions.push({
    marketId: State.activeMarketId,
    question: m.question,
    option:   optLabel,
    amount,
    status:   'pending'
  });

  updateTokenDisplay();
  closeVoteModal();
  showToast(`${amount} tokens staked on "${optLabel}" ✅`, 'green');
  if (!demoMode) saveUserData();
}

// ── Escape HTML to prevent XSS in dynamic content ────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}
