// ─────────────────────────────────────────────────────────────────────
// transaction-history.js — Full transaction history tracking
// ─────────────────────────────────────────────────────────────────────

const TransactionHistory = {
  async getTransactions() {
    if (!State.currentUser) return [];
    
    // Combine predictions with virtual transactions
    const transactions = [];
    
    // Add signup bonus
    transactions.push({
      type: 'signup',
      description: 'Welcome bonus',
      amount: 1000,
      timestamp: State.currentUser.metadata?.creationTime || Date.now(),
      balance: 1000
    });
    
    // Add predictions as transactions
    State.userPredictions.forEach(p => {
      // Deduction
      transactions.push({
        type: 'prediction',
        description: `Prediction: ${p.question.substring(0, 40)}...`,
        amount: -p.totalDeducted,
        timestamp: p.createdAt,
        marketId: p.marketId
      });
      
      // Result (if resolved)
      if (p.status === 'won') {
        transactions.push({
          type: 'win',
          description: `Won: ${p.question.substring(0, 40)}...`,
          amount: p.potentialWin,
          timestamp: p.resolvedAt || Date.now(),
          marketId: p.marketId
        });
      }
    });
    
    // Sort by date
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Calculate running balance
    let balance = 0;
    transactions.reverse().forEach(t => {
      balance += t.amount;
      t.balance = balance;
    });
    transactions.reverse();
    
    return transactions;
  },

  async render() {
    const container = document.getElementById('transaction-history-list');
    if (!container) return;
    
    const transactions = await this.getTransactions();
    
    if (transactions.length === 0) {
      container.innerHTML = '<p style="color: var(--white3); text-align: center; padding: 2rem;">No transactions yet</p>';
      return;
    }
    
    container.innerHTML = transactions.map(t => `
      <div style="display: flex; align-items: center; padding: 0.75rem; border-bottom: 1px solid var(--border); gap: 0.75rem;">
        <div style="font-size: 1.2rem;">${this.getIcon(t.type)}</div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 0.85rem; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escHtml(t.description)}
          </div>
          <div style="font-size: 0.7rem; color: var(--white3); font-family: var(--font-mono);">
            ${new Date(t.timestamp).toLocaleDateString()}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 600; color: ${t.amount >= 0 ? 'var(--green)' : 'var(--white)'}; font-family: var(--font-mono);">
            ${t.amount >= 0 ? '+' : ''}${t.amount.toLocaleString()}
          </div>
          <div style="font-size: 0.7rem; color: var(--white3); font-family: var(--font-mono);">
            ${t.balance.toLocaleString()}
          </div>
        </div>
      </div>
    `).join('');
  },

  getIcon(type) {
    const icons = {
      signup: '🎁',
      prediction: '🎯',
      win: '🏆',
      loss: '💸',
      weekly: '📅',
      referral: '👥',
      adjustment: '⚙️'
    };
    return icons[type] || '💰';
  }
};
