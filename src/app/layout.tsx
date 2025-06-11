import type { Metadata, Viewport } from "next";
// import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClientLayout } from "@/components/ClientLayout";
import siteConfig from "../lib/site-config";

// 暂时使用系统字体避免 Turbopack 字体问题
// const inter = Inter({
//   subsets: ["latin"],
//   variable: "--font-inter",
//   display: "swap",
//   preload: true,
// });

// 从配置文件中获取元数据
const configMetadata = siteConfig.site.metadata || {};

export const metadata: Metadata = {
  title: configMetadata.title || "个人导航站",
  description: configMetadata.description || "Personal Navigation Hub - 个人导航和服务管理平台",
  keywords: configMetadata.keywords || "导航, 个人, 服务, 管理, navigation, personal, dashboard",
  authors: [{ name: configMetadata.author || "Homepage" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={configMetadata.language || "zh-CN"} className="h-full">
      <body className="font-sans antialiased h-full">
        <ThemeProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
