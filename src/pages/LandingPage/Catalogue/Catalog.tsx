import React, { useState, useEffect } from 'react';
import { Search, Phone } from 'lucide-react';
import { CatalogCard } from '@/components/cards/CatalogCard';
import { FilterSection } from '@/components/common/FilterSection';
import { Pagination } from '@/components/common/Pagination';
import { useGeneralContent } from '@/contexts/GeneralContentContext';
import { Button } from '@/components/ui/button';

export const Catalog: React.FC = () => {
  const { getContentByTag, getContentIn } = useGeneralContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const catalogueBannerImage = getContentIn('image-banner', 'catalogue-banner') || getContentByTag('catalogue-banner') || '';

  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'rental', label: 'Rental Mobil' },
    { value: 'travel', label: 'Travel' },
    { value: 'paket', label: 'Paket Wisata' },
    { value: 'airport', label: 'Airport Transfer' }
  ];

  const locations = [
    { value: 'all', label: 'Semua Lokasi' },
    { value: 'jakarta', label: 'Jakarta' },
    { value: 'bali', label: 'Bali' },
    { value: 'yogyakarta', label: 'Yogyakarta' },
    { value: 'bandung', label: 'Bandung' },
    { value: 'surabaya', label: 'Surabaya' }
  ];

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-low', label: 'Harga Terendah' },
    { value: 'price-high', label: 'Harga Tertinggi' },
    { value: 'rating', label: 'Rating Tertinggi' }
  ];

  const catalogItems = [
    {
      id: 1,
      title: 'Paket Wisata Bali 3D2N',
      description: 'Paket wisata lengkap ke Bali dengan hotel bintang 4, transportasi AC, dan tour guide profesional.',
      price: 'Rp 1.500.000',
      originalPrice: 'Rp 1.800.000',
      image: 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      reviewCount: 245,
      category: 'paket',
      location: 'Bali',
      duration: '3 Hari 2 Malam',
      features: ['Hotel Bintang 4', 'Transportasi AC', 'Tour Guide', 'Makan 6x'],
      discount: 17,
      isPopular: true,
      isNew: false
    },
    {
      id: 2,
      title: 'Rental Mobil Jakarta',
      description: 'Rental mobil dengan berbagai pilihan kelas dari ekonomi hingga premium dengan driver berpengalaman.',
      price: 'Rp 300.000',
      originalPrice: 'Rp 350.000',
      image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      reviewCount: 189,
      category: 'rental',
      location: 'Jakarta',
      duration: 'Per Hari',
      features: ['Driver Profesional', 'BBM Termasuk', 'Asuransi', 'GPS'],
      discount: 14,
      isPopular: true,
      isNew: false
    },
    {
      id: 3,
      title: 'Travel Jogja - Jakarta',
      description: 'Layanan travel antar kota dengan armada nyaman dan jadwal fleksibel.',
      price: 'Rp 150.000',
      originalPrice: 'Rp 175.000',
      image: 'https://images.pexels.com/photos/1139541/pexels-photo-1139541.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviewCount: 312,
      category: 'travel',
      location: 'Yogyakarta',
      duration: '8 Jam',
      features: ['AC', 'WiFi', 'Snack', 'Asuransi'],
      discount: 14,
      isPopular: false,
      isNew: true
    },
    {
      id: 4,
      title: 'Paket Wisata Raja Ampat',
      description: 'Petualangan diving dan snorkeling di surga bawah laut Raja Ampat dengan akomodasi terbaik.',
      price: 'Rp 3.500.000',
      originalPrice: 'Rp 4.200.000',
      image: 'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      reviewCount: 156,
      category: 'paket',
      location: 'Papua',
      duration: '5 Hari 4 Malam',
      features: ['Liveaboard', 'Diving Gear', 'Meals', 'Guide'],
      discount: 17,
      isPopular: false,
      isNew: false
    }
  ];

  const filteredItems = catalogItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || item.location.toLowerCase() === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Sorting logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price.replace(/[^\d]/g, '')) - parseFloat(b.price.replace(/[^\d]/g, ''));
      case 'price-high':
        return parseFloat(b.price.replace(/[^\d]/g, '')) - parseFloat(a.price.replace(/[^\d]/g, ''));
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedLocation, sortBy]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header Section with Cinematic Background */}
      <section className="relative min-h-[60vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${catalogueBannerImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
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
                Pilihan paket wisata eksklusif dan layanan transportasi premium untuk pengalaman perjalanan tak terlupakan di seluruh Indonesia.
              </p>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
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
            ></path>
          </svg>
        </div>
      </section>

      {/* Search and Filter Section */}
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
          categories={categories}
          locations={locations}
          sortOptions={sortOptions}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-16">
        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Hasil Pencarian
            </h2>
            <p className="text-gray-500 font-normal">
              Menampilkan {paginatedItems.length} dari {sortedItems.length} layanan terbaik
            </p>
          </div>
          <div className="h-1 w-20 bg-blue-600 rounded-full md:hidden" />
        </div>

        {/* Catalog Items */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
          : "space-y-8"
        }>
          {paginatedItems.map((item, idx) => (
            <div key={item.id} className="animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
              <CatalogCard item={item} viewMode={viewMode} />
            </div>
          ))}
        </div>

        {sortedItems.length === 0 && (
          <div className="text-center py-24 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 mx-auto mb-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl">
              <Search className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Tidak Ada Layanan Ditemukan
            </h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">
              Coba sesuaikan filter atau kata kunci pencarian Anda untuk menemukan hasil yang diinginkan.
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

        {/* Pagination */}
        <div className="mt-16 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Reusing the same CTA Section from Home for consistency */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-blue-600 rounded-2xl overflow-hidden p-8 md:p-16 text-center">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 50 Q 25 40 50 50 T 100 50 V 100 H 0 Z" fill="white" />
                <path d="M0 60 Q 25 50 50 60 T 100 60 V 100 H 0 Z" fill="white" opacity="0.5" />
              </svg>
            </div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Siap Memulai Perjalanan Anda?
              </h2>
              <p className="text-blue-50 text-lg opacity-90">
                Hubungi kami sekarang dan dapatkan penawaran terbaik!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 rounded-xl px-8 h-12 font-normal flex items-center gap-2"
                  onClick={() => window.open('https://wa.me/62812345678', '_blank')}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="h-5 w-5" />
                  WhatsApp Kami
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white bg-transparent hover:bg-white/10 rounded-xl px-8 h-12 font-normal flex items-center gap-2"
                  onClick={() => window.location.href = 'tel:02112345678'}
                >
                  <Phone className="h-5 w-5" />
                  Hubungi Kami
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
