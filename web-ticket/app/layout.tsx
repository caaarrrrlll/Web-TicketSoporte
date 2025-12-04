import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WebTicket Soporte",
  description: "Panel web para gestión de tickets de soporte",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className + " bg-gray-100 min-h-screen"}>
        <SidebarProvider>
          <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex flex-col flex-1 bg-gray-100">
              <main className="flex-1 p-6">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
