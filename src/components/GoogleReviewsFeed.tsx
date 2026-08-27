import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AccentReview = {
  reviewer_name: string;
  reviewer_photo_link: string;
  reviewer_images_link?: string[];
  images?: string[];
  image_urls?: string[];
  rating: string | number;
  review_date_time: string;
  review_text: string;
  review_text_raw: string;
};

type AccentBio = {
  place_id: string;
  name: string;
  overall_star_rating: string;
  rating_count: string;
};

type AccentFeed = {
  reviews: AccentReview[];
  bio: AccentBio;
};

type Props = {
  embedId?: string;
  maxHeight?: number;
  className?: string;
};

const FEED_URL = (embedId: string) =>
  `https://data.accentapi.com/feed/${embedId}.json?nocache=${Date.now()}`;

const normalizeRating = (r: string | number): number => {
  const n = typeof r === 'string' ? parseFloat(r) : r;
  return Number.isFinite(n) ? n : 0;
};

/** Relative time in Indonesian, e.g. "5 hari lalu". */
const timeAgo = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days < 1) {
    const hrs = Math.floor(diff / 3_600_000);
    if (hrs < 1) {
      const mins = Math.floor(diff / 60_000);
      return mins <= 1 ? 'Baru saja' : `${mins} menit lalu`;
    }
    return `${hrs} jam lalu`;
  }
  if (days === 1) return '1 hari lalu';
  if (days < 7) return `${days} hari lalu`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} minggu lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan lalu`;
  return `${Math.floor(days / 365)} tahun lalu`;
};

const Stars: React.FC<{ rating: number; size?: number; className?: string }> = ({ rating, size = 4, className }) => {
  const rounded = Math.round(rating);
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          style={{ width: size * 4, height: size * 4 }}
          className={cn(
            i < rounded ? 'text-yellow-400 fill-current' : 'text-slate-300 dark:text-slate-600'
          )}
        />
      ))}
    </div>
  );
};

const GoogleLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.53 5.53 0 0 1-2.4 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.81z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z" />
    <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.57.37-2.29V6.61H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.39l3.98-3.1z" />
    <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.45-3.45A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.61l3.98 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
  </svg>
);

const GoogleReviewsFeed: React.FC<Props> = ({ embedId = '25708983', className }) => {
  const [feed, setFeed] = useState<AccentFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const trackRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef(0);
  const [currentPage, setCurrentPage] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(FEED_URL(embedId));
      if (!res.ok) throw new Error(`Feed error: ${res.status}`);
      const data = (await res.json()) as AccentFeed;
      setFeed(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat ulasan');
      setFeed(null);
    } finally {
      setLoading(false);
    }
  }, [embedId]);

  useEffect(() => {
    load();
  }, [load]);

  const reviews = (feed?.reviews ?? []).filter(
    r => (r.review_text || r.review_text_raw || '').trim() !== ''
  );
  const bio = feed?.bio;

  // Page dots + auto-advance (1 card every 3s, loop).
  useEffect(() => {
    const el = trackRef.current;
    if (!el || reviews.length === 0) return;
    const card = el.children[0] as HTMLElement | undefined;
    if (!card) return;
    const gap = 16; // 1rem gap
    const step = card.offsetWidth + gap;

    const timer = setInterval(() => {
      const maxLeft = el.scrollWidth - el.clientWidth;
      const next = el.scrollLeft + step;
      if (next > maxLeft) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollTo({ left: next, behavior: 'smooth' });
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [feed, reviews.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[0] as HTMLElement | undefined;
    const step = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-500">
        Memuat ulasan...
      </div>
    );
  }

  if (error || !feed || !bio) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
        Gagal memuat ulasan: {error || 'data kosong'}
      </div>
    );
  }

  const overall = normalizeRating(bio.overall_star_rating);
  const totalLabel = bio.rating_count || reviews.length.toString();
  const allFeedReviews = feed.reviews ?? [];
  const breakdown = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: allFeedReviews.filter(r => Math.round(normalizeRating(r.rating)) === stars).length,
  }));
  const breakdownTotal = allFeedReviews.length || 1;
  const pages = Math.max(1, Math.ceil(reviews.length / 4));

  const ratingLabel =
    overall >= 4.5 ? 'Sangat Baik'
      : overall >= 4 ? 'Baik'
        : overall >= 3 ? 'Cukup Baik' : 'Perlu Ditingkatkan';

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    bio.name || bio.place_id || ''
  )}`;

  return (
    <section className={cn('w-full max-w-full bg-blue-50/50 dark:bg-slate-950', className)}>
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 md:py-20">
        {/* ===== Header ===== */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-14">
          <h2 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Ulasan <span className="text-blue-600 dark:text-blue-400">Google Maps</span>
          </h2>
          <div className="mt-3 h-1 w-16 rounded-full bg-blue-600 dark:bg-blue-400" />
          <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-500 dark:text-slate-400">
            Penilaian jujur dari pelanggan kami yang telah merasakan layanan terbaik dari Calista Prima Wisata.
          </p>
        </div>

        {/* ===== Rating summary card (3 kolom) ===== */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl mb-10">
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
              {/* Kolom kiri: angka besar */}
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-end gap-1">
                  <span className="text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-none">
                    {bio.overall_star_rating || '—'}
                  </span>
                  <span className="text-2xl text-slate-400 mb-1">/5</span>
                </div>
                <Stars rating={overall} size={5} className="mt-1" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ratingLabel}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Berdasarkan {totalLabel} ulasan Google
                </span>
              </div>

              {/* Kolom tengah: breakdown bar */}
              <div className="space-y-2">
                {breakdown.map(({ stars, count }) => {
                  const pct = Math.round((count / breakdownTotal) * 100);
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-8 text-right text-sm font-medium text-slate-600 dark:text-slate-300">
                        {stars}★
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm text-slate-500 dark:text-slate-400">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Kolom kanan: logo + CTA */}
              <div className="flex flex-col items-center md:items-end gap-4">
                <GoogleLogo className="h-12 w-12" />
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                >
                  Lihat semua ulasan di Google
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== Review carousel ===== */}
        <div className="relative">
          {/* Panah kiri */}
          <button
            aria-label="Sebelumnya"
            onClick={() => scrollByPage(-1)}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={trackRef}
            className="gr-track flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 pb-4"
            style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            aria-label="Ulasan pelanggan"
            onScroll={() => {
              const el = trackRef.current;
              const card = el?.children[0] as HTMLElement | undefined;
              if (!el || !card) return;
              const step = card.offsetWidth + 16;
              const newPage = Math.max(0, Math.min(pages - 1, Math.round(el.scrollLeft / step)));
              setCurrentPage(newPage);
            }}
          >
            <style>{`.gr-track::-webkit-scrollbar { display: none; }`}</style>
            {reviews.length === 0 && (
              <div className="w-full">
                <Card>
                  <CardContent className="p-10 text-center text-sm text-slate-500">
                    Belum ada ulasan.
                  </CardContent>
                </Card>
              </div>
            )}
            {reviews.map((r, idx) => (
              <div
                key={idx}
                className="snap-start basis-[85%] sm:basis-[45%] lg:basis-[23.5%] min-w-0 shrink-0"
              >
                <Card className="relative h-full border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                      {r.reviewer_photo_link ? (
                        <img
                          src={r.reviewer_photo_link}
                          alt={r.reviewer_name || 'reviewer'}
                          className="h-11 w-11 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shrink-0">
                          {(r.reviewer_name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {r.reviewer_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {timeAgo(r.review_date_time)}
                        </p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <Stars rating={normalizeRating(r.rating)} size={4} />
                    </div>
                    {(r.images?.length || r.image_urls?.length || r.reviewer_images_link?.length) ? (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {[...(r.images || []), ...(r.image_urls || []), ...(r.reviewer_images_link || [])]
                          .filter(Boolean)
                          .slice(0, 4)
                          .map((src, i) => (
                            <img key={i} src={src} alt={`foto review ${i + 1}`} className="h-10 w-10 rounded object-cover" />
                          ))}
                      </div>
                    ) : null}
                    <p className="flex-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {(r.review_text || r.review_text_raw || '').trim()}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-slate-400 dark:text-slate-500">
                      <GoogleLogo className="h-4 w-4" />
                      <span className="text-[11px]">Google Review</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Panah kanan */}
          <button
            aria-label="Berikutnya"
            onClick={() => scrollByPage(1)}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* ===== Dot pagination ===== */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              aria-label={`Halaman ${i + 1}`}
              onClick={() => {
                const el = trackRef.current;
                if (!el) return;
                const card = el.children[0] as HTMLElement | undefined;
                const step = card ? card.offsetWidth + 16 : 300;
                el.scrollTo({ left: i * 4 * step, behavior: 'smooth' });
                setCurrentPage(i);
              }}
              className={cn(
                'h-2.5 rounded-full transition-all',
                i === currentPage
                  ? 'w-7 bg-blue-600'
                  : 'w-2.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GoogleReviewsFeed;
