import { useEffect, useState, useCallback } from 'react';
import { Save, Plus, RefreshCw, GripVertical, HelpCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getCurrentContentClient } from '../../../lib/multiProjectClient';
import { useTenant } from '../../../lib/useTenant';
import { withTenant } from '../../../lib/useTenantQuery';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Προσχέδιο' },
  { value: 'review', label: 'Υπό αξιολόγηση' },
  { value: 'published', label: 'Δημοσιευμένο' },
];

const EMPTY = { question: '', answer: '', sort_order: 0, status: 'draft' as string };

export default function FAQCRUD() {
  const { effectiveTenantId } = useTenant();
  const db = getCurrentContentClient();
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  const load = useCallback(async () => {
    if (!effectiveTenantId) return;
    setLoading(true);
    const { data } = await withTenant(db.from('faq_entries').select('*').order('sort_order', { ascending: true }), effectiveTenantId);
    setItems(data || []); setLoading(false); setEditing(null); setError(null);
  }, [effectiveTenantId]);

  useEffect(() => { load(); }, [load]);
  const updateForm = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const startNew = () => { setForm({ ...EMPTY, sort_order: (items.length + 1) * 10 }); setEditing('new'); setError(null); };
  const startEdit = (e: any) => { setForm({ question: e.question, answer: e.answer, sort_order: e.sort_order || 0, status: e.status || 'draft' }); setEditing(e.id); setError(null); };
  const cancel = () => { setEditing(null); setForm({ ...EMPTY }); setError(null); };

  const validate = () => { if (!form.question.trim()) return 'Η ερώτηση είναι υποχρεωτική'; if (!form.answer.trim()) return 'Η απάντηση είναι υποχρεωτική'; return null; };

  const handleSave = async () => {
    const ve = validate(); if (ve) { setError(ve); return; }
    if (!effectiveTenantId) { setError('Δεν βρέθηκε tenant'); return; }
    setSaving(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { tenant_id: effectiveTenantId, question: form.question.trim(), answer: form.answer.trim(), sort_order: form.sort_order || 0, status: form.status || 'draft' };

    try {
      if (editing === 'new') {
        const { data: c, error: ie } = await db.from('faq_entries').insert(payload).select().single();
        if (ie) throw new Error(ie.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'faq_entries', record_id: c.id, entity_name: c.question?.slice(0, 50), operation: 'create', snapshot_before: null, snapshot_after: { question: c.question?.slice(0, 50) }, summary: `Δημιουργία FAQ`, user_id: user?.id || null });
      } else {
        const { data: u, error: ue } = await db.from('faq_entries').update(payload).eq('id', editing).eq('tenant_id', effectiveTenantId).select().single();
        if (ue) throw new Error(ue.message);
        await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'faq_entries', record_id: editing, entity_name: u.question?.slice(0, 50), operation: 'update', snapshot_before: null, snapshot_after: { question: u.question?.slice(0, 50) }, summary: `Ενημέρωση FAQ`, user_id: user?.id || null });
      }
      await load();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Διαγραφή FAQ;')) return;
    setDeleting(id);
    const { data: { user } } = await supabase.auth.getUser();
    const entry = items.find(e => e.id === id);
    await db.from('faq_entries').delete().eq('id', id).eq('tenant_id', effectiveTenantId);
    await supabase.from('content_history').insert({ tenant_id: effectiveTenantId, table_name: 'faq_entries', record_id: id, operation: 'delete', snapshot_before: { question: entry?.question?.slice(0, 50) }, snapshot_after: null, summary: `Διαγραφή FAQ`, user_id: user?.id || null });
    setDeleting(null); await load();
  };

  const inputCls = "w-full rounded-lg border border-gray-700/50 bg-gray-900/50 px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors";

  if (loading) return <div className="text-gray-500 text-sm p-6">Φόρτωση...</div>;

  if (editing) return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{editing === 'new' ? 'Νέα ερώτηση' : 'Επεξεργασία'}</h2>
        <div className="flex gap-2"><button onClick={cancel} className="rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:text-white">Ακύρωση</button><button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40"><Save size={14} /> {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</button></div>
      </div>
      {error && <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-300">FAQ</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5"><label className="text-xs text-gray-500">Ερώτηση *</label><textarea value={form.question} onChange={e => updateForm('question', e.target.value)} rows={2} className={inputCls + ' resize-none'} /></div>
            <div className="sm:col-span-2 space-y-1.5"><label className="text-xs text-gray-500">Απάντηση *</label><textarea value={form.answer} onChange={e => updateForm('answer', e.target.value)} rows={6} className={inputCls + ' resize-none'} /></div>
            <div className="space-y-1.5"><label className="text-xs text-gray-500">Κατάσταση</label>
              <select value={form.status} onChange={e => updateForm('status', e.target.value)} className={inputCls}>{STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
            </div>
            <div className="space-y-1.5"><label className="text-xs text-gray-500">Σειρά</label><input type="number" value={form.sort_order} onChange={e => updateForm('sort_order', parseInt(e.target.value) || 0)} className={inputCls} /></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-white">FAQ</h2><p className="text-sm text-gray-500">Συχνές ερωτήσεις</p></div>
        <button onClick={startNew} className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500"><Plus size={14} /> Νέα ερώτηση</button>
      </div>
      {items.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-12 text-center">
          <HelpCircle size={32} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-500">Δεν υπάρχουν καταχωρημένες ερωτήσεις.</p>
          <button onClick={startNew} className="mt-4 text-xs text-blue-400">+ Προσθέστε την πρώτη</button>
        </div>
      ) : (
        <div className="space-y-2">{items.map(e => (
          <div key={e.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900/30 px-4 py-3 hover:border-gray-700 group">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <GripVertical size={16} className="text-gray-700 shrink-0 opacity-0 group-hover:opacity-100" />
              <p className="text-sm text-white truncate">{e.question}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${e.status === 'published' ? 'bg-green-900/30 text-green-400' : e.status === 'review' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-500'}`}>{e.status}</span>
              <button onClick={() => startEdit(e)} className="text-xs text-gray-500 hover:text-white px-2 py-1">Επεξεργασία</button>
              <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id} className="text-xs text-red-500 hover:text-red-400 px-2 py-1 disabled:opacity-40">{deleting === e.id ? '...' : 'Διαγραφή'}</button>
            </div>
          </div>
        ))}</div>
      )}
    </div>
  );
}
