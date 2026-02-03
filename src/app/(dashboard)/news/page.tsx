import NewsFeed from './components/news-feed';

export default function NewsPage() {
  return (
    <>
      {/* Page Title and Description */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">News</h1>
          <p className="text-muted-foreground">Stay updated with the latest Dubai real estate news</p>
        </div>
      </div>

      <div className="@container/main px-4 lg:px-6">
        <NewsFeed />
      </div>
    </>
  );
}
