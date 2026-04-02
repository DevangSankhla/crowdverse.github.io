// ─────────────────────────────────────────────────────────────────────
// last-visited.js — Remember and restore last viewed market
// ─────────────────────────────────────────────────────────────────────

const LastVisitedManager = {
  STORAGE_KEY = 'crowdverse-last-visited',
  RESTORE_OFFER_TIMEOUT = 300000, // 5 minutes

  save(marketId, question) {
    try {
      const data = {
        marketId,
        question: question?.substring(0, 100),
        timestamp: Date.now(),
        path: window.location.pathname + window.location.search
      };
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch {}
  },

  get() {
    try {
      const saved = sessionStorage.getItem(this.STORAGE_KEY);
      if (!saved) return null;
      
      const data = JSON.parse(saved);
      
      // Check if within timeout
      if (Date.now() - data.timestamp > this.RESTORE_OFFER_TIMEOUT) {
        this.clear();
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  },

  clear() {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch {}
  },

  // Show restore prompt
  offerRestore() {
    const lastVisit = this.get();
    if (!lastVisit) return;

    // Only offer if we're on home or markets page
    const currentPage = document.querySelector('.page.active')?.id;
    if (currentPage !== 'page-home' && currentPage !== 'page-markets') return;

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--dark2);
      border: 1px solid var(--green);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease;
      max-width: 90vw;
    `;
    toast.innerHTML = `
      <div style="font-size: 1.5rem;">👋</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">
          Return to previous market?
        </div>
        <div style="font-size: 0.8rem; color: var(--white3); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${escHtml(lastVisit.question || 'Market')}
        </div>
      </div>
      <button id="restore-yes" style="
        background: var(--green);
        color: var(--black);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.8rem;
      ">Go</button>
      <button id="restore-no" style="
        background: transparent;
        color: var(--white3);
        border: 1px solid var(--border2);
        padding: 0.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.8rem;
      ">✕</button>
    `;

    document.body.appendChild(toast);

    // Handle buttons
    toast.querySelector('#restore-yes').onclick = () => {
      this.clear();
      toast.remove();
      _tryOpenMarket(lastVisit.marketId);
    };

    toast.querySelector('#restore-no').onclick = () => {
      this.clear();
      toast.remove();
    };

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideDown 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
      }
    }, 10000);
  }
};

// Hook into openVote to save market
document.addEventListener('DOMContentLoaded', () => {
  // Offer restore on page load (if returning user)
  setTimeout(() => {
    if (State.currentUser) {
      LastVisitedManager.offerRestore();
    }
  }, 1500);
});
