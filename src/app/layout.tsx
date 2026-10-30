import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "the gymnasium",
  description: "Metro gym session tracker for Akash & Achini",
  openGraph: {
    title: "the gymnasium",
    description: "Metro gym session tracker for Akash & Achini",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "the gymnasium",
    description: "Metro gym session tracker for Akash & Achini",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "the gymnasium",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={outfit.className} data-theme="dark">
      <body className="min-h-dvh bg-[var(--metro-bg)] text-[var(--metro-fg)] antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
