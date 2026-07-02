import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquareHeart, 
  Star, 
  Info, 
  Send 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import Swal from '@/lib/swal';
import { http } from '@/lib/http';

export const OrderReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Rating Kosong',
        text: 'Silakan berikan penilaian bintang terlebih dahulu.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await http.post<{ status?: string }>('/api/service/review/submit', {
        star: rating,
        review: review,
        token: token
      });

      if (response.status === 200 || response.data?.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Ulasan Terkirim!',
          text: 'Terima kasih atas ulasan Anda. Kami sangat menghargainya!',
        }).then(() => {
          navigate('/');
        });
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Submit review error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat mengirim ulasan. Silakan coba lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FF] font-sans pb-20">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 pt-28 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col items-center">
        {/* Back Link */}
        <div className="w-full flex justify-start mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-slate-500  bg-transparent hover:text-[#4F6BFF] hover:bg-blue-50/50 rounded-full transition-all group px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2 bg-transparent transition-transform group-hover:-translate-x-1" />
            <span className="font-medium text-sm bg-transparent">Kembali ke Detail Pesanan</span>
          </Button>
        </div>

        {/* Review Card */}
        <Card className="w-full bg-white/90 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-[0_20px_60px_rgba(79,107,255,0.06)] overflow-hidden">
          <CardContent className="p-6 md:p-8">
            
            {/* Header Section */}
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <div className="w-16 h-16 bg-blue-50 text-[#4F6BFF] rounded-2xl flex items-center justify-center shadow-inner border border-blue-100">
                <MessageSquareHeart className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Berikan Ulasan Anda</h1>
                <p className="text-slate-500 font-medium text-sm max-w-md mx-auto">
                  Pengalaman Anda sangat berharga untuk membantu kami meningkatkan kualitas layanan.
                </p>
              </div>
            </div>

            {/* Star Rating Section */}
            <div className="space-y-3 mb-6 text-center">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Berikan Penilaian
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 bg-transparent hover:border-neutral-200 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "w-10 h-10 transition-colors duration-200 bg-transparent",
                        (hoverRating || rating) >= star
                          ? "fill-orange-500 text-orange-500"
                          : "fill-transparent text-gray-300 hover:text-orange-500 hover:fill-orange-500"
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-medium text-[#4F6BFF] h-5">
                {rating === 1 && "Sangat Buruk"}
                {rating === 2 && "Buruk"}
                {rating === 3 && "Cukup"}
                {rating === 4 && "Baik"}
                {rating === 5 && "Sangat Baik!"}
              </p>
            </div>

            {/* Review Message Section */}
            <div className="space-y-2 mb-6">
              <label htmlFor="review" className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                Tulis Ulasan
              </label>
              <div className="relative">
                <Textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Ceritakan pengalaman perjalanan Anda bersama kami..."
                  className="min-h-[100px] resize-none rounded-2xl border-slate-200 bg-slate-50/50 p-4 text-slate-700 placeholder:text-slate-400 focus:border-[#4F6BFF] focus:ring-[#4F6BFF] transition-all"
                  maxLength={500}
                />
                <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-400">
                  {review.length} / 500
                </div>
              </div>
            </div>

            {/* Information Alert */}
            <div className="flex items-start gap-3 p-4 bg-blue-50/80 border border-blue-100/50 rounded-2xl mb-6">
              <Info className="w-5 h-5 text-[#4F6BFF] flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                Ulasan Anda akan dipublikasikan dan dapat membantu pelanggan lain dalam memilih layanan yang tepat.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-4 rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-1 active:translate-y-0 group h-auto"
              >
                {isSubmitting ? (
                  "Mengirim..."
                ) : (
                  <>
                    Kirim Ulasan
                    <Send className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};
