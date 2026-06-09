import nodemailer from 'npm:nodemailer@6.9.14';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface BasePayload {
  type: 'new' | 'reply' | 'forward';
  name?: string;
  email?: string;
  phone?: string;
  message: string;
  to?: string;
  subject?: string;
  originalMessage?: string;
  attachments?: { name: string; url: string }[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  try {
    const payload: BasePayload = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const tenantId = Deno.env.get('TENANT_ID') || '00000000-0000-0000-0000-000000000001';

    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('tenant_id', tenantId)
      .in('key', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from_email', 'smtp_from_name', 'contact_email', 'site_name']);

    const map: Record<string, string> = {};
    (settings || []).forEach((s: { key: string; value: any }) => {
      map[s.key] = typeof s.value === 'string' ? s.value : String(s.value || '');
    });

    const host = map['smtp_host'];
    const port = parseInt(map['smtp_port'] || '587', 10);
    const user = map['smtp_user'];
    const pass = map['smtp_pass'];
    const fromEmail = map['smtp_from_email'] || user;
    const fromName = map['smtp_from_name'] || map['site_name'] || '';

    if (!host || !user || !pass) {
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), { status: 400, headers: CORS_HEADERS });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    let mailOptions: any;

    if (payload.type === 'reply') {
      const toEmail = map['contact_email'];
      mailOptions = {
        from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
        to: payload.to || toEmail,
        subject: payload.subject || 'Απάντηση',
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">${payload.message.replace(/\n/g, '<br>')}</div>`,
        replyTo: payload.email,
      };
    } else if (payload.type === 'forward') {
      mailOptions = {
        from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
        to: payload.to,
        subject: payload.subject || 'Προωθημένο μήνυμα',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <p>${payload.message.replace(/\n/g, '<br>')}</p>
            <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;" />
            <blockquote style="color:#6b7280;border-left:3px solid #d1d5db;padding-left:12px;margin:0;">
              ${(payload.originalMessage || '').replace(/\n/g, '<br>')}
            </blockquote>
          </div>
        `,
      };
    } else {
      // type === 'new' (contact form notification)
      const toEmail = map['contact_email'];
      if (!toEmail) return new Response(JSON.stringify({ error: 'No recipient email configured' }), { status: 400, headers: CORS_HEADERS });

      mailOptions = {
        from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
        to: toEmail,
        subject: `Νέο μήνυμα από ${payload.name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#2563eb;">Νέο μήνυμα από τη φόρμα επικοινωνίας</h2>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;width:100px;">Όνομα</td><td style="padding:8px 12px;">${payload.name}</td></tr>
              <tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Email</td><td style="padding:8px 12px;"><a href="mailto:${payload.email}">${payload.email}</a></td></tr>
              ${payload.phone ? `<tr><td style="padding:8px 12px;background:#f3f4f6;font-weight:600;">Τηλέφωνο</td><td style="padding:8px 12px;">${payload.phone}</td></tr>` : ''}
            </table>
            <div style="background:#f9fafb;padding:16px;border-radius:8px;white-space:pre-wrap;">${payload.message}</div>
            <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
            <p style="color:#9ca3af;font-size:12px;">Αυτό το email στάλθηκε αυτόματα από τη φόρμα επικοινωνίας.</p>
          </div>
        `,
        replyTo: payload.email,
      };
    }

    if (payload.attachments && payload.attachments.length > 0) {
      mailOptions.attachments = payload.attachments.map(a => ({
        filename: a.name,
        path: a.url,
      }));
    }

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS_HEADERS });
  }
});
