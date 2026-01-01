const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:3100';

type Query = Record<string, string | number | boolean | undefined | null>;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  token?: string;
  query?: Query;
};

type HttpResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

function buildUrl(path: string, query?: Query) {
  const base = API_BASE_URL.replace(/\/$/, '');
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.append(key, String(value));
  });
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function parseJson(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return undefined as unknown;
  return res.json();
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
  const url = buildUrl(path, options.query);
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) {
    headers['api-key'] = apiKey;
  }
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  if (options.token) headers['Authorization'] = `Bearer ${options.token}`;
  const init: RequestInit = {
    method: options.method || 'GET',
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  };
  const res = await fetch(url, init);
  const json = await parseJson(res);
  if (!res.ok) {
    const message = typeof json === 'object' && json && 'message' in (json as Record<string, unknown>)
      ? String((json as Record<string, unknown>).message)
      : res.statusText || 'Request failed';

    if (res.status === 401 && message === 'Organization not found or invalid') {
      window.dispatchEvent(new Event('invalid-api-key'));
      // Return a promise that never resolves to halt execution and avoid error logs
      return new Promise(() => {});
    }

    throw new Error(message);
  }
  return { data: json as T, status: res.status, headers: res.headers };
}

export const http = {
  get<T = unknown>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'GET' });
  },
  post<T = unknown>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'POST', body });
  },
  put<T = unknown>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'PUT', body });
  },
  patch<T = unknown>(path: string, body?: unknown, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'PATCH', body });
  },
  delete<T = unknown>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
};

export { API_BASE_URL };

export type FleetCore = {
  fleet_id: string;
  fleet_type: string;
  fleet_name: string;
  capacity: number;
  engine: string;
  body: string;
  thumbnail: string | null;
  created_at: string;
  created_by: string;
  updated_at: string | null;
  updated_by: string | null;
};

export type FleetFacility = {
  uuid: string;
  fleet_id: string;
  facility: string;
};

export type FleetPickup = {
  uuid: string;
  city_id: string | number;
  city_name?: string;
};

export type FleetAddon = {
  uuid: string;
  addon_name: string;
  addon_desc: string;
  addon_price: number;
};

export type FleetPricing = {
  uuid: string;
  duration: string;
  rent_type: number | string;
  price: number;
  disc_amount: number | null;
  disc_price: number | null;
  rent_type_label?: string;
};

export type FleetImage = {
  uuid: string;
  path_file: string;
};

export type FleetDetailResponse = {
  fleet: FleetCore;
  facilities: FleetFacility[];
  pickup: FleetPickup[];
  addon: FleetAddon[];
  pricing: FleetPricing[];
  images: FleetImage[];
};

export const RentTypeLabel: Record<number, string> = {
  1: 'City Tour',
  2: 'Overland',
  3: 'Pickup / Drop Only',
};

export async function getFleetDetail(fleetId: string, token?: string) {
  const res = await http.post<FleetDetailResponse>('/api/partner/services/fleet/detail', { fleet_id: fleetId }, { token });
  const data = res.data;
  const pricing = Array.isArray(data?.pricing)
    ? data.pricing.map(p => ({
        ...p,
        rent_type_label:
          typeof p.rent_type === 'number'
            ? RentTypeLabel[p.rent_type] || String(p.rent_type)
            : String(p.rent_type),
      }))
    : [];
  return { ...data, pricing } as FleetDetailResponse;
}
