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

  // Start on home
  showPage('home');

  if (demoMode) {
    console.log('🎮 CrowdVerse is running in Demo Mode.');
    console.log('   To enable real auth, update js/config.js with your Firebase credentials.');
  }
});
