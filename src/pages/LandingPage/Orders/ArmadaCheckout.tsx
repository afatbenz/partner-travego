import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCheckout } from '@/contexts/CheckoutContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Calendar, Clock, Car, MapPin, Plus, Minus, X, 
  CheckSquare, Square, Users, Check, ChevronsUpDown,
  Info, ShieldCheck, MessageCircle, ThumbsUp, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { http } from '@/lib/http';
import { motion, AnimatePresence } from 'framer-motion';

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
            className="w-full justify-between font-normal bg-white border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5] transition-all rounded-xl"
          >
            {value
              ? value
              : <span className="text-[#64748B]">{placeholder || "Pilih Kota..."}</span>}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 rounded-xl" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
               placeholder="Cari kota..." 
               value={search}
               onValueChange={setSearch} 
            />
            <CommandList>
                {loading ? (
                    <div className="py-6 text-center text-sm text-[#64748B]">Loading...</div>
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
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 text-[#4F46E5]",
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
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-[#4F46E5]",
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

const SectionCard = ({ title, step, children }: { title: string; step: number; children: React.ReactNode }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    whileInView={{ opacity: 1, y: 0 }} 
    viewport={{ once: true }} 
    transition={{ duration: 0.4 }}
    className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden"
  >
    <div className="p-6 md:p-8">
      <h2 className="text-lg font-semibold text-[#0F172A] mb-6 flex items-center">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#4F46E5]/10 text-[#4F46E5] text-sm mr-3 font-bold">
          {step}
        </span>
        {title}
      </h2>
      {children}
    </div>
  </motion.div>
);

export const ArmadaCheckout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { setCheckoutData } = useCheckout();
  const { toast } = useToast();
  const { fleet_id, price_id, startDate, endDate, cityId, cityName, pricing } = location.state || {};
  
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
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);

  // Calculate default dates
  let defaultReturnDate = endDate || '';
  if (!defaultReturnDate && startDate && pricing) {
    const duration = pricing.duration || 0;
    const uom = pricing.uom || '';
    
    if (uom.toLowerCase() === 'hari' || uom.toLowerCase() === 'days') {
      const date = new Date(startDate);
      date.setDate(date.getDate() + duration);
      defaultReturnDate = date.toISOString().split('T')[0];
    } else if (duration >= 24) {
      const days = Math.floor(duration / 24);
      const date = new Date(startDate);
      date.setDate(date.getDate() + days);
      defaultReturnDate = date.toISOString().split('T')[0];
    } else {
      defaultReturnDate = startDate;
    }
  }

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
    pickupDate: startDate || '',
    pickupTime: '',
    returnDate: defaultReturnDate,
    returnTime: '',
    
    // Titik penjemputan
    pickupCity: cityId ? cityId.toString() : '',
    pickupCityName: cityName || '',
    pickupLocation: '',
    pickupAddress: '',
    
    // Rencana Perjalanan
    itinerary: [{ day: 1, events: [{ location: cityName || '', city_id: cityId ? cityId.toString() : '', city_name: cityName || '' }] }],
    
    // Jumlah Armada
    armadaCount: 1,

    // Catatan
    notes: ''
  });

  useEffect(() => {
    const fetchSummary = async () => {
      let activeFleetId = fleet_id;
      let activePriceId = price_id;

      if (!activeFleetId && id) {
        activeFleetId = id;
      }

      if (!activeFleetId) return;

      setLoadingSummary(true);
      try {
        if (!activePriceId) {
          try {
             const detailRes = await http.post<any>('/api/service/fleet/detail', { fleet_id: activeFleetId });
             if (detailRes.data?.status === 'success' && detailRes.data?.data?.pricing?.length > 0) {
                const statePricing = location.state?.pricing;
                if (statePricing && (statePricing.price_id || statePricing.uuid)) {
                   activePriceId = statePricing.price_id || statePricing.uuid;
                } else {
                   const firstPricing = detailRes.data.data.pricing[0];
                   activePriceId = firstPricing.price_id || firstPricing.uuid;
                }
             }
          } catch (err) {
             console.error('Failed to fetch fleet details for default pricing:', err);
          }
        }

        if (activeFleetId && activePriceId) {
          setActivePriceId(activePriceId);
          const response = await http.post<FleetSummaryResponse>('/api/order/fleet/summary', {
            fleet_id: activeFleetId,
            price_id: activePriceId
          });
          if (response.data.status === 'success') {
            setFleetSummary(response.data.data);
            
            const duration = response.data.data.duration || 1;
            setFormData(prev => ({
              ...prev,
              itinerary: Array.from({ length: duration }, (_, i) => ({
                day: i + 1,
                events: [{ location: '', city_id: '', city_name: '' }]
              }))
            }));
            setExpandedDays([1]); // expand first day
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
    if (endDate && formData.pickupDate && fleetSummary?.duration) {
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
  }, [formData.pickupDate, fleetSummary, endDate]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!id || !formData.pickupDate || !fleetSummary) return;

      const duration = fleetSummary.duration || 1;
      let start_date = `${formData.pickupDate} ${formData.pickupTime || '00:00'}`;
      let end_date = "";

      if (formData.returnDate) {
        end_date = `${formData.returnDate} ${formData.returnTime || '23:59'}`;
      } else if (duration === 1) {
        end_date = `${formData.pickupDate} 23:59`;
      } else {
        return;
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
          console.error('Failed to fetch customer availability:', error);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      fetchCustomerAvailability();
    }, 1000); 

    return () => clearTimeout(timeoutId);
  }, [formData.email, formData.phone]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      let phoneVal = value.replace(/\D/g, ''); // hanya angka
      if (phoneVal.startsWith('0')) {
        phoneVal = '62' + phoneVal.substring(1);
      }
      setFormData(prev => ({ ...prev, [name]: phoneVal }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: string, value: number) => {
    let finalValue = Math.max(1, value);
    if (name === 'armadaCount' && isAvailable && totalAvailable > 0) {
      finalValue = Math.min(finalValue, totalAvailable);
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
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

  const toggleDay = (day: number) => {
    setExpandedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
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
        notes: formData.notes,
        addons: selectedAddons.map(a => a.addon_id || a.uuid)
      };

      const response = await http.post<any>('/api/order/fleet/create', payload);

      const token = response.data?.token || response.data?.data?.token;
      const orderId = response.data.data?.order_id || response.data.order_id;
      const finalId = token || orderId;

      if (response.data.status === 'success' || token) {
        if (finalId) {
          if (orderId) setCheckoutData(orderId, id || '');
          navigate(`/order/success/armada/${encodeURIComponent(finalId)}`, {
            state: {
              orderData: {
                id: orderId || finalId,
                item: fleetSummary?.fleet_name,
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
              }
            }
          });
        } else {
          toast({ title: "Error", description: "ID pesanan tidak ditemukan.", variant: "destructive" });
        }
      } else {
        toast({ title: "Gagal", description: response.data.message || 'Gagal membuat pesanan', variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal membuat pesanan. Silakan coba lagi.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loadingSummary) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (!fleetSummary) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 flex flex-col items-center justify-center p-4 pt-24">
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">Data Armada Tidak Ditemukan</h2>
        <p className="text-[#64748B] dark:text-gray-400 mb-4">Mohon kembali ke halaman sebelumnya dan pilih armada kembali.</p>
        <Button onClick={() => navigate(-1)} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 rounded-xl">Kembali</Button>
      </div>
    );
  }

  const basePrice = fleetSummary.price;
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.addon_price, 0);
  const totalPrice = (basePrice + addonsTotal) * formData.armadaCount;
  const data = fleetSummary;

  const steps = ['Detail Pemesan', 'Rencana Perjalanan', 'Detail Armada', 'Konfirmasi'];

  return (
    <div className="min-h-screen dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 mt-10 top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-sm text-[#64748B] hover:text-[#0F172A] dark:text-gray-400 dark:hover:text-white mb-4 transition-colors font-medium w-max"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Kembali
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] dark:text-white">
            Checkout Armada
          </h1>
          <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">Lengkapi detail pemesanan Anda dengan benar</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Progress Step (Visual) */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center min-w-max">
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex items-center group">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors",
                    idx === 0 ? "bg-[#4F46E5] text-white shadow-md shadow-[#4F46E5]/20" : "bg-white text-[#64748B] border border-[#E2E8F0]"
                  )}>
                    {idx + 1}
                  </div>
                  <span className={cn(
                    "ml-3 text-sm font-medium transition-colors",
                    idx === 0 ? "text-[#4F46E5]" : "text-[#64748B]"
                  )}>
                    {step}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-8 md:w-16 h-px bg-[#E2E8F0] mx-4"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Form Area */}
          <div className="flex-1 space-y-6 order-2 lg:order-1">
            
            {/* Floating Schedule Info (Moved below stepper, inside main form area for better mobile flow) */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/60 backdrop-blur-md border border-[#E2E8F0] rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center space-x-4 p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#4F46E5]/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-[#4F46E5]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-[#64748B] font-medium mb-0.5">Jadwal Penjemputan</p>
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{formatDate(formData.pickupDate)}</p>
                  <p className="text-xs text-[#64748B] truncate">{formData.pickupCityName || 'Pilih kota penjemputan'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
                <div className="w-10 h-10 rounded-full bg-[#4F46E5]/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-[#4F46E5]" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-[#64748B] font-medium mb-0.5">Jadwal Kembali</p>
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{formatDate(formData.returnDate)}</p>
                  <p className="text-xs text-[#64748B] truncate">{formData.pickupCityName || 'Kembali ke kota asal'}</p>
                </div>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Nama dan Kontak */}
              <SectionCard title="Nama dan Kontak Pemesan" step={1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Nama Lengkap *</label>
                    <Input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Sesuai KTP/Paspor" required className="rounded-xl border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Email *</label>
                    <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="contoh@email.com" required className="rounded-xl border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Nomor Telepon *</label>
                    <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="08123456789" required className="rounded-xl border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Instansi / Organisasi</label>
                    <Input name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder="Kosongkan jika personal" className="rounded-xl border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Alamat Lengkap *</label>
                    <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="Nama jalan, RT/RW, kelurahan" required className="rounded-xl border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5] transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Kota Asal *</label>
                    <CitySearchSelect value={formData.city_name} onSelect={(city) => setFormData(prev => ({ ...prev, city_id: city.id, city_name: city.name }))} placeholder="Pilih Kota" required />
                  </div>
                </div>
              </SectionCard>

              {/* 2. Lokasi Penjemputan */}
              <SectionCard title="Lokasi Penjemputan" step={2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Kota Penjemputan *</label>
                    <CitySearchSelect 
                      value={formData.pickupCityName} 
                      onSelect={(city) => setFormData(prev => ({ ...prev, pickupCity: city.id, pickupCityName: city.name }))}
                      priorityCities={data.pickup_points?.map(p => ({ id: String(p.city_id), name: p.city_name })) || []}
                      placeholder="Pilih Kota Penjemputan"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[#0F172A]">Detail Lokasi *</label>
                    <Input name="pickupLocation" value={formData.pickupLocation} onChange={handleInputChange} placeholder="Contoh: Hotel Grand Indonesia, Bandara Soekarno Hatta" required className="rounded-xl border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5] transition-all" />
                  </div>
                  <div className="space-y-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center text-sm font-bold text-[#4F46E5] mb-2"><Calendar className="w-4 h-4 mr-2"/> Penjemputan</div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#64748B]">Tanggal (Otomatis)</label>
                      <div className="relative">
                        <Input 
                          type="date" 
                          name="pickupDate" 
                          value={formData.pickupDate} 
                          onChange={handleInputChange} 
                          className="bg-white text-[#64748B] border-[#E2E8F0] cursor-not-allowed rounded-xl [color-scheme:light] dark:[color-scheme:dark]" 
                          readOnly 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#0F172A]">Jam Penjemputan *</label>
                      <Input type="time" name="pickupTime" value={formData.pickupTime} onChange={handleInputChange} className="rounded-xl bg-white border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5] transition-all [color-scheme:light] dark:[color-scheme:dark]" required />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center text-sm font-bold text-[#4F46E5] mb-2"><Calendar className="w-4 h-4 mr-2"/> Kembali</div>
                    <div className="space-y-1.5">
                      <label className={cn("text-xs font-medium", endDate ? "text-[#64748B]" : "text-[#0F172A]")}>
                        Tanggal {endDate ? '(Otomatis)' : '*'}
                      </label>
                      {endDate ? (
                        <div className="relative">
                          <Input 
                            type="date" 
                            name="returnDate" 
                            value={formData.returnDate} 
                            onChange={handleInputChange} 
                            className="bg-white text-[#64748B] border-[#E2E8F0] cursor-not-allowed rounded-xl [color-scheme:light] dark:[color-scheme:dark]" 
                            readOnly 
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <Input 
                            type="date" 
                            name="returnDate" 
                            value={formData.returnDate} 
                            onChange={handleInputChange} 
                            min={formData.pickupDate}
                            className="rounded-xl bg-white border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5] transition-all cursor-text [color-scheme:light] dark:[color-scheme:dark]" 
                            required 
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#0F172A]">Jam Kembali *</label>
                      <Input type="time" name="returnTime" value={formData.returnTime} onChange={handleInputChange} className="rounded-xl bg-white border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5] transition-all [color-scheme:light] dark:[color-scheme:dark]" required={!endDate || fleetSummary?.duration > 1} />
                    </div>
                  </div>
                </div>
                 <div className="mt-4 flex items-start text-xs text-[#64748B] bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <Info className="w-4 h-4 mr-2 flex-shrink-0 text-blue-500 mt-0.5" />
                  <p>Jam kembali maksimal adalah waktu yang sama dengan jam penjemputan di hari terakhir masa sewa. Keterlambatan dapat dikenakan biaya tambahan.</p>
                </div>
              </SectionCard>

              {/* 4. Rencana Perjalanan */}
              <SectionCard title="Rencana Perjalanan" step={4}>
                <div className="space-y-4">
                  {formData.itinerary.map((day, dayIndex) => {
                    const isExpanded = expandedDays.includes(day.day);
                    return (
                      <div key={dayIndex} className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-200 hover:border-[#4F46E5]/30">
                        <div 
                          className="flex justify-between items-center p-4 cursor-pointer bg-[#F8FAFC] hover:bg-slate-100 transition-colors"
                          onClick={() => toggleDay(day.day)}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="px-2.5 py-1 bg-[#4F46E5] text-white text-xs font-normal rounded-md">Hari {day.day}</span>
                            <span className="text-sm font-medium text-[#0F172A]">{day.events.length} Tujuan</span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-[#64748B]" /> : <ChevronDown className="w-5 h-5 text-[#64748B]" />}
                        </div>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }} 
                              animate={{ height: 'auto', opacity: 1 }} 
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="p-4 space-y-4 border-t border-[#E2E8F0]">
                                {day.events.map((event, eventIndex) => (
                                  <div key={eventIndex} className="relative bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                                    <div className="flex justify-between items-center mb-3">
                                      <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Tujuan {eventIndex + 1}</span>
                                      {day.events.length > 1 && (
                                        <button type="button" onClick={() => removeEvent(dayIndex, eventIndex)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors">
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-[#0F172A]">Detail Lokasi / Tempat Wisata</label>
                                        <Input value={event.location} onChange={(e) => handleEventChange(dayIndex, eventIndex, 'location', e.target.value)} placeholder="Misal: Pantai Kuta" required className="rounded-lg bg-white" />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-[#0F172A]">Kota Tujuan</label>
                                        <CitySearchSelect value={event.city_name} onSelect={(city) => handleItineraryCitySelect(dayIndex, eventIndex, city)} placeholder="Pilih Kota" required />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <Button type="button" variant="outline" onClick={() => addEvent(dayIndex)} className="w-full border-dashed border-2 border-[#E2E8F0] text-[#4F46E5] hover:border-[#4F46E5] hover:bg-[#4F46E5]/5 rounded-xl py-6 transition-all">
                                  <Plus className="w-4 h-4 mr-2" /> Tambah Tujuan di Hari {day.day}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>

              {/* 5. Detail Armada & Addon */}
              <SectionCard title="Detail Armada & Tambahan" step={5}>
                <div className="mb-8 p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col items-center">
                  <label className="text-sm font-semibold text-[#0F172A] mb-4 flex items-center">
                    <Car className="w-5 h-5 mr-2 text-[#4F46E5]" />
                    Jumlah Armada Dibutuhkan *
                  </label>
                  <div className="flex items-center justify-center bg-white border border-[#E2E8F0] rounded-full p-1 shadow-sm">
                    <button type="button" onClick={() => handleNumberChange('armadaCount', formData.armadaCount - 1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-[#0F172A] transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-16 text-center text-xl font-bold text-[#0F172A]">
                      {formData.armadaCount}
                    </span>
                    <button type="button" onClick={() => handleNumberChange('armadaCount', formData.armadaCount + 1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-[#0F172A] transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-col items-center">
                    <p className="text-xs font-medium text-[#64748B] bg-white px-3 py-1 rounded-full border border-[#E2E8F0]">
                      Ketersediaan: <span className="text-[#4F46E5] font-bold">{totalAvailable} unit</span>
                    </p>
                  </div>
                </div>

                {addons.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Layanan Tambahan (Add-ons)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {addons.map((addon) => {
                        const isSelected = selectedAddons.find(a => (a.addon_id || a.uuid) === (addon.addon_id || addon.uuid));
                        return (
                          <div 
                            key={addon.uuid} 
                            onClick={() => handleToggleAddon(addon)}
                            className={cn(
                              "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between",
                              isSelected ? "border-[#4F46E5] bg-[#4F46E5]/5" : "border-[#E2E8F0] hover:border-[#4F46E5]/30 bg-white"
                            )}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-[#0F172A] text-sm pr-6">{addon.addon_name}</h4>
                              <div className="absolute top-4 right-4">
                                {isSelected ? (
                                  <div className="w-5 h-5 rounded bg-[#4F46E5] flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded border-2 border-[#E2E8F0]" />
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-[#64748B] mb-3 line-clamp-2">{addon.addon_desc}</p>
                            <div className="font-bold text-[#4F46E5] text-sm">
                              + Rp {addon.addon_price.toLocaleString('id-ID')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* 6. Catatan Pesanan */}
              <SectionCard title="Catatan Pesanan" step={6}>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">Pesan Tambahan (Opsional)</label>
                  <Textarea 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleInputChange} 
                    placeholder="Tulis catatan khusus, request fasilitas, atau informasi penting lainnya..."
                    className="min-h-[120px] resize-none rounded-xl border-[#E2E8F0] focus:border-[#4F46E5] focus:ring-[#4F46E5] transition-all"
                    maxLength={500}
                  />
                  <div className="text-right mt-2 text-xs text-[#64748B] font-medium">
                    {formData.notes.length} / 500
                  </div>
                </div>
              </SectionCard>

            </form>
          </div>

          {/* Sticky Summary Area */}
          <div className="w-full lg:w-[400px] order-1 lg:order-2">
            <div className="sticky top-24">
              <Card className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-[#0F172A] mb-5">Ringkasan Pemesanan</h3>
                  
                  {/* Armada Info */}
                  <div className="flex items-start space-x-4 mb-6">
                    <img src={data.thumbnail} alt={data.fleet_name} className="w-20 h-20 object-cover rounded-xl border border-[#E2E8F0] shadow-sm" />
                    <div className="flex-1">
                      <h4 className="font-bold text-[#0F172A] leading-tight mb-1">{data.fleet_name}</h4>
                      {data.rent_type_label && (
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#4F46E5]/10 text-[#4F46E5] rounded-md mb-2">
                          {data.rent_type_label}
                        </span>
                      )}
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] font-medium text-[#64748B] bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0]">{data.capacity} Seat</span>
                        <span className="text-[10px] font-medium text-[#64748B] bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E2E8F0]">{data.engine}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0] mb-6">
                    <div className="relative pl-6 space-y-4">
                      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-200"></div>
                      <div className="relative">
                        <div className="absolute -left-6 w-3 h-3 rounded-full bg-[#4F46E5] border-2 border-white shadow-sm top-1"></div>
                        <p className="text-xs font-medium text-[#0F172A]">Penjemputan</p>
                        <p className="text-xs text-[#64748B] mt-0.5">{formatDate(formData.pickupDate)} {formData.pickupTime ? `• ${formData.pickupTime}` : ''}</p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-6 w-3 h-3 rounded-full bg-slate-300 border-2 border-white shadow-sm top-1"></div>
                        <p className="text-xs font-medium text-[#0F172A]">Kembali</p>
                        <p className="text-xs text-[#64748B] mt-0.5">{formatDate(formData.returnDate)} {formData.returnTime ? `• ${formData.returnTime}` : ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Facilities */}
                  {data.facilities && data.facilities.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-medium text-[#0F172A] mb-2">Fasilitas Termasuk:</p>
                      <div className="flex flex-wrap gap-2">
                        {data.facilities.map((item, idx) => (
                          <span key={idx} className="flex items-center text-[11px] font-medium text-[#64748B] bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <Check className="w-3 h-3 text-green-500 mr-1" /> {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Calculation */}
                  <div className="space-y-3 pt-4 border-t border-dashed border-[#E2E8F0]">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Sewa ({formData.armadaCount} Unit)</span>
                      <span className="font-semibold text-[#0F172A]">Rp {(basePrice * formData.armadaCount).toLocaleString('id-ID')}</span>
                    </div>

                    {selectedAddons.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold text-[#0F172A]">Layanan Tambahan:</span>
                        {selectedAddons.map(addon => (
                          <div key={addon.uuid} className="flex justify-between text-xs pl-2 border-l-2 border-[#4F46E5]/20">
                            <span className="text-[#64748B] truncate max-w-[180px]">{addon.addon_name} x{formData.armadaCount}</span>
                            <span className="font-medium text-[#0F172A]">Rp {(addon.addon_price * formData.armadaCount).toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Total */}
                  <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex justify-between items-center">
                    <div>
                      <span className="block text-sm text-[#64748B] font-medium">Total Pembayaran</span>
                      <span className="text-xs text-[#64748B]">Termasuk pajak</span>
                    </div>
                    <span className="text-xl font-semibold text-[#4F46E5]">
                      Rp {totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Submit CTA */}
                  <div className="mt-6 space-y-4">
                    <Button 
                      type="submit" 
                      onClick={handleSubmit}
                      className="w-full h-14 bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group text-base"
                      disabled={isSubmitting || !isAvailable || checkingAvailability}
                    >
                      <span className="flex items-center justify-center w-full">
                        {isSubmitting ? 'Memproses Pesanan...' : checkingAvailability ? 'Mengecek Ketersediaan...' : !isAvailable ? 'Armada Tidak Tersedia' : 'Lanjutkan Pemesanan'}
                        {!isSubmitting && !checkingAvailability && isAvailable && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                      </span>
                    </Button>
                    
                    {/* Trust Indicators */}
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 gap-2.5">
                      <div className="flex items-center text-xs text-[#64748B] font-normal">
                        <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" /> Pembayaran Aman & Terenkripsi
                      </div>
                      <div className="flex items-center text-xs text-[#64748B] font-normal">
                        <MessageCircle className="w-4 h-4 mr-2 text-blue-500" /> Gratis Konsultasi Perjalanan
                      </div>
                      <div className="flex items-center text-xs text-[#64748B] font-normal">
                        <ThumbsUp className="w-4 h-4 mr-2 text-[#4F46E5]" /> Armada Terawat & Driver Profesional
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
