import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Toaster } from "@/components/ui/sonner"
import { I18nProvider } from "@/components/i18n-provider"
import "./globals.css";

export const metadata: Metadata = {
  title: "Ministry of Health & Human Services - Federal Government of Somalia",
  description: "Official health services portal for citizens to access medical certificates, health permits, and government health services",
  keywords: ["health", "ministry", "somalia", "government", "medical", "services", "certificates"],
  authors: [{ name: "Ministry of Health & Human Services" }],
  icons: {
    icon: [
      {
        url: "/Images/logo1.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    shortcut: "/Images/logo1.png",
    apple: "/Images/logo1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/Images/logo1.png?v=1" type="image/png" />
        <link rel="shortcut icon" href="/Images/logo1.png?v=1" type="image/png" />
        <link rel="apple-touch-icon" href="/Images/logo1.png?v=1" />
      </head>
      <body
        className="font-sans antialiased"
        suppressHydrationWarning
      >
        <I18nProvider>
          <div className="min-h-screen bg-background text-foreground">
            {children}
          </div>
        </I18nProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}