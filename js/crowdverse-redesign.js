// ═════════════════════════════════════════════════════════════════════════════
// CrowdVerse Redesign — Interactive features and enhancements
// ═════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 1. ENHANCED MARKET CARDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Render an enhanced market card with live stats, visual bar, countdown, and category emoji
 */
function renderEnhancedMarketCard(m, container) {
  const pctA = m.pctA || 50;
  const pctB = 100 - pctA;
  const totalTokens = m.totalTokens || m.tokens || 0;
  const marketId = String(m.firestoreId || m.id);
  const isLive = m.status === 'live';
  const daysLeft = getDaysRemaining(m.ends);
  const hasVoted = State.userPredictions.some(p => String(p.marketId) === marketId);
  const voteCount = m.voteCount || Math.floor(totalTokens / 50) || 0; // Estimate if not available
  
  // Category emoji mapping
  const categoryEmojis = {
    'sports': '🏆',
    'economy': '📈',
    'entertainment': '🎬',
    'technology': '💻',
    'climate': '🌍',
    'crypto': '₿',
    'politics': '🏛️',
    'science': '🔬'
  };
  
  const catKey = (m.cat || '').toLowerCase().replace(/[^a-z]/g, '');
  const catEmoji = categoryEmojis[catKey] || '🔮';
  
  // Countdown urgency
  const isUrgent = daysLeft && (daysLeft.includes('today') || daysLeft.includes('1 day'));
  
  const card = document.createElement('div');
  card.className = 'market-card-v2 cv-fade-in';
  card.dataset.marketId = marketId;
  
  card.innerHTML = `
    <div class="market-card-header">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <div class="market-category-badge">
          <span class="market-category-emoji">${catEmoji}</span>
          ${getCategoryIconHtml(m.cat || 'General')}
        </div>
        ${isLive ? '<div class="market-live-indicator">LIVE</div>' : ''}
        ${hasVoted ? '<div class="market-predicted-badge">✓ Predicted</div>' : ''}
      </div>
      <button onclick="event.stopPropagation();shareMarket('${marketId}','${escHtml(m.question).replace(/'/g, "\\'")}','markets')"
              style="background: var(--cv-dark2); border: 1px solid var(--cv-border2); border-radius: 50%; 
                     width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; 
                     justify-content: center; transition: all 0.2s; font-size: 0.85rem; color: var(--cv-white3);"
              title="Share this market"
              onmouseover="this.style.borderColor='rgba(125,216,125,0.4)';this.style.color='var(--cv-green)';this.style.transform='scale(1.1)'"
              onmouseout="this.style.borderColor='var(--cv-border2)';this.style.color='var(--cv-white3)';this.style.transform='scale(1)'">
        🔗
      </button>
    </div>
    
    <h3 class="market-question-v2">${escHtml(m.question)}</h3>
    
    <div class="market-outcomes-bar">
      <div class="outcome-bar-wrapper">
        <div class="outcome-bar-yes" style="width: ${pctA}%">
          ${pctA >= 20 ? `<div class="outcome-bar-label">
            <span>${pctA}%</span>
            <span style="font-size: 0.65rem; opacity: 0.8;">${escHtml(m.optA || 'Yes')}</span>
          </div>` : ''}
        </div>
        <div class="outcome-bar-no" style="width: ${pctB}%">
          ${pctB >= 20 ? `<div class="outcome-bar-label">
            <span>${pctB}%</span>
            <span style="font-size: 0.65rem; opacity: 0.8;">${escHtml(m.optB || 'No')}</span>
          </div>` : ''}
        </div>
      </div>
    </div>
    
    <div class="market-card-stats">
      <div class="stat-item-v2">
        <span class="stat-icon">👥</span>
        <span><span class="stat-value">${voteCount.toLocaleString()}</span> predicting</span>
      </div>
      <div class="stat-item-v2">
        <span class="stat-icon">💰</span>
        <span><span class="stat-value">${totalTokens.toLocaleString()}</span> pooled</span>
      </div>
      ${daysLeft ? `
      <div class="stat-item-v2" style="margin-left: auto;">
        <div class="countdown-timer ${isUrgent ? 'urgent' : ''}">
          <span>⏱️</span>
          <span>${daysLeft.replace(' ⚡', '')}</span>
        </div>
      </div>
      ` : ''}
    </div>
    
    ${isLive ? `
    <div class="market-vote-buttons">
      <button class="vote-btn-v2 yes" onclick="event.stopPropagation();openVote('${marketId}','a',event)">
        <span>${escHtml(m.optA || 'Yes')}</span>
        <span class="btn-label">${pctA}% chance</span>
      </button>
      <button class="vote-btn-v2 no" onclick="event.stopPropagation();openVote('${marketId}','b',event)">
        <span>${escHtml(m.optB || 'No')}</span>
        <span class="btn-label">${pctB}% chance</span>
      </button>
    </div>
    ` : `
    <div style="padding: 0.75rem; background: var(--cv-dark2); border-radius: var(--cv-radius-md); 
                font-family: var(--font-mono); font-size: 0.75rem; color: var(--cv-white3); text-align: center;">
      ⏳ Awaiting admin approval before going live
    </div>
    `}
  `;
  
  // Make entire card clickable for voting (if not clicking buttons)
  card.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('.market-vote-buttons')) return;
    if (!State.currentUser) { openAuth(); return; }
    if (daysLeft === 'Ended') { showToast('This market has ended', 'red'); return; }
    if (isLive) { openVote(marketId, null, null); }
  });
  
  container.appendChild(card);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. STREAK COUNTER & ANIMATED WALLET
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get user's current streak (mock implementation - would be stored in Firestore)
 */
