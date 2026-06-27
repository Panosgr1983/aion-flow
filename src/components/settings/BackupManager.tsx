import React, { useEffect, useState, useCallback, Fragment, createElement } from 'react';
import { supabase } from '../../lib/supabase';
import { getCurrentTenantContext } from '../../lib/TenantContext';
import { RefreshCw, Shield, Clock, HardDrive, CheckCircle, XCircle, Activity, Calendar, Download, Play, Trash2, Eye, ChevronDown, ChevronRight } from 'lucide-react';

interface BackupJob {
  id: string;
  type: 'manual' | 'daily' | 'weekly';
  status: 'running' | 'success' | 'failed';
  backup_id: string | null;
  size_bytes: number;
  error_message: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = { manual: 'Χειροκίνητο', daily: 'Καθημερινό', weekly: 'Εβδομαδιαίο' };
const TYPE_ICONS: Record<string, any> = { manual: Play, daily: Calendar, weekly: Clock };
const TYPE_COLORS: Record<string, string> = { manual: 'bg-blue-500/10 text-blue-400', daily: 'bg-green-500/10 text-green-400', weekly: 'bg-purple-500/10 text-purple-400' };

export default function BackupManager() {
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Record<string, any[]> | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('backup_jobs').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const viewSnapshot = async (backupId: string | null) => {
    if (!backupId) return;
    setViewingId(backupId);
    setSnapshotLoading(true);
    setSnapshot(null);
    const { data } = await supabase.from('content_backups').select('snapshot').eq('id', backupId).maybeSingle();
    if (data) setSnapshot(data.snapshot as Record<string, any[]>);
    setSnapshotLoading(false);
  };

  const triggerBackup = async (type: 'manual' | 'daily' | 'weekly') => {
    setRunning(true); setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crm-backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ type, tenant_id: getCurrentTenantContext() || '00000000-0000-0000-0000-000000000001' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Backup failed');
      }
      await load();
    } catch (e: any) { setError(e.message); }
    setRunning(false);
  };

  const lastByType = (type: string) => jobs.find(j => j.type === type);
  const successCount = jobs.filter(j => j.status === 'success').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;

  const stats = [
    { icon: HardDrive, label: 'Συνολικά Backups', value: jobs.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: CheckCircle, label: 'Επιτυχημένα', value: successCount, color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: XCircle, label: 'Αποτυχημένα', value: failedCount, color: 'text-red-400', bg: 'bg-red-500/10' },
    { icon: Activity, label: 'Συνολικό Μέγεθος', value: `${(jobs.filter(j => j.status === 'success').reduce((s, j) => s + j.size_bytes, 0) / 1024 / 1024).toFixed(1)} MB`, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Backup Manager</h2>
          <p className="text-sm text-gray-500">Αυτόματοι και χειροκίνητοι backup κύκλοι</p>
        </div>
        <button onClick={load} className="btn-ghost p-2"><RefreshCw size={14} /></button>
      </div>

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-100">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BACKUP TYPES */}
      <div className="grid grid-cols-3 gap-4">
        {(['manual', 'daily', 'weekly'] as const).map(type => {
          const last = lastByType(type);
          const Icon = TYPE_ICONS[type];
          const statusColor = last?.status === 'success' ? 'text-green-400' : last?.status === 'failed' ? 'text-red-400' : 'text-gray-500';
          const statusIcon = last?.status === 'success' ? CheckCircle : last?.status === 'failed' ? XCircle : Clock;

          return (
            <div key={type} className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`size-10 rounded-xl ${TYPE_COLORS[type]} flex items-center justify-center`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{TYPE_LABELS[type]}</h3>
                  <p className="text-xs text-gray-500">
                    {type === 'daily' ? 'Διατήρηση 30 ημέρες' : type === 'weekly' ? 'Διατήρηση 12 εβδομάδες' : 'Διατήρηση μόνιμη'}
                  </p>
                </div>
              </div>

              {last ? (
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    {last?.status === 'success' && <CheckCircle size={12} className={statusColor} />}
                    {last?.status === 'failed' && <XCircle size={12} className={statusColor} />}
                    {(!last?.status || last.status === 'running') && <Activity size={12} className={statusColor} />}
                    <span className="text-gray-400">{last.status === 'success' ? 'Επιτυχές' : last.status === 'failed' ? 'Απέτυχε' : 'Σε εξέλιξη'}</span>
                    {last.size_bytes > 0 && <span className="text-gray-600">— {(last.size_bytes / 1024 / 1024).toFixed(1)} MB</span>}
                  </div>
                  <p className="text-[11px] text-gray-600">{new Date(last.created_at).toLocaleString('el-GR')}</p>
                  {last.error_message && <p className="text-[11px] text-red-400">{last.error_message}</p>}
                </div>
              ) : (
                <p className="text-xs text-gray-600 mb-4">Κανένα backup ακόμα</p>
              )}

              <button
                onClick={() => triggerBackup(type)}
                disabled={running}
                className="w-full text-xs py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Play size={12} /> {running ? 'Δημιουργία...' : `Δημιουργία ${TYPE_LABELS[type]}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* HISTORY */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold">Ιστορικό Backup</h3>
        </div>
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Δεν υπάρχουν backup ακόμα</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left py-3 px-4">Τύπος</th>
                  <th className="text-left py-3 px-4">Κατάσταση</th>
                  <th className="text-left py-3 px-4">Μέγεθος</th>
                  <th className="text-left py-3 px-4">Έναρξη</th>
                  <th className="text-left py-3 px-4">Διάρκεια</th>
                  <th className="text-left py-3 px-4">Σφάλμα</th>
                  <th className="text-left py-3 px-4 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {jobs.map(j => (
                  <Fragment key={j.id}>
                  <tr className="hover:bg-gray-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLORS[j.type]}`}>
                        {TYPE_LABELS[j.type]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`flex items-center gap-1 text-xs ${j.status === 'success' ? 'text-green-400' : j.status === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
                        {j.status === 'success' ? <CheckCircle size={12} /> : j.status === 'failed' ? <XCircle size={12} /> : <Activity size={12} />}
                        {j.status === 'success' ? 'Επιτυχές' : j.status === 'failed' ? 'Απέτυχε' : 'Σε εξέλιξη'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {j.size_bytes > 0 ? `${(j.size_bytes / 1024 / 1024).toFixed(1)} MB` : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {new Date(j.started_at).toLocaleString('el-GR')}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">
                      {j.completed_at ? `${Math.round((new Date(j.completed_at).getTime() - new Date(j.started_at).getTime()) / 1000)}s` : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-red-400 max-w-[200px] truncate">
                      {j.error_message || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {j.status === 'success' && j.backup_id && (
                        <button onClick={() => viewSnapshot(j.backup_id)} className="p-1 hover:bg-gray-800 rounded transition-colors" title="Προβολή backup">
                          {viewingId === j.backup_id ? <ChevronDown size={14} className="text-blue-400" /> : <Eye size={14} className="text-gray-500 hover:text-blue-400" />}
                        </button>
                      )}
                    </td>
                  </tr>
                  {viewingId === j.backup_id && snapshot && (
                    <tr key={`${j.id}-snap`}>
                      <td colSpan={7} className="px-4 pb-4">
                        <div className="bg-gray-900/60 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <HardDrive size={14} className="text-blue-400" />
                            <span className="font-semibold text-gray-300">Περιεχόμενα Backup</span>
                            <span className="text-gray-600">· {Object.keys(snapshot).length} πίνακες</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(snapshot).map(([table, rows]) => (
                              <div key={table} className="bg-gray-800/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <code className="text-xs text-blue-300">{table}</code>
                                  <span className="text-[10px] text-gray-500">{rows.length} εγγραφές</span>
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono truncate max-h-12 overflow-y-auto">
                                  {rows.length > 0
                                    ? rows.slice(0, 3).map((r, i) => (
                                        <div key={i} className="truncate">
                                          {Object.entries(r).filter(([k]) => !['snapshot', 'tenant_id', 'created_at', 'updated_at'].includes(k)).slice(0, 3).map(([k, v]) => (
                                            <span key={k}>{k}={typeof v === 'string' ? (v.length > 30 ? v.slice(0, 30) + '…' : v) : JSON.stringify(v).slice(0, 20)} </span>
                                          )).reduce((acc: any, x: any, i: number) => i === 0 ? [x] : [...acc, <span key={`s-${i}`} className="text-gray-600"> | </span>, x], [])}
                                        </div>
                                      ))
                                    : <span className="text-gray-600">κενός πίνακας</span>}
                                  {rows.length > 3 && <div className="text-gray-600 mt-1">… και {rows.length - 3} ακόμα</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
