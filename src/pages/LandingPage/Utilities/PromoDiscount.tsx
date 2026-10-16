import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Ticket, Loader2, Percent, Tag, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPromotions, type PromotionListItem } from '@/lib/promo';

// Format tanggal panjang (id-ID)
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

// Badge status periode: upcoming | ongoing | expired
const PeriodBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'ongoing') {
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Aktif</Badge>;
  }
  if (status === 'upcoming') {
    return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Segera</Badge>;
  }
  return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Berakhir</Badge>;
};

// Animasi demo di hero: input kode promo yang mengetik "PROMOCALISTA" satu per
// satu, disampingnya tombol redeem ditekan. Ringkas — tanpa card title agar
// hero section tidak terlalu tinggi. Murni CSS, loop 8 detik.
const PROMO_HERO_CSS = `
@keyframes promo-typing {
  0% { width: 0; animation-timing-function: steps(12, end); }
  20% { width: 12ch; }
  88% { width: 12ch; }
  93%, 100% { width: 0; }
}
.promo-typing { animation: promo-typing 8s infinite; }

@keyframes promo-caret {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.promo-caret { animation: promo-caret 0.9s step-end infinite; }

@keyframes promo-click {
  0%, 26% { transform: scale(1); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.5); }
  28% { transform: scale(0.94); }
  30% { transform: scale(1.03); box-shadow: 0 0 0 12px rgba(79, 70, 229, 0); }
  34%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
}
.promo-click { animation: promo-click 8s infinite; }

@keyframes promo-toast {
  0%, 38% { opacity: 0; transform: translateY(4px) scale(0.96); }
  43%, 90% { opacity: 1; transform: translateY(0) scale(1); }
  94%, 100% { opacity: 0; transform: translateY(4px) scale(0.96); }
}
.promo-toast { animation: promo-toast 8s infinite; }

@media (prefers-reduced-motion: reduce) {
  .promo-typing, .promo-caret, .promo-click, .promo-toast { animation: none; }
  .promo-typing { width: 12ch; }
  .promo-toast { opacity: 1; transform: none; }
}
`;

const PromoHeroAnimation: React.FC = () => (
  <div className="relative w-full max-w-sm mx-auto lg:mx-0">
    <style>{PROMO_HERO_CSS}</style>
    <div className="rounded-2xl bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] p-4">
      {/* Input kode + tombol redeem — sejajar, tanpa card title agar ringkas */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5">
          <Ticket className="h-4 w-4 text-[#4F46E5] mr-2 shrink-0" />
          <span className="promo-typing inline-block overflow-hidden whitespace-nowrap font-mono text-sm font-bold text-gray-900 dark:text-white">
            PROMOCALISTA
          </span>
          <span className="promo-caret inline-block w-[2px] h-4 bg-[#4F46E5] ml-0.5 shrink-0" />
        </div>
        <div className="promo-click shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-[#4F46E5] px-4 py-2.5 text-sm font-semibold text-white">
          <Tag className="h-4 w-4" /> Redeem
        </div>
      </div>

      {/* Toast sukses */}
      <div className="promo-toast mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Promo diterapkan — hemat 25%!</span>
      </div>
    </div>
  </div>
);

export const PromoDiscount: React.FC = () => {
  const navigate = useNavigate();
  const [promos, setPromos] = useState<PromotionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchPromos = async () => {
      setLoading(true);
      setError(null);
      try {
        // order_type=1 → promo khusus armada (relevan untuk website partner)
        const items = await getPromotions('', 1);
        if (mounted) setPromos(items);
      } catch (err) {
        console.error('Failed to fetch promotions', err);
        if (mounted) setError('Gagal memuat promo. Silakan coba lagi nanti.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPromos();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero — maksimum 45vh (+15vh dari sebelumnya 30vh) */}
      <section className="relative w-full max-h-[45vh] overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1e3a5f] to-[#295BFF]">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-0 -left-20 w-72 h-72 bg-[#295BFF]/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-56 h-56 bg-amber-400/20 rounded-full blur-[80px]" />

        <div className="relative z-10 container mx-auto px-4 pt-24 pb-20 md:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-6">
            <div className="w-full lg:w-1/2 space-y-3 animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <Percent className="h-3.5 w-3.5 text-amber-300" />
                <span className="text-white/90 text-xs font-medium">Promo &amp; Diskon</span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Promo Spesial <span className="text-amber-300">Untuk Perjalanan</span> Anda
              </h1>
              <p className="text-white/70 text-sm md:text-base max-w-lg leading-relaxed">
                Temukan promo terbaik untuk perjalanan Anda. Salin kode promo dan gunakan saat checkout untuk potongan harga langsung.
              </p>
            </div>

            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end animate-in fade-in zoom-in duration-700 delay-200">
              <PromoHeroAnimation />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] mb-[-1px]">
          <svg viewBox="0 0 1440 320" className="relative block w-full h-[50px] md:h-[80px] dark:hidden" preserveAspectRatio="none">
            <path
              fill="#F8FAFC"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
          <svg viewBox="0 0 1440 320" className="relative block w-full h-[50px] md:h-[80px] hidden dark:block" preserveAspectRatio="none">
            <path
              fill="#111827"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-10 text-center text-gray-600 dark:text-gray-300">{error}</CardContent>
          </Card>
        ) : promos.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-gray-600 dark:text-gray-300">
              Belum ada promo yang tersedia saat ini. Silakan kembali lagi nanti.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promos.map((promo) => (
              <button
                key={promo.promotion_id}
                onClick={() => navigate(`/promo-discount/${promo.promotion_id}`)}
                className="text-left p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#4F46E5]/40 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  {promo.thumbnail_url ? (
                    <img
                      src={promo.thumbnail_url}
                      alt={promo.title}
                      className="w-32 h-32 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center shrink-0">
                      <Gift className="h-12 w-12 text-[#4F46E5]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{promo.title}</h3>
                      <PeriodBadge status={promo.period_status} />
                    </div>
                    {promo.summary && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{promo.summary}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <span className="font-semibold text-[#4F46E5]">{promo.discount_label}</span>
                      {promo.minimum_payment > 0 && (
                        <span className="text-gray-600 dark:text-gray-300">
                          Min. {formatRupiah(promo.minimum_payment)}
                        </span>
                      )}
                      {promo.voucher_code && (
                        <span className="inline-flex items-center font-mono font-semibold text-gray-900 dark:text-white">
                          <Ticket className="h-3.5 w-3.5 mr-1 text-[#4F46E5]" />
                          {promo.voucher_code}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(promo.start_date)} — {formatDate(promo.end_date)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
