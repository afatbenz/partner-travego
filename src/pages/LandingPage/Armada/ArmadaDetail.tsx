import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Star, Share2, Heart, Search, ChevronLeft, Users, Car, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ImagePopup } from '@/components/common/ImagePopup';
import { http } from '@/lib/http';

// Interfaces
interface FleetMeta {
  fleet_id: string;
  fleet_type: string;
  fleet_name: string;
  capacity: number;
  engine: string;
  body: string;
  description: string;
  thumbnail: string;
  created_at: string;
  production_year?: number;
  transmission?: string;
  fuel_type?: string;
}

interface FleetPickup {
  city_id: number;
  city_name: string;
}

interface FleetAddon {
  uuid: string;
  addon_name: string;
  addon_desc: string;
  addon_price: number;
}

interface FleetPricing {
  price_id: number;
  duration: number;
  rent_type: number;
  rent_type_label: string;
  price: number;
  disc_amount: number;
  disc_price: number;
  uom: string;
}

interface FleetImage {
  uuid: string;
  path_file: string;
}

interface FleetDetailData {
  meta: FleetMeta;
  facilities: string[];
  pickup: FleetPickup[];
  addon: FleetAddon[];
  pricing: FleetPricing[];
  images: FleetImage[];
}

interface FleetDetailResponse {
  status: string;
  message: string;
  data: FleetDetailData;
}

