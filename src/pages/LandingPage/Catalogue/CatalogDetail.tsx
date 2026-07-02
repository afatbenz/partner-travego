import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Armchair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ImagePopup } from '@/components/common/ImagePopup';
import { http, API_BASE_URL } from '@/lib/http';

interface PackageMeta {
  package_id: string;
  package_name: string;
  package_type: number;
  package_type_label: string;
  package_description: string;
  thumbnail: string;
  duration: number;
  min_pax: number;
  max_pax: number;
  active: boolean;
  status: number;
}

interface PackagePricing {
  price_id: string;
  min_pax: number;
  max_pax: number;
  price: number;
}

interface PackagePickupArea {
  city_id: number;
  city_name: string;
}

interface PackageItinerary {
  day: number;
  time: string;
  description: string;
  location: string;
  city_id: number;
  city_name: string;
}

interface PackageAddon {
  addon_id: string;
  description: string;
  price: number;
}

interface TourPackageDetailData {
  meta: PackageMeta;
  schedules: unknown[];
  pricing: PackagePricing[];
  pickup_areas: PackagePickupArea[];
  images: string[];
  itineraries: PackageItinerary[];
  facilities: string[];
  destinations: unknown[];
  addons: PackageAddon[];
}

interface TourPackageDetailResponse {
  status: string;
  message: string;
  data: TourPackageDetailData;
}

const resolveMediaUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
};

const groupItinerariesByDay = (items: PackageItinerary[]) => {
  const grouped = items.reduce<Record<number, PackageItinerary[]>>((acc, item) => {
    const day = item.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});
  return Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b)
    .map((day) => ({ day, items: grouped[day] }));
};

