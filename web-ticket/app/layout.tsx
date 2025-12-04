import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutClient from "@/components/layoutClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WebTicket Soporte",
  description: "Panel web para gestión de tickets de soporte",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className + " bg-gray-100"}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
