import React, { useState } from 'react';
import { User, Mail, Calendar, Settings, Bell, Shield } from 'lucide-react';
import AdminCard from '../ui/AdminCard';
import Breadcrumbs from '../ui/Breadcrumbs';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatar: string;
  phone: string;
  bio: string;
  language: string;
  location: string;
  notificationPreferences: {
    email: boolean;
    browser: boolean;
    system: boolean;
  };
  lastLogin: string;
  createdAt: string;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'general'|'security'|'preferences'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Mock profile data - θα αντικατασταθεί με Supabase auth user
  const [profile, setProfile] = useState<UserProfile>({
    id: "usr_12345",
    username: "admin",
    email: "admin@aion-flow.com",
    fullName: "Διαχειριστής Συστήματος",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=fff",
    phone: "+30 210 1234567",
    bio: "Κύριος διαχειριστής του AION Flow με πλήρη δικαιώματα συστήματος.",
    language: "el",
    location: "Αθήνα, Ελλάδα",
    notificationPreferences: {
      email: true,
      browser: true,
      system: false
    },
    lastLogin: "2024-04-19T10:30:00Z",
    createdAt: "2024-12-10T09:00:00Z"
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Mock save - θα αντικατασταθεί με Supabase update
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Avatar Section */}
            <AdminCard title="Φωτογραφία Προφίλ">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={avatarPreview || profile.avatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-slate-600"
                  />
                  <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full cursor-pointer transition-colors">
                    <User className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{profile.fullName}</h3>
                  <p className="text-gray-400">{profile.role}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Μέλος από {new Date(profile.createdAt).toLocaleDateString('el-GR')}
                  </p>
                </div>
              </div>
            </AdminCard>

            {/* Basic Info */}
            <AdminCard title="Βασικές Πληροφορίες">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Πλήρες Όνομα
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile({...profile, username: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Τηλέφωνο
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Τοποθεσία
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Βιογραφικό
                  </label>
                  <textarea
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </AdminCard>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <AdminCard title="Αλλαγή Κωδικού">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Τρέχων Κωδικός
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Νέος Κωδικός
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Επιβεβαίωση Νέου Κωδικού
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </AdminCard>

            <AdminCard title="Δραστηριότητα Λογαριασμού">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Τελευταία Σύνδεση</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(profile.lastLogin).toLocaleString('el-GR')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Δημιουργία Λογαριασμού</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(profile.createdAt).toLocaleDateString('el-GR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AdminCard>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <AdminCard title="Προτιμήσεις Εμφάνισης">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Πυκνότητα Διεπαφής
                  </label>
                  <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="compact">Συμπαγής</option>
                    <option value="normal" selected>Κανονική</option>
                    <option value="comfortable">Άνετη</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Γλώσσα
                  </label>
                  <select
                    value={profile.language}
                    onChange={(e) => setProfile({...profile, language: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="el">Ελληνικά</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </AdminCard>

            <AdminCard title="Ειδοποιήσεις">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Email Ειδοποιήσεις</p>
                      <p className="text-gray-400 text-sm">Λήψη ειδοποιήσεων μέσω email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.email}
                      onChange={(e) => setProfile({
                        ...profile,
                        notificationPreferences: {
                          ...profile.notificationPreferences,
                          email: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Browser Ειδοποιήσεις</p>
                      <p className="text-gray-400 text-sm">Λήψη ειδοποιήσεων στο browser</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.browser}
                      onChange={(e) => setProfile({
                        ...profile,
                        notificationPreferences: {
                          ...profile.notificationPreferences,
                          browser: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Συστημικές Ειδοποιήσεις</p>
                      <p className="text-gray-400 text-sm">Λήψη ειδοποιήσεων συστήματος</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.system}
                      onChange={(e) => setProfile({
                        ...profile,
                        notificationPreferences: {
                          ...profile.notificationPreferences,
                          system: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </AdminCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Προφίλ</h1>
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
              <Settings className="w-4 h-4" />
              Αποθήκευση
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
          Οι αλλαγές αποθηκεύτηκαν επιτυχώς!
        </div>
      )}

      {/* Tabs */}
      <AdminCard>
        <div className="flex space-x-1">
          {[
            { id: 'general', label: 'Γενικά', icon: User },
            { id: 'security', label: 'Ασφάλεια', icon: Shield },
            { id: 'preferences', label: 'Προτιμήσεις', icon: Settings }
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
      {renderTabContent()}
    </div>
  );
}