export const CatalogDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [detail, setDetail] = useState<TourPackageDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<PackagePricing | null>(null);
  const [paxCount, setPaxCount] = useState('');

  useEffect(() => {
    const fetchPackageDetail = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        const response = await http.post<TourPackageDetailResponse>(
          '/api/service/tour-packages/detail',
          { package_id: id }
        );
        if (response.data.status === 'success') {
          const data = response.data.data;
          setDetail({
            ...data,
            schedules: data.schedules ?? [],
            pricing: data.pricing ?? [],
            pickup_areas: data.pickup_areas ?? [],
            images: data.images ?? [],
            itineraries: data.itineraries ?? [],
            facilities: data.facilities ?? [],
            destinations: data.destinations ?? [],
            addons: data.addons ?? [],
          });
        } else {
          setError(response.data.message || 'Gagal memuat detail paket');
        }
      } catch (err) {
        console.error('Error fetching package detail:', err);
        setError('Terjadi kesalahan saat mengambil detail paket. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetail();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat detail paket...</p>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
          <p className="text-gray-600 mb-6">{error || 'Data paket tidak ditemukan'}</p>
          <Button onClick={() => navigate('/catalog')} variant="outline">
            Kembali ke Katalog
          </Button>
        </div>
      </div>
    );
  }

  const { meta } = detail;
  const headerThumbnail = resolveMediaUrl(meta.thumbnail);
  const galleryImages = detail.images.map(resolveMediaUrl).filter(Boolean);
  const packageId = meta.package_id;

  const lowestPrice =
    detail.pricing.length > 0 ? Math.min(...detail.pricing.map((p) => p.price)) : 0;
  const formattedPrice = lowestPrice > 0 ? `Rp ${lowestPrice.toLocaleString('id-ID')}` : '-';

  const locationLabel =
    detail.pickup_areas.length > 1
      ? detail.pickup_areas[0].city_name +" (+ "+ (detail.pickup_areas.length - 1) + " kota lain)"
      : detail.pickup_areas[0].city_name;

  const highlights = [
    ...new Set(
      detail.itineraries
        .map((item) => item.location)
        .filter((loc) => loc.trim() !== '')
    ),
  ];

  const handlePaxChange = (value: string) => {
    setPaxCount(value);
    const pax = parseInt(value, 10);
    if (!detail || Number.isNaN(pax) || pax <= 0) {
      setSelectedPricing(null);
      return;
    }
    const matched = detail.pricing.find(
      (tier) => pax >= tier.min_pax && pax <= tier.max_pax
    );
    setSelectedPricing(matched ?? null);
  };

  const handlePricingSelect = (tier: PackagePricing) => {
    setSelectedPricing(tier);
    setPaxCount(String(tier.min_pax));
  };

  const handleOrderNow = () => {
    if (!selectedPricing) return;
    navigate(`/checkout/catalog/${packageId}`, {
      state: {
        package_id: packageId,
        price_id: selectedPricing.price_id,
        pricing: selectedPricing,
        pax: parseInt(paxCount, 10) || selectedPricing.min_pax,
      },
    });
  };

  const itineraryByDay = groupItinerariesByDay(detail.itineraries);
  const pickupAreas = detail.pickup_areas;
  const totalDays = new Set(
    detail.itineraries.map(item => item.day)
  ).size;
  const minPax = Math.min(...detail.pricing.map(item => item.min_pax));
const maxPax = Math.max(...detail.pricing.map(item => item.max_pax));

  return (
    <div className="min-h-screen bg-white">
      <section className="relative min-h-[45vh] flex items-center pt-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: headerThumbnail ? `url(${headerThumbnail})` : undefined,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/40 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-7xl mx-auto">
          <div className="max-w-3xl animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                {meta.package_name}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <span className="font-normal tracking-wide">{locationLabel}</span>
                </div>
                {meta.package_type_label && (
                  <Badge className="bg-blue-600/80 text-white border-none font-normal">
                    {meta.package_type_label}
                  </Badge>
                )}
              </div>
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

      {galleryImages.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group shadow-md"
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {index === 3 && galleryImages.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-bold uppercase tracking-widest text-sm">
                        Lihat foto lain
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
        <div className="max-w-7xl mx-auto border-y border-gray-100 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-2xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Jadwal
                </p>
                <p className="font-normal text-gray-900">
                  {detail.schedules.length > 0 ? 'Tersedia' : 'Hubungi kami'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-2xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Durasi Tour
                </p>
                <p className="font-normal text-gray-900">{totalDays} Hari</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 p-3 rounded-2xl">
                <Armchair className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Kapasitas
                </p>
                <p className="font-normal text-gray-900">
                  {minPax > 0 || maxPax > 0
                    ? `${minPax} - ${maxPax} pax`
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-12 bg-blue-600 rounded-full" />
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Deskripsi Paket
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-gray-600 font-medium leading-relaxed">
                  {meta.package_description ? (
                    <div
                      className="prose prose-lg max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{ __html: meta.package_description }}
                    />
                  ) : (
                    <p className="text-gray-400">Deskripsi belum tersedia.</p>
                  )}
                </div>
              </div>

              {itineraryByDay.length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-blue-600 rounded-full" />
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Itinerary</h2>
                  </div>
                  {itineraryByDay.map(({ day, items }) => (
                    <div key={day} className="space-y-4">
                      <h3 className="text-lg font-bold text-blue-600">Hari {day + 1}</h3>
                      <ul className="space-y-3">
                        {items.map((item, index) => (
                          <li
                            key={`${day}-${index}`}
                            className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100"
                          >
                            <div className="h-2 w-2 bg-blue-600 rounded-full mt-2.5 shrink-0" />
                            <div>
                              {item.time && (
                                <p className="text-xs font-semibold text-blue-600 mb-1">{item.time}</p>
                              )}
                              <p className="font-semibold text-gray-900">{item.description}</p>
                              <p className="text-sm text-gray-500">
                                {item.location}
                                {item.city_name ? ` · ${item.city_name}` : ''}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {pickupAreas.length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-12 bg-blue-600 rounded-full" />
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Area Penjemputan</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pickupAreas.map((area) => (
                      <Badge key={area.city_id} variant="outline" className="px-3 py-1 border-blue-200 bg-blue-50 text-blue-700">
                        {area.city_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 p-8 space-y-8">
                <div className="space-y-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Harga Mulai Dari
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-blue-600">{formattedPrice}</span>
                    <span className="text-sm font-normal text-gray-400">/pax</span>
                  </div>
                </div>

                {detail.pricing.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah Pax
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={paxCount}
                        onChange={(e) => handlePaxChange(e.target.value)}
                        placeholder="Masukkan jumlah pax"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Pilih Harga
                      </p>
                      {detail.pricing.map((tier) => {
                        const isSelected = selectedPricing?.price_id === tier.price_id;
                        return (
                          <div
                            key={tier.price_id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handlePricingSelect(tier)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePricingSelect(tier)}
                            className={`flex justify-between items-center text-sm p-3 rounded-2xl cursor-pointer border transition-all ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                : 'bg-gray-50 border-transparent hover:bg-gray-100'
                            }`}
                          >
                            <span className={isSelected ? 'text-blue-700 font-medium' : ''}>
                              {tier.min_pax} - {tier.max_pax} pax
                            </span>
                            <span className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-blue-600'}`}>
                              Rp {tier.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {paxCount && !selectedPricing && (
                      <p className="text-xs text-red-500">
                        Jumlah pax tidak sesuai tier harga yang tersedia.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-16 font-semibold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    onClick={handleOrderNow}
                    disabled={!selectedPricing}
                  >
                    {selectedPricing ? 'Pesan Sekarang' : 'Pilih Jumlah Pax'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 bg-white rounded-2xl h-16 font-semibold text-lg transition-all hover:scale-[1.02]"
                    onClick={() => navigate(`/custom-order/catalog/${packageId}`)}
                  >
                    Ajukan Custom Order
                  </Button>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="space-y-6">
                  <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">
                    Fasilitas Termasuk
                  </h4>
                  {detail.facilities.length > 0 ? (
                    <ul className="space-y-4">
                      {detail.facilities.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-3 text-sm font-semibold text-gray-600"
                        >
                          <div className="h-2 w-2 bg-blue-600 rounded-full shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">Belum ada fasilitas terdaftar.</p>
                  )}

                  {highlights.length > 0 && (
                    <>
                      <div className="h-px bg-gray-100" />
                      <div className="space-y-6">
                        <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">
                          Highlight Wisata
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {highlights.map((highlight, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-blue-50 text-blue-600 border-none font-normal text-[10px] px-3 py-1 rounded-lg"
                            >
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
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

      {galleryImages.length > 0 && (
        <ImagePopup
          images={galleryImages}
          currentIndex={selectedImageIndex}
          isOpen={isPopupOpen}
          onClose={handleClosePopup}
          onImageChange={handleImageChange}
          itemType="catalog"
          itemId={packageId}
        />
      )}
    </div>
  );
};
