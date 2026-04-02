// ─────────────────────────────────────────────────────────────────────
// offline-indicator.js — Offline mode indicator
// ─────────────────────────────────────────────────────────────────────

const OfflineManager = {
  isOnline: navigator.onLine,
  indicator: null,
  manuallyDismissed: false,

  init() {
    this.createIndicator();
    this.bindEvents();
    this.updateStatus();
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
      <span>You're offline</span>
      <button id="offline-dismiss" style="
        background: rgba(0,0,0,0.2);
        border: none;
        border-radius: 4px;
        padding: 0.15rem 0.5rem;
        margin-left: 0.5rem;
        cursor: pointer;
        font-size: 0.7rem;
        color: var(--black);
      ">✕</button>
    `;
    document.body.appendChild(this.indicator);
    
    // Dismiss button
    this.indicator.querySelector('#offline-dismiss').onclick = () => {
      this.manuallyDismissed = true;
      this.indicator.style.transform = 'translateY(-100%)';
    };
  },

  bindEvents() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.manuallyDismissed = false;
      this.updateStatus();
      showToast('🌐 Back online!', 'green');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.manuallyDismissed = false;
      this.updateStatus();
      showToast('📡 You\'re offline', 'yellow');
    });
  },

  updateStatus() {
    if (!this.indicator) return;
    
    if (this.isOnline || this.manuallyDismissed) {
      this.indicator.style.transform = 'translateY(-100%)';
    } else {
      this.indicator.style.transform = 'translateY(0)';
    }
  },

  // Check current status
  checkNow() {
    this.isOnline = navigator.onLine;
    this.updateStatus();
    return this.isOnline;
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  OfflineManager.init();
  
  // Expose for debugging
  window.checkConnection = () => OfflineManager.checkNow();
});
