import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "給与明細サイト",
  description: "給与明細の管理と表示を行うサイトです",
  icons: {
    icon: "/favicon.svg",
  },
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
        {children}
      </body>
    </html>
  );
}
