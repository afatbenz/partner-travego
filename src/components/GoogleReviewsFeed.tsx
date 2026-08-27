import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type AccentReview = {
  reviewer_name: string;
  reviewer_photo_link: string;
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
};

const FEED_URL = (embedId: string) =>
  `https://data.accentapi.com/feed/${embedId}.json?nocache=${Date.now()}`;

const normalizeRating = (r: string | number): number => {
  const n = typeof r === 'string' ? parseFloat(r) : r;
  return Number.isFinite(n) ? n : 0;
};

const Stars: React.FC<{ rating: number; className?: string }> = ({ rating, className }) => {
  const rounded = Math.round(rating);
  return (
    <div className={`flex items-center gap-0.5 ${className ?? ''}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rounded ? 'text-yellow-400 fill-current' : 'text-slate-300 dark:text-slate-600'}`}
        />
      ))}
    </div>
  );
};

const GoogleReviewsFeed: React.FC<Props> = ({ embedId = '25708983' }) => {
  const [feed, setFeed] = useState<AccentFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef(0);

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

  // Auto-advance: scroll 1 card ke kanan tiap 3 detik, loop ke awal.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !feed || feed.reviews.length === 0) return;
    const total = feed.reviews.length;
    const cardWidth = el.clientWidth / 3; // lebar 1 kartu (3 kartu terlihat)

    const timer = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % total;
      el.scrollTo({ left: indexRef.current * (cardWidth + 16), behavior: 'smooth' });
    }, 3000);
    return () => clearInterval(timer);
  }, [feed]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-500">
        Memuat ulasan...
      </div>
    );
  }

  if (error || !feed) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
        Gagal memuat ulasan: {error || 'data kosong'}
      </div>
    );
  }

  const reviews = feed.reviews ?? [];

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Ringkasan rating */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 dark:text-white">
                  {feed.bio.overall_star_rating || '—'}
                </div>
                <Stars rating={normalizeRating(feed.bio.overall_star_rating)} className="mt-1" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {feed.bio.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {feed.bio.rating_count || 0} ulasan Google
                </p>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                feed.bio.name || feed.bio.place_id || ''
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Lihat di Google →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Carousel: 3 kartu per layar, auto-scroll tiap 3 detik */}
      <div
        ref={containerRef}
        className="overflow-x-auto"
        style={{
          display: 'flex',
          gap: '1rem',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          paddingBottom: '6px',
        }}
        aria-label="review carousel"
      >
        {reviews.length === 0 && (
          <div className="w-full">
            <Card>
              <CardContent className="p-8 text-center text-sm text-slate-500">
                Belum ada ulasan.
              </CardContent>
            </Card>
          </div>
        )}
        {reviews.map((r, idx) => (
          <div
            key={idx}
            style={{
              flex: '0 0 30%',
              minWidth: '30%',
              scrollSnapAlign: 'start',
            }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {/* Foto profile dihilangkan: cukup nama + star + komentar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {r.reviewer_name || 'Anonymous'}
                    </span>
                    <Stars rating={normalizeRating(r.rating)} />
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {(r.review_text || r.review_text_raw || '').trim() || ''}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoogleReviewsFeed;
