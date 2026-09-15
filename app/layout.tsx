import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Msiic Club Registration",
    template: "%s | Msiic Club Registration",
  },
  description:
    "Register for your college club at Msiic Club Registration. Join one of 13 exciting clubs and be part of the action!",
  robots: { index: false, follow: false }, // Event-only app — no public indexing
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#07070f] text-[#f0f0ff] font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
