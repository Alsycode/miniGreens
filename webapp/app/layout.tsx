import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { PreorderProvider } from "@/context/PreorderContext";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini Greens Company | Premium Microgreens Direct From Farm",
  description:
    "Handpicked microgreens grown with care, delivered fresh to your doorstep.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} h-full`}>
      <body className="h-full bg-(--color-bg) antialiased">
        <AuthProvider>
          <PreorderProvider>
            <AnnouncementBar />
            <Navbar />
            {children}
            <Footer />
          </PreorderProvider>
        </AuthProvider>
        <CartDrawer />
      </body>
    </html>
  );
}
