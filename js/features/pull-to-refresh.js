// ─────────────────────────────────────────────────────────────────────
// pull-to-refresh.js — Mobile pull-to-refresh gesture
// ─────────────────────────────────────────────────────────────────────

(function initPullToRefresh() {
  // Only on touch devices
  if (!('ontouchstart' in window)) return;

  let startY = 0;
  let currentY = 0;
  let isPulling = false;
  let refreshIndicator = null;
  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  function createIndicator() {
    const el = document.createElement('div');
    el.id = 'pull-refresh-indicator';
    el.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        border: 3px solid var(--border2);
        border-top-color: var(--green);
        border-radius: 50%;
        animation: pull-refresh-spin 0.8s linear infinite;
        opacity: 0;
        transition: opacity 0.2s;
      "></div>
      <span style="
        font-family: var(--font-mono);
        font-size: 0.7rem;
        color: var(--white3);
        margin-top: 0.5rem;
        opacity: 0;
        transition: opacity 0.2s;
      ">Pull to refresh</span>
    `;
    el.style.cssText = `
      position: fixed;
      top: var(--nav-height);
      left: 0;
      right: 0;
      height: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      overflow: hidden;
      z-index: 100;
      pointer-events: none;
    `;
    document.body.appendChild(el);
    
    // Add spin animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pull-refresh-spin {
        to { transform: rotate(360deg); }
      }
      @keyframes pull-refresh-release {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    
    return el;
  }

  function updateIndicator(pullDistance, isReady) {
    if (!refreshIndicator) refreshIndicator = createIndicator();
    
    const clampedDistance = Math.min(pullDistance, MAX_PULL);
    refreshIndicator.style.height = `${clampedDistance}px`;
    
    const spinner = refreshIndicator.querySelector('div');
    const text = refreshIndicator.querySelector('span');
    
    const opacity = Math.min(pullDistance / PULL_THRESHOLD, 1);
    spinner.style.opacity = opacity;
    text.style.opacity = opacity;
    
    // Rotate spinner based on pull progress
    const rotation = (pullDistance / PULL_THRESHOLD) * 360;
    spinner.style.transform = `rotate(${rotation}deg)`;
    
    if (isReady) {
      text.textContent = 'Release to refresh';
      spinner.style.animation = 'pull-refresh-release 0.3s ease';
    } else {
      text.textContent = 'Pull to refresh';
      spinner.style.animation = 'none';
    }
  }

  function triggerRefresh() {
    showToast('🔄 Refreshing...', 'green');
    
    // Refresh markets
    if (typeof loadAndRenderMarkets === 'function') {
      loadAndRenderMarkets();
    }
    if (typeof loadAdminData === 'function' && isAdmin()) {
      loadAdminData();
    }
    
    // Hide indicator
    if (refreshIndicator) {
      refreshIndicator.style.transition = 'height 0.3s ease';
      refreshIndicator.style.height = '0';
      setTimeout(() => {
        if (refreshIndicator) {
          refreshIndicator.style.transition = '';
        }
      }, 300);
    }
  }

  // Touch event handlers
  document.addEventListener('touchstart', (e) => {
    // Only trigger at top of page
    if (window.scrollY > 10) return;
    
    startY = e.touches[0].clientY;
    isPulling = true;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    
    currentY = e.touches[0].clientY;
    const pullDistance = currentY - startY;
    
    // Only pull down
    if (pullDistance < 0) {
      isPulling = false;
      return;
    }
    
    // Prevent default scrolling when pulling
    if (pullDistance > 10 && window.scrollY <= 0) {
      e.preventDefault();
    }
    
    const isReady = pullDistance >= PULL_THRESHOLD;
    updateIndicator(pullDistance, isReady);
  }, { passive: false });

  document.addEventListener('touchend', () => {
    if (!isPulling) return;
    
    const pullDistance = currentY - startY;
    
    if (pullDistance >= PULL_THRESHOLD) {
      triggerRefresh();
    } else {
      // Snap back
      if (refreshIndicator) {
        refreshIndicator.style.transition = 'height 0.2s ease';
        refreshIndicator.style.height = '0';
        setTimeout(() => {
          if (refreshIndicator) {
            refreshIndicator.style.transition = '';
          }
        }, 200);
      }
    }
    
    isPulling = false;
    startY = 0;
    currentY = 0;
  });
})();
