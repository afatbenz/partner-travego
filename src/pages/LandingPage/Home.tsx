import React, { useState, useEffect } from 'react';
import { Search, Star, Shield, Clock, Headphones, ArrowRight, MapPin, Phone, Users } from 'lucide-react';
import { ArmadaCard } from '@/components/cards/ArmadaCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useNavigate } from 'react-router-dom';
import { useGeneralContent } from '@/contexts/GeneralContentContext';
import { http } from '@/lib/http';

export interface FleetApiResponse {
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

  const [fleets, setFleets] = useState<any[]>([]);
  const [loadingFleets, setLoadingFleets] = useState(true);

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

  // Debug logging

  const handleSearch = () => {
    console.log('Searching for:', { city: searchCity, service: serviceType });
    // Implement search logic here
  };

  const popularCatalogs = [
    {
      id: 1,
      title: 'Paket Wisata Bali 3D2N',
      price: 'Rp 1.500.000',
      image: 'https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Nikmati liburan ke Bali dengan paket lengkap hotel bintang 4, transportasi AC, dan tour guide profesional.',
      rating: 4.8,
      type: 'Paket Wisata',
      location: 'Bali'
    },
    {
      id: 2,
      title: 'Rental Mobil Jakarta',
      price: 'Rp 300.000',
      image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Rental mobil premium dengan driver berpengalaman untuk perjalanan bisnis atau wisata di Jakarta.',
      rating: 4.7,
      type: 'Rental Mobil',
      location: 'Jakarta'
    },
    {
      id: 3,
      title: 'Travel Jogja - Jakarta',
      price: 'Rp 150.000',
      image: 'https://images.pexels.com/photos/1139541/pexels-photo-1139541.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Layanan travel antar kota dengan armada nyaman, jadwal fleksibel, dan fasilitas lengkap.',
      rating: 4.9,
      type: 'Travel',
      location: 'Yogyakarta'
    },
    {
      id: 4,
      title: 'Paket Wisata Raja Ampat',
      price: 'Rp 3.500.000',
      image: 'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Nikmati liburan ke Raja Ampat dengan paket lengkap hotel bintang 4, transportasi AC, dan tour guide profesional.',
      rating: 4.9,
      type: 'Paket Wisata',
      location: 'Papua'
    }
  ];

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
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative h-screen w-full text-white overflow-hidden">
        {/* Background Image dengan Parallax Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{
            backgroundImage: 'url(https://cdn.paradisotour.co.id/wp-content/uploads/2024/01/Kelebihan-Mobil-Hiace.jpg)'
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative h-full flex flex-col justify-between px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12 max-w-7xl mx-auto w-full">
          {/* Title and Subtitle - Top Section */}
          <div className="text-center pt-24 sm:pt-32 md:pt-40 lg:pt-48">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              {heroTitle}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed px-4">
              {heroSubTitle}
            </p>
          </div>

          {/* Search Form - Bottom Section */}
          <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                Cari Layanan Perjalanan
              </h2>
              <p className="text-sm sm:text-base text-white">
                Temukan layanan yang Anda butuhkan dengan mudah
              </p>
            </div>
            <Card className="p-6 sm:p-8 shadow-2xl bg-white/98 backdrop-blur-sm border border-gray-200/50 relative z-10 overflow-visible">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">
                    Kota Asal
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Pilih kota..."
                      value={cityInput}
                      onChange={(e) => {
                        setCityInput(e.target.value);
                        if (e.target.value === '') {
                          setSearchCity('');
                        }
                      }}
                      className="h-12 sm:h-14 text-base text-white placeholder:text-gray-200 pr-10"
                    />
                    {cityInput && filteredCities.length > 0 && cityInput !== searchCity && (
                      <div className="fixed z-[99999] bg-gray-800 border border-gray-600 rounded-md shadow-xl overflow-visible" style={{ 
                        top: 'calc(100vh - 200px)', 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        width: '300px',
                        maxWidth: '90vw'
                      }}>
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              setSearchCity(city);
                              setCityInput(city);
                            }}
                            className="w-full px-4 py-3 text-left text-white hover:bg-gray-700 focus:bg-gray-700 focus:outline-none whitespace-nowrap"
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">
                    Jenis Layanan
                  </label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="h-12 sm:h-14 text-base text-white placeholder:text-white">
                      <SelectValue placeholder="Pilih layanan..." className="text-white placeholder:text-white" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border border-gray-600 shadow-xl z-[9999]">
                      <SelectItem value="rental" className="hover:bg-gray-700 focus:bg-gray-700 text-white hover:text-white focus:text-white px-4 py-3">Rental Mobil</SelectItem>
                      <SelectItem value="travel" className="hover:bg-gray-700 focus:bg-gray-700 text-white hover:text-white focus:text-white px-4 py-3">Travel</SelectItem>
                      <SelectItem value="paket" className="hover:bg-gray-700 focus:bg-gray-700 text-white hover:text-white focus:text-white px-4 py-3">Paket Wisata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <Button 
                    onClick={handleSearch}
                    className="w-full h-12 sm:h-14 bg-white hover:bg-gray-100 text-gray-800 text-base font-semibold border border-gray-300"
                  >
                    <Search className="mr-2 h-5 w-5 text-gray-800" />
                    Cari
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Armada Kami Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Armada Kami
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Berbagai jenis kendaraan berkualitas tinggi untuk memenuhi kebutuhan perjalanan Anda
            </p>
          </div>
          
