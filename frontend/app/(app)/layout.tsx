import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
 title: "BrandLens - AI Brand Visibility Monitor",
 description: "Track how your brand appears across AI platforms",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en">
 <body className={inter.className}>{children}</body>
 </html>
 );
}
