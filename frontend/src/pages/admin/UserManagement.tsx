import { useEffect, useState } from 'react';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'tutor' | 'student' | 'coordinator'>('tutor');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      // Normalize MongoDB _id to id for the UI
      setUsers(res.data.users.map((u: any) => ({ ...u, id: u._id })));
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = (role: 'tutor' | 'student' | 'coordinator') => {
    setEditUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole(role);
    setShowDialog(true);
  };

  const openEditDialog = (user: User) => {
    setEditUser(user);
    setFormName(user.name);
    setFormEmail(user.email || '');
    setFormPassword('');
    setFormRole(user.role as 'tutor' | 'student' | 'coordinator');
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formEmail.trim() || (!editUser && !formPassword.trim())) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editUser) {
        const res = await api.patch(`/admin/users/${editUser.id}`, {
          name: formName,
          role: formRole,
          email: formEmail
        });
        const updatedUser = res.data.user;
        setUsers(prev => prev.map(u =>
          u.id === editUser.id ? { ...updatedUser, id: updatedUser._id } : u
        ));
        toast.success(`Updated ${formName}`);
      } else {
        await api.post('/admin/users', {
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        });
        toast.success(`Added ${formName} as ${formRole}`);
        fetchUsers();
      }
      setShowDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save user');
    }
  };

  return (
    <div>
      <PageHeader title="User Management">
        <button
          onClick={() => openAddDialog('tutor')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Tutor
        </button>
        <button
          onClick={() => openAddDialog('student')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Student
        </button>
        <button
          onClick={() => openAddDialog('coordinator')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Coordinator
        </button>
        <button
          onClick={() => openAddDialog('parent')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Parent
        </button>
      </PageHeader>

      <CardShell>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <DataTable headers={['Name', 'Role', 'Email', 'Status', 'Action']}>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-3 text-sm font-medium">{u.name}</td>
                <td className="py-3 px-3">
                  <StatusBadge variant={getStatusVariant(
                    u.role === 'tutor' ? 'scheduled' :
                    u.role === 'student' ? 'on-hold' : 
                    u.role === 'parent' ? 'active' : 'active'
                  )}>
                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                  </StatusBadge>
                </td>
                <td className="py-3 px-3 text-sm text-muted-foreground">{u.email || 'N/A'}</td>
                <td className="py-3 px-3">
                  <StatusBadge variant={getStatusVariant(u.status || 'active')}>
                    {(u.status || 'active').charAt(0).toUpperCase() + (u.status || 'active').slice(1)}
                  </StatusBadge>
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => openEditDialog(u)}
                    className="px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </CardShell>

      {/* Add/Edit User Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowDialog(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">
                {editUser ? 'Edit User' : `Add ${formRole.charAt(0).toUpperCase() + formRole.slice(1)}`}
              </h2>
              <button
                onClick={() => setShowDialog(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              {!editUser && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Password</label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as typeof formRole)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                >
                  <option value="tutor">Tutor</option>
                  <option value="student">Student</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  {editUser ? 'Update' : 'Add User'}
                </button>
                <button
                  onClick={() => setShowDialog(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
