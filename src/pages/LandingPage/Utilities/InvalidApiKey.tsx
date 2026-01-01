import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const InvalidApiKey: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Akses Ditolak
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          API Credential tidak valid. Hubungi administrator.
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Coba Lagi
        </Button>
      </div>
    </div>
  );
};
