// ─────────────────────────────────────────────────────────────────────
// utils.js — Shared helper functions
// ─────────────────────────────────────────────────────────────────────

/**
 * Show a toast notification at the bottom-right of the screen.
 * @param {string} msg   — message text
 * @param {string} type  — 'green' | 'red' | 'yellow'
 */
function showToast(msg, type = 'green') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3500);
}

/**
 * Update all token-count elements in the UI.
 */
function updateTokenDisplay() {
  const fmt = State.userTokens.toLocaleString();
  document.getElementById('token-nav-count').textContent        = fmt;
  document.getElementById('profile-token-amount').textContent   = fmt;
  document.getElementById('vote-balance').textContent           = State.userTokens;
  document.getElementById('your-lb-score').textContent          = fmt + ' tkn';
}

/**
 * Toggle the navbar between logged-in and logged-out state.
 */
function updateNavForAuth() {
  const loggedIn = !!State.currentUser;
  document.getElementById('nav-login-btn').style.display   = loggedIn ? 'none' : '';
  document.getElementById('nav-logout-btn').style.display  = loggedIn ? ''     : 'none';
  document.getElementById('token-nav-badge').style.display = loggedIn ? ''     : 'none';
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
  document.getElementById('auth-modal').addEventListener('click', function(e) {
    if (e.target === this) closeAuth();
  });
  document.getElementById('vote-modal').addEventListener('click', function(e) {
    if (e.target === this) closeVoteModal();
  });
}

// ─────────────────────────────────────────────────────────────────────
// utils.js — Shared utility functions
// ─────────────────────────────────────────────────────────────────────

// Update token display in nav
function updateTokenDisplay() {
  const badge = document.getElementById('token-nav-count');
  if (badge) {
    badge.textContent = State.userTokens;
  }
  
  // Also update profile token amount if on profile page
  const profileToken = document.getElementById('profile-token-amount');
  if (profileToken) {
    profileToken.textContent = State.userTokens;
  }
}

// Show toast notification
function showToast(message, color = 'green') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 1rem 1.5rem;
    background: ${color === 'green' ? 'var(--green)' : color === 'red' ? '#ff5555' : 'var(--yellow)'};
    color: ${color === 'yellow' ? 'var(--black)' : 'var(--black)'};
    border-radius: 12px;
    font-weight: 600;
    z-index: 10000;
    animation: slideUp 0.3s ease;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add animations
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
