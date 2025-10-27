import { NextApiRequest, NextApiResponse } from 'next';
import { getBookPosts } from '@/app/book/lib/book-data';

const Sitemap = (req: NextApiRequest, res: NextApiResponse) => {
  // Set response headers
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  // Get all published book posts
  const bookPosts = getBookPosts();

  // Generate book post URLs
  const bookUrls = bookPosts
    .map(
      post => `
    <url>
      <loc>https://yashsiwach.space/book/${post.slug}</loc>
      <lastmod>${post.date}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>`
    )
    .join('');

  // Generate the sitemap XML with the correct namespace
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://yashsiwach.space/</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>https://yashsiwach.space/book</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>${bookUrls}
  </urlset>`;

  // Send the sitemap
  res.write(sitemap);
  res.end();
};

export default Sitemap;
