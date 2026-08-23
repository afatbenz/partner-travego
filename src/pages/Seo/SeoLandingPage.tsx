import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, MapPin } from 'lucide-react';
import { ArmadaCard } from '@/components/cards/ArmadaCard';
import { CTASection } from '@/components/common/CTASection';
import { InquirySection } from '@/components/common/InquirySection';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useFleetList, FleetListItem } from '@/hooks/useFleetList';
import type { SeoLandingConfig } from '@/seo/landingPages';

const mapToCard = (fleet: FleetListItem) => {
  const displayUom = fleet.duration ? `${fleet.duration} ${fleet.uom}` : fleet.uom;
  return {
    id: fleet.fleet_id,
    name: fleet.fleet_name,
    type: fleet.fleet_type_label,
    capacity: `${fleet.capacities} Penumpang`,
    price: `Rp ${fleet.price.toLocaleString('id-ID')}/${displayUom}`,
    originalPrice:
      fleet.discount_type !== null && fleet.original_price
        ? `Rp ${fleet.original_price.toLocaleString('id-ID')}/${fleet.uom}`
        : '',
    image: fleet.thumbnail,
    rating: fleet.rating || 0,
    reviews: fleet.reviews ? fleet.reviews.length : 0,
    features:
      fleet.facilities && fleet.facilities.length > 0
        ? fleet.facilities.map((f) => f.facility)
        : fleet.body
          ? [fleet.body]
          : ['AC', 'Audio System'],
    location: `${fleet.cities?.[0] ?? ''} ${(fleet.cities?.length ?? 0) > 1 ? `(+ ${(fleet.cities?.length ?? 0) - 1} kota lainnya)` : ''}`,
    pickupAreas: fleet.cities || [],
    transmission: 'Manual',
    fuel: 'Bensin',
    year: fleet.production_year.toString(),
    productionYear: fleet.production_year,
    badge: fleet.discount_value ? 'Discount' : 'New',
    discount: fleet.discount_value ? `-${fleet.discount_value}%` : '',
    rawPrice: fleet.price,
  };
};

const FAQSchema = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

const BreadcrumbSchema = (config: SeoLandingConfig) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://calistaprima.com/' },
    { '@type': 'ListItem', position: 2, name: config.keyword, item: `https://calistaprima.com${config.path}` },
  ],
});

export const SeoLandingPage: React.FC<{ config: SeoLandingConfig }> = ({ config }) => {
  const { loading, filterBy } = useFleetList();

  usePageMeta({
    title: config.title,
    description: config.metaDescription,
    canonicalPath: config.path,
    jsonLd: [FAQSchema(config.faqs), BreadcrumbSchema(config)],
  });

  const fleets = useMemo(() => filterBy(config.typeTokens, config.city), [filterBy, config]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-24">
        <ol className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link to="/" className="hover:text-blue-600">Home</Link>
          </li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          <li aria-current="page" className="text-blue-600 font-medium">{config.keyword}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            {config.h1}
          </h1>
          <div className="space-y-4 max-w-3xl">
            {config.intro.map((p, i) => (
              <p key={i} className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-1 w-12 bg-blue-600 rounded-full" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Armada {config.city}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-500">Menyiapkan Armada...</p>
          </div>
        ) : fleets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fleets.map((fleet) => (
              <ArmadaCard key={fleet.fleet_id} armada={mapToCard(fleet)} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <MapPin className="h-10 w-10 mx-auto text-blue-500 mb-3" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              Armada {config.keyword} sedang diperbarui.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Hubungi kami untuk ketersediaan terbaru.
            </p>
            <Link
              to="/contact"
              className="inline-block mt-4 px-6 py-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Hubungi Kami
            </Link>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-1 w-12 bg-blue-600 rounded-full" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pertanyaan Seputar {config.keyword}
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {config.faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <InquirySection />
      <CTASection />

      {/* Breadcrumb back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pb-10">
        <Link
          to="/armada"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          Lihat Semua Armada
        </Link>
      </div>
    </div>
  );
};

export default SeoLandingPage;
