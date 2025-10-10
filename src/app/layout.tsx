// src/app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shoes4Us",
  description: "Toko sepatu online modern dan stylish.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body
        className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}
      >
        {/* Wrapper utama seluruh aplikasi */}
        <main className="flex flex-col min-h-screen">{children}</main>
      </body>
    </html>
  );
}
