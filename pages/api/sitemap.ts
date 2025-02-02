import { NextApiRequest, NextApiResponse } from 'next';

const Sitemap = () => {
  return null; // This component does not render anything
};

export const getServerSideProps = async ({ res }: { res: NextApiResponse }) => {
  // Set response headers
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  // Generate the sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap-image/1.1">
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

  return {
    props: {},
  };
};

export default Sitemap; 