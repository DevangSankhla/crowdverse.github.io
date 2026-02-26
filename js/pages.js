// ─────────────────────────────────────────────────────────────────────
// pages.js — Builds HTML content for each page section
// ─────────────────────────────────────────────────────────────────────

// Market submission cost in tokens
const MARKET_SUBMISSION_COST = 20;

// ── HOME PAGE ────────────────────────────────────────────────────────
function buildHomePage() {
  document.getElementById('page-home').innerHTML = `
    <!-- Hero - Mobile Optimized -->
    <div class="hero">
      <div class="hero-badge">🇮🇳 India's First Prediction Market</div>
      <img src="assets/logo.jpg" alt="CrowdVerse" class="hero-logo">
      <h1>What Does The<br><span class="accent">Crowd Think?</span></h1>
      <p class="hero-description">
        Predict on real-world events. Earn tokens. Climb the leaderboard.
      </p>
      <div class="hero-actions" id="hero-cta-area">
        <button class="btn btn-primary btn-lg" onclick="openAuth()">
          Get 1000 Free Tokens →
        </button>
        <button class="btn btn-ghost btn-lg" onclick="showPage('markets')">
          Explore Markets
        </button>
      </div>
    </div>

    <!-- Mobile-Friendly Stats - Horizontal Scroll on Mobile -->
    <div class="stats-strip">
      <div class="stat-item">
        <span class="stat-num">1,000</span>
        <span class="stat-label">Free Tokens</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">200</span>
        <span class="stat-label">Weekly Bonus</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">100%</span>
        <span class="stat-label">No Real Money</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">18+</span>
        <span class="stat-label">Legal & Safe</span>
      </div>
    </div>

    <!-- Live Markets Preview - Moved Up for Better Mobile UX -->
    <div class="section" style="padding-top:0">
      <div class="section-header-mobile">
        <div class="section-label">Live Markets</div>
        <h2>What's The Crowd Saying?</h2>
      </div>
      <div class="market-cards" id="home-markets-preview">
        <div style="text-align:center;padding:3rem 2rem;color:var(--white3);
                    font-family:var(--font-mono);font-size:0.85rem;grid-column:1/-1;">
          Loading markets...
        </div>
      </div>
      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-ghost btn-lg" onclick="showPage('markets')">View All Markets →</button>
      </div>
    </div>

    <!-- Simplified How It Works for Mobile -->
    <div class="section">
      <div class="section-label">How It Works</div>
      <h2>Predict. Earn. Repeat.</h2>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-header">
            <div class="step-icon">🎟️</div>
            <h3>Get Tokens</h3>
          </div>
          <p>Sign up free, get 1,000 tokens instantly. No deposit needed.</p>
        </div>
        <div class="step-card">
          <div class="step-header">
            <div class="step-icon">🔮</div>
            <h3>Predict</h3>
          </div>
          <p>Stake tokens on sports, economy, entertainment & more.</p>
        </div>
        <div class="step-card">
          <div class="step-header">
            <div class="step-icon">🏆</div>
            <h3>Win</h3>
          </div>
          <p>Correct predictions multiply your tokens. Climb the leaderboard.</p>
        </div>
      </div>
    </div>

    <!-- Compact Legal Notice -->
    <div style="max-width:1100px; margin:1rem auto; padding:0 1.25rem;">
      <div class="legal-banner" style="padding:1rem;">
        <div class="icon" style="font-size:1.25rem;">⚖️</div>
        <p style="font-size:0.8rem;line-height:1.5;">
          <strong>Legal & Compliant:</strong> Virtual tokens only — no real money. 
          This is <strong>NOT betting or gambling.</strong> 18+ only.
        </p>
      </div>
    </div>

    <!-- Weekly Bonus - Compact -->
    <div class="section" style="padding-top:0;padding-bottom:2rem;">
      <div style="background:var(--off-black);border:1px solid var(--border);border-radius:var(--radius-md);padding:1.25rem;text-align:center;">
        <div style="font-size:1.75rem;margin-bottom:0.5rem;">🎁</div>
        <h3 style="font-size:1rem;margin-bottom:0.5rem;">Weekly Bonus</h3>
        <p style="color:var(--white2);font-size:0.85rem;margin-bottom:1rem;">
          Get <strong style="color:var(--green)">200 free tokens</strong> every week
        </p>
        <button class="btn btn-primary" onclick="showPage('markets')">Start Predicting →</button>
      </div>
    </div>

    ${buildFooter()}
  `;
}

// ── Update hero CTA based on auth state ──────────────────────────────
function updateHeroCta() {
  const area = document.getElementById('hero-cta-area');
  if (!area) return;
  if (State.currentUser) {
    area.innerHTML = `
      <button class="btn btn-primary btn-lg" onclick="showPage('markets')">
        Browse Live Markets →
      </button>
      <button class="btn btn-ghost btn-lg" onclick="showPage('community')">
        Submit a Market
      </button>
    `;
  } else {
    area.innerHTML = `
      <button class="btn btn-primary btn-lg" onclick="openAuth()">
        Get 1000 Free Tokens →
      </button>
      <button class="btn btn-ghost btn-lg" onclick="showPage('markets')">
        Explore Markets
      </button>
    `;
  }
}

