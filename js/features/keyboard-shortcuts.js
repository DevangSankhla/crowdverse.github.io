// ─────────────────────────────────────────────────────────────────────
// keyboard-shortcuts.js — Keyboard navigation shortcuts
// ─────────────────────────────────────────────────────────────────────

const KeyboardShortcuts = {
  shortcuts: {
    'Escape': () => this.closeModal(),
    'Cmd+K': () => this.openSearch(),
    'Ctrl+K': () => this.openSearch(),
    'ArrowLeft': () => this.navigateMarkets(-1),
    'ArrowRight': () => this.navigateMarkets(1),
    'h': () => showPage('home'),
    'm': () => showPage('markets'),
    'p': () => showPage('profile'),
    's': () => showPage('community'),
    '?': () => this.showHelp(),
  },

  init() {
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.injectHelpStyles();
  },

  handleKeydown(e) {
    // Don't trigger when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = this.getKeyCombo(e);
    const action = this.shortcuts[key];
    
    if (action) {
      e.preventDefault();
      action();
    }
  },

  getKeyCombo(e) {
    const parts = [];
    if (e.metaKey) parts.push('Cmd');
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    parts.push(e.key);
    return parts.join('+');
  },

  closeModal() {
    const modals = [
      document.getElementById('auth-modal'),
      document.getElementById('polymarket-vote-modal'),
      document.getElementById('vote-modal'),
      document.getElementById('create-market-modal')
    ];
    
    for (const modal of modals) {
      if (modal && (modal.classList.contains('open') || modal.classList.contains('active') || modal.style.display === 'flex')) {
        // Trigger close
        if (modal.id === 'auth-modal') closeAuth();
        else if (modal.id === 'polymarket-vote-modal') closePolymarketVoteModal();
        else if (modal.id === 'vote-modal') closeVoteModal();
        else if (modal.id === 'create-market-modal') closeCreateMarketModal();
        return;
      }
    }
  },

  openSearch() {
    const searchInput = document.getElementById('markets-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  },

  navigateMarkets(direction) {
    // If on markets page, could navigate between cards
    const cards = document.querySelectorAll('.market-card-full, .market-card');
    if (cards.length === 0) return;
    
    // Find currently focused or highlighted card
    const focused = document.activeElement;
    let currentIndex = Array.from(cards).indexOf(focused);
    
    if (currentIndex === -1) currentIndex = 0;
    else {
      currentIndex += direction;
      if (currentIndex < 0) currentIndex = cards.length - 1;
      if (currentIndex >= cards.length) currentIndex = 0;
    }
    
    cards[currentIndex]?.focus();
    cards[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  showHelp() {
    if (document.getElementById('keyboard-help')) return;
    
    const help = document.createElement('div');
    help.id = 'keyboard-help';
    help.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    `;
    help.innerHTML = `
      <div style="background: var(--off-black); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; max-width: 400px; width: 100%;">
        <h2 style="font-family: var(--font-display); font-size: 1.3rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
          ⌨️ Keyboard Shortcuts
        </h2>
        <div style="display: grid; gap: 0.75rem;">
          ${this.renderShortcut('Esc', 'Close modal')}
          ${this.renderShortcut('Cmd/Ctrl + K', 'Focus search')}
          ${this.renderShortcut('← →', 'Navigate markets')}
          ${this.renderShortcut('H', 'Go to Home')}
          ${this.renderShortcut('M', 'Go to Markets')}
          ${this.renderShortcut('P', 'Go to Profile')}
          ${this.renderShortcut('S', 'Submit market')}
          ${this.renderShortcut('?', 'Show this help')}
        </div>
        <button onclick="document.getElementById('keyboard-help').remove()" 
                style="width: 100%; margin-top: 1.5rem; padding: 0.75rem; background: var(--green); color: var(--black); border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
          Got it!
        </button>
      </div>
    `;
    
    document.body.appendChild(help);
    
    // Close on click outside
    help.addEventListener('click', (e) => {
      if (e.target === help) help.remove();
    });
  },

  renderShortcut(key, description) {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: var(--white2); font-size: 0.9rem;">${description}</span>
        <kbd style="background: var(--dark2); border: 1px solid var(--border2); border-radius: 4px; padding: 0.25rem 0.5rem; font-family: var(--font-mono); font-size: 0.75rem; color: var(--white);">${key}</kbd>
      </div>
    `;
  },

  injectHelpStyles() {
    if (document.getElementById('kbd-styles')) return;
    const style = document.createElement('style');
    style.id = 'kbd-styles';
    style.textContent = `
      kbd {
        font-family: var(--font-mono);
        font-size: 0.75rem;
      }
    `;
    document.head.appendChild(style);
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  KeyboardShortcuts.init();
});
