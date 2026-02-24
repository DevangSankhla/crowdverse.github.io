export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    try {
      const { question, category, marketId } = await request.json();
      
      if (!question || !marketId) {
        return new Response(JSON.stringify({ error: 'Missing fields' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      const groqKey = env.GROQ_KEY;
      if (!groqKey) {
        return new Response(JSON.stringify({ error: 'Not configured' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      const safeQuestion = question.replace(/[<>'"`]/g, '').slice(0, 300);
      const safeCategory = (category || 'General').replace(/[<>'"`]/g, '').slice(0, 50);

      const prompt = `You are a concise research briefing assistant for CrowdVerse, an Indian prediction market platform.

The user is about to make a prediction on:
"${safeQuestion}"
Category: ${safeCategory}

Write a tight 3-4 sentence briefing covering:
• Relevant background / context
• Key factors that could influence this outcome
• Any recent trend worth noting

Be factual and neutral. Never make a direct prediction. Tailor to an Indian audience.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 220,
          temperature: 0.25
        })
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'AI error' }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      const data = await response.json();
      const context = data.choices?.[0]?.message?.content?.trim();

      return new Response(JSON.stringify({ context: context || 'No briefing available' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
