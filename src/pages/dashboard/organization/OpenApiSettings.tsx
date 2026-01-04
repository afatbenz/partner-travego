import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { http } from '@/lib/http';
import { useToast } from '@/hooks/use-toast';

export const OpenApiSettings: React.FC = () => {
  const [domainUrl, setDomainUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newDomainUrl, setNewDomainUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await http.get<any>('/api/organization/detail');
      if (response.data?.data?.domain_url || response.data?.domain_url) {
        const url = response.data?.data?.domain_url || response.data?.domain_url;
        setDomainUrl(url);
        setNewDomainUrl(url);
      }
    } catch (error) {
      console.error('Failed to fetch organization details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await http.post('/api/organization/update/domain-url', { domain_url: newDomainUrl });
      setDomainUrl(newDomainUrl);
      setIsEditing(false);
      toast({
        title: "Sukses",
        description: "Domain URL berhasil diperbarui",
      });
    } catch (error) {
      console.error('Failed to update domain url:', error);
      toast({
        title: "Gagal",
        description: "Gagal memperbarui Domain URL",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Open API Settings</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Kelola konfigurasi Open API organisasi Anda
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Whitelist Domain URL</CardTitle>
          <CardDescription>
            Domain yang diizinkan untuk mengakses API Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isEditing ? (
              <div className="flex flex-col space-y-4 max-w-xl">
                <div className="flex gap-2">
                    <Input
                    value={newDomainUrl}
                    onChange={(e) => setNewDomainUrl(e.target.value)}
                    placeholder="https://example.com"
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleUpdate}>Simpan</Button>
                    <Button variant="outline" onClick={() => {
                        setIsEditing(false);
                        setNewDomainUrl(domainUrl);
                    }}>Batal</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Domain URL</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {domainUrl || '-'}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
