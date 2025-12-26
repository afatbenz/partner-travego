import React, { createContext, useContext, useEffect, useState } from 'react';
import { http } from '@/lib/http';

export type GeneralContentItem = {
  section_tag: string;
  content: string;
  parent?: string;
  type?: string;
  is_active?: boolean;
  list?: unknown;
  [key: string]: unknown;
};

type GeneralContentData = {
  [key: string]: GeneralContentItem[];
};

type GeneralContentResponse = {
  status: string;
  message: string;
  data: GeneralContentData;
  transaction_id: string;
};

type GeneralContentContextType = {
  contents: GeneralContentItem[];
  contentsByParent: Record<string, GeneralContentItem[]>;
  loading: boolean;
  error: string | null;
  getContentByTag: (tag: string) => string | null;
  getContentIn: (parent: string, tag: string) => string | null;
  getListIn: (parent: string, tag: string) => unknown[] | null;
};

const GeneralContentContext = createContext<GeneralContentContextType | undefined>(undefined);

export const GeneralContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contents, setContents] = useState<GeneralContentItem[]>([]);
  const [contentsByParent, setContentsByParent] = useState<Record<string, GeneralContentItem[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        // User requested: /api/content (GET)
        const res = await http.get<GeneralContentResponse>('/api/content');
        const payload = res.data?.data as unknown;
        if (Array.isArray(payload)) {
          const arr = payload as GeneralContentItem[];
          setContents(arr);
          const grouped: Record<string, GeneralContentItem[]> = {};
          for (const item of arr) {
            const key = String(item.parent || 'general');
            grouped[key] = grouped[key] || [];
            grouped[key].push(item);
          }
          setContentsByParent(grouped);
        } else if (payload && typeof payload === 'object') {
          if (
            'section_tag' in (payload as Record<string, unknown>) &&
            'parent' in (payload as Record<string, unknown>)
          ) {
            const item = payload as GeneralContentItem;
            setContents([item]);
            const key = String(item.parent || 'general');
            setContentsByParent({ [key]: [item] });
          } else {
            const map = payload as Record<string, GeneralContentItem[]>;
            setContentsByParent(map);
            const flattened: GeneralContentItem[] = Object.values(map).flat();
            setContents(flattened);
          }
        } else {
          setContentsByParent({});
          setContents([]);
        }
      } catch (err) {
        console.error('Failed to fetch general content:', err);
        setError('Failed to fetch content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const getContentByTag = (tag: string): string | null => {
    const item = contents.find((c) => c.section_tag === tag);
    return item?.content || null;
  };

  const getContentIn = (parent: string, tag: string): string | null => {
    const list = contentsByParent[parent];
    if (!Array.isArray(list)) return null;
    const item = list.find((c) => c.section_tag === tag);
    return item?.content || null;
  };

  const getListIn = (parent: string, tag: string): unknown[] | null => {
    const group = contentsByParent[parent];
    if (!Array.isArray(group)) return null;
    const item = group.find((c) => c.section_tag === tag);
    const value = (item as GeneralContentItem | undefined)?.list as unknown;
    return Array.isArray(value) ? (value as unknown[]) : null;
  };

  return (
    <GeneralContentContext.Provider value={{ contents, contentsByParent, loading, error, getContentByTag, getContentIn, getListIn }}>
      {children}
    </GeneralContentContext.Provider>
  );
};

export const useGeneralContent = () => {
  const context = useContext(GeneralContentContext);
  if (context === undefined) {
    throw new Error('useGeneralContent must be used within a GeneralContentProvider');
  }
  return context;
};
