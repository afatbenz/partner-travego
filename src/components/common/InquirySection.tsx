import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Headphones, Zap, BadgeCheck, MessageCircle, Send } from 'lucide-react';

interface InquirySectionProps {
  title?: string;
  subtitle?: string;
}

export const InquirySection: React.FC<InquirySectionProps> = ({
  title = "Belum Menemukan\nyang Sesuai?",
  subtitle = "Tenang, hubungi kami untuk mendapatkan penawaran armada terbaik sesuai kebutuhan perjalanan Anda."
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    requirement: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Inquiry form submitted:', formData);
  };

  const features = [
    { icon: Zap, label: 'Respon Cepat' },
    { icon: BadgeCheck, label: 'Harga Transparan' },
    { icon: MessageCircle, label: 'Konsultasi Gratis' },
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Background Gradient */}
      <div className="absolute inset-0" />

      {/* Decorative Abstract Blur Shapes */}
      <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full bg-white/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-60px] w-[350px] h-[350px] rounded-full bg-blue-300/15 blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-white/5 blur-[120px] pointer-events-none" />

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Content */}
      <div className="relative pt-10 pb-10 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-gradient-to-br from-[#295BFF] via-[#3A6AFF] to-[#4F7BFF] dark:bg-gray-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Side */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            {/* Icon */}
            <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Headphones className="h-8 w-8 text-white" />
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight whitespace-pre-line">
                {title}
              </h2>
              <p className="text-lg text-blue-100 font-normal leading-relaxed max-w-md">
                {subtitle}
              </p>
            </div>

            {/* Mini Bullet Features */}
            <div className="flex flex-wrap gap-4">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-3 transition-all duration-300 hover:bg-white/20"
                >
                  <feature.icon className="h-4.5 w-4.5 text-blue-200" />
                  <span className="text-sm font-medium text-white">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side — Form */}
          <div className="animate-in fade-in slide-in-from-right duration-700">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">Kirim Permintaan</h3>
                <p className="text-sm text-blue-200 mt-1 font-normal">Isi form di bawah, tim kami akan segera menghubungi Anda.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="inquiryName" className="text-sm font-medium text-blue-100">
                    Nama Lengkap
                  </label>
                  <Input
                    id="inquiryName"
                    name="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-[52px] bg-white/10 border-white/15 rounded-xl text-white placeholder:text-blue-200/50 focus:bg-white/15 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all duration-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="inquiryEmail" className="text-sm font-medium text-blue-100">
                      Email
                    </label>
                    <Input
                      id="inquiryEmail"
                      name="email"
                      type="email"
                      placeholder="contoh@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-[52px] bg-white/10 border-white/15 rounded-xl text-white placeholder:text-blue-200/50 focus:bg-white/15 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="inquiryPhone" className="text-sm font-medium text-blue-100">
                      Nomor Telepon
                    </label>
                    <Input
                      id="inquiryPhone"
                      name="phone"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="h-[52px] bg-white/10 border-white/15 rounded-xl text-white placeholder:text-blue-200/50 focus:bg-white/15 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="inquiryRequirement" className="text-sm font-medium text-blue-100">
                    Kebutuhan / Keperluan
                  </label>
                  <Textarea
                    id="inquiryRequirement"
                    name="requirement"
                    placeholder="Jelaskan kebutuhan perjalanan Anda..."
                    value={formData.requirement}
                    onChange={handleInputChange}
                    className="min-h-[100px] bg-white/10 border-white/15 rounded-xl text-white placeholder:text-blue-200/50 focus:bg-white/15 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all duration-300 resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-[52px] bg-white hover:bg-blue-50 text-[#295BFF] font-semibold rounded-xl shadow-lg shadow-black/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                >
                  <Send className="h-4 w-4" />
                  Kirim Permintaan
                </Button>

                <p className="text-xs text-blue-200/70 text-center pt-1">
                  Dengan mengirim permintaan, Anda menyetujui syarat dan ketentuan yang berlaku.
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
