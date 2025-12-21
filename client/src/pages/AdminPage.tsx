import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, Lock, Plus, Trash2, Edit, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input } from '../components/common/UIComponents';
import { useTranslation } from 'react-i18next';
import { userManagementService, AdminUser, CreateAdminUserData } from '../services/userManagementService';
import { companyService } from '../services/companyService';
import Modal from '../components/common/Modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function AdminPage() {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [newAdmin, setNewAdmin] = useState<CreateAdminUserData>({
    email: '',
    password: '',
    role: 'super_admin',
    company_id: undefined,
    first_name: '',
    last_name: ''
  });

  useEffect(() => {
    loadAdmins();
    loadCompanies();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await userManagementService.getAllAdmins();
      setAdmins(data);
    } catch (error) {
      console.error('Failed to load admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await companyService.getAll();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userManagementService.createAdmin(newAdmin);
      await loadAdmins();
      setIsModalOpen(false);
      setNewAdmin({
        email: '',
        password: '',
        role: 'super_admin',
        company_id: undefined,
        first_name: '',
        last_name: ''
      });
      alert('Admin user created successfully!');
    } catch (error: any) {
      console.error('Failed to create admin:', error);
      alert(`Failed to create admin: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await userManagementService.updateAdminStatus(userId, !currentStatus);
      await loadAdmins();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert(`Failed to update status: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete admin user ${email}? This action cannot be undone.`)) {
      return;
    }
    try {
      await userManagementService.deleteAdmin(userId);
      await loadAdmins();
      alert('Admin user deleted successfully!');
    } catch (error: any) {
      console.error('Failed to delete admin:', error);
      alert(`Failed to delete admin: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">{t('admin.title')}</h1>
        <p className="text-muted-foreground">{t('admin.securityControls')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Management */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Admin Users</CardTitle>
            <Button size="sm" className="gap-2" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} /> Add Admin
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : admins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No admin users found</div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{admin.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(admin.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={admin.role === 'super_admin' ? 'default' : 'outline'}>
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {admin.company_name ? (
                          <span className="text-sm">{admin.company_name}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={admin.is_active ? 'success' : 'destructive'}>
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(admin.user_id, admin.is_active)}
                          >
                            {admin.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(admin.user_id, admin.email)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t('admin.securityControls')}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Lock size={16} /> {t('common.edit')} Password
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Shield size={16} /> 2FA {t('settings.title')}
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Activity size={16} /> {t('common.view')} {t('admin.auditLogs')}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-destructive/10 border-destructive/20">
            <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">Irreversible actions. Proceed with caution.</p>
              <Button variant="destructive" className="w-full">System Maintenance Mode</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Admin User"
      >
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              required
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password *</label>
            <Input
              type="password"
              required
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              placeholder="Enter password"
              minLength={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={newAdmin.first_name}
                onChange={(e) => setNewAdmin({ ...newAdmin, first_name: e.target.value })}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                value={newAdmin.last_name}
                onChange={(e) => setNewAdmin({ ...newAdmin, last_name: e.target.value })}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role *</label>
            <Select
              value={newAdmin.role}
              onValueChange={(value: 'super_admin' | 'admin') => setNewAdmin({ ...newAdmin, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newAdmin.role === 'admin' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Company (Optional for Admin)</label>
              <Select
                value={newAdmin.company_id || 'none'}
                onValueChange={(value) => setNewAdmin({ ...newAdmin, company_id: value === 'none' ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Company (Super Admin)</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Admin
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
