import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THINK5 — Personal Growth OS",
  description: "考える。決める。作る。伝える。自分を知る。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
