import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 影视对话游戏制作台",
  description: "面向 Ren'Py MVP 的网页可视化创作台"
};

/**
 * Provides the root HTML shell shared by every app route.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
