import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '../components/common/UIComponents';

const KPICard = ({ title, value, change, trend, icon: Icon, color }: any) => (
  <Card className="relative overflow-hidden group">
    <div className={`absolute top-0 right-0 rtl:left-0 rtl:right-auto p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon size={64} />
    </div>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <Badge variant={trend === 'up' ? 'success' : 'destructive'} className="flex items-center gap-1">
          {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {change}
        </Badge>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="text-3xl font-bold font-heading tracking-tight">{value}</div>
      </div>
    </CardContent>
  </Card>
);

const attendanceData = [
  { name: 'Mon', present: 45, late: 2, absent: 3 },
  { name: 'Tue', present: 48, late: 1, absent: 1 },
  { name: 'Wed', present: 47, late: 3, absent: 0 },
  { name: 'Thu', present: 46, late: 0, absent: 4 },
  { name: 'Fri', present: 44, late: 4, absent: 2 },
  { name: 'Sat', present: 20, late: 0, absent: 0 },
  { name: 'Sun', present: 0, late: 0, absent: 0 },
];

const departmentData = [
  { name: 'Engineering', value: 35, color: '#3b82f6' },
  { name: 'Sales', value: 25, color: '#14b8a6' },
  { name: 'Marketing', value: 15, color: '#8b5cf6' },
  { name: 'HR', value: 10, color: '#f59e0b' },
  { name: 'Finance', value: 15, color: '#ec4899' },
];

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('common.welcome')}, Admin. {t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar size={16} className="mr-2 rtl:ml-2 rtl:mr-0" />
            Dec 20, 2025
          </Button>
          <Button variant="primary" size="sm">
            {t('dashboard.generateReport')}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title={t('dashboard.totalEmployees')} 
          value="1,248" 
          change="+12%" 
          trend="up" 
          icon={Users} 
          color="bg-blue-500" 
        />
        <KPICard 
          title={t('dashboard.onTimeToday')} 
          value="94%" 
          change="+2.5%" 
          trend="up" 
          icon={Clock} 
          color="bg-emerald-500" 
        />
        <KPICard 
          title={t('dashboard.pendingRequests')} 
          value="23" 
          change="-5%" 
          trend="down" 
          icon={AlertTriangle} 
          color="bg-amber-500" 
        />
        <KPICard 
          title={t('dashboard.payrollCost')} 
          value="$142k" 
          change="+8%" 
          trend="up" 
          icon={TrendingUp} 
          color="bg-purple-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('dashboard.attendanceOverview')}</CardTitle>
            <Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceData}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--muted-foreground)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="present" 
                    stroke="var(--primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPresent)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="late" 
                    stroke="var(--destructive)" 
                    strokeWidth={2}
                    fill="transparent" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.headcountByDept')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="var(--muted-foreground)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    width={80}
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { user: 'Sarah Jones', action: 'Approved leave request', target: 'Ahmed Al-Sabah', time: '10 mins ago', icon: '✅' },
                { user: 'System', action: 'Auto-rejected late regularization', target: 'EMP-004', time: '25 mins ago', icon: '🤖' },
                { user: 'Mohammed Ali', action: 'Updated payroll policy', target: 'v2.1', time: '1 hour ago', icon: '📝' },
                { user: 'System', action: 'Detected early departure', target: 'Ravi Kumar', time: '2 hours ago', icon: '⚠️' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-lg border border-white/10 group-hover:border-primary/50 transition-colors">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      <span className="font-bold text-primary">{item.user}</span> {item.action} <span className="text-muted-foreground">for {item.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.systemAlerts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-destructive">Payroll Cutoff Approaching</h4>
                  <p className="text-xs text-muted-foreground mt-1">Payroll processing will be locked in 24 hours. Please finalize all pending approvals.</p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <Clock className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-amber-500">High Late Arrivals Detected</h4>
                  <p className="text-xs text-muted-foreground mt-1">Engineering department has exceeded the late arrival threshold by 15% this week.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
                <Users className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-blue-500">New Policy Version Active</h4>
                  <p className="text-xs text-muted-foreground mt-1">Attendance Policy v2.0 is now effective. All new punches will be validated against new rules.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
