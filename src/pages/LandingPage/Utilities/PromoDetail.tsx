import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Gift,
  Ticket,
  Copy,
  CheckCircle,
  Calendar,
  MapPin,
  Car,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getPromotion, type PromotionListItem } from '@/lib/promo';

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatRupiah = (value: number) => `Rp ${Math.round(value).toLocaleString('id-ID')}`;

// Sanitasi HTML syarat & ketentuan (pola sama dengan sanitizeFleetDescription di
// ArmadaDetail). Konten terms dari rich-text editor berupa <div>/<ol>/<li>, jadi
// dirender via dangerouslySetInnerHTML — buang script, event handler, dan javascript: URL.
export const sanitizePromoTerms = (html: string) => {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+=(["']).*?\1/gi, '')
    .replace(/\son\w+=([^\s>]+)/gi, '')
    .replace(/\s(href|src)=("|')\s*javascript:[^"']*\2/gi, ' $1="#"');
};

const PeriodBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'ongoing') {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Aktif</Badge>;
  }
  if (status === 'upcoming') {
    return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Segera</Badge>;
  }
  return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Berakhir</Badge>;
};

// Tombol salin kode promo — dipakai di kartu (desktop) dan floating bar (mobile).
const CopyCodeButton: React.FC<{ code: string; className?: string; variant?: 'solid' | 'outline' }> = ({
  code,
  className,
  variant = 'solid',
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({ title: 'Kode promo disalin', description: `${code} sudah disalin ke clipboard.` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Gagal menyalin', description: 'Salin manual kode: ' + code, variant: 'destructive' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ||
        `inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
          variant === 'solid'
            ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
            : 'border border-[#E2E8F0] text-[#0F172A] hover:bg-gray-50'
        }`
      }
    >
      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Tersalin' : 'Salin Kode'}
    </button>
  );
};

// Kartu kode promo — tampil di kanan (desktop) dan di dalam floating bar (mobile).
const VoucherCodeCard: React.FC<{ promo: PromotionListItem }> = ({ promo }) => (
  <div className="border border-dashed border-[#4F46E5]/40 rounded-2xl p-5 bg-[#4F46E5]/5">
    <p className="text-xs font-semibold uppercase tracking-wider text-[#4F46E5] mb-2">Kode Promo</p>
    <div className="font-mono text-xl font-bold text-[#0F172A] dark:text-white break-all mb-4 select-all">
      {promo.voucher_code}
    </div>
    <CopyCodeButton code={promo.voucher_code} className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors" />
  </div>
);

export const PromoDetail: React.FC = () => {
  const navigate = useNavigate();
  const { promotion_id } = useParams<{ promotion_id: string }>();
  const [promo, setPromo] = useState<PromotionListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPromo = async () => {
      if (!promotion_id) {
        setError('Promo tidak ditemukan.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const item = await getPromotion(promotion_id);
        if (mounted) setPromo(item);
      } catch (err) {
        console.error('Failed to fetch promotion detail', err);
        if (mounted) setError('Gagal memuat detail promo. Silakan coba lagi nanti.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPromo();
    return () => {
      mounted = false;
    };
  }, [promotion_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
      </div>
    );
  }

  if (error || !promo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 pt-24">
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">Promo Tidak Ditemukan</h2>
        <p className="text-[#64748B] dark:text-gray-400 mb-4">{error || 'Promo tidak tersedia.'}</p>
        <Button onClick={() => navigate('/promo-discount')} className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 rounded-xl">
          Lihat Semua Promo
        </Button>
      </div>
    );
  }

  const hasCode = !!promo.voucher_code;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${hasCode ? 'pb-28 lg:pb-8' : ''}`}>
      {/* Header — transparan, menempel langsung pada latar halaman (tanpa background putih) */}
      <div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/promo-discount')}
              className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] dark:text-white">Detail Promo</h1>
              <p className="text-sm text-[#64748B] dark:text-gray-400 mt-1">Syarat dan ketentuan penawaran</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Konten utama (kiri) */}
          <div className="flex-1 space-y-6 order-2 lg:order-1">
            <Card className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
              <div className="relative">
                {promo.thumbnail_url ? (
                  <img src={promo.thumbnail_url} alt={promo.title} className="w-full h-auto" />
                ) : (
                  <div className="w-full h-48 bg-[#4F46E5]/10 flex items-center justify-center">
                    <Gift className="h-16 w-16 text-[#4F46E5]" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <PeriodBadge status={promo.period_status} />
                </div>
              </div>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2">{promo.title}</h2>
                <p className="text-lg font-semibold text-[#4F46E5] mb-4">{promo.discount_label}</p>
                {promo.summary && <p className="text-[#64748B] dark:text-gray-300 mb-6">{promo.summary}</p>}

                {/* Kartu periode berlaku — fullwidth di atas kartu info lainnya */}
                <div className="flex items-start p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] mb-4">
                  <Calendar className="h-5 w-5 text-[#4F46E5] mr-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-[#64748B]">Berlaku</p>
                    <p className="text-sm font-semibold text-[#0F172A] dark:text-white">
                      {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                    </p>
                  </div>
                </div>

                {(promo.minimum_payment > 0 || promo.rent_type_label || promo.fleet_name) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {promo.minimum_payment > 0 && (
                      <div className="flex items-start p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <FileText className="h-5 w-5 text-[#4F46E5] mr-3 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-[#64748B]">Minimum Pembayaran</p>
                          <p className="text-sm font-semibold text-[#0F172A] dark:text-white">
                            {formatRupiah(promo.minimum_payment)}
                          </p>
                        </div>
                      </div>
                    )}
                    {promo.rent_type_label && (
                      <div className="flex items-start p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <Car className="h-5 w-5 text-[#4F46E5] mr-3 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-[#64748B]">Jenis Sewa</p>
                          <p className="text-sm font-semibold text-[#0F172A] dark:text-white">{promo.rent_type_label}</p>
                        </div>
                      </div>
                    )}
                    {promo.fleet_name && (
                      <div className="flex items-start p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <Car className="h-5 w-5 text-[#4F46E5] mr-3 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-[#64748B]">Armada</p>
                          <p className="text-sm font-semibold text-[#0F172A] dark:text-white">{promo.fleet_name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {promo.destinations?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-[#4F46E5]" /> Berlaku untuk Tujuan
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {promo.destinations.map((dest) => (
                        <span
                          key={dest.city_id}
                          className="text-xs font-medium text-[#64748B] bg-slate-50 dark:bg-gray-800 px-2.5 py-1 rounded-md border border-slate-100 dark:border-gray-700"
                        >
                          {dest.city_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {promo.terms && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white mb-2">Syarat & Ketentuan</h3>
                    <div
                      className="promo-terms text-sm text-[#64748B] dark:text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sanitizePromoTerms(promo.terms) }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Kartu kode (kanan, desktop) — sticky */}
          {hasCode && (
            <div className="hidden lg:block w-full lg:w-[320px] order-1 lg:order-2">
              <div className="sticky top-24">
                <Card className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
                  <CardHeader className="border-b border-[#E2E8F0]">
                    <CardTitle className="flex items-center text-base">
                      <Ticket className="h-5 w-5 mr-2 text-[#4F46E5]" />
                      Gunakan Kode Promo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <VoucherCodeCard promo={promo} />
                    <p className="mt-4 text-xs text-[#64748B] leading-relaxed">
                      Salin kode, lalu tempel pada kolom <span className="font-semibold">Kode Promo</span> di halaman
                      checkout untuk mendapatkan potongan harga.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating bar (mobile) — kode promo di bawah layar */}
      {hasCode && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-800 border-t border-[#E2E8F0] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#4F46E5]">Kode Promo</p>
              <p className="font-mono font-bold text-[#0F172A] dark:text-white truncate">{promo.voucher_code}</p>
            </div>
            <CopyCodeButton code={promo.voucher_code} className="shrink-0 bg-[#4F46E5] hover:bg-[#4338CA] text-white inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors" />
          </div>
        </div>
      )}
    </div>
  );
};
