import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, QrCode, Clock, CheckCircle, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  // Added fields that might come from backend after payment initiation
  payment_method?: 'bank' | 'qris';
  payment_amount?: number;
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

export const PurchaseArmada: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  // Get state passed from Payment page
  const locationState = location.state as { 
    paymentMethod?: 'bank' | 'qris'; 
    paymentAmount?: number;
    paymentType?: 'full' | 'dp';
  } | null;

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) return;

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
             addon: data.addon,
             payment_method: data.payment_method || locationState?.paymentMethod || 'bank', // Fallback to state or default
             payment_amount: data.payment_amount || locationState?.paymentAmount || data.total_amount
           });
        }
      } catch (error) {
        console.error('Failed to fetch order detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, locationState]);

  useEffect(() => {
    if (!orderData?.paymentDeadline) return;

    const calculateTimeLeft = () => {
      const deadline = new Date(orderData.paymentDeadline).getTime();
      const now = new Date().getTime();
      const difference = deadline - now;

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return '00:00:00';
      }
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [orderData?.paymentDeadline]);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(bankTransferData.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTransferCode = () => {
    navigator.clipboard.writeText(bankTransferData.transferCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentComplete = () => {
    alert('Pembayaran berhasil! Tim kami akan memverifikasi pembayaran Anda.');
    navigate('/');
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

  const currentPaymentAmount = orderData.payment_amount || orderData.rawTotalAmount;
  const selectedPayment = orderData.payment_method || 'bank';

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
              Selesaikan Pembayaran
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Payment Section */}
          <div className="lg:col-span-2">
            
            {/* Payment Instructions */}
            {selectedPayment === 'bank' ? (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Instruksi Transfer Bank
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Bank Details */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Detail Rekening
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Bank</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {bankTransferData.bankName}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-300">Nomor Rekening</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white font-mono">
                              {bankTransferData.accountNumber}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCopyAccount}
                              className="h-8 w-8 p-0"
                            >
                              {copied ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Atas Nama</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {bankTransferData.accountName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Transfer Amount */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Jumlah Transfer
                      </h3>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(currentPaymentAmount)}
                      </div>
                    </div>

                    {/* Transfer Code */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Kode Transfer
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-mono text-yellow-800 dark:text-yellow-200">
                          {bankTransferData.transferCode}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyTransferCode}
                          className="h-8 w-8 p-0"
                        >
                          {copied ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                        *Wajib mencantumkan kode transfer ini pada keterangan transfer
                      </p>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Cara Transfer:
                      </h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>Buka aplikasi mobile banking atau ATM</li>
                        <li>Pilih menu transfer ke rekening lain</li>
                        <li>Masukkan nomor rekening BCA: <span className="font-mono font-semibold">{bankTransferData.accountNumber}</span></li>
                        <li>Masukkan jumlah transfer: <span className="font-semibold">{formatCurrency(currentPaymentAmount)}</span></li>
                        <li>Masukkan kode transfer pada keterangan: <span className="font-mono font-semibold">{bankTransferData.transferCode}</span></li>
                        <li>Konfirmasi dan selesaikan transfer</li>
                        <li>Simpan bukti transfer untuk konfirmasi</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Instruksi Pembayaran QRIS
                  </h2>
                  
                  <div className="space-y-6">
                    {/* QR Code */}
                    <div className="text-center">
                      <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
                        <img
                          src={qrisData.qrCode}
                          alt="QR Code Payment"
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Scan QR Code dengan aplikasi mobile banking atau e-wallet
                      </p>
                    </div>

                    {/* Payment Amount */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Jumlah Pembayaran
                      </h3>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(currentPaymentAmount)}
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                        Merchant: {qrisData.merchantName}
                      </p>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Cara Pembayaran:
                      </h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>Buka aplikasi mobile banking atau e-wallet</li>
                        <li>Pilih menu scan QR Code</li>
                        <li>Scan QR Code yang ditampilkan</li>
                        <li>Periksa detail pembayaran (jumlah dan merchant)</li>
                        <li>Konfirmasi dan selesaikan pembayaran</li>
                        <li>Simpan bukti pembayaran untuk konfirmasi</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Confirmation */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Konfirmasi Pembayaran
                </h2>
                
                <div className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Setelah melakukan pembayaran, silakan upload bukti pembayaran untuk mempercepat proses verifikasi.
                  </p>
                  
                  <div className="flex space-x-4">
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Upload Bukti Pembayaran
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handlePaymentComplete}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Konfirmasi Pembayaran
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {/* Order Details */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Rincian Pesanan
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{orderData.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {orderData.participants} Penumpang
                      </p>
                      {orderData.pickup && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                              <p><span className="font-medium">Jemput:</span> {formatDate(orderData.pickup.start_date)}</p>
                              <p><span className="font-medium">Kembali:</span> {formatDate(orderData.pickup.end_date)}</p>
                          </div>
                      )}
                    </div>

                    {orderData.addon && orderData.addon.length > 0 && (
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Tambahan:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                          {orderData.addon.map((addon, idx) => (
                            <li key={idx}>
                              {addon.addon_name} - {formatCurrency(addon.addon_price)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">Total Tagihan</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {orderData.totalPrice}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Deadline */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Clock className="h-5 w-5 text-orange-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Batas Waktu Pembayaran
                    </h3>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2 font-mono">
                      {timeLeft || '00:00:00'}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Sampai {orderData ? formatDate(orderData.paymentDeadline) : '-'}
                    </p>
                  </div>
                  
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      ⚠️ Pesanan akan otomatis dibatalkan jika pembayaran tidak dilakukan dalam batas waktu yang ditentukan.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Status */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Status Pembayaran
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Pesanan</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Dikonfirmasi
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Pembayaran</span>
                      <Badge variant="outline" className="border-orange-300 text-orange-600">
                        Menunggu Pembayaran
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Butuh Bantuan?
                  </h3>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Jika mengalami kesulitan dalam proses pembayaran, hubungi customer service kami.
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-300 w-16">WhatsApp:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          +62 812-3456-7890
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-300 w-16">Email:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          support@travego.com
                        </span>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                      Hubungi Customer Service
                    </Button>
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
