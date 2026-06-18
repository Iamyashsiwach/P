module.exports = {
  siteUrl: 'https://yashsiwach.in',
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
