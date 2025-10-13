module.exports = {
  siteUrl: 'https://yashsiwach.space',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/api/*', '/404', '/500'],
  additionalPaths: async config => {
    const result = [];

    // Add blog listing page
    result.push({
      loc: '/blog',
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    });

    // Add individual blog posts
    const blogPosts = [
      'chapter-1-the-beginning',
      // Add more blog post slugs as they are published
    ];

    blogPosts.forEach(slug => {
      result.push({
        loc: `/blog/${slug}`,
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
