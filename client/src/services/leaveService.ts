import { supabase } from './supabase';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  employees?: {
    first_name: string;
    last_name: string;
    employee_id: string;
    avatar_url?: string;
  };
}

export const leaveService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employees (
            first_name,
            last_name,
            employee_id,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as LeaveRequest[];
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      return [];
    }
  },

  async getByEmployee(employeeId: string) {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as LeaveRequest[];
    } catch (error) {
      console.error('Error fetching employee leaves:', error);
      return [];
    }
  },

  async create(request: Omit<LeaveRequest, 'id' | 'created_at' | 'status'>) {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert([{ ...request, status: 'Pending' }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: 'Approved' | 'Rejected') {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating leave status:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting leave request:', error);
      throw error;
    }
  }
};
