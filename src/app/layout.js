import Script from "next/script";
import { Oswald, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://my-teamsports.com";
const SITE_DESCRIPTION =
  "Give your youth sports team a beautiful website in 5 minutes — roster, schedule, stats, photos, and game film. Parents never download an app, create an account, or pay a dime.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "My-Team Sports | Your Team. Your Way.",
    template: "%s | My-Team Sports",
  },
  description: SITE_DESCRIPTION,
  applicationName: "My-Team Sports",
  appleWebApp: {
    capable: true,
    title: "My-Team Sports",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  keywords: [
    "youth sports team website",
    "free team website",
    "team roster app",
    "team schedule maker",
    "youth baseball team site",
    "no app team management",
    "sports team communication",
    "team stats tracker",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "My-Team Sports",
    title: "My-Team Sports | Your Team. Your Way.",
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "My-Team Sports — free youth sports team websites, no app needed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My-Team Sports | Your Team. Your Way.",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport = {
  themeColor: "#0a0e1a",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "My-Team Sports",
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "My-Team Sports",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "My-Team Sports",
      applicationCategory: "SportsApplication",
      operatingSystem: "Web, iOS, Android",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-NPD6LYL7RF" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NPD6LYL7RF');
          `}
        </Script>
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function(){}); }); }`}
        </Script>
      </head>
      <body
        className={`${oswald.variable} ${sourceSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