// ── COMMUNITY PAGE — Submit a market only ─────────────────────────────
function buildCommunityPage() {
  document.getElementById('page-community').innerHTML = `
    <div class="page-header">
      <div class="section-label" style="margin-bottom:0.5rem">Submit</div>
      <h1>Submit a Prediction Market</h1>
      <p>Create your own prediction question for the crowd to vote on.</p>
    </div>

    <!-- Submission Form Container -->
    <div style="max-width:600px;margin:0 auto;padding:0 2rem 3rem;">
      ${!State.currentUser ? `
        <!-- Not logged in -->
        <div style="background:var(--off-black);border:1px solid var(--border);border-radius:var(--radius-lg);padding:2.5rem;text-align:center;">
          <div style="font-size:3rem;margin-bottom:1rem;">🔒</div>
          <h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;">Log in to Submit</h3>
          <p style="color:var(--white2);font-size:0.85rem;margin-bottom:1.5rem;">You need an account to submit prediction markets.</p>
          <button class="btn btn-primary btn-lg" onclick="openAuth()">Log In / Sign Up</button>
        </div>
      ` : State.userTokens < MARKET_SUBMISSION_COST ? `
        <!-- Not enough tokens -->
        <div style="background:var(--off-black);border:1px solid var(--border);border-radius:var(--radius-lg);padding:2.5rem;text-align:center;">
          <div style="font-size:3rem;margin-bottom:1rem;">🎟️</div>
          <h3 style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;margin-bottom:0.5rem;">Not Enough Tokens</h3>
          <p style="color:var(--white2);font-size:0.85rem;margin-bottom:1rem;">You need <strong>${MARKET_SUBMISSION_COST} tokens</strong> to submit a market.</p>
          <p style="font-family:var(--font-mono);font-size:0.75rem;color:var(--white3);">Current balance: ${State.userTokens.toLocaleString()} tokens</p>
        </div>
      ` : `
        <!-- Submission Form -->
        <div style="background:var(--off-black);border:1px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;">
          <div style="margin-bottom:1.5rem;">
            <h3 style="font-family:var(--font-display);font-size:1.05rem;font-weight:700;margin-bottom:0.35rem;">💡 Submit Your Prediction Question</h3>
            <p style="color:var(--white2);font-size:0.83rem;line-height:1.55;">
              Cost: <strong style="color:var(--green);">${MARKET_SUBMISSION_COST} tokens</strong>. 
              All submissions are reviewed before going live.
            </p>
          </div>

          <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label">Question *</label>
            <input class="form-input" id="mkt-question" placeholder="e.g., Will India win the World Cup 2026?">
          </div>

          <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label">Description (optional)</label>
            <textarea class="form-input" id="mkt-description" rows="2" placeholder="Add context for predictors…"></textarea>
          </div>

          <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label">Category</label>
            <select class="form-select" id="mkt-category" style="width:100%;">
              <option value="sports">🏏 Sports</option>
              <option value="economy">📊 Economy</option>
              <option value="entertainment">🎬 Entertainment</option>
              <option value="technology">💻 Technology</option>
              <option value="climate">🌿 Climate</option>
              <option value="crypto">₿ Crypto</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label">End Date *</label>
            <input class="form-input" type="date" id="mkt-enddate">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.5rem;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Option A (Yes side)</label>
              <input class="form-input" id="mkt-option-a" value="Yes" placeholder="Yes">
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Option B (No side)</label>
              <input class="form-input" id="mkt-option-b" value="No" placeholder="No">
            </div>
          </div>

          <div style="background:var(--dark);padding:0.75rem 1rem;border-radius:8px;margin-bottom:1rem;
                      font-size:0.8rem;color:var(--white2);">
            Your balance: <strong style="color:var(--green);">${State.userTokens.toLocaleString()}</strong> tokens
            &nbsp;·&nbsp; Fee: <strong>${MARKET_SUBMISSION_COST} tokens</strong>
          </div>

          <button class="btn btn-primary w-full" onclick="submitCreateMarketDirect()">
            Submit Market (${MARKET_SUBMISSION_COST} tokens)
          </button>

          <div id="submit-error" style="display:none;margin-top:1rem;padding:0.75rem;background:rgba(224,80,80,0.1);
                                       border:1px solid rgba(224,80,80,0.25);border-radius:8px;
                                       color:var(--red);font-size:0.8rem;"></div>
        </div>
      `}
    </div>

    ${buildFooter()}
  `;
  
  // Set default date if form is shown
  if (State.currentUser && State.userTokens >= MARKET_SUBMISSION_COST) {
    const future = new Date();
    future.setMonth(future.getMonth() + 1);
    const defaultDate = future.toISOString().split('T')[0];
    const dateInput = document.getElementById('mkt-enddate');
    if (dateInput) dateInput.value = defaultDate;
  }
}

