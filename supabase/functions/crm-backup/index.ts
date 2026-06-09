import { createClient } from 'npm:@supabase/supabase-js@2';

const TABLES = ['services', 'blog_posts', 'testimonials', 'credentials', 'core_values', 'site_settings', 'contact_messages', 'contact_conversations', 'follow_up_tasks'];

const RETENTION: Record<string, { days: number }> = {
  daily: { days: 30 },
  weekly: { days: 84 },
  manual: { days: 99999 },
};

Deno.serve(async (req) => {
  try {
    const { type = 'manual' } = await req.json().catch(() => ({ type: 'manual' }));
    if (!['manual', 'daily', 'weekly'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Create job record
    const { data: job, error: jobErr } = await supabase
      .from('backup_jobs')
      .insert({ type, status: 'running' })
      .select()
      .single();

    if (jobErr) throw new Error(`Failed to create job: ${jobErr.message}`);
    const jobId = job.id;

    try {
      // Snapshot all tables
      const snapshot: Record<string, unknown> = {};
      let totalBytes = 0;

      for (const table of TABLES) {
        const { data, error } = await supabase.from(table).select('*');
        if (error && error.code !== 'PGRST116') {
          console.warn(`Table ${table} not accessible, skipping`);
        }
        snapshot[table] = data || [];
        totalBytes += new TextEncoder().encode(JSON.stringify(data || [])).length;
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      const { data: backup, error: bkErr } = await supabase
        .from('content_backups')
        .insert({
          tenant_id: '00000000-0000-0000-0000-000000000001',
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Backup ${dateStr}`,
          snapshot,
          snapshot_version: 1,
          size_bytes: totalBytes,
          user_id: userId,
        })
        .select()
        .single();

      if (bkErr) throw new Error(`Failed to save backup: ${bkErr.message}`);

      // Update job as success
      await supabase
        .from('backup_jobs')
        .update({ status: 'success', backup_id: backup.id, size_bytes: totalBytes, completed_at: new Date().toISOString() })
        .eq('id', jobId);

      // Retention cleanup
      const retentionDays = RETENTION[type].days;
      const cutoff = new Date(Date.now() - retentionDays * 86400000).toISOString();

      const { data: oldBackups } = await supabase
        .from('backup_jobs')
        .select('backup_id')
        .eq('type', type)
        .eq('status', 'success')
        .lt('created_at', cutoff);

      if (oldBackups && oldBackups.length > 0) {
        const oldIds = oldBackups.map(b => b.backup_id).filter(Boolean);
        if (oldIds.length > 0) {
          await supabase.from('content_backups').delete().in('id', oldIds);
          await supabase.from('backup_jobs').delete().eq('type', type).lt('created_at', cutoff);
        }
      }

      return new Response(JSON.stringify({ ok: true, backup_id: backup.id, size: totalBytes }), { status: 200 });

    } catch (err: any) {
      // Mark job as failed
      await supabase
        .from('backup_jobs')
        .update({ status: 'failed', error_message: err.message, completed_at: new Date().toISOString() })
        .eq('id', jobId);

      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
