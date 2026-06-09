import { useRef, useEffect } from 'react';
import { Mail, Phone, Clock, Archive, Trash2, Forward, Reply as ReplyIcon, Paperclip, MessageSquare } from 'lucide-react';
import { Conversation, ContactMessage } from '../../types/supabase';

interface Props {
  conversation: Conversation | null;
  thread: ContactMessage[];
}

export default function ThreadView({ conversation, thread }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [thread.length]);

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

  const incoming = thread.filter(m => m.direction === 'incoming');
  const lastIncomingStatus = incoming.length > 0 ? incoming[incoming.length - 1].status : null;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="p-5 border-b border-gray-800/50">
        <ConversationHeader conversation={conversation} lastStatus={lastIncomingStatus} />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {thread.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-gray-800/50 flex items-center gap-2">
        <textarea
          placeholder="Γράψτε μια απάντηση..."
          className="input flex-1 resize-none text-sm"
          rows={2}
          disabled
        />
        <div className="flex gap-1">
          <button disabled className="p-2 text-gray-600 rounded-lg" title="Επισύναψη"><Paperclip size={16} /></button>
          <button disabled className="btn-primary text-xs px-4 py-2 opacity-50 cursor-not-allowed">Αποστολή</button>
        </div>
      </div>
      <div className="px-4 pb-3 -mt-1">
        <div className="flex gap-2">
          <button disabled className="text-xs text-gray-600 flex items-center gap-1 hover:text-gray-400 transition-colors"><Forward size={12} /> Forward</button>
          <button disabled className="text-xs text-gray-600 flex items-center gap-1 hover:text-red-400 transition-colors"><Trash2 size={12} /> Διαγραφή</button>
          <button disabled className="text-xs text-gray-600 flex items-center gap-1 hover:text-gray-400 transition-colors"><Archive size={12} /> Αρχειοθέτηση</button>
        </div>
      </div>
    </div>
  );
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
    <div className="flex items-start justify-between">
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
  const isOutgoing = message.direction === 'outgoing';

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
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
                <Paperclip size={12} /> {att.name}
              </a>
            ))}
          </div>
        )}
        <p className="text-[11px] text-gray-600 mt-1.5">{new Date(message.created_at).toLocaleString('el-GR')}</p>
      </div>
    </div>
  );
}
