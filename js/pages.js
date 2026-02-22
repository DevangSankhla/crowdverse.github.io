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
        ${SAMPLE_MARKETS.slice(0, 3).map(m => {
          const pctB = 100 - m.pctA;
          return `
          <div class="market-card" onclick="if(State.currentUser){openVote(${m.id},null,event)}else{openAuth()}">
            <div class="market-cat">${escHtml(m.cat)}</div>
            <h3>${escHtml(m.question)}</h3>
            <div class="odds-bar">
              <div class="odds-fill" style="width:${m.pctA}%"></div>
            </div>
            <div class="odds-labels">
              <span>${escHtml(m.optA)} ${m.pctA}%</span>
              <span>${escHtml(m.optB)} ${pctB}%</span>
            </div>
            <div class="market-meta">
              <span>Ends: ${m.ends}</span>
              <span class="vol">${m.tokens.toLocaleString()} tokens pooled</span>
            </div>
          </div>
          `;
        }).join('')}
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
  const totalParticipants = SAMPLE_MARKETS.reduce((acc, m) => acc + Math.floor(m.tokens / 50), 0);
  const totalVolume = SAMPLE_MARKETS.reduce((acc, m) => acc + m.tokens, 0);
  
  document.getElementById('page-community').innerHTML = `
    <div class="page-header">
      <div class="section-label" style="margin-bottom:0.5rem">Community Polls</div>
      <h1>Community Predictions</h1>
      <p>Join the crowd. Predict on trending topics and earn tokens.</p>
    </div>
    
    <!-- Stats bar -->
    <div style="max-width:1100px;margin:0 auto 2rem;padding:0 2rem;">
      <div class="stats-strip" style="margin:0;">
        <div class="stat-item">
          <span class="stat-num">${SAMPLE_MARKETS.length}</span>
          <span class="stat-label">Active Polls</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${totalVolume.toLocaleString()}</span>
          <span class="stat-label">Total Volume</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${totalParticipants.toLocaleString()}</span>
          <span class="stat-label">Participants</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${State.userTokens || 1000}</span>
          <span class="stat-label">Your Tokens</span>
        </div>
      </div>
    </div>
    
    <!-- Polls grid -->
    <div style="max-width:1100px;margin:0 auto;padding:0 2rem;">
      <div class="market-cards">
        ${SAMPLE_MARKETS.map(m => {
          const pctB = 100 - m.pctA;
          return `
          <div class="market-card" onclick="openVote(${m.id}, null, event)">
            <div class="market-cat">${escHtml(m.cat)}</div>
            <h3>${escHtml(m.question)}</h3>
            <div class="odds-bar">
              <div class="odds-fill" style="width:${m.pctA}%"></div>
            </div>
            <div class="odds-labels">
              <span>${escHtml(m.optA)} ${m.pctA}%</span>
              <span>${escHtml(m.optB)} ${pctB}%</span>
            </div>
            <div class="market-meta">
              <span>Ends: ${m.ends}</span>
              <span class="vol">${m.tokens.toLocaleString()} tokens pooled</span>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
    
    <!-- Create your own CTA -->
    <div style="max-width:1100px;margin:3rem auto;padding:0 2rem;">
      <div class="legal-banner" style="background:linear-gradient(135deg, rgba(0,255,127,0.1), rgba(0,255,127,0.05));border-color:var(--green);">
        <div class="icon">💡</div>
        <div>
          <p style="margin-bottom:0.5rem;"><strong>Want to Create Your Own Poll?</strong></p>
          <p style="margin-bottom:1rem;">Head over to the Markets page to create your own prediction panels and invite others to predict.</p>
          <button class="btn btn-primary" onclick="showPage('markets')">Create Your Market →</button>
        </div>
      </div>
    </div>
    
    ${buildFooter()}
  `;
}

// ── MARKETS PAGE ─────────────────────────────────────────────────────
function buildMarketsPage() {
  renderMarketsPageContent();
}

function renderMarketsPageContent() {
  const hasMarkets = State.userCreatedMarkets && State.userCreatedMarkets.length > 0;
  
  document.getElementById('page-markets').innerHTML = `
    <div class="page-header">
      <div class="section-label" style="margin-bottom:0.5rem">Your Markets</div>
      <h1>Your Prediction Markets</h1>
      <p>Create your own prediction markets and invite others to predict.</p>
    </div>
    
    <!-- Info banner -->
    <div style="max-width:1100px;margin:1rem auto;padding:0 2rem;">
      <div class="legal-banner" style="background:linear-gradient(135deg, rgba(0,255,127,0.1), rgba(0,255,127,0.05));border-color:var(--green);">
        <div class="icon">ℹ️</div>
        <p>
          <strong>Create Your Own Predictions</strong><br>
          This is your space to create prediction markets on any topic you are curious about. 
          Set the question, define the outcomes, and let the community predict.
        </p>
      </div>
    </div>
    
    <!-- Create button -->
    <div style="max-width:1100px;margin:2rem auto;padding:0 2rem;text-align:center;">
      <button class="btn btn-primary btn-lg" onclick="openCreateMarketModal()">
        <span style="margin-right:0.5rem;">+</span> Create New Market
      </button>
    </div>
    
    <!-- Markets list (always present, may be empty) -->
    <div style="max-width:1100px;margin:0 auto;padding:0 2rem;">
      <div id="markets-list" class="markets-list" style="${hasMarkets ? '' : 'display:none'}"></div>
      
      <div id="markets-empty-state" class="coming-soon-wrap" style="padding:4rem 2rem;${hasMarkets ? 'display:none' : ''}">
        <div class="coming-soon-badge" style="background:var(--green);color:var(--black);">📊</div>
        <h2>No Markets Yet</h2>
        <p style="max-width:500px;margin:0 auto 1.5rem;">
          Create your first prediction market and start building your community of predictors. 
          It is easy and only takes a minute.
        </p>
        <button class="btn btn-primary" onclick="openCreateMarketModal()">
          Create Your First Market →
        </button>
      </div>
    </div>
    
    ${buildFooter()}
  `;
  
  // Render markets if any exist
  if (hasMarkets && typeof renderMarkets === 'function') {
    renderMarkets();
  }
}

// ── Create Market Modal ───────────────────────────────────────────────
function openCreateMarketModal() {
  // Check if logged in
  if (!State.currentUser) {
    openAuth();
    return;
  }
  
  // Set default end date to 3 months from today
  const future = new Date();
  future.setMonth(future.getMonth() + 3);
  const defaultDate = future.toISOString().split('T')[0];
  
  // Remove existing modal if any
  const existingModal = document.getElementById('create-market-modal');
  if (existingModal) existingModal.remove();
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'create-market-modal';
  modal.innerHTML = `
    <div class="modal" style="max-width:500px;">
      <button class="modal-close" onclick="closeCreateMarketModal()">✕</button>
      
      <h2 style="margin-bottom:0.5rem;">Create New Market</h2>
      <p style="color:var(--white2);margin-bottom:1.5rem;">Set up your prediction question and let the crowd weigh in.</p>
      
      <div class="form-group">
        <label class="form-label">Market Question *</label>
        <input class="form-input" id="mkt-question" placeholder="e.g., Will India win the World Cup 2026?">
      </div>
      
      <div class="form-group">
        <label class="form-label">Description (Optional)</label>
        <textarea class="form-input" id="mkt-description" rows="2" placeholder="Add more context to help predictors..."></textarea>
      </div>
      
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-select" id="mkt-category">
          <option value="sports">🏏 Sports</option>
          <option value="economy">📊 Economy</option>
          <option value="entertainment">🎬 Entertainment</option>
          <option value="tech">💻 Technology</option>
          <option value="climate">🌿 Climate</option>
          <option value="crypto">₿ Crypto</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">End Date *</label>
        <input class="form-input" type="date" id="mkt-enddate" value="${defaultDate}">
      </div>
      
      <div class="form-group">
        <label class="form-label">Option A (Yes side)</label>
        <input class="form-input" id="mkt-option-a" value="Yes" placeholder="Yes">
      </div>
      
      <div class="form-group">
        <label class="form-label">Option B (No side)</label>
        <input class="form-input" id="mkt-option-b" value="No" placeholder="No">
      </div>
      
      <div style="background:var(--white1);padding:1rem;border-radius:8px;margin-bottom:1rem;">
        <p style="font-size:0.85rem;color:var(--white2);margin:0;">
          <strong style="color:var(--green);">Note:</strong> You will stake <strong>100 tokens</strong> to create this market. 
          It will go live after admin review (usually within 24-48 hours).
        </p>
      </div>
      
      <button class="btn btn-primary w-full" onclick="submitCreateMarket()">
        Create Market (100 tokens)
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Trigger animation - ensure display is set first
  requestAnimationFrame(() => {
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
  });
}

