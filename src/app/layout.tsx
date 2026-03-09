import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { FloatingAgent } from "@/components/floating-agent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Dev Hub - منصة التحليل والمختبر الذكي",
  description: "منصة متكاملة لتحليل الكود، اكتشاف البيانات، والمختبر الذكي. نظام الأخطبوط للمعالجة المزدوجة.",
  keywords: ["تحليل كود", "AI", "ذكاء اصطناعي", "مطور", "أمان", "Web3"],
  authors: [{ name: "Smart Dev Hub Team" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <FloatingAgent />
        </ThemeProvider>
      </body>
    </html>
  );
}
