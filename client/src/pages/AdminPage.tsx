import React from 'react';
import { Shield, Users, Activity, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../components/common/UIComponents';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Admin & Governance</h1>
        <p className="text-muted-foreground">System controls, user roles, and audit logs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Management */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <Button size="sm" className="gap-2"><Users size={16} /> Add User</Button>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: 'Admin User', email: 'admin@thesystem.com', role: 'Super Admin', status: 'Active', login: 'Just now' },
                  { name: 'HR Manager', email: 'hr@thesystem.com', role: 'HR Admin', status: 'Active', login: '2 hours ago' },
                  { name: 'Payroll Officer', email: 'finance@thesystem.com', role: 'Finance', status: 'Active', login: '1 day ago' },
                ].map((user, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline">{user.role}</Badge></td>
                    <td className="px-4 py-3"><Badge variant="success">{user.status}</Badge></td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{user.login}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Security Controls</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3">
                <Lock size={16} /> Reset Password
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Shield size={16} /> 2FA Settings
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Activity size={16} /> View Audit Logs
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
    </div>
  );
}
