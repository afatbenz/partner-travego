import { http } from '@/lib/http';

export const TOUR_PACKAGES_API = '/api/service/tour-packages';

export interface TourPackageApiItem {
  package_id: string;
  package_name: string;
  package_description?: string;
  thumbnail?: string;
  destinations?: string;
  type?: string;
  package_type_label?: string;
  price: number;
  original_price?: number;
  rating?: number;
  review_count?: number;
  location?: string;
  features?: string[];
  duration?: number;
}

export interface TourPackageCatalogItem {
  id: string;
  title: string;
  description: string;
  price: string;
  priceValue: number;
  originalPrice?: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  duration: string;
  features: string[];
  typeLabel: string;
  destinations: string;
  isPopular?: boolean;
  isNew?: boolean;
  discount?: number;
}

interface TourPackagesResponse {
  status: string;
  message?: string;
  data: TourPackageApiItem[];
}

export const formatDestinationsLabel = (destinations: string) => {
  if (!destinations) return '-';
  const parts = destinations.split(',').map((d) => d.trim()).filter(Boolean);
  if (parts.length === 0) return '-';
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  return first.length > 30 ? `${first} + ${parts.length - 1} kota lain` : `${first} + ${parts.length - 1} kota lain`;
};

export const mapTourPackageToCatalogItem = (item: TourPackageApiItem): TourPackageCatalogItem => {
  const destinations = typeof item.destinations === 'string' ? item.destinations : '';
  const location = item.location || destinations.split(',')[0]?.trim() || '-';
  const duration = item.duration ? `${item.duration} Hari` : 'Paket Wisata';
  const discount =
    item.original_price && item.price
      ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
      : undefined;

  return {
    id: item.package_id,
    title: item.package_name,
    description: item.package_description || '',
    price: `Rp ${item.price.toLocaleString('id-ID')}`,
    priceValue: item.price,
    originalPrice: item.original_price
      ? `Rp ${item.original_price.toLocaleString('id-ID')}`
      : undefined,
    image: item.thumbnail || '',
    rating: item.rating ?? 0,
    reviewCount: item.review_count ?? 0,
    location,
    duration,
    features: item.features || [],
    typeLabel: item.package_type_label || item.type || 'Tour Package',
    destinations,
    discount: discount && discount > 0 ? discount : undefined,
  };
};

export const fetchTourPackages = async (): Promise<TourPackageCatalogItem[]> => {
  const res = await http.get<TourPackagesResponse>(TOUR_PACKAGES_API);
  if (res.data?.data && Array.isArray(res.data.data)) {
    return res.data.data.map(mapTourPackageToCatalogItem);
  }
  return [];
};
