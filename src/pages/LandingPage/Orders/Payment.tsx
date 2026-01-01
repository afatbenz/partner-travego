import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, QrCode, Clock, CheckCircle, Copy, Download, ChevronDown, Wallet, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { http } from '@/lib/http';

interface OrderData {
  id: string;
  type: string;
  title: string;
  price: string;
  totalPrice: string;
  rawTotalAmount: number;
  participants: number;
  orderDate: string;
  paymentDeadline: string;
  duration: number;
  durationUom: string;
  pickup: { 
    pickup_location: string; 
    pickup_city: string;
    start_date: string;
    end_date: string;
  };
  destination: { city: string; location: string }[];
  addon: { addon_name: string; addon_price: number }[];
}

const bankTransferData = {
  bankName: "BCA",
  accountNumber: "1234567890",
  accountName: "PT TRAVEGO INDONESIA",
  transferCode: "123456"
};

const qrisData = {
  qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QRIS_PAYMENT_123456789",
  merchantName: "TRAVEGO"
};

export const Payment: React.FC = () => {
  const { type, id } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<'bank' | 'qris'>('bank');
  const [paymentType, setPaymentType] = useState<'full' | 'dp' | null>(null);
  const [dpPercentage, setDpPercentage] = useState<10 | 25 | 50 | 75>(25);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, amount: number} | null>(null);
  const [promoError, setPromoError] = useState('');
  // const [copied, setCopied] = useState(false); // Removed unused
  // const [timeLeft, setTimeLeft] = useState<string>(''); // Removed unused

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id || type !== 'armada') return;

      try {
        const response = await http.get<any>(`/api/order/fleet/detail/${id}`);
        if (response.data.status === 'success') {
          const data = response.data.data;
          
          // Helper to format currency
          const formatCurrency = (amount: number) => {
            return `Rp ${amount.toLocaleString('id-ID')}`;
          };

          // Calculate deadline (example: 24 hours from order time)
           const orderDate = new Date(data.order_date);
           const deadlineDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);

           setOrderData({
             id: data.order_id,
             type: 'armada',
             title: data.fleet_name,
             price: formatCurrency(data.price),
             totalPrice: formatCurrency(data.total_amount),
             rawTotalAmount: data.total_amount,
             participants: data.quantity,
             orderDate: data.order_date,
             paymentDeadline: deadlineDate.toISOString(),
             duration: data.duration,
             durationUom: data.duration_uom || 'Jam',
             pickup: data.pickup,
             destination: data.destination,
             addon: data.addon
           });
        }
      } catch (error) {
        console.error('Failed to fetch order detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (type === 'armada') {
        fetchOrderDetail();
    } else {
        // Fallback or handle other types if needed
        // For now, if not armada, maybe use sample data or just stop loading
        setLoading(false);
    }
  }, [id, type]);

  /* Removed Timer Logic
  useEffect(() => {
    if (!orderData?.paymentDeadline) return;
    // ...
  }, [orderData?.paymentDeadline]);
  */

  const handleProcessPayment = async () => {
    if (!id || !paymentType) return;
    
    setLoading(true);
    try {
      const payload: any = {
        token: id,
        payment_method: selectedPayment,
        payment_type: paymentType === 'full' ? 1 : 2,
      };

      if (appliedPromo) {
        payload.promo_code = appliedPromo.code;
      }

      if (paymentType === 'dp') {
        payload.payment_percentage = dpPercentage;
      }

      const response = await http.post('/api/order/fleet/payment', payload);

      if (response.data.status === 'success' || response.status === 200) {
        navigate(`/purchase/armada/${id}`, { 
          state: { 
            paymentMethod: selectedPayment,
            paymentAmount: getPaymentAmount(),
            paymentType: paymentType
          } 
        });
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      // You might want to show an error message here
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace('pukul ', '').replace('Pukul ', '');
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getPaymentAmount = () => {
    if (!orderData || !paymentType) return 0;
    
    let baseAmount = orderData.rawTotalAmount;
    if (appliedPromo) {
      baseAmount -= appliedPromo.amount;
    }
    
    if (baseAmount < 0) baseAmount = 0;

    if (paymentType === 'full') return baseAmount;
    return (baseAmount * dpPercentage) / 100;
  };

  const handleApplyPromo = () => {
    if (!promoCode) return;
    
    setPromoError('');
    
    // Mock validation logic
    const code = promoCode.toUpperCase();
    if (code === 'HEMAT100') {
      setAppliedPromo({ code: 'HEMAT100', amount: 100000 });
    } else if (code === 'DISKON10') {
       const discount = orderData ? orderData.rawTotalAmount * 0.1 : 0;
       setAppliedPromo({ code: 'DISKON10', amount: discount });
    } else {
      setPromoError('Kode promo tidak valid');
      setAppliedPromo(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!orderData) {
     return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Data Pesanan Tidak Ditemukan</h2>
            <Button onClick={() => navigate('/')}>Kembali ke Beranda</Button>
        </div>
     )
  }

  const currentPaymentAmount = getPaymentAmount();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4 bg-transparent hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pembayaran
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Payment Section */}
          <div className="lg:col-span-2">
            {/* Order Summary */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Ringkasan Pesanan
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Nomor Pesanan</span>
                    <span className="font-medium text-gray-900 dark:text-white">{orderData.id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Tanggal Pesanan</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(orderData.orderDate)}
                    </span>
                  </div>

                  {/* Pickup Info - Moved here as requested */}
                  {orderData.pickup && (
                    <>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Lokasi Penjemputan</span>
                            <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">
                                {orderData.pickup.pickup_location}, {orderData.pickup.pickup_city}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Tanggal Penjemputan</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {formatDate(orderData.pickup.start_date)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Tanggal Kembali</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {formatDate(orderData.pickup.end_date)}
                            </span>
                        </div>
                    </>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Item</span>
                    <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">
                      {orderData.title}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      {type === 'armada' ? 'Jumlah Armada' : 'Jumlah Peserta'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {orderData.participants} {type === 'armada' ? 'Unit' : 'orang'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Durasi Sewa</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {orderData.duration} {orderData.durationUom}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Harga per {type === 'catalog' ? 'pax' : 'hari'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {orderData.price}
                    </span>
                  </div>

                  {/* Detailed Order Info Collapsible */}
                  <Collapsible className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-gray-800 p-2 rounded-md">
                        <span>Detail Lainnya</span>
                        <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 space-y-4">
                         {/* Destination */}
                         {orderData.destination && orderData.destination.length > 0 && (
                            <div className="text-sm">
                                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Tujuan</p>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                                    {orderData.destination.map((dest, idx) => (
                                        <li key={idx}>{dest.location}, {dest.city}</li>
                                    ))}
                                </ul>
                            </div>
                         )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Addon Info - Moved here */}
                  {orderData.addon && orderData.addon.length > 0 && (
                    <>
                        <div className="mt-4 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">Add-on</span>
                        </div>
                        {orderData.addon.map((addon, idx) => (
                            <div key={idx} className="flex justify-between mt-2">
                            <span className="text-gray-600 dark:text-gray-300">{addon.addon_name}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(addon.addon_price)}
                            </span>
                            </div>
                        ))}
                    </>
                  )}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900 dark:text-white">Total Pembayaran</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {orderData.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code Selection */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Kode Promo
                    </h2>
                    <div className="flex space-x-2">
                        <div className="relative flex-1">
                            <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Masukkan kode promo (ex: HEMAT100)"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                className="pl-9"
                                disabled={!!appliedPromo}
                            />
                        </div>
                        {appliedPromo ? (
                             <Button variant="outline" onClick={() => {
                                 setAppliedPromo(null);
                                 setPromoCode('');
                             }}>
                                 Hapus
                             </Button>
                        ) : (
                             <Button onClick={handleApplyPromo}>
                                 Terapkan
                             </Button>
                        )}
                    </div>
                    {promoError && (
                        <p className="text-sm text-red-500 mt-2">{promoError}</p>
                    )}
                    {appliedPromo && (
                        <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                            <span className="text-sm text-green-700 dark:text-green-300">
                                Promo diterapkan: {appliedPromo.code}
                            </span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                                -{formatCurrency(appliedPromo.amount)}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Type Selection */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Pilih Jenis Pembayaran
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Full Payment */}
                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                paymentType === 'full'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            onClick={() => setPaymentType('full')}
                        >
                            <div className="flex items-center mb-2">
                                <Wallet className="h-5 w-5 text-blue-600 mr-2" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Pembayaran Penuh
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                Bayar lunas sekarang
                            </p>
                             <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {appliedPromo ? formatCurrency(orderData.rawTotalAmount - appliedPromo.amount) : orderData.totalPrice}
                            </div>
                        </div>

                        {/* Down Payment */}
                        <div
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                paymentType === 'dp'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                            onClick={() => setPaymentType('dp')}
                        >
                            <div className="flex items-center mb-2">
                                <Wallet className="h-5 w-5 text-blue-600 mr-2" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Uang Muka (DP)
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Bayar sebagian dulu
                            </p>
                        </div>
                    </div>

                    {paymentType === 'dp' && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                Pilih Persentase Uang Muka
                            </h3>
                            <div className="flex space-x-3">
                                {[10, 25, 50, 75].map((percentage) => (
                                    <Button
                                        key={percentage}
                                        variant={dpPercentage === percentage ? "default" : "outline"}
                                        onClick={() => setDpPercentage(percentage as 10 | 25 | 50 | 75)}
                                        className="flex-1"
                                    >
                                        {percentage}%
                                    </Button>
                                ))}
                            </div>
                             <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex justify-between items-center">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    Jumlah yang harus dibayar ({dpPercentage}%)
                                </span>
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(currentPaymentAmount)}
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>



            {/* Payment Method Selection */}
            {paymentType && (
            <Card className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Pilih Metode Pembayaran
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bank Transfer Option */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedPayment === 'bank'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedPayment('bank')}
                  >
                    <div className="flex items-center mb-3">
                      <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Transfer Bank
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Transfer ke BCA
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      • Instan • Tanpa biaya admin
                    </div>
                  </div>

                  {/* QRIS Option */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedPayment === 'qris'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedPayment('qris')}
                  >
                    <div className="flex items-center mb-3">
                      <QrCode className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          QRIS
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Scan QR Code
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      • Instan • Tanpa biaya admin
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Continue Payment Button */}
            {selectedPayment && (
              <div className="mt-8 flex justify-end">
                <Button 
                  size="lg" 
                  onClick={handleProcessPayment}
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  {loading ? 'Memproses...' : 'Lanjutkan Pembayaran'}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - Removed as requested */}
          <div className="lg:col-span-1">
            {/* Content moved to Purchase page */}
          </div>
        </div>
      </div>
    </div>
  );
};
