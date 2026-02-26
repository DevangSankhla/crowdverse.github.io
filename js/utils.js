// ─────────────────────────────────────────────────────────────────────
// utils.js — Shared helper functions
// ─────────────────────────────────────────────────────────────────────

/**
 * Escape HTML to prevent XSS
 */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Get category icon HTML with image
 */
function getCategoryIconHtml(catString) {
  if (!catString) return '';
  
  const catLower = catString.toLowerCase();
  
  if (catLower.includes('sport')) return `<img src="assets/Sports.png" class="cat-icon" alt="">Sports`;
  if (catLower.includes('economy')) return `<img src="assets/Economy.png" class="cat-icon" alt="">Economy`;
  if (catLower.includes('entertainment')) return `<img src="assets/Entertainment.png" class="cat-icon" alt="">Entertainment`;
  if (catLower.includes('tech')) return `<img src="assets/Tech.png" class="cat-icon" alt="">Tech`;
  if (catLower.includes('crypto')) return `<img src="assets/Crypto.png" class="cat-icon" alt="">Crypto`;
  if (catLower.includes('climate')) return `<img src="assets/Climate.png" class="cat-icon" alt="">Climate`;
  
  return catString.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
}

let _toastThrottleTimer = null;
let _lastToastMessage = '';
let _lastToastTime = 0;

/**
 * Show a toast notification.
 */
function showToast(message, color = 'green') {
  // Prevent duplicate toasts within 2 seconds
  const now = Date.now();
  if (message === _lastToastMessage && now - _lastToastTime < 2000) {
    return;
  }
  _lastToastMessage = message;
  _lastToastTime = now;
  
  const existing = document.querySelector('.toast-dynamic');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-dynamic';

  const bg = color === 'green' ? 'var(--green)'
           : color === 'red'   ? '#ff5555'
           :                     'var(--yellow)';

  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%) translateY(120px);
    padding: 0.9rem 1.5rem;
    background: ${bg};
    color: var(--black);
    border-radius: 12px;
    font-weight: 600;
    font-family: var(--font-mono);
    font-size: 0.82rem;
    z-index: 10001;
    max-width: 90vw;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    animation: toastSlideUp 0.3s ease forwards;
    pointer-events: none;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideDown 0.3s ease forwards';
    setTimeout(() => toast.remove(), 320);
  }, 3000);
}

/**
 * Update all token-count elements in the UI.
 */
function updateTokenDisplay() {
  const fmt = (State.userTokens || 0).toLocaleString();

  const badge = document.getElementById('token-nav-count');
  if (badge) badge.textContent = fmt;

  const profileToken = document.getElementById('profile-token-amount');
  if (profileToken) profileToken.textContent = fmt;

  const voteBalance = document.getElementById('vote-balance');
  if (voteBalance) voteBalance.textContent = State.userTokens || 0;

  const lbScore = document.getElementById('your-lb-score');
  if (lbScore) lbScore.textContent = fmt + ' tkn';
}

/**
 * Toggle navbar for auth state.
 */
function updateNavForAuth() {
  const loggedIn   = !!State.currentUser;
  const loginBtn   = document.getElementById('nav-login-btn');
  const logoutBtn  = document.getElementById('nav-logout-btn');
  const tokenBadge = document.getElementById('token-nav-badge');
  const adminLink  = document.getElementById('admin-nav-link');

  if (loginBtn)   loginBtn.style.display   = loggedIn ? 'none' : '';
  if (logoutBtn)  logoutBtn.style.display  = loggedIn ? '' : 'none';
  if (tokenBadge) tokenBadge.style.display = loggedIn ? '' : 'none';

  if (adminLink) {
    adminLink.style.display = (loggedIn && typeof isAdmin === 'function' && isAdmin()) ? '' : 'none';
  }

  updateTokenDisplay();
  // Update home CTA if on home page
  if (typeof updateHeroCta === 'function') updateHeroCta();
}

/**
 * Build footer HTML.
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
          gambling in any form. All activity uses virtual game tokens with
          <strong>no monetary value</strong>. Tokens cannot be converted to cash.
          Participation is strictly for users <strong>18 and above</strong>.
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 CrowdVerse. All Rights Reserved.</span>
        <span>Made in India &nbsp;|&nbsp; Not a gambling platform</span>
      </div>
    </footer>`;
}

/**
 * Close modals when clicking backdrop.
 */
function initModalBackdropClose() {
  const authModal = document.getElementById('auth-modal');
  if (authModal) authModal.addEventListener('click', e => { if (e.target === authModal) closeAuth(); });

  const voteModal = document.getElementById('vote-modal');
  if (voteModal) voteModal.addEventListener('click', e => { if (e.target === voteModal) closeVoteModal(); });

  document.addEventListener('click', e => {
    const cm = document.getElementById('create-market-modal');
    if (cm && e.target === cm) closeCreateMarketModal();

    const pm = document.getElementById('polymarket-vote-modal');
    if (pm && e.target === pm) closePolymarketVoteModal();
  });
}

// ── Toast animation styles ────────────────────────────────────────────
const _toastStyles = document.createElement('style');
_toastStyles.textContent = `
  @keyframes toastSlideUp {
    from { transform: translateX(-50%) translateY(120px); opacity: 0; }
    to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
  }
  @keyframes toastSlideDown {
    from { transform: translateX(-50%) translateY(0);    opacity: 1; }
    to   { transform: translateX(-50%) translateY(120px); opacity: 0; }
  }
`;
document.head.appendChild(_toastStyles);

// ── Keyboard shortcuts ────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  // Escape key closes open modals
  if (e.key === 'Escape') {
    const authModal = document.getElementById('auth-modal');
    if (authModal?.classList.contains('open')) {
      closeAuth();
      return;
    }
    
    const pm = document.getElementById('polymarket-vote-modal');
    if (pm && pm.style.display === 'flex') {
      closePolymarketVoteModal();
      return;
    }
    
    const cm = document.getElementById('create-market-modal');
    if (cm && cm.style.display === 'flex') {
      closeCreateMarketModal();
      return;
    }
    
    // Legacy vote modal (from index.html)
    const vm = document.getElementById('vote-modal');
    if (vm?.classList.contains('open')) {
      closeVoteModal();
      return;
    }
  }
});
