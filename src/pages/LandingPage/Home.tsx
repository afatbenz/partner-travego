import React, { useState, useEffect } from 'react';
import { Search, Star, Shield, Clock, Headphones, ArrowRight, MapPin, Phone, Users } from 'lucide-react';
import { ArmadaCard } from '@/components/cards/ArmadaCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CTASection } from '@/components/common/CTASection';
import { CatalogPackageCard } from '@/components/common/CatalogPackageCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useNavigate } from 'react-router-dom';
import { useGeneralContent } from '@/contexts/GeneralContentContext';
import { http } from '@/lib/http';
import hiacePremioImage from '@/images/hiace_premio.png';

export interface FleetApiResponse {
  fleet_id: string;
  fleet_name: string;
  fleet_type: string;
  fleet_type_label: string;
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
  duration?: number;
  facilities?: { facility: string }[];
  cities?: string[];
}

export interface FleetResponse {
  status: string;
  message: string;
  data: FleetApiResponse[];
  transaction_id: string;
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { getContentByTag, getContentIn, getListIn } = useGeneralContent();
  const heroTitle = getContentIn('landing-page', 'hero-section') || getContentByTag('hero-section') || 'Lorem Ipsum Dolor Sit Amet';
  const heroSubTitle = getContentIn('landing-page', 'sub-hero-section') || getContentByTag('sub-hero-section') || 'Lorem Ipsum Dolor Sit Amet';
  const heroBannerImage = getContentIn('hero-banner', 'main-banner') || getContentByTag('main-banner') || '';
  const brandName = getContentIn('landing-page', 'brand-name') || getContentByTag('brand-name') || 'TravelPro';
  

