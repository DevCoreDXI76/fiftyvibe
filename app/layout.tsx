import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from "@/components/google-analytics";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  preload: false,
});

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fiftyvibe.kr"),
  title: "피프티바이브 — 퇴직연금 계산 도구",
  description:
    "50세 1인 개발자(피프티바이브)가 만드는 퇴직소득세·연금수령·DB/DC 전환 계산 도구",
  verification: {
    google: "_Jlo-jkTQxIpzqeac4CvgYERGhW5xx7WA9pfJKqwGwI",
    other: {
      "naver-site-verification": "b154c0dc4ab57a91ee3536694bb1580461ef0611",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${jetBrainsMono.variable} ${pretendard.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
