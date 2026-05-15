import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { useGeneralContent } from '@/contexts/GeneralContentContext';

export const Footer: React.FC = () => {
  const { getContentIn, getListIn } = useGeneralContent();
  const brandNameRaw = getContentIn('general-config', 'brand-name');
  const brandName = brandNameRaw && brandNameRaw.trim() !== '' ? brandNameRaw : 'TraveGO';
  const brandDescRaw = getContentIn('general-config', 'brand-description');
  const brandDesc = brandDescRaw && brandDescRaw.trim() !== ''
    ? brandDescRaw
    : 'Partner perjalanan terpercaya Anda untuk eksplorasi Indonesia yang tak terlupakan dengan layanan premium.';
  
  const socialList = getListIn('general-config', 'social-media') as { icon?: string; label?: string; sub_label?: string }[] | null;
  const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    youtube: Youtube,
    linkedin: Linkedin,
  };
  
  const contactList = getListIn('general-config', 'contact') as { icon?: string; label?: string; sub_label?: string }[] | null;
  const contactIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    phone: Phone,
    tel: Phone,
    call: Phone,
    mail: Mail,
    email: Mail,
    address: MapPin,
    location: MapPin,
    'map-pin': MapPin,
  };

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
              {['Tentang Kami', 'Karir', 'Blog', 'FAQ'].map((item) => (
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
                (021) 1234 5678
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-3 shrink-0" />
                info@jelajahi.id
              </li>
              <li className="flex items-start text-gray-400 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-600 mr-3 mt-1.5 shrink-0" />
                Jl. Merdeka No. 10, Jakarta Pusat
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
