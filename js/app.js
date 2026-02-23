// ─────────────────────────────────────────────────────────────────────
// app.js — App bootstrap, page navigation, initialisation
// ─────────────────────────────────────────────────────────────────────

/**
 * Navigate to a named page.
 */
function showPage(id) {
  if (id === 'admin' && !isAdmin()) {
    if (!State.currentUser) { openAuth(); return; }
    showToast('⛔ Admin access only.', 'red');
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));

  const pageEl = document.getElementById('page-' + id);
  if (pageEl) pageEl.classList.add('active');

  const linkEl = document.querySelector(`[data-page="${id}"]`);
  if (linkEl) linkEl.classList.add('active');

  // Mobile nav active state
  const mobileBtn = document.querySelector(`.mobile-nav-btn[data-page="${id}"]`);
  if (mobileBtn) mobileBtn.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'instant' });

  if (id === 'home')      { updateHeroCta(); updateHomeMarketsPreview(); }
  if (id === 'markets')   loadAndRenderMarkets();
  if (id === 'profile')   renderProfile();
  if (id === 'admin')     renderAdminPage();
  if (id === 'community') { updateCommunityPage(); }
}

// ── Handle URL deep links ─────────────────────────────────────────────
function handleDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const page   = params.get('page');
  const mktId  = params.get('id');

  if (page === 'markets' && mktId) {
    showPage('markets');
    setTimeout(() => _tryOpenMarket(mktId), 800);
    return true;
  }
  if (page === 'community' && mktId) {
    showPage('community');
    setTimeout(() => _tryOpenMarket(mktId), 500);
    return true;
  }
  return false;
}

// ── Try to open a market by ID (deep link resolver) ───────────────────
async function _tryOpenMarket(marketId) {
  const id = String(marketId);

  // 1. Try to find in currently loaded data
  const m = findMarketById(id);
  if (m) {
    _highlightCard(id);
    if (m.status === 'live') openVote(id, null, null);
    return;
  }

  // 2. Try to scroll to card (might render after fetch)
  const cardEl = document.querySelector(`[data-market-id="${id}"]`);
  if (cardEl) {
    _highlightCard(id);
    return;
  }

  // 3. Fetch from Firestore
  if (demoMode || !db) return;
  try {
    const doc = await db.collection('markets').doc(id).get();
    if (doc.exists) {
      const data = doc.data();
      const market = { id: doc.id, firestoreId: doc.id, ...data };

      // Add to firestoreMarkets if not already there
      const exists = State.firestoreMarkets.find(m => m.firestoreId === id);
      if (!exists && data.status === 'live') {
        State.firestoreMarkets.push(market);
        renderMarkets();
      }

      setTimeout(() => {
        _highlightCard(id);
        if (market.status === 'live') {
          // Inject directly into the find cache and open
          openVote(id, null, null);
        }
      }, 300);
    }
  } catch (e) {
    console.warn('Deep link market fetch failed:', e);
  }
}

// ── Highlight and scroll to a market card ────────────────────────────
function _highlightCard(marketId) {
  const card = document.querySelector(`[data-market-id="${marketId}"]`);
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.style.animation = 'highlightPulse 2s ease';
  setTimeout(() => { card.style.animation = ''; }, 2100);
}

// ── Kept for backward compat (called from community page links) ───────
function highlightAndScrollToMarket(marketId) {
  _tryOpenMarket(marketId);
}

// ── Share market ──────────────────────────────────────────────────────
async function shareMarket(marketId, question, pageType = 'markets') {
  const shareUrl  = `${window.location.origin}${window.location.pathname}?page=${pageType}&id=${marketId}`;
  const shareText = `Predict: "${question}" on CrowdVerse 🇮🇳`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'CrowdVerse Prediction', text: shareText, url: shareUrl });
      return;
    } catch (_) {}
  }
  _copyToClipboard(shareUrl);
}

function _copyToClipboard(text) {
  const fallback = () => {
    const inp = document.createElement('input');
    inp.value = text;
    document.body.appendChild(inp);
    inp.select();
    document.execCommand('copy');
    document.body.removeChild(inp);
    showToast('🔗 Link copied!', 'green');
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast('🔗 Link copied!', 'green')).catch(fallback);
  } else { fallback(); }
}
// expose for legacy calls
function copyToClipboard(text) { _copyToClipboard(text); }
function fetchAndShowMarketModal(id) { _tryOpenMarket(id); }

// ── Build mobile bottom navigation bar ───────────────────────────────
function buildMobileNav() {
  const nav = document.createElement('nav');
  nav.id = 'mobile-nav';
  nav.innerHTML = `
    <button class="mobile-nav-btn active" data-page="home" onclick="showPage('home')">
      <span class="mobile-nav-icon">🏠</span>
      <span class="mobile-nav-label">Home</span>
    </button>
    <button class="mobile-nav-btn" data-page="community" onclick="showPage('community')">
      <span class="mobile-nav-icon">👥</span>
      <span class="mobile-nav-label">Community</span>
    </button>
    <button class="mobile-nav-btn" data-page="markets" onclick="showPage('markets')">
      <span class="mobile-nav-icon">📈</span>
      <span class="mobile-nav-label">Markets</span>
    </button>
    <button class="mobile-nav-btn" data-page="rewards" onclick="showPage('rewards')">
      <span class="mobile-nav-icon">🎁</span>
      <span class="mobile-nav-label">Rewards</span>
    </button>
    <button class="mobile-nav-btn" data-page="profile" onclick="showPage('profile')">
      <span class="mobile-nav-icon">👤</span>
      <span class="mobile-nav-label">Profile</span>
    </button>
  `;
  document.body.appendChild(nav);

  // Inject mobile nav CSS
  if (!document.getElementById('mobile-nav-styles')) {
    const style = document.createElement('style');
    style.id = 'mobile-nav-styles';
    style.textContent = `
      #mobile-nav {
        display: none;
        position: fixed;
        bottom: 0; left: 0; right: 0;
        z-index: 999;
        background: rgba(10,10,10,0.97);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid #222;
        padding: 0;
        height: 64px;
        grid-template-columns: repeat(5, 1fr);
        align-items: stretch;
      }
      .mobile-nav-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 0;
        background: none;
        border: none;
        cursor: pointer;
        transition: all 0.15s;
        color: #555;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      .mobile-nav-btn.active { color: var(--green); }
      .mobile-nav-btn:active { transform: scale(0.92); }
      .mobile-nav-icon { font-size: 1.35rem; line-height: 1; }
      .mobile-nav-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.03em; }
      @media (max-width: 640px) {
        #mobile-nav { display: grid; }
        .page { padding-bottom: 64px; }
        body { padding-bottom: 64px; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildHomePage();
  buildCommunityPage();
  buildMarketsPage();
  buildRewardsPage();
  buildProfilePage();
  buildAdminPage();
  buildMobileNav();
  initModalBackdropClose();

  if (!handleDeepLink()) {
    showPage('home');
  }

  if (demoMode) {
    console.log('🎮 CrowdVerse running in Demo Mode. Update config.js with Firebase credentials to go live.');
  }
});
