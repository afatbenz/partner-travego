import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Car, MapPin, Plus, Minus, X, CheckSquare, Square, Users, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { http } from '@/lib/http';

interface FleetAddon {
  uuid: string;
  addon_name: string;
  addon_desc: string;
  addon_price: number;
}

interface AddonResponse {
  status: string;
  message: string;
  data: FleetAddon[];
}

interface FleetSummaryData {
  fleet_name: string;
  capacity: number;
  engine: string;
  body: string;
  description: string;
  active: boolean;
  thumbnail: string;
  duration: number;
  rent_type: number;
  price: number;
  uom: string;
  facilities?: string[];
  pickup_points?: { city_id: number; city_name: string }[];
}

interface FleetSummaryResponse {
  status: string;
  message: string;
  data: FleetSummaryData;
  transaction_id: string;
}

interface City {
  id: string;
  name: string;
  province: string;
  province_id: string;
}

interface CitySearchSelectProps {
  value: string; // This will be the display name
  onSelect: (city: City) => void;
  placeholder?: string;
  required?: boolean;
}

const CitySearchSelect: React.FC<CitySearchSelectProps> = ({ value, onSelect, placeholder, required }) => {
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      try {
        const url = search.length >= 3 
          ? `/api/general/cities?search=${search}` 
          : '/api/general/cities';
        
        const response = await http.get<any>(url);
        if (response.data.status === 'success') {
             setCities(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch cities", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
        fetchCities();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <div className="w-full relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {value
              ? value
              : <span className="text-muted-foreground">{placeholder || "Pilih Kota..."}</span>}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
               placeholder="Cari kota..." 
               value={search}
               onValueChange={setSearch} 
            />
            <CommandList>
                {loading ? (
                    <div className="py-6 text-center text-sm">Loading...</div>
                ) : (
                    <>
                        <CommandEmpty>Kota tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                        {cities.map((city) => (
                            <CommandItem
                            key={city.id}
                            value={city.name}
                            onSelect={() => {
                                onSelect(city);
                                setOpen(false);
                            }}
                            >
                            <Check
                                className={cn(
                                "mr-2 h-4 w-4",
                                value === city.name ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {city.name}
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </>
                )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {required && (
        <input 
          tabIndex={-1}
          autoComplete="off"
          style={{ opacity: 0, height: 0, position: 'absolute', bottom: 0, left: 0 }}
          value={value}
          onChange={() => {}}
          required
        />
      )}
    </div>
  );
}

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : <span className="text-muted-foreground">{placeholder || "Pilih..."}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari..." />
          <CommandList>
            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const ArmadaCheckout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { fleet_id, price_id } = location.state || {};
  
  const [fleetSummary, setFleetSummary] = useState<FleetSummaryData | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [addons, setAddons] = useState<FleetAddon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<FleetAddon[]>([]);
  const [loadingAddons, setLoadingAddons] = useState(false);

  const [formData, setFormData] = useState({
    // Nama dan kontak pemesan
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: '',
    
    // Tanggal dan jam
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    
    // Titik penjemputan
    pickupCity: '',
    pickupLocation: '',
    pickupAddress: '',
    
    // Tujuan
    destinations: [{ location: '', city_id: '', city_name: '' }],
    
    // Jumlah Armada
    armadaCount: 1
  });

  useEffect(() => {
    const fetchSummary = async () => {
      let activeFleetId = fleet_id;
      let activePriceId = price_id;

      // Handle direct access where state is missing
      if (!activeFleetId && id) {
        activeFleetId = id;
      }

      if (!activeFleetId) return;

      setLoadingSummary(true);
      try {
        // If price_id is missing, fetch it from details
        if (!activePriceId) {
          try {
             // We need to fetch details to get a valid price_id
             // Using any for the response here to avoid defining all interfaces again
             const detailRes = await http.post<any>('/api/service/fleet/detail', { fleet_id: activeFleetId });
             if (detailRes.data?.status === 'success' && detailRes.data?.data?.pricing?.length > 0) {
                // If price_id was passed in state but not captured correctly (e.g. named differently), try to find it
                // Or default to the first pricing option if genuinely missing
                
                // Check if we have a passed pricing object in location state that we missed
                const statePricing = location.state?.pricing;
                if (statePricing && (statePricing.price_id || statePricing.uuid)) {
                   activePriceId = statePricing.price_id || statePricing.uuid;
                } else {
                   // Default to the first pricing option
                   const firstPricing = detailRes.data.data.pricing[0];
                   // Try to get price_id or uuid
                   activePriceId = firstPricing.price_id || firstPricing.uuid;
                }
             }
          } catch (err) {
             console.error('Failed to fetch fleet details for default pricing:', err);
          }
        }
        console.log("get active fleetid ---- ", { activeFleetId, activePriceId, state: location.state })

        if (activeFleetId && activePriceId) {
          const response = await http.post<FleetSummaryResponse>('/api/checkout/fleet/summary', {
            fleet_id: activeFleetId,
            price_id: activePriceId
          });
          if (response.data.status === 'success') {
            setFleetSummary(response.data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch fleet summary:', error);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [fleet_id, price_id, id]);

  useEffect(() => {
    const fetchAddons = async () => {
      if (!id) return;
      setLoadingAddons(true);
      try {
        const response = await http.get<AddonResponse>(`/api/service/fleet/addon/${id}`);
        if (response.data.status === 'success') {
          setAddons(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch addons:', error);
      } finally {
        setLoadingAddons(false);
      }
    };

    fetchAddons();
  }, [id]);

  useEffect(() => {
    if (formData.pickupDate && fleetSummary?.duration) {
      const pickup = new Date(formData.pickupDate);
      const returnDate = new Date(pickup);
      returnDate.setDate(pickup.getDate() + fleetSummary.duration);
      
      setFormData(prev => ({
        ...prev,
        returnDate: returnDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.pickupDate, fleetSummary]);

  const handleToggleAddon = (addon: FleetAddon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.uuid === addon.uuid);
      if (exists) {
        return prev.filter(a => a.uuid !== addon.uuid);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [name]: Math.max(1, value)
    }));
  };

  const handleDestinationChange = (index: number, field: string, value: any) => {
    const newDestinations = [...formData.destinations];
    newDestinations[index] = { ...newDestinations[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      destinations: newDestinations
    }));
  };

  const handleCitySelect = (index: number, city: City) => {
    const newDestinations = [...formData.destinations];
    newDestinations[index] = { 
        ...newDestinations[index], 
        city_id: city.id,
        city_name: city.name
    };
    setFormData(prev => ({
      ...prev,
      destinations: newDestinations
    }));
  };

  const addDestination = () => {
    setFormData(prev => ({
      ...prev,
      destinations: [...prev.destinations, { location: '', city_id: '', city_name: '' }]
    }));
  };

  const removeDestination = (index: number) => {
    if (formData.destinations.length > 1) {
      const newDestinations = formData.destinations.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        destinations: newDestinations
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Armada checkout data:', formData);
    // Handle checkout submission
    navigate(`/payment/armada/${data.id}`);
  };

  const days = fleetSummary?.duration || 1;
  
  if (loadingSummary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!fleetSummary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Data Armada Tidak Ditemukan</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Mohon kembali ke halaman sebelumnya dan pilih armada kembali.</p>
        <Button onClick={() => navigate(-1)}>Kembali</Button>
      </div>
    );
  }

  const basePrice = fleetSummary.price;
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.addon_price, 0);
  const totalPrice = (basePrice + addonsTotal) * days * formData.armadaCount;

  const data = fleetSummary;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Checkout Armada
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Nama dan Kontak Pemesan */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    1. Nama dan Kontak Pemesan
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nama Lengkap *
                      </label>
                      <Input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="contoh@email.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nomor Telepon *
                      </label>
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Kontak Darurat
                      </label>
                      <Input
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        placeholder="Nomor telepon darurat"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Jadwal Penjemputan */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    2. Jadwal Penjemputan
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Calendar className="inline h-4 w-4 mr-2" />
                        Tanggal Penjemputan *
                      </label>
                      <Input
                        name="pickupDate"
                        type="date"
                        value={formData.pickupDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Clock className="inline h-4 w-4 mr-2" />
                        Jam Penjemputan *
                      </label>
                      <Input
                        name="pickupTime"
                        type="time"
                        value={formData.pickupTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  {formData.pickupDate && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Kembali di titik penjemputan maksimal pada <span className="font-semibold">
                          {(() => {
                            const pickup = new Date(formData.pickupDate);
                            const returnDate = new Date(pickup);
                            returnDate.setDate(pickup.getDate() + (fleetSummary?.duration || 1));
                            
                            // Format date: DD Month YYYY
                            const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
                            const formattedDate = returnDate.toLocaleDateString('id-ID', options);
                            
                            return `${formattedDate} ${formData.pickupTime || '00:00'}`;
                          })()}
                        </span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 3. Titik Penjemputan */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    3. Titik Penjemputan
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="inline h-4 w-4 mr-2" />
                        Kota Penjemputan (sesuai pickup area armada yang dipilih) *
                      </label>
                      <SearchableSelect 
                        value={formData.pickupCity} 
                        onChange={(value) => setFormData(prev => ({ ...prev, pickupCity: value }))}
                        options={data.pickup_points?.map(p => ({ value: String(p.city_id), label: p.city_name })) || []}
                        placeholder="Pilih Kota"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="inline h-4 w-4 mr-2" />
                        Lokasi Penjemputan *
                      </label>
                      <Input
                        name="pickupLocation"
                        value={formData.pickupLocation}
                        onChange={handleInputChange}
                        placeholder="Contoh: Hotel Grand Indonesia, Jakarta"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4. Tujuan */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    4. Tujuan
                  </h2>
                  
                  <div className="space-y-4">
                    {formData.destinations.map((destination, index) => (
                      <div key={index} className="space-y-2">
                         <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tujuan {index + 1} *
                            </label>
                            {formData.destinations.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDestination(index)}
                                className="h-6 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Hapus
                              </Button>
                            )}
                         </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    value={destination.location}
                                    onChange={(e) => handleDestinationChange(index, 'location', e.target.value)}
                                    placeholder="Detail Lokasi (misal: Hotel Aston)"
                                    required
                                />
                            </div>
                            <div>
                                <CitySearchSelect
                                    value={destination.city_name}
                                    onSelect={(city) => handleCitySelect(index, city)}
                                    placeholder="Pilih Kota"
                                    required
                                />
                            </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addDestination}
                      className="w-full mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Tujuan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 5. Jumlah Armada & Addon */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    5. Detail Armada
                  </h2>
                  
                  <div className="flex items-center justify-center mb-8">
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        <Car className="inline h-4 w-4 mr-2" />
                        Jumlah Armada *
                      </label>
                      <div className="flex items-center space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleNumberChange('armadaCount', formData.armadaCount - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-2xl font-bold w-16 text-center">
                          {formData.armadaCount}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleNumberChange('armadaCount', formData.armadaCount + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Kapasitas: {data.capacity} Orang
                      </p>
                    </div>
                  </div>

                  {/* Addon Section */}
                  {addons.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Pilih Paket Addon
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {addons.map((addon) => (
                          <div 
                            key={addon.uuid} 
                            className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedAddons.find(a => a.uuid === addon.uuid)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => handleToggleAddon(addon)}
                          >
                            <div className="flex-shrink-0">
                              {selectedAddons.find(a => a.uuid === addon.uuid) ? (
                                <CheckSquare className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">{addon.addon_name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{addon.addon_desc}</p>
                            </div>
                            <div className="font-semibold text-blue-600 dark:text-blue-400">
                              Rp {addon.addon_price.toLocaleString('id-ID')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" size="lg" className="px-8">
                  Lanjutkan Pembayaran
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Ringkasan Pesanan
                  </h3>
                  
                  {/* Armada Info */}
                  <div className="flex items-start space-x-3 mb-4">
                    <img
                      src={data.thumbnail}
                      alt={data.fleet_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {data.fleet_name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {data.engine} • {data.body} • {data.capacity} Orang
                      </p>
                    </div>
                  </div>

                  {/* Facilities */}
                  {data.facilities && data.facilities.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-xs">Fasilitas:</h4>
                      <ul className="grid grid-cols-2 gap-1">
                        {data.facilities.map((item, idx) => (
                          <li key={idx} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                            <CheckSquare className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Price Breakdown */}
                  <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        Harga per {data.uom}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        Rp {data.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        Durasi sewa
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {days} hari
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        Jumlah Armada
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formData.armadaCount} unit
                      </span>
                    </div>

                    {selectedAddons.length > 0 && (
                      <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 mt-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Addons:</span>
                        {selectedAddons.map(addon => (
                          <div key={addon.uuid} className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-300 truncate w-2/3">
                              {addon.addon_name}
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              Rp {addon.addon_price.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-3">
                      <span className="text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        Rp {totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Destinations */}
                  {formData.destinations.some(dest => dest.city_name || dest.location) && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Tujuan:
                      </h4>
                      <div className="space-y-1">
                        {formData.destinations
                          .filter(dest => dest.city_name || dest.location)
                          .map((destination, index) => (
                            <div key={index} className="flex items-start text-xs text-gray-600 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                              <span>
                                {destination.location && <span className="font-medium">{destination.location}</span>}
                                {destination.location && destination.city_name && <span>, </span>}
                                {destination.city_name && <span>{destination.city_name}</span>}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
