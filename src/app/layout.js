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
  },
  twitter: {
    card: "summary_large_image",
    title: "My-Team Sports | Your Team. Your Way.",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-NPD6LYL7RF" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NPD6LYL7RF');
          `}
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
