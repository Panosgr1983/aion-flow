import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  BarChart, Bar, LineChart, Line, ComposedChart
} from 'recharts';
import {
  TrendingUp, Users, ShoppingCart, DollarSign, Target, Activity, Globe, Eye,
  AlertCircle, CheckCircle, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import AdminCard from '../ui/AdminCard';
import Breadcrumbs from '../ui/Breadcrumbs';
import { enhancedHelpers, dataSource } from '../../lib/dataHelpers';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16'];

function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enhancedHelpers.analytics.getFullDashboardData();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Αποτυχία φόρτωσης αναλυτικών στοιχείων');
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

  if (error || !analyticsData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">{error || 'Αποτυχία φόρτωσης δεδομένων'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]} />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Αναλυτικά Στοιχεία</h1>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            dataSource.isSupabase
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            {dataSource.isSupabase ? 'Live Data' : 'Demo Mode'}
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 bg-slate-700/50 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Τελευταίες 7 ημέρες</option>
            <option value="30d">Τελευταίες 30 ημέρες</option>
            <option value="90d">Τελευταίες 90 ημέρες</option>
            <option value="1y">Τελευταίος χρόνος</option>
          </select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard
          title="Συνολικές Επισκέψεις"
          value="24,567"
          icon={<Eye className="h-6 w-6 text-blue-400" />}
          trend="+12.5%"
          subtitle="από τον προηγούμενο μήνα"
        />
        <AdminCard
          title="Conversion Rate"
          value={`${analyticsData.conversionRate}%`}
          icon={<Target className="h-6 w-6 text-green-400" />}
          trend="+2.1%"
          subtitle="στόχος: 4.0%"
        />
        <AdminCard
          title="Cart Abandonment"
          value={`${analyticsData.cartAbandonmentRate}%`}
          icon={<ShoppingCart className="h-6 w-6 text-red-400" />}
          trend="-3.4%"
          subtitle="στόχος: <65%"
        />
        <AdminCard
          title="Customer Satisfaction"
          value={`${analyticsData.customerSatisfaction}/5`}
          icon={<Users className="h-6 w-6 text-yellow-400" />}
          trend="+0.3"
          subtitle="βάσει κριτικών"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Εξέλιξη Εσόδων</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analyticsData.salesByMonth}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis yAxisId="left" stroke="#9CA3AF" tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.375rem',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? `€${value.toLocaleString('el-GR')}` : value,
                    name === 'revenue' ? 'Έσοδα' : 'Παραγγελίες'
                  ]}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar yAxisId="right" dataKey="orders" fill="#3B82F6" opacity={0.7} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Έσοδα ανά Κατηγορία</h2>
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.salesByCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="revenue"
                  label={({ category, percentage }) => `${category}: ${percentage}%`}
                  labelLine={false}
                >
                  {analyticsData.salesByCategory.map((entry: any, index: number) => (
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
          <div className="mt-4 grid grid-cols-2 gap-2">
            {analyticsData.salesByCategory.map((item: any, index: number) => (
              <div key={item.category} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-300">{item.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Κορυφαία Προϊόντα</h2>
          <div className="space-y-4">
            {analyticsData.topProducts.slice(0, 5).map((product: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{product.name}</p>
                    <p className="text-gray-400 text-xs">{product.sales} πωλήσεις</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium text-sm">€{product.revenue.toLocaleString('el-GR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Γεωγραφική Κατανομή</h2>
          <div className="space-y-4">
            {analyticsData.geographicData?.slice(0, 5).map((country: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-white text-sm">{country.country}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium text-sm">{country.orders} παραγγελίες</p>
                  <p className="text-green-400 text-xs">€{country.revenue.toLocaleString('el-GR')}</p>
                </div>
              </div>
            )) || <p className="text-gray-400 text-sm">Δεν υπάρχουν δεδομένα γεωγραφικής κατανομής</p>}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Πηγές Κίνησης</h2>
          <div className="space-y-4">
            {analyticsData.topReferrers?.slice(0, 5).map((referrer: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {referrer.source[0]}
                  </div>
                  <span className="text-white text-sm">{referrer.source}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium text-sm">{referrer.visitors.toLocaleString('el-GR')}</p>
                  <p className="text-green-400 text-xs">{referrer.conversions} conversions</p>
                </div>
              </div>
            )) || <p className="text-gray-400 text-sm">Δεν υπάρχουν δεδομένα πηγών κίνησης</p>}
          </div>
        </div>
      </div>

      {/* Device Breakdown & Customer Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Κατανομή Συσκευών</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.deviceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="percentage"
                  label={({ device, percentage }) => `${device}: ${percentage}%`}
                >
                  {analyticsData.deviceBreakdown?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Ποσοστό']}
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

        {/* Customer Statistics */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-medium text-white mb-4">Στατιστικά Πελατών</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{analyticsData.customerStats?.newCustomers || 0}</p>
                <p className="text-sm text-gray-400">Νέοι Πελάτες</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{analyticsData.customerStats?.returningCustomers || 0}</p>
                <p className="text-sm text-gray-400">Επιστρέφοντες</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Μέση διάρκεια ζωής πελάτη:</span>
                <span className="text-white font-medium">{analyticsData.customerStats?.averageLifetimeValue ? `€${analyticsData.customerStats.averageLifetimeValue.toFixed(2)}` : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Ποσοστό αποχώρησης:</span>
                <span className="text-white font-medium">{analyticsData.customerStats?.churnRate ? `${analyticsData.customerStats.churnRate}%` : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
        <h2 className="text-lg font-medium text-white mb-4">Μετρικές Απόδοσης</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <Activity className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-cyan-400">98.5%</p>
            <p className="text-sm text-gray-400">Uptime</p>
          </div>
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-400">1.2s</p>
            <p className="text-sm text-gray-400">Avg Response Time</p>
          </div>
          <div className="text-center">
            <Eye className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-400">45.2%</p>
            <p className="text-sm text-gray-400">Bounce Rate</p>
          </div>
          <div className="text-center">
            <Target className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-400">2.8</p>
            <p className="text-sm text-gray-400">Pages per Session</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;