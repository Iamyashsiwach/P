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
  // /book and its chapters are private writing behind a friends-and-family
  // wall and are noindex (see app/book/page.tsx), so they stay out of the
  // sitemap — listing a noindex URL there is a contradictory signal.
  exclude: ['/api/*', '/404', '/500', '/book', '/book/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};
