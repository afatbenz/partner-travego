import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { useGeneralContent } from '@/contexts/GeneralContentContext';

export const Footer: React.FC = () => {
  const { getContentIn, getListIn } = useGeneralContent();
  const brandNameRaw = getContentIn('general-config', 'brand-name');
  const brandName = brandNameRaw && brandNameRaw.trim() !== '' ? brandNameRaw : 'TraveGo';
  const brandDescRaw = getContentIn('general-config', 'brand-description');
  const brandDesc = brandDescRaw && brandDescRaw.trim() !== ''
    ? brandDescRaw
    : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
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
    <footer className="bg-gray-900 dark:bg-black text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-xl font-bold">{brandName}</span>
            </div>
            <p className="text-gray-400 mb-4">{brandDesc}</p>
            <div className="flex space-x-4">
              {(socialList && socialList.length
                ? socialList
                : []
              ).map((item, idx) => {
                const IconComp = socialIconMap[(item.icon || '').toLowerCase()] || Facebook;
                const url = item.sub_label && item.sub_label.trim() !== '' ? item.sub_label : '#';
                return (
                  <a key={idx} href={url} className="text-gray-400 hover:text-blue-400 transition-colors" aria-label={item.label || 'Social'}>
                    <IconComp className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/catalog" className="block text-gray-400 hover:text-white transition-colors">
                Katalog
              </Link>
              <Link to="/services" className="block text-gray-400 hover:text-white transition-colors">
                Layanan
              </Link>
              <Link to="/team" className="block text-gray-400 hover:text-white transition-colors">
                Tim Kami
              </Link>
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors">
                Kontak
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <div className="space-y-3">
              {(contactList || []).map((item, idx) => {
                const IconComp = contactIconMap[(item.icon || '').toLowerCase()] || MapPin;
                const text = item.sub_label && item.sub_label.trim() !== '' ? item.sub_label : (item.label || '');
                return (
                  <div key={idx} className="flex items-center space-x-3">
                    <IconComp className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-400">{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 {brandName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
