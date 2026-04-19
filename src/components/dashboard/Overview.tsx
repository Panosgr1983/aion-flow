import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, DollarSign, Target, Activity, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { enhancedHelpers, dataSource } from '../../lib/dataHelpers';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  recentOrders: Array<any>;
  salesByMonth: Array<{ month: string; revenue: number; orders: number }>;
  salesByCategory?: Array<{ category: string; revenue: number; percentage: number }>;
  conversionRate?: number;
  cartAbandonmentRate?: number;
  customerSatisfaction?: number;
  topReferrers?: Array<{ source: string; visitors: number; conversions: number }>;
  deviceBreakdown?: Array<{ device: string; percentage: number }>;
  geographicData?: Array<{ country: string; orders: number; revenue: number }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

function Overview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await enhancedHelpers.analytics.getFullDashboardData();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data if API fails
      setStats({
        totalRevenue: 125430.50,
        totalOrders: 1247,
        totalCustomers: 892,
        averageOrderValue: 100.67,
        revenueGrowth: 12.5,
        ordersGrowth: 8.3,
        customersGrowth: 15.2,
        topProducts: [
          { name: 'iPhone 15 Pro Max', sales: 145, revenue: 202550 },
          { name: 'MacBook Air M3', sales: 89, revenue: 115211 },
          { name: 'Nike Air Max 270', sales: 234, revenue: 35100 }
        ],
        recentOrders: [],
        salesByMonth: [
          { month: 'Jan', revenue: 85000, orders: 847 },
          { month: 'Feb', revenue: 92000, orders: 921 },
          { month: 'Mar', revenue: 101000, orders: 1001 },
          { month: 'Apr', revenue: 115000, orders: 1145 },
          { month: 'May', revenue: 128000, orders: 1278 },
          { month: 'Jun', revenue: 142000, orders: 1412 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header with data source indicator */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Dashboard Overview</h1>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          dataSource.isSupabase
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          {dataSource.isSupabase ? 'Live Data' : 'Demo Mode'}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Συνολικά Έσοδα"
          value={`€${stats.totalRevenue.toLocaleString('el-GR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-6 w-6 text-green-400" />}
          trend={`+${stats.revenueGrowth}%`}
          subtitle="από τον προηγούμενο μήνα"
        />
        <StatCard
          title="Συνολικές Παραγγελίες"
          value={stats.totalOrders.toLocaleString('el-GR')}
          icon={<ShoppingCart className="h-6 w-6 text-blue-400" />}
          trend={`+${stats.ordersGrowth}%`}
          subtitle="από τον προηγούμενο μήνα"
        />
        <StatCard
          title="Σύνολο Πελατών"
          value={stats.totalCustomers.toLocaleString('el-GR')}
          icon={<Users className="h-6 w-6 text-purple-400" />}
          trend={`+${stats.customersGrowth}%`}
          subtitle="από τον προηγούμενο μήνα"
        />
        <StatCard
          title="Μέση Αξία Παραγγελίας"
          value={`€${stats.averageOrderValue.toFixed(2)}`}
          icon={<Target className="h-6 w-6 text-yellow-400" />}
          trend="+5.2%"
          subtitle="από τον προηγούμενο μήνα"
        />
      </div>

      {/* Additional Metrics Row */}
      {stats.conversionRate && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            icon={<Activity className="h-6 w-6 text-cyan-400" />}
            trend="+2.1%"
            subtitle="από τον προηγούμενο μήνα"
          />
          <StatCard
            title="Cart Abandonment"
            value={`${stats.cartAbandonmentRate}%`}
            icon={<ShoppingCart className="h-6 w-6 text-red-400" />}
            trend="-3.4%"
            subtitle="από τον προηγούμενο μήνα"
          />
          <StatCard
            title="Customer Satisfaction"
            value={`${stats.customerSatisfaction}/5`}
            icon={<Users className="h-6 w-6 text-emerald-400" />}
            trend="+0.3"
            subtitle="από τον προηγούμενο μήνα"
          />
          <StatCard
            title="Top Product Revenue"
            value={`€${stats.topProducts[0]?.revenue.toLocaleString('el-GR') || '0'}`}
            icon={<Package className="h-6 w-6 text-orange-400" />}
            trend="+15.7%"
            subtitle={stats.topProducts[0]?.name || 'N/A'}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Overview Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-medium text-white mb-4">Εξέλιξη Εσόδων</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesByMonth}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.375rem',
                  }}
                  formatter={(value: number) => [`€${value.toLocaleString('el-GR')}`, 'Έσοδα']}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        {stats.salesByCategory && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-medium text-white mb-4">Έσοδα ανά Κατηγορία</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.salesByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="revenue"
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                  >
                    {stats.salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`€${value.toLocaleString('el-GR')}`, 'Έσοδα']}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.375rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-medium text-white mb-4">Κορυφαία Προϊόντα</h2>
          <div className="space-y-4">
            {stats.topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-gray-400 text-sm">{product.sales} πωλήσεις</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">€{product.revenue.toLocaleString('el-GR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-medium text-white mb-4">Πρόσφατες Παραγγελίες</h2>
          <div className="space-y-4">
            {stats.recentOrders.slice(0, 5).map((order: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {order.order_number?.slice(-3) || index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{order.customer_name}</p>
                    <p className="text-gray-400 text-sm">{new Date(order.created_at).toLocaleDateString('el-GR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">€{order.total_amount?.toFixed(2) || '0.00'}</p>
                  <p className={`text-xs px-2 py-1 rounded ${
                    order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {order.status === 'delivered' ? 'Ολοκληρώθηκε' :
                     order.status === 'processing' ? 'Σε επεξεργασία' : order.status}
                  </p>
                </div>
              </div>
            ))}
            {stats.recentOrders.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Δεν υπάρχουν πρόσφατες παραγγελίες
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Geographic Data */}
      {stats.geographicData && (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-medium text-white mb-4">Γεωγραφική Κατανομή</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.geographicData.map((country, index) => (
              <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{country.country}</span>
                  <Globe className="h-5 w-5 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">{country.orders} παραγγελίες</p>
                  <p className="text-green-400 font-medium">€{country.revenue.toLocaleString('el-GR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  subtitle?: string;
}) {
  const isPositive = trend.startsWith('+');

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 hover:bg-slate-800/70 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className="p-3 bg-slate-700/50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm font-medium ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}>
          {trend}
        </span>
        {subtitle && (
          <span className="text-sm font-medium text-gray-400 ml-2">{subtitle}</span>
        )}
      </div>
    </div>
  );
}

export default Overview;