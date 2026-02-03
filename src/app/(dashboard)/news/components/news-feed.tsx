'use client';

import { useState } from 'react';
import { useNews, NewsArticle } from '@/hooks/useNews';
import { Search, Calendar, ExternalLink, Filter, RefreshCw, Newspaper } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewsFeed() {
  const [searchQuery, setSearchQuery] = useState('Dubai real estate');
  const [activeQuery, setActiveQuery] = useState('Dubai real estate');
  const [sortBy, setSortBy] = useState<'relevancy' | 'popularity' | 'publishedAt'>('publishedAt');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, loading, error, refetch } = useNews({
    query: activeQuery,
    pageSize: 12,
    page: currentPage,
    sortBy,
  });

  const handleSearch = () => {
    setActiveQuery(searchQuery);
    setCurrentPage(1);
  };

  const quickFilters = [
    { label: 'Dubai Real Estate', query: 'Dubai real estate OR property Dubai' },
    { label: 'Palm Jumeirah', query: 'Palm Jumeirah property OR villa' },
    { label: 'Luxury Villas', query: 'Dubai luxury villa OR mansion' },
    { label: 'Market News', query: 'Dubai property market OR real estate trends' },
    { label: 'Investments', query: 'Dubai real estate investment OR property investment' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="w-full">
      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Search Bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search news articles..."
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>
              Search
            </Button>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quickFilters.map((filter) => (
              <Badge
                key={filter.label}
                variant={activeQuery === filter.query ? 'default' : 'secondary'}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => {
                  setSearchQuery(filter.query);
                  setActiveQuery(filter.query);
                  setCurrentPage(1);
                }}
              >
                {filter.label}
              </Badge>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: 'relevancy' | 'popularity' | 'publishedAt') => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publishedAt">Latest First</SelectItem>
                <SelectItem value="relevancy">Most Relevant</SelectItem>
                <SelectItem value="popularity">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      {data && !loading && (
        <div className="mb-4 text-sm text-muted-foreground">
          Found {data.totalResults.toLocaleString()} articles
        </div>
      )}

      {/* News Grid */}
      {data && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.articles.map((article, index) => (
            <Card
              key={`${article.url}-${index}`}
              className="overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Article Image */}
              {article.urlToImage ? (
                <div className="relative h-48 bg-muted overflow-hidden">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Newspaper className="h-12 w-12 text-white/30" />
                </div>
              )}

              {/* Article Content */}
              <CardContent className="p-5">
                {/* Source and Date */}
                <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                  <Badge variant="outline">{article.source.name}</Badge>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {article.description || 'No description available'}
                </p>

                {/* Author */}
                {article.author && (
                  <p className="text-xs text-muted-foreground mb-3">By {article.author}</p>
                )}

                {/* Read More Link */}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium text-sm"
                >
                  Read full article
                  <ExternalLink className="w-4 h-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {data && !loading && data.articles.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Newspaper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No articles found. Try a different search query.</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.totalResults > 12 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-muted-foreground">
            Page {currentPage} of {Math.ceil(Math.min(data.totalResults, 100) / 12)}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage >= Math.ceil(Math.min(data.totalResults, 100) / 12)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
