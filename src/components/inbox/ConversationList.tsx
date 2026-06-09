import { Search, RefreshCw, Mail, MailOpen, Archive, MessageSquare } from 'lucide-react';
import { Conversation } from '../../types/supabase';
import { FilterMode } from './InboxPage';

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  filter: FilterMode;
  onFilterChange: (v: FilterMode) => void;
  onRefresh: () => void;
}

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: 'all', label: 'Όλα' },
  { key: 'new', label: 'Νέα' },
  { key: 'replied', label: 'Απαντημένα' },
  { key: 'archived', label: 'Αρχείο' },
];

export default function ConversationList({ conversations, selectedId, onSelect, search, onSearchChange, filter, onFilterChange, onRefresh }: Props) {
  return (
    <div className="w-[380px] shrink-0 border-r border-gray-800/50 flex flex-col bg-gray-950/50">
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Εισερχόμενα</h2>
          <button onClick={onRefresh} className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Αναζήτηση..." className="input pl-9 text-sm" />
        </div>
        <div className="flex gap-1 mt-3">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                filter === f.key ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <MailOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Δεν υπάρχουν εισερχόμενα μηνύματα</p>
          </div>
        ) : (
          conversations.map(conv => {
            const isSelected = selectedId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-800/30 transition-colors hover:bg-gray-900/50 ${
                  isSelected ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      conv.status === 'archived' ? 'bg-gray-800 text-gray-500' : 'bg-blue-600/20 text-blue-400'
                    }`}>
                      {conv.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${isSelected ? 'text-blue-300' : 'text-gray-200'}`}>{conv.name}</p>
                      <p className="text-xs text-gray-500 truncate">{conv.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {conv.status === 'active' && (
                      <span className="size-2 rounded-full bg-blue-500" />
                    )}
                    <span className="text-[11px] text-gray-600 whitespace-nowrap">
                      {timeAgo(conv.last_message_at)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
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
  if (days < 7) return `${days}η`;
  return new Date(dateStr).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' });
}
