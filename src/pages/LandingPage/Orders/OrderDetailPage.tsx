import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Home,
  Calendar, 
  Clock, 
  Car, 
  CheckCircle, 
  ChevronDown, 
  FileText, 
  CalendarDays, 
  Copy, 
  ArrowRight, 
  Download, 
  Headset, 
  MessageCircle,
  Info,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { http, API_BASE_URL } from '@/lib/http';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Swal from '@/lib/swal';

interface OrderDetailData {
  order_id: string;
  price_id: string;
  fleet_name: string;
  price: number;
  total_amount: number;
  quantity: number;
  order_date: string;
  duration: number;
  duration_uom: string;
  status: number;
  payment_status: number;
  token?: string;
  pickup: { 
    pickup_location: string; 
    pickup_city: string;
    city_label?: string;
    start_date: string;
    end_date: string;
  };
  destination: { city: string; location: string; daynum?: number }[];
  itinerary?: { day: number; destination: string; city_label?: string; city_id?: string }[];
  addon: { addon_name: string; addon_price: number }[];
  customer?: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
  };
  additional_request?: string;
}

export const OrderDetailPage: React.FC = () => {
  const { type, id } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id || type !== 'armada') return;
      try {
        const response = await http.get<any>(`/api/order/fleet/detail/${id}`);
        if (response.data.status === 'success') {
          setOrderData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch order detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id, type]);

  const formatDate = (dateString: string, withTime: boolean = false) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {})
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const handleCopyOrderId = () => {
    if (orderData?.order_id) {
      navigator.clipboard.writeText(orderData.order_id);
      toast({
        title: "Tersalin",
        description: "Nomor pesanan telah disalin ke clipboard.",
      });
    }
  };

  const handlePrintOrder = async () => {
    if (!orderData?.order_id || isPrinting) return;
    
    setIsPrinting(true);
    const resolvedId = orderData.order_id;
    const url = `${API_BASE_URL}/api/services/print-management/fleet/order`;
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const toFileUrl = (path: string) => {
      if (path.startsWith('http')) return path;
      const base = API_BASE_URL.replace(/\/$/, '');
      return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/pdf, application/octet-stream, application/json',
          'Content-Type': 'application/json',
          'api-key': import.meta.env.VITE_API_KEY || '',
        },
        body: JSON.stringify({ order_id: resolvedId }),
      });

      const contentType = (res.headers.get('content-type') ?? '').toLowerCase();
      if (!res.ok) throw new Error('PRINT_FAILED');

      if (contentType.includes('application/json')) {
        const json = (await res.json().catch(() => null)) as unknown;
        const record = (v: unknown): Record<string, unknown> =>
          v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
        const root = record(json);
        const dataNode = record(root.data);
        const urlCandidate =
          String(dataNode.url ?? dataNode.file_url ?? dataNode.fileUrl ?? dataNode.path ?? dataNode.file ?? root.url ?? root.path ?? '').trim();
        
        if (urlCandidate) {
          const finalUrl = toFileUrl(urlCandidate);
          // Wait 2 seconds after getting response
          await wait(2000);
          window.open(finalUrl, '_blank', 'noopener,noreferrer');
          setIsPrinting(false);
          return;
        }
        
        await Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Surat pesanan berhasil digenerate.' });
        setIsPrinting(false);
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Wait 2 seconds after getting response
      await wait(2000);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      
      setIsPrinting(false);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } catch (error) {
      console.error('Failed to print order:', error);
      setIsPrinting(false);
      await Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan saat mengunduh PDF.' });
    }
  };

  const getStatusBadge = () => {
    if (!orderData) return null;

    const { status, payment_status } = orderData;

    if (status === 0) {
      return (
        <div className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-xs font-bold transition-all hover:bg-red-100">
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          Pesanan Dibatalkan
        </div>
      );
    }

    if (status === 1) {
      if (payment_status === 1) {
        return (
          <div className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-full text-xs font-bold transition-all hover:bg-green-100">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            Pesanan Lunas
          </div>
        );
      }
      return (
        <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-[#295BFF] border border-blue-100 rounded-full text-xs font-bold transition-all hover:bg-blue-100">
          <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
          Menunggu Konfirmasi
        </div>
      );
    }

    if (status === 2) {
      return (
        <div className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-xs font-bold transition-all hover:bg-amber-100">
          <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
          Menunggu Konfirmasi
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center pt-24">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#295BFF] mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 pt-24 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Data Pesanan Tidak Ditemukan</h2>
        <p className="text-slate-500 max-w-sm mb-8">Maaf, kami tidak dapat menemukan data pesanan yang Anda cari. Pastikan link yang Anda gunakan sudah benar.</p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-[#295BFF] hover:bg-blue-600 rounded-2xl px-8 py-6 h-auto font-bold shadow-lg shadow-blue-500/20"
        >
          Kembali ke Beranda
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* COMPACT TOP HEADER */}
      <section className="relative pt-28 pb-10 md:pt-32 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -ml-32 -mb-32"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)} 
                className="group text-slate-500 bg-transparent hover:text-[#295BFF] hover:bg-blue-50 transition-all rounded-full h-10 w-10 p-0"
              >
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </Button>
              <div className="space-y-0.5">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Detail Pesanan</h1>
                <p className="text-slate-500 font-medium text-sm md:text-base">Berikut adalah informasi lengkap pesanan Anda.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  className="rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-[#295BFF] hover:text-[#295BFF] transition-all"
                  onClick={handlePrintOrder}
                  disabled={isPrinting}
                >
                  {isPrinting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generate dokumen pesanan ....
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Cetak Detail
                    </>
                  )}
                </Button>
              </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.9fr] gap-8 md:gap-12">
          
          {/* LEFT COLUMN */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* ORDER SUMMARY CARD */}
            <Card className="bg-white border border-slate-100 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        <FileText className="w-3 h-3 mr-1.5" />
                        Nomor Pesanan
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">#{orderData.order_id}</h3>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full bg-transparent text-slate-400 hover:text-[#295BFF] hover:bg-blue-50 transition-all"
                          onClick={handleCopyOrderId}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-2xl">
                        <Car className="w-6 h-6 text-[#295BFF]" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 leading-none mb-1.5">{orderData.fleet_name}</p>
                        <p className="text-sm text-slate-500 font-normal">{orderData.quantity} Unit • {orderData.duration} {orderData.duration_uom}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-4 w-full sm:w-auto">
                    <div className="flex flex-col sm:items-end gap-1.5">
                       <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Status</div>
                       {getStatusBadge()}
                    </div>
                    <div className="flex flex-col sm:items-end gap-1.5">
                       <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Tanggal Order</div>
                       <div className="flex items-center text-slate-700 font-semibold text-sm">
                         <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
                         {formatDate(orderData.order_date, true)}
                       </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* JADWAL PERJALANAN CARD */}
            <Card className="bg-white border border-slate-100 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <CalendarDays className="w-5 h-5 text-[#295BFF]" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Jadwal Perjalanan</h2>
                </div>

                <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 before:z-0">
                  {/* Pickup */}
                  <div className="relative z-10">
                    <div className="absolute -left-[35px] top-1.5 w-6 h-6 bg-white border-[3px] border-[#295BFF] rounded-full shadow-[0_0_10px_rgba(41,91,255,0.2)]"></div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-[#295BFF] text-[10px] font-bold uppercase tracking-widest rounded-lg">Penjemputan</span>
                        <div className="h-px flex-1 bg-slate-50"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-slate-900">{formatDate(orderData.pickup.start_date)}</p>
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-slate-900 leading-tight">{orderData.pickup.pickup_location}</p>
                              <p className="text-xs text-slate-500 font-medium">{orderData.pickup.city_label || orderData.pickup.pickup_city}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Return */}
                  <div className="relative z-10">
                    <div className="absolute -left-[35px] top-1.5 w-6 h-6 bg-white border-[3px] border-slate-200 rounded-full transition-colors hover:border-[#295BFF]"></div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-400 text-[10px] font-semibold uppercase tracking-widest rounded-lg">Kembali</span>
                        <div className="h-px flex-1 bg-slate-50"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-slate-900">{formatDate(orderData.pickup.end_date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RENCANA PERJALANAN CARD */}
            <Card className="bg-white border border-slate-100 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-[#295BFF]" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Rencana Perjalanan</h2>
                </div>

                <div className="space-y-4">
                  {orderData.itinerary && orderData.itinerary.length > 0 ? (
                    <div className="space-y-3">
                      {orderData.itinerary.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 group">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-[#295BFF] text-[10px] font-bold border border-blue-100 group-hover:bg-[#295BFF] group-hover:text-white transition-all">
                              {item.day}
                            </div>
                            {idx !== (orderData.itinerary?.length || 0) - 1 && (
                              <div className="w-0.5 h-10 bg-slate-100 my-0.5"></div>
                            )}
                          </div>
                          <div className="pt-0.5 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-[#295BFF] uppercase tracking-widest">Hari {item.day}</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-[#295BFF] transition-colors">{item.destination}</p>
                            {item.city_label && <p className="text-xs text-slate-500 font-medium">{item.city_label}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : orderData.destination && orderData.destination.length > 0 ? (
                    <div className="space-y-3">
                      {orderData.destination.map((dest, idx) => (
                        <div key={idx} className="flex items-start gap-3 group">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#295BFF] mt-2 group-hover:scale-125 transition-transform"></div>
                            {idx !== orderData.destination.length - 1 && (
                              <div className="w-px h-10 bg-slate-100 my-0.5"></div>
                            )}
                          </div>
                          <div className="space-y-0.5">
                            {dest.daynum && <span className="text-[10px] font-bold text-[#295BFF] uppercase tracking-widest">Hari {dest.daynum}</span>}
                            <p className="text-sm font-semibold text-slate-900">{dest.location}</p>
                            <p className="text-xs text-slate-500 font-medium">{dest.city}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-sm text-slate-500 font-medium italic">Tidak ada rencana perjalanan detail</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* INFORMASI TAMBAHAN CARD */}
            <Card className="bg-white border border-slate-100 rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <Info className="w-5 h-5 text-[#295BFF]" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Informasi Tambahan</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kontak Pemesan</p>
                      <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                        <p className="text-sm font-bold text-slate-900">{orderData.customer?.customer_name || 'N/A'}</p>
                        <p className="text-xs text-slate-500 font-medium">{orderData.customer?.customer_email}</p>
                        <p className="text-xs text-slate-500 font-medium">{orderData.customer?.customer_phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catatan Khusus</p>
                      <div className="p-4 bg-slate-50 rounded-2xl min-h-[80px]">
                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                          {orderData.additional_request || 'Tidak ada catatan tambahan untuk pesanan ini.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HELP SECTION */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-[32px] p-6 md:p-8 border border-blue-100 dark:border-white/5 transition-all hover:shadow-xl hover:shadow-blue-500/5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center flex-shrink-0">
                    <Headset className="h-7 w-7 text-[#295BFF]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900">Butuh bantuan?</h3>
                    <p className="text-sm text-slate-500 font-medium max-w-sm">
                      Hubungi kami jika Anda memiliki pertanyaan atau perlu bantuan mengenai pesanan ini.
                    </p>
                  </div>
                </div>
                <Button 
                  className="bg-green-400 hover:bg-green-500 text-white rounded-2xl px-6 py-6 h-auto font-semibold text-sm group transition-all hover:scale-105 active:scale-95"
                  onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
                >
                  <MessageCircle className="mr-2 h-5 w-5 text-white-400 font-medium" />
                  WhatsApp Kami
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div className="relative animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            <div className="lg:sticky lg:top-28 space-y-6">
              
              {/* PAYMENT SUMMARY CARD */}
              <Card className="bg-white border border-slate-100 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden">
                <CardContent className="p-8 md:p-10">
                  <div className="text-center space-y-2 mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Rincian Pembayaran</h2>
                    <div className="w-12 h-1 bg-[#295BFF] mx-auto rounded-full"></div>
                  </div>

                  <div className="space-y-5 mb-5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-semibold">Harga Sewa ({orderData.quantity} unit)</span>
                      <span className="text-slate-900 font-bold">{formatCurrency(orderData.price * orderData.quantity)}</span>
                    </div>
                    
                    {orderData.addon && orderData.addon.length > 0 && (
                      <div className="pt-2 border-t border-slate-50">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Tambahan (Add-on)</p>
                        <div className="space-y-3">
                          {orderData.addon.map((addon, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-slate-500 font-medium">{addon.addon_name}</span>
                              <span className="text-slate-900 font-bold">{formatCurrency(addon.addon_price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex flex-col gap-1.5 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Tagihan</span>
                        <span className="text-3xl md:text-4xl font-bold text-[#295BFF] tracking-tight">{formatCurrency(orderData.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status Info Box */}
                  {orderData.payment_status === 2 && orderData.status === 2 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4 flex items-start gap-3">
                      <Info className="h-4 w-5 text-[#295BFF] flex-shrink-0 mt-0.5" />
                      <p className="text-[#295BFF] text-xs leading-relaxed font-normal">
                        Setelah pesanan dikonfirmasi, kami akan mengirimkan email untuk melanjutkan pembayaran
                      </p>
                    </div>
                  )}

                  {/* Payment Status Info Box */}
                  {orderData.payment_status === 2 && orderData.status === 1 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4 flex items-start gap-3">
                      <Info className="h-4 w-5 text-[#295BFF] flex-shrink-0 mt-0.5" />
                      <p className="text-[#295BFF] text-xs leading-relaxed font-normal">
                        Pesanan telah dikonfirmasi. Silakan selesaikan pembayaran untuk mengamankan pesanan Anda.
                      </p>
                    </div>
                  )}

                  {/* CTA BUTTONS */}
                  <div className="space-y-4">
                    {orderData.status === 1 && [2, 4].includes(orderData.payment_status) && (
                      <Button 
                        onClick={() => navigate(`/payment/${type}/${orderData.token || id}`)}
                        className="w-full bg-gradient-to-br from-[#295BFF] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-7 rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 active:scale-[0.98] group"
                      >
                        Lanjutkan Pembayaran
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    )}

                    {orderData.status === 1 && orderData.payment_status === 1 && (
                      <Button 
                        onClick={() => navigate(`/order-review?token=${orderData.token || id}`)}
                        className="w-full bg-gradient-to-br from-[#295BFF] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-7 rounded-2xl shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 active:scale-[0.98] group"
                      >
                        Beri Ulasan
                        <MessageCircle className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/')}
                      className="w-full border-slate-200 text-slate-500 font-bold py-4 rounded-2xl transition-all hover:bg-slate-50 hover:border-slate-300 h-auto"
                    >

                      Kembali ke Beranda
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