  const [fleets, setFleets] = useState<any[]>([]);
  const [loadingFleets, setLoadingFleets] = useState(true);
  const [popularCatalogs, setPopularCatalogs] = useState<any[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);

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
              type: fleet.fleet_type_label,
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
              badge: `${fleet.production_year}`,
              discount: fleet.discount_value ? `-${fleet.discount_value}%` : ''
            };
          });
          setFleets(mappedFleets);
        }
      } catch (err) {
        console.error('Failed to fetch fleets:', err);
      } finally {
        setLoadingFleets(false);
      }
    };
    fetchFleets();
  }, []);

  useEffect(() => {
    const fetchPopularCatalogs = async () => {
      try {
        const res = await http.get<any[]>('/api/service/tour-packages');
        if (res.data && Array.isArray(res.data.data)) {
          setPopularCatalogs(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch popular catalogs:', err);
      } finally {
        setLoadingCatalogs(false);
      }
    };
    fetchPopularCatalogs();
  }, []);

  const [searchCity, setSearchCity] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [serviceType, setServiceType] = useState('');

  const cities = [
    'Jakarta',
    'Tangerang', 
    'Depok',
    'Bekasi',
    'Jabotabek',
    'Tangerang Selatan',
    'Bogor'
  ];

  const filteredCities = cities.filter(city => 
    city.toLowerCase().includes(cityInput.toLowerCase())
  );

  const handleSearch = () => {
    console.log('Searching for:', { city: searchCity, service: serviceType });
    // Implement search logic here
  };

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    shield: Shield,
    clock: Clock,
    star: Star,
    headphones: Headphones,
    users: Users,
    phone: Phone,
    'map-pin': MapPin,
    search: Search,
    'arrow-right': ArrowRight,
  };
  const whyChooseUsList = getListIn('choose-use', 'why-choose-us-points') as { icon?: string; label?: string; sub_label?: string }[] | null;
  const whyChooseUs = (whyChooseUsList && whyChooseUsList.length
    ? whyChooseUsList.map((item) => ({
        icon: iconMap[(item.icon || '').toLowerCase()] || Shield,
        title: item.label || '',
        description: item.sub_label || '',
      }))
    : []
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBannerImage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left space-y-8 animate-in fade-in slide-in-from-left duration-1000">
              <div className="space-y-4">

                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white leading-[1.1]">
                  Jelajahi <span className="text-orange-400">Indonesia</span> <br />
                  Bersama Kami
                </h1>
                <p className="text-lg md:text-xl text-blue-50 max-w-xl leading-relaxed font-light">
                  Layanan rental bus pariwisata premium dan paket wisata eksklusif untuk perjalanan tak terlupakan Anda di seluruh Nusantara.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-sm font-semibold shadow-xl shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
                  onClick={() => navigate('/armada')}
                >
                  Lihat Armada
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-blue-900 rounded-full px-8 py-6 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                  onClick={() => navigate('/catalog')}
                >
                  Paket Wisata
                </Button>
              </div>

              {/* Stats/Trust Indicators */}
              <div className="flex items-center gap-8 pt-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">500+</span>
                  <span className="text-blue-200 text-sm">Armada Modern</span>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">10k+</span>
                  <span className="text-blue-200 text-sm">Happy Clients</span>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white">4.9/5</span>
                  <span className="text-blue-200 text-sm">Rating Layanan</span>
                </div>
              </div>
            </div>

            {/* Right Content - Vehicle Images */}
            <div className="hidden lg:block relative h-[500px] animate-in fade-in zoom-in duration-1000">
              {/* Bus Image */}
              <div className="absolute top-0 right-0 w-[350px] transform hover:scale-105 transition-transform duration-500 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <img 
                  src={hiacePremioImage} 
                  alt="Bus Pariwisata" 
                  className="w-full h-auto object-contain"
                />
              </div>
              {/* Hiace Image - Overlapping */}
              <div className="absolute -bottom-10 -left-10 w-[400px] transform hover:scale-110 transition-transform duration-500 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <img 
                  src={hiacePremioImage} 
                  alt="Toyota Hiace" 
                  className="w-full h-auto object-contain rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Curved Divider */}
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

      {/* Floating Search Box */}

      {/* Armada Kami Section */}
      <section className="py-24 bg-white dark:bg-gray-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 bg-blue-600 rounded-full" />
                <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Pilihan Terbaik</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Armada Premium <br />
                <span className="text-blue-600">Siap Menemani</span> Anda
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-normal">
                Koleksi kendaraan terbaru dengan perawatan rutin dan fasilitas lengkap untuk menjamin kenyamanan perjalanan Anda.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="rounded-2xl px-8 h-10 font-semibold border-gray-200 hover:bg-blue-50 text-blue-600 transition-all hover:scale-105"
              onClick={() => navigate('/armada')}
            >
              Lihat Semua Armada
            </Button>
          </div>
          
          {/* Mobile View - Carousel */}
          <div className="block md:hidden">
            {loadingFleets ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 font-bold">Menyiapkan Armada...</p>
              </div>
            ) : fleets.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {fleets.map((fleet) => (
                    <CarouselItem key={fleet.id} className="pl-4 basis-[85%]">
                      <div className="py-4 h-full">
                        <ArmadaCard armada={fleet} viewMode="grid" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Belum ada armada tersedia.</p>
              </div>
            )}
          </div>

          {/* Desktop View - Grid */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingFleets ? (
              <div className="col-span-full text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Menyiapkan Armada Premium...</p>
              </div>
            ) : fleets.length > 0 ? (
              fleets.slice(0, fleets.length >= 6 ? 6 : 3).map((fleet, idx) => (
                <div key={fleet.id} className={`animate-in fade-in slide-in-from-bottom duration-1000`} style={{ animationDelay: `${idx * 150}ms` }}>
                  <ArmadaCard armada={fleet} viewMode="grid" />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Belum ada armada tersedia.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-20 space-y-4 animate-in fade-in slide-in-from-bottom duration-1000">
            <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Keunggulan Kami</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Kenapa Pilih <span className="text-blue-600">{brandName}?</span>
            </h2>
            <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="relative group p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border border-blue-100/50 dark:border-gray-800 animate-in fade-in slide-in-from-bottom duration-1000" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="w-20 h-20 mb-8 bg-blue-600 text-white rounded-3xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-blue-600/30">
                  <item.icon className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Catalog Section */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 bg-orange-500 rounded-full" />
                <span className="text-orange-500 font-bold tracking-widest uppercase text-sm">Destinasi Populer</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Paket Wisata <br />
                <span className="text-orange-500">Terfavorit</span> Tahun Ini
              </h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-normal">
                Jelajahi keindahan alam dan budaya Indonesia dengan paket perjalanan yang dirancang khusus untuk pengalaman tak terlupakan.
              </p>
            </div>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-8 h-10 font-normal shadow-xl shadow-orange-500/20 transition-all hover:scale-105"
              onClick={() => navigate('/catalog')}
            >
              Eksplor Semua Paket
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingCatalogs ? (
              <div className="col-span-full text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-500 font-bold">Memuat Paket Wisata...</p>
              </div>
            ) : popularCatalogs.length > 0 ? (
              popularCatalogs.slice(0, 6).map((item, idx) => (
                <Card key={item.package_id} className="group overflow-hidden bg-white dark:bg-gray-900 border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] h-full flex flex-col transform hover:-translate-y-4 animate-in fade-in slide-in-from-bottom duration-1000" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.package_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase">
                        {item.type ?? 'Tour Package'}
                      </Badge>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-normal tracking-wide">{item.destinations.length > 30 ? item.destinations.slice(0, 30) + '...' : item.destinations}</span>
                      </div>
                      <h3 className="text-2xl font-bold leading-tight line-clamp-2">
                        {item.package_name}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="p-8 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-xl">
                        <Star className="h-4 w-4 text-orange-500 fill-current mr-1.5" />
                        <span className="font-normal text-orange-600 dark:text-orange-400 text-sm">{item.rating ?? '-'}</span>
                      </div>
                      <div className="flex items-center text-gray-400 font-normal text-xs uppercase tracking-widest">
                        <Clock className="h-4 w-4 mr-2 text-blue-600" />
                        3 Hari 2 Malam
                      </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium line-clamp-2 mb-8 leading-relaxed">
                      {item.package_description}
                    </p>
                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-normal text-gray-400 uppercase tracking-widest mb-1">Mulai Dari</p>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {item.price}
                        </span>
                      </div>
                      <Button
                        onClick={() => navigate(`/detail/catalog/${item.package_id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-10 px-6 font-medium shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                      >
                        Detail
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Belum ada paket wisata tersedia.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-blue-600 rounded-2xl overflow-hidden p-8 md:p-16 text-center">
            {/* Background Wave Pattern (Simulated with CSS/SVG) */}
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
                  className="w-full sm:w-auto border-white text-white bg-transparent hover:bg-black/20 hover:border-white hover:text-white rounded-xl px-8 h-12 font-normal flex items-center gap-2"
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
