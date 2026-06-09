import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { conversationsHelper, contactMessagesHelper } from '../../lib/dataHelpers';
import { Conversation, ContactMessage } from '../../types/supabase';
import ConversationList from './ConversationList';
import ThreadView from './ThreadView';
import HealthPanel from './HealthPanel';

export type FilterMode = 'all' | 'new' | 'replied' | 'archived';

export default function InboxPage() {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [showHealth, setShowHealth] = useState(false);
  const [thread, setThread] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');

  const loadConversations = useCallback(async () => {
    setLoading(true);
    const data = await conversationsHelper.getAll();
    setConversations(data);
    setLoading(false);
    const convParam = searchParams.get('conv');
    if (convParam && !selectedConv) {
      const match = data.find(c => c.id === convParam);
      if (match) {
        setSelectedConv(match.id);
        const msgs = await contactMessagesHelper.getByConversation(match.id);
        setThread(msgs);
        for (const m of msgs) {
          if (m.status === 'new') contactMessagesHelper.markRead(m.id).catch(() => {});
        }
      }
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    const convParam = searchParams.get('conv');
    if (convParam && conversations.length > 0 && !selectedConv) {
      const match = conversations.find(c => c.id === convParam);
      if (match) selectConversation(match.id);
    }
  }, [conversations, searchParams, selectedConv]);

  const refreshThread = useCallback(async () => {
    if (!selectedConv) return;
    const msgs = await contactMessagesHelper.getByConversation(selectedConv);
    setThread(msgs);
    await loadConversations();
  }, [selectedConv, loadConversations]);

  const selectConversation = async (id: string) => {
    setSelectedConv(id);
    const msgs = await contactMessagesHelper.getByConversation(id);
    setThread(msgs);
    for (const m of msgs) {
      if (m.status === 'new') contactMessagesHelper.markRead(m.id).catch(() => {});
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault();
        const idx = conversations.findIndex(c => c.id === selectedConv);
        if (e.key === 'j' && idx < conversations.length - 1) selectConversation(conversations[idx + 1].id);
        if (e.key === 'k' && idx > 0) selectConversation(conversations[idx - 1].id);
      }
      if (e.key === 'r' && selectedConv) {
        e.preventDefault();
        const replyEl = document.querySelector('textarea');
        replyEl?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [conversations, selectedConv]);

  const handleDeleteConversation = async (id: string) => {
    const msgs = await contactMessagesHelper.getByConversation(id);
    for (const m of msgs) await contactMessagesHelper.delete(m.id);
    if (selectedConv === id) { setSelectedConv(null); setThread([]); }
    await conversationsHelper.delete(id);
    await loadConversations();
  };

  const handleArchiveConversation = async (id: string) => {
    const msgs = await contactMessagesHelper.getByConversation(id);
    for (const m of msgs) await contactMessagesHelper.archive(m.id);
    if (selectedConv === id) { setSelectedConv(null); setThread([]); }
    await conversationsHelper.update(id, { status: 'archived' } as any);
    await loadConversations();
  };

  const deleteConversations = async (ids: string[]) => {
    for (const id of ids) {
      const msgs = await contactMessagesHelper.getByConversation(id);
      for (const m of msgs) await contactMessagesHelper.delete(m.id);
      if (selectedConv === id) { setSelectedConv(null); setThread([]); }
      await conversationsHelper.delete(id);
    }
    await loadConversations();
  };

  const archiveConversations = async (ids: string[]) => {
    for (const id of ids) {
      const msgs = await contactMessagesHelper.getByConversation(id);
      for (const m of msgs) await contactMessagesHelper.archive(m.id);
      if (selectedConv === id) { setSelectedConv(null); setThread([]); }
      await conversationsHelper.update(id, { status: 'archived' } as any);
    }
    await loadConversations();
  };

  const filtered = conversations.filter(c => {
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
    if (filter === 'all') return c.status !== 'archived';
    if (filter === 'new' || filter === 'replied' || filter === 'read') {
      if (c.status === 'archived') return false;
      if (filter === 'new' && c.status !== 'active') return false;
    }
    if (filter === 'archived') return c.status === 'archived';
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
        onHealthClick={() => setShowHealth(true)}
        onDeleteConversation={handleDeleteConversation}
        onArchiveConversation={handleArchiveConversation}
        onDeleteSelected={deleteConversations}
        onArchiveSelected={archiveConversations}
      />
      <HealthPanel open={showHealth} onClose={() => setShowHealth(false)} />
      <ThreadView
        conversation={conversations.find(c => c.id === selectedConv) || null}
        thread={thread}
        onThreadUpdate={refreshThread}
      />
    </div>
  );
}
