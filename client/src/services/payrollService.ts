import { supabase } from './supabase';

export interface PayrollCycle {
  id: string;
  period: string;
  total_employees: number;
  total_amount: number;
  status: 'Draft' | 'Processing' | 'Processed';
  approval_date?: string;
  created_at: string;
}

export const payrollService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('payroll_cycles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as PayrollCycle[];
    } catch (error) {
      console.error('Error fetching payroll cycles:', error);
      return [];
    }
  },

  async createCycle(period: string) {
    try {
      // Mock calculation logic - in real app this would be a backend function
      const { count } = await supabase.from('employees').select('*', { count: 'exact', head: true });
      
      const newCycle = {
        period,
        total_employees: count || 0,
        total_amount: (count || 0) * 1500, // Mock average salary
        status: 'Processing'
      };

      const { data, error } = await supabase
        .from('payroll_cycles')
        .insert([newCycle])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payroll cycle:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: 'Processed') {
    try {
      const { data, error } = await supabase
        .from('payroll_cycles')
        .update({ 
          status,
          approval_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating payroll status:', error);
      throw error;
    }
  }
};
