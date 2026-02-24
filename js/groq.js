// ─────────────────────────────────────────────────────────────────────
// groq.js — AI-powered market context via secure Cloud Function proxy
//           + Attention confirmation overlay before staking tokens
//
// The Groq API key lives ONLY in Firebase Cloud Functions config.
// This file never touches the key — it calls your own backend.
// ─────────────────────────────────────────────────────────────────────

// ── Your Cloud Function URL ───────────────────────────────────────────
// After deploying, replace this with your real function URL.
// Format: https://asia-south1-YOUR_PROJECT_ID.cloudfunctions.net/groqContext
const GROQ_PROXY_URL = 'https://us-central1-crowdverse-dev1.cloudfunctions.net/groqContext';
// ── In-session cache so we don't re-call for the same market ─────────
const _groqContextCache = {};

// ── Fetch AI context via the secure proxy ────────────────────────────
async function fetchMarketContext(marketId, question, category) {
  if (_groqContextCache[marketId]) return _groqContextCache[marketId];

  if (!GROQ_PROXY_URL || GROQ_PROXY_URL.includes('YOUR_PROJECT_ID')) return null;

  try {
    const res = await fetch(GROQ_PROXY_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ marketId, question, category })
    });

    if (!res.ok) {
      console.warn('Groq proxy returned', res.status);
      return null;
    }

    const data = await res.json();
    if (data.context) {
      _groqContextCache[marketId] = data.context;
      return data.context;
    }
  } catch (e) {
    console.warn('Groq proxy fetch failed:', e.message);
  }
  return null;
}

// ── Inject context into the open vote modal ───────────────────────────
async function loadAndInjectContext(marketId, question, category) {
  const panel = document.getElementById('groq-context-panel');
  if (!panel) return;

  if (!GROQ_PROXY_URL || GROQ_PROXY_URL.includes('YOUR_PROJECT_ID')) {
    panel.style.display = 'none';
    return;
  }

  // Show loading skeleton immediately
  panel.style.display = 'block';
  panel.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.6rem;">
      <span style="font-size:0.95rem;">🤖</span>
      <span style="font-size:0.68rem;color:var(--green);text-transform:uppercase;
                   letter-spacing:0.08em;opacity:0.85;">AI Market Briefing</span>
      <span style="font-size:0.62rem;color:var(--white3);font-family:var(--font-mono);">
        powered by Groq
      </span>
    </div>
    <div style="display:flex;gap:0.4rem;flex-direction:column;">
      <div class="groq-skeleton" style="height:11px;width:95%;"></div>
      <div class="groq-skeleton" style="height:11px;width:80%;"></div>
      <div class="groq-skeleton" style="height:11px;width:88%;"></div>
    </div>`;

  const context = await fetchMarketContext(marketId, question, category);

  if (!context) {
    panel.style.display = 'none';
    return;
  }

  panel.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.65rem;">
      <span style="font-size:0.95rem;">🤖</span>
      <span style="font-size:0.68rem;color:var(--green);text-transform:uppercase;
                   letter-spacing:0.08em;opacity:0.85;">AI Market Briefing</span>
      <span style="font-size:0.62rem;color:var(--white3);font-family:var(--font-mono);">
        powered by Groq
      </span>
    </div>
    <p style="font-size:0.8rem;color:var(--white2);line-height:1.65;margin:0;">
      ${escHtml(context)}
    </p>`;
}

