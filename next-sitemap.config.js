module.exports = {
  // Must match the domain the site actually serves from — yashsiwach.in
  // (no www) 307s to this one, and a sitemap index whose child <loc>
  // points at a redirecting URL is exactly what Search Console reports as
  // "Couldn't fetch": Google's sitemap-index fetcher doesn't reliably
  // follow redirects for the sitemaps it references.
  siteUrl: 'https://www.yashsiwach.in',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/api/*', '/404', '/500'],
  additionalPaths: async config => {
    const result = [];

    // Add book listing page
    result.push({
      loc: '/book',
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    });

    // Keep in sync with published slugs in app/book/lib/book-data.ts
    const bookPostSlugs = ['Understanding', 'The-Beginning'];

    bookPostSlugs.forEach(slug => {
      result.push({
        loc: `/book/${slug}`,
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      });
    });

    return result;
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};
