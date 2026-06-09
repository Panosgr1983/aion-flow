import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, X, Paperclip, Bold, Italic, Link, ChevronDown, Mail, Plus, Trash2, Clock } from 'lucide-react';
import { uploadFile } from '../../lib/storage';
import { contactMessagesHelper, conversationsHelper, draftsHelper, siteSettingsHelper } from '../../lib/dataHelpers';
import { Attachment, EmailDraft } from '../../types/supabase';

interface Props {
  mode: 'new' | 'reply' | 'forward' | 'draft';
  prefill?: {
    to?: string;
    subject?: string;
    body?: string;
    conversation_id?: string;
    draft_id?: string;
  };
  onClose: () => void;
  onSent: () => void;
}

export default function ComposeWindow({ mode, prefill, onClose, onSent }: Props) {
  const [to, setTo] = useState(prefill?.to || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState(prefill?.subject || '');
  const [body, setBody] = useState(prefill?.body || '');
  const [signature, setSignature] = useState('');
  const [draftId, setDraftId] = useState<string | null>(prefill?.draft_id || null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval>>();
  const lastSavedRef = useRef('');

  // Load signature
  useEffect(() => {
    siteSettingsHelper.getAll().then(settings => {
      const sig = settings.find(s => s.key === 'email_signature');
      if (sig && typeof sig.value === 'string') setSignature(sig.value);
    });
  }, []);

  // Append signature if not already present
  const bodyWithSignature = useCallback((text: string) => {
    if (!signature) return text;
    if (text.includes(signature)) return text;
    return text + '\n\n' + signature;
  }, [signature]);

  // Auto-save draft every 3s
  useEffect(() => {
    autoSaveRef.current = setInterval(async () => {
      const snap = JSON.stringify({ to, cc, bcc, subject, body });
      if (snap === lastSavedRef.current) return;
      lastSavedRef.current = snap;
      if (!to && !subject && !body) return;
      try {
        const draft = await draftsHelper.save(draftId, {
          to, cc, bcc, subject, body: bodyWithSignature(body),
          conversation_id: prefill?.conversation_id || null,
          status: 'draft',
        } as any);
        if (!draftId) setDraftId(draft.id);
      } catch {}
    }, 3000);
    return () => clearInterval(autoSaveRef.current);
  }, [to, cc, bcc, subject, body, draftId, bodyWithSignature, prefill?.conversation_id]);

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    bodyRef.current?.focus();
  };

  const handleSend = async () => {
    if (!to.trim() || !body.trim() || sending) return;
    setSending(true);
    try {
      const atts: Attachment[] = [];
      for (const f of attachments) {
        try { const url = await uploadFile(f, 'contact-attachments'); atts.push({ name: f.name, url, size: f.size, mime_type: f.type }); } catch {}
      }

      const fullBody = bodyWithSignature(body);
      let conversationId = prefill?.conversation_id;

      if (!conversationId) {
        const existing = await conversationsHelper.getActiveByEmail(to.trim());
        if (existing) {
          conversationId = existing.id;
          await conversationsHelper.update(conversationId, { last_message_at: new Date().toISOString() } as any);
        } else {
          conversationId = crypto.randomUUID();
          await conversationsHelper.create({
            id: conversationId, email: to.trim(), name: to.trim().split('@')[0],
            phone: '', status: 'active', lead_stage: 'new', lead_value: 0,
            won_at: null, deleted_at: null, last_message_at: new Date().toISOString(), created_at: new Date().toISOString(),
          } as any);
        }
      }

      await contactMessagesHelper.create({
        conversation_id: conversationId, name: to.trim().split('@')[0], email: to.trim(),
        phone: '', subject: subject || '(χωρίς θέμα)', message: fullBody,
        direction: 'outgoing', status: 'read', parent_id: null,
        attachments: atts, is_starred: false, last_message_at: new Date().toISOString(), created_at: new Date().toISOString(),
      } as any);

      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ type: 'reply', to: to.trim(), subject: subject || '(χωρίς θέμα)', message: fullBody, email: to.trim(), attachments: atts }),
      }).catch(e => console.error('Send error:', e));

      if (draftId) draftsHelper.delete(draftId).catch(() => {});
      onSent();
      onClose();
    } catch (e: any) {
      console.error('Send failed:', e);
    }
    setSending(false);
  };

  const removeFile = (idx: number) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Mail size={14} />
          {mode === 'new' ? 'Νέο Email' : mode === 'reply' ? 'Απάντηση' : mode === 'forward' ? 'Προώθηση' : 'Προσχέδιο'}
        </h3>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-300"><X size={16} /></button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Προς</label>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="email@example.com" className="input text-sm" />
          </div>

          {!showCc && !showBcc && (
            <div className="flex gap-3 text-xs">
              <button onClick={() => setShowCc(true)} className="text-gray-500 hover:text-gray-300">Cc</button>
              <button onClick={() => setShowBcc(true)} className="text-gray-500 hover:text-gray-300">Bcc</button>
            </div>
          )}
          {showCc && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Cc</label>
              <input value={cc} onChange={e => setCc(e.target.value)} placeholder="cc@example.com" className="input text-sm" />
            </div>
          )}
          {showBcc && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Bcc</label>
              <input value={bcc} onChange={e => setBcc(e.target.value)} placeholder="bcc@example.com" className="input text-sm" />
            </div>
          )}

          <div>
            <label className="text-xs text-gray-500 block mb-1">Θέμα</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Θέμα μηνύματος" className="input text-sm" />
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 pb-2 flex items-center gap-0.5 border-b border-gray-800/30">
          <button onClick={() => execCmd('bold')} className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded" title="Bold"><Bold size={14} /></button>
          <button onClick={() => execCmd('italic')} className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded" title="Italic"><Italic size={14} /></button>
          <button onClick={() => { const url = prompt('Link URL:'); if (url) execCmd('createLink', url); }} className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded" title="Link"><Link size={14} /></button>
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          contentEditable
          className="p-5 text-sm text-gray-200 outline-none min-h-[200px] leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: bodyWithSignature(body).replace(/\n/g, '<br>') }}
          onInput={() => setBody(bodyRef.current?.innerText || '')}
          suppressContentEditableWarning
        />
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="px-5 py-2 border-t border-gray-800/30 space-y-1">
          {attachments.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded-lg px-3 py-1.5">
              <Paperclip size={12} />
              <span className="flex-1 truncate">{f.name}</span>
              <button onClick={() => removeFile(i)} className="hover:text-red-400"><X size={12} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-800/50 flex items-center gap-2">
        <button onClick={() => fileRef.current?.click()} className="btn-ghost text-xs px-3 py-2">
          <Paperclip size={14} /> Συνημμένα
        </button>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={e => { if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]); }} />
        <div className="flex-1" />
        <button onClick={onClose} className="btn-secondary text-xs px-4 py-2">Ακύρωση</button>
        <button onClick={handleSend} disabled={!to.trim() || !body.trim() || sending} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
          <Send size={12} /> {sending ? 'Αποστολή...' : 'Αποστολή'}
        </button>
      </div>
    </div>
  );
}
