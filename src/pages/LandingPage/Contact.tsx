import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Headset,
  Check,
  Zap,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const WHATSAPP_URL = 'https://wa.me/6281234567890';
const CALL_CENTER = 'tel:1500888';
const GOOGLE_MAPS_URL =
  'https://maps.app.goo.gl/anWRTSRBCZhdr8qX9';

const inputClass =
  'h-14 rounded-2xl border border-[#E5E7EB] bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-100 focus-visible:border-[#295BFF] transition-all duration-300';

const labelClass = 'text-sm font-medium text-[#0F172A]';

function SupportIllustration() {
  return (
    <div className="relative animate-float">
      <div className="absolute -inset-8 bg-[#295BFF]/25 rounded-full blur-[60px]" />
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl w-[280px] md:w-[340px]">
        <div className="flex items-center justify-between mb-5">
          <span className="text-white/70 text-xs font-medium">Customer Support</span>
          <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-400/30">
            Online
          </span>
        </div>
        <div className="bg-white/95 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#295BFF] to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Headset className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280] uppercase tracking-wide">Tim Support</p>
              <p className="text-sm font-bold text-[#0F172A]">Calista Prima Wisata</p>
            </div>
          </div>
          <div className="space-y-2">
            {['Konsultasi perjalanan', 'Booking armada', 'Paket wisata'].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 px-3 py-2 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]/60"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#295BFF]" />
                <span className="text-xs text-[#374151]">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white flex items-center justify-center"
                >
                  <Headset className="h-3 w-3 text-[#295BFF]" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#6B7280]">
              <span className="font-semibold text-[#295BFF]">3 agen</span> siap membantu
            </p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-6 bg-white/90 backdrop-blur-md border border-white/50 rounded-2xl px-4 py-3 shadow-xl hidden sm:flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-semibold text-[#0F172A]">Respon {'<'} 5 menit</span>
      </div>
    </div>
  );
}

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Alamat',
      details: ['Jl. Sudirman Kav. 45', 'Jakarta Pusat 10210', 'Indonesia'],
    },
    {
      icon: Phone,
      title: 'Telepon',
      details: ['+62 21 1234 5678', '+62 21 8765 4321', 'WhatsApp: +62 812 3456 7890'],
    },
    {
      icon: Mail,
      title: 'Email',
      details: [
        'info@calistaprimawisata.com',
        'booking@calistaprimawisata.com',
        'support@calistaprimawisata.com',
      ],
    },
    {
      icon: Clock,
      title: 'Jam Operasional',
      details: [
        'Senin - Jumat: 08:00 - 18:00',
        'Sabtu: 08:00 - 16:00',
        'Minggu: 09:00 - 15:00',
      ],
    },
  ];

  const heroPills = ['24/7 Support', 'Respon Cepat', 'Aman & Terpercaya'];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, service: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', phone: '', service: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* Hero */}
      <section className="relative w-full min-h-[280px] md:min-h-[360px] overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1e3a5f] to-[#295BFF]">
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
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-blue-300/10 rounded-full blur-[60px]" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 md:pb-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center max-w-7xl mx-auto">
            <div className="space-y-5 animate-in fade-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <Headset className="h-4 w-4 text-[#93B4FF]" />
                <span className="text-white/90 text-sm font-medium">Kami Siap Membantu</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Hubungi Kami
                </h1>
                <p className="text-white/70 text-base md:text-lg max-w-lg leading-relaxed">
                  Kami siap membantu perencanaan perjalanan, booking armada, dan konsultasi
                  kebutuhan wisata Anda.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {heroPills.map((text) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/10"
                  >
                    <Check className="h-3.5 w-3.5 text-[#93B4FF]" />
                    <span className="text-white/85 text-xs md:text-sm">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden md:flex justify-center lg:justify-end animate-in fade-in zoom-in duration-700 delay-200">
              <SupportIllustration />
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg
            viewBox="0 0 1440 120"
            className="relative block w-full h-[60px] md:h-[100px] lg:h-[120px]"
            preserveAspectRatio="none"
          >
            <path
              fill="#F8FAFC"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      {/* Main content */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.4fr] gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start animate-in fade-in slide-in-from-bottom duration-500">
            <div className="space-y-4">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#295BFF]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-[#295BFF]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0F172A] mb-1.5">{info.title}</h3>
                        <div className="space-y-0.5">
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-sm text-[#6B7280] leading-relaxed">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-[#0F172A] text-sm uppercase tracking-wide">
                Aksi Cepat
              </h3>
              <Button
                type="button"
                onClick={() => window.open(WHATSAPP_URL, '_blank')}
                className="w-full h-14 justify-start rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/30"
              >
                <MessageCircle className="mr-3 h-5 w-5" />
                WhatsApp
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => (window.location.href = CALL_CENTER)}
                className="w-full h-14 justify-start rounded-2xl border-[#E5E7EB] font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-[#295BFF] hover:text-[#295BFF] hover:shadow-md hover:shadow-blue-500/10"
              >
                <Phone className="mr-3 h-5 w-5" />
                Call Center: 1500-888
              </Button>
            </div>
          </aside>

          {/* Form + Map */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
            {/* Contact form */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-6 md:p-10 transition-all duration-300 hover:shadow-[0_12px_50px_rgba(0,0,0,0.08)]">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-14 h-14 bg-[#295BFF]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Send className="h-6 w-6 text-[#295BFF]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A]">Kirim Pesan</h2>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Isi form di bawah ini dan kami akan merespon dalam 1x24 jam
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className={labelClass}>
                      Nama *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className={labelClass}>
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="contoh@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="phone" className={labelClass}>
                      Telepon *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+62 812 3456 7890"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="service" className={labelClass}>
                      Layanan
                    </label>
                    <Select value={formData.service} onValueChange={handleServiceChange}>
                      <SelectTrigger className={cn(inputClass, 'w-full')}>
                        <SelectValue placeholder="Pilih layanan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rental">Rental Mobil</SelectItem>
                        <SelectItem value="travel">Travel Antar Kota</SelectItem>
                        <SelectItem value="paket">Paket Wisata</SelectItem>
                        <SelectItem value="airport">Airport Transfer</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className={labelClass}>
                    Pesan *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Tulis pesan Anda di sini..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="min-h-[140px] rounded-2xl border border-[#E5E7EB] bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-100 focus-visible:border-[#295BFF] resize-none transition-all duration-300"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-[#295BFF] to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/35"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Kirim Pesan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="h-14 px-8 rounded-2xl border-[#E5E7EB] font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-[#295BFF] hover:text-[#295BFF]"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Form
                  </Button>
                </div>
              </form>
            </div>

            {/* Map */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_50px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 md:p-8 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#295BFF]/10 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-[#295BFF]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Lokasi Kantor</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.open(GOOGLE_MAPS_URL, '_blank')}
                  className="h-11 rounded-2xl border-[#E5E7EB] font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-[#295BFF] hover:text-[#295BFF]"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Buka di Google Maps
                </Button>
              </div>

              <div className="relative aspect-[16/9] md:aspect-[21/9] bg-gradient-to-br from-slate-100 to-blue-50">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.3593106055664!2d106.60919578311777!3d-6.216256577712491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fff576a8ccc7%3A0xe8e0076ce8948f2c!2sSEWA%20HIACE%20%26%20ELF%20TANGERANG%20(Calista%20Prima%20Wisata)!5e0!3m2!1sid!2sid!4v1779378425135!5m2!1sid!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md rounded-2xl border border-[#E5E7EB] p-4 shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#295BFF] rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F172A] text-sm">Kantor Pusat</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        Jl. Sudirman Kav. 45, Jakarta Pusat 10210
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl">
        <div className="bg-gradient-to-r from-[#295BFF]/10 via-blue-50 to-indigo-50 rounded-3xl p-8 md:p-10 border border-blue-100/80 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center flex-shrink-0">
                <Headset className="h-8 w-8 text-[#295BFF]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#0F172A]">Butuh respon cepat?</h3>
                <p className="text-[#6B7280] max-w-md text-sm md:text-base">
                  Chat langsung dengan tim kami via WhatsApp untuk konsultasi dan bantuan
                  booking.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => window.open(WHATSAPP_URL, '_blank')}
              className="w-full md:w-auto h-14 px-10 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/40 group"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Hubungi via WhatsApp
            </Button>
          </div>
        </div>
      </section>

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
  );
};
