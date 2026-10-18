// =============================================================
// PIP.EXE — Health Edge Function
// Handles GET /api/health — reports backend availability.
// Does NOT expose internal config, secrets, or connection strings.
// Deployed to Supabase Edge Functions.
// =============================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };
}

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders() });
  }

  const isHealthPath = path === '/health' || path === '/api/health' || path === '/' || path.endsWith('/health');
  if (isHealthPath && req.method === 'GET') {
    const checks: Record<string, boolean> = {};

    // Check database connectivity with a trivial query
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { db: { schema: 'public' }, auth: { persistSession: false } },
      );
      const { error } = await supabase.from('visitor_count').select('count').limit(1);
      checks.database = !error;
    } catch {
      checks.database = false;
    }

    const allOk = Object.values(checks).every(Boolean);

    return new Response(
      JSON.stringify({
        success: allOk,
        data: {
          status: allOk ? 'ok' : 'degraded',
          timestamp: new Date().toISOString(),
          checks,
        },
      }),
      { status: allOk ? 200 : 503, headers: corsHeaders() },
    );
  }

  return new Response(
    JSON.stringify({ success: false, error: 'Not found' }),
    { status: 404, headers: corsHeaders() },
  );
});
