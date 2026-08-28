import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { PreorderProvider } from "@/context/PreorderContext";
import { AuthProvider } from "@/context/AuthContext";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
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
    <html lang="en" className={`${dmSerif.variable} ${jakarta.variable} h-full`}>
      <body className="h-full antialiased">
        <AuthProvider>
          <PreorderProvider>{children}</PreorderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
