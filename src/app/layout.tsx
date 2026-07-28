import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/portfolio/theme-provider";
import { I18nProvider } from "@/lib/i18n/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evan Lab — Creative Coding Playground",
  description:
    "Lab eksperimen kreatif Evan Rasyid Ega Pratama. Interactive coding, physics, 3D, dan UI experiments.",
  keywords: [
    "Evan Rasyid Ega Pratama",
    "Frontend Engineer",
    "Creative Coding",
    "Interactive Lab",
    "Next.js",
    "TypeScript",
    "React",
    "Three.js",
    "Indonesia Developer",
  ],
  authors: [{ name: "Evan Rasyid Ega Pratama" }],
  metadataBase: new URL('https://evan-lab.vercel.app'),
  openGraph: {
    title: "Evan Lab — Creative Coding Playground",
    description:
      "Lab eksperimen kreatif Evan Rasyid Ega Pratama. Interactive coding, physics, 3D, dan UI experiments.",
    type: "website",
    locale: "id_ID",
    url: '/',
    siteName: 'Evan Lab',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Evan Lab — Creative Coding Playground",
    description: "Interactive coding experiments by Evan Rasyid Ega Pratama",
    images: ['/api/og'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
          <Toaster />
          <SonnerToaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
