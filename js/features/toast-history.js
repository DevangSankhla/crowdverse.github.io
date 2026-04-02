// ─────────────────────────────────────────────────────────────────────
// toast-history.js — Toast notification history bell
// ─────────────────────────────────────────────────────────────────────

const ToastHistory = {
  history: [],
  maxItems: 20,
  unreadCount: 0,

  init() {
    this.load();
    this.injectBell();
  },

  load() {
    try {
      const saved = localStorage.getItem('toast-history');
      if (saved) {
        this.history = JSON.parse(saved);
      }
    } catch {}
  },

  save() {
    try {
      localStorage.setItem('toast-history', JSON.stringify(this.history.slice(-this.maxItems)));
    } catch {}
  },

  add(message, type = 'info') {
    const item = {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now(),
      read: false
    };
    
    this.history.unshift(item);
    if (this.history.length > this.maxItems) {
      this.history.pop();
    }
    
    this.unreadCount++;
    this.updateBadge();
    this.save();
  },

  markAllRead() {
    this.history.forEach(h => h.read = true);
    this.unreadCount = 0;
    this.updateBadge();
    this.save();
  },

  updateBadge() {
    const badge = document.getElementById('toast-bell-badge');
    if (badge) {
      badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
      badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
    }
  },

  injectBell() {
    // Add to navbar
    const navActions = document.querySelector('.nav-actions');
    if (!navActions || document.getElementById('toast-bell')) return;

    const bell = document.createElement('button');
    bell.id = 'toast-bell';
    bell.style.cssText = `
      background: none;
      border: none;
      color: var(--white3);
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      position: relative;
      transition: color 0.2s;
    `;
    bell.innerHTML = `
      🔔
      <span id="toast-bell-badge" style="
        position: absolute;
        top: 0;
        right: 0;
        background: var(--red);
        color: white;
        font-size: 0.6rem;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        display: none;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      ">${this.unreadCount}</span>
    `;
    
    bell.onclick = () => this.showHistory();
    
    // Insert before login button
    const loginBtn = document.getElementById('nav-login-btn');
    if (loginBtn) {
      navActions.insertBefore(bell, loginBtn);
    } else {
      navActions.appendChild(bell);
    }
    
    this.updateBadge();
  },

  showHistory() {
    this.markAllRead();
    
    const modal = document.createElement('div');
    modal.id = 'toast-history-modal';
    modal.style.cssText = `
      position: fixed;
      top: var(--nav-height);
      right: 1rem;
      width: 320px;
      max-height: 400px;
      background: var(--off-black);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 1000;
      overflow: hidden;
      animation: slideIn 0.2s ease;
    `;
    
    const items = this.history.length > 0 
      ? this.history.map(h => this.renderHistoryItem(h)).join('')
      : '<div style="padding: 2rem; text-align: center; color: var(--white3);">No notifications yet</div>';
    
    modal.innerHTML = `
      <div style="padding: 1rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600;">Notifications</span>
        <button onclick="ToastHistory.clear()" style="background: none; border: none; color: var(--white3); font-size: 0.75rem; cursor: pointer;">Clear all</button>
      </div>
      <div style="max-height: 320px; overflow-y: auto;">
        ${items}
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on click outside
    setTimeout(() => {
      document.addEventListener('click', function close(e) {
        if (!modal.contains(e.target)) {
          modal.remove();
          document.removeEventListener('click', close);
        }
      });
    }, 100);
  },

  renderHistoryItem(item) {
    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const colors = {
      green: 'var(--green)',
      red: 'var(--red)',
      yellow: 'var(--yellow)',
      info: 'var(--white3)'
    };
    
    return `
      <div style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border2); display: flex; align-items: flex-start; gap: 0.5rem; ${item.read ? '' : 'background: rgba(125,216,125,0.05);'}">
        <span style="color: ${colors[item.type] || colors.info}; font-size: 0.8rem; margin-top: 0.1rem;">●</span>
        <div style="flex: 1;">
          <div style="font-size: 0.85rem; color: var(--white); line-height: 1.4;">${escHtml(item.message)}</div>
          <div style="font-size: 0.7rem; color: var(--white3); margin-top: 0.25rem;">${time}</div>
        </div>
      </div>
    `;
  },

  clear() {
    this.history = [];
    this.unreadCount = 0;
    this.save();
    this.updateBadge();
    document.getElementById('toast-history-modal')?.remove();
  }
};

// Hook into existing showToast
const originalShowToast = window.showToast;
window.showToast = function(message, color = 'green') {
  originalShowToast(message, color);
  ToastHistory.add(message, color);
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  ToastHistory.init();
});
