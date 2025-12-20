import { employeeService } from './employeeService';
import { payrollService } from './payrollService';

export const analyticsService = {
  async getHeadcountGrowth() {
    try {
      const employees = await employeeService.getAll();
      // Group by month of join_date
      const growth: Record<string, number> = {};
      
      employees.forEach(emp => {
        if (emp.join_date) {
          const date = new Date(emp.join_date);
          const month = date.toLocaleString('default', { month: 'short' });
          growth[month] = (growth[month] || 0) + 1;
        }
      });

      // Convert to array and accumulate
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let currentCount = 0;
      
      return months.map(month => {
        currentCount += growth[month] || 0;
        return { name: month, employees: currentCount };
      });
    } catch (error) {
      console.error('Error calculating headcount growth:', error);
      return [];
    }
  },

  async getAttritionByDept() {
    try {
      const employees = await employeeService.getAll();
      // Calculate active employees by department
      const deptCounts: Record<string, number> = {};
      
      employees.forEach(emp => {
        if (emp.department) {
          deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
        }
      });

      return Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
    } catch (error) {
      console.error('Error calculating department stats:', error);
      return [];
    }
  },

  async getPayrollCostTrend() {
    try {
      const cycles = await payrollService.getAll();
      // Sort by period/date
      const sortedCycles = cycles.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      return sortedCycles.map(cycle => ({
        name: cycle.period,
        cost: cycle.total_amount
      }));
    } catch (error) {
      console.error('Error calculating payroll trend:', error);
      return [];
    }
  }
};
