// ─────────────────────────────────────────────────────────────────────
// card-flip.js — Market card flip animation for details
// ─────────────────────────────────────────────────────────────────────

const CardFlip = {
  init() {
    this.injectStyles();
  },

  injectStyles() {
    if (document.getElementById('card-flip-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'card-flip-styles';
    style.textContent = `
      .flip-card {
        perspective: 1000px;
        cursor: pointer;
      }
      
      .flip-card-inner {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform 0.6s;
        transform-style: preserve-3d;
      }
      
      .flip-card.flipped .flip-card-inner {
        transform: rotateY(180deg);
      }
      
      .flip-card-front,
      .flip-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
      
      .flip-card-back {
        transform: rotateY(180deg);
        background: var(--off-black);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        overflow-y: auto;
      }
      
      .flip-hint {
        position: absolute;
        bottom: 0.5rem;
        right: 0.5rem;
        font-size: 0.65rem;
        color: var(--white3);
        opacity: 0.5;
        font-family: var(--font-mono);
      }
      
      .flip-card:hover .flip-hint {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  },

  // Wrap a market card with flip functionality
  wrapCard(cardElement, market) {
    if (cardElement.classList.contains('flip-card')) return;
    
    const front = cardElement.cloneNode(true);
    const back = this.createBack(market);
    
    const wrapper = document.createElement('div');
    wrapper.className = 'flip-card market-card-full';
    wrapper.style.cssText = cardElement.style.cssText;
    
    const inner = document.createElement('div');
    inner.className = 'flip-card-inner';
    
    front.className = 'flip-card-front market-card-full';
    front.style.position = 'relative';
    
    // Add flip hint
    const hint = document.createElement('span');
    hint.className = 'flip-hint';
    hint.textContent = 'Click to flip';
    front.appendChild(hint);
    
    inner.appendChild(front);
    inner.appendChild(back);
    wrapper.appendChild(inner);
    
    // Toggle flip on click (not on buttons)
    wrapper.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      wrapper.classList.toggle('flipped');
    });
    
    return wrapper;
  },

  createBack(market) {
    const back = document.createElement('div');
    back.className = 'flip-card-back';
    
    const createdDate = market.createdAt?.seconds 
      ? new Date(market.createdAt.seconds * 1000).toLocaleDateString()
      : 'Unknown';
    
    back.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--green);">DETAILS</span>
        <button onclick="this.closest('.flip-card').classList.remove('flipped')" 
                style="background: none; border: none; color: var(--white3); cursor: pointer; font-size: 1.2rem;">✕</button>
      </div>
      
      ${market.description ? `
        <div style="margin-bottom: 1rem;">
          <div style="font-size: 0.7rem; color: var(--white3); margin-bottom: 0.25rem;">Description</div>
          <div style="font-size: 0.85rem; color: var(--white2); line-height: 1.5;">${escHtml(market.description)}</div>
        </div>
      ` : ''}
      
      <div style="display: grid; gap: 0.75rem; font-size: 0.8rem; color: var(--white2);">
        <div style="display: flex; justify-content: space-between;">
          <span>Created:</span>
          <span style="color: var(--white);">${createdDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Ends:</span>
          <span style="color: var(--white);">${market.ends || 'TBD'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Category:</span>
          <span style="color: var(--white);">${escHtml(market.cat || 'General')}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Total Pool:</span>
          <span style="color: var(--green);">${(market.totalTokens || market.tokens || 0).toLocaleString()} tokens</span>
        </div>
      </div>
      
      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
        <div style="font-size: 0.7rem; color: var(--white3); margin-bottom: 0.5rem;">Share this market</div>
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="shareMarket('${market.firestoreId || market.id}', '${escHtml(market.question).replace(/'/g, "\\'")}')" 
                  style="flex: 1; padding: 0.5rem; background: var(--dark2); border: 1px solid var(--border2); border-radius: 6px; color: var(--white); cursor: pointer; font-size: 0.8rem;">
            🔗 Copy Link
          </button>
        </div>
      </div>
    `;
    
    return back;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CardFlip.init();
});
