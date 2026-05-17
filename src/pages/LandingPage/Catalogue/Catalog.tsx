import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import { FilterSection } from '@/components/common/FilterSection';
import { Pagination } from '@/components/common/Pagination';
import { CTASection } from '@/components/common/CTASection';
import { TourPackageList } from '@/components/common/TourPackageList';
import { useTourPackages } from '@/hooks/useTourPackages';
import { useGeneralContent } from '@/contexts/GeneralContentContext';
import { Button } from '@/components/ui/button';

export const Catalog: React.FC = () => {
  const { getContentByTag, getContentIn } = useGeneralContent();
  const { items: tourPackages, loading } = useTourPackages();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const catalogueBannerImage =
    getContentIn('image-banner', 'catalogue-banner') || getContentByTag('catalogue-banner') || '';

  const locationOptions = useMemo(() => {
    const cities = new Set<string>();
    tourPackages.forEach((item) => {
      if (item.location && item.location !== '-') cities.add(item.location);
      item.destinations
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean)
        .forEach((d) => cities.add(d));
    });
    return [
      { value: 'all', label: 'Semua Lokasi' },
      ...Array.from(cities)
        .sort()
        .map((city) => ({ value: city.toLowerCase(), label: city })),
    ];
  }, [tourPackages]);

  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    tourPackages.forEach((item) => {
      if (item.typeLabel) types.add(item.typeLabel);
    });
    return [
      { value: 'all', label: 'Semua Kategori' },
      ...Array.from(types)
        .sort()
        .map((type) => ({ value: type.toLowerCase(), label: type })),
    ];
  }, [tourPackages]);

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-low', label: 'Harga Terendah' },
    { value: 'price-high', label: 'Harga Tertinggi' },
    { value: 'rating', label: 'Rating Tertinggi' },
  ];

  const filteredItems = useMemo(() => {
    return tourPackages.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.destinations.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'all' || item.typeLabel.toLowerCase() === selectedCategory;

      const matchesLocation =
        selectedLocation === 'all' ||
        item.location.toLowerCase() === selectedLocation ||
        item.destinations.toLowerCase().includes(selectedLocation);

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [tourPackages, searchQuery, selectedCategory, selectedLocation]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.priceValue - b.priceValue;
        case 'price-high':
          return b.priceValue - a.priceValue;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  }, [filteredItems, sortBy]);

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedLocation, sortBy]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <section className="relative min-h-[60vh] flex items-center pt-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${catalogueBannerImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-7xl mx-auto">
          <div className="max-w-2xl animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                Temukan <span className="text-orange-400">Petualangan</span> <br />
                Sempurna Anda
              </h1>
              <p className="text-lg text-blue-50 font-light leading-relaxed">
                Pilihan paket wisata eksklusif dan layanan transportasi premium untuk pengalaman perjalanan
                tak terlupakan di seluruh Indonesia.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10">
          <svg
            className="relative block w-[calc(100%+1.3px)] h-[60px] md:h-[100px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-1.42,1200,0.48V120H0Z"
              className="fill-white dark:fill-gray-950"
            />
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-8 pb-4">
        <FilterSection
          searchTerm={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          categories={typeOptions}
          locations={locationOptions}
          sortOptions={sortOptions}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hasil Pencarian</h2>
            <p className="text-gray-500 font-normal">
              Menampilkan {paginatedItems.length} dari {sortedItems.length} paket wisata
            </p>
          </div>
          <div className="h-1 w-20 bg-blue-600 rounded-full md:hidden" />
        </div>

        {(loading || sortedItems.length > 0) && (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
                : 'space-y-8'
            }
          >
            <TourPackageList
              items={paginatedItems}
              loading={loading}
              viewMode={viewMode}
              loadingMessage="Memuat paket wisata..."
              emptyMessage=""
            />
          </div>
        )}

        {!loading && sortedItems.length === 0 && (
          <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 mx-auto mb-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl">
              <Search className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tidak Ada Paket Ditemukan
            </h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">
              Coba sesuaikan filter atau kata kunci pencarian Anda.
            </p>
            <Button
              variant="outline"
              className="mt-8 rounded-xl px-8"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLocation('all');
                setSortBy('default');
              }}
            >
              Reset Semua Filter
            </Button>
          </div>
        )}

        <div className="mt-16 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      <CTASection />
    </div>
  );
};

