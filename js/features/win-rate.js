// ─────────────────────────────────────────────────────────────────────
// win-rate.js — Calculate and display user's win rate
// ─────────────────────────────────────────────────────────────────────

const WinRateCalculator = {
  calculate() {
    const predictions = State.userPredictions || [];
    
    if (predictions.length === 0) {
      return { winRate: null, total: 0, won: 0, lost: 0 };
    }

    const resolved = predictions.filter(p => p.status === 'won' || p.status === 'lost');
    const won = resolved.filter(p => p.status === 'won').length;
    const lost = resolved.filter(p => p.status === 'lost').length;
    
    if (resolved.length === 0) {
      return { winRate: null, total: predictions.length, won: 0, lost: 0, pending: predictions.length };
    }

    const winRate = Math.round((won / resolved.length) * 100);
    
    return {
      winRate,
      total: predictions.length,
      won,
      lost,
      pending: predictions.length - resolved.length,
      resolved: resolved.length
    };
  },

  render() {
    const stats = this.calculate();
    const el = document.getElementById('stat-accuracy');
    if (!el) return;

    if (stats.winRate === null) {
      el.textContent = '—';
      el.title = 'Make predictions to see your win rate';
    } else {
      el.textContent = `${stats.winRate}%`;
      el.style.color = stats.winRate >= 50 ? 'var(--green)' : 'var(--yellow)';
      el.title = `${stats.won} won, ${stats.lost} lost, ${stats.pending} pending`;
    }
  },

  renderDetailed() {
    const stats = this.calculate();
    const container = document.getElementById('win-rate-details');
    if (!container) return;

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
        <div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--green);">${stats.won}</div>
          <div style="font-size: 0.7rem; color: var(--white3); font-family: var(--font-mono);">WON</div>
        </div>
        <div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--red);">${stats.lost}</div>
          <div style="font-size: 0.7rem; color: var(--white3); font-family: var(--font-mono);">LOST</div>
        </div>
        <div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--yellow);">${stats.pending}</div>
          <div style="font-size: 0.7rem; color: var(--white3); font-family: var(--font-mono);">PENDING</div>
        </div>
      </div>
      ${stats.winRate !== null ? `
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.85rem; color: var(--white2);">Win Rate</span>
            <span style="font-size: 1.25rem; font-weight: 800; color: ${stats.winRate >= 50 ? 'var(--green)' : 'var(--yellow)'};">
              ${stats.winRate}%
            </span>
          </div>
          <div style="height: 4px; background: var(--dark2); border-radius: 2px; margin-top: 0.5rem; overflow: hidden;">
            <div style="width: ${stats.winRate}%; height: 100%; background: ${stats.winRate >= 50 ? 'var(--green)' : 'var(--yellow)'}; transition: width 0.5s ease;"></div>
          </div>
        </div>
      ` : ''}
    `;
  }
};

// Auto-update when profile renders
const originalRenderProfile = window.renderProfile;
window.renderProfile = function() {
  if (originalRenderProfile) {
    originalRenderProfile.apply(this, arguments);
  }
  WinRateCalculator.render();
  WinRateCalculator.renderDetailed();
};
