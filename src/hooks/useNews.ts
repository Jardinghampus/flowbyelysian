import { useState, useEffect } from 'react';

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

export interface NewsResponse {
  success: boolean;
  articles: NewsArticle[];
  totalResults: number;
  page: number;
  pageSize: number;
}

interface UseNewsOptions {
  query?: string;
  pageSize?: number;
  page?: number;
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
  autoFetch?: boolean;
}

export function useNews({
  query = 'Dubai real estate',
  pageSize = 20,
  page = 1,
  sortBy = 'publishedAt',
  autoFetch = true,
}: UseNewsOptions = {}) {
  const [data, setData] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        pageSize: pageSize.toString(),
        page: page.toString(),
        sortBy,
      });

      const response = await fetch(`/api/news?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Failed to fetch news');
      }
    } catch (err) {
      setError('Network error while fetching news');
      console.error('News fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchNews();
    }
  }, [query, pageSize, page, sortBy, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchNews,
  };
}
