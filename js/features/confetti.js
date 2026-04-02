// ─────────────────────────────────────────────────────────────────────
// confetti.js — Celebration effects on wins
// ─────────────────────────────────────────────────────────────────────

const Confetti = {
  colors: ['#7dd87d', '#e8c547', '#6b9eff', '#b8a0e8', '#e07070'],
  
  burst(x, y, amount = 50) {
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      overflow: hidden;
    `;
    document.body.appendChild(container);

    for (let i = 0; i < amount; i++) {
      this.createPiece(container, x, y);
    }

    // Cleanup
    setTimeout(() => container.remove(), 3000);
  },

  createPiece(container, originX, originY) {
    const piece = document.createElement('div');
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const size = Math.random() * 8 + 4;
    
    piece.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      left: ${originX}px;
      top: ${originY}px;
      pointer-events: none;
    `;

    container.appendChild(piece);

    // Animate
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 300 + 100;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 200; // Upward bias
    const gravity = 400;
    const duration = 2000 + Math.random() * 1000;

    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      
      if (elapsed > duration / 1000) {
        piece.remove();
        return;
      }

      const x = originX + vx * elapsed;
      const y = originY + vy * elapsed + 0.5 * gravity * elapsed * elapsed;
      const rotation = elapsed * 720;
      const opacity = 1 - elapsed / (duration / 1000);

      piece.style.transform = `translate(${x - originX}px, ${y - originY}px) rotate(${rotation}deg)`;
      piece.style.opacity = opacity;

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  },

  // Full screen celebration
  celebrate(message = '🎉 You Won!') {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    this.burst(centerX, centerY, 100);
    
    // Show celebration message
    const msg = document.createElement('div');
    msg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--off-black);
      border: 2px solid var(--green);
      border-radius: 16px;
      padding: 2rem 3rem;
      text-align: center;
      z-index: 10000;
      animation: celebrate-pop 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 60px rgba(125, 216, 125, 0.3);
    `;
    msg.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 1rem;">🏆</div>
      <div style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--green); margin-bottom: 0.5rem;">
        ${message}
      </div>
      <div style="font-size: 0.9rem; color: var(--white2);">
        Your winnings have been added to your balance
      </div>
    `;
    
    document.body.appendChild(msg);

    // Add animation
    if (!document.getElementById('celebrate-anim')) {
      const style = document.createElement('style');
      style.id = 'celebrate-anim';
      style.textContent = `
        @keyframes celebrate-pop {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      msg.style.animation = 'celebrate-pop 0.3s ease reverse forwards';
      setTimeout(() => msg.remove(), 300);
    }, 2500);
  }
};

// Hook into market resolution notifications
function onMarketWin(marketId, winnings) {
  Confetti.celebrate(`🎉 You Won ${winnings.toLocaleString()} Tokens!`);
}
