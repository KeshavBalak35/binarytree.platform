import "./globals.css";
import "./handmade.css";
import { AppChrome } from "@/components/app-chrome";
import { PwaRegister } from "@/components/pwa-register";
import { MotionController } from "@/components/motion-controller";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Patchwork — Useful learning, piece by piece",
    template: "%s · Patchwork",
  },
  description: "Offline-first digital skills, Python, machine learning, and entrepreneurship curriculum built for low-bandwidth classrooms.",
  applicationName: "Patchwork Learning",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Patchwork",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Patchwork — Useful learning, piece by piece",
    description: "Practical technology education that keeps working when the internet cannot.",
    type: "website",
    siteName: "Patchwork",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Patchwork — Useful learning, piece by piece." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Patchwork — Useful learning, piece by piece",
    description: "Practical technology education that keeps working when the internet cannot.",
    images: ["/og.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14395b",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <PwaRegister />
        <MotionController />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
