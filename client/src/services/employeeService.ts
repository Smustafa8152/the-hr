import { supabase } from './supabase';
import { employees as mockEmployees } from '../data/mockData';

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
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.warn('Supabase error, falling back to mock data:', error.message);
        return this.getMockData();
      }
      
      return data as Employee[];
    } catch (err) {
      console.warn('Connection failed, falling back to mock data');
      return this.getMockData();
    }
  },

  getMockData(): Employee[] {
    return mockEmployees.map(e => ({
      id: e.id,
      employee_id: e.id,
      first_name: e.name.split(' ')[0],
      last_name: e.name.split(' ').slice(1).join(' '),
      email: e.email,
      phone: e.phone,
      department: e.department,
      designation: e.designation,
      join_date: e.joinDate,
      status: e.status,
      avatar_url: e.avatar
    }));
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
