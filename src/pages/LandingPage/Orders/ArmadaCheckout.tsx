import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useToast } from '@/hooks/use-toast';
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
  addon_id: string;
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
  rent_type_label?: string;
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
  excludeId?: string;
  priorityCities?: { id: string; name: string }[];
}

const CitySearchSelect: React.FC<CitySearchSelectProps> = ({ value, onSelect, placeholder, required, excludeId, priorityCities }) => {
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
             setCities(response.data.data || []);
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

  // Filter out excluded ID and priority cities from the main list to avoid duplicates
  const filteredCities = Array.isArray(cities) 
    ? cities.filter(city => 
        String(city.id) !== String(excludeId) && 
        !priorityCities?.some(pc => String(pc.id) === String(city.id))
      )
    : [];

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
                        
                        {/* Priority Cities Group */}
                        {priorityCities && priorityCities.length > 0 && (
                          <CommandGroup heading="Rekomendasi Kota">
                            {priorityCities.map((city) => (
                              <CommandItem
                                key={`priority-${city.id}`}
                                value={city.name}
                                onSelect={() => {
                                  onSelect({ id: city.id, name: city.name, province: '', province_id: '' });
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
                        )}

                        {/* All Cities Group */}
                        <CommandGroup heading={priorityCities && priorityCities.length > 0 ? "Semua Kota" : ""}>
                          {filteredCities.map((city) => (
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
  const { setCheckoutData } = useCheckout();
  const { toast } = useToast();
  const { fleet_id, price_id } = location.state || {};
  
  const [fleetSummary, setFleetSummary] = useState<FleetSummaryData | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [addons, setAddons] = useState<FleetAddon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<FleetAddon[]>([]);
  const [loadingAddons, setLoadingAddons] = useState(false);
  const [activePriceId, setActivePriceId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState<number>(0);

  const [formData, setFormData] = useState({
    // Nama dan kontak pemesan
    fullName: '',
    email: '',
    phone: '',
    company_name: '',
    address: '',
    city_id: '',
    city_name: '',
    
    // Tanggal dan jam
    pickupDate: '',
    pickupTime: '',
    returnDate: '',
    returnTime: '',
    
    // Titik penjemputan
    pickupCity: '',
    pickupCityName: '',
    pickupLocation: '',
    pickupAddress: '',
    
    // Rencana Perjalanan
    itinerary: [{ day: 1, events: [{ location: '', city_id: '', city_name: '' }] }],
    
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
          setActivePriceId(activePriceId);
          const response = await http.post<FleetSummaryResponse>('/api/order/fleet/summary', {
            fleet_id: activeFleetId,
            price_id: activePriceId
          });
          if (response.data.status === 'success') {
            setFleetSummary(response.data.data);
            
            // Initialize itinerary based on duration
            const duration = response.data.data.duration || 1;
            setFormData(prev => ({
              ...prev,
              itinerary: Array.from({ length: duration }, (_, i) => ({
                day: i + 1,
                events: [{ location: '', city_id: '', city_name: '' }]
              }))
            }));
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
      returnDate.setDate(pickup.getDate() + (fleetSummary.duration > 1 ? fleetSummary.duration : 0));
      
      const newReturnDate = returnDate.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        returnDate: newReturnDate,
        returnTime: fleetSummary.duration === 1 ? '23:59' : prev.returnTime
      }));
    }
  }, [formData.pickupDate, fleetSummary]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!id || !formData.pickupDate || !formData.pickupTime || !fleetSummary) return;

      const duration = fleetSummary.duration || 1;
      let start_date = `${formData.pickupDate} ${formData.pickupTime}`;
      let end_date = "";

      if (duration === 1) {
        end_date = `${formData.pickupDate} 23:59`;
      } else {
        if (!formData.returnDate || !formData.returnTime) return;
        end_date = `${formData.returnDate} ${formData.returnTime}`;
      }

      setCheckingAvailability(true);
      try {
        const response = await http.post<any>('/api/service/fleet/availibility', {
          fleet_id: id,
          start_date,
          end_date
        });

        if (response.data.status === 'success') {
          const available = response.data.data.available;
          setIsAvailable(available);
          
          // Find total_available from response.data.data.fleets[0].total_available
          const availableCount = response.data.data.fleets?.[0]?.total_available || 0;
          setTotalAvailable(availableCount);

          if (!available) {
            toast({
              title: "Armada tidak tersedia",
              description: "Coba armada lain atau tanggal lain",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Failed to check availability:', error);
      } finally {
        setCheckingAvailability(false);
      }
    };

    const timeoutId = setTimeout(() => {
      checkAvailability();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.pickupDate, formData.pickupTime, formData.returnDate, formData.returnTime, fleetSummary, id]);

  useEffect(() => {
    if (totalAvailable > 0 && formData.armadaCount > totalAvailable) {
      setFormData(prev => ({
        ...prev,
        armadaCount: totalAvailable
      }));
      toast({
        title: "Penyesuaian Jumlah Armada",
        description: `Jumlah armada disesuaikan ke maksimal ${totalAvailable} yang tersedia.`,
      });
    }
  }, [totalAvailable, formData.armadaCount]);

  const handleToggleAddon = (addon: FleetAddon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => (a.addon_id || a.uuid) === (addon.addon_id || addon.uuid));
      if (exists) {
        return prev.filter(a => (a.addon_id || a.uuid) !== (addon.addon_id || addon.uuid));
      } else {
        return [...prev, addon];
      }
    });
  };

  useEffect(() => {
    const fetchCustomerAvailability = async () => {
      if (formData.email && formData.phone) {
        try {
          const response = await http.post<any>('/api/service/customer/availibility', {
            email: formData.email,
            'no.telepon': formData.phone
          });

          if (response.data?.data && Object.keys(response.data.data).length > 0) {
            const customerData = response.data.data;
            setFormData(prev => ({
              ...prev,
              company_name: customerData.company_name || prev.company_name,
              address: customerData.customer_address || prev.address,
              city_id: customerData.city_id || prev.city_id,
              city_name: customerData.city_name || prev.city_name
            }));
          }
        } catch (error) {
          // Silent error as requested
          console.error('Failed to fetch customer availability:', error);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      fetchCustomerAvailability();
    }, 1000); // Wait for user to stop typing

    return () => clearTimeout(timeoutId);
  }, [formData.email, formData.phone]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name: string, value: number) => {
    let finalValue = Math.max(1, value);
    if (name === 'armadaCount' && isAvailable && totalAvailable > 0) {
      finalValue = Math.min(finalValue, totalAvailable);
    }
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleEventChange = (dayIndex: number, eventIndex: number, field: string, value: any) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[dayIndex].events[eventIndex] = { 
      ...newItinerary[dayIndex].events[eventIndex], 
      [field]: value 
    };
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const handleItineraryCitySelect = (dayIndex: number, eventIndex: number, city: City) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[dayIndex].events[eventIndex] = { 
        ...newItinerary[dayIndex].events[eventIndex], 
        city_id: city.id,
        city_name: city.name
    };
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const addEvent = (dayIndex: number) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[dayIndex].events.push({ location: '', city_id: '', city_name: '' });
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const removeEvent = (dayIndex: number, eventIndex: number) => {
    const newItinerary = [...formData.itinerary];
    if (newItinerary[dayIndex].events.length > 1) {
      newItinerary[dayIndex].events = newItinerary[dayIndex].events.filter((_, i) => i !== eventIndex);
      setFormData(prev => ({ ...prev, itinerary: newItinerary }));
    }
  };

  const addDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary, 
        { day: prev.itinerary.length + 1, events: [{ location: '', city_id: '', city_name: '' }] }
      ]
    }));
  };

  const removeDay = (dayIndex: number) => {
    if (formData.itinerary.length > 1) {
      const newItinerary = formData.itinerary
        .filter((_, i) => i !== dayIndex)
        .map((day, idx) => ({ ...day, day: idx + 1 }));
      setFormData(prev => ({ ...prev, itinerary: newItinerary }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        fleet_id: id,
        price_id: activePriceId,
        fullname: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        address: formData.address,
        city_id: formData.city_id,
        order_type: 1,
        start_date: `${formData.pickupDate} ${formData.pickupTime}`,
        end_date: `${formData.returnDate} ${formData.pickupTime}`,
        pickup_city_id: formData.pickupCity,
        pickup_location: formData.pickupLocation,
        destinations: formData.itinerary.flatMap(day => 
          day.events.map(event => ({
            location: event.location,
            city_id: event.city_id,
            daynum: day.day
          }))
        ),
        qty: formData.armadaCount,
        addons: selectedAddons.map(a => a.addon_id || a.uuid)
      };

      const response = await http.post<any>('/api/order/fleet/create', payload);
      console.log('Order create response:', response);

      const token = response.data?.token || response.data?.data?.token;
      const orderId = response.data.data?.order_id || response.data.order_id;
      const finalId = token || orderId;

      if (response.data.status === 'success' || token) {
        if (finalId) {
          // Store in context if it's an orderId
          if (orderId) setCheckoutData(orderId, id || '');
          
          // Navigate to success page
          navigate(`/order/success/armada/${encodeURIComponent(finalId)}`, {
            state: {
              orderData: {
                id: orderId || finalId,
                item: fleetSummary?.fleet_name,
                date: new Date().toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })
              }
            }
          });
        } else {
          console.error('Order ID and Token missing in success response');
          toast({
            title: "Error",
            description: "Terjadi kesalahan: ID pesanan tidak ditemukan.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Gagal",
          description: response.data.message || 'Terjadi kesalahan saat membuat pesanan',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      toast({
        title: "Error",
        description: "Gagal membuat pesanan. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
  const totalPrice = (basePrice + addonsTotal) * formData.armadaCount;

  const data = fleetSummary;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4 bg-transparent hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
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
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Masukkan email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nomor Telepon *
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Masukkan nomor telepon"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Instansi / Organisasi
                      </label>
                      <Input
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama instansi atau organisasi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Alamat *
                      </label>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Alamat lengkap"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Kota *
                      </label>
                      <CitySearchSelect
                        value={formData.city_name}
                        onSelect={(city) => setFormData(prev => ({ ...prev, city_id: city.id, city_name: city.name }))}
                        placeholder="Pilih Kota"
                        required
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="inline h-4 w-4 mr-2" />
                        Kota Penjemputan
                      </label>
                      <CitySearchSelect 
                        value={formData.pickupCityName} 
                        onSelect={(city) => setFormData(prev => ({ ...prev, pickupCity: city.id, pickupCityName: city.name }))}
                        priorityCities={data.pickup_points?.map(p => ({ id: String(p.city_id), name: p.city_name })) || []}
                        placeholder="Pilih Kota Penjemputan"
                        required
                      />
                    </div>  
                  </div>

                  {fleetSummary?.duration > 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Calendar className="inline h-4 w-4 mr-2" />
                          Tanggal Kembali *
                        </label>
                        <Input
                          name="returnDate"
                          type="date"
                          value={formData.returnDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <Clock className="inline h-4 w-4 mr-2" />
                          Jam Kembali *
                        </label>
                        <Input
                          name="returnTime"
                          type="time"
                          value={formData.returnTime}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  )}
                  
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

              {/* 3. Rencana Perjalanan */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      3. Rencana Perjalanan
                    </h2>
                  </div>
                  
                  <div className="space-y-8">
                    {formData.itinerary.map((day, dayIndex) => (
                      <div key={dayIndex} className="p-4 border rounded-xl bg-gray-50/50 dark:bg-gray-800/50 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                          <h3 className="font-bold text-blue-600 dark:text-blue-400">Hari {day.day}</h3>
                        </div>

                        <div className="space-y-6">
                          {day.events.map((event, eventIndex) => (
                            <div key={eventIndex} className="space-y-3 relative">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500">Tujuan {eventIndex + 1}</span>
                                {day.events.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeEvent(dayIndex, eventIndex)}
                                    className="bg-transparent border-red border-slate-400 text-red hover:text-red-500 h-6 px-1"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Input
                                    value={event.location}
                                    onChange={(e) => handleEventChange(dayIndex, eventIndex, 'location', e.target.value)}
                                    placeholder="Detail Lokasi (misal: Pantai Kuta)"
                                    required
                                  />
                                </div>
                                <div>
                                  <CitySearchSelect
                                    value={event.city_name}
                                    onSelect={(city) => handleItineraryCitySelect(dayIndex, eventIndex, city)}
                                    placeholder="Pilih Kota"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addEvent(dayIndex)}
                            className="w-full border-dashed border-2xl bg-blue-500 text-white hover:border-blue-300 hover:bg-blue-600 hover:text-white transition-all py-4"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Tujuan di Hari {day.day}
                          </Button>
                        </div>
                      </div>
                    ))}
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
                      <div className="flex items-center justify-center space-x-4">
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
                        Ketersediaan armada: {totalAvailable} unit
                      </p>
                      {totalAvailable > 0 && formData.armadaCount >= totalAvailable && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          * Jumlah tidak bisa melebihi unit yang tersedia
                        </p>
                      )}
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
                              selectedAddons.find(a => (a.addon_id || a.uuid) === (addon.addon_id || addon.uuid))
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                            }`}
                            onClick={() => handleToggleAddon(addon)}
                          >
                            <div className="flex-shrink-0">
                              {selectedAddons.find(a => (a.addon_id || a.uuid) === (addon.addon_id || addon.uuid)) ? (
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
                <Button 
                  type="submit" 
                  size="lg" 
                  className="px-8 w-full rounded-2xl bg-blue-500 hover:bg-blue-600 transition-all" 
                  disabled={isSubmitting || !isAvailable || checkingAvailability}
                >
                  {isSubmitting ? 'Memproses...' : checkingAvailability ? 'Mengecek Ketersediaan...' : !isAvailable ? 'Armada Tidak Tersedia' : 'Lanjutkan Pemesanan'}
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
                      {data.rent_type_label && (
                        <span className="inline-block mt-1 mb-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                          {data.rent_type_label}
                        </span>
                      )}
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
                        Harga Sewa
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        Rp {data.price.toLocaleString('id-ID')}
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
                  {formData.itinerary.some(day => day.events.some(event => event.city_name || event.location)) && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Rencana Perjalanan:
                      </h4>
                      <div className="space-y-4">
                        {formData.itinerary
                          .filter(day => day.events.some(event => event.city_name || event.location))
                          .map((day, dayIdx) => (
                            <div key={dayIdx} className="space-y-1">
                              <span className="text-xs font-bold text-blue-600">Hari {day.day}</span>
                              {day.events
                                .filter(event => event.city_name || event.location)
                                .map((event, eventIdx) => (
                                  <div key={eventIdx} className="flex items-start text-xs text-gray-600 dark:text-gray-300 ml-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                                    <span>
                                      {event.location && <span className="font-medium">{event.location}</span>}
                                      {event.location && event.city_name && <span>, </span>}
                                      {event.city_name && <span>{event.city_name}</span>}
                                    </span>
                                  </div>
                                ))}
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
