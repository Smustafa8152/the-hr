import { api, adminApi } from './api';

export interface Document {
  id: string;
  name: string;
  url: string;
  size: string;
  type: string;
  owner: string;
  folder: string;
  created_at: string;
}

export const documentService = {
  async getAll() {
    try {
      const response = await api.get('/documents?select=*&order=created_at.desc');
      return response.data as Document[];
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return [];
      }
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  async upload(file: File, folder: string) {
    try {
      // In a real app, this would upload to Supabase Storage first, then create a record
      // For now, we'll just create the record assuming the file is handled
      const payload = {
        name: file.name,
        url: '#', // Placeholder until storage is implemented
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.name.split('.').pop() || 'file',
        owner: 'Admin', // Should come from auth context
        folder
      };
      
      const response = await adminApi.post('/documents', payload);
      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await adminApi.delete(`/documents?id=eq.${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};