// ── MARKETS PAGE — All live markets ──────────────────────────────────
function buildMarketsPage() {
  document.getElementById('page-markets').innerHTML = `
    <div class="page-header">
      <div class="section-label" style="margin-bottom:0.5rem">All Markets</div>
      <h1>Prediction Markets</h1>
      <p>Browse all live markets. Place your tokens on outcomes you believe in.</p>
    </div>

    <div style="max-width:1100px;margin:0 auto;padding:0 2rem 3rem;">

      <!-- Search + sort row -->
      <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem;">
        <div style="position:relative;flex:1;min-width:180px;">
          <input type="text" id="markets-search" class="form-input"
                 placeholder="Search markets…"
                 oninput="filterMarketsSearch()"
                 style="padding-left:2.5rem;">
          <span style="position:absolute;left:0.85rem;top:50%;transform:translateY(-50%);
                       opacity:0.35;pointer-events:none;">🔍</span>
        </div>
        <select id="markets-sort" class="form-select"
                style="width:auto;min-width:150px;"
                onchange="applyMarketSort()">
          <option value="newest">Newest First</option>
          <option value="volume">Highest Volume</option>
          <option value="closing">Closing Soon</option>
        </select>
      </div>

      <!-- Category filters -->
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.25rem;" id="market-filters">
        <button class="mkt-filter-btn active" data-filter="all"           onclick="applyMarketFilter('all')">All</button>
        <button class="mkt-filter-btn"        data-filter="sports"        onclick="applyMarketFilter('sports')">🏏 Sports</button>
        <button class="mkt-filter-btn"        data-filter="economy"       onclick="applyMarketFilter('economy')">📊 Economy</button>
        <button class="mkt-filter-btn"        data-filter="entertainment" onclick="applyMarketFilter('entertainment')">🎬 Entertainment</button>
        <button class="mkt-filter-btn"        data-filter="technology"    onclick="applyMarketFilter('technology')">💻 Tech</button>
        <button class="mkt-filter-btn"        data-filter="crypto"        onclick="applyMarketFilter('crypto')">₿ Crypto</button>
        <button class="mkt-filter-btn"        data-filter="climate"       onclick="applyMarketFilter('climate')">🌿 Climate</button>
      </div>

      <!-- Markets list -->
      <div id="markets-list" class="markets-list"></div>
      <div id="markets-empty-state" style="display:none;"></div>
    </div>

    ${buildFooter()}
  `;

  if (!document.getElementById('mkt-filter-styles')) {
    const style = document.createElement('style');
    style.id = 'mkt-filter-styles';
    style.textContent = `
      .mkt-filter-btn {
        padding:0.45rem 0.9rem; background:var(--dark); border:1px solid var(--border2);
        border-radius:var(--radius-sm); color:var(--white2); font-family:var(--font-mono);
        font-size:0.73rem; cursor:pointer; transition:all 0.2s; white-space:nowrap;
      }
      .mkt-filter-btn:hover { background:var(--dark2); color:var(--white); }
      .mkt-filter-btn.active { background:rgba(127,255,127,0.12); border-color:rgba(127,255,127,0.3); color:var(--green); font-weight:600; }
    `;
    document.head.appendChild(style);
  }

  if (typeof renderMarkets          === 'function') renderMarkets();
  if (typeof loadAndRenderMarkets   === 'function') loadAndRenderMarkets();
}

let _currentMarketFilter = 'all';

