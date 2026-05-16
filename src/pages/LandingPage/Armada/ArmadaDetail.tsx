import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Star,
  Share2,
  Heart,
  ChevronLeft,
  Users,
  Car,
  MapPin,
  CheckCircle2,
  ListChecks,
  ClipboardList,
  Cog,
  Fuel,
  Gauge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImagePopup } from '@/components/common/ImagePopup';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';
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
  fleet_type_label?: string;
  fuel_type_label?: string;
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

const PricingCard: React.FC<{
  fleet: FleetDetailData;
  formattedPrice: string;
  lowestPriceItem: FleetPricing | undefined;
  priceUom: string;
  selectedPricing: FleetPricing | null;
  setSelectedPricing: (p: FleetPricing) => void;
  showAllPricing: boolean;
  setShowAllPricing: (v: boolean) => void;
  onOrderNow: () => void;
  onCustomOrder: () => void;
}> = ({
  fleet,
  formattedPrice,
  lowestPriceItem,
  priceUom,
  selectedPricing,
  setSelectedPricing,
  showAllPricing,
  setShowAllPricing,
  onOrderNow,
  onCustomOrder,
}) => (
  <>
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-100">
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-1">Mulai dari</div>
        <div className="text-3xl font-bold text-blue-600">{formattedPrice}</div>
        <div className="text-sm text-gray-500">
          {lowestPriceItem && lowestPriceItem.duration > 0
            ? `/ ${lowestPriceItem.duration} ${lowestPriceItem.uom}`
            : `/${priceUom}`}
        </div>
      </div>

      {fleet.pricing.length > 0 && (
        <div className="mb-6 space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">Pilihan Durasi:</h4>
          {(showAllPricing ? fleet.pricing : fleet.pricing.slice(0, 5)).map((pkg, idx) => {
            const isSelected = selectedPricing === pkg;
            return (
              <div
                key={idx}
                className={`flex justify-between items-center text-sm p-3 rounded-2xl cursor-pointer border transition-all hover:scale-105 ${
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
              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all hover:scale-105"
              onClick={() => setShowAllPricing(!showAllPricing)}
            >
              {showAllPricing ? 'Sembunyikan' : `Lihat Semua (${fleet.pricing.length})`}
            </Button>
          )}
        </div>
      )}

      <div className="space-y-3">
        <Button
          className="w-full flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-14 font-semibold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-105"
          onClick={onOrderNow}
          disabled={!selectedPricing}
        >
          {selectedPricing ? 'Pesan Sekarang' : 'Pilih Durasi'}
        </Button>
        <Button variant="outline" className="w-full py-6 rounded-2xl border-blue-600 hover:border-blue-800 transition-all hover:scale-105" onClick={onCustomOrder}>
          Ajukan Custom Order
        </Button>
      </div>
    </div>
  </>
);

export const ArmadaDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
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
          const data = response.data.data;
          setFleet({
            ...data,
            facilities: data.facilities ?? [],
            pickup: data.pickup ?? [],
            addon: data.addon ?? [],
            pricing: data.pricing ?? [],
            images: data.images ?? [],
          });
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

  const onCarouselSelect = useCallback(() => {
    if (!carouselApi) return;
    setSelectedImageIndex(carouselApi.selectedScrollSnap());
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    onCarouselSelect();
    carouselApi.on('select', onCarouselSelect);
    return () => {
      carouselApi.off('select', onCarouselSelect);
    };
  }, [carouselApi, onCarouselSelect]);

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
    carouselApi?.scrollTo(index);
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleImageChange = (index: number) => {
    setSelectedImageIndex(index);
    carouselApi?.scrollTo(index);
  };

  const handleOrderNow = () => {
    if (fleet && selectedPricing) {
      navigate(`/checkout/armada/${fleet.meta.fleet_id}`, {
        state: {
          fleet_id: fleet.meta.fleet_id,
          price_id: selectedPricing.price_id,
          pricing: selectedPricing,
        },
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

  const allImages = [fleet.meta.thumbnail, ...fleet.images.map((img) => img.path_file)].filter(Boolean);

  const lowestPrice =
    fleet.pricing.length > 0 ? Math.min(...fleet.pricing.map((p) => p.price)) : 0;

  const lowestPriceItem = fleet.pricing.find((p) => p.price === lowestPrice);
  const priceUom = lowestPriceItem ? lowestPriceItem.uom : 'hari';
  const formattedPrice = `Rp ${lowestPrice.toLocaleString('id-ID')}`;

  const rating = 5.0;
  const reviews = 0;

  const fleetTypeLabel = fleet.meta.fleet_type_label ?? fleet.meta.fleet_type;
  const fuelLabel = fleet.meta.fuel_type_label ?? fleet.meta.fuel_type;

  const specItems = [
    { icon: Cog, label: 'Mesin', value: fleet.meta.engine },
    { icon: Car, label: 'Body', value: fleet.meta.body },
    { icon: Users, label: 'Kapasitas', value: `${fleet.meta.capacity} Seats` },
    { icon: Car, label: 'Tipe', value: fleetTypeLabel },
    ...(fleet.meta.transmission
      ? [{ icon: Gauge, label: 'Transmisi', value: fleet.meta.transmission }]
      : []),
    ...(fleet.meta.fuel_type
      ? [{ icon: Fuel, label: 'Bahan Bakar', value: fuelLabel }]
      : []),
  ];

  const pricingCardProps = {
    fleet,
    formattedPrice,
    lowestPriceItem,
    priceUom,
    selectedPricing,
    setSelectedPricing,
    showAllPricing,
    setShowAllPricing,
    onOrderNow: handleOrderNow,
    onCustomOrder: () => navigate(`/custom-order/armada/${fleet.meta.fleet_id}`),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url(${fleet.meta.thumbnail})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071127]/95 via-[#0F172A]/85 to-[#295BFF]/70" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-[-120px] right-[-120px] w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative min-h-[420px] flex items-center px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-24">
          <div className="max-w-7xl mx-auto w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mb-8 bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 text-white rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1 text-sm mb-6">
                Armada Premium
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                {fleet.meta.fleet_name}
              </h1>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center rounded-full bg-white/10 backdrop-blur-md px-4 py-2 border border-white/10">
                  <Car className="h-4 w-4 mr-2" />
                  <span>{fleetTypeLabel}</span>
                </div>
                <div className="flex items-center rounded-full bg-white/10 backdrop-blur-md px-4 py-2 border border-white/10">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{fleet.meta.capacity} Penumpang</span>
                </div>
                {fleet.meta.production_year && (
                  <div className="flex items-center rounded-full bg-white/10 backdrop-blur-md px-4 py-2 border border-white/10">
                    {fleet.meta.production_year}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-300" />
                  <span>
                    {fleet.pickup.length > 0
                      ? `${fleet.pickup.length} Area Penjemputan`
                      : 'Konfirmasi Admin'}
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-300 fill-yellow-300" />
                  <span>
                    Rating: {rating} ({reviews} ulasan)
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute top-8 right-8 flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg
            className="relative block w-[calc(100%+1.3px)] h-[100px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="#f9fafb"
              d="M0,256L80,245.3C160,235,320,213,480,202.7C640,192,800,192,960,208C1120,224,1280,256,1360,272L1440,288L1440,320L0,320Z"
            />
          </svg>
        </div>
      </section>

      <section className="pt-8 pb-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                <div className='lg:col-span-2'>
                  {/* Image Gallery Section */}
                  <div className="relative">
                    <Carousel
                      setApi={setCarouselApi}
                      opts={{ startIndex: 0, loop: allImages.length > 1 }}
                      className="w-full"
                    >
                      <CarouselContent>
                        {allImages.map((image, index) => (
                          <CarouselItem key={index}>
                            <div
                              className="relative h-64 sm:h-96 rounded-xl overflow-hidden cursor-pointer group"
                              onClick={() => handleImageClick(index)}
                            >
                              <img
                                src={image}
                                alt={`${fleet.meta.fleet_name} - ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {allImages.length > 1 && (
                        <>
                          <CarouselPrevious className="left-0 bg-white/90 shadow-md border-gray-200 hover:bg-white" />
                          <CarouselNext className="right-0 bg-white/90 shadow-md border-gray-200 hover:bg-white" />
                        </>
                      )}
                    </Carousel>
                  </div>

                  {fleet.images.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Galeri Foto</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {fleet.images.map((img, index) => {
                          const imageIndex = allImages.indexOf(img.path_file);
                          const activeIndex = imageIndex >= 0 ? imageIndex : index + 1;
                          const isActive = selectedImageIndex === activeIndex;
                          return (
                            <button
                              key={img.uuid}
                              type="button"
                              onClick={() => handleThumbnailClick(activeIndex)}
                              className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                isActive
                                  ? 'border-blue-600 ring-2 ring-blue-200'
                                  : 'border-transparent opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={img.path_file}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className='mt-8 bg-white rounded-lg border border-gray-100 p-6 shadow-sm'>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Deskripsi Armada</h2>

                      <div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: fleet.meta.description }}/>

                      {fleet.pickup.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Area Penjemputan</h3>
                          <div className="flex flex-wrap gap-2">
                            {fleet.pickup.map((area) => (
                              <Badge
                                key={area.city_id}
                                variant="outline"
                                className="px-3 py-1 border-blue-200 bg-blue-50 text-blue-700"
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                {area.city_name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div>
                          <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                            <ClipboardList className="h-5 w-5 text-blue-600" />
                            Spesifikasi
                          </h3>
                          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                            <ul className="space-y-3">
                              {specItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                  <li key={item.label} className="flex items-center text-sm text-gray-700">
                                    <Icon className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
                                    <span className="font-medium w-24">{item.label}:</span>
                                    <span>{item.value}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                            <ListChecks className="h-5 w-5 text-green-600" />
                            Fasilitas
                          </h3>
                          <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
                            <ul className="space-y-2">
                              {(fleet.facilities ?? []).map((feature, index) => (
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
                </div>

                  <div className='lg:col-span-1'>
                    {/* Pricing Section */}
                    <div className="sticky top-6">
                      <PricingCard {...pricingCardProps} />
                    {/* Addon Section */}
                    {fleet.addon.length > 0 && (
                      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add-on Tersedia</h3>
                        <div className="flex flex-wrap gap-2">
                          {fleet.addon.map((addon, index) => (
                            <Badge key={index} variant="secondary" className="text-xs flex flex-col items-start gap-1 p-4 h-auto border-blue-400 bg-transparent">
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

            {/* --- Addon Section --- */}
            <div className="lg:col-span-1">
            
            </div>
          </div>
        </div>
      </section>

   

      <section className="py-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ulasan</h2>
          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-500">Belum ada ulasan untuk armada ini.</p>
          </div>
        </div>
      </section>

      <ImagePopup
        images={allImages}
        currentIndex={selectedImageIndex}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onImageChange={handleImageChange}
        itemType="armada"
        itemId={fleet.meta.fleet_id}
      />
    </div>
  );
};
