import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';

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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        <Script src="/popup.js" strategy="afterInteractive" />


        <Script
          src="//madurird.com/tag.min.js"
          strategy="afterInteractive"
          data-zone="9636850"
          data-cfasync="false"
        />

        {/* Additional dynamic ad script (groleegni.net) */}
        <Script id="groleegni-script" strategy="afterInteractive">
          {`
            (function(d,z,s){
              s.src='https://'+d+'/401/'+z;
              try {
                (document.body || document.documentElement).appendChild(s);
              } catch(e) {}
            })('groleegni.net',9636911,document.createElement('script'));
          `}
        </Script>


      </body>
    </html>
  );
}
