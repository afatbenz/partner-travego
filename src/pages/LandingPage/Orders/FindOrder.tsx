import React, { useState } from 'react';
// FindOrder component for tracking orders
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  MapPin, 
  User, 
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  Plus,
  Home,
  Printer,
  Banknote,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { http } from '@/lib/http';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Invoice } from '@/components/common/Invoice';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export interface OrderDetail {
  order_id: string;
  price_id: number;
  order_date: string;
  fleet_name: string;
  rent_type: number;
  rent_type_label: string;
  duration: number;
  duration_uom: string;
  price: number;
  quantity: number;
  total_amount: number;
  pickup: {
    pickup_location: string;
    pickup_city: string;
    start_date: string;
    end_date: string;
  };
  destination: Array<{
    city: string;
    location: string;
  }>;
  addon: Array<{
    addon_name: string;
    addon_price: number;
  }>;
  customer: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    customer_address: string;
  };
  payment: Array<{
    payment_type: string;
    bank_name: string;
    payment_amount: number;
    payment_date: string;
    unique_code: number;
    status: number;
    payment_percentage?: number;
    payment_remaining?: number;
  }>;
}

export default function FindOrder() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any | null>(null);
  const [orderToken, setOrderToken] = useState<string>("");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    setOrderToken("");

    try {
      const response = await http.get(`/api/order/fleet/find/${orderId}`);
      if (response.data.status === 'success') {
        const data = response.data.data;
        setSearchResult(data);
        const tokenFromData = data?.token;
        const tokenFromTop = response.data.token;
        if (tokenFromData || tokenFromTop) {
          setOrderToken(tokenFromData || tokenFromTop);
        }
      } else {
        setError(response.data.message || 'Pesanan tidak ditemukan');
      }
    } catch (err: any) {
      console.error('Error searching order:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mencari pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentStatus = (payment: any[]) => {
    if (!payment || payment.length === 0) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
          Belum Dibayar
        </Badge>
      );
    }
    
    const lastPayment = payment[payment.length - 1];
    
    if (lastPayment.status === 10) {
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">Sedang menunggu verifikasi</Badge>;
    }
    
    if (lastPayment.status === 1) { // Assuming 1 is success
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Lunas</Badge>;
    }
    
    return <Badge variant="secondary">Proses Pembayaran</Badge>;
  };

  const handlePrint = () => {
    window.print();
  };

  const fetchPaymentMethods = async () => {
    setIsPaymentLoading(true);
    try {
      const response = await http.get<any>('/api/order/payment-method');
      let methods: any[] = [];

      if (response.data?.data) {
        const data = response.data.data;
        if (Array.isArray(data)) {
          methods = data;
        } else {
          const transfer = Array.isArray(data.transfer) ? data.transfer : [];
          const qris = Array.isArray(data.qris) ? data.qris : [];
          methods = [...transfer, ...qris];
        }
      }
      setPaymentMethods(methods);
    } catch (err) {
      console.error('Failed to fetch payment methods:', err);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handlePayRemaining = () => {
    setSelectedPaymentMethod(null);
    setIsPaymentModalOpen(true);
    fetchPaymentMethods();
  };

  const handleProcessPayment = async () => {
    if (!searchResult || !selectedPaymentMethod) return;
    setIsProcessingPayment(true);
    try {
      const payload = {
        token: orderToken,
        payment_method: selectedPaymentMethod.bank_account_id,
        payment_type: 2,
        price_id: searchResult.price_id
      };

      const response = await http.post('/api/order/fleet/payment', payload);

      if (response.data.status === 'success' || response.status === 200) {
        navigate(`/purchase/armada/${orderToken}`, {
          state: {
            paymentMethod: selectedPaymentMethod,
            paymentData: response.data.data,
            paymentAmount: 0,
            paymentType: 'remaining'
          }
        });
        setIsPaymentModalOpen(false);
        setIsProcessingPayment(false);
      } else {
        throw new Error('payment_failed');
      }
    } catch (err) {
      console.error('Payment processing failed:', err);
      setIsPaymentModalOpen(false);
      await Swal.fire({ 
        icon: 'error', 
        title: 'Maaf, sepertinya ada kesalahan',
        allowOutsideClick: false,
        allowEscapeKey: false,
        stopKeydownPropagation: true,
        focusConfirm: true
      });
      setIsProcessingPayment(false);
      setIsPaymentModalOpen(true);
    }
  };

  const hasRemainingPayment = () => {
    if (!searchResult?.payment) return false;
    const dpPayment = searchResult.payment.find(p => String(p.payment_type) === '2');
    return dpPayment && (dpPayment.payment_remaining || 0) > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="print:hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 pt-24">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Lacak Pesanan
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Cari dan pantau status pesanan Anda
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        {/* Search Form */}
        <Card className="mb-8 print:hidden">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Masukkan Order ID (contoh: CLS70260301204-FRT)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={isLoading || !orderId.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mencari...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Cari
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search Result */}
        {searchResult && (
          <Card className="animate-in fade-in-50 duration-500">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Ringkasan Pesanan
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    ID: {searchResult.order_id}
                  </p>
                </div>
                {getPaymentStatus(searchResult.payment)}
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Main Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Detail Armada</h3>
                  <div className="font-semibold text-lg">{searchResult.fleet_name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {searchResult.rent_type_label} • {searchResult.duration} {searchResult.duration_uom}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {formatCurrency(searchResult.price)} x {searchResult.quantity} Unit
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Pembayaran</h3>
                  <div className="font-bold text-2xl text-blue-600">
                    {formatCurrency(searchResult.total_amount)}
                  </div>
                </div>
              </div>

              {/* Date & Location */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium">Waktu Pemesanan</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(searchResult.order_date)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium">Penjemputan</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {searchResult.pickup.pickup_location}, {searchResult.pickup.pickup_city}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(searchResult.pickup.start_date)} s/d {formatDate(searchResult.pickup.end_date)}
                    </div>
                  </div>
                </div>
                {searchResult.destination && searchResult.destination.length > 0 && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="font-medium">Tujuan</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {searchResult.destination.map((dest, idx) => (
                          <div key={idx}>• {dest.location}, {dest.city}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Addons */}
              {searchResult.addon && searchResult.addon.length > 0 && (
                <div>
                   <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Fasilitas Tambahan</h3>
                   <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-2">
                    {searchResult.addon.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <Plus className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-gray-700 dark:text-gray-200">{item.addon_name}</span>
                        </div>
                        <div className="font-medium text-blue-600 dark:text-blue-400">
                          {formatCurrency(item.addon_price)}
                        </div>
                      </div>
                    ))}
                   </div>
                </div>
              )}

              {/* Payment Info */}
              {searchResult.payment && searchResult.payment.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Rincian Pembayaran</h3>
                  <div className="space-y-3">
                    {[...searchResult.payment]
                      .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())
                      .map((pay, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {pay.bank_name} ({String(pay.payment_type) === '1' ? 'Pembayaran Penuh' : 'Pembayaran dengan DP'})
                            </span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {formatCurrency(pay.payment_amount)}
                            </span>
                          </div>
                          
                          {String(pay.payment_type) === '2' && (
                            <div className="mb-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 p-2 rounded border border-gray-100 dark:border-gray-600">
                                <div className="flex justify-between mb-1">
                                  <span>Persentase DP:</span>
                                  <span className="font-medium">{pay.payment_percentage}%</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="font-semibold text-gray-700 dark:text-gray-200">Sisa Tagihan:</span>
                                  <span className="font-bold text-xl text-red-600">{formatCurrency(pay.payment_remaining || 0)}</span>
                                </div>
                            </div>
                          )}

                          <div className="flex justify-between text-gray-500 text-xs">
                            <span>{formatDate(pay.payment_date)}</span>
                            <span>Kode Unik: {pay.unique_code}</span>
                          </div>
                          
                          {pay.status === 10 && (
                             <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-medium flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Sedang menunggu verifikasi
                             </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Data Pemesan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{searchResult.customer.customer_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{searchResult.customer.customer_phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{searchResult.customer.customer_email}</span>
                  </div>
                  <div className="flex items-center">
                    <Home className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{searchResult.customer.customer_address}</span>
                  </div>
                </div>
              </div>
              
              {/* Print Button */}
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 print:hidden space-y-4">
                {hasRemainingPayment() && (
                  <Button 
                    onClick={handlePayRemaining} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Banknote className="mr-2 h-4 w-4" />
                    Bayar Sisa Tagihan
                  </Button>
                )}
                <Button 
                  onClick={handlePrint} 
                  variant="outline" 
                  className="w-full"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Method Dialog */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
            <DialogDescription>
              Silakan pilih metode pembayaran untuk melunasi sisa tagihan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {isPaymentLoading ? (
               <div className="flex justify-center py-8">
                 <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
               </div>
            ) : paymentMethods.length > 0 ? (
              <>
                <div className="grid gap-3 pt-2 px-2 overflow-y-auto max-h-64 sm:max-h-72">
                  {paymentMethods.map((method, index) => (
                    <div
                      key={index}
                      onClick={() => !isProcessingPayment && setSelectedPaymentMethod(method)}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedPaymentMethod?.bank_account_id === method.bank_account_id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                      } ${isProcessingPayment ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {(method.icon || method.bank_logo) ? (
                        <img 
                          src={method.icon || method.bank_logo} 
                          alt={method.bank_name} 
                          className="h-8 w-12 object-contain mr-4" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      
                      <div className={`h-8 w-12 bg-gray-100 dark:bg-gray-800 rounded mr-4 flex items-center justify-center text-gray-400 ${(method.icon || method.bank_logo) ? 'hidden' : ''}`}>
                         <CreditCard className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{method.bank_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {method.bank_account_number ? `No. Rek: ${method.bank_account_number}` : method.payment_type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button 
                    className="w-full" 
                    onClick={handleProcessPayment} 
                    disabled={!selectedPaymentMethod || isProcessingPayment || !orderToken}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Lanjutkan Pembayaran'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Tidak ada metode pembayaran tersedia
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
      {searchResult && <Invoice order={searchResult} />}
    </div>
  );
};
