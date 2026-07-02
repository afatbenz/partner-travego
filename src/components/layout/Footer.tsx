import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useGeneralContent } from '@/contexts/GeneralContentContext';
import { http } from '@/lib/http';
import { formatPhoneNumber } from '@/lib/utils';

export const Footer: React.FC = () => {
  const { getContentIn } = useGeneralContent();
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

  const brandNameRaw = getContentIn('general-config', 'brand-name');
  const brandName = brandNameRaw && brandNameRaw.trim() !== '' ? brandNameRaw : 'TraveGO';
  const brandDescRaw = getContentIn('general-config', 'brand-description');
  const brandDesc = brandDescRaw && brandDescRaw.trim() !== ''
    ? brandDescRaw
    : 'Partner perjalanan terpercaya Anda untuk eksplorasi Indonesia yang tak terlupakan dengan layanan premium.';

  return (
    <footer className="bg-[#0f172a] text-white py-16 print:hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold tracking-tight text-yellow-200">{brandName}</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              {brandDesc}
            </p>
            <div className="flex space-x-4">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, idx) => (
                <a key={idx} href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Layanan</h3>
            <ul className="space-y-4">
              {['Armada', 'Paket Wisata', 'Sewa Kendaraan', 'Layanan Perusahaan'].map((item) => (
                <li key={item} className="flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-3" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Perusahaan */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Perusahaan</h3>
            <ul className="space-y-4">
              {['Tentang Kami', 'Lacak Pesanan'].map((item) => (
                <li key={item} className="flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-3" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Kontak</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-400 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-3 shrink-0" />
                {contactData?.company_phone === contactData?.company_whatsapp
                  ? formatPhoneNumber(contactData?.company_whatsapp) 
                  : formatPhoneNumber(contactData?.company_phone || contactData?.company_whatsapp || '')}
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-3 shrink-0" />
                {contactData?.company_email_cs || contactData?.company_email || 'info@jelajahi.id'}
              </li>
              <li className="flex items-start text-gray-400 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-3 mt-1.5 shrink-0" />
                {[contactData?.company_address, contactData?.company_city, contactData?.company_province].filter(Boolean).join(', ') || 'Jl. Merdeka No. 10, Jakarta Pusat'}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 Jelajahi Indonesia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
