// =============================================================
// PIP.EXE — Visits Edge Function
// Handles POST /api/visits — idempotent visit recording.
// Deployed to Supabase Edge Functions.
// =============================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

async function hashSessionId(sessionId: string): Promise<string> {
  const data = new TextEncoder().encode('pip-dream-session:' + sessionId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { db: { schema: 'public' }, auth: { persistSession: false } },
  );

  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders() });
  }

  const isVisitsPath = path === '/visits' || path === '/api/visits' || path === '/' || path.endsWith('/visits');

  if (isVisitsPath && method === 'GET') {
    const { data: countData } = await supabase
      .from('visitor_count')
      .select('count')
      .eq('id', 'total')
      .single();
    const total = Number(countData?.count ?? 0);
    return new Response(
      JSON.stringify({ total, success: true }),
      { status: 200, headers: { ...corsHeaders(), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
    );
  }

  if (isVisitsPath && method === 'POST') {
    let sessionId = '';
    const contentLength = Number(req.headers.get('content-length') ?? 0);
    if (contentLength > 0 && contentLength <= 64 * 1024) {
      try {
        const input = await req.json();
        const obj = (input ?? {}) as Record<string, unknown>;
        if (typeof obj.sessionId === 'string' && obj.sessionId.trim().length > 0) {
          sessionId = obj.sessionId.trim();
        }
      } catch {
        // Fall back to anonymous session
      }
    }

    if (!sessionId) {
      sessionId = 'anon_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    }

    const sessionHash = await hashSessionId(sessionId);

    // Idempotent insert: try to insert, if conflict, it already existed
    const { error: insertError } = await supabase
      .from('visits')
      .insert({ session_hash: sessionHash })
      .select();

    // Even if insert fails due to unique constraint (already visited),
    // we still return success — the visit is recorded idempotently.
    if (insertError && insertError.code !== '23505') {
      return new Response(
        JSON.stringify({ total: 0, error: 'Could not record your visit right now.' }),
        { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
      );
    }

    // Fetch updated total
    const { data: countData } = await supabase
      .from('visitor_count')
      .select('count')
      .eq('id', 'total')
      .single();

    const total = Number(countData?.count ?? 0);
    return new Response(
      JSON.stringify({
        total,
        success: true,
        data: { counted: !insertError, total },
      }),
      { status: 200, headers: { ...corsHeaders(), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
    );
  }

  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
  );
});
