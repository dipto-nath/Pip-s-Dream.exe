// =============================================================
// PIP.EXE — Stats Edge Function
// Handles GET /api/stats — returns visitor count and other stats.
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
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { db: { schema: 'public' }, auth: { persistSession: false } },
  );

  const url = new URL(req.url);
  const path = url.pathname;

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders() });
  }

  const isStatsPath = path === '/stats' || path === '/api/stats' || path === '/' || path.endsWith('/stats');
  if (isStatsPath && req.method === 'GET') {
    const { data, error } = await supabase
      .from('visitor_count')
      .select('count')
      .eq('id', 'total')
      .single();

    if (error) {
      // Return a degraded response with zero count
      return new Response(
        JSON.stringify({ success: true, data: { total_visits: 0 } }),
        { status: 200, headers: corsHeaders() },
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: { total_visits: Number(data?.count ?? 0) } }),
      { status: 200, headers: corsHeaders() },
    );
  }

  return new Response(
    JSON.stringify({ success: false, error: 'Not found' }),
    { status: 404, headers: corsHeaders() },
  );
});
