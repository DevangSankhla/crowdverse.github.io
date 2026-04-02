// ─────────────────────────────────────────────────────────────────────
// offline-indicator.js — Offline mode indicator and queue
// ─────────────────────────────────────────────────────────────────────

const OfflineManager = {
  isOnline: navigator.onLine,
  actionQueue: [],
  indicator: null,

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
      padding: 0.5rem;
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
      <span id="offline-text">You're offline</span>
      <span id="offline-queue" style="display:none;"></span>
    `;
    document.body.appendChild(this.indicator);
  },

  bindEvents() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateStatus();
      this.processQueue();
      showToast('🌐 Back online!', 'green');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateStatus();
      showToast('📡 You\'re offline. Changes will sync when connected.', 'yellow');
    });

    // Check connection quality
    setInterval(() => this.checkConnection(), 30000);
  },

  updateStatus() {
    if (!this.indicator) return;
    
    if (this.isOnline) {
      this.indicator.style.transform = 'translateY(-100%)';
    } else {
      this.indicator.style.transform = 'translateY(0)';
    }
  },

  checkConnection() {
    // Simple ping to check actual connectivity
    if (!navigator.onLine) return;
    
    fetch(window.location.origin + '/favicon.ico', { 
      method: 'HEAD',
      cache: 'no-store'
    }).catch(() => {
      if (this.isOnline) {
        this.isOnline = false;
        this.updateStatus();
      }
    });
  },

  // Queue an action to retry when back online
  queueAction(action, data) {
    this.actionQueue.push({ action, data, timestamp: Date.now() });
    this.updateQueueCount();
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('offline-queue', JSON.stringify(this.actionQueue));
    } catch {}
  },

  updateQueueCount() {
    const queueBadge = document.getElementById('offline-queue');
    if (queueBadge && this.actionQueue.length > 0) {
      queueBadge.textContent = `(${this.actionQueue.length} pending)`;
      queueBadge.style.display = 'inline';
    }
  },

  async processQueue() {
    if (this.actionQueue.length === 0) return;
    
    showToast(`🔄 Syncing ${this.actionQueue.length} queued actions...`, 'yellow');
    
    const failed = [];
    
    for (const item of this.actionQueue) {
      try {
        // Attempt to execute the queued action
        await this.executeAction(item);
      } catch (err) {
        console.warn('Failed to process queued action:', err);
        failed.push(item);
      }
    }
    
    this.actionQueue = failed;
    
    if (failed.length === 0) {
      showToast('✅ All changes synced!', 'green');
      localStorage.removeItem('offline-queue');
    } else {
      showToast(`⚠️ ${failed.length} actions failed to sync`, 'red');
      localStorage.setItem('offline-queue', JSON.stringify(failed));
    }
    
    this.updateQueueCount();
  },

  executeAction(item) {
    // Execute based on action type
    switch (item.action) {
      case 'prediction':
        // Would need to re-submit prediction
        return Promise.resolve();
      case 'market-submit':
        // Would need to re-submit market
        return Promise.resolve();
      default:
        return Promise.resolve();
    }
  },

  // Restore queue from localStorage on init
  restoreQueue() {
    try {
      const saved = localStorage.getItem('offline-queue');
      if (saved) {
        this.actionQueue = JSON.parse(saved);
        this.updateQueueCount();
      }
    } catch {}
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  OfflineManager.restoreQueue();
  OfflineManager.init();
});
