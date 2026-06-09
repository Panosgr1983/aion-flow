import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Users, Package, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsHelper, ordersHelper } from '../../lib/dataHelpers';
import { Order } from '../../types/supabase';
import DashboardMetrics from './DashboardMetrics';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-cyan-500/20 text-cyan-400',
  shipped: 'bg-teal-500/20 text-teal-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
  refunded: 'bg-gray-500/20 text-gray-400',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Εκκρεμεί', confirmed: 'Επιβεβαιωμένη', processing: 'Επεξεργασία',
  shipped: 'Εστάλη', delivered: 'Παραδόθηκε', cancelled: 'Ακυρώθηκε', refunded: 'Επιστράφηκε',
};

function StatCard({ icon: Icon, label, value, change, positive, color }: {
  icon: React.ElementType; label: string; value: string; change: string; positive: boolean; color: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

export default function Overview() {
  const [analytics, setAnalytics] = useState<Awaited<ReturnType<typeof analyticsHelper.getDashboardData>> | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsHelper.getDashboardData(), ordersHelper.getAll()]).then(([a, orders]) => {
      setAnalytics(a);
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) return null;

  const formatter = new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Συνολικά Έσοδα" value={formatter.format(analytics.totalRevenue)} change={`+${analytics.revenueChange}%`} positive color="bg-blue-500/15 text-blue-400" />
        <StatCard icon={ShoppingCart} label="Παραγγελίες" value={analytics.totalOrders.toString()} change={`+${analytics.ordersChange}%`} positive color="bg-green-500/15 text-green-400" />
        <StatCard icon={Users} label="Πελάτες" value={analytics.totalCustomers.toString()} change={`+${analytics.customersChange}%`} positive color="bg-amber-500/15 text-amber-400" />
        <StatCard icon={Package} label="Μ.Ο. Παραγγελίας" value={formatter.format(analytics.averageOrderValue)} change={`+${analytics.aovChange}%`} positive color="bg-cyan-500/15 text-cyan-400" />
      </div>

      <DashboardMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold">Έσοδα ανά Μήνα</h3>
            <span className="text-xs text-gray-500">2024</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analytics.monthlyRevenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', color: '#f3f4f6', fontSize: '12px' }} formatter={(v: number) => [formatter.format(v), 'Έσοδα']} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-5">Πωλήσεις ανά Κατηγορία</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={analytics.salesByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {analytics.salesByCategory.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '12px', color: '#f3f4f6', fontSize: '12px' }} formatter={(v: number) => [`${v}%`, 'Ποσοστό']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {analytics.salesByCategory.map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-gray-400">{c.name}</span>
                </div>
                <span className="text-gray-300 font-medium">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Πρόσφατες Παραγγελίες</h3>
            <Link to="/dashboard/orders" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors">
              Όλες <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                <div>
                  <div className="text-sm font-medium">{order.order_number}</div>
                  <div className="text-xs text-gray-500">{order.customers?.first_name} {order.customers?.last_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatter.format(order.total)}</div>
                  <span className={`badge text-xs ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Top Προϊόντα</h3>
          <div className="space-y-3">
            {analytics.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gray-800 flex items-center justify-center text-xs text-gray-400 font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.sales} πωλήσεις</div>
                </div>
                <div className="text-sm font-semibold text-gray-200">{formatter.format(p.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
