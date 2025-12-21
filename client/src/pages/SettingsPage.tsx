import React, { useState, useEffect } from 'react';
import { Globe, Bell, Database, Smartphone, Shield, Building2, Briefcase, Users, Plus, Edit, Trash2, RefreshCw, Copy, Check } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '../components/common/UIComponents';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useTranslation } from 'react-i18next';
import Modal from '../components/common/Modal';
import { departmentService, Department } from '../services/departmentService';
import { roleService, Role } from '../services/roleService';
import { jobService, Job } from '../services/jobService';
import { companyService, Company, CreateCompanyData } from '../services/companyService';
import { companySettingsService, CompanySettings, RoleSalaryConfig, RolePermissionsConfig } from '../services/companySettingsService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, DollarSign, Calendar, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  
  // Departments state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [newDept, setNewDept] = useState({ name: '', code: '', description: '' });

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({ name: '', code: '', description: '' });

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [newJob, setNewJob] = useState({ role_id: '', name: '', code: '', description: '' });
  const [selectedRoleForJob, setSelectedRoleForJob] = useState<string>('');

  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newCompany, setNewCompany] = useState<CreateCompanyData>({
    name: '',
    code: '',
    description: '',
    api_endpoint: '',
    api_key: '',
    api_secret: '',
    sync_enabled: false,
    sync_frequency: 'manual',
    admin_email: '',
    admin_password: '',
    admin_first_name: '',
    admin_last_name: ''
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Company Settings state
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [roleSalaryConfigs, setRoleSalaryConfigs] = useState<RoleSalaryConfig[]>([]);
  const [rolePermissionsConfigs, setRolePermissionsConfigs] = useState<RolePermissionsConfig[]>([]);
  const [isCompanySettingsModalOpen, setIsCompanySettingsModalOpen] = useState(false);
  const [isSalaryConfigModalOpen, setIsSalaryConfigModalOpen] = useState(false);
  const [isPermissionsConfigModalOpen, setIsPermissionsConfigModalOpen] = useState(false);
  const [newSalaryConfig, setNewSalaryConfig] = useState<Partial<RoleSalaryConfig>>({
    role_id: '',
    job_id: '',
    base_salary: 0,
    currency: 'USD',
    housing_allowance: 0,
    transport_allowance: 0,
    meal_allowance: 0,
    medical_allowance: 0,
    other_allowances: 0,
    tax_percentage: 0,
    insurance_deduction: 0,
    other_deductions: 0
  });
  const [newPermissionsConfig, setNewPermissionsConfig] = useState<Partial<RolePermissionsConfig>>({
    role_id: '',
    can_approve_leave: false,
    can_approve_overtime: false,
    can_view_salary: false,
    can_edit_employee: false,
    can_delete_employee: false,
    can_manage_documents: false,
    can_manage_recruitment: false
  });

  useEffect(() => {
    if (activeTab === 'departments') loadDepartments();
    if (activeTab === 'roles') loadRoles();
    if (activeTab === 'jobs') {
      loadRoles();
      loadJobs();
    }
    if (activeTab === 'companies') loadCompanies();
    if (activeTab === 'company-settings' && user?.company_id) {
      loadCompanySettings();
      loadRoleSalaryConfigs();
      loadRolePermissionsConfigs();
    }
  }, [activeTab, user?.company_id]);

  const loadDepartments = async () => {
    try {
      const data = await departmentService.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await roleService.getAll();
      setRoles(data);
    } catch (error) {
      console.error('Failed to load roles:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const data = await jobService.getAll();
      setJobs(data);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departmentService.update(editingDept.id, newDept);
      } else {
        await departmentService.create(newDept);
      }
      await loadDepartments();
      setIsDeptModalOpen(false);
      setEditingDept(null);
      setNewDept({ name: '', code: '', description: '' });
    } catch (error) {
      console.error('Failed to save department:', error);
      alert('Failed to save department');
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await roleService.update(editingRole.id, newRole);
      } else {
        await roleService.create(newRole);
      }
      await loadRoles();
      setIsRoleModalOpen(false);
      setEditingRole(null);
      setNewRole({ name: '', code: '', description: '' });
    } catch (error) {
      console.error('Failed to save role:', error);
      alert('Failed to save role');
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleForJob && !editingJob) {
      alert('Please select a role');
      return;
    }
    try {
      if (editingJob) {
        await jobService.update(editingJob.id, { ...newJob, role_id: editingJob.role_id });
      } else {
        await jobService.create({ ...newJob, role_id: selectedRoleForJob });
      }
      await loadJobs();
      setIsJobModalOpen(false);
      setEditingJob(null);
      setNewJob({ role_id: '', name: '', code: '', description: '' });
      setSelectedRoleForJob('');
    } catch (error) {
      console.error('Failed to save job:', error);
      alert('Failed to save job');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await departmentService.delete(id);
      await loadDepartments();
    } catch (error) {
      console.error('Failed to delete department:', error);
      alert('Failed to delete department');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role? This will also delete all associated jobs.')) return;
    try {
      await roleService.delete(id);
      await loadRoles();
      await loadJobs();
    } catch (error) {
      console.error('Failed to delete role:', error);
      alert('Failed to delete role');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobService.delete(id);
      await loadJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job');
    }
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setNewDept({ name: dept.name, code: dept.code || '', description: dept.description || '' });
    setIsDeptModalOpen(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setNewRole({ name: role.name, code: role.code || '', description: role.description || '' });
    setIsRoleModalOpen(true);
  };

  const openEditJob = (job: Job) => {
    setEditingJob(job);
    setNewJob({ role_id: job.role_id, name: job.name, code: job.code || '', description: job.description || '' });
    setSelectedRoleForJob(job.role_id);
    setIsJobModalOpen(true);
  };

  const loadCompanies = async () => {
    try {
      const data = await companyService.getAll();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await companyService.update(editingCompany.id, {
          name: newCompany.name,
          code: newCompany.code || undefined,
          description: newCompany.description || undefined,
          api_endpoint: newCompany.api_endpoint || undefined,
          api_key: newCompany.api_key || undefined,
          api_secret: newCompany.api_secret || undefined,
          sync_enabled: newCompany.sync_enabled,
          sync_frequency: newCompany.sync_frequency
        });
      } else {
        const result = await companyService.create(newCompany);
        // Show success message with login credentials
        alert(
          `Company created successfully!\n\n` +
          `Admin Login Credentials:\n` +
          `Email: ${result.authUser.email}\n` +
          `Password: ${newCompany.admin_password}\n\n` +
          `The admin user can now login at /login`
        );
      }
      await loadCompanies();
      setIsCompanyModalOpen(false);
      setEditingCompany(null);
      setNewCompany({
        name: '',
        code: '',
        description: '',
        api_endpoint: '',
        api_key: '',
        api_secret: '',
        sync_enabled: false,
        sync_frequency: 'manual',
        admin_email: '',
        admin_password: '',
        admin_first_name: '',
        admin_last_name: ''
      });
    } catch (error: any) {
      console.error('Failed to save company:', error);
      alert(`Failed to save company: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company? This will also delete all associated employees and admins.')) return;
    try {
      await companyService.delete(id);
      await loadCompanies();
    } catch (error) {
      console.error('Failed to delete company:', error);
      alert('Failed to delete company');
    }
  };

  const handleSyncCompany = async (companyId: string) => {
    try {
      const result = await companyService.syncEmployees(companyId);
      alert(result.message);
      await loadCompanies();
    } catch (error) {
      console.error('Failed to sync company:', error);
      alert('Failed to sync company');
    }
  };

  const openEditCompany = (company: Company) => {
    setEditingCompany(company);
    setNewCompany({
      name: company.name,
      code: company.code || '',
      description: company.description || '',
      api_endpoint: company.api_endpoint || '',
      api_key: company.api_key || '',
      api_secret: company.api_secret || '',
      sync_enabled: company.sync_enabled,
      sync_frequency: company.sync_frequency,
      admin_email: '',
      admin_password: '',
      admin_first_name: '',
      admin_last_name: ''
    });
    setIsCompanyModalOpen(true);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateApiKey = () => {
    const key = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setNewCompany({ ...newCompany, api_key: key });
  };

  // Company Settings functions
  const loadCompanySettings = async () => {
    if (!user?.company_id) return;
    try {
      const settings = await companySettingsService.getCompanySettings(user.company_id);
      console.log('Loaded company settings:', settings);
      setCompanySettings(settings);
    } catch (error) {
      console.error('Failed to load company settings:', error);
    }
  };

  const loadRoleSalaryConfigs = async () => {
    if (!user?.company_id) return;
    try {
      const configs = await companySettingsService.getRoleSalaryConfigs(user.company_id);
      console.log('Loaded role salary configs:', configs);
      setRoleSalaryConfigs(configs);
    } catch (error) {
      console.error('Failed to load role salary configs:', error);
    }
  };

  const loadRolePermissionsConfigs = async () => {
    if (!user?.company_id) return;
    try {
      const configs = await companySettingsService.getRolePermissionsConfigs(user.company_id);
      console.log('Loaded role permissions configs:', configs);
      setRolePermissionsConfigs(configs);
    } catch (error) {
      console.error('Failed to load role permissions configs:', error);
    }
  };

  const handleSaveCompanySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.company_id) return;
    try {
      if (companySettings) {
        await companySettingsService.updateCompanySettings(user.company_id, companySettings);
      } else {
        // Create new settings
        const newSettings = await companySettingsService.updateCompanySettings(user.company_id, {
          company_id: user.company_id,
          default_working_hours_per_day: 8.00,
          default_working_days_per_week: 5,
          work_week_start_day: 1,
          work_week_end_day: 5,
          annual_leave_days_per_year: 20,
          sick_leave_days_per_year: 10,
          carry_forward_annual_leave: true,
          max_carry_forward_days: 5,
          payroll_cycle: 'monthly',
          payroll_day: 1,
          late_tolerance_minutes: 15,
          overtime_threshold_hours: 8.00,
          overtime_multiplier: 1.50,
          timezone: 'UTC',
          currency: 'USD'
        } as CompanySettings);
        setCompanySettings(newSettings);
      }
      alert('Company settings saved successfully!');
    } catch (error: any) {
      console.error('Failed to save company settings:', error);
      alert(`Failed to save company settings: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleSaveSalaryConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.company_id) return;
    
    // Validate that at least one of role_id or job_id is provided
    const roleId = newSalaryConfig.role_id && newSalaryConfig.role_id.trim() !== '' ? newSalaryConfig.role_id : null;
    const jobId = newSalaryConfig.job_id && newSalaryConfig.job_id.trim() !== '' ? newSalaryConfig.job_id : null;
    
    if (!roleId && !jobId) {
      alert('Please select either a Role or a Job for the salary configuration.');
      return;
    }
    
    try {
      // Convert empty strings to null for UUID fields
      const config = {
        ...newSalaryConfig,
        company_id: user.company_id,
        role_id: roleId || undefined,
        job_id: jobId || undefined,
        effective_from: new Date().toISOString().split('T')[0],
        is_active: true
      } as RoleSalaryConfig;
      
      // Remove undefined fields to avoid sending them
      Object.keys(config).forEach(key => {
        if (config[key as keyof RoleSalaryConfig] === undefined) {
          delete config[key as keyof RoleSalaryConfig];
        }
      });
      
      await companySettingsService.createRoleSalaryConfig(config);
      await loadRoleSalaryConfigs();
      setIsSalaryConfigModalOpen(false);
      setNewSalaryConfig({
        role_id: '',
        job_id: '',
        base_salary: 0,
        currency: 'USD',
        housing_allowance: 0,
        transport_allowance: 0,
        meal_allowance: 0,
        medical_allowance: 0,
        other_allowances: 0,
        tax_percentage: 0,
        insurance_deduction: 0,
        other_deductions: 0
      });
      alert('Salary configuration saved successfully!');
    } catch (error: any) {
      console.error('Failed to save salary config:', error);
      alert(`Failed to save salary config: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleSavePermissionsConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.company_id || !newPermissionsConfig.role_id) return;
    try {
      const config = {
        ...newPermissionsConfig,
        company_id: user.company_id,
        effective_from: new Date().toISOString().split('T')[0],
        is_active: true,
        permissions: {}
      } as RolePermissionsConfig;
      await companySettingsService.createRolePermissionsConfig(config);
      await loadRolePermissionsConfigs();
      setIsPermissionsConfigModalOpen(false);
      setNewPermissionsConfig({
        role_id: '',
        can_approve_leave: false,
        can_approve_overtime: false,
        can_view_salary: false,
        can_edit_employee: false,
        can_delete_employee: false,
        can_manage_documents: false,
        can_manage_recruitment: false
      });
      alert('Permissions configuration saved successfully!');
    } catch (error: any) {
      console.error('Failed to save permissions config:', error);
      alert(`Failed to save permissions config: ${error?.message || 'Unknown error'}`);
    }
  };

  const renderContent = () => {
    if (activeTab === 'general') {
      return (
        <>
          <CardHeader><CardTitle>{t('settings.general')}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('settings.companyName')}</label>
                <Input defaultValue="The System Enterprise" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('settings.supportEmail')}</label>
                <Input defaultValue="support@thesystem.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('settings.currency')}</label>
                <Select defaultValue="KWD">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KWD">KWD (Kuwaiti Dinar)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="SAR">SAR (Saudi Riyal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('settings.timezone')}</label>
                <Select defaultValue="Asia/Kuwait">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kuwait">Asia/Kuwait (GMT+3)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <Button>{t('common.save')}</Button>
            </div>
          </CardContent>
        </>
      );
    }

    if (activeTab === 'departments') {
      return (
        <>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Departments Master</CardTitle>
            <Button onClick={() => { setEditingDept(null); setNewDept({ name: '', code: '', description: '' }); setIsDeptModalOpen(true); }}>
              <Plus size={18} className="mr-2" />
              Add Department
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{dept.name}</h3>
                      {dept.code && <Badge variant="outline">{dept.code}</Badge>}
                    </div>
                    {dept.description && <p className="text-sm text-muted-foreground mt-1">{dept.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDept(dept)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteDepartment(dept.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              {departments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No departments found. Add one to get started.</p>
              )}
            </div>
          </CardContent>
        </>
      );
    }

    if (activeTab === 'roles') {
      return (
        <>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Roles Master</CardTitle>
            <Button onClick={() => { setEditingRole(null); setNewRole({ name: '', code: '', description: '' }); setIsRoleModalOpen(true); }}>
              <Plus size={18} className="mr-2" />
              Add Role
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{role.name}</h3>
                      {role.code && <Badge variant="outline">{role.code}</Badge>}
                    </div>
                    {role.description && <p className="text-sm text-muted-foreground mt-1">{role.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditRole(role)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(role.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              {roles.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No roles found. Add one to get started.</p>
              )}
            </div>
          </CardContent>
        </>
      );
    }

    if (activeTab === 'jobs') {
      // Group jobs by role
      const jobsByRole = jobs.reduce((acc, job) => {
        const roleName = job.role?.name || 'Unknown Role';
        if (!acc[roleName]) acc[roleName] = [];
        acc[roleName].push(job);
        return acc;
      }, {} as Record<string, Job[]>);

      return (
        <>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Jobs Master</CardTitle>
            <Button onClick={() => { setEditingJob(null); setNewJob({ role_id: '', name: '', code: '', description: '' }); setSelectedRoleForJob(''); setIsJobModalOpen(true); }}>
              <Plus size={18} className="mr-2" />
              Add Job
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(jobsByRole).map(([roleName, roleJobs]) => (
                <div key={roleName} className="space-y-2">
                  <h3 className="font-semibold text-lg mb-3">{roleName}</h3>
                  <div className="space-y-2">
                    {roleJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 ml-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{job.name}</span>
                            {job.code && <Badge variant="outline">{job.code}</Badge>}
                          </div>
                          {job.description && <p className="text-sm text-muted-foreground mt-1">{job.description}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditJob(job)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteJob(job.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No jobs found. Add one to get started.</p>
              )}
            </div>
          </CardContent>
        </>
      );
    }

    if (activeTab === 'companies') {
      return (
        <>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Companies & API Integration</CardTitle>
            <Button onClick={() => { 
              setEditingCompany(null); 
              setNewCompany({
                name: '',
                code: '',
                description: '',
                api_endpoint: '',
                api_key: '',
                api_secret: '',
                sync_enabled: false,
                sync_frequency: 'manual',
                admin_email: '',
                admin_password: '',
                admin_first_name: '',
                admin_last_name: ''
              }); 
              setIsCompanyModalOpen(true); 
            }}>
              <Plus size={18} className="mr-2" />
              Add Company
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{company.name}</h3>
                        {company.code && <Badge variant="outline">{company.code}</Badge>}
                        {company.sync_enabled && (
                          <Badge variant={company.sync_status === 'success' ? 'success' : company.sync_status === 'error' ? 'destructive' : 'default'}>
                            {company.sync_status}
                          </Badge>
                        )}
                      </div>
                      {company.description && <p className="text-sm text-muted-foreground mb-2">{company.description}</p>}
                      {company.api_endpoint && (
                        <div className="text-xs text-muted-foreground mb-2">
                          <strong>API Endpoint:</strong> {company.api_endpoint}
                        </div>
                      )}
                      {company.last_sync_at && (
                        <div className="text-xs text-muted-foreground">
                          <strong>Last Sync:</strong> {new Date(company.last_sync_at).toLocaleString()}
                        </div>
                      )}
                      {company.sync_error_message && (
                        <div className="text-xs text-destructive mt-2">
                          <strong>Error:</strong> {company.sync_error_message}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {company.api_key && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(company.api_key!, `api_key_${company.id}`)}
                          title="Copy API Key"
                        >
                          {copiedField === `api_key_${company.id}` ? <Check size={16} /> : <Copy size={16} />}
                        </Button>
                      )}
                      {company.sync_enabled && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSyncCompany(company.id)}
                          title="Sync Now"
                        >
                          <RefreshCw size={16} />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEditCompany(company)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCompany(company.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {companies.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No companies found. Add one to get started.</p>
              )}
            </div>
          </CardContent>
        </>
      );
    }

    if (activeTab === 'company-settings' && user?.company_id) {
      return (
        <>
          <CardHeader>
            <CardTitle>Company Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Working Hours Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock size={20} /> Working Hours
              </h3>
              <form onSubmit={handleSaveCompanySettings} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Working Hours per Day</label>
                    <Input
                      type="number"
                      step="0.25"
                      value={companySettings?.default_working_hours_per_day || 8}
                      onChange={(e) => setCompanySettings({ ...companySettings!, default_working_hours_per_day: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Working Days per Week</label>
                    <Input
                      type="number"
                      value={companySettings?.default_working_days_per_week || 5}
                      onChange={(e) => setCompanySettings({ ...companySettings!, default_working_days_per_week: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Week Start Day</label>
                    <Select
                      value={String(companySettings?.work_week_start_day || 1)}
                      onValueChange={(value) => setCompanySettings({ ...companySettings!, work_week_start_day: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="7">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Week End Day</label>
                    <Select
                      value={String(companySettings?.work_week_end_day || 5)}
                      onValueChange={(value) => setCompanySettings({ ...companySettings!, work_week_end_day: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="7">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Leave Settings */}
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Calendar size={20} /> Leave Settings
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Annual Leave Days per Year</label>
                      <Input
                        type="number"
                        value={companySettings?.annual_leave_days_per_year || 20}
                        onChange={(e) => setCompanySettings({ ...companySettings!, annual_leave_days_per_year: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sick Leave Days per Year</label>
                      <Input
                        type="number"
                        value={companySettings?.sick_leave_days_per_year || 10}
                        onChange={(e) => setCompanySettings({ ...companySettings!, sick_leave_days_per_year: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Max Carry Forward Days</label>
                      <Input
                        type="number"
                        value={companySettings?.max_carry_forward_days || 5}
                        onChange={(e) => setCompanySettings({ ...companySettings!, max_carry_forward_days: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2 flex items-center">
                      <input
                        type="checkbox"
                        checked={companySettings?.carry_forward_annual_leave || false}
                        onChange={(e) => setCompanySettings({ ...companySettings!, carry_forward_annual_leave: e.target.checked })}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium">Allow Carry Forward Annual Leave</label>
                    </div>
                  </div>
                </div>

                {/* Payroll Settings */}
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <DollarSign size={20} /> Payroll Settings
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payroll Cycle</label>
                      <Select
                        value={companySettings?.payroll_cycle || 'monthly'}
                        onValueChange={(value: 'monthly' | 'bi-weekly' | 'weekly') => setCompanySettings({ ...companySettings!, payroll_cycle: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payroll Day</label>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        value={companySettings?.payroll_day || 1}
                        onChange={(e) => setCompanySettings({ ...companySettings!, payroll_day: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                {/* Attendance Settings */}
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-lg font-semibold mb-4">Attendance Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Late Tolerance (Minutes)</label>
                      <Input
                        type="number"
                        value={companySettings?.late_tolerance_minutes || 15}
                        onChange={(e) => setCompanySettings({ ...companySettings!, late_tolerance_minutes: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Overtime Threshold (Hours)</label>
                      <Input
                        type="number"
                        step="0.25"
                        value={companySettings?.overtime_threshold_hours || 8}
                        onChange={(e) => setCompanySettings({ ...companySettings!, overtime_threshold_hours: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Overtime Multiplier</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={companySettings?.overtime_multiplier || 1.5}
                        onChange={(e) => setCompanySettings({ ...companySettings!, overtime_multiplier: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <Button type="submit">Save Settings</Button>
                </div>
              </form>
            </div>

            {/* Role/Job Salary Configuration */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign size={20} /> Role/Job Salary Configuration
                </h3>
                <Button onClick={() => setIsSalaryConfigModalOpen(true)}>
                  <Plus size={18} className="mr-2" />
                  Add Salary Config
                </Button>
              </div>
              <div className="space-y-3">
                {roleSalaryConfigs.map((config) => (
                  <div key={config.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {config.role_id ? `Role: ${roles.find(r => r.id === config.role_id)?.name || config.role_id}` : ''}
                          {config.job_id ? `Job: ${jobs.find(j => j.id === config.job_id)?.name || config.job_id}` : ''}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Base Salary: {config.currency} {config.base_salary.toLocaleString()}
                        </div>
                      </div>
                      <Badge variant={config.is_active ? 'success' : 'outline'}>
                        {config.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {roleSalaryConfigs.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No salary configurations found.</p>
                )}
              </div>
            </div>

            {/* Role Permissions Configuration */}
            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield size={20} /> Role Permissions
                </h3>
                <Button onClick={() => setIsPermissionsConfigModalOpen(true)}>
                  <Plus size={18} className="mr-2" />
                  Add Permissions Config
                </Button>
              </div>
              <div className="space-y-3">
                {rolePermissionsConfigs.map((config) => (
                  <div key={config.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          Role: {roles.find(r => r.id === config.role_id)?.name || config.role_id}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-2">
                          {config.can_approve_leave && <Badge variant="outline">Approve Leave</Badge>}
                          {config.can_approve_overtime && <Badge variant="outline">Approve Overtime</Badge>}
                          {config.can_view_salary && <Badge variant="outline">View Salary</Badge>}
                          {config.can_edit_employee && <Badge variant="outline">Edit Employee</Badge>}
                          {config.can_manage_documents && <Badge variant="outline">Manage Documents</Badge>}
                        </div>
                      </div>
                      <Badge variant={config.is_active ? 'success' : 'outline'}>
                        {config.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {rolePermissionsConfigs.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No permissions configurations found.</p>
                )}
              </div>
            </div>
          </CardContent>
        </>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.general')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation */}
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-2">
            {[
              { icon: Globe, label: t('settings.general'), tab: 'general' },
              { icon: Building2, label: 'Departments', tab: 'departments' },
              { icon: Briefcase, label: 'Roles', tab: 'roles' },
              { icon: Users, label: 'Jobs', tab: 'jobs' },
              { icon: Database, label: 'Companies', tab: 'companies', superAdminOnly: true },
              { icon: SettingsIcon, label: 'Company Settings', tab: 'company-settings', adminOnly: true },
              { icon: Bell, label: t('common.notifications'), tab: 'notifications' },
              { icon: Database, label: t('common.import'), tab: 'import' },
              { icon: Smartphone, label: 'Mobile App', tab: 'mobile' },
              { icon: Shield, label: 'Roles & Permissions', href: '/roles-permissions' },
            ].filter(item => {
              // Show Companies tab only to super_admin
              if (item.superAdminOnly && user?.role !== 'super_admin') return false;
              // Show Company Settings tab only to admin (not super_admin)
              if (item.adminOnly && user?.role !== 'admin') return false;
              return true;
            }).map((item, i) => {
              const content = (
                <>
                  <item.icon size={18} />
                  {item.label}
                </>
              );
              
              if (item.href) {
                return (
                  <Link key={i} href={item.href}>
                    <button
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    >
                      {content}
                    </button>
                  </Link>
                );
              }
              
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(item.tab || 'general')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.tab ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }`}
                >
                  {content}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="lg:col-span-2">
          {renderContent()}
        </Card>
      </div>

      {/* Department Modal */}
      <Modal isOpen={isDeptModalOpen} onClose={() => { setIsDeptModalOpen(false); setEditingDept(null); }} title={editingDept ? 'Edit Department' : 'Add Department'}>
        <form onSubmit={handleSaveDepartment} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input required value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} placeholder="Engineering" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Code</label>
            <Input value={newDept.code} onChange={e => setNewDept({...newDept, code: e.target.value})} placeholder="ENG" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-input bg-background/50 px-3 py-2 text-sm"
              value={newDept.description}
              onChange={e => setNewDept({...newDept, description: e.target.value})}
              placeholder="Department description"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => { setIsDeptModalOpen(false); setEditingDept(null); }}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Role Modal */}
      <Modal isOpen={isRoleModalOpen} onClose={() => { setIsRoleModalOpen(false); setEditingRole(null); }} title={editingRole ? 'Edit Role' : 'Add Role'}>
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input required value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value})} placeholder="Engineer" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Code</label>
            <Input value={newRole.code} onChange={e => setNewRole({...newRole, code: e.target.value})} placeholder="ENG" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-input bg-background/50 px-3 py-2 text-sm"
              value={newRole.description}
              onChange={e => setNewRole({...newRole, description: e.target.value})}
              placeholder="Role description"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => { setIsRoleModalOpen(false); setEditingRole(null); }}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Job Modal */}
      <Modal isOpen={isJobModalOpen} onClose={() => { setIsJobModalOpen(false); setEditingJob(null); setSelectedRoleForJob(''); }} title={editingJob ? 'Edit Job' : 'Add Job'}>
        <form onSubmit={handleSaveJob} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role *</label>
            <Select 
              value={editingJob ? editingJob.role_id : selectedRoleForJob} 
              onValueChange={(value) => setSelectedRoleForJob(value)}
              disabled={!!editingJob}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Name *</label>
            <Input required value={newJob.name} onChange={e => setNewJob({...newJob, name: e.target.value})} placeholder="Software Engineer" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Code</label>
            <Input value={newJob.code} onChange={e => setNewJob({...newJob, code: e.target.value})} placeholder="SWE" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-input bg-background/50 px-3 py-2 text-sm"
              value={newJob.description}
              onChange={e => setNewJob({...newJob, description: e.target.value})}
              placeholder="Job description"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => { setIsJobModalOpen(false); setEditingJob(null); setSelectedRoleForJob(''); }}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Company Modal */}
      <Modal isOpen={isCompanyModalOpen} onClose={() => { setIsCompanyModalOpen(false); setEditingCompany(null); }} title={editingCompany ? 'Edit Company' : 'Add Company'} size="xl">
        <form onSubmit={handleSaveCompany} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name *</label>
              <Input required value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} placeholder="Hospital Management System" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Code</label>
              <Input value={newCompany.code} onChange={e => setNewCompany({...newCompany, code: e.target.value})} placeholder="HMS-001" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-input bg-background/50 px-3 py-2 text-sm"
              value={newCompany.description}
              onChange={e => setNewCompany({...newCompany, description: e.target.value})}
              placeholder="Company description"
            />
          </div>
          
          <div className="pt-4 border-t border-white/10">
            <h3 className="font-semibold mb-3">API Integration Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">API Endpoint</label>
                <Input value={newCompany.api_endpoint} onChange={e => setNewCompany({...newCompany, api_endpoint: e.target.value})} placeholder="https://api.example.com/employees" />
                <p className="text-xs text-muted-foreground">External API endpoint to fetch employees from</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <div className="flex gap-2">
                    <Input value={newCompany.api_key} onChange={e => setNewCompany({...newCompany, api_key: e.target.value})} placeholder="sk_..." />
                    <Button type="button" variant="outline" onClick={generateApiKey}>Generate</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Secret</label>
                  <Input type="password" value={newCompany.api_secret} onChange={e => setNewCompany({...newCompany, api_secret: e.target.value})} placeholder="Secret key" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sync Frequency</label>
                  <Select value={newCompany.sync_frequency} onValueChange={(value: any) => setNewCompany({...newCompany, sync_frequency: value})}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newCompany.sync_enabled} onChange={e => setNewCompany({...newCompany, sync_enabled: e.target.checked})} className="rounded" />
                    <span className="text-sm font-medium">Enable Auto Sync</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {!editingCompany && (
            <div className="pt-4 border-t border-white/10">
              <h3 className="font-semibold mb-3">Admin Account</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Email *</label>
                  <Input required type="email" value={newCompany.admin_email} onChange={e => setNewCompany({...newCompany, admin_email: e.target.value})} placeholder="admin@company.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Admin Password *</label>
                  <Input required type="password" value={newCompany.admin_password} onChange={e => setNewCompany({...newCompany, admin_password: e.target.value})} placeholder="Password" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input value={newCompany.admin_first_name} onChange={e => setNewCompany({...newCompany, admin_first_name: e.target.value})} placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input value={newCompany.admin_last_name} onChange={e => setNewCompany({...newCompany, admin_last_name: e.target.value})} placeholder="Doe" />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => { setIsCompanyModalOpen(false); setEditingCompany(null); }}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Salary Config Modal */}
      <Modal isOpen={isSalaryConfigModalOpen} onClose={() => setIsSalaryConfigModalOpen(false)} title="Add Salary Configuration" size="xl">
        <form onSubmit={handleSaveSalaryConfig} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={newSalaryConfig.role_id || 'none'}
                onValueChange={(value) => setNewSalaryConfig({ ...newSalaryConfig, role_id: value === 'none' ? '' : value, job_id: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Job</label>
              <Select
                value={newSalaryConfig.job_id || 'none'}
                onValueChange={(value) => setNewSalaryConfig({ ...newSalaryConfig, job_id: value === 'none' ? '' : value, role_id: '' })}
                disabled={!newSalaryConfig.role_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {jobs.filter(j => !newSalaryConfig.role_id || j.role_id === newSalaryConfig.role_id).map(job => (
                    <SelectItem key={job.id} value={job.id}>{job.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Salary *</label>
              <Input
                type="number"
                step="0.01"
                required
                value={newSalaryConfig.base_salary || 0}
                onChange={(e) => setNewSalaryConfig({ ...newSalaryConfig, base_salary: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Currency</label>
              <Select
                value={newSalaryConfig.currency || 'USD'}
                onValueChange={(value) => setNewSalaryConfig({ ...newSalaryConfig, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="KWD">KWD</SelectItem>
                  <SelectItem value="SAR">SAR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-4 border-t border-white/10">
            <h4 className="font-semibold mb-3">Allowances</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Housing Allowance</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newSalaryConfig.housing_allowance || 0}
                  onChange={(e) => setNewSalaryConfig({ ...newSalaryConfig, housing_allowance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Transport Allowance</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newSalaryConfig.transport_allowance || 0}
                  onChange={(e) => setNewSalaryConfig({ ...newSalaryConfig, transport_allowance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Meal Allowance</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newSalaryConfig.meal_allowance || 0}
                  onChange={(e) => setNewSalaryConfig({ ...newSalaryConfig, meal_allowance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Medical Allowance</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newSalaryConfig.medical_allowance || 0}
                  onChange={(e) => setNewSalaryConfig({ ...newSalaryConfig, medical_allowance: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-white/10">
            <h4 className="font-semibold mb-3">Deductions</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax Percentage</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newSalaryConfig.tax_percentage || 0}
                  onChange={(e) => setNewSalaryConfig({ ...newSalaryConfig, tax_percentage: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Insurance Deduction</label>
                <Input
                  type="number"
                  step="0.01"
                  value={newSalaryConfig.insurance_deduction || 0}
                  onChange={(e) => setNewSalaryConfig({ ...newSalaryConfig, insurance_deduction: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setIsSalaryConfigModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {/* Permissions Config Modal */}
      <Modal isOpen={isPermissionsConfigModalOpen} onClose={() => setIsPermissionsConfigModalOpen(false)} title="Add Permissions Configuration">
        <form onSubmit={handleSavePermissionsConfig} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Role *</label>
            <Select
              value={newPermissionsConfig.role_id || ''}
              onValueChange={(value) => setNewPermissionsConfig({ ...newPermissionsConfig, role_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h4 className="font-semibold">Permissions</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPermissionsConfig.can_approve_leave || false}
                  onChange={(e) => setNewPermissionsConfig({ ...newPermissionsConfig, can_approve_leave: e.target.checked })}
                />
                <span className="text-sm">Can Approve Leave</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPermissionsConfig.can_approve_overtime || false}
                  onChange={(e) => setNewPermissionsConfig({ ...newPermissionsConfig, can_approve_overtime: e.target.checked })}
                />
                <span className="text-sm">Can Approve Overtime</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPermissionsConfig.can_view_salary || false}
                  onChange={(e) => setNewPermissionsConfig({ ...newPermissionsConfig, can_view_salary: e.target.checked })}
                />
                <span className="text-sm">Can View Salary</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPermissionsConfig.can_edit_employee || false}
                  onChange={(e) => setNewPermissionsConfig({ ...newPermissionsConfig, can_edit_employee: e.target.checked })}
                />
                <span className="text-sm">Can Edit Employee</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPermissionsConfig.can_delete_employee || false}
                  onChange={(e) => setNewPermissionsConfig({ ...newPermissionsConfig, can_delete_employee: e.target.checked })}
                />
                <span className="text-sm">Can Delete Employee</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPermissionsConfig.can_manage_documents || false}
                  onChange={(e) => setNewPermissionsConfig({ ...newPermissionsConfig, can_manage_documents: e.target.checked })}
                />
                <span className="text-sm">Can Manage Documents</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newPermissionsConfig.can_manage_recruitment || false}
                  onChange={(e) => setNewPermissionsConfig({ ...newPermissionsConfig, can_manage_recruitment: e.target.checked })}
                />
                <span className="text-sm">Can Manage Recruitment</span>
              </label>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => setIsPermissionsConfigModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

