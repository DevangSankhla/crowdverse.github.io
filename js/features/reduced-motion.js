// ─────────────────────────────────────────────────────────────────────
// reduced-motion.js — Respect prefers-reduced-motion setting
// ─────────────────────────────────────────────────────────────────────

const ReducedMotion = {
  prefersReduced: false,

  init() {
    this.checkPreference();
    this.listenForChanges();
    this.injectStyles();
  },

  checkPreference() {
    this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.prefersReduced) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    }
  },

  listenForChanges() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => {
      this.prefersReduced = e.matches;
      if (e.matches) {
        document.documentElement.setAttribute('data-reduced-motion', 'true');
        showToast('🎚️ Animations reduced for accessibility', 'green');
      } else {
        document.documentElement.removeAttribute('data-reduced-motion');
        showToast('✨ Animations enabled', 'green');
      }
    });
  },

  injectStyles() {
    if (document.getElementById('reduced-motion-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'reduced-motion-styles';
    style.textContent = `
      [data-reduced-motion="true"] *,
      [data-reduced-motion="true"] *::before,
      [data-reduced-motion="true"] *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      [data-reduced-motion="true"] .skeleton {
        animation: none !important;
      }
      
      [data-reduced-motion="true"] .flip-card-inner {
        transition: none !important;
      }
      
      [data-reduced-motion="true"] .coin-particle,
      [data-reduced-motion="true"] .confetti-piece {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ReducedMotion.init();
});