function getUserStreak() {
  // In production, this would fetch from user data
  return State.userStreak || { current: 0, best: 0 };
}

/**
 * Update streak display in navbar
 */
function updateStreakDisplay() {
  const streak = getUserStreak();
  const streakEl = document.getElementById('nav-streak-counter');
  if (streakEl) {
    streakEl.querySelector('.streak-count').textContent = streak.current;
    streakEl.style.display = streak.current > 0 ? 'flex' : 'none';
  }
}

/**
 * Increment streak (call when user makes daily prediction)
 */
function incrementStreak() {
  const today = new Date().toDateString();
  const lastPrediction = State.lastPredictionDate;
  
  if (lastPrediction === today) return; // Already predicted today
  
  if (!State.userStreak) {
    State.userStreak = { current: 1, best: 1 };
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastPrediction === yesterday.toDateString()) {
      // Continuing streak
      State.userStreak.current++;
      State.userStreak.best = Math.max(State.userStreak.best, State.userStreak.current);
    } else {
      // Streak broken, start new
      State.userStreak.current = 1;
    }
  }
  
  State.lastPredictionDate = today;
  updateStreakDisplay();
  
  // Show streak milestone toast
  if (State.userStreak.current === 3) {
    showToast('🔥 3-day streak! Keep it up!', 'green');
  } else if (State.userStreak.current === 7) {
    showToast('🔥🔥 7-day streak! You\'re on fire!', 'green');
    triggerConfetti();
  }
}

/**
 * Animate token change
 */
