import { useState, useEffect } from 'react';
import { InquirySection } from '@/components/common/InquirySection';
import { ArmadaCard } from '@/components/cards/ArmadaCard';
import { FilterSection } from '@/components/common/FilterSection';
import { Pagination } from '@/components/common/Pagination';
import { http } from '@/lib/http';

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
  pickup_areas?: { city_name: string }[];
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
            const displayPrice = fleet.uom === 'jam' ? fleet.price / 12 : fleet.price;
            const displayUom = fleet.uom === 'jam' ? 'jam' : fleet.uom;
            
            return {
              id: fleet.fleet_id,
              name: fleet.fleet_name,
              type: fleet.fleet_type,
              capacity: `${fleet.capacity} Penumpang`,
              price: `Rp ${displayPrice.toLocaleString('id-ID')}/${displayUom}`,
              originalPrice: fleet.original_price ? `Rp ${fleet.original_price.toLocaleString('id-ID')}/${fleet.uom}` : '',
              image: fleet.thumbnail,
              rating: 5.0, // Default value as API doesn't provide rating
              reviews: 0, // Default value
              features: fleet.facilities && fleet.facilities.length > 0 
                ? fleet.facilities.map(f => f.facility) 
                : (fleet.body ? [fleet.body] : ['AC', 'Audio System']),
              location: 'Jakarta', // Default fallback
              pickupAreas: fleet.pickup_areas ? fleet.pickup_areas.map(p => p.city_name) : [],
              transmission: 'Manual', // Default value
              fuel: 'Bensin', // Default value
              year: fleet.production_year.toString(),
              productionYear: fleet.production_year,
              badge: fleet.discount_value ? 'Discount' : 'New',
              discount: fleet.discount_value ? `-${fleet.discount_value}%` : '',
              rawPrice: displayPrice // For sorting
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section with Parallax Background */}
      <section className="relative h-80 w-full text-white overflow-hidden">
        {/* Background Image dengan Parallax Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{
            backgroundImage: 'url(https://cdn.paradisotour.co.id/wp-content/uploads/2024/01/Kelebihan-Mobil-Hiace.jpg)'
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Armada Kami</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Pilih armada terbaik untuk perjalanan Anda dengan kenyamanan dan keamanan terjamin
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6">
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
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Menampilkan {paginatedArmada.length} dari {sortedArmada.length} armada
            </p>
          </div>
        </div>
      </div>

      {/* Armada Grid */}
      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat armada...</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-6" 
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
