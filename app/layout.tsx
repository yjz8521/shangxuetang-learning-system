import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const notoSans = Noto_Sans_SC({
  variable: "--font-sans",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif_SC({
  variable: "--font-serif",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/business-learning-visual.png`;

  return {
    title: "商学堂｜经济学 × 会计学长期学习系统",
    description: "为国际贸易、公司经营与投资分析设计的中文经济学和会计学长期课程。每天 60–90 分钟，从零基础走向商业决策。",
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
    },
    openGraph: {
      title: "商学堂｜把知识变成判断力",
      description: "经济学 × 会计学 × 商业应用，52 周系统学习。",
      type: "website",
      images: [{ url: imageUrl, width: 1731, height: 909, alt: "商学堂：经济学、会计学与商业应用长期课程" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "商学堂｜把知识变成判断力",
      description: "经济学 × 会计学 × 商业应用，52 周系统学习。",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${notoSans.variable} ${notoSerif.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
