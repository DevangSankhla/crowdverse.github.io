// ─────────────────────────────────────────────────────────────────────
// report-market.js — Report inappropriate markets
// ─────────────────────────────────────────────────────────────────────

const ReportMarket = {
  reasons: [
    { id: 'spam', label: 'Spam or misleading', emoji: '📧' },
    { id: 'offensive', label: 'Offensive content', emoji: '🤬' },
    { id: 'duplicate', label: 'Duplicate market', emoji: '🔁' },
    { id: 'impossible', label: 'Cannot be resolved', emoji: '❓' },
    { id: 'other', label: 'Other reason', emoji: '📝' }
  ],

  openModal(marketId, question) {
    if (document.getElementById('report-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'report-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      animation: fadeIn 0.2s ease;
    `;
    
    modal.innerHTML = `
      <div style="background: var(--off-black); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; max-width: 400px; width: 100%; animation: slideUp 0.3s ease;">
        <h3 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 0.5rem;">🚩 Report Market</h3>
        <p style="font-size: 0.85rem; color: var(--white3); margin-bottom: 1rem; line-height: 1.5;">
          Report: "${escHtml(question.substring(0, 60))}${question.length > 60 ? '...' : ''}"
        </p>
        
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
          ${this.reasons.map(r => `
            <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--dark); border: 1px solid var(--border2); border-radius: 8px; cursor: pointer; transition: all 0.2s;" 
                   onmouseover="this.style.borderColor='var(--border)'" 
                   onmouseout="this.style.borderColor='var(--border2)'">
              <input type="radio" name="report-reason" value="${r.id}" style="accent-color: var(--green);">
              <span style="font-size: 1rem;">${r.emoji}</span>
              <span style="font-size: 0.9rem; color: var(--white);">${r.label}</span>
            </label>
          `).join('')}
        </div>
        
        <textarea id="report-details" placeholder="Additional details (optional)" 
                  style="width: 100%; background: var(--dark); border: 1px solid var(--border2); border-radius: 8px; padding: 0.75rem; color: var(--white); font-family: inherit; resize: vertical; min-height: 80px; margin-bottom: 1rem;"></textarea>
        
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="document.getElementById('report-modal').remove()" 
                  style="flex: 1; padding: 0.75rem; background: transparent; border: 1px solid var(--border2); border-radius: 8px; color: var(--white3); cursor: pointer;">
            Cancel
          </button>
          <button onclick="ReportMarket.submit('${marketId}')" 
                  style="flex: 1; padding: 0.75rem; background: var(--red); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
            Submit Report
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  },

  async submit(marketId) {
    const reason = document.querySelector('input[name="report-reason"]:checked')?.value;
    const details = document.getElementById('report-details')?.value;
    
    if (!reason) {
      showToast('Please select a reason', 'red');
      return;
    }

    // Save to Firestore if available
    if (!demoMode && db && State.currentUser) {
      try {
        await db.collection('reports').add({
          marketId,
          reason,
          details,
          reportedBy: State.currentUser.uid,
          reportedByEmail: State.currentUser.email,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          status: 'pending'
        });
      } catch (e) {
        console.error('Failed to save report:', e);
      }
    }

    document.getElementById('report-modal')?.remove();
    showToast('✅ Report submitted. Thank you!', 'green');
  },

  // Button HTML for market cards
  renderButton(marketId, question) {
    return `
      <button onclick="event.stopPropagation(); ReportMarket.openModal('${marketId}', '${escHtml(question).replace(/'/g, "\\'")}')" 
              style="background: none; border: none; color: var(--white3); font-size: 0.75rem; cursor: pointer; padding: 0.25rem; opacity: 0.5; transition: opacity 0.2s;"
              title="Report this market"
              onmouseover="this.style.opacity='1'; this.style.color='var(--red)'" 
              onmouseout="this.style.opacity='0.5'; this.style.color='var(--white3)'">
        🚩
      </button>
    `;
  }
};
