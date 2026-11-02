import type { Metadata } from "next";
import { Anton, Red_Hat_Display } from "next/font/google";
import "./globals.css";

const display = Anton({ variable: "--font-display-face", subsets: ["latin"], weight: "400" });
const body = Red_Hat_Display({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "700", "900"] });

export const metadata: Metadata = {
  title: "MONOS Client Portal",
  description: "Track your website build with MONOS Technology.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body className={`${display.variable} ${body.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
