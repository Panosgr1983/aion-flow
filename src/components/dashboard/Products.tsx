import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertCircle, CheckCircle, Package, Eye, Star } from 'lucide-react';
import AdminCard from '../ui/AdminCard';
import Breadcrumbs from '../ui/Breadcrumbs';
import { enhancedHelpers, dataSource } from '../../lib/dataHelpers';
import type { Database } from '../../types/supabase';

type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: { id: string; name: string; slug: string };
  variants?: any[];
  reviews?: any[];
  averageRating?: number;
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enhancedHelpers.products.getAllWithVariants();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Αποτυχία φόρτωσης προϊόντων');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await enhancedHelpers.categories.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το προϊόν;')) return;

    try {
      setError(null);
      await enhancedHelpers.products.delete(id);
      setSuccess('Το προϊόν διαγράφηκε επιτυχώς');
      await fetchProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Αποτυχία διαγραφής προϊόντος');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: Product) => {
    if (!product.track_inventory) return { status: 'Unlimited', color: 'bg-gray-100 text-gray-800' };
    if (product.stock_quantity === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (product.stock_quantity <= (product.low_stock_threshold || 0)) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Products' }]} />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Διαχείριση Προϊόντων</h1>
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
          title="Σύνολο Προϊόντων"
          value={products.length.toString()}
          icon={<Package className="h-6 w-6 text-blue-400" />}
          trend="+12.5%"
        />
        <AdminCard
          title="Ενεργά Προϊόντα"
          value={products.filter(p => p.is_active).length.toString()}
          icon={<CheckCircle className="h-6 w-6 text-green-400" />}
          trend="+8.2%"
        />
        <AdminCard
          title="Χαμηλό Stock"
          value={products.filter(p => p.track_inventory && p.stock_quantity <= (p.low_stock_threshold || 0)).length.toString()}
          icon={<AlertCircle className="h-6 w-6 text-yellow-400" />}
          trend="-5.1%"
        />
        <AdminCard
          title="Μέση Τιμή"
          value={`€${products.length > 0 ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : '0.00'}`}
          icon={<Star className="h-6 w-6 text-purple-400" />}
          trend="+3.7%"
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
                placeholder="Αναζήτηση προϊόντων..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Όλες οι κατηγορίες</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Προσθήκη Προϊόντος
          </button>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Προϊόν</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Κατηγορία</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Τιμή</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Κατάσταση</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                      <span className="ml-2 text-gray-400">Φόρτωση προϊόντων...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Δεν βρέθηκαν προϊόντα
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-white">{product.name}</div>
                            <div className="text-sm text-gray-400">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {product.categories?.name || 'Χωρίς κατηγορία'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          €{product.price.toFixed(2)}
                          {product.compare_price && (
                            <span className="text-red-400 line-through ml-2">
                              €{product.compare_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          {product.track_inventory ? product.stock_quantity : '∞'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-400 hover:text-blue-300 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal would go here */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Προσθήκη Προϊόντος</h2>
            <p className="text-gray-400 mb-4">Η λειτουργία αυτή είναι διαθέσιμη μόνο με Supabase connection.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600"
              >
                Ακύρωση
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Επεξεργασία Προϊόντος</h2>
            <p className="text-gray-400 mb-4">Η λειτουργία αυτή είναι διαθέσιμη μόνο με Supabase connection.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600"
              >
                Ακύρωση
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;