// ── Attention confirmation overlay ────────────────────────────────────
// Returns a Promise<boolean> — true = confirmed, false = user cancelled
function showAttentionOverlay(optLabel, amount, potentialWin) {
  return new Promise(resolve => {
    const existing = document.getElementById('attention-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'attention-overlay';
    overlay.style.cssText = `
      position: absolute;
      inset: 0;
      background: rgba(10,10,10,0.97);
      border-radius: inherit;
      z-index: 10;
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      animation: attentionIn 0.2s ease;
      overflow-y: auto;
    `;

    overlay.innerHTML = `
      <div style="text-align:center;margin-bottom:1.25rem;">
        <div style="font-size:2rem;margin-bottom:0.5rem;">⚠️</div>
        <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;
                    color:var(--white);margin-bottom:0.25rem;">
          Before You Commit
        </div>
        <div style="font-size:0.8rem;color:var(--white3);">
          You are about to stake
          <strong style="color:var(--yellow);">${amount} tokens</strong>
          on <strong style="color:var(--white);">"${escHtml(optLabel)}"</strong>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:1.25rem;">
        <div style="background:var(--dark);border:1px solid var(--border2);border-radius:8px;
                    padding:0.75rem;text-align:center;">
          <div style="font-size:0.65rem;color:var(--white3);text-transform:uppercase;
                      letter-spacing:0.06em;margin-bottom:0.25rem;">Staking</div>
          <div style="font-size:1.25rem;font-weight:800;color:var(--yellow);">${amount}</div>
          <div style="font-size:0.65rem;color:var(--white3);">tokens</div>
        </div>
        <div style="background:var(--dark);border:1px solid rgba(127,255,127,0.2);border-radius:8px;
                    padding:0.75rem;text-align:center;">
          <div style="font-size:0.65rem;color:var(--white3);text-transform:uppercase;
                      letter-spacing:0.06em;margin-bottom:0.25rem;">If Correct</div>
          <div style="font-size:1.25rem;font-weight:800;color:var(--green);">+${potentialWin}</div>
          <div style="font-size:0.65rem;color:var(--white3);">tokens</div>
        </div>
      </div>

      <label id="attention-label"
             style="display:flex;align-items:flex-start;gap:0.75rem;padding:1rem;
                    background:rgba(127,255,127,0.04);border:1px solid rgba(127,255,127,0.15);
                    border-radius:10px;cursor:pointer;margin-bottom:1.25rem;
                    transition:border-color 0.2s;">
        <input type="checkbox" id="attention-check"
               style="width:18px;height:18px;accent-color:var(--green);flex-shrink:0;margin-top:1px;cursor:pointer;"
               onchange="
                 const btn = document.getElementById('attention-confirm-btn');
                 const lbl = document.getElementById('attention-label');
                 btn.disabled = !this.checked;
                 btn.style.opacity = this.checked ? '1' : '0.4';
                 btn.style.cursor  = this.checked ? 'pointer' : 'not-allowed';
                 lbl.style.borderColor = this.checked ? 'rgba(127,255,127,0.5)' : 'rgba(127,255,127,0.15)';
               ">
        <span style="font-size:0.8rem;color:var(--white2);line-height:1.55;">
          I have reviewed the available market information, I understand that staked tokens
          can be lost, and I am placing this prediction based on my own
          <strong style="color:var(--white);">research and informed judgement.</strong>
        </span>
      </label>

      <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--white3);
                  text-align:center;margin-bottom:1.25rem;line-height:1.5;">
        CrowdVerse tokens have no monetary value.<br>
        This is a skill-based prediction game. 18+ only.
      </div>

      <div style="display:flex;gap:0.6rem;">
        <button onclick="
                  document.getElementById('attention-overlay').remove();
                  window._attentionResolve && window._attentionResolve(false);"
                style="flex:1;padding:0.8rem;background:transparent;
                       border:1px solid var(--border2);border-radius:8px;
                       color:var(--white3);font-size:0.875rem;cursor:pointer;transition:all 0.2s;"
                onmouseover="this.style.borderColor='var(--white3)';this.style.color='var(--white)'"
                onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--white3)'">
          ← Go Back
        </button>
        <button id="attention-confirm-btn"
                disabled
                onclick="
                  document.getElementById('attention-overlay').remove();
                  window._attentionResolve && window._attentionResolve(true);"
                style="flex:2;padding:0.8rem;background:var(--green);color:var(--black);
                       border:none;border-radius:8px;font-size:0.875rem;font-weight:700;
                       cursor:not-allowed;opacity:0.4;transition:all 0.2s;">
          ✓ Confirm &amp; Place Prediction
        </button>
      </div>
    `;

    window._attentionResolve = resolve;

    const modal = document.querySelector('#polymarket-vote-modal .modal');
    if (modal) {
      modal.style.position = 'relative';
      modal.appendChild(overlay);
    } else {
      document.body.appendChild(overlay);
    }
  });
}

// ── Inject CSS ────────────────────────────────────────────────────────
(function injectGroqStyles() {
  if (document.getElementById('groq-styles')) return;
  const s = document.createElement('style');
  s.id = 'groq-styles';
  s.textContent = `
    #groq-context-panel {
      margin: 0 1.5rem;
      padding: 0.9rem 1rem;
      background: rgba(127,255,127,0.035);
      border: 1px solid rgba(127,255,127,0.12);
      border-radius: 10px;
    }
    .groq-skeleton {
      background: linear-gradient(
        90deg, var(--white1) 25%, var(--dark2) 50%, var(--white1) 75%
      );
      background-size: 200% 100%;
      animation: groqShimmer 1.4s infinite;
      border-radius: 4px;
      margin-bottom: 5px;
    }
    @keyframes groqShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes attentionIn {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(s);
})();
