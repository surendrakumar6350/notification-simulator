import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMS Bomber",
  description: "SMS BOMBER is a tool that sends continuous messages to your friends or family and pranks them. You are on the best smsbombing website. You can use this tool on any device.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Analytics configuration from environment variables
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const gaScriptUrl = process.env.NEXT_PUBLIC_GA_SCRIPT_URL;
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Google Analytics - only load if environment variables are provided */}
        {gaId && gaScriptUrl && (
          <>
            <Script
              src={`${gaScriptUrl}?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
            </Script>
          </>
        )}

        {/* Umami Analytics - only load if environment variables are provided */}
        {umamiScriptUrl && umamiWebsiteId && (
          <Script
            src={umamiScriptUrl}
            data-website-id={umamiWebsiteId}
            strategy="lazyOnload"
          />
        )}

        {children}
      </body>
    </html>
  );
}
