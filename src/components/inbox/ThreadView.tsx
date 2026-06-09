import { useState, useRef, useEffect } from 'react';
import { Mail, Phone, Clock, Archive, Trash2, Forward as ForwardIcon, Paperclip, MessageSquare, Send, X, Download, Reply as ReplyIcon } from 'lucide-react';
import { contactMessagesHelper } from '../../lib/dataHelpers';
import { uploadFile } from '../../lib/storage';
import { Conversation, ContactMessage, Attachment } from '../../types/supabase';

interface Props {
  conversation: Conversation | null;
  thread: ContactMessage[];
  onThreadUpdate?: () => void;
  onReply?: () => void;
  onForward?: () => void;
}

export default function ThreadView({ conversation, thread, onThreadUpdate, onReply, onForward }: Props) {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [forwardMode, setForwardMode] = useState(false);
  const [forwardTo, setForwardTo] = useState('');
  const [forwardText, setForwardText] = useState('');
  const [optimisticMsgs, setOptimisticMsgs] = useState<ContactMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const allMessages = [...thread, ...optimisticMsgs];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [allMessages.length]);

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm">Επιλέξτε μια συνομιλία</p>
        </div>
      </div>
    );
  }

  const incoming = allMessages.filter(m => m.direction === 'incoming');
  const lastIncomingStatus = incoming.length > 0 ? incoming[incoming.length - 1].status : null;

  const handleSendReply = async () => {
    if (!replyText.trim() || sending) return;
    const lastIncoming = [...allMessages].reverse().find(m => m.direction === 'incoming');
    if (!lastIncoming) return;

    const optimistic: ContactMessage = {
      id: `opt-${Date.now()}`,
      conversation_id: conversation.id,
      name: '', email: '', phone: '',
      subject: lastIncoming.subject.startsWith('Re:') ? lastIncoming.subject : `Re: ${lastIncoming.subject}`,
      message: replyText.trim(),
      direction: 'outgoing', status: 'read', parent_id: lastIncoming.id,
      attachments: [], last_message_at: new Date().toISOString(), created_at: new Date().toISOString(),
    };
    setOptimisticMsgs(prev => [...prev, optimistic]);

    const text = replyText.trim();
    const atts = attachments;
    setReplyText(''); setAttachments([]);

    try {
      await contactMessagesHelper.reply(lastIncoming.id, { message: text, attachments: await uploadAttachments(atts) });
      setOptimisticMsgs([]);
      onThreadUpdate?.();
    } catch (err) {
      console.error(err);
      setOptimisticMsgs(prev => prev.filter(m => m.id !== optimistic.id));
    }
  };

  const handleForward = async () => {
    if (!forwardTo.trim() || !forwardText.trim() || sending) return;
    setSending(true);
    const lastMsg = thread[thread.length - 1];
    try {
      const atts = await uploadAttachments(attachments);
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          type: 'forward', to: forwardTo.trim(),
          subject: `Fwd: ${lastMsg.subject || 'Μήνυμα'}`,
          message: forwardText.trim(), originalMessage: lastMsg.message,
          attachments: atts,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setForwardMode(false); setForwardTo(''); setForwardText(''); setAttachments([]);
    } catch (err) { console.error(err); }
    setSending(false);
  };

  const handleArchive = async () => {
    if (!conversation) return;
    for (const msg of thread) await contactMessagesHelper.archive(msg.id);
    onThreadUpdate?.();
  };

  const handleDelete = async () => {
    if (!conversation) return;
    for (const msg of thread) await contactMessagesHelper.delete(msg.id);
    onThreadUpdate?.();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (idx: number) => setAttachments(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="p-5 border-b border-gray-800/50">
        <ConversationHeader conversation={conversation} lastStatus={lastIncomingStatus} />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {allMessages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {forwardMode ? (
        <div className="border-t border-gray-800/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2"><ForwardIcon size={14} /> Forward</h3>
            <button onClick={() => setForwardMode(false)} className="text-gray-500 hover:text-gray-300"><X size={16} /></button>
          </div>
          <input value={forwardTo} onChange={e => setForwardTo(e.target.value)} placeholder="Προς: email" className="input text-sm" />
          <textarea value={forwardText} onChange={e => setForwardText(e.target.value)} placeholder="Γράψτε το μήνυμά σας..." className="input text-sm resize-none" rows={4} />
          <div className="flex gap-2 items-center">
            <button onClick={() => fileRef.current?.click()} className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1"><Paperclip size={12} /> Συνημμένα</button>
            {attachments.map((f, i) => (
              <span key={i} className="text-xs text-gray-500 flex items-center gap-1 bg-gray-800 rounded px-2 py-0.5">
                {f.name} <button onClick={() => removeFile(i)} className="hover:text-red-400"><X size={10} /></button>
              </span>
            ))}
            <div className="flex-1" />
            <button onClick={handleForward} disabled={sending} className="btn-primary text-xs px-4 py-2">
              {sending ? 'Αποστολή...' : 'Αποστολή'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 border-t border-gray-800/50">
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Γράψτε μια απάντηση..."
              className="input w-full resize-none text-sm"
              rows={2}
            />
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => fileRef.current?.click()} className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1"><Paperclip size={12} /> Συνημμένα</button>
              {attachments.map((f, i) => (
                <span key={i} className="text-xs text-gray-500 flex items-center gap-1 bg-gray-800 rounded px-2 py-0.5">
                  {f.name} <button onClick={() => removeFile(i)} className="hover:text-red-400"><X size={10} /></button>
                </span>
              ))}
              <div className="flex-1" />
              <button onClick={handleSendReply} disabled={!replyText.trim() || optimisticMsgs.length > 0} className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                <Send size={12} /> {optimisticMsgs.length > 0 ? 'Αποστολή...' : 'Αποστολή'}
              </button>
            </div>
          </div>
          <div className="px-4 pb-3 flex gap-3">
            <button onClick={onReply} className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-300 transition-colors"><ReplyIcon size={12} /> Απάντηση</button>
            <button onClick={onForward} className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-300 transition-colors"><ForwardIcon size={12} /> Forward</button>
            <button onClick={handleDelete} className="text-xs text-gray-500 flex items-center gap-1 hover:text-red-400 transition-colors"><Trash2 size={12} /> Διαγραφή</button>
            <button onClick={handleArchive} className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-300 transition-colors"><Archive size={12} /> Αρχειοθέτηση</button>
          </div>
        </>
      )}

      <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} />
    </div>
  );
}

