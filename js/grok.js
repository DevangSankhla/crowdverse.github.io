// ─────────────────────────────────────────────────────────────────────
// groq.js — AI-powered market context via Groq API
//           + Attention confirmation overlay before staking tokens
// ─────────────────────────────────────────────────────────────────────

// ── In-session cache so we don't hammer the API ──────────────────────
const _groqContextCache = {};

// ── Fetch AI context for a market question ────────────────────────────
async function fetchMarketContext(marketId, question, category) {
  if (_groqContextCache[marketId]) return _groqContextCache[marketId];

  if (!groqApiKey || groqApiKey === 'YOUR_GROQ_API_KEY') {
    return null; // Key not set — silently skip
  }

  try {
    const prompt =
      `You are a concise research briefing assistant for CrowdVerse, an Indian prediction market platform.\n\n` +
      `The user is about to make a prediction on:\n"${question}"\nCategory: ${category || 'General'}\n\n` +
      `Write a tight 3-4 sentence briefing covering:\n` +
      `• Relevant background / context the user should know\n` +
      `• Key factors or signals that could influence this outcome\n` +
      `• Any recent trend worth noting (based on your knowledge)\n\n` +
      `Rules: Be factual and neutral. Never make a direct prediction. ` +
      `Tailor context to an Indian audience where applicable. Keep it scannable.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 220,
        temperature: 0.25
      })
    });

    if (!res.ok) throw new Error(`Groq ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (text) {
      _groqContextCache[marketId] = text;
      return text;
    }
  } catch (e) {
    console.warn('Groq context fetch failed:', e.message);
  }
  return null;
}

// ── Inject context into the open vote modal ───────────────────────────
async function loadAndInjectContext(marketId, question, category) {
  const panel = document.getElementById('groq-context-panel');
  if (!panel) return;

  // If key not set, hide the panel entirely
  if (!groqApiKey || groqApiKey === 'YOUR_GROQ_API_KEY') {
    panel.style.display = 'none';
    return;
  }

  // Show loading skeleton
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
  panel.style.display = 'block';

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
// Called from confirmPolymarketVote() — returns a Promise<boolean>
// resolves true if user confirms, false if they cancel
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

      <!-- Summary row -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:1.25rem;">
        <div style="background:var(--dark);border:1px solid var(--border2);border-radius:8px;
                    padding:0.75rem;text-align:center;">
          <div style="font-size:0.65rem;color:var(--white3);text-transform:uppercase;
                      letter-spacing:0.06em;margin-bottom:0.25rem;">Staking</div>
          <div style="font-size:1.25rem;font-weight:800;color:var(--yellow);">
            ${amount}
          </div>
          <div style="font-size:0.65rem;color:var(--white3);">tokens</div>
        </div>
        <div style="background:var(--dark);border:1px solid rgba(127,255,127,0.2);border-radius:8px;
                    padding:0.75rem;text-align:center;">
          <div style="font-size:0.65rem;color:var(--white3);text-transform:uppercase;
                      letter-spacing:0.06em;margin-bottom:0.25rem;">If Correct</div>
          <div style="font-size:1.25rem;font-weight:800;color:var(--green);">
            +${potentialWin}
          </div>
          <div style="font-size:0.65rem;color:var(--white3);">tokens</div>
        </div>
      </div>

      <!-- Checkbox confirmation -->
      <label id="attention-label"
             style="display:flex;align-items:flex-start;gap:0.75rem;padding:1rem;
                    background:rgba(127,255,127,0.04);border:1px solid rgba(127,255,127,0.15);
                    border-radius:10px;cursor:pointer;margin-bottom:1.25rem;
                    transition:border-color 0.2s;">
        <input type="checkbox" id="attention-check"
               style="width:18px;height:18px;accent-color:var(--green);flex-shrink:0;margin-top:1px;cursor:pointer;"
               onchange="document.getElementById('attention-confirm-btn').disabled = !this.checked;
                         document.getElementById('attention-confirm-btn').style.opacity = this.checked ? '1' : '0.4';
                         document.getElementById('attention-label').style.borderColor = this.checked ? 'rgba(127,255,127,0.5)' : 'rgba(127,255,127,0.15)';">
        <span style="font-size:0.8rem;color:var(--white2);line-height:1.55;">
          I have read the available market context, understand the risks of losing these tokens,
          and I am making an <strong style="color:var(--white);">educated prediction</strong>
          based on my own research and judgement.
        </span>
      </label>

      <!-- Disclaimer -->
      <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--white3);
                  text-align:center;margin-bottom:1.25rem;line-height:1.5;">
        Tokens have no monetary value. This is a skill-based prediction game. 18+ only.
      </div>

      <!-- Action buttons -->
      <div style="display:flex;gap:0.6rem;">
        <button onclick="document.getElementById('attention-overlay').remove();
                         window._attentionResolve && window._attentionResolve(false);"
                style="flex:1;padding:0.8rem;background:transparent;border:1px solid var(--border2);
                       border-radius:8px;color:var(--white3);font-size:0.875rem;cursor:pointer;">
          Go Back
        </button>
        <button id="attention-confirm-btn"
                disabled
                onclick="document.getElementById('attention-overlay').remove();
                         window._attentionResolve && window._attentionResolve(true);"
                style="flex:2;padding:0.8rem;background:var(--green);color:var(--black);
                       border:none;border-radius:8px;font-size:0.875rem;font-weight:700;
                       cursor:not-allowed;opacity:0.4;transition:all 0.2s;">
          ✓ Confirm &amp; Place Prediction
        </button>
      </div>
    `;

    // Store resolve so inline onclick handlers can call it
    window._attentionResolve = resolve;

    // Mount inside the modal so it inherits border-radius
    const modal = document.querySelector('#polymarket-vote-modal .modal');
    if (modal) {
      modal.style.position = 'relative';
      modal.appendChild(overlay);
    } else {
      document.body.appendChild(overlay);
    }
  });
}

// ── Inject required CSS for groq panel ───────────────────────────────
(function injectGroqStyles() {
  if (document.getElementById('groq-styles')) return;
  const s = document.createElement('style');
  s.id = 'groq-styles';
  s.textContent = `
    #groq-context-panel {
      margin: 0 1.5rem 0;
      padding: 0.9rem 1rem;
      background: rgba(127,255,127,0.035);
      border: 1px solid rgba(127,255,127,0.12);
      border-radius: 10px;
    }

    .groq-skeleton {
      background: linear-gradient(90deg, var(--white1) 25%, var(--dark2) 50%, var(--white1) 75%);
      background-size: 200% 100%;
      animation: groqShimmer 1.4s infinite;
      border-radius: 4px;
    }

    @keyframes groqShimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @keyframes attentionIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(s);
})();
