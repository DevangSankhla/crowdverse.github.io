// ─────────────────────────────────────────────────────────────────────
// offline-indicator.js — Offline mode indicator (simplified)
// ─────────────────────────────────────────────────────────────────────

const OfflineManager = {
  isOnline: true,
  indicator: null,
  hidden: false,

  init() {
    this.createIndicator();
    // Don't auto-check, only show if explicitly offline
    window.addEventListener('offline', () => this.show());
    window.addEventListener('online', () => this.hide());
  },

  createIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.id = 'offline-indicator';
    this.indicator.style.cssText = `
      position: fixed;
      top: var(--nav-height);
      left: 0;
      right: 0;
      background: var(--yellow);
      color: var(--black);
      padding: 0.5rem 1rem;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 600;
      z-index: 9999;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    `;
    this.indicator.innerHTML = `
      <span>📡</span>
      <span>Connection issue detected</span>
      <button onclick="OfflineManager.hideForever()" style="
        background: rgba(0,0,0,0.2);
        border: none;
        border-radius: 4px;
        padding: 0.15rem 0.5rem;
        margin-left: 0.5rem;
        cursor: pointer;
        font-size: 0.7rem;
        color: var(--black);
      ">✕ Hide</button>
    `;
    document.body.appendChild(this.indicator);
  },

  show() {
    if (this.hidden || !this.indicator) return;
    this.indicator.style.transform = 'translateY(0)';
  },

  hide() {
    if (this.indicator) {
      this.indicator.style.transform = 'translateY(-100%)';
    }
    this.isOnline = true;
  },

  hideForever() {
    this.hidden = true;
    this.hide();
    localStorage.setItem('offline-banner-hidden', 'true');
  },

  restore() {
    this.hidden = localStorage.getItem('offline-banner-hidden') === 'true';
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  OfflineManager.restore();
  OfflineManager.init();
  
  // Expose global function
  window.hideOfflineBanner = () => OfflineManager.hideForever();
});
