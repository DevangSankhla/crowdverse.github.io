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
