// ─────────────────────────────────────────────────────────────────────
// app.js — App bootstrap, page navigation, initialisation
// ─────────────────────────────────────────────────────────────────────

/**
 * Navigate to a named page.
 * @param {string} id — 'home' | 'community' | 'markets' | 'rewards' | 'profile' | 'admin'
 */
function showPage(id) {
  // Admin page is secret — only accessible if admin
  if (id === 'admin' && !isAdmin()) {
    if (!State.currentUser) {
      openAuth();
      return;
    }
    showToast('⛔ Admin access only.', 'red');
    return;
  }

  // Deactivate all pages & nav links
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // Activate chosen page & nav link
  const pageEl = document.getElementById('page-' + id);
  if (pageEl) pageEl.classList.add('active');

  const linkEl = document.querySelector(`[data-page="${id}"]`);
  if (linkEl) linkEl.classList.add('active');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Page-specific re-render
  if (id === 'markets') loadAndRenderMarkets();
  if (id === 'profile')  renderProfile();
  if (id === 'admin')    renderAdminPage();
}

// ── Handle URL parameters for direct market links ────────────────────
function handleDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');
  const marketId = params.get('id');
  
  if (page === 'markets' && marketId) {
    // Navigate to markets page first
    showPage('markets');
    // Then try to find and highlight the market
    setTimeout(() => {
      highlightAndScrollToMarket(marketId);
    }, 500);
    return true;
  } else if (page === 'community' && marketId) {
    showPage('community');
    setTimeout(() => {
      highlightAndScrollToMarket(marketId, 'community');
    }, 500);
    return true;
  }
  return false;
}

// ── Highlight and scroll to a specific market ─────────────────────────
function highlightAndScrollToMarket(marketId, pageType = 'markets') {
  // Try to find the market card by data attribute
  const cards = document.querySelectorAll('.market-card, .market-card-full');
  let targetCard = null;
  
  cards.forEach(card => {
    if (card.dataset.marketId === marketId || card.dataset.marketId === marketId.toString()) {
      targetCard = card;
    }
  });
  
  if (targetCard) {
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    targetCard.style.animation = 'highlightPulse 2s ease';
    setTimeout(() => {
      targetCard.style.animation = '';
    }, 2000);
  } else if (!demoMode && db) {
    // If market not found in DOM, try to fetch it
    fetchAndShowMarketModal(marketId);
  }
}

// ── Fetch market and show modal ───────────────────────────────────────
async function fetchAndShowMarketModal(marketId) {
  try {
    const doc = await db.collection('markets').doc(marketId).get();
    if (doc.exists) {
      const m = { id: doc.id, firestoreId: doc.id, ...doc.data() };
      if (m.status === 'live') {
        openVote(m.id || m.firestoreId, null, null);
      }
    }
  } catch (e) {
    console.warn('Could not fetch market:', e);
  }
}

// ── Share market function ─────────────────────────────────────────────
async function shareMarket(marketId, question, pageType = 'markets') {
  const shareUrl = `${window.location.origin}${window.location.pathname}?page=${pageType}&id=${marketId}`;
  const shareText = `Predict: "${question}" on CrowdVerse — India's First Prediction Market 🇮🇳`;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'CrowdVerse Prediction',
        text: shareText,
        url: shareUrl
      });
    } catch (err) {
      // User cancelled or share failed
      copyToClipboard(shareUrl);
    }
  } else {
    copyToClipboard(shareUrl);
  }
}

// ── Copy to clipboard helper ──────────────────────────────────────────
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('🔗 Link copied to clipboard!', 'green');
    }).catch(() => {
      // Fallback
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast('🔗 Link copied to clipboard!', 'green');
    });
  } else {
    // Final fallback
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('🔗 Link copied to clipboard!', 'green');
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Build all page HTML
  buildHomePage();
  buildCommunityPage();
  buildMarketsPage();
  buildRewardsPage();
  buildProfilePage();
  buildAdminPage();

  // Wire up modal backdrop closes
  initModalBackdropClose();

  // Check for deep link, otherwise start on home
  if (!handleDeepLink()) {
    showPage('home');
  }

  if (demoMode) {
    console.log('🎮 CrowdVerse is running in Demo Mode.');
    console.log('   To enable real auth, update js/config.js with your Firebase credentials.');
  }
});
