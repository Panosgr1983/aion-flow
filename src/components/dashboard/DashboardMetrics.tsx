import { useEffect, useState } from 'react';
import { crmMetricsHelper } from '../../lib/dataHelpers';
import { Users, Phone, FileText, Trophy, XCircle, Euro, TrendingUp, Clock } from 'lucide-react';

interface Metrics {
  newLeads30d: number; contacted: number; proposals: number;
  won: number; lost: number; pipelineValue: number; wonValue: number; conversionRate: number;
}

export default function DashboardMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crmMetricsHelper.getMetrics().then(m => { setMetrics(m); setLoading(false); });
  }, []);

  if (loading) return null;

  if (!metrics) return null;

  const cards = [
    { icon: Users, label: 'Νέα Leads (30d)', value: metrics.newLeads30d, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Phone, label: 'Επικοινωνία', value: metrics.contacted, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: FileText, label: 'Προσφορές', value: metrics.proposals, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Euro, label: 'Pipeline Value', value: `${metrics.pipelineValue}€`, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: Trophy, label: 'Κερδισμένα', value: metrics.won, color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: Euro, label: 'Won Revenue', value: `${metrics.wonValue}€`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: TrendingUp, label: 'Conversion Rate', value: `${metrics.conversionRate}%`, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { icon: XCircle, label: 'Χαμένα', value: metrics.lost, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="card p-4">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-lg font-bold ${color}`}>{value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
