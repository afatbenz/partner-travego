import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Headphones, MessageCircle, Send, Loader2 } from 'lucide-react';
import { http } from '@/lib/http';
import Swal from '@/lib/swal';

interface FloatingContactBarProps {
  messageType?: string;
}

export const FloatingContactBar: React.FC<FloatingContactBarProps> = ({
  messageType = 'MSG005'
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Nomor telepon: hanya angka
    if (name === 'customer_phone') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await http.post('/api/messages/submit', {
        ...formData,
        message_type: messageType
      });
      setFormData({ customer_name: '', customer_email: '', customer_phone: '', message: '' });
      setOpen(false);
      await Swal.fire({
        icon: 'success',
        title: 'Permintaan Terkirim',
        text: 'Permintaan telah dikirim. Mohon tunggu tim kami akan menghubungi anda.',
        confirmButtonText: 'OK'
      });
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal Mengirim',
        text: 'Terjadi kesalahan saat mengirim permintaan. Silakan coba lagi.',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "h-[52px] bg-white/10 border-blue-600 rounded-xl text-white placeholder:text-white/50 focus:border-blue-200 focus:ring-2 focus:ring-blue-200/20 focus-visible:border-blue-200 focus-visible:ring-2 focus-visible:ring-blue-200/20 transition-all duration-300";

  return (
    <>
      {/* Backdrop saat sheet terbuka */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom bar — mobile only */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-0 inset-x-0 z-40 flex items-center gap-3 bg-blue-500 text-white px-5 pt-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(37,99,235,0.45)]"
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Headphones className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm truncate">Belum Sesuai?</span>
          </div>
          <span className="flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-2.5 text-sm font-semibold shrink-0">
            <MessageCircle className="h-4 w-4" />
            Hubungi Kami
          </span>
        </button>
      </div>

      {/* Floating sheet — slide up smooth */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-gradient-to-b from-blue-600 to-blue-800 rounded-t-[1rem] shadow-[0_-20px_60px_rgba(0,0,0,0.25)] transition-transform duration-500 ease-out max-h-[85vh] flex flex-col ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="shrink-0 flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Kirim Permintaan</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-full text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 sm:px-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-blue-100 -mt-1">Isi form di bawah, tim kami akan segera menghubungi Anda.</p>

            <div className="space-y-1.5">
              <label htmlFor="requestName" className="text-sm font-medium text-white">
                Nama Lengkap
              </label>
              <Input
                id="requestName"
                name="customer_name"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={formData.customer_name}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="requestEmail" className="text-sm font-medium text-white">
                  Email
                </label>
                <Input
                  id="requestEmail"
                  name="customer_email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  className={inputClass}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="requestPhone" className="text-sm font-medium text-white">
                  Nomor Telepon
                </label>
                <Input
                  id="requestPhone"
                  name="customer_phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="requestRequirement" className="text-sm font-medium text-white">
                Kebutuhan / Keperluan
              </label>
              <Textarea
                id="requestRequirement"
                name="message"
                placeholder="Jelaskan kebutuhan perjalanan Anda..."
                value={formData.message}
                onChange={handleInputChange}
                  className="min-h-[100px] bg-white/10 border-blue-600 rounded-xl text-white placeholder:text-white/50 focus:border-blue-200 focus:ring-2 focus:ring-blue-200/20 focus-visible:border-blue-200 focus-visible:ring-2 focus-visible:ring-blue-200/20 transition-all duration-300"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[52px] bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
            </Button>

            <p className="text-xs text-gray-400 text-center pt-1">
              Dengan mengirim permintaan, Anda menyetujui syarat dan ketentuan yang berlaku.
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default FloatingContactBar;
