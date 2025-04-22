import { NextApiRequest, NextApiResponse } from 'next';

const Sitemap = (req: NextApiRequest, res: NextApiResponse) => {
  // Set response headers
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  // Generate the sitemap XML with the correct namespace
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://yashsiwach.space/</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    <url>
      <loc>https://yashsiwach.space/about</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    <url>
      <loc>https://yashsiwach.space/projects</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    <url>
      <loc>https://yashsiwach.space/contact</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    <url>
      <loc>https://yashsiwach.space/resume</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>
  </urlset>`;

  // Send the sitemap
  res.write(sitemap);
  res.end();
};

export default Sitemap;
