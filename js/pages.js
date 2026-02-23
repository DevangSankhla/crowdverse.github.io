// ─────────────────────────────────────────────────────────────────────
// pages.js — Builds HTML content for each page section
// ─────────────────────────────────────────────────────────────────────

// ── HOME PAGE ────────────────────────────────────────────────────────
function buildHomePage() {
  document.getElementById('page-home').innerHTML = `
    <!-- Hero -->
    <div class="hero">
      <div class="hero-badge">🇮🇳 India's First Prediction Market</div>
      <img src="assets/logo.jpg" alt="CrowdVerse" class="hero-logo">
      <h1>What Does The<br><span class="accent">Crowd Think?</span></h1>
      <p>
        Make educated guesses on real-world events — from sports to economy to
        entertainment. Earn tokens, climb leaderboards, and see how your predictions
        compare to thousands of others.
      </p>
      <div class="hero-actions" id="hero-cta-area">
        <!-- Updated dynamically by updateHeroCta() -->
        <button class="btn btn-primary btn-lg" onclick="openAuth()">
          Get 1000 Free Tokens →
        </button>
        <button class="btn btn-ghost btn-lg" onclick="showPage('markets')">
          Explore Markets
        </button>
      </div>
    </div>

    <!-- Stats Strip -->
    <div class="stats-strip">
      <div class="stat-item">
        <span class="stat-num">1,000</span>
        <span class="stat-label">Free Signup Tokens</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">200</span>
        <span class="stat-label">Weekly Token Bonus</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">100%</span>
        <span class="stat-label">No Real Money</span>
      </div>
      <div class="stat-item">
        <span class="stat-num">18+</span>
        <span class="stat-label">Age Verified Platform</span>
      </div>
    </div>

    <!-- Legal Banner -->
    <div style="max-width:1100px; margin:1.5rem auto; padding:0 2rem;">
      <div class="legal-banner">
        <div class="icon">⚖️</div>
        <p>
          <strong>Fully Legal & Compliant:</strong> CrowdVerse operates exclusively with virtual
          game tokens — no real money is ever deposited, wagered, or withdrawn. We comply fully
          with Indian law by offering a skill-based opinion and prediction platform. This is
          <strong>NOT betting or gambling.</strong> Tokens have no monetary value and cannot be
          converted to cash.
        </p>
      </div>
    </div>

    <!-- How It Works -->
    <div class="section">
      <div class="section-label">How It Works</div>
      <h2>Predict. Earn. Repeat.</h2>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-num">01</div>
          <div class="step-icon">🎟️</div>
          <h3>Sign Up & Get Tokens</h3>
          <p>Create your free account and instantly receive 1,000 welcome tokens. No credit
             card, no deposit — ever.</p>
        </div>
        <div class="step-card">
          <div class="step-num">02</div>
          <div class="step-icon">🔮</div>
          <h3>Make Predictions</h3>
          <p>Browse live markets across sports, economy, entertainment & more. Stake tokens
             on outcomes you believe in.</p>
        </div>
        <div class="step-card">
          <div class="step-num">03</div>
          <div class="step-icon">📈</div>
          <h3>Watch Odds Shift</h3>
          <p>As more users predict, odds shift in real-time — just like real prediction
             markets. The crowd decides.</p>
        </div>
        <div class="step-card">
          <div class="step-num">04</div>
          <div class="step-icon">🏆</div>
          <h3>Win & Redeem</h3>
          <p>Correct predictions multiply your tokens. Redeem rewards, climb the
             leaderboard, and flex your crowd wisdom.</p>
        </div>
      </div>
    </div>

    <!-- Live Markets Preview -->
    <div class="section" style="padding-top:0">
      <div class="section-label">Live Markets</div>
      <h2>What's The Crowd Saying?</h2>
      <div class="market-cards" id="home-markets-preview">
        <!-- Markets will be loaded dynamically -->
        <div style="text-align:center;padding:3rem 2rem;color:var(--white3);font-family:var(--font-mono);font-size:0.85rem;grid-column:1/-1;">
          Loading markets...
        </div>
      </div>
      <div style="text-align:center;margin-top:2rem;">
        <button class="btn btn-ghost btn-lg" onclick="showPage('markets')">View All Markets →</button>
      </div>
    </div>

    <!-- Weekly Bonus -->
    <div class="section" style="padding-top:0">
      <div class="section-label">Weekly Bonus</div>
      <h2>Free Tokens, Every Week</h2>
      <p style="color:var(--white2);margin-bottom:1.5rem;max-width:620px;line-height:1.7;">
        During our launch phase, every user receives
        <strong style="color:var(--green)">200 free tokens every week</strong> — no payment
        needed.
      </p>
      <div class="legal-banner">
        <div class="icon">🔒</div>
        <p>
          When paid subscriptions launch, they will be priced for access to prediction tools
          — <strong>NOT</strong> for purchasing outcomes. All tiers will have strict limits in
          accordance with Indian IT and gaming regulations. Full online KYC verification will
          be required at that stage.
        </p>
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
    const name = State.currentUser.displayName
      || State.currentUser.email?.split('@')[0]
      || 'Predictor';
    area.innerHTML = `
      <button class="btn btn-primary btn-lg" onclick="showPage('markets')">
        Browse Live Markets →
      </button>
      <button class="btn btn-ghost btn-lg" onclick="showPage('profile')">
        My Profile (${State.userTokens.toLocaleString()} tokens)
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

// ── COMMUNITY PAGE ────────────────────────────────────────────────────
function buildCommunityPage() {
  document.getElementById('page-community').innerHTML = `
    <div class="page-header">
      <div class="section-label" style="margin-bottom:0.5rem">Community Polls</div>
      <h1>Community Predictions</h1>
      <p>Trending topics the crowd is talking about. Join in and stake your tokens.</p>
    </div>

    <div style="max-width:1100px;margin:0 auto 2rem;padding:0 2rem;">
      <div class="stats-strip" style="margin:0;" id="community-stats">
        <div class="stat-item">
          <span class="stat-num" id="community-active-polls">—</span>
          <span class="stat-label">Active Polls</span>
        </div>
        <div class="stat-item">
          <span class="stat-num" id="community-total-volume">—</span>
          <span class="stat-label">Total Volume</span>
        </div>
        <div class="stat-item">
          <span class="stat-num" id="community-participants">—</span>
          <span class="stat-label">Participants</span>
        </div>
        <div class="stat-item">
          <span class="stat-num" id="community-token-count">${State.userTokens || '—'}</span>
          <span class="stat-label">Your Tokens</span>
        </div>
      </div>
    </div>

    <!-- Community polls grid -->
    <div style="max-width:1100px;margin:0 auto;padding:0 2rem;">
      <div class="market-cards" id="community-markets-list">
        <div style="text-align:center;padding:3rem 2rem;color:var(--white3);font-family:var(--font-mono);font-size:0.85rem;grid-column:1/-1;">
          Loading community polls...
        </div>
      </div>
    </div>

    <!-- CTA to Markets page -->
    <div style="max-width:1100px;margin:3rem auto;padding:0 2rem;">
      <div class="legal-banner" style="background:linear-gradient(135deg,rgba(0,255,127,0.1),rgba(0,255,127,0.05));border-color:var(--green);">
        <div class="icon">💡</div>
        <div>
          <p style="margin-bottom:0.5rem;"><strong>Want to create your own prediction?</strong></p>
          <p style="margin-bottom:1rem;">Head to the Markets page to submit your own question and invite the crowd to predict.</p>
          <button class="btn btn-primary" onclick="showPage('markets')">Go to Markets →</button>
        </div>
      </div>
    </div>

    ${buildFooter()}
  `;
}

// ── MARKETS PAGE ─────────────────────────────────────────────────────
function buildMarketsPage() {
  document.getElementById('page-markets').innerHTML = `
    <div class="page-header">
      <div class="section-label" style="margin-bottom:0.5rem">All Markets</div>
      <h1>Prediction Markets</h1>
      <p>Browse all live markets, or create your own for the community to predict on.</p>
    </div>

    <!-- Info banner -->
    <div style="max-width:1100px;margin:1rem auto;padding:0 2rem;">
      <div class="legal-banner" style="background:linear-gradient(135deg,rgba(0,255,127,0.1),rgba(0,255,127,0.05));border-color:var(--green);">
        <div class="icon">ℹ️</div>
        <p>
          <strong>All live and pending markets.</strong> User-created markets go live after admin approval (24–48h).
          It costs 100 tokens to submit a market.
        </p>
      </div>
    </div>

    <!-- Category filters + Create button -->
    <div style="max-width:1100px;margin:0 auto;padding:0 2rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.25rem;">
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;" id="market-filters">
          <button class="mkt-filter-btn active" data-filter="all" onclick="applyMarketFilter('all')">All</button>
          <button class="mkt-filter-btn" data-filter="sports" onclick="applyMarketFilter('sports')">🏏 Sports</button>
          <button class="mkt-filter-btn" data-filter="economy" onclick="applyMarketFilter('economy')">📊 Economy</button>
          <button class="mkt-filter-btn" data-filter="entertainment" onclick="applyMarketFilter('entertainment')">🎬 Entertainment</button>
          <button class="mkt-filter-btn" data-filter="technology" onclick="applyMarketFilter('technology')">💻 Tech</button>
          <button class="mkt-filter-btn" data-filter="crypto" onclick="applyMarketFilter('crypto')">₿ Crypto</button>
          <button class="mkt-filter-btn" data-filter="climate" onclick="applyMarketFilter('climate')">🌿 Climate</button>
        </div>
        <button class="btn btn-primary" onclick="openCreateMarketModal()">
          + Create Market
        </button>
      </div>

      <!-- Markets list - always visible -->
      <div id="markets-list" class="markets-list"></div>
      <!-- Hidden empty state used only when filter returns no results -->
      <div id="markets-empty-state" style="display:none;"></div>
    </div>

    ${buildFooter()}
  `;

  // Inject filter button styles
  if (!document.getElementById('mkt-filter-styles')) {
    const style = document.createElement('style');
    style.id = 'mkt-filter-styles';
    style.textContent = `
      .mkt-filter-btn {
        padding:0.5rem 1rem; background:var(--dark); border:1px solid var(--border2);
        border-radius:var(--radius-sm); color:var(--white2); font-family:var(--font-mono);
        font-size:0.75rem; cursor:pointer; transition:all 0.2s; white-space:nowrap;
      }
      .mkt-filter-btn:hover { background:var(--dark2); color:var(--white); }
      .mkt-filter-btn.active { background:var(--green); border-color:var(--green); color:var(--black); font-weight:700; }
    `;
    document.head.appendChild(style);
  }

  // Immediately render with seed data
  if (typeof renderMarkets === 'function') renderMarkets();
  // Then load from Firestore
  if (typeof loadAndRenderMarkets === 'function') loadAndRenderMarkets();
}

let _currentMarketFilter = 'all';

function applyMarketFilter(filter) {
  _currentMarketFilter = filter;
  document.querySelectorAll('.mkt-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  if (typeof renderMarkets === 'function') renderMarkets(filter);
}

// ── Create Market Modal ───────────────────────────────────────────────
function openCreateMarketModal() {
  if (!State.currentUser) { openAuth(); return; }

  const future = new Date();
  future.setMonth(future.getMonth() + 3);
  const defaultDate = future.toISOString().split('T')[0];

  const existing = document.getElementById('create-market-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'create-market-modal';
  modal.innerHTML = `
    <div class="modal" style="max-width:500px;">
      <button class="modal-close" onclick="closeCreateMarketModal()">✕</button>
      <h2 style="margin-bottom:0.5rem;">Create New Market</h2>
      <p style="color:var(--white2);margin-bottom:1.5rem;font-size:0.85rem;">Set up your prediction question and let the crowd weigh in. Costs 100 tokens, refunded if rejected.</p>

      <div class="form-group">
        <label class="form-label">Market Question *</label>
        <input class="form-input" id="mkt-question" placeholder="e.g., Will India win the World Cup 2026?">
      </div>
      <div class="form-group">
        <label class="form-label">Description (Optional)</label>
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

      <div style="background:var(--white1);padding:0.875rem;border-radius:8px;margin-bottom:1rem;font-size:0.82rem;color:var(--white2);">
        <strong style="color:var(--green);">Your balance:</strong> ${State.userTokens.toLocaleString()} tokens · Submitting costs <strong>100 tokens</strong>.
      </div>

      <button class="btn btn-primary w-full" onclick="submitCreateMarket()">
        Create Market (100 tokens)
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

  if (!question) { showToast('Please enter a market question', 'yellow'); return; }
  if (question.length < 10) { showToast('Question too short — be more descriptive', 'yellow'); return; }
  if (!endDate) { showToast('Please select an end date', 'yellow'); return; }
  if (State.userTokens < 100) { showToast('You need at least 100 tokens to create a market', 'red'); return; }

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
    tokens:         100,
    ends:           new Date(endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    status:         'pending',
    createdBy:      State.currentUser?.uid || 'demo',
    createdByUid:   State.currentUser?.uid || 'demo',
    createdByEmail: State.currentUser?.email || '',
    createdByName:  displayName,
    createdAt:      new Date().toISOString()
  };

  // Optimistic deduction
  State.userTokens -= 100;
  updateTokenDisplay();

  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span class="spinner"></span> Submitting…'; }

  if (!demoMode && db) {
    try {
      const docRef = await db.collection('markets').add({
        ...newMarket,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      newMarket.firestoreId = docRef.id;
      newMarket.id = docRef.id;

      await db.collection('users').doc(State.currentUser.uid).update({
        tokens: firebase.firestore.FieldValue.increment(-100)
      });
    } catch (e) {
      State.userTokens += 100;
      updateTokenDisplay();
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Market (100 tokens)'; }
      showToast('Failed to submit: ' + e.message, 'red');
      return;
    }
  }

  State.userCreatedMarkets.push(newMarket);
  closeCreateMarketModal();
  if (typeof renderMarkets === 'function') renderMarkets();
  showToast('Market submitted for admin review! ✅', 'green');
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

            <!-- Username display with edit toggle -->
            <div id="profile-name-display" style="margin-bottom:0.1rem;">
              <div class="profile-name" id="profile-display-name">User</div>
              <button onclick="toggleUsernameEdit(true)"
                      style="background:none;border:1px solid var(--border2);border-radius:var(--radius-sm);
                             padding:0.2rem 0.6rem;font-family:var(--font-mono);font-size:0.65rem;
                             color:var(--white3);cursor:pointer;margin-top:0.3rem;transition:all 0.2s;"
                      onmouseover="this.style.color='var(--green)';this.style.borderColor='var(--green)'"
                      onmouseout="this.style.color='var(--white3)';this.style.borderColor='var(--border2)'">
                ✏️ Edit Username
              </button>
            </div>

            <!-- Username edit form (hidden by default) -->
            <div id="profile-name-edit" style="display:none;margin-bottom:0.5rem;">
              <input id="username-edit-input" class="form-input"
                     placeholder="New username" maxlength="30"
                     style="margin-bottom:0.5rem;text-align:center;">
              <div style="display:flex;gap:0.5rem;">
                <button onclick="saveUsername()"
                        class="btn btn-primary" style="flex:1;padding:0.5rem;">Save</button>
                <button onclick="toggleUsernameEdit(false)"
                        class="btn btn-ghost" style="flex:1;padding:0.5rem;">Cancel</button>
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
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--green)" id="stat-predictions">0</div>
                <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.06em;">Predictions</div>
              </div>
              <div>
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--green)" id="stat-accuracy">—</div>
                <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.06em;">Accuracy</div>
              </div>
              <div>
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--green)" id="stat-rank">#—</div>
                <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);text-transform:uppercase;letter-spacing:0.06em;">Rank</div>
              </div>
            </div>
          </div>

          <div class="stat-box">
            <h3><span class="icon">🏆</span> Leaderboard</h3>
            <div id="leaderboard-list">
              <div style="text-align:center;padding:2rem;color:var(--white3);font-family:var(--font-mono);font-size:0.8rem;">
                Leaderboard coming soon...
              </div>
              <div class="leaderboard-item" id="your-lb-row" style="display:none">
                <span class="lb-rank" id="your-lb-rank">—</span>
                <span class="lb-name you" id="your-lb-name">You</span>
                <span class="lb-score" id="your-lb-score">—</span>
              </div>
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

          <!-- Your created markets -->
          <div class="stat-box" id="your-markets-box" style="display:none">
            <h3><span class="icon">📈</span> Your Submitted Markets</h3>
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
  document.getElementById('profile-name-edit').style.display = show ? '' : 'none';
  if (show) {
    const input = document.getElementById('username-edit-input');
    input.value = State.currentUser?.displayName || '';
    input.focus();
  }
}

// ── Save new username ─────────────────────────────────────────────────
async function saveUsername() {
  const newName = document.getElementById('username-edit-input')?.value.trim();
  if (!newName || newName.length < 2) { showToast('Username must be at least 2 characters', 'yellow'); return; }
  if (newName.length > 30) { showToast('Username too long (max 30 characters)', 'yellow'); return; }

  try {
    if (!demoMode && auth?.currentUser) {
      await auth.currentUser.updateProfile({ displayName: newName });
    }
    if (State.currentUser) State.currentUser.displayName = newName;

    // Update Firestore
    if (!demoMode && db && State.currentUser) {
      await db.collection('users').doc(State.currentUser.uid).update({ displayName: newName });
    }

    toggleUsernameEdit(false);
    renderProfile();
    updateNavForAuth();
    showToast('✅ Username updated!', 'green');
  } catch (e) {
    showToast('Failed to update username: ' + e.message, 'red');
  }
}

// ── Render profile data ───────────────────────────────────────────────
function renderProfile() {
  if (!State.currentUser) {
    document.getElementById('profile-logged-out').style.display = '';
    document.getElementById('profile-logged-in').style.display  = 'none';
    return;
  }
  document.getElementById('profile-logged-out').style.display = 'none';
  document.getElementById('profile-logged-in').style.display  = '';

  const name = State.currentUser.displayName
    || State.currentUser.email?.split('@')[0]
    || 'User';

  const nameEl = document.getElementById('profile-display-name');
  const emailEl = document.getElementById('profile-display-email');
  const lbNameEl = document.getElementById('your-lb-name');
  const lbRowEl = document.getElementById('your-lb-row');
  const statPredEl = document.getElementById('stat-predictions');

  if (nameEl) nameEl.textContent = name;
  if (emailEl) emailEl.textContent = State.currentUser.email || 'demo@crowdverse.in';
  if (lbNameEl) lbNameEl.textContent = name + ' (You)';
  if (lbRowEl) lbRowEl.style.display = '';
  if (statPredEl) statPredEl.textContent = State.userPredictions.length;

  updateTokenDisplay();

  // Prediction history
  const histEl = document.getElementById('prediction-history');
  if (histEl) {
    if (State.userPredictions.length === 0) {
      histEl.innerHTML = `<p style="color:var(--white3);font-size:0.85rem;font-family:var(--font-mono);">No predictions yet. Head to Markets!</p>`;
    } else {
      histEl.innerHTML = State.userPredictions.map(p => `
        <div class="pred-history-item">
          <span class="pred-outcome pred-pending">PENDING</span>
          <span class="pred-title">${escHtml(p.question)}</span>
          <span class="pred-tokens">−${p.amount} · ${escHtml(p.option)}
            ${p.potentialWin ? `<br><small style="color:var(--green);">+${p.potentialWin} if win</small>` : ''}
          </span>
        </div>
      `).join('');
    }
  }

  // User's submitted markets
  const myMarketsBox = document.getElementById('your-markets-box');
  const myMarketsList = document.getElementById('your-markets-list');
  const myMarkets = State.userCreatedMarkets.filter(m => m.createdBy === State.currentUser?.uid);
  if (myMarketsBox && myMarketsList) {
    if (myMarkets.length > 0) {
      myMarketsBox.style.display = '';
      myMarketsList.innerHTML = myMarkets.map(m => `
        <div style="padding:0.75rem;border-bottom:1px solid var(--border);font-size:0.85rem;">
          <div style="font-weight:600;color:var(--white);margin-bottom:0.25rem;">${escHtml(m.question)}</div>
          <div style="font-family:var(--font-mono);font-size:0.72rem;color:${m.status === 'live' ? 'var(--green)' : m.status === 'rejected' ? '#ff8888' : 'var(--yellow)'};">
            ${m.status === 'live' ? '● Live' : m.status === 'rejected' ? '✕ Rejected' : '⏳ Pending Review'}
          </div>
        </div>
      `).join('');
    } else {
      myMarketsBox.style.display = 'none';
    }
  }
}

// ── Update home page markets preview ──────────────────────────────────
function updateHomeMarketsPreview() {
  const container = document.getElementById('home-markets-preview');
  if (!container) return;

  const markets = State.firestoreMarkets.slice(0, 3);
  
  if (markets.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:3rem 2rem;color:var(--white3);font-family:var(--font-mono);font-size:0.85rem;grid-column:1/-1;">
        ${demoMode ? 'Demo mode: Markets will appear here when created' : 'No active markets yet. Check back soon!'}
      </div>`;
    return;
  }

  container.innerHTML = markets.map(m => {
    const pctA = m.pctA || 50;
    const pctB = 100 - pctA;
    const totalTokens = m.totalTokens || m.tokens || 0;
    const marketId = String(m.firestoreId || m.id);
    return `
      <div class="market-card" data-market-id="${marketId}"
           onclick="if(event.target.closest('.share-btn')) return; if(State.currentUser){openVote('${marketId}',null,event)}else{openAuth()}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
          <div class="market-cat">${escHtml(m.cat)}</div>
          <button class="share-btn"
                  onclick="event.stopPropagation();shareMarket('${marketId}','${escHtml(m.question).replace(/'/g,"\\'")}','markets')"
                  style="background:var(--white1);border:none;border-radius:50%;width:32px;height:32px;
                         cursor:pointer;display:flex;align-items:center;justify-content:center;
                         transition:all 0.2s;font-size:0.9rem;"
                  title="Share this prediction"
                  onmouseover="this.style.background='var(--green)'"
                  onmouseout="this.style.background='var(--white1)'">🔗</button>
        </div>
        <h3>${escHtml(m.question)}</h3>
        <div class="odds-bar"><div class="odds-fill" style="width:${pctA}%"></div></div>
        <div class="odds-labels">
          <span>${escHtml(m.optA)} ${pctA}%</span>
          <span>${escHtml(m.optB)} ${pctB}%</span>
        </div>
        <div class="market-meta">
          <span>Ends: ${m.ends}</span>
          <span class="vol">${totalTokens.toLocaleString()} tokens pooled</span>
        </div>
      </div>`;
  }).join('');
}

// ── Update community page markets and stats ───────────────────────────
function updateCommunityPage() {
  // Update stats
  const activePollsEl = document.getElementById('community-active-polls');
  const totalVolumeEl = document.getElementById('community-total-volume');
  const participantsEl = document.getElementById('community-participants');
  const tokenCountEl = document.getElementById('community-token-count');
  
  const markets = State.firestoreMarkets;
  const totalVolume = markets.reduce((acc, m) => acc + (m.totalTokens || m.tokens || 0), 0);
  const totalVotes = markets.reduce((acc, m) => acc + (m.voteCount || 0), 0);
  
  if (activePollsEl) activePollsEl.textContent = markets.length;
  if (totalVolumeEl) totalVolumeEl.textContent = totalVolume.toLocaleString();
  if (participantsEl) participantsEl.textContent = totalVotes.toLocaleString();
  if (tokenCountEl) tokenCountEl.textContent = State.userTokens.toLocaleString();
  
  // Update markets list
  const container = document.getElementById('community-markets-list');
  if (!container) return;

  if (markets.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:3rem 2rem;color:var(--white3);font-family:var(--font-mono);font-size:0.85rem;grid-column:1/-1;">
        ${demoMode ? 'Demo mode: Community polls will appear here when created' : 'No active polls yet. Be the first to create one!'}
      </div>`;
    return;
  }

  container.innerHTML = markets.map(m => {
    const pctA = m.pctA || 50;
    const pctB = 100 - pctA;
    const totalTokens = m.totalTokens || m.tokens || 0;
    const marketId = String(m.firestoreId || m.id);
    return `
      <div class="market-card" data-market-id="${marketId}"
           onclick="if(event.target.closest('.share-btn')) return; if(State.currentUser){openVote('${marketId}',null,event)}else{openAuth()}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;">
          <div class="market-cat">${escHtml(m.cat)}</div>
          <button class="share-btn"
                  onclick="event.stopPropagation();shareMarket('${marketId}','${escHtml(m.question).replace(/'/g,"\\'")}','community')"
                  style="background:var(--white1);border:none;border-radius:50%;width:32px;height:32px;
                         cursor:pointer;display:flex;align-items:center;justify-content:center;
                         transition:all 0.2s;font-size:0.9rem;"
                  title="Share"
                  onmouseover="this.style.background='var(--green)'"
                  onmouseout="this.style.background='var(--white1)'">🔗</button>
        </div>
        <h3>${escHtml(m.question)}</h3>
        <div class="odds-bar"><div class="odds-fill" style="width:${pctA}%"></div></div>
        <div class="odds-labels">
          <span>${escHtml(m.optA)} ${pctA}%</span>
          <span>${escHtml(m.optB)} ${pctB}%</span>
        </div>
        <div class="market-meta">
          <span>Ends: ${m.ends}</span>
          <span class="vol">${totalTokens.toLocaleString()} tokens pooled</span>
        </div>
      </div>`;
  }).join('');
}

// ── ADMIN PAGE ────────────────────────────────────────────────────────
function buildAdminPage() {
  const el = document.getElementById('page-admin');
  if (!el) return;
  el.innerHTML = `
    <!-- Auth wall -->
    <div id="admin-auth-wall" class="coming-soon-wrap">
      <div style="font-size:3.5rem;margin-bottom:1rem">🔐</div>
      <h2 style="font-family:var(--font-display)">Admin Access Only</h2>
      <p>This area is restricted to CrowdVerse administrators.</p>
      <button class="btn btn-primary btn-lg" onclick="openAuth()">Log In as Admin</button>
    </div>
    <!-- Panel injected by admin.js -->
    <div id="admin-panel-content" style="display:none"></div>
  `;
}
