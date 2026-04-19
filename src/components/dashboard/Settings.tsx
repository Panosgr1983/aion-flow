import React, { useState } from 'react';
import { Settings, Store, Palette, Users, Search, BarChart3, Save } from 'lucide-react';
import AdminCard from '../ui/AdminCard';
import Breadcrumbs from '../ui/Breadcrumbs';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  currency: string;
  showPricesWithTax: boolean;
  vatRate: number;
  logoUrl: string;
  enableDarkMode: boolean;
  language: string;
  timezone: string;
  analytics: {
    googleAnalyticsId: string;
    enableTracking: boolean;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    robotsTxt: string;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general'|'shop'|'appearance'|'users'|'seo'|'analytics'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "AION Flow E-Shop",
    siteDescription: "Προϊόντα υψηλής ποιότητας για όλους",
    contactEmail: "info@aion-shop.gr",
    currency: "EUR",
    showPricesWithTax: true,
    vatRate: 24,
    logoUrl: "/logo.png",
    enableDarkMode: true,
    language: "el",
    timezone: "Europe/Athens",
    analytics: {
      googleAnalyticsId: "G-XXXXXXXXXX",
      enableTracking: true
    },
    seo: {
      metaTitle: "AION Flow - Complete E-commerce CMS",
      metaDescription: "AION Flow - Πλήρες E-commerce CMS με Supabase backend και demo mode λειτουργία.",
      robotsTxt: "User-agent: *\nAllow: /"
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Mock save - θα αντικατασταθεί με Supabase
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as Record<string, unknown>,
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Όνομα Ιστότοπου
              </label>
              <input
                type="text"
                name="siteName"
                value={settings.siteName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Περιγραφή Ιστότοπου
              </label>
              <textarea
                name="siteDescription"
                rows={3}
                value={settings.siteDescription}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Επικοινωνίας
              </label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Γλώσσα
                </label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="el">Ελληνικά</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ζώνη Ώρας
                </label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Europe/Athens">Europe/Athens (GMT+2)</option>
                  <option value="Europe/London">Europe/London (GMT+1)</option>
                  <option value="America/New_York">America/New_York (GMT-5)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'shop':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Νόμισμα
                </label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ΦΠΑ (%)
                </label>
                <input
                  type="number"
                  name="vatRate"
                  value={settings.vatRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showPricesWithTax"
                name="showPricesWithTax"
                checked={settings.showPricesWithTax}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="showPricesWithTax" className="text-sm font-medium text-gray-300">
                Εμφάνιση τιμών με ΦΠΑ
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                URL Λογότυπου
              </label>
              <input
                type="url"
                name="logoUrl"
                value={settings.logoUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableDarkMode"
                name="enableDarkMode"
                checked={settings.enableDarkMode}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="enableDarkMode" className="text-sm font-medium text-gray-300">
                Ενεργοποίηση Dark Mode
              </label>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2">Preview</h4>
              <div className={`p-4 rounded ${settings.enableDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'}`}>
                <p className="text-sm">Αυτό είναι ένα preview του theme.</p>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="analytics.enableTracking"
                name="analytics.enableTracking"
                checked={settings.analytics.enableTracking}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="analytics.enableTracking" className="text-sm font-medium text-gray-300">
                Ενεργοποίηση παρακολούθησης analytics
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Google Analytics ID
              </label>
              <input
                type="text"
                name="analytics.googleAnalyticsId"
                value={settings.analytics.googleAnalyticsId}
                onChange={handleChange}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-400 text-sm mt-1">
                Βρείτε το ID σας στο Google Analytics
              </p>
            </div>
          </div>
        );

      case 'seo':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Προεπιλεγμένος Meta Title
              </label>
              <input
                type="text"
                name="seo.metaTitle"
                value={settings.seo.metaTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-400 text-sm mt-1">
                Συνιστώμενο μήκος: 50-60 χαρακτήρες
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Προεπιλεγμένο Meta Description
              </label>
              <textarea
                name="seo.metaDescription"
                rows={3}
                value={settings.seo.metaDescription}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-400 text-sm mt-1">
                Συνιστώμενο μήκος: 150-160 χαρακτήρες
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Robots.txt
              </label>
              <textarea
                name="seo.robotsTxt"
                rows={6}
                value={settings.seo.robotsTxt}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>
        );

      case 'users':
        return (
          <AdminCard title="Διαχείριση Χρηστών">
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2">Στατιστικά Χρηστών</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">1</div>
                    <div className="text-gray-400 text-sm">Διαχειριστές</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">2</div>
                    <div className="text-gray-400 text-sm">Συντάκτες</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">1</div>
                    <div className="text-gray-400 text-sm">Επισκέπτες</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-2 text-gray-300">Χρήστης</th>
                      <th className="text-left py-2 text-gray-300">Email</th>
                      <th className="text-left py-2 text-gray-300">Ρόλος</th>
                      <th className="text-left py-2 text-gray-300">Κατάσταση</th>
                      <th className="text-left py-2 text-gray-300">Ενέργειες</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            Α
                          </div>
                          <span className="text-white">Admin User</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-300">admin@aion-flow.com</td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                          Διαχειριστής
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Ενεργός
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="text-blue-400 hover:text-blue-300 text-sm">
                          Επεξεργασία
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </AdminCard>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Ρυθμίσεις</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Αποθήκευση...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Αποθήκευση
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
          Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς!
        </div>
      )}

      {/* Tabs */}
      <AdminCard>
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'general', label: 'Γενικά', icon: Settings },
            { id: 'shop', label: 'Κατάστημα', icon: Store },
            { id: 'appearance', label: 'Εμφάνιση', icon: Palette },
            { id: 'users', label: 'Χρήστες', icon: Users },
            { id: 'seo', label: 'SEO', icon: Search },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as keyof typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </AdminCard>

      {/* Tab Content */}
      <AdminCard title={
        activeTab === 'general' ? 'Γενικές Ρυθμίσεις' :
        activeTab === 'shop' ? 'Ρυθμίσεις Καταστήματος' :
        activeTab === 'appearance' ? 'Ρυθμίσεις Εμφάνισης' :
        activeTab === 'users' ? 'Διαχείριση Χρηστών' :
        activeTab === 'seo' ? 'Ρυθμίσεις SEO' :
        'Ρυθμίσεις Analytics'
      }>
        {renderTabContent()}
      </AdminCard>
    </div>
  );
}