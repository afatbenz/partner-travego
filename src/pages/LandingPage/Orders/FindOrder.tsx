import React, { lazy, Suspense, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import {
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
  CreditCard,
  Check,
  PackageSearch,
  ShieldCheck,
  Radio,
  Headset,
  MessageCircle,
  ChevronRight,
  Car,
  Clock,
  Route,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { http } from '@/lib/http';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const TRACKING_STEPS = [
  'Pesanan Dibuat',
  'Menunggu Konfirmasi',
  'Pembayaran',
  'Armada Disiapkan',
  'Perjalanan Dimulai',
  'Selesai',
] as const;

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
  orderType?: 'fleet' | 'tour';
  status_label?: string;
  payment_status?: number;
  itinerary?: Array<{ day: number; destination: string; city_label?: string }>;
  package_name?: string;
}

function getTrackingStepIndex(order: OrderDetail): number {
  const now = new Date();
  const start = new Date(order.pickup.start_date);
  const end = new Date(order.pickup.end_date);

  if (now > end) return 5;
  if (now >= start) return 4;

  const payment = order.payment;
  if (!payment || payment.length === 0) {
    if (order.payment_status === 1) return 3;
    return 1;
  }

  const lastPayment = payment[payment.length - 1];
  if (lastPayment.status === 10) return 2;

  if (lastPayment.status === 1) {
    const dp = payment.find((p) => String(p.payment_type) === '2');
    if (dp && (dp.payment_remaining || 0) > 0) return 2;
    return 3;
  }

  return 2;
}

function getPaymentStatusInfo(order: OrderDetail) {
  const payment = order.payment;
  if (!payment || payment.length === 0) {
    if (order.payment_status === 1) {
      return { label: 'Lunas', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    return { label: 'Menunggu Pembayaran', className: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  const last = payment[payment.length - 1];
  if (last.status === 10) {
    return { label: 'Sedang Verifikasi', className: 'bg-orange-50 text-orange-700 border-orange-200' };
  }
  if (last.status === 1) {
    const dp = payment.find((p) => String(p.payment_type) === '2');
    if (dp && (dp.payment_remaining || 0) > 0) {
      return { label: 'DP Terbayar', className: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    return { label: 'Lunas', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  return { label: 'Diproses', className: 'bg-slate-100 text-slate-600 border-slate-200' };
}

function getTripStatusInfo(order: OrderDetail) {
  if (order.status_label) {
    const label = order.status_label;
    if (/selesai/i.test(label)) return { label, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (/berjalan|jalan/i.test(label)) return { label, className: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (/konfirm/i.test(label)) return { label, className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    return { label, className: 'bg-slate-100 text-slate-600 border-slate-200' };
  }

  const now = new Date();
  const start = new Date(order.pickup.start_date);
  const end = new Date(order.pickup.end_date);

  if (now > end) return { label: 'Selesai', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (now >= start) return { label: 'Sedang Berjalan', className: 'bg-blue-50 text-blue-700 border-blue-200' };

  const payment = order.payment;
  const paid =
    order.payment_status === 1 ||
    (payment?.length > 0 &&
      payment.some((p) => p.status === 1) &&
      !payment.some((p) => String(p.payment_type) === '2' && (p.payment_remaining || 0) > 0));

  if (paid) return { label: 'Dikonfirmasi', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  return { label: 'Diproses', className: 'bg-slate-100 text-slate-600 border-slate-200' };
}

function TrackingPreviewCard() {
  const steps = ['Dibuat', 'Konfirmasi', 'Bayar', 'Siap', 'Jalan', 'Selesai'];
  return (
    <div className="relative animate-float">
      <div className="absolute -inset-6 bg-[#295BFF]/25 rounded-full blur-[50px]" />
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl w-[280px] md:w-[320px]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/70 text-xs font-medium">Preview Tracking</span>
          <span className="px-2 py-0.5 bg-[#295BFF]/30 text-[#93B4FF] text-[10px] font-bold rounded-full border border-[#295BFF]/40">
            Aktif
          </span>
        </div>
        <div className="bg-white/95 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#295BFF]/10 rounded-xl flex items-center justify-center">
              <Car className="h-4 w-4 text-[#295BFF]" />
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280]">Order ID</p>
              <p className="text-xs font-bold text-[#111827]">FO-•••••-001</p>
            </div>
          </div>
          <div className="flex justify-between gap-1 mb-2">
            {steps.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[8px]',
                    i <= 2
                      ? 'bg-gradient-to-br from-[#295BFF] to-indigo-500 text-white shadow-md shadow-blue-500/30'
                      : i === 3
                        ? 'bg-[#295BFF] text-white ring-4 ring-[#295BFF]/20 animate-pulse'
                        : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {i <= 2 ? <Check className="h-2.5 w-2.5" /> : i === 3 ? <Radio className="h-2.5 w-2.5" /> : null}
                </div>
                <span className="text-[7px] text-[#6B7280] text-center leading-tight hidden sm:block">{s}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full w-[55%] bg-gradient-to-r from-[#295BFF] to-indigo-400 rounded-full" />
          </div>
          <p className="text-[10px] text-[#295BFF] font-semibold mt-2">Armada Disiapkan</p>
        </div>
      </div>
    </div>
  );
}

function TrackingTimeline({ currentStep }: { currentStep: number }) {
  return (
    <>
      {/* Desktop horizontal */}
      <div className="hidden lg:block">
        <div className="relative flex justify-between">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-[#E5E7EB] mx-8" />
          <div
            className="absolute top-5 left-8 h-0.5 bg-gradient-to-r from-[#295BFF] to-indigo-500 transition-all duration-500"
            style={{ width: `calc(${(currentStep / (TRACKING_STEPS.length - 1)) * 100}% - 4rem)` }}
          />
          {TRACKING_STEPS.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;
            return (
              <div key={step} className="relative z-10 flex flex-col items-center flex-1 px-1">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    isComplete && 'bg-gradient-to-br from-[#295BFF] to-indigo-500 text-white shadow-lg shadow-blue-500/25',
                    isCurrent && 'bg-[#295BFF] text-white ring-4 ring-[#295BFF]/25 animate-pulse shadow-lg shadow-blue-500/30',
                    isPending && 'bg-slate-100 text-slate-400 border border-[#E5E7EB]'
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                </div>
                <p
                  className={cn(
                    'mt-3 text-[11px] font-semibold text-center leading-tight max-w-[90px]',
                    isComplete || isCurrent ? 'text-[#111827]' : 'text-[#6B7280]'
                  )}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile vertical */}
      <div className="lg:hidden space-y-0">
        {TRACKING_STEPS.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === TRACKING_STEPS.length - 1;
          return (
            <div key={step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                    isComplete && 'bg-gradient-to-br from-[#295BFF] to-indigo-500 text-white',
                    isCurrent && 'bg-[#295BFF] text-white ring-4 ring-[#295BFF]/20 animate-pulse',
                    !isComplete && !isCurrent && 'bg-slate-100 text-slate-400'
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 min-h-[32px] my-1',
                      isComplete ? 'bg-gradient-to-b from-[#295BFF] to-indigo-400' : 'bg-[#E5E7EB]'
                    )}
                  />
                )}
              </div>
              <div className={cn('pb-6', isLast && 'pb-0')}>
                <p className={cn('text-sm font-semibold', isComplete || isCurrent ? 'text-[#111827]' : 'text-[#6B7280]')}>
                  {step}
                </p>
                {isCurrent && <p className="text-xs text-[#295BFF] mt-0.5 font-medium">Status saat ini</p>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const LazyInvoice = lazy(() =>
  import('@/components/common/Invoice').then((m) => ({ default: m.Invoice }))
);

export default function FindOrder() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [contactData, setContactData] = useState<any>(null);
  const {
    trackOrder,
    isLoading,
    error,
    searchResult,
    orderToken,
    orderType,
    isThrottled,
    resetTracking,
  } = useOrderTracking();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || isLoading) return;
    await trackOrder(orderId);
  };

  const handleOrderIdChange = (value: string) => {
    setOrderId(value);
    if (!value.trim()) resetTracking();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getWhatsAppUrl = () => {
    const wa = String(contactData?.company_whatsapp || '6281234567890').replace(/\D/g, '');
    return `https://wa.me/${wa}`;
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
        price_id: searchResult.price_id,
      };

      const response = await http.post<{ status?: string; data?: any }>('/api/order/fleet/payment', payload);

      if (response.status === 200 || response.data?.status === 'success') {
        navigate(`/purchase/armada/${orderToken}`, {
          state: {
            paymentMethod: selectedPaymentMethod,
            paymentData: response.data?.data,
            paymentAmount: 0,
            paymentType: 'remaining',
          },
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
        focusConfirm: true,
      });
      setIsProcessingPayment(false);
      setIsPaymentModalOpen(true);
    }
  };

  const hasRemainingPayment = () => {
    if (orderType !== 'fleet' || !searchResult?.payment) return false;
    const dpPayment = searchResult.payment.find((p) => String(p.payment_type) === '2');
    return dpPayment && (dpPayment.payment_remaining || 0) > 0;
  };

  const currentStep = searchResult ? getTrackingStepIndex(searchResult) : 0;
  const paymentStatus = searchResult ? getPaymentStatusInfo(searchResult) : null;
  const tripStatus = searchResult ? getTripStatusInfo(searchResult) : null;
  const serviceLabel = searchResult?.orderType === 'tour' ? 'Paket Wisata' : 'Armada';
  const serviceName = searchResult?.package_name || searchResult?.fleet_name;

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      <div className="print:hidden">
        {/* Hero */}
        <section className="relative w-full min-h-[300px] md:min-h-[360px] overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1e3a5f] to-[#295BFF]">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="absolute top-0 -left-20 w-72 h-72 bg-[#295BFF]/30 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-10 right-10 w-56 h-56 bg-indigo-400/20 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-blue-300/10 rounded-full blur-[60px]" />

          <div className="relative z-10 container mx-auto px-4 pt-24 pb-32 md:pb-40">
            <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-6">
              <div className="w-full lg:w-1/2 space-y-5 animate-in fade-in slide-in-from-left duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                  <PackageSearch className="h-4 w-4 text-[#93B4FF]" />
                  <span className="text-white/90 text-sm font-medium">Tracking Pesanan</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    Lacak Status Pesanan Anda
                  </h1>
                  <p className="text-white/70 text-base md:text-lg max-w-lg leading-relaxed">
                    Pantau status pemesanan, pembayaran, hingga perjalanan Anda secara real-time.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: Radio, text: 'Real-time Tracking' },
                    { icon: ShieldCheck, text: 'Aman & Transparan' },
                    { icon: Headset, text: 'Dukungan Tim Profesional' },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#93B4FF]" />
                      <span className="text-white/85 text-xs md:text-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex w-full lg:w-1/2 justify-center lg:justify-end animate-in fade-in zoom-in duration-700 delay-200">
                <TrackingPreviewCard />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg viewBox="0 0 1440 320" className="relative block w-full h-[50px] md:h-[80px]" preserveAspectRatio="none">
              <path
                fill="#F8FAFC"
                d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
            </svg>
          </div>
        </section>

        {/* Floating search card */}
        <section className="relative z-20 -mt-14 md:-mt-20 container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl border border-[#E5E7EB]/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0_30px_80px_rgba(0,0,0,0.1)]">
            <CardContent className="p-5 md:p-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                  <Input
                    type="text"
                    placeholder="Masukkan Order ID (contoh: FO-2621051840-CLS70 atau TO-...)"
                    value={orderId}
                    onChange={(e) => handleOrderIdChange(e.target.value)}
                    className="w-full h-14 md:h-[60px] pl-12 pr-4 rounded-2xl border-[#E5E7EB] bg-[#F8FAFC] focus-visible:ring-[#295BFF] text-base"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={
                    isLoading ||
                    !orderId.trim() ||
                    (isThrottled &&
                      !!searchResult &&
                      orderId.trim().toUpperCase() === searchResult.order_id.toUpperCase())
                  }
                  className="h-14 md:h-[60px] px-8 rounded-2xl bg-gradient-to-r from-[#295BFF] to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/35 disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Mencari...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Lacak Pesanan
                    </>
                  )}
                </Button>
              </form>
              {isThrottled && searchResult && (
                <p className="mt-4 text-xs text-[#6B7280]">
                  Data pesanan ditampilkan dari cache. Tunggu 30 detik untuk memuat ulang Order ID yang sama.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Main content */}
        <section className="container mx-auto px-4 py-10 md:py-14 max-w-5xl">
          {error && (
            <div className="mb-8 flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 animate-in fade-in duration-300">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Pesanan tidak ditemukan</p>
                <p className="text-sm text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!searchResult && !isLoading && !error && (
            <div className="animate-in fade-in duration-500">
              <Card className="rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
                <CardContent className="py-16 md:py-20 px-6 text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#295BFF]/10 to-indigo-50 rounded-3xl flex items-center justify-center mb-6">
                    <PackageSearch className="h-10 w-10 text-[#295BFF]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111827] mb-2">Belum ada pesanan ditampilkan</h3>
                  <p className="text-[#6B7280] max-w-md mx-auto leading-relaxed">
                    Masukkan nomor pesanan untuk mulai melacak status perjalanan Anda.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-[#6B7280]">
                    <span className="px-4 py-2 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB]">1. Salin Order ID dari email/WA</span>
                    <span className="px-4 py-2 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB]">2. Tempel di kolom pencarian</span>
                    <span className="px-4 py-2 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB]">3. Klik Lacak Pesanan</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {searchResult && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Order summary */}
              <Card className="rounded-3xl border border-[#E5E7EB] shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-[#295BFF]" />
                        <span className="text-sm text-[#6B7280]">Order ID</span>
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-[#111827] break-all">{searchResult.order_id}</p>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 rounded-2xl">
                          <Car className="h-5 w-5 text-[#295BFF]" />
                        </div>
                        <div>
                          <p className="font-bold text-[#111827]">{serviceName}</p>
                          <p className="text-sm text-[#6B7280]">
                            {serviceLabel} • {searchResult.rent_type_label}
                            {searchResult.duration
                              ? ` • ${searchResult.duration} ${searchResult.duration_uom}`
                              : ''}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-[#6B7280] flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Perjalanan: {formatShortDate(searchResult.pickup.start_date)} —{' '}
                        {formatShortDate(searchResult.pickup.end_date)}
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col gap-3 md:items-end">
                      {paymentStatus && (
                        <span
                          className={cn(
                            'inline-flex px-4 py-1.5 rounded-full text-xs font-semibold border',
                            paymentStatus.className
                          )}
                        >
                          {paymentStatus.label}
                        </span>
                      )}
                      {tripStatus && (
                        <span
                          className={cn(
                            'inline-flex px-4 py-1.5 rounded-full text-xs font-semibold border',
                            tripStatus.className
                          )}
                        >
                          {tripStatus.label}
                        </span>
                      )}
                      <p className="text-2xl md:text-3xl font-bold text-[#295BFF] md:text-right">
                        {formatCurrency(searchResult.total_amount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="rounded-3xl border border-[#E5E7EB] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-[#111827]">Progress Perjalanan</h2>
                    <p className="text-sm text-[#6B7280] mt-1">Ikuti setiap tahap pesanan Anda</p>
                  </div>
                  <TrackingTimeline currentStep={currentStep} />
                </CardContent>
              </Card>

              {/* Detail grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="rounded-2xl border border-[#E5E7EB] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <Calendar className="h-5 w-5 text-[#295BFF]" />
                      </div>
                      <h3 className="font-bold text-[#111827]">Jadwal Perjalanan</h3>
                    </div>
                    <p className="text-sm text-[#6B7280] mb-1">Mulai</p>
                    <p className="text-sm font-semibold text-[#111827] mb-3">{formatDate(searchResult.pickup.start_date)}</p>
                    <p className="text-sm text-[#6B7280] mb-1">Selesai</p>
                    <p className="text-sm font-semibold text-[#111827]">{formatDate(searchResult.pickup.end_date)}</p>
                    <p className="text-xs text-[#6B7280] mt-3 pt-3 border-t border-[#E5E7EB]">
                      Dipesan: {formatDate(searchResult.order_date)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-[#E5E7EB] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <MapPin className="h-5 w-5 text-[#295BFF]" />
                      </div>
                      <h3 className="font-bold text-[#111827]">Lokasi Penjemputan</h3>
                    </div>
                    <p className="text-sm font-semibold text-[#111827]">{searchResult.pickup.pickup_location}</p>
                    <p className="text-sm text-[#6B7280]">{searchResult.pickup.pickup_city}</p>
                    {(searchResult.destination?.length > 0 || searchResult.itinerary?.length) && (
                      <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                        <p className="text-xs font-bold text-[#295BFF] uppercase tracking-wider mb-2">
                          {searchResult.orderType === 'tour' ? 'Itinerary' : 'Tujuan'}
                        </p>
                        {searchResult.itinerary?.map((it, idx) => (
                          <p key={`it-${idx}`} className="text-sm text-[#6B7280] flex items-start gap-1 mb-1">
                            <Route className="h-3.5 w-3.5 text-[#295BFF] mt-0.5 flex-shrink-0" />
                            Hari {it.day}: {it.destination}
                            {it.city_label ? `, ${it.city_label}` : ''}
                          </p>
                        ))}
                        {searchResult.destination?.map((dest, idx) => (
                          <p key={idx} className="text-sm text-[#6B7280] flex items-start gap-1">
                            <Route className="h-3.5 w-3.5 text-[#295BFF] mt-0.5 flex-shrink-0" />
                            {dest.location}
                            {dest.city ? `, ${dest.city}` : ''}
                          </p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-[#E5E7EB] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <User className="h-5 w-5 text-[#295BFF]" />
                      </div>
                      <h3 className="font-bold text-[#111827]">Kontak Pemesan</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-[#111827]">{searchResult.customer.customer_name}</p>
                      <p className="flex items-center gap-2 text-[#6B7280]">
                        <Phone className="h-3.5 w-3.5" />
                        {searchResult.customer.customer_phone}
                      </p>
                      <p className="flex items-center gap-2 text-[#6B7280]">
                        <Mail className="h-3.5 w-3.5" />
                        {searchResult.customer.customer_email}
                      </p>
                      <p className="flex items-start gap-2 text-[#6B7280]">
                        <Home className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        {searchResult.customer.customer_address}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border border-[#E5E7EB] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <CreditCard className="h-5 w-5 text-[#295BFF]" />
                      </div>
                      <h3 className="font-bold text-[#111827]">Metode Pembayaran</h3>
                    </div>
                    {searchResult.payment?.length > 0 ? (
                      <div className="space-y-3">
                        {[...searchResult.payment]
                          .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())
                          .map((pay, idx) => (
                            <div key={idx} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]/60">
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-[#111827]">{pay.bank_name}</p>
                                  <p className="text-xs text-[#6B7280]">
                                    {String(pay.payment_type) === '1' ? 'Pembayaran Penuh' : 'Pembayaran DP'}
                                  </p>
                                </div>
                                <p className="text-sm font-bold text-[#295BFF]">{formatCurrency(pay.payment_amount)}</p>
                              </div>
                              {String(pay.payment_type) === '2' && (pay.payment_remaining || 0) > 0 && (
                                <p className="text-xs text-red-600 font-semibold mt-2">
                                  Sisa: {formatCurrency(pay.payment_remaining || 0)}
                                </p>
                              )}
                              {pay.status === 10 && (
                                <p className="text-xs text-orange-600 font-medium mt-2 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Menunggu verifikasi
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#6B7280]">Belum ada pembayaran tercatat.</p>
                    )}
                    <p className="text-xs text-[#6B7280] mt-3">
                      {searchResult.price} × {searchResult.quantity} unit = {formatCurrency(searchResult.price * searchResult.quantity)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Addons */}
              {searchResult.addon?.length > 0 && (
                <Card className="rounded-3xl border border-[#E5E7EB]">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-[#111827] mb-4">Fasilitas Tambahan</h3>
                    <div className="space-y-2">
                      {searchResult.addon.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50"
                        >
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4 text-[#295BFF]" />
                            <span className="text-sm font-medium text-[#111827]">{item.addon_name}</span>
                          </div>
                          <span className="text-sm font-bold text-[#295BFF]">{formatCurrency(item.addon_price)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {hasRemainingPayment() && (
                  <Button
                    onClick={handlePayRemaining}
                    className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg shadow-green-500/20 transition-all duration-300 hover:-translate-y-1"
                  >
                    <Banknote className="mr-2 h-5 w-5" />
                    Bayar Sisa Tagihan
                  </Button>
                )}
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl border-[#E5E7EB] font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-[#295BFF] hover:text-[#295BFF]"
                >
                  <Printer className="mr-2 h-5 w-5" />
                  Cetak Invoice
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Help section */}
        <section className="container mx-auto px-4 pb-16 max-w-5xl">
          <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent mb-12" />
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 md:p-10 border border-blue-100 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center flex-shrink-0">
                  <Headset className="h-8 w-8 text-[#295BFF]" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#111827]">Butuh bantuan?</h3>
                  <p className="text-[#6B7280] max-w-md">
                    Tim kami siap membantu proses pemesanan dan perjalanan Anda.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                  onClick={() => window.open(getWhatsAppUrl(), '_blank')}
                  className="h-14 px-8 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all duration-300 hover:-translate-y-1 group"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/contact')}
                  className="h-14 px-8 rounded-2xl border-[#E5E7EB] font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-[#295BFF] hover:text-[#295BFF]"
                >
                  Hubungi Kami
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Payment dialog */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
              <DialogDescription>Silakan pilih metode pembayaran untuk melunasi sisa tagihan.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {isPaymentLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-[#295BFF]" />
                </div>
              ) : paymentMethods.length > 0 ? (
                <>
                  <div className="grid gap-3 pt-2 px-2 overflow-y-auto max-h-64 sm:max-h-72">
                    {paymentMethods.map((method, index) => (
                      <div
                        key={index}
                        onClick={() => !isProcessingPayment && setSelectedPaymentMethod(method)}
                        className={cn(
                          'flex items-center p-4 border rounded-2xl cursor-pointer transition-all duration-300',
                          selectedPaymentMethod?.bank_account_id === method.bank_account_id
                            ? 'border-[#295BFF] bg-blue-50/50 ring-1 ring-[#295BFF]'
                            : 'hover:bg-slate-50 border-[#E5E7EB]',
                          isProcessingPayment && 'opacity-50 pointer-events-none'
                        )}
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
                        <div
                          className={cn(
                            'h-8 w-12 bg-slate-100 rounded mr-4 flex items-center justify-center text-slate-400',
                            (method.icon || method.bank_logo) && 'hidden'
                          )}
                        >
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-[#111827]">{method.bank_name}</div>
                          <div className="text-sm text-[#6B7280]">
                            {method.bank_account_number
                              ? `No. Rek: ${method.bank_account_number}`
                              : method.payment_type}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                    <Button
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#295BFF] to-indigo-500 hover:from-blue-600 hover:to-indigo-600 font-semibold"
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
                <div className="text-center py-8 text-[#6B7280]">Tidak ada metode pembayaran tersedia</div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <style>{`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>

      {searchResult && (
        <Suspense fallback={null}>
          <LazyInvoice order={searchResult} />
        </Suspense>
      )}
    </div>
  );
}
