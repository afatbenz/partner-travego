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
  Calendar as CalendarIcon,
  ChevronsUpDown,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImagePopup } from '@/components/common/ImagePopup';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { cn } from '@/lib/utils';
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
  capacities: number[];
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
  rating?: number;
  total_ulasan?: number;
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

interface FleetFacility {
  facility_icon?: string;
  facility_id?: string;
  facility_name?: string;
}

interface FleetDetailData {
  rating: number;
  reviews: any;
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

interface SelectableCity {
  id: number | string;
  name: string;
  serviceTypes: string[];
}

const normalizeFacilityName = (facility: string | FleetFacility) => {
  if (typeof facility === 'string') {
    return facility.trim();
  }

  return facility.facility_name?.trim() ?? '';
};

const sanitizeFleetDescription = (html: string) => {
  if (!html) {
    return '';
  }

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+=(["']).*?\1/gi, '')
    .replace(/\son\w+=([^\s>]+)/gi, '')
    .replace(/\s(href|src)=("|')\s*javascript:[^"']*\2/gi, ' $1="#"');
};

const normalizeCityName = (city: any) => city.city_label || city.city_name || city.name || '';

const normalizeCityId = (city: any, fallback: number) => city.city_id || city.id || fallback;

const normalizeServiceTypes = (serviceTypes: unknown): string[] => {
  if (!Array.isArray(serviceTypes)) {
    return [];
  }

  return serviceTypes
    .map((type) => {
      if (typeof type === 'string') {
        return type;
      }

      if (type && typeof type === 'object') {
        return type.service_type || type.slug || type.name || '';
      }

      return '';
    })
    .filter(Boolean);
};

const CitySearchSelect = ({ value, onSelect }: { value: string, onSelect: (val: string, serviceTypes: string[], cityId: number | string) => void }) => {
  const [open, setOpen] = useState(false);
  const [preferredCities, setPreferredCities] = useState<SelectableCity[]>([]);
  const [otherCities, setOtherCities] = useState<SelectableCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      try {
        const [preferredResponse, generalResponse] = await Promise.all([
          http.get<any>('/api/general/preferences/cities'),
          http.get<any>('/api/general/cities'),
        ]);

        const preferredData = preferredResponse.data?.data || preferredResponse.data || [];
        const generalData = generalResponse.data?.data || generalResponse.data || [];

        const normalizedPreferredCities = Array.isArray(preferredData)
          ? preferredData
              .map((city, idx) => ({
                id: normalizeCityId(city, idx),
                name: normalizeCityName(city),
                serviceTypes: normalizeServiceTypes(city.service_types),
              }))
              .filter((city) => city.name)
          : [];

        const preferredIds = new Set(normalizedPreferredCities.map((city) => String(city.id)));

        const normalizedOtherCities = Array.isArray(generalData)
          ? generalData
              .map((city, idx) => ({
                id: normalizeCityId(city, idx),
                name: normalizeCityName(city),
                serviceTypes: ['overland'],
              }))
              .filter((city) => city.name && !preferredIds.has(String(city.id)))
          : [];

        setPreferredCities(normalizedPreferredCities);
        setOtherCities(normalizedOtherCities);
      } catch (error) {
        console.error("Failed to fetch cities", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  const normalizedSearch = search.toLowerCase();
  const filterCityBySearch = (city: SelectableCity) => city.name.toLowerCase().includes(normalizedSearch);

  const filteredPreferredCities = preferredCities.filter(filterCityBySearch);
  const filteredOtherCities = otherCities.filter(filterCityBySearch);
  const hasResults = filteredPreferredCities.length > 0 || filteredOtherCities.length > 0;

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-900 mb-2">Pilih Tujuan <span className="text-red-500">*</span></label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal bg-white border-blue-200 hover:bg-blue-50/50 p-3 h-auto rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all",
              !value && "text-gray-400"
            )}
          >
            {value ? value : <span>Pilih Tujuan</span>}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl shadow-xl border-blue-100 bg-white" align="start">
          <Command shouldFilter={false} className="bg-white rounded-2xl">
            <CommandInput 
              placeholder="Cari kota..." 
              className="border-none focus:ring-0" 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading ? (
                <div className="py-6 text-center text-sm text-gray-500">Memuat kota...</div>
              ) : (
                <>
                  {!hasResults && <CommandEmpty>Kota tidak ditemukan.</CommandEmpty>}

                  {filteredPreferredCities.length > 0 && (
                    <CommandGroup>
                      {filteredPreferredCities.map((city) => (
                        <CommandItem
                          key={`preferred-${city.id}`}
                          value={city.name}
                          onSelect={() => {
                            onSelect(city.name, city.serviceTypes, city.id);
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-blue-600",
                              value === city.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {city.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {filteredOtherCities.length > 0 && (
                    <>
                      {filteredPreferredCities.length > 0 && <CommandSeparator className="my-1" />}
                      <CommandGroup heading="Kota lain">
                        {filteredOtherCities.map((city) => (
                          <CommandItem
                            key={`general-${city.id}`}
                            value={city.name}
                            onSelect={() => {
                              onSelect(city.name, city.serviceTypes, city.id);
                              setOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 text-blue-600",
                                value === city.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {city.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const CustomDatePicker = ({ date, setDate, label, placeholder, optional, minDate }: any) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label} {!optional && <span className="text-red-500">*</span>}
        {optional && <span className="text-gray-400 font-normal"> (Opsional)</span>}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-white border-blue-200 hover:bg-blue-50/50 p-3 h-auto rounded-2xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all",
              !date && "text-gray-400"
            )}
          >
            <CalendarIcon className="mr-3 h-5 w-5 text-blue-500" />
            {date ? format(new Date(date), "dd MMMM yyyy", { locale: idLocale }) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-2xl border-blue-100 shadow-xl" align="start">
          <Calendar
            mode="single"
            selected={date ? new Date(date) : undefined}
            onSelect={(d) => {
              if (d) {
                const offset = d.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(d.getTime() - offset)).toISOString().split('T')[0];
                setDate(localISOTime);
              } else {
                setDate("");
              }
              setOpen(false);
            }}
            initialFocus
            disabled={minDate ? (dateToCheck) => {
              const check = new Date(dateToCheck);
              check.setHours(0,0,0,0);
              const min = new Date(minDate);
              min.setHours(0,0,0,0);
              return check < min;
            } : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

const PricingCard: React.FC<{
  formattedPrice: string;
  priceUom: string;
  selectedPricing: FleetPricing | null;
  setSelectedPricing: (p: FleetPricing) => void;
  showAllPricing: boolean;
  setShowAllPricing: (v: boolean) => void;
  onOrderNow: () => void;
  onCustomOrder: () => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  isChecking: boolean;
  onCheckAvailability: () => void;
  availabilityError: string | null;
  availablePricing: FleetPricing[] | null;
  isAvailable: boolean | null;
  onResetSearch: () => void;
  destinationCity: string;
  setDestinationCity: (c: string, serviceTypes: string[], cityId: number | string) => void;
  serviceType: string;
  setServiceType: (s: string) => void;
  availableServiceTypes: string[];
}> = ({
  formattedPrice,
  priceUom,
  selectedPricing,
  setSelectedPricing,
  showAllPricing,
  setShowAllPricing,
  onOrderNow,
  onCustomOrder,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isChecking,
  onCheckAvailability,
  availabilityError,
  availablePricing,
  isAvailable,
  onResetSearch,
  destinationCity,
  setDestinationCity,
  serviceType,
  setServiceType,
  availableServiceTypes,
}) => {
  const pricingList = availablePricing || [];

  const serviceTypeConfig: Record<string, {label: string, desc: string}> = {
    city_tour: { label: "Cititour Regular", desc: "Pelayanan khusus dalam kota" },
    overland: { label: "Overland Regular", desc: "Antar jemput luar kota" },
    drop_only: { label: "Drop / Pickup", desc: "Layanan antar / jemput saja" }
  };

  return (
    <>
      <div className="bg-white rounded-[2.5rem] shadow-lg p-10 mb-6 border border-gray-100 transition-all duration-300">
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">Mulai dari</div>
          <div className="text-3xl font-bold text-blue-600">{formattedPrice}</div>
          <div className="text-sm text-gray-500">
            /{priceUom}
          </div>
        </div>

        {isAvailable === null ? (
          <div className="mb-6 space-y-4 transition-all duration-300">
            <CitySearchSelect 
              value={destinationCity} 
              onSelect={setDestinationCity} 
            />
            
            <CustomDatePicker 
              label="Tanggal Keberangkatan"
              placeholder="Pilih Tanggal Keberangkatan"
              date={startDate}
              setDate={setStartDate}
              optional={false}
              minDate={new Date().toISOString().split('T')[0]}
            />
            
            <div>
              <CustomDatePicker 
                label="Tanggal Kepulangan"
                placeholder="Pilih Tanggal Kepulangan"
                date={endDate}
                setDate={setEndDate}
                optional={true}
                minDate={startDate || new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 mt-2 italic">*Dihitung sejak datang kembali di titik penjemputan</p>
            </div>
            
            {availableServiceTypes.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Jenis Layanan <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableServiceTypes.map(type => (
                    <div 
                      key={type}
                      className={cn(
                        "p-3 rounded-2xl border cursor-pointer transition-all hover:scale-105 text-left flex flex-col justify-center",
                        serviceType === type 
                          ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" 
                          : "bg-white border-gray-200 hover:border-blue-300"
                      )}
                      onClick={() => setServiceType(type)}
                    >
                      <div className="font-semibold text-sm text-gray-900">{serviceTypeConfig[type]?.label || type}</div>
                      <div className="text-xs text-gray-500 mt-1 leading-relaxed">{serviceTypeConfig[type]?.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {availabilityError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {availabilityError}
              </div>
            )}

            <div className="pt-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-14 font-semibold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-105"
                onClick={onCheckAvailability}
                disabled={isChecking || !startDate || !destinationCity || !serviceType}
              >
                {isChecking ? 'Memuat Data ....' : 'Cek Ketersediaan'}
              </Button>
            </div>
          </div>
        ) : isAvailable === false ? (
          <div className="mb-6 p-6 bg-red-50 rounded-2xl border border-red-100 text-center transition-all duration-300">
            <h4 className="font-semibold text-red-800 mb-2">Armada Tidak Tersedia</h4>
            <p className="text-red-600 text-sm mb-4">Armada pilihan kamu tidak tersedia, coba di tanggal lain</p>
            <Button 
              variant="outline" 
              onClick={onResetSearch}
              className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-100 rounded-xl"
            >
              Ubah Pencarian
            </Button>
          </div>
        ) : pricingList.length === 0 ? (
          <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center transition-all duration-300">
            <h4 className="font-semibold text-blue-900 mb-2">Informasi Harga</h4>
            <p className="text-blue-700 text-sm mb-4">Harga belum tersedia, silakan lakukan custom order untuk informasi lebih lanjut</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={onCustomOrder}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                Custom Order
              </Button>
              <Button 
                variant="outline" 
                onClick={onResetSearch}
                className="border-blue-200 text-blue-600 hover:bg-blue-100 rounded-xl"
              >
                Ubah Pencarian
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 space-y-3 transition-all duration-300">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-900 text-sm">Pilihan Varian Durasi:</h4>
              <Button variant="ghost" size="sm" onClick={onResetSearch} className="text-blue-600 hover:text-blue-700 h-auto p-0 hover:bg-transparent text-sm">
                Ubah Pencarian
              </Button>
            </div>
            
            {(showAllPricing ? pricingList : pricingList.slice(0, 5)).map((pkg, idx) => {
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
                      {pkg.duration > 0 ? `${pkg.duration} hari` : 'Per hari'} mulai dari
                    </span>
                  </div>
                  <div className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-blue-600'}`}>
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </div>
                </div>
              );
            })}

            {pricingList.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all hover:scale-105"
                onClick={() => setShowAllPricing(!showAllPricing)}
              >
                {showAllPricing ? 'Sembunyikan' : `Lihat Semua (${pricingList.length})`}
              </Button>
            )}
            
            <div className="pt-3 space-y-3">
              <Button
                className="w-full flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 h-14 font-semibold text-lg shadow-xl shadow-blue-600/20 transition-all hover:scale-105"
                onClick={onOrderNow}
                disabled={!selectedPricing || pricingList.length === 0}
              >
                {selectedPricing ? 'Pesan Sekarang' : 'Pilih Varian Durasi'}
              </Button>
              <Button variant="outline" className="w-full py-6 rounded-2xl border-blue-600 hover:border-blue-800 transition-all hover:scale-105" onClick={onCustomOrder}>
                Ajukan Custom Order
              </Button>
            </div>
          </div>
        )}
        
        {!availablePricing && (
          <Button variant="outline" className="w-full py-6 rounded-2xl border-blue-600 hover:border-blue-800 transition-all hover:scale-105" onClick={onCustomOrder}>
            Ajukan Custom Order
          </Button>
        )}
      </div>
    </>
  );
};

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

  // Search Availability State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationCityId, setDestinationCityId] = useState<number | string>('');
  const [availableServiceTypes, setAvailableServiceTypes] = useState<string[]>([]);
  const [serviceType, setServiceType] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [availablePricing, setAvailablePricing] = useState<FleetPricing[] | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

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
            facilities: (data.facilities ?? [])
              .map((facility) => normalizeFacilityName(facility as string | FleetFacility))
              .filter(Boolean),
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

  const handleCitySelect = (cityName: string, serviceTypes: string[], cityId: number | string) => {
    const nextServiceTypes = serviceTypes.length > 0 ? serviceTypes : ['overland'];

    setDestinationCity(cityName);
    setDestinationCityId(cityId);
    setAvailableServiceTypes(nextServiceTypes);
    setServiceType(serviceTypes.length > 0 ? '' : 'overland');
  };

  const handleOrderNow = () => {
    if (fleet && selectedPricing) {
      navigate(`/checkout/armada/${fleet.meta.fleet_id}`, {
        state: {
          fleet_id: fleet.meta.fleet_id,
          price_id: selectedPricing.price_id,
          pricing: selectedPricing,
          startDate: startDate,
          endDate: endDate,
          cityId: destinationCityId,
          cityName: destinationCity,
          serviceType: serviceType
        },
      });
    }
  };

  const handleCheckAvailability = async () => {
    if (!startDate || !destinationCity || !serviceType) {
      setAvailabilityError('Tujuan, Jenis Layanan, dan Tanggal keberangkatan wajib diisi');
      return;
    }
    
    setIsChecking(true);
    setAvailabilityError(null);

    // Map service_type string to integer
    let serviceTypeId = 0;
    if (serviceType === 'city_tour') serviceTypeId = 1;
    else if (serviceType === 'overland') serviceTypeId = 2;
    else if (serviceType === 'drop_only') serviceTypeId = 3;

    try {
      const response = await http.post<any>('/api/service/fleet/order/availibility', {
        fleet_id: id,
        start_date: startDate,
        end_date: endDate || undefined,
        city_id: destinationCityId,
        service_type: serviceTypeId
      });

      if (response.data?.status === 'success' || response.status === 200) {
        const availabilityData = response.data?.data || response.data;
        const availability = availabilityData?.availability;
        const prices = availabilityData?.prices || [];
        
        setIsAvailable(availability === true);
        setAvailablePricing(prices);
      } else {
        setIsAvailable(false);
        setAvailabilityError('Unit tidak tersedia di tanggal tersebut, ubah tanggal pencarian');
      }
    } catch (error: any) {
      console.error('Error checking availability:', error);
      setIsAvailable(false);
      setAvailabilityError(error.response?.data?.message || 'Terjadi kesalahan saat memeriksa ketersediaan');
    } finally {
      setIsChecking(false);
    }
  };

  const handleResetSearch = () => {
    setAvailablePricing(null);
    setIsAvailable(null);
    setAvailabilityError(null);
    setSelectedPricing(null);
    setShowAllPricing(false);
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

  const rating = fleet.meta.rating || 0.0;
  const reviews = fleet.meta.total_ulasan || 0;
  const sanitizedDescription = sanitizeFleetDescription(fleet.meta.description);

  const fleetTypeLabel = fleet.meta.fleet_type_label ?? fleet.meta.fleet_type;
  const fuelLabel = fleet.meta.fuel_type_label ?? fleet.meta.fuel_type;

  const specItems = [
    { icon: Cog, label: 'Mesin', value: fleet.meta.engine },
    { icon: Car, label: 'Body', value: fleet.meta.body },
    { icon: Users, label: 'Kapasitas', value: `${fleet.meta.capacities} Penumpang` },
    { icon: Car, label: 'Tipe', value: fleetTypeLabel },
    ...(fleet.meta.transmission
      ? [{ icon: Gauge, label: 'Transmisi', value: fleet.meta.transmission }]
      : []),
    ...(fleet.meta.fuel_type
      ? [{ icon: Fuel, label: 'Bahan Bakar', value: fuelLabel }]
      : []),
  ];

  const pricingCardProps = {
    formattedPrice,
    priceUom,
    selectedPricing,
    setSelectedPricing,
    showAllPricing,
    setShowAllPricing,
    onOrderNow: handleOrderNow,
    onCustomOrder: () => navigate(`/custom-order/armada/${fleet.meta.fleet_id}`),
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isChecking,
    onCheckAvailability: handleCheckAvailability,
    availabilityError,
    availablePricing,
    isAvailable,
    onResetSearch: handleResetSearch,
    destinationCity,
    setDestinationCity: handleCitySelect,
    serviceType,
    setServiceType,
    availableServiceTypes,
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
                  <span>{fleet.meta.capacities} Penumpang</span>
                </div>
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
                      className="w-full h-auto"
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
                      <div className="flex gap-2 overflow-x-auto pb-1 mt-4">
                        {fleet.images.map((img, index) => {
                          const imageIndex = allImages.indexOf(img.path_file);
                          const activeIndex = imageIndex >= 0 ? imageIndex : index + 1;
                          const isActive = selectedImageIndex === activeIndex;
                          return (
                            <button
                              key={img.uuid}
                              type="button"
                              onClick={() => handleThumbnailClick(activeIndex)}
                              className={`relative flex-shrink-0 w-30 h-16 sm:w-30 sm:h-20 rounded-lg overflow-hidden border-2 transition-all p-0 ${
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
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-1 w-12 bg-blue-600 rounded-full" />
                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Deskripsi Armada</h2>
                    </div>

                      <div
                        className="prose prose-lg max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                      />

                      {fleet.pickup.length > 0 && (
                        <div className="mt-8 mb-5">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="h-1 w-12 bg-blue-600 rounded-full" />
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Area Penjemputan</h2>
                          </div>
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
                          <p className="text-xs mt-2 italic text-gray-400/90">*Penjemputan di luar area kemungkinan akan ada biaya tambahan. Hubungi admin untuk informasi lebih lanjut.</p>
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

                  <div className='mt-8 rounded-lg border border-gray-100 p-6'>
                    <h3 className="text-lg font-bold text-gray-900">Ulasan</h3>
                    <p className="text-sm text-gray-500 mb-5">Lihat ulasan dari pelanggan ({fleet.meta.rating}/{fleet.reviews.length} ulasan)</p>
                    {fleet.reviews && fleet.reviews.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                        {fleet.reviews.map((reviewItem: any, index: number) => {
                          const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
                          const formattedDate = new Date(reviewItem.created_at).toLocaleDateString('id-ID', dateOptions).replace('pukul', '');
                          
                          return (
                            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-bold text-gray-900">{reviewItem.customer_name}</h4>
                                  <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
                                </div>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= reviewItem.star
                                          ? 'text-orange-500 fill-orange-500'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed flex-grow">"{reviewItem.review}"</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                        <p className="text-gray-500">Belum ada ulasan untuk armada ini.</p>
                      </div>
                    )}
                  </div>
                </div>

                  <div className='lg:col-span-1'>
                    {/* Pricing Section */}
                    <div className="sticky top-6">
                      <PricingCard {...pricingCardProps} />
                    {/* Addon Section */}
                    {fleet.addon.length > 0 && (
                      <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100">
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
