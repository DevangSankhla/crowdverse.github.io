// ─────────────────────────────────────────────────────────────────────
// offline-indicator.js — Offline mode indicator
// ─────────────────────────────────────────────────────────────────────

const OfflineManager = {
  isOnline: true,
  indicator: null,
  hidden: false,

  init() {
    this.createIndicator();
    this.bindEvents();
    
    // Check initial state
    if (!navigator.onLine && !this.hidden) {
      this.show();
    }
  },

  bindEvents() {
    window.addEventListener('offline', () => {
      if (!this.hidden) this.show();
    });
    
    window.addEventListener('online', () => {
      this.hide();
    });
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
      pointer-events: auto;
    `;
    
    // Create content with properly attached event handler
    const content = document.createElement('span');
    content.textContent = 'Connection issue detected';
    
    const icon = document.createElement('span');
    icon.textContent = '📡';
    
    const hideBtn = document.createElement('button');
    hideBtn.textContent = '✕ Hide';
    hideBtn.style.cssText = `
      background: rgba(0,0,0,0.2);
      border: none;
      border-radius: 4px;
      padding: 0.25rem 0.75rem;
      margin-left: 0.5rem;
      cursor: pointer;
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--black);
      pointer-events: auto;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    `;
    hideBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.hideForever();
    };
    
    this.indicator.appendChild(icon);
    this.indicator.appendChild(content);
    this.indicator.appendChild(hideBtn);
    
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
  },

  hideForever() {
    this.hidden = true;
    this.hide();
    try {
      localStorage.setItem('offline-banner-hidden', 'true');
    } catch {}
    showToast('Banner hidden', 'green');
  },

  restore() {
    try {
      this.hidden = localStorage.getItem('offline-banner-hidden') === 'true';
    } catch {
      this.hidden = false;
    }
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  OfflineManager.restore();
  OfflineManager.init();
  
  // Expose for console use
  window.hideOfflineBanner = () => OfflineManager.hideForever();
});
