import { supabase } from './supabase';

export const analyticsService = {
  async getHeadcountGrowth() {
    // In a real app, this would be a complex query or a dedicated analytics table
    // For now, we'll return mock data that mimics the structure expected by the chart
    return [
      { name: 'Jan', employees: 1100 },
      { name: 'Feb', employees: 1120 },
      { name: 'Mar', employees: 1150 },
      { name: 'Apr', employees: 1180 },
      { name: 'May', employees: 1200 },
      { name: 'Jun', employees: 1248 },
    ];
  },

  async getAttritionByDept() {
    return [
      { name: 'Engineering', value: 12 },
      { name: 'Sales', value: 18 },
      { name: 'Marketing', value: 8 },
      { name: 'HR', value: 4 },
    ];
  },

  async getPayrollCostTrend() {
    return [
      { name: 'Jan', cost: 130000 },
      { name: 'Feb', cost: 132000 },
      { name: 'Mar', cost: 135000 },
      { name: 'Apr', cost: 138000 },
      { name: 'May', cost: 140000 },
      { name: 'Jun', cost: 142000 },
    ];
  }
};
