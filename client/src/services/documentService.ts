import { api } from './api';

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
    } catch (error) {
      console.warn('Documents table missing or error, using mock');
      return [
        { id: '1', name: 'Employee_Handbook_2025.pdf', owner: 'Admin', created_at: '2025-12-15', size: '2.4 MB', folder: 'Policies', type: 'pdf', url: '#' },
        { id: '2', name: 'Offer_Letter_Template.docx', owner: 'HR Manager', created_at: '2025-12-10', size: '156 KB', folder: 'Templates', type: 'docx', url: '#' },
        { id: '3', name: 'Visa_Process_Flow.png', owner: 'PRO', created_at: '2025-11-28', size: '1.1 MB', folder: 'Visas', type: 'png', url: '#' },
      ];
    }
  },

  async upload(file: File, folder: string) {
    // Mock upload
    console.log('Uploading file:', file.name, 'to', folder);
    return {
      id: Math.random().toString(),
      name: file.name,
      url: URL.createObjectURL(file),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.name.split('.').pop() || 'file',
      owner: 'Admin',
      folder,
      created_at: new Date().toISOString()
    };
  },

  async delete(id: string) {
    // Mock delete
    console.log('Deleting document:', id);
    return true;
  }
};
