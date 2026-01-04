import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, QrCode, Clock, CheckCircle, Copy, Download, Home, ShoppingBag, Upload, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { http } from '@/lib/http';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentDetail {
  bank_code: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  payment_type: number;
  payment_percentage: number;
  payment_amount: number;
  total_amount: number;
  payment_remaining: number;
  status: number;
  payment_date: string;
  unique_code: number;
}

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
  customer: {
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    customer_address: string;
  };
  payment: PaymentDetail[];
}

export const PurchaseArmada: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  
  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
             addon: data.addon || [],
             customer: data.customer,
             payment: data.payment || []
           });
        }
      } catch (error) {
        console.error('Failed to fetch order detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleUploadPaymentProof = async () => {
    if (!selectedFile || !id) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('token', id);

    try {
      const response = await http.post('/api/order/payment-confirmation/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.data.status === 'success') {
        setIsUploadModalOpen(false);
        alert('Bukti pembayaran berhasil diupload!');
        handleRemoveFile();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Gagal mengupload bukti pembayaran. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaymentComplete = async () => {
    setIsSubmitting(true);
    try {
      const response = await http.post('/api/order/payment-confirmation', {
        order_type: 'fleet',
        token: id
      });
      
      if (response.status === 200 || response.data.status === 'success') {
        setIsPaymentConfirmed(true);
      }
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      alert('Gagal mengkonfirmasi pembayaran. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
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

  const hasPayment = orderData?.payment && orderData.payment.length > 0;
  const activePayment = hasPayment 
    ? [...orderData.payment].sort((a, b) => {
        const tb = new Date(b.payment_date).getTime();
        const ta = new Date(a.payment_date).getTime();
        return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
      })[0]
    : null;
  const isDeadlinePassed = !hasPayment || (orderData ? new Date(orderData.paymentDeadline).getTime() <= new Date().getTime() : false);

  if (isPaymentConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 flex flex-col items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Terimakasih!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Pembayaran anda sedang menunggu konfirmasi. Kami akan segera memberi tahu ke email anda.
            </p>
            
            <div className="space-y-3 w-full">
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Button>
              
              <Button 
                onClick={() => navigate('/find-order')} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Lacak Pesanan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
            {activePayment && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Instruksi Pembayaran
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
                            {activePayment.bank_name}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Kode Bank</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {activePayment.bank_code}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-300">Nomor Rekening</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-white font-mono">
                              {activePayment.account_number}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(activePayment.account_number);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }}
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
                            {activePayment.account_name}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Kode Referensi</span>
                            <span className="font-medium text-gray-900 dark:text-white font-mono">
                              {activePayment.unique_code}
                            </span>
                          </div>
                          <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                            * Gunakan kode referensi sebagai berita transaksi untuk mempermudah verifikasi pembayaran
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Transfer Amount */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Jumlah Pembayaran
                      </h3>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(activePayment.payment_amount)}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Cara Pembayaran:
                      </h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>Buka aplikasi mobile banking atau ATM Anda</li>
                        <li>Pilih menu transfer ke {activePayment.bank_name}</li>
                        <li>Masukkan nomor rekening: <span className="font-mono font-semibold">{activePayment.account_number}</span> dengan kode bank <span className="font-mono font-semibold">{activePayment.bank_code}</span></li>
                        <li>Masukkan jumlah pembayaran: <span className="font-semibold">{formatCurrency(activePayment.payment_amount)}</span></li>
                        <li>Konfirmasi dan selesaikan pembayaran</li>
                        <li>Simpan bukti transfer untuk konfirmasi</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Confirmation */}
            {hasPayment && (
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
                      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Bukti Pembayaran
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Upload Bukti Pembayaran</DialogTitle>
                            <DialogDescription>
                              Upload foto bukti transfer anda disini. Format yang didukung: JPG, PNG, JPEG.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                              <Label htmlFor="picture">Bukti Transfer</Label>
                              <div 
                                className="flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors p-6"
                                onClick={() => document.getElementById('picture')?.click()}
                              >
                                <Image className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Choose an image file</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, JPEG</span>
                              </div>
                              <Input 
                                id="picture" 
                                type="file" 
                                accept="image/png, image/jpeg, image/jpg" 
                                className="hidden" 
                                onChange={handleFileSelect} 
                              />
                            </div>
                            
                            {previewUrl && (
                              <div className="relative mt-4 border rounded-lg overflow-hidden">
                                <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[300px] object-contain" />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                  onClick={handleRemoveFile}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="secondary" onClick={() => setIsUploadModalOpen(false)}>
                              Batal
                            </Button>
                            <Button 
                              type="button" 
                              onClick={handleUploadPaymentProof} 
                              disabled={!selectedFile || isUploading}
                            >
                              {isUploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                  Mengirim...
                                </>
                              ) : (
                                'Kirim Bukti Pembayaran'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={handlePaymentComplete}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {isSubmitting ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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
                        {orderData.participants} Unit
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
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          {orderData.addon.map((addon, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span>{addon.addon_name}</span>
                              <span>{formatCurrency(addon.addon_price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                       <span>Harga Unit</span>
                       <span>{orderData.price}</span>
                    </div>

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
                      {isDeadlinePassed ? '00:00:00' : (timeLeft || '00:00:00')}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {isDeadlinePassed
                        ? 'Batas Waktu Pembayaran telah habis silakan lakukan order kembali'
                        : `Sampai ${orderData ? formatDate(orderData.paymentDeadline) : '-'}`}
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
                      <Badge 
                        variant="outline" 
                        className={isDeadlinePassed ? 'border-red-300 text-red-600' : 'border-orange-300 text-orange-600'}
                      >
                        {isDeadlinePassed ? 'Pembayaran Dibatalkan' : 'Menunggu Pembayaran'}
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
