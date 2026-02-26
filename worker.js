// Cloudflare Worker for Groq API Proxy
// Handles CORS and forwards requests to Groq API

const GROQ_API_KEY = 'YOUR_GROQ_API_KEY'; // Set via Cloudflare dashboard

// CORS headers to allow requests from your domain
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins (or specify 'https://crowdverse.in')
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      const { question, category, marketId } = await request.json();
      
      if (!question) {
        return new Response(JSON.stringify({ error: 'Missing question' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Build prompt
      const safeQuestion = question.replace(/[<"'>]/g, '');
      const safeCategory = (category || 'General').replace(/[<"'>]/g, '').slice(0, 50);
      
      const prompt = `You are a concise research briefing assistant for CrowdVerse, an Indian prediction market platform.\n\nThe user is about to make a prediction on:\n"${safeQuestion}"\nCategory: ${safeCategory}\n\nWrite a tight 3-4 sentence briefing covering:\n• Relevant background / context the user should know\n• Key factors or signals that could influence this outcome\n• Any recent trend worth noting (based on your knowledge)\n\nRules: Be factual and neutral. Never make a direct prediction. Tailor context to an Indian audience where applicable. Keep it scannable.`;

      // Call Groq API
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GROQ_KEY || GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 220,
          temperature: 0.25
        })
      });

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        console.error('Groq error:', groqRes.status, errText);
        return new Response(JSON.stringify({ error: 'AI service error' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await groqRes.json();
      const context = data.choices?.[0]?.message?.content?.trim();

      if (!context) {
        return new Response(JSON.stringify({ error: 'Empty response' }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ context }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (e) {
      console.error('Worker error:', e);
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
