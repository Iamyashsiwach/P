import type { Metadata } from "next";
import { ReactNode } from "react";
// import localFont from "next/font/local";
import "./globals.css";
import React from "react";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  metadataBase: new URL('https://yashsiwach.space'),
  title: "Yash Siwach - Portfolio",
  description: "Welcome to Yash Siwach's portfolio. Explore my projects, skills, and achievements.",
  keywords: "Yash Siwach, portfolio, web developer, UI/UX designer, projects, frontend developer, software engineer, web design",
  openGraph: {
    title: "Yash Siwach - Portfolio",
    description: "Explore the portfolio of Yash Siwach, a skilled web developer and UI/UX designer.",
    url: "https://yashsiwach.space",
    siteName: "Yash Siwach",
    images: [
      {
        url: "/Hero_img.jpeg", // Replace with your image URL
        width: 800,
        height: 600,
        alt: "Yash Siwach Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yash Siwach - Portfolio",
    description: "Explore the portfolio of Yash Siwach, a skilled web developer and UI/UX designer.",
    images: [
      {
        url: "/Hero_img.jpeg", // Replace with your image URL
      },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://yashsiwach.space" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Yash Siwach",
              "url": "https://yashsiwach.space",
              "sameAs": [
                "https://twitter.com/iamyashsiwach",
                "https://linkedin.com/in/yash-siwach",
                "https://github.com/iamyashsiwach"
              ],
                  "jobTitle": "Frontend Developer",
              "worksFor": {
                "@type": "Organization",
                "name": "Freelancer"
              },
                    "jobTitle": "UI/UX Designer",
              "worksFor": {
                "@type": "Organization",
                "name": "Freelancer"
              },
            }
          `}
        </script>
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Yash Siwach - Portfolio",
              "url": "https://yashsiwach.space",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://yashsiwach.space/?s={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          `}
        </script>
      </head>
      <body className="bg-background text-foreground">
        <React.StrictMode>
          {children}
        </React.StrictMode>
      </body>
    </html>
  );
}
