import type { Metadata, Viewport } from "next";
import { Patrick_Hand, Caveat } from "next/font/google";
import "./globals.css";
import { PWAProvider } from "@/components/pwa-provider";
import { PWAInstallBanner } from "@/components/pwa-install-banner";

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-handwriting",
});

const caveat = Caveat({
  weight: ["500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DAPAJO CAMPUS : student-only dating & connection platform",
  description: "DAPAJO CAMPUS : student-only dating & connection platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DAPAJO CAMPUS",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f4ee",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${patrickHand.variable} ${caveat.className}`}>
      <body suppressHydrationWarning className="min-h-screen bg-[#f7f4ee] text-stone-900 antialiased selection:bg-rose-500 selection:text-white">
        <PWAProvider>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
            <PWAInstallBanner />
          </div>
        </PWAProvider>
      </body>
    </html>
  );
}