          {/* Mobile View - Carousel */}
          <div className="block md:hidden">
            {loadingFleets ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Memuat armada...</p>
              </div>
            ) : fleets.length > 0 ? (
              <Carousel className="w-full max-w-sm mx-auto">
                <CarouselContent>
                  {fleets.map((fleet) => (
                    <CarouselItem key={fleet.id}>
                      <div className="p-1 h-full">
                        <ArmadaCard armada={fleet} viewMode="grid" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden sm:block">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </Carousel>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Belum ada armada tersedia.</p>
              </div>
            )}
          </div>

          {/* Desktop View - Grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingFleets ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Memuat armada...</p>
              </div>
            ) : fleets.length > 0 ? (
              fleets.map((fleet) => (
                <ArmadaCard key={fleet.id} armada={fleet} viewMode="grid" />
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
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Kenapa Pilih TravelPro?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Kami berkomitmen memberikan layanan terbaik dengan standar internasional
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Catalog Section */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Katalog Terpopuler
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Pilihan terbaik dan paling diminati oleh para traveler. Temukan paket wisata, rental kendaraan, dan layanan travel berkualitas tinggi dengan harga kompetitif untuk memenuhi kebutuhan perjalanan Anda.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {popularCatalogs.map((item) => (
            <Card key={item.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
              <div className="relative overflow-hidden h-60">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-blue-600 hover:bg-blue-600 text-xs sm:text-sm">
                    {item.type}
                  </Badge>
                </div>
                <CardContent className="p-3 sm:p-4 flex flex-col h-full">
                  <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 dark:text-white line-clamp-2">
                    {item.title}
                  </h3>
                  
                  {/* Garis tipis di bawah judul */}
                  <div className="border-t border-gray-200 dark:border-gray-700 mb-3"></div>
                  
                  {/* Deskripsi singkat */}
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center mb-2">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-1" />
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      {item.location}
                    </span>
                  </div>
                  
                  <div className="mt-auto">
                    {/* Garis tipis sebelum kata "Mulai Dari" */}
                    <div className="border-t border-gray-200 dark:border-gray-700 mb-3"></div>
                    
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Mulai dari
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                          {item.price}
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal ml-1">
                            {item.type === 'Paket Wisata' ? '/pax' : '/hari'}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {item.rating}
                        </span>
                      </div>
                    </div>
                    <Button className="w-full">
                      Lihat Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Inquiry Section */}
      <section className="relative py-16 text-white overflow-hidden">
        {/* Background Image dengan Parallax Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{
            backgroundImage: 'url(https://baze.co.id/wp-content/uploads/2021/03/PREMIO-CR1-1.jpg)'
          }}
        />
        {/* Overlay untuk meningkatkan readability */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Siap Memulai Perjalanan Anda?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Hubungi tim kami untuk konsultasi gratis dan penawaran terbaik
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => navigate('/contact')}
            >
              <Phone className="mr-2 h-5 w-5" />
              Hubungi Kami
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white bg-white/10 hover:bg-white hover:text-blue-600"
              onClick={() => navigate('/catalog')}
            >
              Lihat Katalog
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
