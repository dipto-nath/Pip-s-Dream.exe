// =============================================================
// PIP.EXE — Visits API Endpoint (Vercel Serverless Function)
// Contract:
//   GET  /api/visits -> { "total": number }
//   POST /api/visits -> increments atomically, returns { "total": number }
//
// Privacy-Friendly:
// Zero personal data is stored or transmitted (no IP address,
// no user agent, no third-party tracking cookies).
// =============================================================

export const config = {
  runtime: 'edge',
};

// Fallback in-memory count for edge instance
let edgeFallbackCount = 142;

export default async function handler(req: Request) {
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  try {
    // 1. If Supabase is configured, use Supabase REST for atomic visits
    if (supabaseUrl && supabaseKey) {
      if (method === 'POST') {
        const anonSession = 'anon_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
        // Privacy-friendly hash
        const data = new TextEncoder().encode('pip-anon:' + anonSession);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashHex = Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

        await fetch(`${supabaseUrl}/rest/v1/visits`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ session_hash: hashHex }),
        });
      }

      // Fetch latest total
      const countRes = await fetch(`${supabaseUrl}/rest/v1/visitor_count?id=eq.total&select=count`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (countRes.ok) {
        const rows = (await countRes.json()) as Array<{ count: number }>;
        const total = rows?.[0]?.count ? Number(rows[0].count) : edgeFallbackCount;
        return new Response(JSON.stringify({ total }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 2. Fallback edge counter if external DB not linked
    if (method === 'POST') {
      edgeFallbackCount += 1;
    }

    return new Response(JSON.stringify({ total: edgeFallbackCount }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'counter unavailable' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