function animateTokenChange(amount, isGain = true) {
  const walletEl = document.getElementById('token-nav-badge');
  if (!walletEl) return;
  
  // Create floating number animation
  const floatEl = document.createElement('div');
  floatEl.textContent = (isGain ? '+' : '') + amount;
  floatEl.style.cssText = `
    position: absolute;
    top: -20px;
    right: 0;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 700;
    color: ${isGain ? 'var(--cv-green)' : 'var(--cv-red)'};
    animation: token-float-up 1s ease-out forwards;
    pointer-events: none;
  `;
  
  walletEl.style.position = 'relative';
  walletEl.appendChild(floatEl);
  
  setTimeout(() => floatEl.remove(), 1000);
  
  // Add CSS animation if not exists
  if (!document.getElementById('token-anim-styles')) {
    const style = document.createElement('style');
    style.id = 'token-anim-styles';
    style.textContent = `
      @keyframes token-float-up {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-20px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BADGE / MILESTONE SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

const BADGES = [
  { id: 'first_prediction', name: 'First Steps', desc: 'Place your first prediction', icon: '🎯', condition: (u) => (u.predictions?.length || 0) >= 1 },
  { id: 'five_wins', name: 'Winner', desc: 'Win 5 predictions', icon: '🏆', condition: (u) => countWins(u) >= 5 },
  { id: 'top_10', name: 'Top 10%', desc: 'Reach top 10% on leaderboard', icon: '⭐', condition: (u) => isTopPercentile(u, 10) },
  { id: 'market_maker', name: 'Market Maker', desc: 'Create 3 markets', icon: '📊', condition: (u) => (u.createdMarkets?.length || 0) >= 3 },
  { id: 'weekly_warrior', name: 'Weekly Warrior', desc: '7-day prediction streak', icon: '🔥', condition: (u) => (u.streak?.current || 0) >= 7 },
  { id: 'high_roller', name: 'High Roller', desc: 'Stake 1000+ tokens at once', icon: '💎', condition: (u) => hasHighStake(u, 1000) },
  { id: 'social_butterfly', name: 'Social', desc: 'Share 3 markets', icon: '🦋', condition: (u) => (u.shares || 0) >= 3 },
  { id: 'early_adopter', name: 'Early Bird', desc: 'Joined during beta', icon: '🐦', condition: (u) => true } // Auto-unlock for beta users
];

function countWins(user) {
  return (user.predictions || []).filter(p => p.status === 'won').length;
}

function isTopPercentile(user, percentile) {
  // Mock implementation - would check against actual leaderboard
  return false;
}

function hasHighStake(user, amount) {
  return (user.predictions || []).some(p => p.amount >= amount);
}

/**
 * Get user's unlocked badges
 */
function getUserBadges() {
  const userData = {
    predictions: State.userPredictions,
    createdMarkets: State.userCreatedMarkets,
    streak: State.userStreak,
    shares: State.userShares || 0
  };
  
  return BADGES.map(badge => ({
    ...badge,
    unlocked: badge.condition(userData),
    unlockedAt: State.userBadges?.[badge.id]
  }));
}

/**
 * Render badges on profile
 */
function renderBadges() {
  const container = document.getElementById('user-badges-container');
  if (!container) return;
  
  const badges = getUserBadges();
  const unlockedCount = badges.filter(b => b.unlocked).length;
  
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3 style="font-family: var(--font-display); font-size: 1rem; font-weight: 700;">
        🏅 Achievements
      </h3>
      <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--cv-white3);">
        ${unlockedCount}/${badges.length} unlocked
      </span>
    </div>
    <div class="badges-container">
      ${badges.map(badge => `
        <div class="badge ${badge.unlocked ? 'unlocked' : 'locked'}" 
             title="${badge.desc}${badge.unlockedAt ? ' • Unlocked ' + formatTimeAgo(badge.unlockedAt) : ''}">
          <div class="badge-icon">${badge.icon}</div>
          <div class="badge-name">${badge.name}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Check and unlock new badges
 */
function checkBadgeUnlocks() {
  const userData = {
    predictions: State.userPredictions,
    createdMarkets: State.userCreatedMarkets,
    streak: State.userStreak,
    shares: State.userShares || 0
  };
  
  if (!State.userBadges) State.userBadges = {};
  
  BADGES.forEach(badge => {
    if (!State.userBadges[badge.id] && badge.condition(userData)) {
      // New badge unlocked!
      State.userBadges[badge.id] = new Date().toISOString();
      showBadgeUnlockNotification(badge);
      triggerConfetti();
      
      // Save to Firestore
      if (!demoMode && db && State.currentUser) {
        db.collection('users').doc(State.currentUser.uid).update({
          badges: State.userBadges
        }).catch(() => {});
      }
    }
  });
  
  renderBadges();
}

function showBadgeUnlockNotification(badge) {
  const notification = document.createElement('div');
  notification.className = 'badge-unlock-notification';
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem;">
      <div style="font-size: 2.5rem; animation: badge-bounce 0.5s ease;">${badge.icon}</div>
      <div>
        <div style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--cv-green);">
          Achievement Unlocked!
        </div>
        <div style="font-size: 0.9rem; color: var(--cv-white);">${badge.name}</div>
        <div style="font-size: 0.75rem; color: var(--cv-white3);">${badge.desc}</div>
      </div>
    </div>
  `;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: var(--cv-dark);
    border: 1px solid var(--cv-green);
    border-radius: var(--cv-radius-lg);
    padding: 1rem 1.25rem;
    box-shadow: var(--cv-shadow-md), 0 0 30px rgba(125, 216, 125, 0.2);
    z-index: 10000;
    animation: slide-in-right 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slide-out-right 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
  
  // Add animation styles
  if (!document.getElementById('badge-notif-styles')) {
    const style = document.createElement('style');
    style.id = 'badge-notif-styles';
    style.textContent = `
      @keyframes slide-in-right {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slide-out-right {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      @keyframes badge-bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
    `;
    document.head.appendChild(style);
  }
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MICRO-ANIMATIONS (Coin burst, confetti)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Trigger coin burst animation at position
 */
function triggerCoinBurst(x, y, count = 12) {
  const container = document.createElement('div');
  container.className = 'coin-burst';
  container.style.left = x + 'px';
  container.style.top = y + 'px';
  document.body.appendChild(container);
  
  for (let i = 0; i < count; i++) {
    const coin = document.createElement('div');
    coin.className = 'coin-particle';
    
    const angle = (360 / count) * i + Math.random() * 30;
    const distance = 80 + Math.random() * 60;
    const tx = Math.cos(angle * Math.PI / 180) * distance;
    const ty = Math.sin(angle * Math.PI / 180) * distance;
    
    coin.style.setProperty('--tx', tx + 'px');
    coin.style.setProperty('--ty', ty + 'px');
    coin.style.animationDelay = (i * 0.03) + 's';
    
    container.appendChild(coin);
  }
  
  setTimeout(() => container.remove(), 1200);
}

/**
 * Trigger confetti explosion
 */
function triggerConfetti(count = 50) {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  
  const colors = ['#7dd87d', '#e8c547', '#6b9eff', '#b8a0e8', '#e07070'];
  
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 2 + 's';
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    container.appendChild(piece);
  }
  
  setTimeout(() => container.remove(), 5000);
}

/**
 * Show success animation when prediction is placed
 */
function showPredictionSuccess(amount, potentialWin) {
  triggerConfetti(30);
  
  // Show success toast with animation
  showToast(`🎉 Prediction placed! Potential win: +${potentialWin.toLocaleString()} tokens`, 'green');
  
  // Increment streak
  incrementStreak();
  
  // Check for badge unlocks
  setTimeout(checkBadgeUnlocks, 500);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. 3-STEP ONBOARDING WIZARD
// ─────────────────────────────────────────────────────────────────────────────

let currentWizardStep = 0;

const WIZARD_STEPS = [
  {
    title: 'Welcome to CrowdVerse! 🎉',
    desc: 'India\'s first token-based prediction market. Make predictions on real-world events and earn tokens!',
    illustration: '🔮',
    buttonText: 'Get Started'
  },
  {
    title: 'How It Works 📊',
    desc: 'Browse live markets, stake tokens on outcomes you believe in, and win tokens when you\'re right. The crowd decides the odds!',
    illustration: '📈',
    buttonText: 'Next'
  },
  {
    title: 'Let\'s Get Started! 🚀',
    desc: 'Create your free account and get 1,000 welcome tokens. No real money ever required!',
    illustration: '🎁',
    buttonText: 'Create Account'
  }
];

/**
 * Initialize the onboarding wizard
 */
function initOnboardingWizard() {
  const authForm = document.getElementById('auth-form-wrap');
  if (!authForm || document.getElementById('wizard-container')) return;
  
  // Create wizard container
  const wizardContainer = document.createElement('div');
  wizardContainer.id = 'wizard-container';
  wizardContainer.style.display = 'none';
  
  authForm.parentNode.insertBefore(wizardContainer, authForm);
  
  renderWizardStep();
}

function renderWizardStep() {
  const container = document.getElementById('wizard-container');
  if (!container) return;
  
  const step = WIZARD_STEPS[currentWizardStep];
  const isLastStep = currentWizardStep === WIZARD_STEPS.length - 1;
  
  container.innerHTML = `
    <div class="onboarding-wizard">
      <div class="wizard-progress">
        ${WIZARD_STEPS.map((_, i) => `
          <div class="wizard-step-dot ${i === currentWizardStep ? 'active' : i < currentWizardStep ? 'completed' : ''}"></div>
        `).join('')}
      </div>
      
      <div class="wizard-card">
        <div class="wizard-illustration">${step.illustration}</div>
        <h3 class="wizard-title">${step.title}</h3>
        <p class="wizard-desc">${step.desc}</p>
        
        <div class="wizard-buttons">
          ${currentWizardStep > 0 ? `
            <button class="btn btn-ghost" onclick="prevWizardStep()">Back</button>
          ` : ''}
          <button class="btn btn-primary" onclick="${isLastStep ? 'finishWizard()' : 'nextWizardStep()'}" style="min-width: 140px;">
            ${step.buttonText}
          </button>
        </div>
      </div>
    </div>
  `;
}

function nextWizardStep() {
  if (currentWizardStep < WIZARD_STEPS.length - 1) {
    currentWizardStep++;
    renderWizardStep();
  }
}

function prevWizardStep() {
  if (currentWizardStep > 0) {
    currentWizardStep--;
    renderWizardStep();
  }
}

function finishWizard() {
  // Hide wizard, show auth form
  const wizardContainer = document.getElementById('wizard-container');
  const authForm = document.getElementById('auth-form-wrap');
  
  if (wizardContainer) wizardContainer.style.display = 'none';
  if (authForm) {
    authForm.style.display = '';
    authForm.classList.add('cv-fade-in');
  }
  
  // Reset wizard for next time
  currentWizardStep = 0;
}

/**
 * Override openAuth to show wizard for new users
 */
const originalOpenAuth = window.openAuth;
window.openAuth = function() {
  document.getElementById('auth-modal').classList.add('open');
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-success').classList.add('hidden');
  
  // Show wizard for signup mode
  if (State.authMode === 'signup') {
    const wizardContainer = document.getElementById('wizard-container');
    const authForm = document.getElementById('auth-form-wrap');
    
    if (wizardContainer) {
      wizardContainer.style.display = '';
      renderWizardStep();
    }
    if (authForm) authForm.style.display = 'none';
  } else {
    // Login mode - show form directly
    const wizardContainer = document.getElementById('wizard-container');
    const authForm = document.getElementById('auth-form-wrap');
    
    if (wizardContainer) wizardContainer.style.display = 'none';
    if (authForm) {
      authForm.style.display = '';
      authForm.classList.remove('hidden');
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. FRIENDLY EMPTY STATES
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_STATES = {
  markets: {
    icon: '📊',
    title: 'No markets yet!',
    desc: 'Be the first to create a prediction market. It only takes 20 tokens!',
    cta: 'Create Market',
    action: () => showPage('community')
  },
  predictions: {
    icon: '🎯',
    title: 'No predictions yet',
    desc: 'Start making predictions to build your track record and earn tokens!',
    cta: 'Browse Markets',
    action: () => showPage('markets')
  },
  leaderboard: {
    icon: '🏆',
    title: 'Leaderboard empty',
    desc: 'Invite friends to join and compete for the top spot!',
    cta: 'Invite Friends',
    action: () => shareApp()
  },
  search: {
    icon: '🔍',
    title: 'No matches found',
    desc: 'Try a different search term or browse all markets.',
    cta: 'View All',
    action: () => { _marketSearchQuery = ''; renderMarkets('all'); }
  }
};

function renderEmptyState(type, container) {
  const state = EMPTY_STATES[type];
  if (!state) return;
  
  container.innerHTML = `
    <div class="empty-state cv-pop-in">
      <div class="empty-state-illustration">${state.icon}</div>
      <h3 class="empty-state-title">${state.title}</h3>
      <p class="empty-state-desc">${state.desc}</p>
      <button class="btn btn-primary" onclick="(${state.action.toString})()">
        ${state.cta}
      </button>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SAFETY POPUP (Friendly disclaimers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Show friendly safety popup instead of stern warnings
 */
function showSafetyPopup(context = 'general') {
  const popups = {
    general: {
      icon: '🛡️',
      title: "Let's Get Started Safely!",
      desc: 'CrowdVerse is a fun prediction game using virtual tokens. Remember: tokens have no real money value and cannot be withdrawn. Play responsibly!'
    },
    prediction: {
      icon: '💡',
      title: 'Before You Predict...',
      desc: 'Predictions use virtual tokens only. Each prediction has a small 20 token fee. Make sure you\'ve read the market details before staking!'
    },
    signup: {
      icon: '🎉',
      title: 'Welcome Aboard!',
      desc: 'You must be 18+ to play. This is a skill-based game with virtual tokens — no gambling, no real money, just fun predictions!'
    }
  };
  
  const popup = popups[context] || popups.general;
  
  const overlay = document.createElement('div');
  overlay.className = 'safety-popup show';
  overlay.innerHTML = `
    <div class="safety-popup-content">
      <div class="safety-popup-icon">${popup.icon}</div>
      <h3>${popup.title}</h3>
      <p>${popup.desc}</p>
      <button class="btn btn-primary w-full" onclick="this.closest('.safety-popup').remove()">
        Got it! 👍
      </button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Auto-close after 8 seconds
  setTimeout(() => {
    if (overlay.parentNode) overlay.remove();
  }, 8000);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. SOCIAL FEATURES & CHALLENGES
// ─────────────────────────────────────────────────────────────────────────────

const CHALLENGES = [
  { id: 'daily_predictor', name: 'Daily Predictor', desc: 'Make a prediction today', icon: '📅', target: 1, reward: 50, type: 'daily' },
  { id: 'weekly_warrior', name: 'Weekly Warrior', desc: 'Predict on 5 different markets this week', icon: '⚡', target: 5, reward: 200, type: 'weekly' },
  { id: 'diverse_thinker', name: 'Diverse Thinker', desc: 'Predict across 3 different categories', icon: '🌈', target: 3, reward: 150, type: 'ongoing' },
  { id: 'high_confidence', name: 'High Confidence', desc: 'Stake 500+ tokens on a single prediction', icon: '🎯', target: 1, reward: 100, type: 'ongoing' },
  { id: 'market_creator', name: 'Market Creator', desc: 'Submit a market that gets approved', icon: '📝', target: 1, reward: 100, type: 'ongoing' }
];

function getChallengeProgress(challenge) {
  const userData = State.userChallenges || {};
  return userData[challenge.id] || { current: 0, completed: false };
}

function renderChallenges() {
  const container = document.getElementById('challenges-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="challenges-container">
      ${CHALLENGES.map(challenge => {
        const progress = getChallengeProgress(challenge);
        const percent = Math.min(100, (progress.current / challenge.target) * 100);
        
        return `
          <div class="challenge-card ${progress.completed ? 'completed' : ''}">
            <div class="challenge-header">
              <div class="challenge-title">
                <span class="challenge-icon">${challenge.icon}</span>
                <span>${challenge.name}</span>
              </div>
              <div class="challenge-reward">
                <img src="assets/Token.png" style="width:12px;height:12px;">
                +${challenge.reward}
              </div>
            </div>
            <div class="challenge-desc">${challenge.desc}</div>
            <div class="challenge-progress-wrapper">
              <div class="challenge-progress-bar">
                <div class="challenge-progress-fill" style="width: ${percent}%"></div>
              </div>
              <div class="challenge-progress-text">
                ${progress.completed ? '✓ Done' : `${progress.current}/${challenge.target}`}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function updateChallengeProgress(challengeId, increment = 1) {
  if (!State.userChallenges) State.userChallenges = {};
  if (!State.userChallenges[challengeId]) {
    State.userChallenges[challengeId] = { current: 0, completed: false };
  }
  
  const challenge = CHALLENGES.find(c => c.id === challengeId);
  if (!challenge) return;
  
  const progress = State.userChallenges[challengeId];
  if (progress.completed) return;
  
  progress.current += increment;
  
  if (progress.current >= challenge.target) {
    progress.completed = true;
    progress.completedAt = new Date().toISOString();
    
    // Award tokens
    State.userTokens += challenge.reward;
    updateTokenDisplay();
    animateTokenChange(challenge.reward, true);
    
    showToast(`🎉 Challenge completed: ${challenge.name}! +${challenge.reward} tokens`, 'green');
    triggerConfetti(20);
  }
  
  renderChallenges();
}

/**
 * Share the app / referral
 */
function shareApp() {
  const referralCode = State.currentUser?.uid?.substr(0, 8) || 'CROWDVERSE';
  const shareText = `Join me on CrowdVerse — India's first prediction market! Use my code ${referralCode} and we both get bonus tokens. 🎯`;
  const shareUrl = window.location.origin;
  
  if (navigator.share) {
    navigator.share({ title: 'Join CrowdVerse', text: shareText, url: shareUrl });
  } else {
    copyToClipboard(shareUrl + '?ref=' + referralCode);
    showToast('🔗 Referral link copied! Share with friends!', 'green');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. ENHANCED PROFILE PAGE WITH SOCIAL FEATURES
// ─────────────────────────────────────────────────────────────────────────────

function buildEnhancedProfilePage() {
  // Call original build
  buildProfilePage();
  
  // Add enhancements after a short delay to let original render
  setTimeout(() => {
    const profileStats = document.querySelector('.profile-stats');
    if (!profileStats) return;
    
    // Insert badges section after stats
    const badgesSection = document.createElement('div');
    badgesSection.className = 'stat-box cv-fade-in';
    badgesSection.innerHTML = '<div id="user-badges-container"></div>';
    profileStats.insertBefore(badgesSection, profileStats.children[1]);
    renderBadges();
    
    // Insert challenges section
    const challengesSection = document.createElement('div');
    challengesSection.className = 'stat-box cv-fade-in';
    challengesSection.innerHTML = `
      <h3 style="font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; margin-bottom: 1rem;">
        <span style="margin-right: 6px;">🎯</span> Challenges
      </h3>
      <div id="challenges-container"></div>
    `;
    profileStats.appendChild(challengesSection);
    renderChallenges();
    
    // Insert referral section
    const referralSection = document.createElement('div');
    referralSection.className = 'stat-box cv-fade-in';
    referralSection.innerHTML = `
      <div class="referral-box">
        <div class="referral-header">
          <span class="referral-icon">🎁</span>
          <div>
            <div class="referral-title">Invite Friends, Earn Tokens</div>
            <div style="font-size: 0.75rem; color: var(--cv-white3); margin-top: 2px;">
              Get 100 tokens for each friend who joins!
            </div>
          </div>
        </div>
        <div class="referral-code-box">
          <input type="text" class="referral-code-input" value="${window.location.origin}?ref=${State.currentUser?.uid?.substr(0, 8) || 'CROWDVERSE'}" readonly>
          <button class="btn btn-primary" onclick="shareApp()" style="padding: 0.75rem 1rem;">
            Share
          </button>
        </div>
      </div>
    `;
    profileStats.appendChild(referralSection);
    
  }, 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. INITIALIZATION & OVERRIDES
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Initialize wizard
  initOnboardingWizard();
  
  // Override buildProfilePage
  window.originalBuildProfilePage = window.buildProfilePage;
  window.buildProfilePage = buildEnhancedProfilePage;
  
  // Override _renderMarketCard to use enhanced version
  window.originalRenderMarketCard = window._renderMarketCard;
  window._renderMarketCard = renderEnhancedMarketCard;
  
  // Update navbar with new elements
  enhanceNavbar();
  
  // Load user data including streak and badges
  loadUserGamificationData();
});

function enhanceNavbar() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;
  
  // Check if already enhanced
  if (document.getElementById('nav-streak-counter')) return;
  
  // Insert streak counter before token badge
  const tokenBadge = document.getElementById('token-nav-badge');
  if (tokenBadge) {
    const streakEl = document.createElement('div');
    streakEl.id = 'nav-streak-counter';
    streakEl.className = 'streak-counter';
    streakEl.style.display = 'none';
    streakEl.innerHTML = `
      <span class="streak-icon">🔥</span>
      <span class="streak-count">0</span>
    `;
    navActions.insertBefore(streakEl, tokenBadge);
    
    // Enhance token badge
    tokenBadge.className = 'token-wallet';
    tokenBadge.innerHTML = `
      <img src="assets/Token.png" class="token-wallet-icon" alt="Tokens">
      <span class="token-wallet-amount" id="token-nav-count">1000</span>
    `;
  }
}

async function loadUserGamificationData() {
  if (demoMode || !db || !State.currentUser) return;
  
  try {
    const snap = await db.collection('users').doc(State.currentUser.uid).get();
    if (snap.exists) {
      const data = snap.data();
      State.userStreak = data.streak || { current: 0, best: 0 };
      State.userBadges = data.badges || {};
      State.userChallenges = data.challenges || {};
      State.userShares = data.shares || 0;
      State.lastPredictionDate = data.lastPredictionDate;
      
      updateStreakDisplay();
    }
  } catch (e) {
    console.warn('Failed to load gamification data:', e);
  }
}

// Override confirmPolymarketVote to add animations
const originalConfirmVote = window.confirmPolymarketVote;
window.confirmPolymarketVote = async function() {
  // Store pre-vote state
  const btn = document.getElementById('confirm-vote-btn');
  const rect = btn ? btn.getBoundingClientRect() : null;
  
  // Call original
  await originalConfirmVote();
  
  // If successful (no error thrown), show animations
  if (!document.getElementById('auth-modal')?.classList.contains('open')) {
    // Get vote details from State
    const lastPrediction = State.userPredictions[State.userPredictions.length - 1];
    if (lastPrediction && rect) {
      showPredictionSuccess(lastPrediction.amount, lastPrediction.potentialWin);
      
      // Coin burst from button position
      triggerCoinBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    
    // Update challenges
    updateChallengeProgress('daily_predictor');
    updateChallengeProgress('weekly_warrior');
    if (lastPrediction?.amount >= 500) {
      updateChallengeProgress('high_confidence');
    }
  }
};