async function uploadAttachments(files: File[]): Promise<Attachment[]> {
  if (files.length === 0) return [];
  const results: Attachment[] = [];
  for (const file of files) {
    try {
      const url = await uploadFile(file, 'contact-attachments');
      results.push({ name: file.name, url, size: file.size, mime_type: file.type });
    } catch (err) {
      console.error('Failed to upload attachment:', err);
    }
  }
  return results;
}

function ConversationHeader({ conversation, lastStatus }: { conversation: Conversation; lastStatus: string | null }) {
  const statusLabels: Record<string, { label: string; color: string }> = {
    new: { label: 'Νέο', color: 'text-blue-400' },
    replied: { label: 'Απαντημένο', color: 'text-green-400' },
    read: { label: 'Αναγνωσμένο', color: 'text-gray-500' },
    archived: { label: 'Αρχειοθετημένο', color: 'text-gray-600' },
  };
  const st = lastStatus ? statusLabels[lastStatus] || statusLabels.new : statusLabels.new;

  return (
    <div className="flex items-start justify-between flex-wrap gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">
          {conversation.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-medium text-sm text-gray-100">{conversation.name}</h3>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Mail size={11} /> {conversation.email}</span>
            {conversation.phone && <span className="flex items-center gap-1"><Phone size={11} /> {conversation.phone}</span>}
            <span className="flex items-center gap-1"><Clock size={11} /> {new Date(conversation.last_message_at).toLocaleString('el-GR')}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[11px] font-medium ${st.color}`}>{st.label}</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${
          conversation.status === 'active' ? 'bg-green-500/10 text-green-400' :
          conversation.status === 'closed' ? 'bg-gray-800 text-gray-500' :
          conversation.status === 'archived' ? 'bg-gray-800 text-gray-600' :
          'bg-red-500/10 text-red-400'
        }`}>
          {conversation.status === 'active' ? 'Ενεργή' :
           conversation.status === 'closed' ? 'Κλειστή' :
           conversation.status === 'archived' ? 'Αρχείο' : 'Spam'}
        </span>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ContactMessage }) {
  const isOptimistic = message.id.startsWith('opt-');
  const isOutgoing = message.direction === 'outgoing';

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} ${isOptimistic ? 'opacity-60' : ''}`}>
      <div className={`max-w-[75%] min-w-0 rounded-2xl px-4 py-3 ${
        isOutgoing
          ? 'bg-blue-600/20 border border-blue-500/20 rounded-tr-md'
          : 'bg-gray-800/60 border border-gray-800 rounded-tl-md'
      }`}>
        {!isOutgoing && (
          <p className="text-xs font-medium text-blue-400 mb-1">{message.name}</p>
        )}
        {message.subject && (
          <p className="text-xs text-gray-400 mb-1 font-medium">{message.subject}</p>
        )}
        <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{message.message}</p>
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700/50 space-y-1">
            {message.attachments.map((att, i) => (
              <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
                <Download size={12} /> {att.name}
              </a>
            ))}
          </div>
        )}
        <p className="text-[11px] text-gray-600 mt-1.5">
          {new Date(message.created_at).toLocaleString('el-GR')}
          {isOptimistic && <span className="text-blue-400 ml-1">• αποστολή...</span>}
        </p>
      </div>
    </div>
  );
}
