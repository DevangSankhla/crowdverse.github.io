// ── COMMUNITY PAGE ────────────────────────────────────────────────────
function buildCommunityPage() {
  const totalParticipants = SAMPLE_MARKETS.reduce((acc, m) => acc + Math.floor(m.tokens / 50), 0);
  const totalVolume = SAMPLE_MARKETS.reduce((acc, m) => acc + m.tokens, 0);
  
  document.getElementById('page-community').innerHTML = `
    <div class="page-header">
      <div class="section-label" style="margin-bottom:0.5rem">Community Polls</div>
      <h1>Community Predictions</h1>
      <p>Join the crowd. Predict on trending topics and earn tokens.</p>
    </div>
    
    <!-- Stats bar -->
    <div style="max-width:1100px;margin:0 auto 2rem;padding:0 2rem;">
      <div class="stats-strip" style="margin:0;">
        <div class="stat-item">
          <span class="stat-num">${SAMPLE_MARKETS.length}</span>
          <span class="stat-label">Active Polls</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${totalVolume.toLocaleString()}</span>
          <span class="stat-label">Total Volume</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${totalParticipants.toLocaleString()}</span>
          <span class="stat-label">Participants</span>
        </div>
        <div class="stat-item">
          <span class="stat-num">${State.userTokens || 1000}</span>
          <span class="stat-label">Your Tokens</span>
        </div>
      </div>
    </div>
    
    <!-- Polls grid -->
    <div style="max-width:1100px;margin:0 auto;padding:0 2rem;">
      <div class="market-cards">
        ${SAMPLE_MARKETS.map(m => {
          const pctB = 100 - m.pctA;
          return `
          <div class="market-card" onclick="openVote(${m.id}, event)">
            <div class="market-cat">${m.cat}</div>
            <h3>${escHtml(m.question)}</h3>
            <div class="odds-bar">
              <div class="odds-fill" style="width:${m.pctA}%"></div>
            </div>
            <div class="odds-labels">
              <span>${m.optA} ${m.pctA}%</span>
              <span>${m.optB} ${pctB}%</span>
            </div>
            <div class="market-meta">
              <span>Ends: ${m.ends}</span>
              <span class="vol">${m.tokens.toLocaleString()} tokens pooled</span>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
    
    <!-- Create your own CTA -->
    <div style="max-width:1100px;margin:3rem auto;padding:0 2rem;">
      <div class="legal-banner" style="background:linear-gradient(135deg, rgba(0,255,127,0.1), rgba(0,255,127,0.05));border-color:var(--green);">
        <div class="icon">💡</div>
        <div>
          <p style="margin-bottom:0.5rem;"><strong>Want to Create Your Own Poll?</strong></p>
          <p style="margin-bottom:1rem;">Head over to the Markets page to create your own prediction panels and invite others to predict.</p>
          <button class="btn btn-primary" onclick="showPage('markets')">Create Your Market →</button>
        </div>
      </div>
    </div>
    
    ${buildFooter()}
  `;
}