function closeCreateMarketModal() {
  const modal = document.getElementById('create-market-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      if (modal.parentNode) modal.remove();
    }, 300); // wait for opacity transition to finish
  }
}

async function submitCreateMarket() {
  const question = document.getElementById('mkt-question').value.trim();
  const description = document.getElementById('mkt-description')?.value.trim() || '';
  const category = document.getElementById('mkt-category').value;
  const optA = document.getElementById('mkt-option-a').value.trim() || 'Yes';
  const optB = document.getElementById('mkt-option-b').value.trim() || 'No';
  const endDate = document.getElementById('mkt-enddate').value;
  
  // Validation
  if (!question) {
    showToast('Please enter a market question', 'yellow');
    return;
  }
  
  if (question.length < 10) {
    showToast('Question too short - be more descriptive', 'yellow');
    return;
  }
  
  if (!endDate) {
    showToast('Please select an end date', 'yellow');
    return;
  }
  
  // Check tokens
  if (State.userTokens < 100) {
    showToast('You need at least 100 tokens to create a market', 'red');
    return;
  }
  
  // Deduct tokens
  State.userTokens -= 100;
  updateTokenDisplay();
  
  // Category emoji mapping
  const catEmojis = {
    sports: '🏏 Sports',
    economy: '📊 Economy',
    entertainment: '🎬 Entertainment',
    tech: '💻 Technology',
    climate: '🌿 Climate',
    crypto: '₿ Crypto'
  };
  
  const marketId = Date.now();
  
  // Create new market
  const newMarket = {
    id: marketId,
    question: question,
    description: description,
    cat: catEmojis[category] || '🔮 Other',
    category: category,
    optA: optA,
    optB: optB,
    pctA: 50,
    tokens: 100,
    ends: new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    endDate: endDate,
    status: 'pending',
    createdBy: State.currentUser?.uid || 'demo',
    createdByName: State.currentUser?.displayName || State.currentUser?.email?.split('@')[0] || 'Anonymous',
    createdByEmail: State.currentUser?.email || '',
    createdAt: Date.now()
  };
  
  State.userCreatedMarkets.push(newMarket);
  
  // Save to Firebase if connected (for admin panel)
  if (!demoMode && typeof db !== 'undefined' && db) {
    try {
      await db.collection('markets').doc(String(marketId)).set({
        ...newMarket,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('Market saved to Firebase for admin review');
    } catch (e) {
      console.warn('Failed to save market to Firebase:', e);
    }
    
    // Also save user data
    try {
      await saveUserData();
    } catch (e) {
      console.warn('Failed to save user data:', e);
    }
  }
  
  closeCreateMarketModal();
  
  // Toggle empty state vs list visibility
  const listEl = document.getElementById('markets-list');
  const emptyEl = document.getElementById('markets-empty-state');
  
  if (listEl) listEl.style.display = '';
  if (emptyEl) emptyEl.style.display = 'none';
  
  // Re-render markets list
  if (typeof renderMarkets === 'function') {
    renderMarkets();
  }
  
  // Show success
  setTimeout(() => {
    showToast('Market created! Pending admin review ✅', 'green');
  }, 400);
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
