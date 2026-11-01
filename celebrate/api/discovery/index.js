module.exports = async (req, res) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // CORS - allow all origins for development, should be restricted in production
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS?.split(',') || ['https://celebrate-pink-chi.vercel.app'])
    : ['*'];

  const origin = req.headers.origin;
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, category } = req.body;

    // Input validation
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Sanitize input to prevent injection
    if (typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query format' });
    }
    if (query.length > 500) {
      return res.status(400).json({ error: 'Query too long (max 500 characters)' });
    }

    if (category && typeof category !== 'string') {
      return res.status(400).json({ error: 'Invalid category format' });
    }

    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        results: [],
        notice: 'SerpAPI key not configured. Add SERPAPI_API_KEY environment variable to enable live search.',
      });
    }

    // Construct SerpAPI request
    const searchQuery = category
      ? `${query} ${category} event services`
      : `${query} event venues vendors`;

    const url = new URL('https://serpapi.com/search');
    url.searchParams.append('api_key', apiKey);
    url.searchParams.append('engine', 'google');
    url.searchParams.append('q', searchQuery);
    url.searchParams.append('num', '10');
    url.searchParams.append('hl', 'en');

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SerpAPI error:', errorText);
      return res.status(200).json({
        success: true,
        results: [],
        notice: 'SerpAPI request failed. Service may be unavailable or rate limit reached.',
      });
    }

    const data = await response.json();

    // Extract organic results
    const organicResults = (data.organic_results || []).map((item) => ({
      title: item.title || '',
      link: item.link || '',
      snippet: item.snippet || '',
      source: item.source || '',
    }));

    return res.status(200).json({
      success: true,
      results: organicResults,
      source: 'serpapi',
    });
  } catch (error) {
    console.error('Discovery API error:', error);
    return res.status(200).json({
      success: true,
      results: [],
      notice: 'Search service temporarily unavailable.',
    });
  }
}
