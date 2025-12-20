import React, { useState, useEffect } from 'react';
import { Folder, FileText, MoreVertical, Search, Upload, Grid, List, Trash2, Download } from 'lucide-react';
import { Card, CardContent, Button, Input } from '../components/common/UIComponents';
import { documentService, Document } from '../services/documentService';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await documentService.getAll();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const newDoc = await documentService.upload(e.target.files[0], selectedFolder || 'General');
        setDocuments([newDoc, ...documents]);
      } catch (error) {
        console.error('Failed to upload:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await documentService.delete(id);
      setDocuments(documents.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const filteredDocs = documents.filter(doc => 
    (selectedFolder ? doc.folder === selectedFolder : true) &&
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading">Documents</h1>
          <p className="text-muted-foreground">Centralized digital filing cabinet</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search files..." 
              className="pl-9 w-64" 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleUpload}
            />
            <Button className="gap-2">
              <Upload size={16} /> Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Folders */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {['Contracts', 'Policies', 'Visas', 'Payroll', 'Onboarding', 'Templates'].map((folder, i) => (
          <Card 
            key={i} 
            className={`cursor-pointer transition-colors group ${selectedFolder === folder ? 'bg-primary/10 border-primary' : 'hover:bg-white/5'}`}
            onClick={() => setSelectedFolder(selectedFolder === folder ? null : folder)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <Folder size={48} className={`transition-colors ${selectedFolder === folder ? 'text-primary' : 'text-blue-400 group-hover:text-blue-300'}`} />
              <span className="font-medium text-sm">{folder}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Files */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/5">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Folder</th>
                <th className="px-6 py-3">Owner</th>
                <th className="px-6 py-3">Date Modified</th>
                <th className="px-6 py-3">Size</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
              ) : filteredDocs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No files found.</td></tr>
              ) : filteredDocs.map((file) => (
                <tr key={file.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3 font-medium">
                    <FileText size={18} className="text-muted-foreground" />
                    {file.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <span className="px-2 py-1 rounded bg-white/5 text-xs">{file.folder}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{file.owner}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(file.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-muted-foreground">{file.size}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                        <Download size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:text-destructive"
                        onClick={() => handleDelete(file.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
