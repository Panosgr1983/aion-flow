import { useState } from 'react';
import { Search, RefreshCw, Mail, MailOpen, Archive, MessageSquare, Activity, Trash2, Archive as ArchiveIcon, CheckSquare, Square, AlertTriangle, Plus, Inbox, Send, FileText, Star, RotateCcw } from 'lucide-react';
import { Conversation, EmailDraft } from '../../types/supabase';
import { FolderMode, FilterMode } from './InboxPage';

interface Props {
  conversations: Conversation[];
  drafts: EmailDraft[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSelectDraft?: (draft: EmailDraft) => void;
  search: string;
  onSearchChange: (v: string) => void;
  folder: FolderMode;
  onFolderChange: (v: FolderMode) => void;
  filter: FilterMode;
  onFilterChange: (v: FilterMode) => void;
  counts: { inbox: number; sent: number; drafts: number; archive: number; trash: number; starred: number };
  onRefresh: () => void;
  onHealthClick?: () => void;
  onDeleteConversation?: (id: string) => void;
  onRestoreConversation?: (id: string) => void;
  onArchiveConversation?: (id: string) => void;
  onDeleteSelected?: (ids: string[]) => void;
  onArchiveSelected?: (ids: string[]) => void;
  onComposeClick?: () => void;
}

const FOLDERS: { key: FolderMode; icon: any; label: string }[] = [
  { key: 'inbox', icon: Inbox, label: 'Εισερχόμενα' },
  { key: 'sent', icon: Send, label: 'Απεσταλμένα' },
  { key: 'drafts', icon: FileText, label: 'Προσχέδια' },
  { key: 'archive', icon: Archive, label: 'Αρχείο' },
  { key: 'trash', icon: Trash2, label: 'Κάδος' },
];

export default function ConversationList({ conversations, drafts, selectedId, onSelect, onSelectDraft, search, onSearchChange, folder, onFolderChange, filter, onFilterChange, counts, onRefresh, onHealthClick, onDeleteConversation, onRestoreConversation, onComposeClick }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState<'delete' | null>(null);

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    if (selected.size === conversations.length) setSelected(new Set());
    else setSelected(new Set(conversations.map(c => c.id)));
  };

  const displayItems = folder === 'drafts' ? drafts : conversations;
  const isDraftMode = folder === 'drafts';

  return (
    <div className="w-[340px] shrink-0 border-r border-gray-800/50 flex flex-col bg-gray-950/50">
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">{FOLDERS.find(f => f.key === folder)?.label}</h2>
          <div className="flex gap-1">
            <button onClick={onComposeClick} className="p-1.5 text-blue-400 hover:text-blue-300 rounded-lg hover:bg-blue-500/10 transition-colors" title="Νέο Email">
              <Plus size={16} />
            </button>
            <button onClick={onHealthClick} className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800 transition-colors" title="CRM Health">
              <Activity size={14} />
            </button>
            <button onClick={onRefresh} className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800 transition-colors">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
        <div className="relative mb-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Αναζήτηση..." className="input pl-9 text-sm" />
        </div>
        <div className="flex flex-wrap gap-1">
          {FOLDERS.map(f => (
            <button
              key={f.key}
              onClick={() => onFolderChange(f.key)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                folder === f.key ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <f.icon size={12} />
              {f.label}
              {(counts[f.key as keyof typeof counts] || 0) > 0 && (
                <span className="text-[10px] bg-blue-600/30 text-blue-300 px-1 rounded-full">{counts[f.key as keyof typeof counts]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {displayItems.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <MailOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Δεν υπάρχουν {folder === 'trash' ? 'διαγραμμένα' : folder === 'drafts' ? 'προσχέδια' : folder === 'sent' ? 'απεσταλμένα' : 'μηνύματα'}</p>
          </div>
        ) : isDraftMode ? (
          drafts.map(d => (
            <button key={d.id} onClick={() => onSelectDraft?.(d)} className="w-full text-left px-4 py-3.5 border-b border-gray-800/30 transition-colors hover:bg-gray-900/50">
              <div className="flex items-center gap-2.5">
                <FileText size={14} className="text-gray-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm truncate text-gray-200">{d.subject || '(χωρίς θέμα)'}</p>
                  <p className="text-xs text-gray-500 truncate">{d.to || '—'}</p>
                </div>
              </div>
            </button>
          ))
        ) : (
          conversations.map(conv => {
            const isChecked = selected.has(conv.id);
            return (
              <div key={conv.id} className={`group flex items-start px-2 py-3 border-b border-gray-800/30 transition-colors hover:bg-gray-900/50 cursor-pointer ${isChecked ? 'bg-blue-600/5' : ''}`} onClick={() => onSelect(conv.id)}>
                <div className="p-1 text-gray-500 hover:text-gray-300 shrink-0" onClick={e => { e.stopPropagation(); toggleSelect(conv.id); }}>
                  {isChecked ? <CheckSquare size={14} className="text-blue-400" /> : <Square size={14} />}
                </div>
                <div className="flex-1 min-w-0 ml-1">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">{conv.name.charAt(0).toUpperCase()}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate text-gray-200">{conv.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{conv.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-1">
                  {folder === 'trash' ? (
                    <button onClick={e => { e.stopPropagation(); onRestoreConversation?.(conv.id); }} className="p-1 text-gray-600 hover:text-green-400 opacity-0 group-hover:opacity-100" title="Επαναφορά">
                      <RotateCcw size={12} />
                    </button>
                  ) : (
                    <button onClick={e => { e.stopPropagation(); onDeleteConversation?.(conv.id); }} className="p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100" title="Διαγραφή">
                      <Trash2 size={12} />
                    </button>
                  )}
                  <span className="text-[10px] text-gray-600 whitespace-nowrap">{timeAgo(conv.last_message_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(null)}>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center"><AlertTriangle size={20} className="text-amber-400" /></div><h3 className="text-lg font-semibold">Διαγραφή</h3></div>
            <p className="text-sm text-gray-400 mb-4">Είσαι σίγουρος ότι θέλεις να διαγράψεις {selected.size} συνομιλία/ες;</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(null)} className="btn-secondary">Ακύρωση</button>
              <button onClick={() => { onDeleteConversation?.(Array.from(selected)[0]); setShowConfirm(null); }} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 text-sm font-medium">Διαγραφή</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'τώρα';
  if (mins < 60) return `${mins}λ`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}ω`;
  const days = Math.floor(hrs / 24);
  return `${days}η`;
}
