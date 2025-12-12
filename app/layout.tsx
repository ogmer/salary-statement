import "./globals.css";
import { Inter } from "next/font/google";
import React from "react";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://salary-statement.vercel.app"),
  title: "給与明細作成ツール",
  description:
    "テンプレートから給与明細の管理と表示を行うサイトです。自動で計算を行い、データを保存されることはありません。",
  keywords: ["給与明細", "給与計算", "PDF", "給与", "明細書", "給与明細書"],
  authors: [{ name: "給与明細作成ツール" }],
  creator: "給与明細作成ツール",
  publisher: "給与明細作成ツール",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://salary-statement.vercel.app",
    siteName: "給与明細作成ツール",
    title: "給与明細作成ツール",
    description:
      "テンプレートから給与明細の管理と表示を行うサイトです。自動で計算を行い、データを保存されることはありません。",
    images: [
      {
        url: "/header.png",
        width: 1200,
        height: 630,
        alt: "給与明細作成ツール - 給与明細の作成と管理が簡単に",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@salary_tool",
    creator: "@salary_tool",
    title: "給与明細作成ツール",
    description:
      "テンプレートから給与明細の管理と表示を行うサイトです。自動で計算を行い、データを保存されることはありません。",
    images: ["/header.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body
        className={inter.className}
        style={{ backgroundColor: "white", color: "black" }}
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-YGPGFZEF59"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YGPGFZEF59');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