export const ArmadaDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedPricing, setSelectedPricing] = useState<FleetPricing | null>(null);
  const [showAllPricing, setShowAllPricing] = useState(false);
  
  const [fleet, setFleet] = useState<FleetDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFleetDetail = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await http.post<FleetDetailResponse>('/api/service/fleet/detail', { fleet_id: id });
        if (response.data.status === 'success') {
          setFleet(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch fleet details');
        }
      } catch (err) {
        console.error('Error fetching fleet detail:', err);
        setError('Terjadi kesalahan saat mengambil detail armada. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchFleetDetail();
  }, [id]);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleImageChange = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleOrderNow = () => {
    if (fleet && selectedPricing) {
      navigate(`/checkout/armada/${fleet.meta.fleet_id}`, { 
        state: { 
          fleet_id: fleet.meta.fleet_id,
          price_id: selectedPricing.price_id,
          pricing: selectedPricing 
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat detail armada...</p>
        </div>
      </div>
    );
  }

  if (error || !fleet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
          <p className="text-gray-600 mb-6">{error || 'Data armada tidak ditemukan'}</p>
          <Button onClick={() => navigate('/armada')} variant="outline">
            Kembali ke Daftar Armada
          </Button>
        </div>
      </div>
    );
  }

  // Prepare images for gallery (thumbnail + additional images)
  const allImages = [fleet.meta.thumbnail, ...fleet.images.map(img => img.path_file)].filter(Boolean);
  
  // Calculate display price (lowest price)
  const lowestPrice = fleet.pricing.length > 0 
    ? Math.min(...fleet.pricing.map(p => p.price))
    : 0;
    
  const displayPrice = lowestPrice;
  // Find the UOM associated with the lowest price
  const lowestPriceItem = fleet.pricing.find(p => p.price === lowestPrice);
  const priceUom = lowestPriceItem ? lowestPriceItem.uom : 'hari';

  // Format price for display
  const formattedPrice = `Rp ${displayPrice.toLocaleString('id-ID')}`;
  
  // Default rating (API doesn't provide rating yet)
  const rating = 5.0;
  const reviews = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner with Parallax Background */}
      <section className="relative h-96 w-full text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{
            backgroundImage: `url(${fleet.meta.thumbnail})`
          }}
        />
        <div className="absolute inset-0 bg-black/75" />
        
        <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="max-w-4xl w-full">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="!w-auto !h-auto p-2 mb-6 bg-transparent text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
              {fleet.meta.fleet_name}
            </h1>

            {/* Vehicle Info */}
            <div className="flex flex-wrap items-center mb-4 gap-3">
              <div className="flex items-center">
                <Car className="h-5 w-5 mr-2 text-white" />
                <span className="text-white">{fleet.meta.fleet_type}</span>
              </div>
              <span className="hidden sm:inline text-white">•</span>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-white" />
                <span className="text-white">{fleet.meta.capacity} Penumpang</span>
              </div>
              {fleet.meta.production_year && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {fleet.meta.production_year}
                </Badge>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-white" />
                <span className="text-white">
                  {fleet.pickup.length > 0 
                    ? `${fleet.pickup.length} Area Penjemputan` 
                    : 'Konfirmasi Admin'}
                </span>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-white" />
                <span className="text-white">Rating: {rating} ({reviews} ulasan)</span>
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="absolute top-6 right-6 flex space-x-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Image */}
            <div className="lg:col-span-3">
              <div className="relative h-64 sm:h-96 rounded-lg overflow-hidden cursor-pointer group" onClick={() => handleImageClick(0)}>
                <img
                  src={allImages[0]}
                  alt={fleet.meta.fleet_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            </div>

            {/* Thumbnail Grid */}
            <div className="lg:col-span-1">
              <div className="grid grid-cols-2 gap-3">
                {allImages.slice(1, 5).map((image, index) => (
                  <div
                    key={index + 1}
                    className="relative h-24 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => handleImageClick(index + 1)}
                  >
                    <img
                      src={image}
                      alt={`Gallery ${index + 2}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                ))}
                
                {/* See All Photos Button if more than 5 images */}
                {allImages.length > 5 && (
                  <div
                    className="relative h-24 rounded-lg overflow-hidden cursor-pointer group bg-gray-200 flex items-center justify-center"
                    onClick={() => handleImageClick(0)}
                  >
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-2 bg-white/80 rounded-full flex items-center justify-center">
                        <Search className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="text-sm text-gray-600 font-medium">Lihat Semua ({allImages.length})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Deskripsi Armada</h2>
              
              <div 
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: fleet.meta.description }}
              />

              {/* Pickup Areas */}
              {fleet.pickup.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Area Penjemputan</h3>
                  <div className="flex flex-wrap gap-2">
                    {fleet.pickup.map((area) => (
                      <Badge key={area.city_id} variant="outline" className="px-3 py-1 border-blue-200 bg-blue-50 text-blue-700">
                        <MapPin className="h-3 w-3 mr-1" />
                        {area.city_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications & Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Specifications */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Spesifikasi</h3>
                  <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                    <ul className="space-y-3">
                      <li className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="font-medium w-24">Mesin:</span> {fleet.meta.engine}
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="font-medium w-24">Body:</span> {fleet.meta.body}
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="font-medium w-24">Kapasitas:</span> {fleet.meta.capacity} Orang
                      </li>
                      <li className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="font-medium w-24">Tipe:</span> {fleet.meta.fleet_type}
                      </li>
                      {fleet.meta.transmission && (
                        <li className="flex items-center text-sm text-gray-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-medium w-24">Transmisi:</span> {fleet.meta.transmission}
                        </li>
                      )}
                      {fleet.meta.fuel_type && (
                        <li className="flex items-center text-sm text-gray-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-medium w-24">Bahan Bakar:</span> {fleet.meta.fuel_type}
                        </li>
                      )}
                      {fleet.meta.production_year && (
                        <li className="flex items-center text-sm text-gray-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-medium w-24">Tahun:</span> {fleet.meta.production_year}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Facilities */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Fasilitas</h3>
                  <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                    <ul className="space-y-2">
                      {fleet.facilities.map((feature, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                {/* Pricing Card */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-1">
                      Mulai dari
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {formattedPrice}
                    </div>
                    <div className="text-sm text-gray-500">
                       {lowestPriceItem && lowestPriceItem.duration > 0 
                         ? `/ ${lowestPriceItem.duration} ${lowestPriceItem.uom}` 
                         : `/${priceUom}`}
                    </div>
                  </div>

                  {/* Pricing Options List */}
                  {fleet.pricing.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm">Pilihan Durasi:</h4>
                      {(showAllPricing ? fleet.pricing : fleet.pricing.slice(0, 5)).map((pkg, idx) => {
                        const isSelected = selectedPricing === pkg;
                        return (
                          <div 
                            key={idx} 
                            className={`flex justify-between items-center text-sm p-3 rounded cursor-pointer border transition-all ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                                : 'bg-gray-50 border-transparent hover:bg-gray-100'
                            }`}
                            onClick={() => setSelectedPricing(pkg)}
                          >
                            <div>
                              <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                {pkg.rent_type_label}
                              </span>
                              <span className={`text-xs block ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                                {pkg.duration > 0 ? `${pkg.duration} ${pkg.uom}` : `Per ${pkg.uom}`}
                              </span>
                            </div>
                            <div className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-blue-600'}`}>
                              Rp {pkg.price.toLocaleString('id-ID')}
                            </div>
                          </div>
                        );
                      })}
                      
                      {fleet.pricing.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => setShowAllPricing(!showAllPricing)}
                        >
                          {showAllPricing ? 'Sembunyikan' : `Lihat Semua (${fleet.pricing.length})`}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleOrderNow}
                      disabled={!selectedPricing}
                    >
                      {selectedPricing ? 'Pesan Sekarang' : 'Pilih Durasi'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full py-6"
                      onClick={() => navigate(`/custom-order/armada/${fleet.meta.fleet_id}`)}
                    >
                      Ajukan Custom Order
                    </Button>
                  </div>
                </div>

                {/* Addons */}
                {fleet.addon.length > 0 && (
                  <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add-on Tersedia</h3>
                    <div className="flex flex-wrap gap-2">
                      {fleet.addon.map((addon, index) => (
                        <Badge key={index} variant="secondary" className="text-xs flex flex-col items-start gap-1 p-2 h-auto">
                          <span className="font-bold">{addon.addon_name}</span>
                          <span className="text-gray-500 font-normal">Rp {addon.addon_price.toLocaleString('id-ID')}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section - Placeholder as API doesn't return reviews yet */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ulasan</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500">Belum ada ulasan untuk armada ini.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Popup */}
      {fleet && (
        <ImagePopup
          images={allImages}
          currentIndex={selectedImageIndex}
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
          onImageChange={handleImageChange}
          itemType="armada"
          itemId={fleet.meta.fleet_id}
        />
      )}
    </div>
  );
};
