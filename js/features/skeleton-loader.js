// ─────────────────────────────────────────────────────────────────────
// skeleton-loader.js — Skeleton loading screens for better perceived performance
// ─────────────────────────────────────────────────────────────────────

const SkeletonLoader = {
  // Generate market card skeleton
  marketCard() {
    return `
      <div class="market-card-full" style="opacity: 0.7;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem;">
          <div class="skeleton" style="width:80px;height:20px;border-radius:4px;"></div>
          <div class="skeleton" style="width:32px;height:32px;border-radius:50%;"></div>
        </div>
        <div class="skeleton" style="width:100%;height:24px;margin-bottom:0.5rem;border-radius:4px;"></div>
        <div class="skeleton" style="width:70%;height:24px;margin-bottom:1rem;border-radius:4px;"></div>
        <div style="height:8px;background:var(--dark2);border-radius:4px;margin:1rem 0;overflow:hidden;">
          <div class="skeleton" style="width:60%;height:100%;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:1rem;">
          <div class="skeleton" style="width:100px;height:16px;border-radius:4px;"></div>
          <div class="skeleton" style="width:80px;height:16px;border-radius:4px;"></div>
        </div>
      </div>
    `;
  },

  // Generate stats skeleton
  statBox() {
    return `
      <div class="stat-box" style="opacity: 0.7;">
        <div class="skeleton" style="width:120px;height:16px;margin-bottom:1rem;border-radius:4px;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;text-align:center;">
          <div>
            <div class="skeleton" style="width:50px;height:30px;margin:0 auto;border-radius:4px;"></div>
            <div class="skeleton" style="width:60px;height:12px;margin:0.5rem auto 0;border-radius:4px;"></div>
          </div>
          <div>
            <div class="skeleton" style="width:50px;height:30px;margin:0 auto;border-radius:4px;"></div>
            <div class="skeleton" style="width:60px;height:12px;margin:0.5rem auto 0;border-radius:4px;"></div>
          </div>
          <div>
            <div class="skeleton" style="width:50px;height:30px;margin:0 auto;border-radius:4px;"></div>
            <div class="skeleton" style="width:60px;height:12px;margin:0.5rem auto 0;border-radius:4px;"></div>
          </div>
        </div>
      </div>
    `;
  },

  // Generate leaderboard skeleton
  leaderboardItem() {
    return `
      <div class="leaderboard-item" style="opacity: 0.7;">
        <div class="skeleton" style="width:24px;height:16px;border-radius:4px;"></div>
        <div class="skeleton" style="flex:1;height:16px;margin:0 0.75rem;border-radius:4px;"></div>
        <div class="skeleton" style="width:60px;height:16px;border-radius:4px;"></div>
      </div>
    `;
  },

  // Show skeletons in container
  show(containerId, type = 'market', count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let skeletonHTML = '';
    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'market':
          skeletonHTML += this.marketCard();
          break;
        case 'stat':
          skeletonHTML += this.statBox();
          break;
        case 'leaderboard':
          skeletonHTML += this.leaderboardItem();
          break;
      }
    }

    container.innerHTML = `<div class="skeleton-container">${skeletonHTML}</div>`;
  },

  // Hide skeletons
  hide(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
  }
};

// Add skeleton styles
(function injectSkeletonStyles() {
  if (document.getElementById('skeleton-styles')) return;
  const style = document.createElement('style');
  style.id = 'skeleton-styles';
  style.textContent = `
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--dark2) 25%,
        var(--border) 50%,
        var(--dark2) 75%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s infinite;
    }
    
    @keyframes skeleton-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    [data-theme="light"] .skeleton {
      background: linear-gradient(
        90deg,
        var(--dark2) 25%,
        var(--border) 50%,
        var(--dark2) 75%
      );
      background-size: 200% 100%;
    }
  `;
  document.head.appendChild(style);
})();
