// ─────────────────────────────────────────────────────────────────────
// font-size.js — Font size adjustment for accessibility
// ─────────────────────────────────────────────────────────────────────

const FontSizeAdjuster = {
  STORAGE_KEY: 'crowdverse-font-scale',
  scales: [0.85, 1, 1.15, 1.3],
  currentIndex: 1,

  init() {
    this.load();
    this.apply();
  },

  load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved !== null) {
        const scale = parseFloat(saved);
        const index = this.scales.indexOf(scale);
        if (index !== -1) {
          this.currentIndex = index;
        }
      }
    } catch {}
  },

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.scales[this.currentIndex]);
    } catch {}
  },

  apply() {
    const scale = this.scales[this.currentIndex];
    document.documentElement.style.setProperty('--font-scale', scale);
    document.documentElement.style.fontSize = `${scale * 100}%`;
  },

  increase() {
    if (this.currentIndex < this.scales.length - 1) {
      this.currentIndex++;
      this.apply();
      this.save();
      showToast(`🔤 Font size increased`, 'green');
    }
  },

  decrease() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.apply();
      this.save();
      showToast(`🔤 Font size decreased`, 'green');
    }
  },

  // Generate toggle buttons HTML
  renderControls() {
    return `
      <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
        <button onclick="FontSizeAdjuster.decrease()" 
                style="background: var(--dark2); border: 1px solid var(--border2); border-radius: 6px; padding: 0.5rem 1rem; color: var(--white); cursor: pointer; font-size: 0.8rem;">
          A-
        </button>
        <span style="font-size: 0.75rem; color: var(--white3); font-family: var(--font-mono); min-width: 50px; text-align: center;">
          ${Math.round(this.scales[this.currentIndex] * 100)}%
        </span>
        <button onclick="FontSizeAdjuster.increase()" 
                style="background: var(--dark2); border: 1px solid var(--border2); border-radius: 6px; padding: 0.5rem 1rem; color: var(--white); cursor: pointer; font-size: 1rem;">
          A+
        </button>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  FontSizeAdjuster.init();
});
