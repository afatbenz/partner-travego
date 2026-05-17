import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Minus,
  CheckSquare,
  Square,
  Users,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { http, API_BASE_URL } from '@/lib/http';

interface PackageAddon {
  addon_id: string;
  description: string;
  price: number;
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

interface PackageMeta {
  package_id: string;
  package_name: string;
  package_type_label: string;
  package_description: string;
  thumbnail: string;
  duration: number;
}

interface TourPackageDetailData {
  meta: PackageMeta;
  pricing: PackagePricing[];
  pickup_areas: PackagePickupArea[];
  facilities: string[];
  addons: PackageAddon[];
}

interface TourPackageDetailResponse {
  status: string;
  message: string;
  data: TourPackageDetailData;
}

interface SearchableSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
}) => {
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
            : <span className="text-muted-foreground">{placeholder || 'Pilih...'}</span>}
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
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
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

const resolveMediaUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
};

export const CatalogCheckout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { package_id, price_id, pax: statePax } = location.state || {};

  const [packageDetail, setPackageDetail] = useState<TourPackageDetailData | null>(null);
  const [selectedPricing, setSelectedPricing] = useState<PackagePricing | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<PackageAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    travelDate: '',
    pickupTime: '',
    pickupCity: '',
    pickupLocation: '',
    pickupAddress: '',
    participants: statePax || 1,
    specialRequest: '',
  });

  useEffect(() => {
    const fetchDetail = async () => {
      const activePackageId = package_id || id;
      if (!activePackageId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await http.post<TourPackageDetailResponse>(
          '/api/service/tour-packages/detail',
          { package_id: activePackageId }
        );
        if (response.data.status === 'success') {
          const data = response.data.data;
          setPackageDetail({
            ...data,
            pricing: data.pricing ?? [],
            pickup_areas: data.pickup_areas ?? [],
            facilities: data.facilities ?? [],
            addons: data.addons ?? [],
          });

          const activePriceId = price_id || location.state?.pricing?.price_id;
          if (activePriceId && data.pricing?.length) {
            const matched = data.pricing.find((p) => p.price_id === activePriceId);
            if (matched) setSelectedPricing(matched);
          }
        }
      } catch (error) {
        console.error('Failed to fetch package detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [package_id, price_id, id, location.state]);

  const handleToggleAddon = (addon: PackageAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.addon_id === addon.addon_id);
      if (exists) return prev.filter((a) => a.addon_id !== addon.addon_id);
      return [...prev, addon];
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (value: number) => {
    setFormData((prev) => ({ ...prev, participants: Math.max(1, value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !packageDetail || !selectedPricing) return;

    setIsSubmitting(true);
    try {
      const activePackageId = package_id || packageDetail.meta.package_id;
      const payload = {
        package_id: activePackageId,
        price_id: selectedPricing.price_id,
        fullname: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        start_date: `${formData.travelDate} ${formData.pickupTime}`,
        pickup_city_id: formData.pickupCity,
        pickup_location: formData.pickupLocation,
        pickup_address: formData.pickupAddress,
        qty: formData.participants,
        special_request: formData.specialRequest,
        addons: selectedAddons.map((a) => a.addon_id),
      };

      const response = await http.post<any>('/api/order/tour-package/create', payload);
      const token = response.data?.token || response.data?.data?.token;

      if (token) {
        navigate(`/payment/catalog/${token}`);
      } else if (response.data?.status === 'success') {
        const orderId = response.data.data?.order_id || response.data.order_id;
        if (orderId) {
          navigate(`/payment/catalog/${orderId}`);
        } else {
          toast({
            title: 'Error',
            description: 'Terjadi kesalahan: ID pesanan tidak ditemukan.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Gagal',
          description: response.data?.message || 'Terjadi kesalahan saat membuat pesanan',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat pesanan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!packageDetail || !selectedPricing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 pt-24">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Data Paket Tidak Ditemukan
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          Mohon pilih paket dan harga dari halaman detail terlebih dahulu.
        </p>
        <Button onClick={() => navigate(-1)}>Kembali</Button>
      </div>
    );
  }

  const meta = packageDetail.meta;
  const unitPrice = selectedPricing.price;
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const totalPrice = (unitPrice + addonsTotal) * formData.participants;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
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
              Checkout Paket Wisata
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
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
                        Alamat
                      </label>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Alamat lengkap"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    2. Tanggal Wisata
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Calendar className="inline h-4 w-4 mr-2" />
                        Tanggal Keberangkatan *
                      </label>
                      <Input
                        name="travelDate"
                        type="date"
                        value={formData.travelDate}
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
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    3. Jumlah Peserta
                  </h2>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        <Users className="inline h-4 w-4 mr-2" />
                        Jumlah Peserta *
                      </label>
                      <div className="flex items-center space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleNumberChange(formData.participants - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-2xl font-bold w-16 text-center">
                          {formData.participants}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleNumberChange(formData.participants + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Tier harga: {selectedPricing.min_pax} - {selectedPricing.max_pax} pax
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    4. Titik Penjemputan
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <MapPin className="inline h-4 w-4 mr-2" />
                        Kota Penjemputan *
                      </label>
                      <SearchableSelect
                        value={formData.pickupCity}
                        onChange={(value) =>
                          setFormData((prev) => ({ ...prev, pickupCity: value }))
                        }
                        options={
                          packageDetail.pickup_areas?.map((p) => ({
                            value: String(p.city_id),
                            label: p.city_name,
                          })) || []
                        }
                        placeholder="Pilih Kota"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lokasi Penjemputan *
                      </label>
                      <Input
                        name="pickupLocation"
                        value={formData.pickupLocation}
                        onChange={handleInputChange}
                        placeholder="Contoh: Hotel, alamat penjemputan"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Alamat Lengkap
                      </label>
                      <Textarea
                        name="pickupAddress"
                        value={formData.pickupAddress}
                        onChange={handleInputChange}
                        placeholder="Masukkan alamat lengkap penjemputan"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {packageDetail.addons.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                      5. Paket Addon
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                      {packageDetail.addons.map((addon) => (
                        <div
                          key={addon.addon_id}
                          className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedAddons.find((a) => a.addon_id === addon.addon_id)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => handleToggleAddon(addon)}
                        >
                          <div className="flex-shrink-0">
                            {selectedAddons.find((a) => a.addon_id === addon.addon_id) ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {addon.description}
                            </h4>
                          </div>
                          <div className="font-semibold text-blue-600 dark:text-blue-400">
                            Rp {addon.price.toLocaleString('id-ID')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    {packageDetail.addons.length > 0 ? '6. ' : '5. '}
                    Permintaan Khusus
                  </h2>
                  <Textarea
                    name="specialRequest"
                    value={formData.specialRequest}
                    onChange={handleInputChange}
                    placeholder="Tuliskan permintaan khusus Anda (opsional)"
                    rows={5}
                    className="resize-none"
                  />
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  className="px-8 w-full rounded-2xl bg-blue-500 hover:bg-blue-600 transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Memproses...' : 'Lanjutkan Pemesanan'}
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Ringkasan Pesanan
                  </h3>
                  <div className="flex items-start space-x-3 mb-4">
                    <img
                      src={resolveMediaUrl(meta.thumbnail)}
                      alt={meta.package_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {meta.package_name}
                      </h4>
                      {meta.package_type_label && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                          {meta.package_type_label}
                        </span>
                      )}
                      {meta.duration > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {meta.duration} Hari
                        </p>
                      )}
                    </div>
                  </div>

                  {packageDetail.facilities.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-xs">
                        Fasilitas:
                      </h4>
                      <ul className="grid grid-cols-1 gap-1">
                        {packageDetail.facilities.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start text-xs text-gray-600 dark:text-gray-400"
                          >
                            <CheckSquare className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Harga / pax</span>
                      <span className="text-gray-900 dark:text-white">
                        Rp {unitPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Jumlah peserta</span>
                      <span className="text-gray-900 dark:text-white">
                        {formData.participants} orang
                      </span>
                    </div>
                    {selectedAddons.length > 0 && (
                      <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-2 mt-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                          Addons:
                        </span>
                        {selectedAddons.map((addon) => (
                          <div key={addon.addon_id} className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-300 truncate w-2/3">
                              {addon.description}
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              Rp {addon.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-3">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        Rp {totalPrice.toLocaleString('id-ID')}
                      </span>
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

