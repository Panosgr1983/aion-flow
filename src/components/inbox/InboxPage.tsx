/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Inbox Page (Κύρια σελίδα Inbox)
  
  Διαχειρίζεται:
    - Folders: Inbox / Sent / Drafts / Archive / Trash
    - Compose: Νέο Email / Reply / Forward / Draft
    - Search & filters
    - Bulk select & delete/archive
    - Keyboard shortcuts (j/k navigate, c compose, r reply)
    - Auto-refresh κάθε 15 δευτερόλεπτα
    - Health modal
  ═══════════════════════════════════════════════════════════════
*/

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { conversationsHelper, contactMessagesHelper, draftsHelper } from '../../lib/dataHelpers';
import { Conversation, ContactMessage, EmailDraft } from '../../types/supabase';
import ConversationList from './ConversationList';
import ThreadView from './ThreadView';
import HealthPanel from './HealthPanel';
import ComposeWindow from './ComposeWindow';

export type FolderMode = 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash' | 'starred';
export type FilterMode = 'all' | 'new' | 'replied' | 'archived';

export default function InboxPage() {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [trash, setTrash] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null);
  const [showHealth, setShowHealth] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeMode, setComposeMode] = useState<'new' | 'reply' | 'forward' | 'draft'>('new');
  const [composePrefill, setComposePrefill] = useState<any>({});
  const [thread, setThread] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState<FolderMode>('inbox');
  const [filter, setFilter] = useState<FilterMode>('all');

  // ─── Folders sidebar data ───
  const [counts, setCounts] = useState({ inbox: 0, sent: 0, drafts: 0, archive: 0, trash: 0, starred: 0 });

  const refreshCounts = useCallback(async () => {
    try {
      const [all, draftList, trashList] = await Promise.all([
        conversationsHelper.getAll(),
        draftsHelper.getDrafts(),
        conversationsHelper.getTrash(),
      ]);
      setCounts({
        inbox: all.filter(c => c.status !== 'archived').length,
        sent: all.length, // simplified
        drafts: draftList.length,
        archive: all.filter(c => c.status === 'archived').length,
        trash: trashList.length,
        starred: 0, // will load from messages
      });
    } catch {}
  }, []);

  // ─── Load data ───
  const loadConversations = useCallback(async () => {
    setLoading(true);
    const [convData, draftData] = await Promise.all([
      conversationsHelper.getAll(),
      draftsHelper.getDrafts(),
    ]);
    setConversations(convData);
    setDrafts(draftData);
    setLoading(false);
    refreshCounts();
    const convParam = searchParams.get('conv');
    if (convParam && !selectedConv) {
      const match = convData.find(c => c.id === convParam);
      if (match) { setSelectedConv(match.id); loadThread(match.id); }
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Auto-refresh every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const loadTrash = useCallback(async () => {
    setLoading(true);
    const data = await conversationsHelper.getTrash();
    setTrash(data);
    setLoading(false);
  }, []);

  const loadThread = async (id: string) => {
    const msgs = await contactMessagesHelper.getByConversation(id);
    setThread(msgs);
    for (const m of msgs) { if (m.status === 'new') contactMessagesHelper.markRead(m.id).catch(() => {}); }
  };

  const selectConversation = async (id: string) => {
    setSelectedConv(id); setSelectedDraft(null);
    await loadThread(id);
  };

  const selectDraft = (draft: EmailDraft) => {
    setSelectedDraft(draft); setSelectedConv(null);
    setShowCompose(true); setComposeMode('draft');
    setComposePrefill({ to: draft.to, subject: draft.subject, body: draft.body, draft_id: draft.id });
  };

  const refreshThread = useCallback(async () => {
    if (!selectedConv) return;
    const msgs = await contactMessagesHelper.getByConversation(selectedConv);
    setThread(msgs);
    await loadConversations();
  }, [selectedConv, loadConversations]);

  // ─── Folder switching ───
  useEffect(() => {
    if (folder === 'trash') loadTrash();
    else if (folder !== 'trash' && trash.length > 0) setTrash([]);
  }, [folder]);

  // ─── Compose handlers ───
  const openCompose = (mode: 'new' | 'reply' | 'forward' | 'draft', prefill?: any) => {
    setComposeMode(mode); setComposePrefill(prefill || {}); setShowCompose(true);
  };

  const handleReply = () => {
    if (!thread.length) return;
    const lastIncoming = [...thread].reverse().find(m => m.direction === 'incoming');
    if (!lastIncoming) return;
    openCompose('reply', {
      to: lastIncoming.email,
      subject: lastIncoming.subject.startsWith('Re:') ? lastIncoming.subject : `Re: ${lastIncoming.subject}`,
      conversation_id: lastIncoming.conversation_id,
    });
  };

  const handleForward = () => {
    const lastMsg = thread[thread.length - 1];
    if (!lastMsg) return;
    openCompose('forward', {
      subject: `Fwd: ${lastMsg.subject || 'Μήνυμα'}`,
      body: `\n\n---------- Forwarded message ----------\n${lastMsg.message}`,
      conversation_id: lastMsg.conversation_id,
    });
  };

  // ─── Actions ───
  const handleDeleteConversation = async (id: string) => {
    await conversationsHelper.softDelete(id);
    if (selectedConv === id) { setSelectedConv(null); setThread([]); }
    await loadConversations();
  };

  const handleRestore = async (id: string) => {
    await conversationsHelper.restore(id);
    await loadTrash();
  };

  const handleDeletePermanent = async (id: string) => {
    const msgs = await contactMessagesHelper.getByConversation(id);
    for (const m of msgs) await contactMessagesHelper.delete(m.id);
    await conversationsHelper.delete(id);
    await loadTrash();
  };

  const handleArchiveConversation = async (id: string) => {
    const msgs = await contactMessagesHelper.getByConversation(id);
    for (const m of msgs) await contactMessagesHelper.archive(m.id);
    if (selectedConv === id) { setSelectedConv(null); setThread([]); }
    await conversationsHelper.update(id, { status: 'archived' } as any);
    await loadConversations();
  };

  const deleteConversations = async (ids: string[]) => {
    for (const id of ids) await conversationsHelper.softDelete(id);
    if (ids.includes(selectedConv || '')) { setSelectedConv(null); setThread([]); }
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

  // ─── Data for ConversationList ───
  const listConversations = folder === 'trash' ? trash : folder === 'drafts' ? [] : conversations;
  const filtered = listConversations.filter(c => {
    if (folder === 'archive') return c.status === 'archived';
    if (folder === 'trash') return c.deleted_at != null;
    if (folder === 'inbox') {
      if (c.status === 'archived' || c.deleted_at) return false;
      if (filter === 'new') return c.status === 'active';
    }
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
    return true;
  });

  // ─── Keyboard ───
  useEffect(() => { const h = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
    if (e.key === 'j' || e.key === 'k') {
      e.preventDefault();
      const idx = filtered.findIndex(c => c.id === selectedConv);
      if (e.key === 'j' && idx < filtered.length - 1) selectConversation(filtered[idx + 1].id);
      if (e.key === 'k' && idx > 0) selectConversation(filtered[idx - 1].id);
    }
    if (e.key === 'c') { e.preventDefault(); openCompose('new'); }
    if (e.key === 'r' && selectedConv) { e.preventDefault(); handleReply(); }
  }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [filtered, selectedConv, thread]);

  if (loading && folder !== 'trash') return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="h-[calc(100vh-10rem)] flex gap-0 -m-6">
      <ConversationList
        conversations={filtered}
        drafts={folder === 'drafts' ? drafts : []}
        selectedId={selectedConv}
        onSelect={selectConversation}
        onSelectDraft={selectDraft}
        search={search}
        onSearchChange={setSearch}
        folder={folder}
        onFolderChange={setFolder}
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        onRefresh={() => folder === 'trash' ? loadTrash() : loadConversations()}
        onHealthClick={() => setShowHealth(true)}
        onDeleteConversation={folder === 'trash' ? handleDeletePermanent : handleDeleteConversation}
        onRestoreConversation={handleRestore}
        onArchiveConversation={handleArchiveConversation}
        onDeleteSelected={deleteConversations}
        onArchiveSelected={archiveConversations}
        onComposeClick={() => openCompose('new')}
      />
      <HealthPanel open={showHealth} onClose={() => setShowHealth(false)} />
      {showCompose ? (
        <ComposeWindow mode={composeMode} prefill={composePrefill} onClose={() => { setShowCompose(false); setSelectedDraft(null); }} onSent={() => { loadConversations(); if (folder === 'trash') loadTrash(); }} />
      ) : (
        <ThreadView
          conversation={conversations.find(c => c.id === selectedConv) || null}
          thread={thread}
          onThreadUpdate={refreshThread}
          onReply={handleReply}
          onForward={handleForward}
        />
      )}
    </div>
  );
}
