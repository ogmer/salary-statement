import "./globals.css";
import { Inter } from "next/font/google";
import React from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // FOIT (Flash of Invisible Text) を防ぐ
  preload: true, // フォントをプリロード
});

export const metadata = {
  metadataBase: new URL("https://salary-statement.vercel.app"),
  title: {
    default: "給与明細作成ツール | 無料オンライン給与計算・PDF出力",
    template: "%s | 給与明細作成ツール",
  },
  description:
    "無料で使える給与明細作成ツール。支給額・控除額を入力するだけで自動計算し、PDF出力も可能。データは保存されず安全。個人事業主・中小企業の給与管理に最適。",
  keywords: [
    "給与明細",
    "給与計算",
    "給与明細書",
    "給与明細 作成",
    "給与明細 PDF",
    "給与明細 無料",
    "給与 計算ツール",
    "給与明細 テンプレート",
    "給与管理",
    "給与明細書 作成",
    "オンライン給与計算",
    "給与明細 自動計算",
    "個人事業主 給与",
    "中小企業 給与",
  ],
  authors: [{ name: "給与明細作成ツール", url: "https://salary-statement.vercel.app" }],
  creator: "給与明細作成ツール",
  publisher: "給与明細作成ツール",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://salary-statement.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://salary-statement.vercel.app",
    siteName: "給与明細作成ツール",
    title: "給与明細作成ツール | 無料オンライン給与計算・PDF出力",
    description:
      "無料で使える給与明細作成ツール。支給額・控除額を入力するだけで自動計算し、PDF出力も可能。データは保存されず安全。個人事業主・中小企業の給与管理に最適。",
    images: [
      {
        url: "/header.png",
        width: 1200,
        height: 630,
        alt: "給与明細作成ツール - 無料オンライン給与計算・PDF出力",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@salary_tool",
    creator: "@salary_tool",
    title: "給与明細作成ツール | 無料オンライン給与計算・PDF出力",
    description:
      "無料で使える給与明細作成ツール。支給額・控除額を入力するだけで自動計算し、PDF出力も可能。データは保存されず安全。",
    images: ["/header.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/manifest.json",
  category: "business",
  applicationName: "給与明細作成ツール",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "給与明細作成ツール",
    description:
      "無料で使える給与明細作成ツール。支給額・控除額を入力するだけで自動計算し、PDF出力も可能。データは保存されず安全。",
    url: "https://salary-statement.vercel.app",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    featureList: [
      "給与明細の自動計算",
      "PDF出力機能",
      "データ非保存（プライバシー保護）",
      "支給項目・控除項目の管理",
      "勤怠情報の入力",
      "差引支給額の自動計算",
    ],
    author: {
      "@type": "Organization",
      name: "給与明細作成ツール",
      url: "https://salary-statement.vercel.app",
    },
    inLanguage: "ja",
    potentialAction: {
      "@type": "UseAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://salary-statement.vercel.app",
      },
    },
  };

  return (
    <html lang="ja">
      <head>
        {/* 構造化データ（JSON-LD） */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
        />
      </head>
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
        <Analytics />
      </body>
    </html>
  );
}
