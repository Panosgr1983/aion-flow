import { useEffect, useState, useCallback } from 'react';
import { monitoringHelper } from '../../lib/dataHelpers';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Activity, Mail, HardDrive, Zap, BarChart3, Server, AlertOctagon, TrendingUp, TrendingDown } from 'lucide-react';

interface MonitoringData {
  errors24h: number;
  smtp: { sent24h: number; failed24h: number; lastFailure?: string };
  edgeFunctions: { name: string; lastRun?: string; lastStatus?: string; duration?: number }[];
  storage: { totalFiles: number; uploaded24h: number; totalSizeMB: number };
  frontendErrors: { critical: number; warning: number };
}

export default function ObservabilityDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const d = await monitoringHelper.getStatus();
    setData(d);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;
  if (!data) return null;

  const overallHealth = data.errors24h === 0 && data.smtp.failed24h === 0 ? 'healthy' : data.errors24h < 3 ? 'degraded' : 'critical';

  const sections = [
    {
      title: 'Frontend Errors', icon: AlertOctagon,
      metrics: [
        { label: 'Critical (24h)', value: data.frontendErrors.critical, color: data.frontendErrors.critical > 0 ? 'text-red-400' : 'text-green-400' },
        { label: 'Warning (24h)', value: data.frontendErrors.warning, color: data.frontendErrors.warning > 0 ? 'text-amber-400' : 'text-gray-400' },
      ],
      note: data.frontendErrors.critical === 0 ? 'Καμία καταγεγραμμένη εξαίρεση' : undefined,
    },
    {
      title: 'SMTP / Email', icon: Mail,
      metrics: [
        { label: 'Απεσταλμένα (24h)', value: data.smtp.sent24h, color: 'text-blue-400' },
        { label: 'Αποτυχίες (24h)', value: data.smtp.failed24h, color: data.smtp.failed24h > 0 ? 'text-red-400' : 'text-green-400' },
      ],
      note: data.smtp.failed24h > 0 ? `Τελευταία αποτυχία: ${data.smtp.lastFailure ? new Date(data.smtp.lastFailure).toLocaleString('el-GR') : 'άγνωστη'}` : undefined,
    },
    {
      title: 'Edge Functions', icon: Zap,
      metrics: data.edgeFunctions.map(ef => ({
        label: ef.name,
        value: ef.lastStatus === 'success' ? 'Λειτουργεί' : ef.lastStatus === 'failed' ? 'Απέτυχε' : 'Άγνωστο',
        color: ef.lastStatus === 'success' ? 'text-green-400' : ef.lastStatus === 'failed' ? 'text-red-400' : 'text-gray-500',
      })),
      note: data.edgeFunctions.some(ef => ef.lastStatus === 'failed') ? 'Υπάρχουν αποτυχίες σε Edge Functions' : undefined,
    },
    {
      title: 'Storage', icon: HardDrive,
      metrics: [
        { label: 'Σύνολο αρχείων', value: data.storage.totalFiles, color: 'text-cyan-400' },
        { label: 'Uploads (24h)', value: data.storage.uploaded24h, color: 'text-blue-400' },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Observability</h2>
          <p className="text-sm text-gray-500">Κατάσταση συστήματος και μετρικές απόδοσης</p>
        </div>
        <button onClick={load} className="btn-ghost p-2"><RefreshCw size={14} /></button>
      </div>

      {/* OVERALL HEALTH */}
      <div className={`card p-5 border-l-4 ${overallHealth === 'healthy' ? 'border-l-green-500' : overallHealth === 'degraded' ? 'border-l-amber-500' : 'border-l-red-500'}`}>
        <div className="flex items-center gap-3">
          {overallHealth === 'healthy' ? <CheckCircle size={24} className="text-green-400" /> : overallHealth === 'degraded' ? <AlertTriangle size={24} className="text-amber-400" /> : <XCircle size={24} className="text-red-400" />}
          <div>
            <h3 className="font-semibold text-lg">
              {overallHealth === 'healthy' ? 'Σύστημα Υγιές' : overallHealth === 'degraded' ? 'Σύστημα Υποβαθμισμένο' : 'Σύστημα σε Κρίση'}
            </h3>
            <p className="text-sm text-gray-500">
              {data.errors24h} σφάλματα τελευταίες 24 ώρες · {data.smtp.sent24h} emails σταλμένα · {data.edgeFunctions.length} edge functions
            </p>
          </div>
        </div>
      </div>

      {/* SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(s => (
          <div key={s.title} className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <s.icon size={16} className="text-gray-400" />
              </div>
              <h3 className="font-medium text-sm">{s.title}</h3>
            </div>
            <div className="space-y-3">
              {s.metrics.map(m => (
                <div key={m.label} className="flex items-center justify-between py-1">
                  <span className="text-xs text-gray-500">{m.label}</span>
                  <span className={`text-sm font-medium ${m.color}`}>{m.value}</span>
                </div>
              ))}
            </div>
            {s.note && <p className="text-xs text-amber-400 mt-3 pt-3 border-t border-gray-800/50">{s.note}</p>}
          </div>
        ))}
      </div>

      {/* EDGE FUNCTION DETAILS */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-semibold">Edge Function Runs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4">Function</th>
                <th className="text-left py-3 px-4">Τελευταία Εκτέλεση</th>
                <th className="text-left py-3 px-4">Κατάσταση</th>
                <th className="text-left py-3 px-4">Διάρκεια</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {data.edgeFunctions.map(ef => (
                <tr key={ef.name} className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-3 px-4"><code className="text-xs text-blue-400">{ef.name}</code></td>
                  <td className="py-3 px-4 text-xs text-gray-400">{ef.lastRun ? new Date(ef.lastRun).toLocaleString('el-GR') : '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs flex items-center gap-1 ${ef.lastStatus === 'success' ? 'text-green-400' : ef.lastStatus === 'failed' ? 'text-red-400' : 'text-gray-500'}`}>
                      {ef.lastStatus === 'success' ? <CheckCircle size={12} /> : ef.lastStatus === 'failed' ? <XCircle size={12} /> : <Activity size={12} />}
                      {ef.lastStatus === 'success' ? 'Επιτυχές' : ef.lastStatus === 'failed' ? 'Απέτυχε' : 'Άγνωστο'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">{ef.duration ? `${ef.duration}s` : '—'}</td>
                </tr>
              ))}
              {data.edgeFunctions.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-gray-500">Δεν υπάρχουν δεδομένα</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ERROR HISTORY */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-gray-400" />
          <h3 className="text-sm font-semibold">Σύνοψη (τελευταίες 24 ώρες)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Σφάλματα', value: data.errors24h, icon: XCircle, color: 'text-red-400' },
            { label: 'Emails Απεσταλμένα', value: data.smtp.sent24h, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Αποτυχίες Email', value: data.smtp.failed24h, icon: TrendingDown, color: data.smtp.failed24h > 0 ? 'text-red-400' : 'text-gray-500' },
            { label: 'Αρχεία Storage', value: data.storage.totalFiles, icon: HardDrive, color: 'text-cyan-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-800/30 rounded-xl p-4 text-center">
              <s.icon size={18} className={`mx-auto mb-2 ${s.color}`} />
              <p className="text-lg font-bold text-gray-100">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
