import React, { useEffect, useState, useCallback } from 'react';
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
  maxHeight?: number;
};

const FEED_URL = (embedId: string) =>
  `https://data.accentapi.com/feed/${embedId}.json?nocache=${Date.now()}`;

const normalizeRating = (r: string | number): number => {
  const n = typeof r === 'string' ? parseFloat(r) : r;
  return Number.isFinite(n) ? n : 0;
};

const formatDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
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

const GoogleReviewsFeed: React.FC<Props> = ({ embedId = '25708983', maxHeight = 320 }) => {
  const [feed, setFeed] = useState<AccentFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const bio = feed.bio;
  const reviews = feed.reviews ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 dark:text-white">
                  {bio.overall_star_rating || '—'}
                </div>
                <Stars rating={normalizeRating(bio.overall_star_rating)} className="mt-1" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {bio.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {bio.rating_count || 0} ulasan Google
                </p>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                bio.name || bio.place_id || ''
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

      <div
        className="space-y-4 overflow-y-auto pr-1"
        style={{ maxHeight }}
      >
        {reviews.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-slate-500">
              Belum ada ulasan.
            </CardContent>
          </Card>
        )}
        {reviews.map((r, idx) => {
          const text = (r.review_text || r.review_text_raw || '').trim();
          return (
            <Card key={idx}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {r.reviewer_photo_link ? (
                    <img
                      src={r.reviewer_photo_link}
                      alt={r.reviewer_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {(r.reviewer_name || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {r.reviewer_name || 'Anonymous'}
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(r.review_date_time)}
                      </span>
                    </div>
                    <div className="mt-1">
                      <Stars rating={normalizeRating(r.rating)} />
                    </div>
                    {text ? (
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {text}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm italic text-slate-400">(tanpa komentar)</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default GoogleReviewsFeed;
