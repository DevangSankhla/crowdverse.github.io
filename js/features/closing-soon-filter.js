// ─────────────────────────────────────────────────────────────────────
// closing-soon-filter.js — Quick filter for markets closing soon
// ─────────────────────────────────────────────────────────────────────

const ClosingSoonFilter = {
  init() {
    this.injectButton();
  },

  injectButton() {
    const filters = document.getElementById('market-filters');
    if (!filters || document.getElementById('closing-soon-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'closing-soon-btn';
    btn.className = 'mkt-filter-btn';
    btn.innerHTML = '⏰ Closing Soon';
    btn.onclick = () => this.toggle();
    
    filters.appendChild(btn);
  },

  toggle() {
    const btn = document.getElementById('closing-soon-btn');
    const isActive = btn.classList.contains('active');
    
    // Reset other filters
    document.querySelectorAll('.mkt-filter-btn').forEach(b => b.classList.remove('active'));
    
    if (isActive) {
      // Deactivate
      btn.classList.remove('active');
      _currentMarketFilter = 'all';
    } else {
      // Activate
      btn.classList.add('active');
      this.applyFilter();
    }
    
    renderMarkets(_currentMarketFilter);
  },

  applyFilter() {
    const container = document.getElementById('markets-list');
    if (!container) return;

    // Get all markets
    let allMarkets = [...State.firestoreMarkets, ...State.userCreatedMarkets]
      .filter(m => m.status !== 'rejected');

    // Filter to only show markets ending within 24 hours
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const closingSoon = allMarkets.filter(m => {
      if (!m.ends) return false;
      const endDate = new Date(m.ends);
      const diff = endDate - now;
      return diff > 0 && diff <= oneDay;
    });

    if (closingSoon.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; color: var(--white3);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⏰</div>
          <p>No markets closing within 24 hours.</p>
          <p style="font-size: 0.8rem; margin-top: 0.5rem;">Check back later!</p>
        </div>
      `;
      return;
    }

    // Render only closing soon markets
    container.innerHTML = '';
    closingSoon.forEach(m => _renderMarketCard(m, container));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Wait for markets page to be built
  setTimeout(() => ClosingSoonFilter.init(), 1000);
});
