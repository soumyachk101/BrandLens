import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-family-inter" });

export const metadata: Metadata = {
 title: "BrandLens - AI-Powered Brand Visibility",
 description: "Monitor and analyze your brand's visibility across AI-generated responses",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en" suppressHydrationWarning>
 <body className={inter.variable}><div className="antialiased">{children}</div></body>
 </html>
 );
}
