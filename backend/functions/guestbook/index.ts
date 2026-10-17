// =============================================================
// PIP.EXE — Guestbook Edge Function
// Handles GET (list entries) and POST (create entry) for /api/guestbook.
// Deployed to Supabase Edge Functions.
//
// Environment variables (auto-provided by Supabase):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// =============================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const MAX_NICKNAME_LENGTH = 24;
const MAX_MESSAGE_LENGTH = 180;
const MAX_ENTRIES = 30;
const RATE_LIMIT_WINDOW_MS = 5000;

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };
}

function validateGuestbook(input: unknown): { valid: boolean; error?: string } {
  if (typeof input !== 'object' || input === null) {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }
  const obj = input as Record<string, unknown>;

  // Honeypot
  const honeypot = obj.website;
  if (honeypot !== undefined && honeypot !== null && honeypot !== '') {
    return { valid: false, error: 'Spam detected.' };
  }
  if (typeof obj.nickname !== 'string') return { valid: false, error: 'Nickname must be a string.' };
  if (typeof obj.message !== 'string') return { valid: false, error: 'Message must be a string.' };

  const nickname = obj.nickname.trim();
  const message = obj.message.trim();
  if (nickname.length === 0) return { valid: false, error: 'Name is required.' };
  if (message.length === 0) return { valid: false, error: 'Message is required.' };
  if (nickname.length > MAX_NICKNAME_LENGTH) {
    return { valid: false, error: `Name must be ${MAX_NICKNAME_LENGTH} characters or fewer.` };
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` };
  }
  return { valid: true };
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

  const isGuestbookPath = path === '/guestbook' || path === '/api/guestbook' || path === '/' || path.endsWith('/guestbook');
  if (isGuestbookPath) {
    // ── GET: List entries ──
    if (method === 'GET') {
      const limitParam = url.searchParams.get('limit');
      const parsedLimit = limitParam ? Number(limitParam) : NaN;
      const limit = Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_ENTRIES)
        : MAX_ENTRIES;

      const { data, error } = await supabase
        .from('guestbook_entries')
        .select('id, nickname, message, created_at, status')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: 'Pip is having trouble reading the dream mailbox.' }),
          { status: 500, headers: corsHeaders() },
        );
      }
      return new Response(
        JSON.stringify({ success: true, data: { entries: data ?? [] } }),
        { status: 200, headers: corsHeaders() },
      );
    }

    // ── POST: Create entry ──
    if (method === 'POST') {
      const contentLength = Number(req.headers.get('content-length') ?? 0);
      if (contentLength > 64 * 1024) {
        return new Response(
          JSON.stringify({ success: false, error: 'Payload too large.' }),
          { status: 413, headers: corsHeaders() },
        );
      }

      let input: unknown;
      try {
        input = await req.json();
      } catch {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid JSON body.' }),
          { status: 400, headers: corsHeaders() },
        );
      }

      const validation = validateGuestbook(input);
      if (!validation.valid) {
        return new Response(
          JSON.stringify({ success: false, error: validation.error }),
          { status: 400, headers: corsHeaders() },
        );
      }

      const obj = input as Record<string, unknown>;
      const nickname = (obj.nickname as string).trim().slice(0, MAX_NICKNAME_LENGTH);
      const message = (obj.message as string).trim().slice(0, MAX_MESSAGE_LENGTH);

      // Rate limit: count entries in the last 5 seconds (global simple guard)
      const now = new Date();
      const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);
      const { count: recentCount, error: countError } = await supabase
        .from('guestbook_entries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', windowStart.toISOString());

      if (!countError && (recentCount ?? 0) > 10) {
        return new Response(
          JSON.stringify({ success: false, error: 'Slow down — Pip can only pin a few notes at a time.' }),
          { status: 429, headers: corsHeaders() },
        );
      }

      const { data: entry, error: insertError } = await supabase
        .from('guestbook_entries')
        .insert({ nickname, message, status: 'published' })
        .select('id, nickname, message, created_at, status')
        .single();

      if (insertError) {
        return new Response(
          JSON.stringify({ success: false, error: 'The dream mailbox is sleepy. Your note hasn\'t been posted yet.' }),
          { status: 500, headers: corsHeaders() },
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: entry }),
        { status: 201, headers: corsHeaders() },
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders() },
    );
  }

  return new Response(
    JSON.stringify({ success: false, error: 'Not found' }),
    { status: 404, headers: corsHeaders() },
  );
});
