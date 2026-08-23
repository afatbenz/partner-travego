import { useCallback, useEffect, useState } from 'react';
import { http } from '@/lib/http';

export interface FleetListItem {
  fleet_id: string;
  fleet_name: string;
  fleet_type: string;
  fleet_type_label: string;
  capacity: number;
  capacities: string;
  production_year: number;
  engine: string;
  body: string;
  description: string;
  thumbnail: string;
  original_price: number;
  uom: string;
  discount_type: string | null;
  discount_value: number | null;
  price: number;
  duration?: number;
  facilities?: { facility: string }[];
  cities?: string[];
  rating?: number;
  reviews?: { star: number; review: string }[];
}

interface FleetResponse {
  status: string;
  message: string;
  data: FleetListItem[];
  transaction_id: string;
}

let cache: FleetListItem[] | null = null;
let cachePromise: Promise<FleetListItem[]> | null = null;

async function fetchAll(): Promise<FleetListItem[]> {
  if (cache) return cache;
  if (cachePromise) return cachePromise;
  cachePromise = (async () => {
    const acc: FleetListItem[] = [];
    let page = 1;
    const perPage = 100;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await http.get<FleetResponse>(`/api/service/fleet?per_page=${perPage}&page=${page}`);
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      acc.push(...items);
      if (items.length < perPage) break;
      page += 1;
    }
    cache = acc;
    return acc;
  })();
  return cachePromise;
}

export function useFleetList() {
  const [items, setItems] = useState<FleetListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAll()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch(() => {
        // Prerender / network error → keep empty list; pages render SEO shell.
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filterBy = useCallback((typeTokens: string[], city: string) => {
    const cityLower = city.toLowerCase();
    return items.filter((f) => {
      const label = (f.fleet_type_label ?? f.fleet_type ?? '').toLowerCase();
      const typeMatch = typeTokens.some((t) => label.includes(t.toLowerCase()));
      const cityMatch = (f.cities ?? []).some((c) => c.toLowerCase().includes(cityLower));
      return typeMatch && cityMatch;
    });
  }, [items]);

  return { items, loading, filterBy };
}
