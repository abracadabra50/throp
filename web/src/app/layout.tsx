import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "throp - claude's chaotic cousin",
  description: "hi im throp 🫠 no filter, no fluff, just straight facts with attitude fr. The unhinged AI that says what claude is thinking but too polite to say.",
  keywords: ["throp", "ai", "chat", "gen z", "memes", "hot takes", "$throp", "claude", "chatbot", "solana"],
  authors: [{ name: "Zishan" }],
  
  // Open Graph (Facebook, LinkedIn, Discord)
  openGraph: {
    title: "throp - claude's chaotic cousin",
    description: "hi im throp 🫠 no filter, no fluff, just straight facts with attitude fr",
    type: "website",
    locale: "en_GB",
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://chat.throp.ai',
    siteName: "throp",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "throp - claude's chaotic cousin"
      }
    ]
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@askthrop",
    creator: "@askthrop",
    title: "throp - no cap, just chaos",
    description: "just thropin it 🫠 powered by $throp | The AI that tells it like it is fr fr",
    images: ["/twitter-image"]
  },
  
  // Additional metadata
  applicationName: "throp",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // Base URL for absolute image paths
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://chat.throp.ai'),
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification (add your own IDs if needed)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  
  // Alternate languages (if you support multiple)
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffb088" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="throp" />
        <link rel="apple-touch-icon" href="/apple-icon" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
