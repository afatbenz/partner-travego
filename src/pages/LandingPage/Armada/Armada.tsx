import { useState, useEffect } from 'react';
import { InquirySection } from '@/components/common/InquirySection';
import { ArmadaCard } from '@/components/cards/ArmadaCard';
import { FilterSection } from '@/components/common/FilterSection';
import { Pagination } from '@/components/common/Pagination';
import { http } from '@/lib/http';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Fleet {
  fleet_id: string;
  fleet_name: string;
  fleet_type: string;
  capacity: number;
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
}

interface FleetResponse {
  status: string;
  message: string;
  data: Fleet[];
  transaction_id: string;
}

const Armada = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [armadaData, setArmadaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFleets = async () => {
      try {
        const res = await http.get<FleetResponse>('/api/service/fleet');
        if (res.data && Array.isArray(res.data.data)) {
          const mappedFleets = res.data.data.map((fleet) => {
            const displayUom = fleet.duration ? `${fleet.duration} ${fleet.uom}` : fleet.uom;
            
            return {
              id: fleet.fleet_id,
              name: fleet.fleet_name,
              type: fleet.fleet_type,
              capacity: `${fleet.capacity} Penumpang`,
              price: `Rp ${fleet.price.toLocaleString('id-ID')}/${displayUom}`,
              originalPrice: fleet.discount_type !== null && fleet.original_price ? `Rp ${fleet.original_price.toLocaleString('id-ID')}/${fleet.uom}` : '',
              image: fleet.thumbnail,
              rating: 5.0, // Default value as API doesn't provide rating
              reviews: 0, // Default value
              features: fleet.facilities && fleet.facilities.length > 0 
                ? fleet.facilities.map(f => f.facility) 
                : (fleet.body ? [fleet.body] : ['AC', 'Audio System']),
              location: 'Jakarta', // Default fallback
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
  }, []);

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

  const filteredArmada = armadaData.filter(armada => {
    const matchesSearch = armada.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         armada.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || armada.type.toLowerCase().includes(selectedCategory);
    const matchesLocation = selectedLocation === 'all' || armada.location.toLowerCase().includes(selectedLocation);
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Sorting logic
  const sortedArmada = [...filteredArmada].sort((a, b) => {
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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedLocation, sortBy]);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section with Cinematic Background */}
      <section className="relative min-h-[60vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://cdn.paradisotour.co.id/wp-content/uploads/2024/01/Kelebihan-Mobil-Hiace.jpg)',
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

      {/* Search and Filter Section - Overlapping */}
      <div className="relative z-20 -mt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <FilterSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
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
          <p className="text-sm text-gray-600 dark:text-gray-300 px-4">
            Menampilkan {paginatedArmada.length} dari {sortedArmada.length} armada
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
              ? "grid grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-6"
            }>
              {paginatedArmada.length > 0 ? (
                paginatedArmada.map((armada) => (
                  <ArmadaCard key={armada.id} armada={armada} viewMode={viewMode} />
                ))
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
