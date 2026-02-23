// ─────────────────────────────────────────────────────────────────────
// functions/index.js — Firebase Cloud Function: Groq API Proxy
//
// The Groq API key NEVER touches the browser.
// Frontend calls /groqContext → this function calls Groq → returns text.
// ─────────────────────────────────────────────────────────────────────

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();

// Secret Manager — key is stored encrypted, never in code or config
const GROQ_KEY = defineSecret('GROQ_KEY');

// ── Allowed origins (add your prod domain here) ───────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost',
  'http://127.0.0.1',
  'https://crowdverse-dev1.web.app',
  'https://crowdverse-dev1.firebaseapp.com',
  // 'https://yourcustomdomain.com',  ← add yours here
];

// ── Rate limit: max 30 calls per IP per hour (in-memory, resets on cold start) ──
const _rateLimitMap = new Map();
const RATE_LIMIT    = 30;
const RATE_WINDOW   = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip) {
  const now   = Date.now();
  const entry = _rateLimitMap.get(ip) || { count: 0, windowStart: now };

  if (now - entry.windowStart > RATE_WINDOW) {
    // Reset window
    _rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count++;
  _rateLimitMap.set(ip, entry);
  return entry.count > RATE_LIMIT;
}

// ── Helper: validate origin ───────────────────────────────────────────
function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(o => origin.startsWith(o));
}

// ── Cloud Function: groqContext ───────────────────────────────────────
exports.groqContext = onRequest(
  {
    region: 'asia-south1',
    secrets: [GROQ_KEY],        // grants this function access to the secret
    cors: false,                 // we handle CORS manually below
  },
  async (req, res) => {

    // ── CORS ────────────────────────────────────────────────────────
    const origin = req.headers.origin;
    if (isAllowedOrigin(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    } else {
      res.set('Access-Control-Allow-Origin', ALLOWED_ORIGINS[2]); // fallback
    }
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, X-Firebase-AppCheck');
    res.set('Access-Control-Max-Age', '3600');

    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST')    { res.status(405).json({ error: 'Method not allowed' }); return; }

    // ── Origin gate: reject requests from unknown origins ────────────
    if (!isAllowedOrigin(origin)) {
      console.warn('Blocked origin:', origin);
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // ── Rate limiting ────────────────────────────────────────────────
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
    if (isRateLimited(ip)) {
      res.status(429).json({ error: 'Too many requests. Please wait before trying again.' });
      return;
    }

    // ── Input validation ─────────────────────────────────────────────
    const { question, category, marketId } = req.body || {};

    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Missing or invalid question' });
      return;
    }
    if (question.length > 300) {
      res.status(400).json({ error: 'Question too long' });
      return;
    }
    if (!marketId || typeof marketId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(marketId)) {
      res.status(400).json({ error: 'Invalid marketId' });
      return;
    }

    // ── Groq API key from Secret Manager ─────────────────────────────
    const groqKey = GROQ_KEY.value();
    if (!groqKey) {
      console.error('GROQ_KEY secret not found. Run: firebase functions:secrets:set GROQ_KEY');
      res.status(500).json({ error: 'AI service not configured' });
      return;
    }

    // ── Build prompt — sanitized inputs only ─────────────────────────
    const safeQuestion = question.replace(/[<>"'`]/g, '');
    const safeCategory = (category || 'General').replace(/[<>"'`]/g, '').slice(0, 50);

    const prompt =
      `You are a concise research briefing assistant for CrowdVerse, an Indian prediction market platform.\n\n` +
      `The user is about to make a prediction on:\n"${safeQuestion}"\nCategory: ${safeCategory}\n\n` +
      `Write a tight 3-4 sentence briefing covering:\n` +
      `• Relevant background / context the user should know\n` +
      `• Key factors or signals that could influence this outcome\n` +
      `• Any recent trend worth noting (based on your knowledge)\n\n` +
      `Rules: Be factual and neutral. Never make a direct prediction. ` +
      `Tailor context to an Indian audience where applicable. Keep it scannable.`;

    // ── Call Groq ─────────────────────────────────────────────────────
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({
          model:       'llama-3.1-8b-instant',
          messages:    [{ role: 'user', content: prompt }],
          max_tokens:  220,
          temperature: 0.25
        })
      });

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        console.error('Groq error:', groqRes.status, errText);
        res.status(502).json({ error: 'AI service error' });
        return;
      }

      const data    = await groqRes.json();
      const context = data.choices?.[0]?.message?.content?.trim();

      if (!context) {
        res.status(502).json({ error: 'Empty response from AI' });
        return;
      }

      res.status(200).json({ context });

    } catch (e) {
      console.error('Proxy fetch failed:', e);
      res.status(500).json({ error: 'Internal error' });
    }
  });
