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

  if (path === '/api/visits' && method === 'POST') {
    const contentLength = Number(req.headers.get('content-length') ?? 0);
    if (contentLength > 64 * 1024) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payload too large.' }),
        { status: 413, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
      );
    }

    let input: unknown;
    try {
      input = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body.' }),
        { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
      );
    }

    const obj = (input ?? {}) as Record<string, unknown>;
    const sessionId = obj.sessionId;

    if (typeof sessionId !== 'string' || sessionId.trim().length === 0 || sessionId.length > 256) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid session.' }),
        { status: 400, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
      );
    }

    const sessionHash = await hashSessionId(sessionId);

    // Idempotent insert: try to insert, if conflict, it already existed
    const { error: insertError } = await supabase
      .from('visits')
      .insert({ session_hash: sessionHash })
      .select();

    // Even if insert fails due to unique constraint (already visited),
    // we still return success — the visit is recorded idempotently.
    if (insertError && !insertError.message.includes('duplicate')) {
      // Genuine error
      return new Response(
        JSON.stringify({ success: false, error: 'Could not record your visit right now.' }),
        { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
      );
    }

    // Fetch updated total
    const { data: countData, error: countError } = await supabase
      .from('visitor_count')
      .select('count')
      .eq('id', 'total')
      .single();

    if (countError || !countData) {
      return new Response(
        JSON.stringify({ success: true, data: { counted: !insertError, total: 0 } }),
        { status: 200, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
      );
    }

    const total = Number(countData.count);
    return new Response(
      JSON.stringify({
        success: true,
        data: { counted: !insertError, total },
      }),
      { status: 200, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
    );
  }

  return new Response(
    JSON.stringify({ success: false, error: 'Not found' }),
    { status: 404, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
  );
});
