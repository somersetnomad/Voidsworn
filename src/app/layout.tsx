import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cinzel, Cinzel_Decorative } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
});

const cinzelDeco = Cinzel_Decorative({
  variable: "--font-cinzel-deco",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const base = process.env.PAGES_BASE_PATH ?? "";

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: `${base}/icon.svg`, type: "image/svg+xml" },
      { url: `${base}/favicon.ico`, sizes: "48x48" },
    ],
    shortcut: `${base}/favicon.ico`,
    apple: { url: `${base}/apple-touch-icon.png`, sizes: "180x180" },
  },
  title: "VOIDSWORN — Pact of the Fallen Star",
  description:
    "A cosmic roguelite of pact magic, eldritch invocations and dark bargains. Swear yourself to a power from beyond the sky and face the star-dragon at the bottom of the void.",
  keywords: ["voidsworn", "warlock", "roguelite", "pact magic", "eldritch blast", "cosmic horror", "tactical game"],
  openGraph: {
    title: "VOIDSWORN — Pact of the Fallen Star",
    description: "Sign the pact. Fall through the stars. Slay the dragon of a dying sun.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0716",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${cinzelDeco.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
