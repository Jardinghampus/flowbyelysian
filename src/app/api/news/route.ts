import { NextResponse } from 'next/server';

const NEWS_API_KEY = process.env.NEWS_API_KEY || '90621552af1849e4b107c014ba78ae68';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'Dubai real estate';
  const pageSize = searchParams.get('pageSize') || '20';
  const page = searchParams.get('page') || '1';
  const sortBy = searchParams.get('sortBy') || 'publishedAt';

  try {
    const response = await fetch(
      `${NEWS_API_BASE_URL}/everything?` +
        new URLSearchParams({
          q: query,
          language: 'en',
          sortBy: sortBy,
          pageSize: pageSize,
          page: page,
          apiKey: NEWS_API_KEY,
        }),
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      articles: data.articles,
      totalResults: data.totalResults,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch news articles',
        articles: [],
        totalResults: 0,
      },
      { status: 500 }
    );
  }
}
