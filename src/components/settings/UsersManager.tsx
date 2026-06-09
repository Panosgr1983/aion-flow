import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../../types/supabase';
import { getRoleLabel } from '../../lib/permissions';
import { UserRole } from '../../types/supabase';
import { RefreshCw, Shield, User, Mail, Clock, Check, X } from 'lucide-react';

const ALL_ROLES: UserRole[] = ['admin', 'editor', 'sales', 'viewer'];

export default function UsersManager() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (userId: string, role: UserRole) => {
    setUpdating(userId);
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (!error) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    setUpdating(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Διαχείριση Χρηστών</h2>
          <p className="text-sm text-gray-500">{users.length} χρήστες</p>
        </div>
        <button onClick={load} className="btn-ghost p-2"><RefreshCw size={14} /></button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th className="text-left py-3 px-4">Χρήστης</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Ρόλος</th>
                <th className="text-left py-3 px-4">Κατάσταση</th>
                <th className="text-left py-3 px-4">Τελευταία Σύνδεση</th>
                <th className="text-left py-3 px-4">Εγγραφή</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-900/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {u.full_name?.charAt(0).toUpperCase() || u.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-200">{u.full_name || '—'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={e => updateRole(u.id, e.target.value as UserRole)}
                      disabled={updating === u.id}
                      className="input text-xs py-1 px-2 min-w-[120px]"
                    >
                      {ALL_ROLES.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    {u.is_active !== false ? (
                      <span className="flex items-center gap-1 text-xs text-green-400"><Check size={12} /> Ενεργός</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-400"><X size={12} /> Ανενεργός</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('el-GR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
