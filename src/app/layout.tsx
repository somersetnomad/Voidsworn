import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel, Cinzel_Decorative } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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

export const metadata: Metadata = {
  title: "VOIDSWORN — Pact of the Fallen Star",
  description:
    "A cosmic roguelite of pact magic, eldritch invocations and dark bargains. Swear yourself to a power from beyond the sky and face the star-dragon at the bottom of the void.",
  keywords: ["voidsworn", "warlock", "roguelite", "pact magic", "eldritch blast", "cosmic horror", "tactical game"],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "VOIDSWORN — Pact of the Fallen Star",
    description: "Sign the pact. Fall through the stars. Slay the dragon of a dying sun.",
    type: "website",
  },
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
        <Toaster />
      </body>
    </html>
  );
}
