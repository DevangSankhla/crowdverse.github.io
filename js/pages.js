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
      <div class="hero-actions">
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

    <!-- Sample Markets -->
    <div class="section" style="padding-top:0">
      <div class="section-label">Live Markets</div>
      <h2>What's The Crowd Saying?</h2>
      <div class="market-cards">
        ${SAMPLE_MARKETS.slice(0, 3).map(m => `
          <div class="market-card" onclick="showPage('markets')">
            <div class="market-cat">${m.cat}</div>
            <h3>${escHtml(m.question)}</h3>
            <div class="odds-bar">
              <div class="odds-fill" style="width:${m.pctA}%"></div>
            </div>
            <div class="odds-labels">
              <span>Yes ${m.pctA}%</span>
              <span>No ${100 - m.pctA}%</span>
            </div>
            <div class="market-meta">
              <span>Ends: ${m.ends}</span>
              <span class="vol">${m.tokens.toLocaleString()} tokens pooled</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Weekly Bonus -->
    <div class="section" style="padding-top:0">
      <div class="section-label">Weekly Bonus</div>
      <h2>Free Tokens, Every Week</h2>
      <p style="color:var(--white2);margin-bottom:1.5rem;max-width:620px;line-height:1.7;">
        During our launch phase, every user receives
        <strong style="color:var(--green)">200 free tokens every week</strong> — no payment
        needed. When we go live with full rewards, we'll introduce optional subscriptions for
        larger token bundles. You'll always keep a free weekly allocation.
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

// ── COMMUNITY PAGE ────────────────────────────────────────────────────
function buildCommunityPage() {
  document.getElementById('page-community').innerHTML = `
    <div class="coming-soon-wrap">
      <div class="coming-soon-badge">🤖 AI-Powered</div>
      <h2>Community Markets</h2>
      <p>
        AI-generated prediction panels based on trending topics, news, and crowd signals.
        Launching very soon — check back!
      </p>
      <button class="btn btn-primary btn-lg" onclick="showPage('markets')">
        Explore User Markets →
      </button>
    </div>
    ${buildFooter()}
  `;
}

// ── MARKETS PAGE ─────────────────────────────────────────────────────
function buildMarketsPage() {
  // Set default end-date to 3 months from today
  const future = new Date();
  future.setMonth(future.getMonth() + 3);
  const defaultDate = future.toISOString().split('T')[0];

  document.getElementById('page-markets').innerHTML = `
    <div class="page-header">
      <div class="section-label" style="margin-bottom:0.5rem">Prediction Markets</div>
      <h1>Place Your Predictions</h1>
      <p>Stake tokens on outcomes. Real-time crowd odds. No real money — ever.</p>
    </div>

    <!-- No political notice -->
    <div style="max-width:1100px;margin:1rem auto;padding:0 2rem;">
      <div class="notice-box">
        <span>🚫</span>
        <strong>Political Questions Are Strictly Prohibited.</strong>
        Markets about elections, political parties, or political figures will be removed
        immediately and the creator's account may be suspended.
      </div>
    </div>

    <div class="markets-layout">
      <!-- Markets list (left) -->
      <div class="markets-list" id="markets-list"></div>

      <!-- Create market sidebar (right) -->
      <div>
        <div class="create-market-box">
          <h3>Create a Market</h3>
          <p class="sub">
            You must be logged in. You stake a minimum of 100 tokens when creating a market.
            It goes live after our team reviews it (usually within 24–48 hours).
          </p>

          <!-- Shown when logged out -->
          <div id="create-market-login-prompt" class="hidden">
            <p style="font-size:0.85rem;color:var(--white2);margin-bottom:1rem;">
              You need an account to create prediction markets.
            </p>
            <button class="btn btn-primary w-full" onclick="openAuth()">
              Sign Up / Log In
            </button>
          </div>

          <!-- Shown when logged in -->
          <div id="create-market-form">
            <div class="form-group">
              <label class="form-label">Market Question</label>
              <input class="form-input" id="mkt-question"
                     placeholder="e.g. Will India reach the World Cup final in 2026?">
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-select" id="mkt-category">
                <option value="sports">🏏 Sports</option>
                <option value="economy">📊 Economy</option>
                <option value="entertainment">🎬 Entertainment</option>
                <option value="tech">💻 Technology</option>
                <option value="climate">🌿 Climate / Environment</option>
                <option value="other">🔮 Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Option A</label>
              <input class="form-input" id="mkt-option-a" value="Yes" placeholder="Yes / Option A">
            </div>
            <div class="form-group">
              <label class="form-label">Option B</label>
              <input class="form-input" id="mkt-option-b" value="No" placeholder="No / Option B">
            </div>
            <div class="form-group">
              <label class="form-label">End Date</label>
              <input class="form-input" id="mkt-end-date" type="date" value="${defaultDate}">
            </div>
            <div class="form-group">
              <label class="form-label">Your Stake (min 100 tokens)</label>
              <div class="token-input-wrap">
                <input class="form-input" id="mkt-stake" type="number"
                       min="100" value="100" style="padding-right:70px">
                <span class="token-label">TOKENS</span>
              </div>
            </div>
            <div class="no-political">
              <span>🚫</span>
              <span>No political questions. Violating this rule results in immediate account suspension.</span>
            </div>
            <button class="btn btn-primary w-full" onclick="submitMarket()">
              Submit for Review
            </button>
          </div>
        </div>
      </div>
    </div>

    ${buildFooter()}
  `;

  renderMarkets();
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
      <span>
        <strong>Rewards Marketplace — Coming Soon.</strong>
        Earn tokens now, redeem for real brand offers when we launch.
      </span>
    </div>
    <div class="page-header">
      <div class="section-label" style="margin-bottom:0.5rem">Rewards</div>
      <h1>Spend Your Tokens</h1>
      <p>
        Redeem earned tokens for discount coupons and exclusive offers from partner brands.
        Launching soon — keep stacking those tokens!
      </p>
    </div>
    <div class="rewards-grid">${rewardCards}</div>
    ${buildFooter()}
  `;
}

// ── PROFILE PAGE ─────────────────────────────────────────────────────
function buildProfilePage() {
  document.getElementById('page-profile').innerHTML = `
    <!-- Logged out state -->
    <div id="profile-logged-out" class="coming-soon-wrap">
      <h2>Your Profile</h2>
      <p>Sign up or log in to see your token balance, prediction history, and leaderboard rank.</p>
      <button class="btn btn-primary btn-lg" onclick="openAuth()">Sign Up / Log In</button>
    </div>

    <!-- Logged in state -->
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
            <div class="profile-name"  id="profile-display-name">User</div>
            <div class="profile-email" id="profile-display-email">user@email.com</div>
            <div class="token-display">
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
          <!-- Quick stats -->
          <div class="stat-box">
            <h3><span class="icon">📊</span> Your Stats</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;text-align:center;">
              <div>
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--green)"
                     id="stat-predictions">0</div>
                <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);
                            text-transform:uppercase;letter-spacing:0.06em;">Predictions</div>
              </div>
              <div>
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--green)"
                     id="stat-accuracy">—</div>
                <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);
                            text-transform:uppercase;letter-spacing:0.06em;">Accuracy</div>
              </div>
              <div>
                <div style="font-family:var(--font-display);font-size:1.5rem;font-weight:800;color:var(--green)"
                     id="stat-rank">#—</div>
                <div style="font-family:var(--font-mono);font-size:0.68rem;color:var(--white3);
                            text-transform:uppercase;letter-spacing:0.06em;">Rank</div>
              </div>
            </div>
          </div>

          <!-- Leaderboard -->
          <div class="stat-box">
            <h3><span class="icon">🏆</span> Leaderboard (Top Predictors)</h3>
            <div id="leaderboard-list">
              ${LEADERBOARD_SEED.map(lb => `
                <div class="leaderboard-item">
                  <span class="lb-rank ${lb.rankClass}">${lb.rank}</span>
                  <span class="lb-name">${lb.name}</span>
                  <span class="lb-score">${lb.score.toLocaleString()} tkn</span>
                </div>
              `).join('')}
              <div class="leaderboard-item" id="your-lb-row" style="display:none">
                <span class="lb-rank" id="your-lb-rank">—</span>
                <span class="lb-name you" id="your-lb-name">You</span>
                <span class="lb-score" id="your-lb-score">1,000 tkn</span>
              </div>
            </div>
          </div>

          <!-- Prediction history -->
          <div class="stat-box">
            <h3><span class="icon">🔮</span> Your Predictions</h3>
            <div id="prediction-history">
              <p style="color:var(--white3);font-size:0.85rem;font-family:var(--font-mono);">
                No predictions yet. Head to Markets to place your first one!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    ${buildFooter()}
  `;
}

// ── Render profile data (called on page visit) ────────────────────────
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

  document.getElementById('profile-display-name').textContent  = name;
  document.getElementById('profile-display-email').textContent = State.currentUser.email || 'demo@crowdverse.in';
  document.getElementById('your-lb-name').textContent          = name + ' (You)';
  document.getElementById('your-lb-row').style.display         = '';
  document.getElementById('stat-predictions').textContent      = State.userPredictions.length;
  updateTokenDisplay();

  // Prediction history
  const histEl = document.getElementById('prediction-history');
  if (State.userPredictions.length === 0) {
    histEl.innerHTML = `
      <p style="color:var(--white3);font-size:0.85rem;font-family:var(--font-mono);">
        No predictions yet. Head to Markets to place your first one!
      </p>`;
  } else {
    histEl.innerHTML = State.userPredictions.map(p => `
      <div class="pred-history-item">
        <span class="pred-outcome pred-pending">PENDING</span>
        <span class="pred-title">${escHtml(p.question)}</span>
        <span class="pred-tokens">−${p.amount} tkn · ${escHtml(p.option)}</span>
      </div>
    `).join('');
  }
}
