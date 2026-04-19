import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertCircle, CheckCircle } from 'lucide-react';
import AdminCard from '../ui/AdminCard';
import Breadcrumbs from '../ui/Breadcrumbs';
import { enhancedHelpers } from '../../lib/dataHelpers';
import type { Database } from '../../types/supabase';

type Category = Database['public']['Tables']['categories']['Row'] & {
  productCount: number;
  revenue?: number;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await enhancedHelpers.categories.getAllWithStats();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Αποτυχία φόρτωσης κατηγοριών');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      setError(null);

      const categoryData = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
        is_active: formData.is_active
      };

      if (editingCategory) {
        await enhancedHelpers.categories.update(editingCategory.id, categoryData);
        setSuccess('Η κατηγορία ενημερώθηκε επιτυχώς');
      } else {
        await enhancedHelpers.categories.create(categoryData);
        setSuccess('Η κατηγορία δημιουργήθηκε επιτυχώς');
      }

      await fetchCategories();
      resetForm();
      setShowAddModal(false);
      setEditingCategory(null);
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.message || 'Αποτυχία αποθήκευσης κατηγορίας');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την κατηγορία;')) return;

    try {
      setError(null);
      await enhancedHelpers.categories.delete(id);
      setSuccess('Η κατηγορία διαγράφηκε επιτυχώς');
      await fetchCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Αποτυχία διαγραφής κατηγορίας');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true
    });
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Κατηγορίες</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingCategory(null);
            setShowAddModal(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Νέα Κατηγορία
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Search */}
      <AdminCard>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Αναζήτηση κατηγοριών..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </AdminCard>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingCategory ? 'Επεξεργασία Κατηγορίας' : 'Νέα Κατηγορία'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Όνομα *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="auto-generated"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Περιγραφή
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  URL Εικόνας
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-300">
                  Ενεργή
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-slate-600 rounded-lg text-gray-300 hover:bg-slate-700 transition-colors"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {editingCategory ? 'Ενημέρωση' : 'Δημιουργία'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <AdminCard key={category.id} className="hover:bg-slate-800/70 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                <p className="text-sm text-gray-400">{category.slug}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {category.description && (
              <p className="text-gray-300 text-sm mb-4">{category.description}</p>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">
                {category.productCount} προϊόντα
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                category.is_active
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {category.is_active ? 'Ενεργή' : 'Ανενεργή'}
              </span>
            </div>
          </AdminCard>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <AdminCard>
          <div className="text-center py-8">
            <p className="text-gray-400">Δεν βρέθηκαν κατηγορίες</p>
          </div>
        </AdminCard>
      )}
    </div>
  );
}