import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID') || '';
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';
const REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI') || '';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const url = new URL(req.url);
    const isGet = req.method === 'GET';
    const code = url.searchParams.get('code');

    // ─── Auth via GET: redirect to Google ───
    if (isGet && url.searchParams.get('action') === 'auth') {
      if (!GOOGLE_CLIENT_ID) return json({ error: 'Google OAuth not configured' }, 400);
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      return Response.redirect(authUrl.toString(), 302);
    }

    // ─── OAuth callback: GET /?code=... ───
    if (isGet && code) {
      if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return json({ error: 'Google OAuth not configured' }, 400);
      }
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });
      const tokens = await tokenRes.json();
      if (!tokens.refresh_token) {
        return json({ error: 'No refresh_token received. Try re-authorizing.' }, 400);
      }
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const profile = await profileRes.json();
      const email = profile.email || 'unknown';
      const jwt = req.headers.get('Authorization')?.replace('Bearer ', '') || '';
      const { data: { user } } = await supabase.auth.getUser(jwt);
      await supabase.from('email_accounts').insert({
        email, provider: 'gmail',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString(),
        sync_enabled: true, is_active: true,
        created_by: user?.id || null,
      });
      // Return a page that tells the user to close this tab
      return new Response(
        '<html><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#e2e8f0"><div style="text-align:center"><h2 style="color:#3b82f6">✅ Gmail Συνδεδεμένο</h2><p>Μπορείτε να κλείσετε αυτή τη σελίδα.</p></div></body></html>',
        { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', ...CORS_HEADERS } },
      );
    }

    // ─── All other actions: POST JSON ───
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    const { action } = await req.json().catch(() => ({ action: 'sync' }));

    // ─── Auth URL generation ───
    if (action === 'auth') {
      if (!GOOGLE_CLIENT_ID) return json({ error: 'Google OAuth not configured' }, 400);
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      return json({ url: authUrl.toString() });
    }

    // ─── Sync inbox ───
    if (action === 'sync') {
      const { data: accounts } = await supabase.from('email_accounts').select('*').eq('is_active', true).eq('sync_enabled', true);
      const results: { email: string; synced: number; error?: string }[] = [];
      for (const account of (accounts || [])) {
        try {
          let accessToken = account.access_token;
          if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
            const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({ refresh_token: account.refresh_token, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, grant_type: 'refresh_token' }),
            });
            const newTokens = await refreshRes.json();
            accessToken = newTokens.access_token || accessToken;
            await supabase.from('email_accounts').update({ access_token: accessToken, token_expires_at: new Date(Date.now() + (newTokens.expires_in || 3600) * 1000).toISOString() }).eq('id', account.id);
          }
          const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=is:unseen OR is:inbox after:${Math.floor(Date.now() / 1000 - 86400 * 7)}`, { headers: { Authorization: `Bearer ${accessToken}` } });
          const list = await listRes.json();
          const messages = list.messages || [];
          let synced = 0;
          for (const msg of messages) {
            const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, { headers: { Authorization: `Bearer ${accessToken}` } });
            const full = await msgRes.json();
            const headers = full.payload?.headers || [];
            const from = headers.find((h: any) => h.name === 'From')?.value || '';
            const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
            const emailMatch = from.match(/<([^>]+)>/);
            const fromEmail = emailMatch ? emailMatch[1] : from;
            const fromName = from.replace(/<[^>]+>/, '').trim() || fromEmail;
            let body = '';
            const extract = (part: any) => {
              if (part.mimeType === 'text/plain' && part.body?.data) body = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
              if (part.parts) part.parts.forEach(extract);
            };
            if (full.payload) extract(full.payload);
            if (!body || !fromEmail) continue;
            const { data: existing } = await supabase.from('contact_conversations').select('id').eq('email', fromEmail.toLowerCase()).eq('status', 'active').limit(1);
            let convId: string;
            if (existing && existing.length > 0) {
              convId = existing[0].id;
            } else {
              convId = crypto.randomUUID();
              await supabase.from('contact_conversations').insert({ id: convId, email: fromEmail.toLowerCase(), name: fromName, status: 'active', last_message_at: new Date().toISOString() });
            }
            await supabase.from('contact_messages').insert({ conversation_id: convId, name: fromName, email: fromEmail.toLowerCase(), subject, message: body, direction: 'incoming', status: 'new', attachments: [], last_message_at: new Date().toISOString() });
            await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}/modify`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ removeLabelIds: ['UNREAD'] }) });
            synced++;
          }
          await supabase.from('email_accounts').update({ last_sync_at: new Date().toISOString() }).eq('id', account.id);
          results.push({ email: account.email, synced });
        } catch (err: any) { results.push({ email: account.email, synced: 0, error: err.message }); }
      }
      return json({ ok: true, results });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (err: any) {
    return json({ error: String(err) }, 500);
  }
});
