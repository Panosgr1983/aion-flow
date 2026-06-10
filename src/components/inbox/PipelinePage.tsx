import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { conversationsHelper } from '../../lib/dataHelpers';
import { Conversation, LeadStage } from '../../types/supabase';
import { trackEvent } from '../../lib/analytics';
import { Plus, Euro, User, MessageSquare, TrendingUp, Trophy, XCircle, Mail, Phone } from 'lucide-react';
import FollowUpTasks from './FollowUpTasks';

const STAGES: { key: LeadStage; label: string; icon: any; color: string }[] = [
  { key: 'new', label: 'Νέο', icon: User, color: 'border-t-blue-500' },
  { key: 'contacted', label: 'Επικοινωνία', icon: Mail, color: 'border-t-amber-500' },
  { key: 'proposal', label: 'Προσφορά', icon: TrendingUp, color: 'border-t-purple-500' },
  { key: 'won', label: 'Κερδισμένο', icon: Trophy, color: 'border-t-green-500' },
  { key: 'lost', label: 'Χαμένο', icon: XCircle, color: 'border-t-red-500' },
];

const NEXT_STAGE: Record<LeadStage, LeadStage | null> = {
  new: 'contacted', contacted: 'proposal', proposal: 'won', won: null, lost: null,
};

export default function PipelinePage() {
  const [leads, setLeads] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editValueId, setEditValueId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await conversationsHelper.getLeads();
    setLeads(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDrop = async (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/lead-id');
    if (!id || !stage) return;
    const currentLead = leads.find(l => l.id === id);
    await conversationsHelper.setLeadStage(id, stage);
    setLeads(prev => prev.map(c => c.id === id ? { ...c, lead_stage: stage } : c));
    if (currentLead) {
      trackEvent('crm.lead_stage_changed', { from_stage: currentLead.lead_stage, to_stage: stage }).catch(() => {});
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/lead-id', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const advanceStage = async (id: string, current: LeadStage) => {
    const next = NEXT_STAGE[current];
    if (!next) return;
    await conversationsHelper.setLeadStage(id, next);
    setLeads(prev => prev.map(c => c.id === id ? { ...c, lead_stage: next } : c));
    trackEvent('crm.lead_stage_changed', { from_stage: current, to_stage: next }).catch(() => {});
  };

  const saveValue = async (id: string) => {
    const val = parseFloat(editValue) || 0;
    await conversationsHelper.setLeadValue(id, val);
    setLeads(prev => prev.map(c => c.id === id ? { ...c, lead_value: val } : c));
    setEditValueId(null);
  };

  const groupedLeads = (stage: LeadStage) => leads.filter(l => l.lead_stage === stage);

  const stats = {
    total: leads.length,
    won: leads.filter(l => l.lead_stage === 'won').length,
    value: leads.filter(l => l.lead_stage === 'won').reduce((sum, l) => sum + (l.lead_value || 0), 0),
    open: leads.filter(l => ['new', 'contacted', 'proposal'].includes(l.lead_stage)).length,
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Leads Pipeline</h2>
          <p className="text-sm text-gray-500">{stats.total} leads · {stats.open} ανοιχτά · {stats.won} κερδισμένα · {stats.value}€ αξία</p>
        </div>
        <button onClick={load} className="btn-ghost text-xs px-3 py-1.5">Ανανέωση</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
        {STAGES.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className="flex-1 min-w-[220px] shrink-0"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, key)}
          >
            <div className={`card border-t-2 ${color} p-3`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className="text-gray-400" />
                <h3 className="text-sm font-medium text-gray-300">{label}</h3>
                <span className="ml-auto text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded-full">
                  {groupedLeads(key).length}
                </span>
              </div>

              <div className="space-y-2 min-h-[100px]">
                {groupedLeads(key).map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={e => handleDragStart(e, lead.id)}
                    className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-blue-500/30 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-200 truncate">{lead.name}</p>
                        <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                        {editValueId === lead.id ? (
                          <div className="flex gap-1 mt-1">
                            <input
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="input text-xs py-0.5 w-20"
                              type="number"
                              step="0.01"
                              autoFocus
                              onKeyDown={e => { if (e.key === 'Enter') saveValue(lead.id); if (e.key === 'Escape') setEditValueId(null); }}
                            />
                            <button onClick={() => saveValue(lead.id)} className="text-xs text-blue-400">✓</button>
                          </div>
                        ) : (
                          <p
                            className={`text-xs mt-1 font-medium cursor-pointer hover:text-blue-400 transition-colors ${lead.lead_value > 0 ? 'text-green-400' : 'text-gray-600'}`}
                            onClick={() => { setEditValueId(lead.id); setEditValue(String(lead.lead_value || '')); }}
                          >
                            {lead.lead_value > 0 ? `${lead.lead_value}€` : 'Προσθήκη αξίας'}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/dashboard/inbox?conv=${lead.id}`)}
                        className="p-1.5 text-gray-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Άνοιγμα συνομιλίας"
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>

                    {NEXT_STAGE[lead.lead_stage] && (
                      <button
                        onClick={() => advanceStage(lead.id, lead.lead_stage)}
                        className="mt-2 w-full text-[11px] py-1 rounded-lg bg-gray-700/50 text-gray-400 hover:bg-blue-600/20 hover:text-blue-400 transition-colors"
                      >
                        Μετακίνηση σε {STAGES.find(s => s.key === NEXT_STAGE[lead.lead_stage])?.label}
                      </button>
                    )}
                    <FollowUpTasks conversationId={lead.id} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
