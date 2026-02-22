// ─────────────────────────────────────────────────────────────────────
// utils.js — Shared helper functions
// ─────────────────────────────────────────────────────────────────────

/**
 * Show a toast notification at the bottom of the screen.
 * @param {string} message — message text
 * @param {string} color — 'green' | 'red' | 'yellow'
 */
function showToast(message, color = 'green') {
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast-dynamic');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast-dynamic';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    padding: 1rem 1.5rem;
    background: ${color === 'green' ? 'var(--green)' : color === 'red' ? '#ff5555' : 'var(--yellow)'};
    color: ${color === 'yellow' ? 'var(--black)' : 'var(--black)'};
    border-radius: 12px;
    font-weight: 600;
    z-index: 10000;
    animation: slideUp 0.3s ease forwards;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Update all token-count elements in the UI.
 */
function updateTokenDisplay() {
  const fmt = State.userTokens.toLocaleString();
  
  // Nav badge
  const badge = document.getElementById('token-nav-count');
  if (badge) badge.textContent = fmt;
  
  // Profile token amount
  const profileToken = document.getElementById('profile-token-amount');
  if (profileToken) profileToken.textContent = fmt;
  
  // Vote modal balance
  const voteBalance = document.getElementById('vote-balance');
  if (voteBalance) voteBalance.textContent = State.userTokens;
  
  // Leaderboard score
  const lbScore = document.getElementById('your-lb-score');
  if (lbScore) lbScore.textContent = fmt + ' tkn';
}

/**
 * Toggle the navbar between logged-in and logged-out state.
 */
function updateNavForAuth() {
  const loggedIn = !!State.currentUser;
  const loginBtn   = document.getElementById('nav-login-btn');
  const logoutBtn  = document.getElementById('nav-logout-btn');
  const tokenBadge = document.getElementById('token-nav-badge');
  const adminLink  = document.getElementById('admin-nav-link');

  if (loginBtn)   loginBtn.style.display   = loggedIn ? 'none' : '';
  if (logoutBtn)  logoutBtn.style.display  = loggedIn ? '' : 'none';
  if (tokenBadge) tokenBadge.style.display = loggedIn ? '' : 'none';

  // Admin nav link — only shown to admin account
  if (adminLink) {
    adminLink.style.display = (loggedIn && typeof isAdmin === 'function' && isAdmin()) ? '' : 'none';
  }

  updateTokenDisplay();
}

/**
 * Build a standard footer HTML string (reused across pages).
 */
function buildFooter() {
  return `
    <footer class="footer">
      <div class="footer-top">
        <div class="footer-brand">
          <img src="assets/logo.jpg" alt="CrowdVerse">
          <span class="footer-brand-name">Crowd<span class="accent">Verse</span></span>
        </div>
        <div class="footer-disclaimer">
          <strong>⚠️ Important Disclaimer:</strong> CrowdVerse is a skill-based prediction and
          opinion platform. We do <em>not</em> encourage, facilitate, or endorse betting or
          gambling in any form. All activity on this platform uses virtual game tokens with
          <strong>no monetary value</strong> and tokens cannot be converted to cash. This
          platform exists for entertainment, education, and to study collective intelligence.
          Participation is strictly for users <strong>aged 18 and above</strong>. Users in
          states where such platforms are restricted by law may be geo-restricted.
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 CrowdVerse. All Rights Reserved.</span>
        <span>Made in India 🇮🇳 &nbsp;|&nbsp; Not a gambling platform</span>
      </div>
    </footer>`;
}

/**
 * Close modal when clicking the dark overlay backdrop.
 */
function initModalBackdropClose() {
  // Auth modal
  const authModal = document.getElementById('auth-modal');
  if (authModal) {
    authModal.addEventListener('click', function(e) {
      if (e.target === this) closeAuth();
    });
  }
  
  // Old vote modal (if exists)
  const voteModal = document.getElementById('vote-modal');
  if (voteModal) {
    voteModal.addEventListener('click', function(e) {
      if (e.target === this) closeVoteModal();
    });
  }
  
  // Setup listener for dynamic modals (delegated)
  document.addEventListener('click', function(e) {
    // Close create market modal on backdrop click
    const createModal = document.getElementById('create-market-modal');
    if (createModal && e.target === createModal) {
      closeCreateMarketModal();
    }
    
    // Close polymarket vote modal on backdrop click
    const pmModal = document.getElementById('polymarket-vote-modal');
    if (pmModal && e.target === pmModal) {
      closePolymarketVoteModal();
    }
  });
}

/**
 * Escape HTML to prevent XSS in dynamic content.
 */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Add animation styles for toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(100px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(100px); opacity: 0; }
  }
`;
document.head.appendChild(toastStyles);
