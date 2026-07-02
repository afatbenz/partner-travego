import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  Home, 
  Loader2, 
  ShieldCheck, 
  UserCheck, 
  Hash, 
  Car, 
  Calendar, 
  CreditCard,
  Info, 
  MessageCircle, 
  FileText, 
  Headset,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { http } from '@/lib/http';
import hiaceImage from '@/images/hiace_premio.png';

export const OrderSuccess: React.FC = () => {
  const { type, id } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState<any>(location.state?.orderData || null);
  const [contactData, setContactData] = useState<any>(null);
  const [loading, setLoading] = useState(!location.state?.orderData);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      const decodedId = id ? decodeURIComponent(id) : '';
      if (!decodedId) return;

      try {
        const response = await http.get<any>(`/api/order/fleet/detail/${decodedId}`);
        if (response.data.status === 'success') {
          const data = response.data.data;
          setOrderData({
            id: data.order_id,
            item: data.fleet_name,
            totalAmount: `Rp. ${data.total_amount.toLocaleString('id-ID')}`,
            date: new Date(data.order_date).toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })
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
    const fetchContent = async () => {
      try {
        const res = await http.get<{ data?: { contact?: any } }>('/api/content');
        const contact = res.data?.data?.contact;
        if (contact) setContactData(contact);
      } catch (err) {
        console.error('Failed to fetch contact content', err);
      }
    };

    fetchContent();
  }, []);

  const getWhatsAppUrl = () => {
    const wa = String(contactData?.company_whatsapp || '6281234567890').replace(/\D/g, '');
    return `https://wa.me/${wa}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* SECTION 1 — HERO SUCCESS HEADER */}
      <section className="relative w-full h-[520px] md:h-[600px] overflow-hidden bg-[#0F172A]">
        {/* Background Image & Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2069" 
            alt="Bus Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-transparent"></div>
          
          {/* Blur Blobs */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#295BFF]/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-blue-400/10 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col md:flex-row items-center pt-20 md:pt-0">
          {/* Hero Content (Left) */}
          <div className="w-full md:w-1/2 text-left space-y-6 md:pr-12 animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
              <div className="w-8 h-8 bg-[#295BFF] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(41,91,255,0.5)]">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-white text-sm font-medium">Order Confirmed</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Pesanan Berhasil <br />
                <span className="text-[#295BFF]">Dibuat!</span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-lg leading-relaxed">
                Terima kasih telah mempercayakan perjalanan Anda bersama Calista Prima Wisata. Kami siap melayani Anda.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <ShieldCheck className="h-4 w-4 text-[#295BFF]" />
                <span className="text-white/90 text-sm">Aman & Terpercaya</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <UserCheck className="h-4 w-4 text-[#295BFF]" />
                <span className="text-white/90 text-sm">Layanan Profesional</span>
              </div>
            </div>
          </div>

          {/* Hero Image (Right) */}
          <div className="hidden md:flex w-1/2 justify-center items-center relative animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="relative group">
              <div className="absolute -inset-10 bg-[#295BFF]/20 rounded-full blur-[60px] group-hover:bg-[#295BFF]/30 transition-all duration-500"></div>
              <img 
                src={hiaceImage} 
                alt="Hiace Premio" 
                className="relative z-10 w-[550px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float"
              />
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg 
            viewBox="0 0 1440 320" 
            className="relative block w-full h-[60px] md:h-[100px]" 
            preserveAspectRatio="none"
          >
            <path 
              fill="#F8FAFC" 
              fillOpacity="1" 
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* SECTION 2 — RINGKASAN PESANAN */}
      <section className="relative -mt-16 md:-mt-24 z-20 container mx-auto px-4 pb-20">
        <Card className="max-w-4xl mx-auto bg-white border-0 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
          <CardContent className="p-6 md:p-12">
            <div className="text-center space-y-2 mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-[#111827]">Ringkasan Pesanan Anda</h2>
              <div className="w-16 h-1 bg-[#295BFF] mx-auto rounded-full"></div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-[#295BFF] animate-spin mb-4" />
                <p className="text-[#6B7280] font-medium">Menyusun ringkasan pesanan...</p>
              </div>
            ) : (
              <div className="space-y-0 mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between py-4 md:py-6 border-b border-gray-100 hover:bg-slate-50/50 px-3 md:px-4 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3 md:space-x-4 mb-2 md:mb-0">
                    <div className="p-2 md:p-3 bg-blue-50 rounded-xl md:rounded-2xl">
                      <Hash className="h-4 w-4 md:h-5 md:w-5 text-[#295BFF]" />
                    </div>
                    <span className="text-[#6B7280] text-sm md:text-base font-medium">Order ID</span>
                  </div>
                  <span className="text-[#111827] font-bold text-base md:text-lg ml-11 md:ml-0">#{orderData?.id || id}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between py-4 md:py-6 border-b border-gray-100 hover:bg-slate-50/50 px-3 md:px-4 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3 md:space-x-4 mb-2 md:mb-0">
                    <div className="p-2 md:p-3 bg-blue-50 rounded-xl md:rounded-2xl">
                      <Car className="h-4 w-4 md:h-5 md:w-5 text-[#295BFF]" />
                    </div>
                    <span className="text-[#6B7280] text-sm md:text-base font-medium">Layanan / Armada</span>
                  </div>
                  <span className="text-[#111827] font-bold text-base md:text-lg md:text-right ml-11 md:ml-0">{orderData?.item || 'N/A'}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between py-4 md:py-6 hover:bg-slate-50/50 px-3 md:px-4 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3 md:space-x-4 mb-2 md:mb-0">
                    <div className="p-2 md:p-3 bg-blue-50 rounded-xl md:rounded-2xl">
                      <Calendar className="h-4 w-4 md:h-5 md:w-5 text-[#295BFF]" />
                    </div>
                    <span className="text-[#6B7280] text-sm md:text-base font-medium">Tanggal Order</span>
                  </div>
                  <span className="text-[#111827] font-bold text-base md:text-lg ml-11 md:ml-0">{orderData?.date || '-'}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between py-4 md:py-6 hover:bg-slate-50/50 px-3 md:px-4 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3 md:space-x-4 mb-2 md:mb-0">
                    <div className="p-2 md:p-3 bg-blue-50 rounded-xl md:rounded-2xl">
                      <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-[#295BFF]" />
                    </div>
                    <span className="text-[#6B7280] text-sm md:text-base font-medium">Total Tagihan</span>
                  </div>
                  <span className="text-[#111827] font-bold text-base md:text-lg ml-11 md:ml-0">{orderData?.totalAmount || '-'}</span>
                </div>
              </div>
            )}

            {/* Info Alert Box */}
            <div className="bg-[#295BFF]/5 border border-[#295BFF]/10 rounded-2xl p-5 mb-10 flex items-start space-x-4">
              <div className="p-2 bg-[#295BFF]/10 rounded-full mt-0.5">
                <Info className="h-5 w-5 text-[#295BFF]" />
              </div>
              <p className="text-[#295BFF] text-xs md:text-base leading-relaxed font-normal">
                Pesanan Anda sedang kami proses. Tim kami akan segera menghubungi Anda melalui WhatsApp / Email untuk langkah selanjutnya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => navigate(`/order/detail/${type}/${id}`)}
                className="w-full bg-gradient-to-r from-[#295BFF] to-blue-500 hover:to-blue-600 text-white rounded-2xl py-7 font-semibold text-lg shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
              >
                Lihat Detail Pesanan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full bg-white border-[#E5E7EB] text-[#6B7280] hover:text-[#295BFF] hover:border-[#295BFF] rounded-2xl py-7 font-semibold text-lg transition-all hover:-translate-y-1 active:scale-95"
              >
                <Home className="mr-2 h-5 w-5" />
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* SECTION 3 — LANGKAH SELANJUTNYA */}
      <section className="container mx-auto px-4 py-10 md:py-20 bg-white">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#111827]">Langkah Selanjutnya</h2>
          <p className="text-[#6B7280] max-w-2xl mx-auto">Setelah Anda berhasil melakukan pemesanan, berikut adalah proses yang akan berjalan selanjutnya.</p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-50 via-[#295BFF]/20 to-blue-50 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Step 1 */}
            <div className="group space-y-6 text-center">
              <div className="relative mx-auto w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-[#295BFF]">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-bold border-4 border-white">1</div>
                <MessageCircle className="h-10 w-10 text-[#295BFF] transition-colors group-hover:text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#111827]">Konfirmasi Tim</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed px-4">
                  Tim kami akan menghubungi Anda untuk konfirmasi & detail perjalanan dalam waktu singkat.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group space-y-6 text-center">
              <div className="relative mx-auto w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-[#295BFF]">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-bold border-4 border-white">2</div>
                <FileText className="h-10 w-10 text-[#295BFF] transition-colors group-hover:text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#111827]">Kesepakatan & Pembayaran</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed px-4">
                  Anda akan menerima penawaran harga resmi dan detail layanan lengkap untuk disetujui.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group space-y-6 text-center">
              <div className="relative mx-auto w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-[#295BFF]">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-bold border-4 border-white">3</div>
                <ShieldCheck className="h-10 w-10 text-[#295BFF] transition-colors group-hover:text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#111827]">Perjalanan Dimulai</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed px-4">
                  Setelah semua disepakati, kami siap memberikan pengalaman perjalanan terbaik untuk Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — BUTUH BANTUAN */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-[40px] p-8 md:p-12 border border-blue-100 dark:border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center flex-shrink-0">
                <Headset className="h-8 w-8 text-[#295BFF]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#111827]">Butuh bantuan?</h3>
                <p className="text-[#6B7280] max-w-sm">
                  Hubungi kami jika Anda memiliki pertanyaan atau perlu bantuan lebih lanjut mengenai pesanan Anda.
                </p>
              </div>
            </div>
            
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-8 py-7 font-semibold text-lg group transition-all hover:scale-105"
              onClick={() => window.open(getWhatsAppUrl(), '_blank')}
            >
              <MessageCircle className="mr-2 h-6 w-6 text-white-400" />
              Hubungi CS via WhatsApp
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Style for custom animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
