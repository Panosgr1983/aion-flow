import { useState, useRef } from 'react';
import { Send, X, Paperclip, Mail, Plus, Trash2 } from 'lucide-react';
import { uploadFile } from '../../lib/storage';
import { contactMessagesHelper, conversationsHelper } from '../../lib/dataHelpers';
import { Attachment } from '../../types/supabase';

interface Props {
  onClose: () => void;
  onSent: () => void;
}

export default function ComposeEmail({ onClose, onSent }: Props) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!to.trim() || !message.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      const atts: Attachment[] = [];
      for (const file of attachments) {
        try {
          const url = await uploadFile(file, 'contact-attachments');
          atts.push({ name: file.name, url, size: file.size, mime_type: file.type });
        } catch {}
      }

      const existingConv = await conversationsHelper.getActiveByEmail(to.trim());
      let conversationId: string;

      if (existingConv) {
        conversationId = existingConv.id;
        await conversationsHelper.update(conversationId, { last_message_at: new Date().toISOString() } as any);
      } else {
        conversationId = crypto.randomUUID();
        await conversationsHelper.create({
          id: conversationId,
          email: to.trim(),
          name: to.trim().split('@')[0],
          phone: '',
          status: 'active',
          lead_stage: 'new',
          lead_value: 0,
          won_at: null,
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        } as any);
      }

      const msg = await contactMessagesHelper.create({
        conversation_id: conversationId,
        name: to.trim().split('@')[0],
        email: to.trim(),
        phone: '',
        subject: subject || '',
        message: message.trim(),
        direction: 'outgoing',
        status: 'read',
        parent_id: null,
        attachments: atts,
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      } as any);

      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          type: 'reply',
          to: to.trim(),
          subject: subject || '(χωρίς θέμα)',
          message: message.trim(),
          email: to.trim(),
          attachments: atts,
        }),
      }).catch(e => console.error('Email send error:', e));

      onSent();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Αποτυχία αποστολής');
    }
    setSending(false);
  };

  const removeFile = (idx: number) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="p-4 border-b border-gray-800/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Mail size={14} /> Νέο Email</h3>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-300"><X size={16} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Προς</label>
          <input value={to} onChange={e => setTo(e.target.value)} placeholder="email@example.com" className="input text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Θέμα</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Θέμα μηνύματος" className="input text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Μήνυμα</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Γράψτε το μήνυμά σας..." className="input text-sm resize-none" rows={12} />
        </div>

        {attachments.length > 0 && (
          <div className="space-y-1.5">
            {attachments.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 rounded-lg px-3 py-1.5">
                <Paperclip size={12} />
                <span className="flex-1 truncate">{f.name}</span>
                <button onClick={() => removeFile(i)} className="hover:text-red-400"><X size={12} /></button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <div className="p-4 border-t border-gray-800/50 flex items-center gap-2">
        <button onClick={() => fileRef.current?.click()} className="btn-ghost text-xs px-3 py-2">
          <Paperclip size={14} /> Συνημμένα
        </button>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={e => { if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]); }} />
        <div className="flex-1" />
        <button onClick={onClose} className="btn-secondary text-xs px-4 py-2">Ακύρωση</button>
        <button onClick={handleSend} disabled={!to.trim() || !message.trim() || sending} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
          <Send size={12} /> {sending ? 'Αποστολή...' : 'Αποστολή'}
        </button>
      </div>
    </div>
  );
}
