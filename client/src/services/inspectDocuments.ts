import { api } from './api';

export async function inspectDocuments() {
  try {
    const response = await api.get('/documents?limit=1');
    console.log('Documents table exists:', response.status);
    return true;
  } catch (error: any) {
    console.error('Error inspecting documents:', error.response?.status, error.response?.data);
    return false;
  }
}
