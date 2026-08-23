import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { InquirySection } from '@/components/common/InquirySection';
import { ArmadaCard } from '@/components/cards/ArmadaCard';
import { ArmadaMobileCard } from '@/components/cards/ArmadaMobileCard';
import { FilterSection } from '@/components/common/FilterSection';
import { Pagination } from '@/components/common/Pagination';
import { http } from '@/lib/http';
import { useGeneralContent } from '@/contexts/GeneralContentContext';

interface Fleet {
  fleet_id: string;
  fleet_name: string;
  fleet_type: string;
  fleet_type_label: string;
  capacity: number;
  capacities: string;
  production_year: number;
  engine: string;
  body: string;
  description: string;
  thumbnail: string;
  original_price: number;
  uom: string;
  created_at: string;
  discount_type: string | null;
  discount_value: number | null;
  price: number;
  facilities?: { facility: string }[];
  cities?: string[];
  rating?: number;
  reviews?: { star: number; review: string }[];
}

interface FleetResponse {
  status: string;
  message: string;
  data: Fleet[];
  transaction_id: string;
}

const Armada = () => {
  const { getContentByTag, getContentIn } = useGeneralContent();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = (searchParams.get('query') || '').trim();
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const armadaBannerImage = getContentIn('image-banner', 'fleet-banner') || getContentByTag('fleet-banner') || '';

  const [armadaData, setArmadaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounced search → update URL query param (server-filtered)
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      const trimmed = value.trim();
      if (trimmed) params.set('query', trimmed);
      else params.delete('query');
      setSearchParams(params);
    }, 500);
  };

  useEffect(() => () => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
  }, []);

  useEffect(() => {
    const fetchFleets = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (queryParam) params.set('query', queryParam);
        const qs = params.toString();
        const res = await http.get<FleetResponse>(`/api/service/fleet${qs ? `?${qs}` : ''}`);
        if (res.data && Array.isArray(res.data.data)) {
          const mappedFleets = res.data.data.map((fleet) => {

            return {
              id: fleet.fleet_id,
              name: fleet.fleet_name,
              type: fleet.fleet_type_label,
              capacity: `${fleet.capacities} Penumpang`,
              price: `Rp ${fleet.price.toLocaleString('id-ID')}/${fleet.uom}`,
              originalPrice: fleet.discount_type !== null && fleet.original_price ? `Rp ${fleet.original_price.toLocaleString('id-ID')}/${fleet.uom}` : '',
              image: fleet.thumbnail,
              rating: fleet.rating || 0.0, // Default value as API doesn't provide rating
              reviews: fleet.reviews ? fleet.reviews.length : 0, // Default value
              features: fleet.facilities && fleet.facilities.length > 0
                ? fleet.facilities.map(f => f.facility)
                : (fleet.body ? [fleet.body] : ['AC', 'Audio System']),
              location: `${fleet.cities?.[0] ?? ''} ${(fleet.cities?.length ?? 0) > 1 ? `(+ ${(fleet.cities?.length ?? 0) - 1} kota lainnya)` : ''}`,
              pickupAreas: fleet.cities || [],
              transmission: 'Manual', // Default value
              fuel: 'Bensin', // Default value
              year: fleet.production_year.toString(),
              productionYear: fleet.production_year,
              badge: fleet.discount_value ? 'Discount' : 'New',
              discount: fleet.discount_value ? `-${fleet.discount_value}%` : '',
              rawPrice: fleet.price // For sorting
            };
          });
          setArmadaData(mappedFleets);
        }
      } catch (err) {
        console.error('Failed to fetch fleets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFleets();
  }, [queryParam]);

  // Extract unique categories from data
  const uniqueTypes = Array.from(new Set(armadaData.map(item => item.type)));
  const dynamicCategories = [
    { value: 'all', label: 'Semua Tipe' },
    ...uniqueTypes.map(type => ({ value: type.toLowerCase(), label: type }))
  ];

  const categories = uniqueTypes.length > 0 ? dynamicCategories : [
    { value: 'all', label: 'Semua Tipe' },
    { value: 'mpv', label: 'MPV' },
    { value: 'minibus', label: 'Minibus' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'truck', label: 'Truck' }
  ];

  const locations = [
    { value: 'all', label: 'Semua Lokasi' },
    { value: 'jakarta', label: 'Jakarta' },
    { value: 'bandung', label: 'Bandung' },
    { value: 'surabaya', label: 'Surabaya' },
    { value: 'yogyakarta', label: 'Yogyakarta' }
  ];

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-low', label: 'Harga Terendah' },
    { value: 'price-high', label: 'Harga Tertinggi' },
    { value: 'rating', label: 'Rating Tertinggi' }
  ];

  // Sort + paginate (all client-side filtering removed — server filters by query)
  const sortedArmada = [...armadaData].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.rawPrice || 0) - (b.rawPrice || 0);
      case 'price-high':
        return (b.rawPrice || 0) - (a.rawPrice || 0);
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedArmada.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedArmada = sortedArmada.slice(startIndex, endIndex);

  // Reset to first page when URL query or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [queryParam, sortBy]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header Section with Cinematic Background */}
      <section className="relative min-h-[60vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${armadaBannerImage})`,
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
                Armada <span className="text-blue-400">Terbaik</span> <br />
                Untuk Anda
              </h1>
              <p className="text-lg text-blue-50 font-light leading-relaxed">
                Pilih armada terbaik untuk perjalanan Anda dengan kenyamanan dan keamanan terjamin. Layanan rental premium di seluruh Indonesia.
              </p>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] mb-[-1px] z-10">
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
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
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
        
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-normal text-gray-600 dark:text-gray-300 px-4">
            Menampilkan {viewMode === 'list'
              ? paginatedArmada.filter((a) => a.image).length
              : paginatedArmada.length} dari {sortedArmada.length} armada
          </p>
        </div>
      </div>

      {/* Armada Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat armada...</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-4"
            }>
              {viewMode === 'list' ? (
                // List view: reuse ArmadaMobileCard (sama dengan Home mobile list) + hanya yang punya thumbnail
                paginatedArmada.filter((a) => a.image).length > 0 ? (
                  paginatedArmada.filter((a) => a.image).map((armada) => (
                    <ArmadaMobileCard key={armada.id} armada={armada} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Tidak ada armada yang ditemukan.</p>
                  </div>
                )
              ) : paginatedArmada.length > 0 ? (
                <>
                  {/* Mobile: vertical stack ArmadaMobileCard (sama seperti Home) */}
                  <div className="flex flex-col gap-4 md:hidden">
                    {paginatedArmada.filter((a) => a.image).length > 0 ? (
                      paginatedArmada.filter((a) => a.image).map((armada) => (
                        <ArmadaMobileCard key={armada.id} armada={armada} />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">Tidak ada armada yang ditemukan.</p>
                      </div>
                    )}
                  </div>
                  {/* Desktop: grid ArmadaCard */}
                  <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:col-span-2 lg:col-span-3">
                    {paginatedArmada.map((armada) => (
                      <ArmadaCard key={armada.id} armada={armada} viewMode="grid" />
                    ))}
                  </div>
                </>
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">Tidak ada armada yang ditemukan.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {paginatedArmada.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-8"
              />
            )}
          </>
        )}
      </div>

      {/* Inquiry Section */}
      <InquirySection />
    </div>
  );
};

export default Armada;