function applyMarketFilter(filter) {
  _currentMarketFilter = filter;
  document.querySelectorAll('.mkt-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  if (typeof renderMarkets === 'function') renderMarkets(filter);
}

let _searchDebounceTimer = null;

function filterMarketsSearch() {
  if (_searchDebounceTimer) clearTimeout(_searchDebounceTimer);
  
  _searchDebounceTimer = setTimeout(() => {
    if (typeof _marketSearchQuery !== 'undefined') {
      _marketSearchQuery = document.getElementById('markets-search')?.value.trim().toLowerCase() || '';
    }
    if (typeof renderMarkets === 'function') renderMarkets(_currentMarketFilter);
  }, 150); // 150ms debounce
}

function applyMarketSort() {
  if (typeof _marketSortBy !== 'undefined') {
    _marketSortBy = document.getElementById('markets-sort')?.value || 'newest';
  }
  if (typeof renderMarkets === 'function') renderMarkets(_currentMarketFilter);
}

// ── Create / Submit Market Modal (now accessed from Community page) ───
function openCreateMarketModal() {
  if (!State.currentUser) { openAuth(); return; }

  if (State.userTokens < MARKET_SUBMISSION_COST) {
    showToast(`You need at least ${MARKET_SUBMISSION_COST} tokens to submit a poll`, 'red');
    return;
  }

  const future = new Date();
  future.setMonth(future.getMonth() + 3);
  const defaultDate = future.toISOString().split('T')[0];

  const existing = document.getElementById('create-market-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id        = 'create-market-modal';
  modal.innerHTML = `
    <div class="modal" style="max-width:500px;">
      <button class="modal-close" onclick="closeCreateMarketModal()">✕</button>
      <h2 style="margin-bottom:0.4rem;">Submit a Poll</h2>
      <p style="color:var(--white2);margin-bottom:1.5rem;font-size:0.83rem;line-height:1.5;">
        Set up your prediction question for the community. Costs
        <strong style="color:var(--green);opacity:0.9;">20 tokens</strong>.
        Polls are reviewed within 24–48 hours. Note: tokens are <strong>not refunded</strong> if rejected.
      </p>

      <div class="form-group">
        <label class="form-label">Question *</label>
        <input class="form-input" id="mkt-question" placeholder="e.g., Will India win the World Cup 2026?">
      </div>
      <div class="form-group">
        <label class="form-label">Description (optional)</label>
        <textarea class="form-input" id="mkt-description" rows="2" placeholder="Add context for predictors…"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-select" id="mkt-category">
          <option value="sports">🏏 Sports</option>
          <option value="economy">📊 Economy</option>
          <option value="entertainment">🎬 Entertainment</option>
          <option value="technology">💻 Technology</option>
          <option value="climate">🌿 Climate</option>
          <option value="crypto">₿ Crypto</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">End Date *</label>
        <input class="form-input" type="date" id="mkt-enddate" value="${defaultDate}">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
        <div class="form-group">
          <label class="form-label">Option A (Yes side)</label>
          <input class="form-input" id="mkt-option-a" value="Yes" placeholder="Yes">
        </div>
        <div class="form-group">
          <label class="form-label">Option B (No side)</label>
          <input class="form-input" id="mkt-option-b" value="No" placeholder="No">
        </div>
      </div>

      <div style="background:var(--white1);padding:0.75rem 1rem;border-radius:8px;margin-bottom:1rem;
                  font-size:0.8rem;color:var(--white2);">
        Your balance: <strong style="color:var(--green);opacity:0.9;">${State.userTokens.toLocaleString()}</strong> tokens
        &nbsp;·&nbsp; Submission fee: <strong>20 tokens</strong>
      </div>

      <button class="btn btn-primary w-full" onclick="submitCreateMarket()">
        Submit Poll (20 tokens)
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => {
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
  });
}

function closeCreateMarketModal() {
  const modal = document.getElementById('create-market-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => { if (modal.parentNode) modal.remove(); }, 300);
  }
}

async function submitCreateMarket() {
  const question    = document.getElementById('mkt-question')?.value.trim();
  const category    = document.getElementById('mkt-category')?.value;
  const optA        = document.getElementById('mkt-option-a')?.value.trim() || 'Yes';
  const optB        = document.getElementById('mkt-option-b')?.value.trim() || 'No';
  const endDate     = document.getElementById('mkt-enddate')?.value;
  const description = document.getElementById('mkt-description')?.value.trim() || '';
  const submitBtn   = document.querySelector('#create-market-modal .btn-primary');

  if (!question || question.length < 10) { showToast('Question too short — be more descriptive', 'yellow'); return; }
  if (!endDate)                           { showToast('Please select an end date', 'yellow'); return; }
  
  // Validate end date is in the future
  const selectedDate = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) { showToast('End date must be in the future', 'yellow'); return; }
  
  if (State.userTokens < MARKET_SUBMISSION_COST) { showToast(`You need at least ${MARKET_SUBMISSION_COST} tokens to submit`, 'red'); return; }

  const catEmojis = {
    sports: '🏏 Sports', economy: '📊 Economy',
    entertainment: '🎬 Entertainment', technology: '💻 Technology',
    climate: '🌿 Climate', crypto: '₿ Crypto'
  };

  const displayName = State.currentUser?.displayName
    || State.currentUser?.email?.split('@')[0]
    || 'User';

  const newMarket = {
    id:             Date.now(),
    question, description,
    cat:            catEmojis[category] || '🔮 Other',
    optA, optB,
    pctA:           50,
    tokens:         10,        // initial pool = submission fee
    ends:           new Date(endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    status:         'pending',
    createdBy:      State.currentUser?.uid || 'demo',
    createdByUid:   State.currentUser?.uid || 'demo',
    createdByEmail: State.currentUser?.email || '',
    createdByName:  displayName,
    createdAt:      new Date().toISOString()
  };

  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span class="spinner"></span> Submitting…'; }

  if (!demoMode && db) {
    try {
      const userRef  = db.collection('users').doc(State.currentUser.uid);
      const marketRef = db.collection('markets').doc();

      // ── Re-fetch latest token balance to prevent stale-state bugs ───
      let latestTokens = State.userTokens;
      try {
        const snap = await userRef.get();
        if (snap.exists && typeof snap.data().tokens === 'number') {
          latestTokens = snap.data().tokens;
          State.userTokens = latestTokens; // sync local state
          updateTokenDisplay();
        }
      } catch (_) { /* use local value if fetch fails */ }

      if (latestTokens < MARKET_SUBMISSION_COST) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = `Submit Poll (${MARKET_SUBMISSION_COST} tokens)`; }
        showToast(`Not enough tokens to submit a poll`, 'red');
        return;
      }

      // ── Batch: save market + deduct tokens atomically ────────────────
      const batch = db.batch();

      batch.set(marketRef, {
        ...newMarket,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      newMarket.firestoreId = marketRef.id;
      newMarket.id          = marketRef.id;

      // set+merge works even if user doc doesn't exist yet (unlike update)
      batch.set(userRef, {
        tokens: firebase.firestore.FieldValue.increment(-MARKET_SUBMISSION_COST)
      }, { merge: true });

      await batch.commit();

      // Only deduct locally AFTER confirmed Firestore commit
      State.userTokens = latestTokens - MARKET_SUBMISSION_COST;
      updateTokenDisplay();
    } catch (e) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = `Submit Poll (${MARKET_SUBMISSION_COST} tokens)`; }
      showToast('Failed to submit: ' + e.message, 'red');
      return;
    }
  } else {
    // Demo mode — just deduct locally (ensure never goes below 0)
    State.userTokens = Math.max(0, State.userTokens - MARKET_SUBMISSION_COST);
    updateTokenDisplay();
  }

  State.userCreatedMarkets.push(newMarket);
  closeCreateMarketModal();
  if (typeof updateCommunityPage === 'function') updateCommunityPage();
  showToast('Poll submitted for review! ✅ Our team will review within 24–48h.', 'green');
}

// ── Direct market submission from community page (no modal) ───────────
async function submitCreateMarketDirect() {
  const question    = document.getElementById('mkt-question')?.value.trim();
  const category    = document.getElementById('mkt-category')?.value;
  const optA        = document.getElementById('mkt-option-a')?.value.trim() || 'Yes';
  const optB        = document.getElementById('mkt-option-b')?.value.trim() || 'No';
  const endDate     = document.getElementById('mkt-enddate')?.value;
  const description = document.getElementById('mkt-description')?.value.trim() || '';
  const errorEl     = document.getElementById('submit-error');

  // Validation
  if (!question || question.length < 10) {
    if (errorEl) { errorEl.textContent = 'Question too short — be more descriptive'; errorEl.style.display = ''; }
    return;
  }
  if (!endDate) {
    if (errorEl) { errorEl.textContent = 'Please select an end date'; errorEl.style.display = ''; }
    return;
  }
  
  // Validate end date is in the future
  const selectedDate = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    if (errorEl) { errorEl.textContent = 'End date must be in the future'; errorEl.style.display = ''; }
    return;
  }
  
  if (State.userTokens < MARKET_SUBMISSION_COST) {
    if (errorEl) { errorEl.textContent = `You need at least ${MARKET_SUBMISSION_COST} tokens to submit`; errorEl.style.display = ''; }
    return;
  }

  const catEmojis = {
    sports: '🏏 Sports', economy: '📊 Economy',
    entertainment: '🎬 Entertainment', technology: '💻 Technology',
    climate: '🌿 Climate', crypto: '₿ Crypto'
  };

  const displayName = State.currentUser?.displayName
    || State.currentUser?.email?.split('@')[0]
    || 'User';

  const newMarket = {
    id:             Date.now(),
    question, description,
    cat:            catEmojis[category] || '🔮 Other',
    optA, optB,
    pctA:           50,
    tokens:         MARKET_SUBMISSION_COST,
    ends:           new Date(endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    status:         'pending',
    createdBy:      State.currentUser?.uid || 'demo',
    createdByUid:   State.currentUser?.uid || 'demo',
    createdByEmail: State.currentUser?.email || '',
    createdByName:  displayName,
    createdAt:      new Date().toISOString()
  };

  if (!demoMode && db) {
    try {
      const userRef  = db.collection('users').doc(State.currentUser.uid);
      const marketRef = db.collection('markets').doc();

      // Re-fetch latest token balance
      let latestTokens = State.userTokens;
      try {
        const snap = await userRef.get();
        if (snap.exists && typeof snap.data().tokens === 'number') {
          latestTokens = snap.data().tokens;
          State.userTokens = latestTokens;
          updateTokenDisplay();
        }
      } catch (_) { }

      if (latestTokens < MARKET_SUBMISSION_COST) {
        if (errorEl) { errorEl.textContent = `Not enough tokens to submit`; errorEl.style.display = ''; }
        return;
      }

      // Batch: save market + deduct tokens
      const batch = db.batch();

      batch.set(marketRef, {
        ...newMarket,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      newMarket.firestoreId = marketRef.id;
      newMarket.id          = marketRef.id;

      batch.set(userRef, {
        tokens: firebase.firestore.FieldValue.increment(-MARKET_SUBMISSION_COST)
      }, { merge: true });

      await batch.commit();

      State.userTokens = latestTokens - MARKET_SUBMISSION_COST;
      updateTokenDisplay();
    } catch (e) {
      if (errorEl) { errorEl.textContent = 'Failed to submit: ' + e.message; errorEl.style.display = ''; }
      return;
    }
  } else {
    // Demo mode
    State.userTokens = Math.max(0, State.userTokens - MARKET_SUBMISSION_COST);
    updateTokenDisplay();
  }

  State.userCreatedMarkets.push(newMarket);
  showToast('Market submitted for review! ✅', 'green');
  buildCommunityPage(); // Rebuild to show success state
}

// ── REWARDS PAGE ─────────────────────────────────────────────────────
function buildRewardsPage() {
  const rewardCards = REWARDS.map(r => `
    <div class="reward-card">
      <div class="reward-logo">${r.emoji}</div>
      <h3>${r.name}</h3>
      <p class="desc">${r.desc}</p>
      <div class="reward-tokens">${r.tokens}</div>
    </div>
  `).join('');

  document.getElementById('page-rewards').innerHTML = `
    <div class="rewards-coming-top">
      <span>🎁</span>
      <span><strong>Rewards Marketplace — Coming Soon.</strong>
      Earn tokens now, redeem for real brand offers when we launch.</span>
    </div>
    <div class="page-header">
      <div class="section-label" style="margin-bottom:0.5rem">Rewards</div>
      <h1>Spend Your Tokens</h1>
      <p>Redeem earned tokens for discount coupons and exclusive offers from partner brands.</p>
    </div>
    <div class="rewards-grid">${rewardCards}</div>
    ${buildFooter()}
  `;
}

// ── PROFILE PAGE ─────────────────────────────────────────────────────
function buildProfilePage() {
  document.getElementById('page-profile').innerHTML = `
    <!-- Logged out -->
    <div id="profile-logged-out" class="coming-soon-wrap">
      <h2>Your Profile</h2>
      <p>Sign up or log in to see your token balance, prediction history, and rank.</p>
      <button class="btn btn-primary btn-lg" onclick="openAuth()">Sign Up / Log In</button>
    </div>

    <!-- Logged in -->
    <div id="profile-logged-in" style="display:none">
      <div class="page-header">
        <div class="section-label" style="margin-bottom:0.5rem">Profile</div>
        <h1>Your Dashboard</h1>
        <p>Track your predictions, tokens, and crowd wisdom score.</p>
      </div>
      <div class="profile-layout">
        <!-- Left column -->
        <div>
          <div class="profile-card">
            <div class="profile-avatar">👤</div>

            <!-- Username display -->
            <div id="profile-name-display" style="margin-bottom:0.1rem;">
              <div class="profile-name" id="profile-display-name">User</div>
              <button onclick="toggleUsernameEdit(true)"
                      style="background:none;border:1px solid var(--border2);border-radius:var(--radius-sm);
                             padding:0.2rem 0.6rem;font-family:var(--font-mono);font-size:0.63rem;
                             color:var(--white3);cursor:pointer;margin-top:0.3rem;transition:all 0.2s;"
                      onmouseover="this.style.color='var(--green)';this.style.borderColor='rgba(127,255,127,0.35)'"
                      onmouseout="this.style.color='var(--white3)';this.style.borderColor='var(--border2)'">
                ✏️ Edit Username · 50 tokens
              </button>
            </div>

            <!-- Username edit form -->
            <div id="profile-name-edit" style="display:none;margin-bottom:0.5rem;">
              <p style="font-family:var(--font-mono);font-size:0.7rem;color:var(--yellow);
                        opacity:0.85;margin-bottom:0.5rem;text-align:center;">
                ⚠️ Changing your username costs 50 tokens
              </p>
              <input id="username-edit-input" class="form-input"
                     placeholder="New username" maxlength="30"
                     style="margin-bottom:0.5rem;text-align:center;">
              <div style="display:flex;gap:0.5rem;">
                <button onclick="if(confirm('Are you sure? This will deduct 50 tokens.')) saveUsername();" class="btn btn-primary" style="flex:1;padding:0.5rem;">Save (50 tkn)</button>
                <button onclick="toggleUsernameEdit(false)" class="btn btn-ghost" style="flex:1;padding:0.5rem;">Cancel</button>
              </div>
            </div>

            <div class="profile-email" id="profile-display-email">user@email.com</div>
            <div class="token-display" style="margin-top:1rem;">
              <div class="label">Token Balance</div>
              <div>
                <span class="amount" id="profile-token-amount">1000</span>
                <span class="unit">TKN</span>
              </div>
            </div>
            <div class="weekly-note">🎁 +200 tokens every Monday</div>
            <div class="divider"></div>
            <button class="btn btn-ghost w-full" onclick="handleLogout()">Log Out</button>
          </div>
        </div>

        <!-- Right column -->
        <div class="profile-stats">
          <div class="stat-box">
            <h3><span class="icon">📊</span> Your Stats</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;text-align:center;">
              <div>
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--green);opacity:0.9;" id="stat-predictions">0</div>
                <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.06em;">Predictions</div>
              </div>
              <div>
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--green);opacity:0.9;" id="stat-accuracy">—</div>
                <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.06em;">Accuracy</div>
              </div>
              <div>
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--green);opacity:0.9;" id="stat-rank">#—</div>
                <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.06em;">Rank</div>
              </div>
            </div>
          </div>

          <div class="stat-box">
            <h3><span class="icon">🏆</span> Leaderboard</h3>
            <div id="leaderboard-list">
              ${(function() {
                // Get all users from admin cache or create simple leaderboard
                let users = [];
                if (typeof _adminUsersCache !== 'undefined' && _adminUsersCache.length > 0) {
                  users = _adminUsersCache.filter(u => u.email !== 'founder@crowdverse.in');
                }
                
                // If we have no users yet, show placeholder
                if (users.length === 0) {
                  return `<div style="text-align:center;padding:2rem;color:var(--white3);font-family:var(--font-mono);font-size:0.8rem;">
                    Leaderboard will appear as more users join...
                  </div>`;
                }
                
                // Sort by tokens
                users.sort((a, b) => (b.tokens || 0) - (a.tokens || 0));
                
                // Show top 5
                return users.slice(0, 5).map((u, i) => {
                  const isYou = u.uid === State.currentUser?.uid;
                  return `
                    <div class="leaderboard-item" style="${isYou ? 'background:rgba(127,255,127,0.05);' : ''}">
                      <span class="lb-rank">#${i + 1}</span>
                      <span class="lb-name ${isYou ? 'you' : ''}">${escHtml(u.displayName || u.email?.split('@')[0] || 'User')}${isYou ? ' (You)' : ''}</span>
                      <span class="lb-score">${(u.tokens || 0).toLocaleString()}</span>
                    </div>
                  `;
                }).join('') + `
                  <div class="leaderboard-item" id="your-lb-row" style="display:none;margin-top:0.5rem;border-top:1px solid var(--border);padding-top:0.5rem;">
                    <span class="lb-rank" id="your-lb-rank">—</span>
                    <span class="lb-name you" id="your-lb-name">You</span>
                    <span class="lb-score" id="your-lb-score">—</span>
                  </div>
                `;
              })()}
            </div>
          </div>

          <div class="stat-box">
            <h3><span class="icon">🔮</span> Your Predictions</h3>
            <div id="prediction-history">
              <p style="color:var(--white3);font-size:0.85rem;font-family:var(--font-mono);">
                No predictions yet. Head to Markets to place your first one!
              </p>
            </div>
          </div>

          <!-- User's submitted markets -->
          <div class="stat-box" id="your-markets-box" style="display:none">
            <h3><span class="icon">📝</span> Your Submitted Polls</h3>
            <div id="your-markets-list"></div>
          </div>
        </div>
      </div>
    </div>
    ${buildFooter()}
  `;
}

// ── Toggle username edit form ─────────────────────────────────────────
function toggleUsernameEdit(show) {
  document.getElementById('profile-name-display').style.display = show ? 'none' : '';
  document.getElementById('profile-name-edit').style.display    = show ? ''     : 'none';
  if (show) {
    const input = document.getElementById('username-edit-input');
    input.value = State.currentUser?.displayName || '';
    input.focus();
  }
}

// ── Save new username — costs 50 tokens ──────────────────────────────
async function saveUsername() {
  let newName = document.getElementById('username-edit-input')?.value.trim();
  
  // Validation
  if (!newName || newName.length < 2) { showToast('Username must be at least 2 characters', 'yellow'); return; }
  if (newName.length > 30)            { showToast('Username too long (max 30 characters)', 'yellow'); return; }
  if (State.userTokens < 50)          { showToast('You need 50 tokens to change your username', 'red'); return; }
  
  // Sanitize - remove HTML tags and special characters
  newName = newName
    .replace(/[<>"']/g, '') // Remove < > " '
    .replace(/&/g, 'and')   // Replace & with 'and'
    .replace(/\s+/g, ' ')   // Collapse multiple spaces
    .trim();
  
  // Check for empty after sanitization
  if (!newName || newName.length < 2) { showToast('Username contains invalid characters', 'yellow'); return; }

  // Optimistic deduction (ensure never goes below 0)
  State.userTokens = Math.max(0, State.userTokens - 50);
  updateTokenDisplay();

  try {
    if (!demoMode && auth?.currentUser) {
      await auth.currentUser.updateProfile({ displayName: newName });
    }
    if (State.currentUser) State.currentUser.displayName = newName;

    if (!demoMode && db && State.currentUser) {
      await db.collection('users').doc(State.currentUser.uid).update({
        displayName: newName,
        tokens: firebase.firestore.FieldValue.increment(-50)
      });
    }

    toggleUsernameEdit(false);
    renderProfile();
    updateNavForAuth();
    showToast('✅ Username updated! 50 tokens deducted.', 'green');
  } catch (e) {
    // Rollback on failure
    State.userTokens += 50;
    updateTokenDisplay();
    showToast('Failed to update username: ' + e.message, 'red');
  }
}

// ── Render profile data ───────────────────────────────────────────────
async function renderProfile() {
  if (!State.currentUser) {
    document.getElementById('profile-logged-out').style.display = '';
    document.getElementById('profile-logged-in').style.display  = 'none';
    return;
  }
  document.getElementById('profile-logged-out').style.display = 'none';
  document.getElementById('profile-logged-in').style.display  = '';
  
  // Refresh user data from Firestore to ensure we're showing latest tokens
  if (!demoMode && db) {
    try {
      const snap = await db.collection('users').doc(State.currentUser.uid).get();
      if (snap.exists) {
        const data = snap.data();
        // Only update if tokens is actually a number (allows 0)
        if (typeof data.tokens === 'number') {
          State.userTokens = data.tokens;
        }
        State.userPredictions = data.predictions || State.userPredictions;
        updateTokenDisplay();
      }
    } catch (e) {
      console.warn('Failed to refresh profile data:', e);
    }
  }

  const name = State.currentUser.displayName
    || State.currentUser.email?.split('@')[0]
    || 'User';

  const nameEl    = document.getElementById('profile-display-name');
  const emailEl   = document.getElementById('profile-display-email');
  const lbNameEl  = document.getElementById('your-lb-name');
  const lbRowEl   = document.getElementById('your-lb-row');
  const statPredEl = document.getElementById('stat-predictions');

  if (nameEl)     nameEl.textContent  = name;
  if (emailEl)    emailEl.textContent = State.currentUser.email || 'demo@crowdverse.in';
  if (lbNameEl)   lbNameEl.textContent = name + ' (You)';
  if (lbRowEl)    lbRowEl.style.display = '';
  if (statPredEl) statPredEl.textContent = State.userPredictions.length;

  updateTokenDisplay();

  // Prediction history
  const histEl = document.getElementById('prediction-history');
  if (histEl) {
    if (State.userPredictions.length === 0) {
      histEl.innerHTML = `<p style="color:var(--white3);font-size:0.85rem;font-family:var(--font-mono);">No predictions yet. Head to Markets!</p>`;
    } else {
      histEl.innerHTML = [...State.userPredictions].reverse().map(p => `
        <div class="pred-history-item">
          <span class="pred-outcome pred-pending">PENDING</span>
          <span class="pred-title">${escHtml(p.question)}</span>
          <span class="pred-tokens">−${p.amount} · ${escHtml(p.option)}
            ${p.potentialWin ? `<br><small style="color:var(--green);opacity:0.8;">+${p.potentialWin} if win</small>` : ''}
          </span>
        </div>
      `).join('');
    }
  }

  // Submitted markets
  const myMarketsBox  = document.getElementById('your-markets-box');
  const myMarketsList = document.getElementById('your-markets-list');
  const myMarkets     = State.userCreatedMarkets.filter(m => m.createdBy === State.currentUser?.uid);
  if (myMarketsBox && myMarketsList) {
    if (myMarkets.length > 0) {
      myMarketsBox.style.display = '';
      myMarketsList.innerHTML = myMarkets.map(m => `
        <div style="padding:0.75rem;border-bottom:1px solid var(--border);font-size:0.85rem;">
          <div style="font-weight:600;color:var(--white);margin-bottom:0.25rem;">${escHtml(m.question)}</div>
          <div style="font-family:var(--font-mono);font-size:0.7rem;
                      color:${m.status === 'live' ? 'var(--green)' : m.status === 'rejected' ? 'var(--red)' : 'var(--yellow)'};">
            ${m.status === 'live' ? '● Live' : m.status === 'rejected' ? '✕ Rejected' : '⏳ Under Review'}
          </div>
        </div>
      `).join('');
    } else {
      myMarketsBox.style.display = 'none';
    }
  }
}

// ── Update home markets preview ───────────────────────────────────────
function updateHomeMarketsPreview() {
  const container = document.getElementById('home-markets-preview');
  if (!container) return;

  const markets = State.firestoreMarkets.slice(0, 3);
  if (markets.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:3rem 2rem;color:var(--white3);
                  font-family:var(--font-mono);font-size:0.85rem;grid-column:1/-1;">
        ${demoMode ? 'Demo mode: Markets will appear here when created' : 'No active markets yet. Check back soon!'}
      </div>`;
    return;
  }

  container.innerHTML = markets.map(m => {
    const pctA        = m.pctA || 50;
    const pctB        = 100 - pctA;
    const totalTokens = m.totalTokens || m.tokens || 0;
    const marketId    = String(m.firestoreId || m.id);
    const daysLeft    = getDaysRemaining(m.ends);
    return `
      <div class="market-card" data-market-id="${marketId}"
           onclick="if(event.target.closest('.share-btn')) return; if(!State.currentUser){openAuth();return;} if('${daysLeft}'==='Ended'){showToast('This market has ended','red');return;} openVote('${marketId}',null,event)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
          <div class="market-cat">${escHtml(m.cat)}</div>
          <button class="share-btn"
                  onclick="event.stopPropagation();shareMarket('${marketId}','${escHtml(m.question).replace(/'/g, "\\'")}','markets')"
                  style="background:var(--white1);border:none;border-radius:50%;width:30px;height:30px;
                         cursor:pointer;display:flex;align-items:center;justify-content:center;
                         transition:all 0.2s;font-size:0.8rem;color:var(--white3);"
                  title="Share"
                  onmouseover="this.style.background='rgba(127,255,127,0.12)';this.style.color='var(--green)'"
                  onmouseout="this.style.background='var(--white1)';this.style.color='var(--white3)'">🔗</button>
        </div>
        <h3>${escHtml(m.question)}</h3>
        <div class="odds-bar"><div class="odds-fill" style="width:${pctA}%;opacity:0.8;"></div></div>
        <div class="odds-labels">
          <span>${escHtml(m.optA)} ${pctA}%</span>
          <span>${escHtml(m.optB)} ${pctB}%</span>
        </div>
        <div class="market-meta">
          <span style="${daysLeft?.includes('⚡') ? 'color:var(--yellow);opacity:0.85;' : ''}">${daysLeft || ('Ends: ' + m.ends)}</span>
          <span class="vol">${totalTokens.toLocaleString()} pooled</span>
        </div>
      </div>`;
  }).join('');
}

