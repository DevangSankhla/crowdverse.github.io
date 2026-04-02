// ─────────────────────────────────────────────────────────────────────
// winnings-calculator.js — Live estimated winnings calculator
// ─────────────────────────────────────────────────────────────────────

const WinningsCalculator = {
  // Calculate potential winnings based on current odds
  calculate(stake, market, option) {
    if (!market || !stake || stake < MIN_STAKE) return 0;
    
    const pctA = market.pctA || 50;
    const pctB = 100 - pctA;
    
    let odds;
    if (option === 'a') {
      odds = pctA > 0 ? (100 / pctA) : 2;
    } else {
      odds = pctB > 0 ? (100 / pctB) : 2;
    }
    
    const stakeAmount = Math.max(0, stake - PREDICTION_FEE);
    return Math.floor(stakeAmount * odds);
  },

  // Update display in real-time
  updateDisplay() {
    const slider = document.getElementById('vote-amount-slider');
    const display = document.getElementById('live-winnings-display');
    
    if (!slider || !display) return;
    
    const amount = parseInt(slider.value) || MIN_STAKE;
    const market = findMarketById(State.activeMarketId);
    
    if (!market) return;
    
    const winnings = this.calculate(amount, market, State.selectedVoteOption);
    display.textContent = `+${winnings.toLocaleString()}`;
    
    // Animate if changed significantly
    display.style.animation = 'none';
    setTimeout(() => {
      display.style.animation = 'winnings-pulse 0.3s ease';
    }, 10);
  },

  // Inject calculator into vote modal
  inject() {
    const modal = document.querySelector('#polymarket-vote-modal .modal');
    if (!modal || modal.querySelector('.winnings-calculator')) return;

    const calculator = document.createElement('div');
    calculator.className = 'winnings-calculator';
    calculator.style.cssText = `
      margin: 1rem 0;
      padding: 1rem;
      background: var(--green-glow2);
      border: 1px solid var(--green-glow);
      border-radius: 10px;
      text-align: center;
    `;
    calculator.innerHTML = `
      <div style="font-size: 0.7rem; color: var(--white3); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">
        Potential Winnings
      </div>
      <div id="live-winnings-display" style="font-size: 2rem; font-weight: 800; color: var(--green); font-family: var(--font-display);">
        —
      </div>
      <div style="font-size: 0.7rem; color: var(--white3); margin-top: 0.25rem;">
        if your prediction is correct
      </div>
    `;

    // Insert before confirm button area
    const footer = modal.querySelector('div:last-child');
    if (footer) {
      modal.insertBefore(calculator, footer);
    }

    // Add animation style
    if (!document.getElementById('winnings-anim')) {
      const style = document.createElement('style');
      style.id = 'winnings-anim';
      style.textContent = `
        @keyframes winnings-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }

    // Hook into slider
    const slider = document.getElementById('vote-amount-slider');
    if (slider) {
      slider.addEventListener('input', () => this.updateDisplay());
    }
  }
};

// Auto-inject when vote modal opens
const originalOpenVote = window.openVote;
window.openVote = function(...args) {
  originalOpenVote.apply(this, args);
  setTimeout(() => WinningsCalculator.inject(), 100);
};
