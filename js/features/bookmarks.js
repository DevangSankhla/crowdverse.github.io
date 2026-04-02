// ─────────────────────────────────────────────────────────────────────
// bookmarks.js — Market bookmarks/favorites system
// ─────────────────────────────────────────────────────────────────────

const BookmarkManager = {
  STORAGE_KEY: 'crowdverse-bookmarks',
  bookmarks: new Set(),

  init() {
    this.load();
    this.injectStyles();
  },

  load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.bookmarks = new Set(data);
      }
    } catch {}
  },

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...this.bookmarks]));
    } catch {}
  },

  toggle(marketId) {
    if (this.bookmarks.has(marketId)) {
      this.bookmarks.delete(marketId);
      this.save();
      showToast('🔖 Removed from watchlist', 'yellow');
      return false;
    } else {
      this.bookmarks.add(marketId);
      this.save();
      showToast('🔖 Added to watchlist', 'green');
      return true;
    }
  },

  isBookmarked(marketId) {
    return this.bookmarks.has(marketId);
  },

  getAll() {
    return [...this.bookmarks];
  },

  getBookmarkedMarkets() {
    return State.firestoreMarkets.filter(m => this.bookmarks.has(m.firestoreId || m.id));
  },

  // Generate bookmark button HTML
  renderButton(marketId) {
    const isBookmarked = this.isBookmarked(marketId);
    return `
      <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" 
              onclick="event.stopPropagation();toggleMarketBookmark('${marketId}')"
              title="${isBookmarked ? 'Remove from watchlist' : 'Add to watchlist'}">
        ${isBookmarked ? '★' : '☆'}
      </button>
    `;
  },

  injectStyles() {
    if (document.getElementById('bookmark-styles')) return;
    const style = document.createElement('style');
    style.id = 'bookmark-styles';
    style.textContent = `
      .bookmark-btn {
        background: var(--dark2);
        border: 1px solid var(--border2);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1rem;
        color: var(--white3);
        transition: all 0.2s;
      }
      .bookmark-btn:hover {
        border-color: var(--yellow);
        color: var(--yellow);
        transform: scale(1.1);
      }
      .bookmark-btn.active {
        background: rgba(212, 178, 0, 0.1);
        border-color: var(--yellow);
        color: var(--yellow);
      }
    `;
    document.head.appendChild(style);
  }
};

// Global function for onclick
function toggleMarketBookmark(marketId) {
  const isNowBookmarked = BookmarkManager.toggle(marketId);
  
  // Update all instances of this button
  document.querySelectorAll(`.bookmark-btn[onclick*="${marketId}"]`).forEach(btn => {
    btn.classList.toggle('active', isNowBookmarked);
    btn.innerHTML = isNowBookmarked ? '★' : '☆';
    btn.title = isNowBookmarked ? 'Remove from watchlist' : 'Add to watchlist';
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  BookmarkManager.init();
});
