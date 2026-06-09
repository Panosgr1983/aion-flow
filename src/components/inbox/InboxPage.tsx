import { useEffect, useState, useCallback } from 'react';
import { conversationsHelper, contactMessagesHelper } from '../../lib/dataHelpers';
import { Conversation, ContactMessage } from '../../types/supabase';
import ConversationList from './ConversationList';
import ThreadView from './ThreadView';

export type FilterMode = 'all' | 'new' | 'replied' | 'archived';

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [thread, setThread] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');

  const loadConversations = useCallback(async () => {
    setLoading(true);
    const data = await conversationsHelper.getAll();
    setConversations(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const selectConversation = async (id: string) => {
    setSelectedConv(id);
    const msgs = await contactMessagesHelper.getByConversation(id);
    setThread(msgs);

    msgs.forEach(m => {
      if (m.status === 'new') contactMessagesHelper.markRead(m.id);
    });
  };

  const filtered = conversations.filter(c => {
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
    if (filter === 'new') {
      const hasNew = thread.find(m => m.conversation_id === c.id && m.status === 'new');
      if (!hasNew) return false;
    }
    if (filter === 'replied') return c.status === 'active' && conversations.find(cc => cc.id === c.id) !== undefined;
    if (filter === 'archived') return c.status === 'archived';
    if (filter === 'all' && c.status === 'archived') return false;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-0 -m-6">
      <ConversationList
        conversations={filtered}
        selectedId={selectedConv}
        onSelect={selectConversation}
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        onRefresh={loadConversations}
      />
      <ThreadView
        conversation={conversations.find(c => c.id === selectedConv) || null}
        thread={thread}
      />
    </div>
  );
}
