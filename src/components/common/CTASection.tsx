import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { http } from '@/lib/http';

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  whatsappNumber?: string;
  phoneNumber?: string;
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  title = "Siap Memulai Perjalanan Anda?",
  subtitle = "Hubungi kami sekarang dan dapatkan penawaran terbaik!",
  whatsappNumber = "https://wa.me/62812345678",
  phoneNumber = "tel:02112345678",
  className = ""
}) => {
  const [contactData, setContactData] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await http.get<{ data?: { contact?: any } }>('/api/content');
        const contact = res.data?.data?.contact;
        if (contact) setContactData(contact);
      } catch (err) {
        console.error('Failed to fetch contact content', err);
      }
    };

    fetchContent();
  }, []);

  const whatsappDigits = String(contactData?.company_whatsapp || whatsappNumber || '').replace(/\D/g, '');
  const whatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits}` : whatsappNumber;
  const phoneUrl = whatsappDigits ? `tel:${whatsappDigits}` : phoneNumber;

  return (
    <section className={`pt-10 pb-20 bg-white dark:bg-gray-950 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-blue-600 rounded-2xl overflow-hidden p-8 md:p-16 text-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 50 Q 25 40 50 50 T 100 50 V 100 H 0 Z" fill="white" />
              <path d="M0 60 Q 25 50 50 60 T 100 60 V 100 H 0 Z" fill="white" opacity="0.5" />
            </svg>
          </div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {title}
            </h2>
            <p className="text-blue-50 text-lg opacity-90">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100 rounded-xl px-8 h-12 font-normal flex items-center gap-2"
                onClick={() => window.open(whatsappUrl, '_blank')}
              >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="h-5 w-5" />
                WhatsApp Kami
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white bg-transparent hover:bg-black/10 rounded-xl hover:border-white hover:text-white px-8 h-12 font-normal flex items-center gap-2"
                onClick={() => window.location.href = phoneUrl}
              >
                <Phone className="h-5 w-5" />
                Hubungi Kami
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
