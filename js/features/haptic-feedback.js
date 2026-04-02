// ─────────────────────────────────────────────────────────────────────
// haptic-feedback.js — Haptic feedback for mobile devices
// ─────────────────────────────────────────────────────────────────────

const Haptics = {
  // Check if device supports vibration
  isSupported() {
    return 'vibrate' in navigator;
  },

  // Light tap feedback
  light() {
    if (this.isSupported()) {
      navigator.vibrate(10);
    }
  },

  // Medium feedback
  medium() {
    if (this.isSupported()) {
      navigator.vibrate(20);
    }
  },

  // Heavy feedback
  heavy() {
    if (this.isSupported()) {
      navigator.vibrate([30, 50, 30]);
    }
  },

  // Success pattern
  success() {
    if (this.isSupported()) {
      navigator.vibrate([10, 50, 20]);
    }
  },

  // Error pattern
  error() {
    if (this.isSupported()) {
      navigator.vibrate([50, 30, 50]);
    }
  },

  // Hook into common actions
  init() {
    // Button presses
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        this.light();
      }
    });

    // Prediction placed
    const originalConfirm = window.confirmPolymarketVote;
    if (originalConfirm) {
      window.confirmPolymarketVote = async function(...args) {
        const result = await originalConfirm.apply(this, args);
        Haptics.success();
        return result;
      };
    }

    // Toast notifications
    const originalToast = window.showToast;
    window.showToast = function(message, color) {
      if (color === 'red') Haptics.error();
      else if (color === 'green') Haptics.success();
      return originalToast(message, color);
    };
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Haptics.init();
});
