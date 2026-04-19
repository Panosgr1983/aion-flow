import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit, Trash2, AlertCircle, CheckCircle, Users, ShoppingCart, DollarSign, Star } from 'lucide-react';
import AdminCard from '../ui/AdminCard';
import Breadcrumbs from '../ui/Breadcrumbs';
import { enhancedHelpers, dataSource } from '../../lib/dataHelpers';
import type { Database } from '../../types/supabase';

type Customer = Database['public']['Tables']['customers']['Row'];

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enhancedHelpers.customers.getAll();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Αποτυχία φόρτωσης πελατών');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον πελάτη;')) return;

    try {
      setError(null);
      await enhancedHelpers.customers.delete(id);
      setSuccess('Ο πελάτης διαγράφηκε επιτυχώς');
      await fetchCustomers();
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      setError(err.message || 'Αποτυχία διαγραφής πελάτη');
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.includes(searchTerm);
    return matchesSearch;
  });

  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getMembershipText = (level: string) => {
    switch (level) {
      case 'gold': return 'Gold';
      case 'silver': return 'Silver';
      case 'bronze': return 'Bronze';
      default: return 'Basic';
    }
  };

  // Calculate stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.email_verified).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const averageOrderValue = customers.length > 0 ? totalRevenue / customers.reduce((sum, c) => sum + (c.total_orders || 0), 0) : 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Customers' }]} />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Διαχείριση Πελατών</h1>
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
          title="Σύνολο Πελατών"
          value={totalCustomers.toString()}
          icon={<Users className="h-6 w-6 text-blue-400" />}
          trend="+15.2%"
        />
        <AdminCard
          title="Ενεργοί Πελάτες"
          value={activeCustomers.toString()}
          icon={<CheckCircle className="h-6 w-6 text-green-400" />}
          trend="+12.8%"
        />
        <AdminCard
          title="Συνολικά Έσοδα"
          value={`€${totalRevenue.toLocaleString('el-GR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-6 w-6 text-yellow-400" />}
          trend="+18.5%"
        />
        <AdminCard
          title="Μέση Αξία Παραγγελίας"
          value={`€${averageOrderValue.toFixed(2)}`}
          icon={<Star className="h-6 w-6 text-purple-400" />}
          trend="+5.3%"
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
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Αναζήτηση πελατών..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
            Προσθήκη Πελάτη
          </button>
        </div>

        {/* Customers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Πελάτης</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Επικοινωνία</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Παραγγελίες</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Έξοδα</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Μέλος</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Κατάσταση</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                      <span className="ml-2 text-gray-400">Φόρτωση πελατών...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    Δεν βρέθηκαν πελάτες
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                          {customer.first_name[0]}{customer.last_name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">
                            {customer.first_name} {customer.last_name}
                          </div>
                          <div className="text-sm text-gray-400">
                            ΑΦΜ: {customer.tax_id || 'Δεν έχει καταχωρηθεί'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{customer.email}</div>
                      <div className="text-sm text-gray-400">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ShoppingCart className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-300">{customer.total_orders || 0}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Μ.Ο. €{customer.average_order_value?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-400">
                        €{customer.total_spent?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-sm text-gray-400">
                        Πόντοι: {customer.loyalty_points || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMembershipColor(customer.membership_level || 'basic')}`}>
                        {getMembershipText(customer.membership_level || 'basic')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${
                          customer.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {customer.email_verified ? 'Επαληθευμένος' : 'Μη επαληθευμένος'}
                        </span>
                        {customer.accepts_marketing && (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit bg-blue-100 text-blue-800">
                            Marketing
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xl mr-4">
                    {selectedCustomer.first_name[0]}{selectedCustomer.last_name[0]}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {selectedCustomer.first_name} {selectedCustomer.last_name}
                    </h2>
                    <p className="text-gray-400">{selectedCustomer.email}</p>
                    <div className="flex items-center mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${getMembershipColor(selectedCustomer.membership_level || 'basic')}`}>
                        {getMembershipText(selectedCustomer.membership_level || 'basic')}
                      </span>
                      {selectedCustomer.email_verified && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Επαληθευμένος
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Στατιστικά</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Σύνολο παραγγελιών:</span>
                      <span className="text-white font-medium">{selectedCustomer.total_orders || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Συνολικά έξοδα:</span>
                      <span className="text-green-400 font-medium">€{selectedCustomer.total_spent?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Μέση αξία:</span>
                      <span className="text-white font-medium">€{selectedCustomer.average_order_value?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Πόντοι επιβράβευσης:</span>
                      <span className="text-yellow-400 font-medium">{selectedCustomer.loyalty_points || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Τελευταία παραγγελία:</span>
                      <span className="text-white font-medium">
                        {selectedCustomer.last_order_date ? new Date(selectedCustomer.last_order_date).toLocaleDateString('el-GR') : 'Καμία'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Επικοινωνία</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400">Email:</span>
                      <p className="text-white">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Τηλέφωνο:</span>
                      <p className="text-white">{selectedCustomer.phone || 'Δεν έχει καταχωρηθεί'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Εταιρεία:</span>
                      <p className="text-white">{selectedCustomer.company || 'Ιδιώτης'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">ΑΦΜ:</span>
                      <p className="text-white">{selectedCustomer.tax_id || 'Δεν έχει καταχωρηθεί'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Προτιμήσεις</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCustomer.accepts_marketing}
                        readOnly
                        className="mr-2"
                      />
                      <span className="text-gray-400">Αποδοχή marketing</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCustomer.tags?.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {tag}
                          </span>
                        )) || <span className="text-gray-500 text-sm">Κανένα tag</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Διεύθυνση Χρέωσης</h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>{selectedCustomer.billing_address.street}</p>
                    <p>{selectedCustomer.billing_address.city}, {selectedCustomer.billing_address.state} {selectedCustomer.billing_address.postal_code}</p>
                    <p>{selectedCustomer.billing_address.country}</p>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Διεύθυνση Αποστολής</h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>{selectedCustomer.shipping_address.street}</p>
                    <p>{selectedCustomer.shipping_address.city}, {selectedCustomer.shipping_address.state} {selectedCustomer.shipping_address.postal_code}</p>
                    <p>{selectedCustomer.shipping_address.country}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Σημειώσεις</h3>
                  <p className="text-gray-300">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;