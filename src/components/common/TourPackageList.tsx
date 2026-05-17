import React from 'react';
import { CatalogPackageCard } from '@/components/common/CatalogPackageCard';
import { TourPackageCatalogItem } from '@/lib/tourPackages';

interface TourPackageListProps {
  items: TourPackageCatalogItem[];
  loading?: boolean;
  limit?: number;
  viewMode?: 'grid' | 'list';
  loadingMessage?: string;
  emptyMessage?: string;
  spinnerClassName?: string;
}

export const TourPackageList: React.FC<TourPackageListProps> = ({
  items,
  loading = false,
  limit,
  viewMode = 'grid',
  loadingMessage = 'Memuat Paket Wisata...',
  emptyMessage = 'Belum ada paket wisata tersedia.',
  spinnerClassName = 'border-orange-500',
}) => {
  const displayItems = limit ? items.slice(0, limit) : items;

  if (loading) {
    return (
      <div className="col-span-full text-center py-20">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${spinnerClassName}`}
        />
        <p className="text-gray-500 font-bold">{loadingMessage}</p>
      </div>
    );
  }

  if (displayItems.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <>
        {displayItems.map((item, idx) => (
          <div
            key={item.id}
            className="animate-in fade-in slide-in-from-bottom duration-700"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <CatalogPackageCard item={item} viewMode="list" />
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {displayItems.map((item, idx) => (
        <div
          key={item.id}
          className="animate-in fade-in slide-in-from-bottom duration-1000"
          style={{ animationDelay: `${idx * 150}ms` }}
        >
          <CatalogPackageCard item={item} viewMode="grid" />
        </div>
      ))}
    </>
  );
};

