import { supabase } from './supabase';

export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  join_date: string;
  status: string;
  avatar_url: string;
}

export const employeeService = {
  async getAll() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as Employee[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as Employee;
  },

  async create(employee: Omit<Employee, 'id'>) {
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Employee>) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};
