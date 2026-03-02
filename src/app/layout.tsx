import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GF ビザサポートデスク",
  description: "米国ビザ申請に関するご質問にお答えするチャットボット",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
