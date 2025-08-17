import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "throp",
  description: "hi im throp 🫠 the dumber cousin of claude",
  keywords: ["throp", "ai", "meme", "orange", "chat"],
  authors: [{ name: "Zishan" }],
  openGraph: {
    title: "throp",
    description: "hi im throp 🫠",
    type: "website",
    locale: "en_GB",
    siteName: "throp",
  },
  twitter: {
    card: "summary_large_image",
    title: "throp",
    description: "just thropin it",
    creator: "@throp",
  },
  icons: {
    icon: "/throp.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: '"Comic Sans MS", "Comic Neue", cursive, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
