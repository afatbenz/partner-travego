import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, QrCode, CheckCircle, ChevronDown, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { http } from '@/lib/http';

interface OrderData {
  id: string;
  price_id: number;
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

interface PaymentMethod {
  id: number;
  bank_name: string;
  bank_account_id: string;
  account_name: string;
  account_number: string;
  icon: string;
}

export const Payment: React.FC = () => {
  const { type, id } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transferMethods, setTransferMethods] = useState<PaymentMethod[]>([]);
  const [qrisMethods, setQrisMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  
  const [paymentType, setPaymentType] = useState<'full' | 'dp'>('full');
  const [dpPercentage, setDpPercentage] = useState<number>(10);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, amount: number} | null>(null);
  const [promoError, setPromoError] = useState('');

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
             price_id: data.price_id,
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

    const fetchPaymentMethods = async () => {
      try {
        const response = await http.get<any>('/api/order/payment-method');
        let transfer: PaymentMethod[] = [];
        let qris: PaymentMethod[] = [];

        if (response.data?.data) {
          const data = response.data.data;
          if (Array.isArray(data)) {
            transfer = data; 
          } else {
            // Assume data structure matches the requirement: split into transfer and qris
            transfer = Array.isArray(data.transfer) ? data.transfer : [];
            qris = Array.isArray(data.qris) ? data.qris : [];
          }
        }
        
        setTransferMethods(transfer);
        setQrisMethods(qris);
        setPaymentMethods([...transfer, ...qris]);
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
        setTransferMethods([]);
        setQrisMethods([]);
        setPaymentMethods([]);
      }
    };

    if (type === 'armada') {
        fetchOrderDetail();
        fetchPaymentMethods();
    } else {
        setLoading(false);
    }
  }, [id, type]);

  const handleProcessPayment = async () => {
    if (!id || !selectedPayment || !orderData) return;
    
    setLoading(true);
    try {
      const payload: any = {
        token: id,
        payment_method: selectedPayment.bank_account_id,
        payment_type: paymentType === 'full' ? 1 : 2,
        price_id: orderData.price_id
      };

      if (paymentType === 'dp') {
        payload.payment_percentage = dpPercentage;
      }

      if (appliedPromo) {
        payload.promo_code = appliedPromo.code;
      }

      const response = await http.post('/api/order/fleet/payment', payload);

      if (response.data.status === 'success' || response.status === 200) {
        navigate(`/purchase/armada/${id}`, { 
          state: { 
            paymentMethod: selectedPayment,
            paymentData: response.data.data,
            paymentAmount: getPaymentAmount(),
            paymentType: paymentType
          } 
        });
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
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
    if (!orderData) return 0;
    
    let baseAmount = orderData.rawTotalAmount;
    if (appliedPromo) {
      baseAmount -= appliedPromo.amount;
    }
    
    if (baseAmount < 0) baseAmount = 0;

    return baseAmount;
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
                         {/* Pickup Info Moved Here */}
                         {orderData.pickup && (
                            <div className="text-sm">
                                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Info Penjemputan</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Lokasi</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-right max-w-xs">
                                            {orderData.pickup.pickup_location}, {orderData.pickup.pickup_city}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Tanggal Penjemputan</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(orderData.pickup.start_date)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Tanggal Kembali</span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(orderData.pickup.end_date)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                         )}

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

                  {/* Addon Info */}
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
                      <span className="text-gray-900 dark:text-white">Total Tagihan</span>
                      <span className="text-gray-900 dark:text-white">
                        {orderData.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Type Selection */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        Pilih Tipe Pembayaran
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div 
                                className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                    paymentType === 'full' 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                }`}
                                onClick={() => setPaymentType('full')}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Bayar Penuh</h3>
                                    {paymentType === 'full' && <CheckCircle className="h-5 w-5 text-blue-600" />}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Lunasi pembayaran sekarang
                                </p>
                            </div>

                            <div 
                                className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                    paymentType === 'dp' 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                }`}
                                onClick={() => setPaymentType('dp')}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Bayar Sebagian (DP)</h3>
                                    {paymentType === 'dp' && <CheckCircle className="h-5 w-5 text-blue-600" />}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Bayar uang muka terlebih dahulu
                                </p>
                            </div>
                        </div>

                        {paymentType === 'dp' && (
                            <div className="animate-in fade-in slide-in-from-top-2 pt-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Pilih Persentase DP
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[10, 25, 50, 75].map((percent) => (
                                        <Button
                                            key={percent}
                                            variant={dpPercentage === percent ? "default" : "outline"}
                                            onClick={() => setDpPercentage(percent)}
                                            className={dpPercentage === percent ? "bg-blue-600 hover:bg-blue-700" : ""}
                                        >
                                            {percent}%
                                        </Button>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Nominal DP ({dpPercentage}%)</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(Math.round((orderData?.rawTotalAmount || 0) * (dpPercentage / 100)))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm mt-2">
                                        <span className="text-gray-600 dark:text-gray-400">Sisa Pembayaran</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(Math.round((orderData?.rawTotalAmount || 0) * ((100 - dpPercentage) / 100)))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
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

            {/* Payment Method Selection */}
            <Card className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Pilih Metode Pembayaran
                </h2>
                
                {paymentMethods.length > 0 ? (
                  <div className="space-y-6">
                    {/* Transfer Bank Section */}
                    {transferMethods.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                          Transfer Bank
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {transferMethods.map((method) => (
                            <div
                              key={method.id}
                              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedPayment && selectedPayment.bank_name === method.bank_name
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                              }`}
                              onClick={() => setSelectedPayment(method)}
                            >
                              {selectedPayment && selectedPayment.bank_name === method.bank_name && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle className="h-5 w-5 text-blue-600 fill-white" />
                                </div>
                              )}
                              <div className="flex items-center">
                                {method.icon ? (
                                   <img src={method.icon} alt={method.bank_name} className="h-6 w-auto mr-3 object-contain" />
                                ) : (
                                   <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                                )}
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {method.bank_name}
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* QRIS Section */}
                    {qrisMethods.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                          QRIS
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {qrisMethods.map((method) => (
                            <div
                              key={method.id}
                              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedPayment && selectedPayment.bank_name === method.bank_name
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                              }`}
                              onClick={() => setSelectedPayment(method)}
                            >
                              {selectedPayment && selectedPayment.bank_name === method.bank_name && (
                                <div className="absolute top-2 right-2">
                                  <CheckCircle className="h-5 w-5 text-blue-600 fill-white" />
                                </div>
                              )}
                              <div className="flex items-center">
                                {method.icon ? (
                                   <img src={method.icon} alt={method.bank_name} className="h-6 w-auto mr-3 object-contain" />
                                ) : (
                                   <QrCode className="h-6 w-6 text-blue-600 mr-3" />
                                )}
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {method.bank_name}
                                </h3>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Metode pembayaran saat ini tidak tersedia
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Continue Payment Button */}
            <div className="mt-8 flex justify-end">
              <Button 
                size="lg" 
                onClick={handleProcessPayment}
                disabled={loading || !selectedPayment}
                className="w-full md:w-auto"
              >
                {loading ? 'Memproses...' : 'Lanjutkan Pembayaran'}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Sidebar content removed as requested or left empty */}
          </div>
        </div>
      </div>
    </div>
  );
};
