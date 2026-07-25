import "./globals.css";
import { AppChrome } from "@/components/app-chrome";
import { PwaRegister } from "@/components/pwa-register";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BinaryTree — Learn without limits",
    template: "%s · BinaryTree",
  },
  description: "Offline-first digital skills, Python, machine learning, and entrepreneurship curriculum built for low-bandwidth classrooms.",
  applicationName: "BinaryTree Learning",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BinaryTree",
  },
  icons: {
    icon: "/btlogo.png",
    apple: "/btlogo.png",
  },
  openGraph: {
    title: "BinaryTree — Learn without limits",
    description: "Practical technology education that keeps working when the internet cannot.",
    type: "website",
    siteName: "BinaryTree",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#163a63",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <PwaRegister />
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