// ── Update community page — community-submitted markets ───────────────
function updateCommunityPage() {
  // The community page is now simpler - just rebuild if needed
  // Check if we're on the community page and need to refresh the token display
  const tokenDisplay = document.querySelector('#page-community .token-display');
  if (tokenDisplay) {
    // Page has old structure, rebuild it
    buildCommunityPage();
    return;
  }
  
  // Otherwise, just update the token count in the form if it exists
  const balanceEl = document.querySelector('#page-community strong[style*="color:var(--green)"]');
  if (balanceEl && State.currentUser) {
    balanceEl.textContent = State.userTokens.toLocaleString();
  }
}

// ── ADMIN PAGE (shell) ────────────────────────────────────────────────
function buildAdminPage() {
  const el = document.getElementById('page-admin');
  if (!el) return;
  el.innerHTML = `
    <div id="admin-auth-wall" class="coming-soon-wrap">
      <div style="font-size:3.5rem;margin-bottom:1rem">🔐</div>
      <h2 style="font-family:var(--font-display)">Admin Access Only</h2>
      <p>This area is restricted to CrowdVerse administrators.</p>
      <button class="btn btn-primary btn-lg" onclick="openAuth()">Log In as Admin</button>
    </div>
    <div id="admin-panel-content" style="display:none"></div>
  `;
}
