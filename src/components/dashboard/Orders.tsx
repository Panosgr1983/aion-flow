import React, { useState, useEffect } from 'react';
import { Search, Eye, Download, AlertCircle, CheckCircle, ShoppingCart, Package, Truck, CreditCard } from 'lucide-react';
import AdminCard from '../ui/AdminCard';
import Breadcrumbs from '../ui/Breadcrumbs';
import { enhancedHelpers, dataSource } from '../../lib/dataHelpers';
import type { Database } from '../../types/supabase';

type Order = Database['public']['Tables']['orders']['Row'] & {
  customers?: { id: string; first_name: string; last_name: string; email: string };
  order_items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_image?: string;
  }>;
};

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enhancedHelpers.orders.getAll();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Αποτυχία φόρτωσης παραγγελιών');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setError(null);
      await enhancedHelpers.orders.update(orderId, { status: newStatus });
      setSuccess('Η κατάσταση της παραγγελίας ενημερώθηκε');
      await fetchOrders();
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.message || 'Αποτυχία ενημέρωσης κατάστασης');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customers?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Εκκρεμεί';
      case 'processing': return 'Σε επεξεργασία';
      case 'shipped': return 'Αποστάλθηκε';
      case 'delivered': return 'Παραδόθηκε';
      case 'cancelled': return 'Ακυρώθηκε';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Εξοφλήθηκε';
      case 'pending': return 'Εκκρεμεί';
      case 'failed': return 'Απέτυχε';
      case 'refunded': return 'Επιστράφηκε';
      default: return status;
    }
  };

  // Calculate stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Orders' }]} />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Διαχείριση Παραγγελιών</h1>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          dataSource.isSupabase
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
        }`}>
          {dataSource.isSupabase ? 'Live Data' : 'Demo Mode'}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <AdminCard
          title="Σύνολο Παραγγελιών"
          value={totalOrders.toString()}
          icon={<ShoppingCart className="h-6 w-6 text-blue-400" />}
          trend="+8.3%"
        />
        <AdminCard
          title="Συνολικά Έσοδα"
          value={`€${totalRevenue.toLocaleString('el-GR', { minimumFractionDigits: 2 })}`}
          icon={<CreditCard className="h-6 w-6 text-green-400" />}
          trend="+12.5%"
        />
        <AdminCard
          title="Εκκρεμείς"
          value={pendingOrders.toString()}
          icon={<AlertCircle className="h-6 w-6 text-yellow-400" />}
          trend="-5.2%"
        />
        <AdminCard
          title="Σε Επεξεργασία"
          value={processingOrders.toString()}
          icon={<Package className="h-6 w-6 text-purple-400" />}
          trend="+15.7%"
        />
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-400">{success}</span>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Αναζήτηση παραγγελιών..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Όλες οι παραγγελίες</option>
              <option value="pending">Εκκρεμείς</option>
              <option value="processing">Σε επεξεργασία</option>
              <option value="shipped">Αποσταλμένες</option>
              <option value="delivered">Παραδομένες</option>
              <option value="cancelled">Ακυρωμένες</option>
            </select>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Εξαγωγή
          </button>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Παραγγελία</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Πελάτης</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ημερομηνία</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Σύνολο</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Κατάσταση</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Πληρωμή</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                      <span className="ml-2 text-gray-400">Φόρτωση παραγγελιών...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Δεν βρέθηκαν παραγγελίες
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{order.order_number}</div>
                      <div className="text-sm text-gray-400">{order.order_items?.length || 0} προϊόντα</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {order.customers?.first_name} {order.customers?.last_name}
                      </div>
                      <div className="text-sm text-gray-400">{order.customers?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {new Date(order.created_at).toLocaleDateString('el-GR')}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-400">
                        €{order.total_amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {order.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Εκκρεμεί</option>
                        <option value="processing">Σε επεξεργασία</option>
                        <option value="shipped">Αποστάλθηκε</option>
                        <option value="delivered">Παραδόθηκε</option>
                        <option value="cancelled">Ακυρώθηκε</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.payment_status || 'pending')}`}>
                        {getPaymentStatusText(order.payment_status || 'pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {order.tracking_number && (
                          <button className="text-purple-400 hover:text-purple-300 transition-colors">
                            <Truck className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Παραγγελία {selectedOrder.order_number}</h2>
                  <p className="text-gray-400">
                    {selectedOrder.customers?.first_name} {selectedOrder.customers?.last_name} • {new Date(selectedOrder.created_at).toLocaleDateString('el-GR')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Στοιχεία Παραγγελίας</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Κατάσταση:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Πληρωμή:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(selectedOrder.payment_status || 'pending')}`}>
                        {getPaymentStatusText(selectedOrder.payment_status || 'pending')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Μέθοδος πληρωμής:</span>
                      <span className="text-white">{selectedOrder.payment_method}</span>
                    </div>
                    {selectedOrder.tracking_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tracking:</span>
                        <span className="text-white">{selectedOrder.tracking_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Σύνοψη</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Υποσύνολο:</span>
                      <span className="text-white">€{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ΦΠΑ:</span>
                      <span className="text-white">€{selectedOrder.tax_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Μεταφορικά:</span>
                      <span className="text-white">€{selectedOrder.shipping_amount.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Έκπτωση:</span>
                        <span className="text-green-400">-€{selectedOrder.discount_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <hr className="border-slate-600" />
                    <div className="flex justify-between font-medium">
                      <span className="text-white">Σύνολο:</span>
                      <span className="text-green-400">€{selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Προϊόντα</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 bg-slate-600/50 rounded-lg">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{item.product_name}</h4>
                        <p className="text-gray-400 text-sm">Ποσότητα: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">€{item.total_price.toFixed(2)}</p>
                        <p className="text-gray-400 text-sm">€{item.unit_price.toFixed(2)} έκαστο</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Διεύθυνση Χρέωσης</h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>{selectedOrder.billing_address.street}</p>
                    <p>{selectedOrder.billing_address.city}, {selectedOrder.billing_address.state} {selectedOrder.billing_address.postal_code}</p>
                    <p>{selectedOrder.billing_address.country}</p>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Διεύθυνση Αποστολής</h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>{selectedOrder.shipping_address.street}</p>
                    <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}</p>
                    <p>{selectedOrder.shipping_address.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;