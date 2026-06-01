import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const serif = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CS Policy RAG",
  description: "한국 소비자 상담 정책 기반 고객지원 RAG MVP",
};

const navItems = [
  { href: "/chat", label: "RAG 상담" },
  { href: "/dataset", label: "데이터셋" },
  { href: "/admin", label: "관리자" },
  { href: "/graph", label: "GraphRAG" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${serif.variable}`}>
      <body className="font-sans antialiased">
        <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/95 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-5">
            <Link href="/" className="font-serif text-2xl font-normal tracking-normal text-ink">
              CS Policy RAG
            </Link>
            <nav className="hidden items-center gap-6 text-[15px] font-medium text-ink md:flex">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-body">
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/chat"
              className="pill bg-[#292524] px-5 py-2.5 text-[15px] font-medium leading-none text-white"
            >
              데모 시작
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
