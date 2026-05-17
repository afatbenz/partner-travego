import { useState, useEffect } from 'react';
import { fetchTourPackages, TourPackageCatalogItem } from '@/lib/tourPackages';

export const useTourPackages = () => {
  const [items, setItems] = useState<TourPackageCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTourPackages();
        if (!cancelled) setItems(data);
      } catch (err) {
        console.error('Failed to fetch tour packages:', err);
        if (!cancelled) setError('Gagal memuat paket wisata');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
};
