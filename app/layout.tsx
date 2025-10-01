import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://catvsdog.tgeo.dev"),
  title: {
    default: "Cat vs Dog",
    template: "%s | Cat vs Dog",
  },
  description:
    "Cat vs Dog. Who wins?",
  openGraph: {
    title: "Cat vs Dog",
    description:
      "Cat vs Dog. Who wins?",
    url: "/",
    siteName: "Cat vs Dog",
    type: "website",
    images: [
      {
        url: "/social.png",
        width: 1200,
        height: 630,
        alt: "Cat vs Dog voting interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cat vs Dog",
    description:
      "Cat vs Dog. Who wins?",
    images: ["/social.png"],
  },
  icons: {
    icon: "/paw.ico",
    shortcut: "/paw.ico",
    apple: "/paw.ico",
  },
  keywords: [
    "cat vs dog",
    "convex",
    "real-time voting",
    "next.js",
    "goldfish easter egg",
  ],
  authors: [{ name: "Thomas Georgiadis" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
