import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  QrCode, 
  CheckCircle, 
  ChevronDown, 
  Tag, 
  ShieldCheck, 
  Info, 
  Lock, 
  ArrowRight, 
  FileText, 
  Headset, 
  MessageCircle,
  Ticket,
  Calendar,
  Hash,
  Bus,
  Check,
  ChevronRight,
  Shield,
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { http, API_BASE_URL } from '@/lib/http';
import { cn } from '@/lib/utils';
import Swal from '@/lib/swal';
import { usePayment } from '@/hooks/usePayment';
import { PAYMENT_TYPE, PAYMENT_STATUS } from '@/constants/payment';

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
    city_label?: string;
    start_date: string;
    end_date: string;
  };
  destination: { city: string; location: string }[];
  addon: { addon_name: string; addon_price: number }[];
  status: number;
  payment_status: number;
  remaining_amount?: number;
  payment_summary?: {
    payment_amount: number;
    payment_remaining: number;
    total_addon: number;
  };
}

interface PaymentMethod {
  id: number;
  bank_name: string;
  bank_account_id: string;
  account_name: string;
  account_number: string;
  icon: string;
}

/**
 * Component to display payment status after transaction
 */
const PaymentStatus: React.FC<{ status: string; orderId: string }> = ({ status, orderId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const content = {
    [PAYMENT_STATUS.SUCCESS]: {
      title: "Pembayaran Berhasil!",
      message: "Pembayaran berhasil! Pesanan Anda sedang diproses.",
      icon: <CheckCircle className="w-16 h-16 text-green-500" />,
      color: "text-green-600"
    },
    [PAYMENT_STATUS.PENDING]: {
      title: "Menunggu Pembayaran",
      message: "Menunggu pembayaran. Segera selesaikan sebelum batas waktu.",
      icon: <Info className="w-16 h-16 text-blue-500" />,
      color: "text-blue-600"
    },
    [PAYMENT_STATUS.ERROR]: {
      title: "Pembayaran Gagal",
      message: "Pembayaran gagal. Silakan coba lagi.",
      icon: <AlertCircle className="w-16 h-16 text-red-500" />,
      color: "text-red-600"
    }
  }[status] || {
    title: "Status Tidak Diketahui",
    message: "Terjadi kesalahan saat memproses status pembayaran.",
    icon: <AlertCircle className="w-16 h-16 text-slate-400" />,
    color: "text-slate-600"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm text-center space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="p-4 bg-slate-50 rounded-full">
        {content.icon}
      </div>
      <div className="space-y-2">
        <h2 className={`text-2xl font-bold ${content.color}`}>{content.title}</h2>
        <p className="text-slate-600 font-medium max-w-md">{content.message}</p>
      </div>
      <div className="p-4 bg-slate-50 rounded-2xl w-full max-w-sm">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ID Pesanan</p>
        <p className="text-lg font-bold text-slate-900">#{orderId}</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Button 
          onClick={() => navigate(`/order/detail/armada/${id}`)} 
          className="bg-[#295BFF] hover:bg-blue-800 text-white font-semibold px-8 py-4 h-auto rounded-2xl shadow-lg shadow-blue-500/20"
        >
          <FileText className="w-5 h-5 mr-2" />
          Lihat Pesanan Saya
        </Button>
        {status === PAYMENT_STATUS.SUCCESS && (
          <Button 
            onClick={() => navigate(`/order-review?token=${id}`)} 
            className="bg-white border-green-400 hover:border-green-800 border-2 hover:bg-transparant text-green-600 font-semibold px-8 py-4 h-auto rounded-2xl shadow-lg shadow-green-500/20"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Beri Ulasan
          </Button>
        )}
      </div>
    </div>
  );
};

interface PaymentFormProps {
  orderId: string;
  priceId: number;
  paymentType: number;
  amount?: number;
  onPaymentProcessed: (status: string | null, error: string | null) => void;
  isLoading: boolean;
}

/**
 * Component to handle payment submission
 */
const PaymentForm: React.FC<PaymentFormProps> = ({ 
  orderId, 
  priceId, 
  paymentType, 
  amount,
  onPaymentProcessed,
  isLoading: externalLoading
}) => {
  const { loading, error, paymentStatus, submitPayment } = usePayment();

  // Memantau perubahan state dari hook dan meneruskannya ke parent
  React.useEffect(() => {
    if (paymentStatus || error) {
      onPaymentProcessed(paymentStatus, error);
    }
  }, [paymentStatus, error, onPaymentProcessed]);

  const handleBayarSekarang = async () => {
    // Validasi tambahan sebelum memanggil hook
    if ((paymentType === 1001 || paymentType === 1002) && (!amount || amount <= 0)) {
      Swal.fire({
        icon: 'warning',
        title: 'Nominal Tidak Valid',
        text: 'Silakan masukkan nominal pembayaran yang valid.'
      });
      return;
    }

    const payload: any = {
      order_id: orderId,
      payment_type: paymentType,
      order_type: 1, // Tipe order armada/default
    };

    if (paymentType === 1001 || paymentType === 1002 || paymentType === 1003) {
      payload.payment_amount = amount;
    }

    await submitPayment(payload);
  };

  return (
    <Button 
      size="lg" 
      onClick={handleBayarSekarang}
      disabled={loading || externalLoading}
      className="w-full bg-gradient-to-r from-[#295BFF] to-[#4F7FFF] hover:shadow-lg hover:shadow-blue-500/30 text-white font-bold h-14 rounded-2xl transition-all hover:-translate-y-0.5 active:translate-y-0 group"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Memproses...
        </>
      ) : (
        <>
          <Lock className="w-4 h-4 mr-2" />
          Bayar Sekarang
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </Button>
  );
};

export const Payment: React.FC = () => {
  const { type, id } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transferMethods, setTransferMethods] = useState<PaymentMethod[]>([]);
  const [qrisMethods, setQrisMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  
  const [paymentType, setPaymentType] = useState<'full' | 'dp' | 'repayment' | 'installment'>('full');
  const [isDownloadingDetail, setIsDownloadingDetail] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [dpPercentage, setDpPercentage] = useState<number>(10);
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [customAmountDisplay, setCustomAmountDisplay] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, amount: number} | null>(null);
  const [promoError, setPromoError] = useState('');

  // State baru untuk Midtrans
  const [midtransStatus, setMidtransStatus] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id || type !== 'armada') return;

      try {
        const response = await http.get<any>(`/api/order/fleet/detail/${id}`);
        if (response.data.status === 'success') {
          const data = response.data.data;
          
          const formatCurrency = (amount: number) => {
            return `Rp ${amount.toLocaleString('id-ID')}`;
          };

          const orderDate = new Date(data.order_date);
          const deadlineDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000);

          if (data.payment_status === 4) {
            setPaymentType('repayment');
          }

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
            addon: data.addon,
            status: data.status,
            payment_status: data.payment_status,
            remaining_amount: data.remaining_amount,
            payment_summary: data.payment_summary,
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

  /**
   * Handle result from PaymentForm component
   */
  const handlePaymentProcessed = (status: string | null, error: string | null) => {
    if (status) {
      setMidtransStatus(status);
    }
    if (error) {
      setPaymentError(error);
      // Tampilkan toast atau alert jika error dari onClose atau API
      Swal.fire({
        icon: 'info',
        title: 'Pembayaran',
        text: error
      });
    }
  };

  const formatDate = (dateString: string, withTime: boolean = false) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {})
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const getPaymentAmount = () => {
    if (!orderData) return 0;

    const paymentRemaining =
      orderData.payment_summary?.payment_remaining ?? orderData.remaining_amount ?? 0;

    let baseAmount = 0;
    if (paymentType === 'dp') {
      baseAmount = Math.round(orderData.rawTotalAmount * (dpPercentage / 100));
    } else if (paymentType === 'installment') {
      baseAmount = customAmount;
    } else if (paymentType === 'repayment') {
      baseAmount = paymentRemaining;
    } else {
      baseAmount = orderData.payment_summary?.payment_remaining ?? orderData.rawTotalAmount;
    }

    if (appliedPromo && paymentType === 'full') {
      baseAmount -= appliedPromo.amount;
    }

    return Math.max(0, Math.floor(baseAmount));
  };

  const previousPaymentTypeRef = React.useRef<typeof paymentType>(paymentType);

  useEffect(() => {
    if (!orderData) return;
    const previous = previousPaymentTypeRef.current;
    previousPaymentTypeRef.current = paymentType;

    if (paymentType !== 'installment') return;
    if (previous === 'installment') return;
    if (customAmount > 0 || customAmountDisplay) return;

    const max =
      orderData.payment_summary?.payment_remaining ?? orderData.remaining_amount ?? 0;
    const defaultAmount = Math.min(max, Math.round(max * 0.1));

    if (defaultAmount <= 0) return;

    setCustomAmount(defaultAmount);
    setCustomAmountDisplay(defaultAmount.toLocaleString('id-ID'));
  }, [
    orderData,
    paymentType,
    customAmount,
    customAmountDisplay,
  ]);

  const handleApplyPromo = () => {
    if (!promoCode) return;
    setPromoError('');
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

  const handleDownloadDetailPDF = async () => {
    if (!orderData?.id || isDownloadingDetail) return;

    setIsDownloadingDetail(true);
    const resolvedId = orderData.id;
    const base = API_BASE_URL.replace(/\/$/, '');
    const url = `${base}/api/services/print-management/fleet/order`;
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const toFileUrl = (path: string) => {
      if (path.startsWith('http')) return path;
      const baseClean = API_BASE_URL.replace(/\/$/, '');
      return `${baseClean}${path.startsWith('/') ? '' : '/'}${path}`;
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
          // Wait 2 seconds after response
          await wait(2000);
          window.open(finalUrl, '_blank', 'noopener,noreferrer');
          setIsDownloadingDetail(false);
          return;
        }
        
        await Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Surat pesanan berhasil digenerate.' });
        setIsDownloadingDetail(false);
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Wait 2 seconds after response
      await wait(2000);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      
      setIsDownloadingDetail(false);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      setIsDownloadingDetail(false);
      await Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan saat mengunduh PDF.' });
    }
  };

  const handleDownloadInvoice = async () => {
    if (!orderData?.id || isDownloadingInvoice) return;

    setIsDownloadingInvoice(true);
    const resolvedId = orderData.id;
    // Assuming same API or similar for Invoice, but for now using the same logic as requested
    const base = API_BASE_URL.replace(/\/$/, '');
    const url = `${base}/api/services/print-management/fleet/order`; 
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const toFileUrl = (path: string) => {
      if (path.startsWith('http')) return path;
      const baseClean = API_BASE_URL.replace(/\/$/, '');
      return `${baseClean}${path.startsWith('/') ? '' : '/'}${path}`;
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
          await wait(2000);
          window.open(finalUrl, '_blank', 'noopener,noreferrer');
          setIsDownloadingInvoice(false);
          return;
        }
        
        await Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Invoice berhasil digenerate.' });
        setIsDownloadingInvoice(false);
        return;
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      await wait(2000);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setIsDownloadingInvoice(false);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
    } catch (error) {
      console.error('Failed to download Invoice:', error);
      setIsDownloadingInvoice(false);
      await Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan saat mengunduh Invoice.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#295BFF] mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Menyiapkan pembayaran...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
     return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Data Pesanan Tidak Ditemukan</h2>
            <Button onClick={() => navigate('/')} className="bg-[#295BFF] hover:bg-blue-600 rounded-2xl px-8 py-6 h-auto font-bold shadow-lg shadow-blue-500/20">Kembali ke Beranda</Button>
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 overflow-x-hidden">
      {/* TOP HEADER SECTION */}
      <section className="relative pt-24 pb-8 overflow-hidden bg-gradient-to-b from-white to-blue-50/30">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-indigo-100/40 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col space-y-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="group bg-transparent w-fit -ml-2 text-slate-500 hover:text-[#295BFF] hover:bg-white/80 transition-all rounded-full pr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Kembali ke Detail Pesanan</span>
            </Button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">Selesaikan Pembayaran</h1>
                <p className="text-[#6B7280] font-medium text-sm md:text-base">Pastikan detail pesanan dan metode pembayaran sudah benar.</p>
              </div>

              {/* Mini step indicator */}
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl border border-white/50 shadow-sm self-start md:self-auto">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50/50">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white font-bold">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detail Pesanan</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-200" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#295BFF]/5 border border-[#295BFF]/10">
                  <div className="w-5 h-5 rounded-full bg-[#295BFF] flex items-center justify-center text-[10px] text-white font-bold shadow-lg shadow-blue-500/30">2</div>
                  <span className="text-[10px] font-bold text-[#295BFF] uppercase tracking-wider">Pembayaran</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-200" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-bold">3</div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Selesai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-8">
        {midtransStatus ? (
          <div className="max-w-2xl mx-auto py-12">
            <PaymentStatus status={midtransStatus} orderId={orderData.id} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
            
            {/* LEFT COLUMN */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {orderData.status === 1 && orderData.payment_status === 1 ? (
                <section className="p-10 bg-white border border-slate-100 rounded-3xl shadow-sm text-center space-y-6 animate-in fade-in zoom-in duration-500">
                  <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900">Terimakasih</h2>
                    <p className="text-slate-600 font-medium">
                      Pembayaran untuk order <span className="text-[#295BFF] font-bold">#{orderData.id}</span> telah lunas. Terimakasih
                    </p>
                  </div>
                  <div className="pt-4 flex flex-col gap-3 max-w-sm mx-auto">
                    <Button 
                      onClick={() => navigate(`/order/detail/armada/${id}`)} 
                      className="bg-[#295BFF] hover:bg-blue-600 text-white font-bold px-8 py-4 h-auto rounded-2xl shadow-lg shadow-blue-500/20 w-full"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Lihat Pesanan Saya
                    </Button>
                    <Button 
                      onClick={() => navigate(`/order-review?token=${id}`)} 
                      className="bg-transparent border-green-500 hover:bg-gray-100/50 text-green-500 font-bold px-8 py-4 h-auto rounded-2xl shadow-lg shadow-green-500/20 w-full"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Beri Ulasan
                    </Button>
                  </div>
                </section>
              ) : orderData.status === 1 && (
                <>
                  {/* SECTION — PAYMENT TYPE */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#295BFF]/10 rounded-xl">
                        <CreditCard className="w-5 h-5 text-[#295BFF]" />
                      </div>
                      <h2 className="text-xl font-bold text-[#111827]">Pilih Tipe Pembayaran</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Opsi Bayar Penuh & DP hanya tampil jika status = 1 dan payment_status = 2 dan tidak ada sisa pembayaran yang sedang dicicil (asumsi logic) */}
                      {orderData.status === 1 && orderData.payment_status === 2 && (
                        <>
                          <div 
                            onClick={() => setPaymentType('full')}
                            className={cn(
                              "relative p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 cursor-pointer",
                              paymentType === 'full' 
                                ? "border-[#295BFF] bg-blue-50/50 shadow-[0_0_20px_rgba(41,91,255,0.15)] ring-1 ring-[#295BFF]" 
                                : "border-[#E5E7EB] bg-white hover:border-[#295BFF]/50 hover:shadow-md"
                            )}
                          >
                            {paymentType === 'full' && (
                              <div className="absolute top-4 right-4 w-6 h-6 bg-[#295BFF] rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-lg shadow-blue-500/30">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                              paymentType === 'full' ? "bg-[#295BFF] text-white shadow-lg shadow-blue-500/20" : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#295BFF]"
                            )}>
                              <CheckCircle className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-[#111827] mb-1">Bayar Penuh</h3>
                            <p className="text-sm text-[#6B7280] font-medium">Lunasi pembayaran sekarang</p>
                          </div>

                          <div 
                            onClick={() => setPaymentType('dp')}
                            className={cn(
                              "relative p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 cursor-pointer",
                              paymentType === 'dp' 
                                ? "border-[#295BFF] bg-blue-50/50 shadow-[0_0_20px_rgba(41,91,255,0.15)] ring-1 ring-[#295BFF]" 
                                : "border-[#E5E7EB] bg-white hover:border-[#295BFF]/50 hover:shadow-md"
                            )}
                          >
                            {paymentType === 'dp' && (
                              <div className="absolute top-4 right-4 w-6 h-6 bg-[#295BFF] rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-lg shadow-blue-500/30">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                              paymentType === 'dp' ? "bg-[#295BFF] text-white shadow-lg shadow-blue-500/20" : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#295BFF]"
                            )}>
                              <CreditCard className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-[#111827] mb-1">Bayar DP</h3>
                            <p className="text-sm text-[#6B7280] font-medium">Bayar uang muka terlebih dahulu</p>
                          </div>
                        </>
                      )}

                      {/* Opsi Pelunasan & Cicilan */}
                      {orderData.status === 1 && orderData.payment_status === 4 && (
                        <>
                          <div 
                            onClick={() => setPaymentType('repayment')}
                            className={cn(
                              "relative p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 cursor-pointer",
                              paymentType === 'repayment' 
                                ? "border-[#295BFF] bg-blue-50/50 shadow-[0_0_20px_rgba(41,91,255,0.15)] ring-1 ring-[#295BFF]" 
                                : "border-[#E5E7EB] bg-white hover:border-[#295BFF]/50 hover:shadow-md"
                            )}
                          >
                            {paymentType === 'repayment' && (
                              <div className="absolute top-4 right-4 w-6 h-6 bg-[#295BFF] rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-lg shadow-blue-500/30">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                              paymentType === 'repayment' ? "bg-[#295BFF] text-white shadow-lg shadow-blue-500/20" : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#295BFF]"
                            )}>
                              <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-[#111827] mb-1">Pelunasan</h3>
                            <p className="text-sm text-[#6B7280] font-medium">Lunasi sisa pembayaran</p>
                          </div>

                          <div 
                            onClick={() => setPaymentType('installment')}
                            className={cn(
                              "relative p-6 rounded-2xl border transition-all duration-300 group hover:-translate-y-1 cursor-pointer",
                              paymentType === 'installment' 
                                ? "border-[#295BFF] bg-blue-50/50 shadow-[0_0_20px_rgba(41,91,255,0.15)] ring-1 ring-[#295BFF]" 
                                : "border-[#E5E7EB] bg-white hover:border-[#295BFF]/50 hover:shadow-md"
                            )}
                          >
                            {paymentType === 'installment' && (
                              <div className="absolute top-4 right-4 w-6 h-6 bg-[#295BFF] rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-lg shadow-blue-500/30">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300",
                              paymentType === 'installment' ? "bg-[#295BFF] text-white shadow-lg shadow-blue-500/20" : "bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-[#295BFF]"
                            )}>
                              <Calendar className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-[#111827] mb-1">Bayar Cicilan</h3>
                            <p className="text-sm text-[#6B7280] font-medium">Bayar dengan nominal tertentu</p>
                          </div>
                        </>
                      )}
                    </div>

                    {paymentType === 'dp' && (
                      <div className="p-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm animate-in slide-in-from-top-4 duration-500">
                        <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-widest mb-4">
                          Masukkan Nominal DP
                        </label>
                        <div className="space-y-4">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                            <Input
                              type="number"
                              placeholder="Contoh: 500000"
                              value={Math.round(orderData.rawTotalAmount * (dpPercentage / 100))}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                const percentage = (val / orderData.rawTotalAmount) * 100;
                                setDpPercentage(percentage);
                              }}
                              className="pl-12 h-12 rounded-xl border-[#E5E7EB] focus:border-[#295BFF] transition-all font-bold text-lg"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 gap-3">
                            {[10, 25, 50, 75].map((percent) => (
                              <Button
                                key={percent}
                                variant={Math.round(dpPercentage) === percent ? "default" : "outline"}
                                onClick={() => setDpPercentage(percent)}
                                className={cn(
                                  "rounded-xl h-11 font-bold transition-all",
                                  Math.round(dpPercentage) === percent 
                                    ? "bg-[#295BFF] hover:bg-blue-600 shadow-lg shadow-blue-500/20 border-[#295BFF]" 
                                    : "border-[#E5E7EB] text-[#6B7280] hover:bg-blue-50 hover:text-[#295BFF] hover:border-[#295BFF]/30"
                                )}
                              >
                                {percent}%
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 p-5 bg-blue-50/30 rounded-xl border border-blue-100/50 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-[#6B7280] font-medium">Nominal DP</span>
                            <span className="font-bold text-[#111827]">
                              {formatCurrency(Math.round(orderData.rawTotalAmount * (dpPercentage / 100)))}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm pt-3 border-t border-blue-100/50">
                            <span className="text-[#6B7280] font-medium">Sisa Pembayaran</span>
                            <span className="font-bold text-[#295BFF]">
                              {formatCurrency(Math.round(orderData.rawTotalAmount * ((100 - dpPercentage) / 100)))}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentType === 'installment' && (
                      <div className="p-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm animate-in slide-in-from-top-4 duration-500">
                        <label className="block text-xs font-normal text-[#6B7280] uppercase tracking-widest mb-4">
                          Masukkan Nominal Pembayaran (Maks: {formatCurrency(orderData.payment_summary?.payment_remaining || 0)})
                        </label>
                        <div className="space-y-4">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="Contoh: 500000"
                              value={customAmountDisplay}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const max =
                                  orderData.payment_summary?.payment_remaining ??
                                  orderData.remaining_amount ??
                                  0;

                                const digitsOnly = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
                                if (digitsOnly === '') {
                                  setCustomAmount(0);
                                  setCustomAmountDisplay('');
                                  return;
                                }

                                const next = Number(digitsOnly);
                                if (!Number.isFinite(next)) {
                                  setCustomAmount(0);
                                  setCustomAmountDisplay('');
                                  return;
                                }

                                const normalized = Math.max(0, Math.floor(next));
                                if (normalized > max) {
                                  setCustomAmount(max);
                                  setCustomAmountDisplay(max > 0 ? max.toLocaleString('id-ID') : '');
                                  Swal.fire({
                                    icon: 'warning',
                                    title: 'Nominal tidak valid',
                                    text: `Nominal pembayaran disesuaikan menjadi ${formatCurrency(max)}.`,
                                  });
                                  return;
                                }

                                setCustomAmount(normalized);
                                setCustomAmountDisplay(normalized.toLocaleString('id-ID'));
                              }}
                              className="pl-12 h-12 rounded-xl border-[#E5E7EB] focus:border-[#295BFF] transition-all font-bold text-lg"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* SECTION — PROMO CODE */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#295BFF]/10 rounded-xl">
                        <Ticket className="w-5 h-5 text-[#295BFF]" />
                      </div>
                      <h2 className="text-xl font-bold text-[#111827]">Kode Promo</h2>
                    </div>

                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                          <Input
                            placeholder="Masukkan kode promo (ex: HEMAT100)"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="pl-12 h-12 rounded-xl border-[#E5E7EB] bg-slate-50/50 focus:bg-white focus:border-[#295BFF] focus:ring-1 focus:ring-[#295BFF] transition-all font-medium"
                            disabled={!!appliedPromo}
                          />
                        </div>
                        {appliedPromo ? (
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setAppliedPromo(null);
                              setPromoCode('');
                            }}
                            className="h-12 px-6 rounded-xl border-red-100 text-red-500 hover:bg-red-50 font-bold"
                          >
                            Hapus
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleApplyPromo}
                            className="h-12 px-8 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold transition-all active:scale-95"
                          >
                            Terapkan
                          </Button>
                        )}
                      </div>
                      {promoError && (
                        <p className="text-sm text-red-500 mt-3 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                          <Info className="w-4 h-4" />
                          {promoError}
                        </p>
                      )}
                      {appliedPromo && (
                        <div className="mt-4 p-4 bg-green-50 rounded-xl flex justify-between items-center border border-green-100 animate-in slide-in-from-top-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm text-green-700 font-bold">
                              Promo diterapkan: <span className="underline">{appliedPromo.code}</span>
                            </span>
                          </div>
                          <span className="font-bold text-green-600">
                            -{formatCurrency(appliedPromo.amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}

              {/* SECTION — SECURITY INFO */}
              <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                 <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Shield className="w-7 h-7 text-[#295BFF]" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold text-[#111827]">Pembayaran Aman via Midtrans</h3>
                      <p className="text-[#6B7280] text-sm font-medium">Transaksi Anda dilindungi dengan enkripsi tingkat tinggi dan berbagai pilihan metode pembayaran.</p>
                    </div>
                 </div>
              </section>
            </div>

            {/* RIGHT COLUMN - SIDEBAR */}
            <div className="relative">
              <div className="lg:sticky lg:top-24 space-y-6">
                
                {/* STICKY SUMMARY CARD */}
                <Card className="bg-white border border-[#E5E7EB] rounded-3xl shadow-sm overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#111827]">Ringkasan Pesanan</h2>
                        <Badge variant="outline" className="rounded-full border-[#E5E7EB] text-[#6B7280] font-medium py-1">
                          #{orderData.id}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Bus className="w-6 h-6 text-[#295BFF]" />
                          </div>
                          <div className="flex-1">
                             <p className="text-sm font-bold text-[#111827] leading-tight mb-1">{orderData.title}</p>
                             <p className="text-[11px] text-[#6B7280] font-medium uppercase tracking-wider">
                                {orderData.participants} Unit • {orderData.duration} {orderData.durationUom}
                             </p>
                          </div>
                        </div>

                        <div className="space-y-3 py-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-[#6B7280]">Tanggal Pesanan</span>
                            <span className="font-bold text-[#111827]">{formatDate(orderData.orderDate)}</span>
                          </div>
                          
                          {/* Detailed Info */}
                          <Collapsible className="bg-slate-50/50 rounded-xl overflow-hidden border border-slate-100/50">
                            <CollapsibleTrigger className="flex bg-transparent items-center justify-between w-full px-4 py-2.5 text-xs font-bold text-[#6B7280] hover:text-[#295BFF] transition-all uppercase tracking-wider">
                                <span>Detail Perjalanan</span>
                                <ChevronDown className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-4 pb-4 space-y-4 animate-in slide-in-from-top-2">
                                 {orderData.pickup && (
                                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Penjemputan</p>
                                        <p className="text-xs font-bold text-[#111827] leading-tight">
                                          {orderData.pickup.pickup_location}, {orderData.pickup.city_label || orderData.pickup.pickup_city}
                                        </p>
                                        <p className="text-[10px] text-[#6B7280] font-medium">
                                          {formatDate(orderData.pickup.start_date, true)}
                                        </p>
                                    </div>
                                 )}

                                 {orderData.destination && orderData.destination.length > 0 && (
                                    <div className="space-y-2 pt-3 border-t border-slate-100">
                                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Tujuan</p>
                                        <ul className="space-y-2">
                                            {orderData.destination.map((dest, idx) => (
                                                <li key={idx} className="text-xs font-bold text-[#111827] flex items-start gap-2">
                                                  <div className="w-1 h-1 rounded-full bg-[#295BFF] mt-1.5 flex-shrink-0"></div>
                                                  {dest.location}, {dest.city}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                 )}
                            </CollapsibleContent>
                          </Collapsible>

                          {orderData.addon && orderData.addon.length > 0 && (
                            <div className="space-y-2 pt-2">
                              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Add-on</p>
                              {orderData.addon.map((addon, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <span className="text-[#6B7280]">{addon.addon_name}</span>
                                  <span className="font-bold text-[#111827]">{formatCurrency(addon.addon_price)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-[#E5E7EB]">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                            {paymentType === 'dp' ? 'Nominal DP' : 'Total Tagihan'}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-[#295BFF] tracking-tight">
                              {formatCurrency(getPaymentAmount())}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50/80 border border-blue-100/50 rounded-2xl p-4 flex items-start gap-3">
                        <Info className="h-5 w-5 text-[#295BFF] flex-shrink-0 mt-0.5" />
                        <p className="text-[#295BFF] text-xs leading-relaxed font-normal">
                          {orderData.status === 1 && orderData.payment_status === 1
                            ? "Pesanan Anda telah lunas dan terkonfirmasi. Silakan unduh detail pesanan atau invoice sebagai bukti."
                            : orderData.status === 1 && orderData.payment_status === 3 
                              ? "Pembayaran sudah dilakukan. Silakan menunggu konfirmasi dari tim maksimal 1x24 jam."
                              : "Pembayaran diproses secara aman melalui Midtrans. Anda akan diarahkan ke popup pembayaran."}
                        </p>
                      </div>

                      {/* CTA BUTTONS */}
                        <div className="space-y-3">
                          {orderData.status === 1 && (orderData.payment_status === 2 || orderData.payment_status === 4) && (
                            <PaymentForm 
                              orderId={orderData.id}
                              priceId={orderData.price_id}
                              paymentType={
                                paymentType === 'full' ? 1003 : 
                                paymentType === 'dp' ? 1001 : 
                                paymentType === 'repayment' ? 1003 : 
                                1002
                              }
                              amount={getPaymentAmount()}
                              onPaymentProcessed={handlePaymentProcessed}
                              isLoading={loading}
                            />
                          )}
                          
                          <Button 
                            variant="outline" 
                            onClick={handleDownloadDetailPDF}
                            disabled={isDownloadingDetail}
                            className="w-full border-[#E5E7EB] text-[#111827] font-bold h-14 rounded-2xl hover:bg-slate-50 transition-all"
                          >
                            {isDownloadingDetail ? (
                              <span className="flex items-center">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generate dokumen pesanan ....
                              </span>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Detail Pesanan PDF
                              </>
                            )}
                          </Button>

                          <Button 
                            variant="outline" 
                            onClick={handleDownloadInvoice}
                            disabled={isDownloadingInvoice}
                            className="w-full border-[#E5E7EB] text-[#111827] font-bold h-14 rounded-2xl hover:bg-slate-50 transition-all"
                          >
                            {isDownloadingInvoice ? (
                              <span className="flex items-center">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generate dokumen pesanan ....
                              </span>
                            ) : (
                              <>
                                <FileText className="w-4 h-4 mr-2" />
                                Download Invoice (PDF)
                              </>
                            )}
                          </Button>
                        </div>

                      {/* SAFE PAYMENT BADGE */}
                      <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-2xl border border-green-100/50">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Pembayaran Aman via Midtrans Snap</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* BOTTOM HELP SECTION */}
                <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-3xl p-6 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#295BFF]/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="relative z-10 space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                        <Headset className="w-6 h-6 text-[#295BFF]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">Butuh bantuan?</h3>
                        <p className="text-xs text-slate-400">Tim CS kami siap membantu.</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost"
                      className="w-full bg-white hover:bg-slate-50 text-[#0F172A] rounded-2xl font-bold h-12 shadow-sm transition-all hover:shadow-md"
                      onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
                    >
                      <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
                      Hubungi WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
