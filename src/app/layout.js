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

export const metadata = {
  title: "My-Team Sports | Your Team. Your Way.",
  description: "Give your team a home on the web. Rosters, schedules, photos, and team communication for youth sports teams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${oswald.variable} ${sourceSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}