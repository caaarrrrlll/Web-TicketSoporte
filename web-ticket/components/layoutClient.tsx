"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/context/SidebarContext";
import SessionGuard from "@/components/SessionGuard";
import { Sidebar } from "@/components/Sidebar";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const authRoutes = ["/login", "/register"];
  const hideLayout = authRoutes.includes(pathname);

  return (
    <SidebarProvider>
      <SessionGuard>
        <div className={`flex min-h-screen ${hideLayout ? 'bg-transparent' : 'bg-gray-100'}`}>
          
          {!hideLayout && <Sidebar />}

          <div className="flex-1 flex flex-col">
            <main className={`flex-1 ${hideLayout ? 'p-0' : 'p-6'}`}>
              {children}
            </main>
          </div>
          
        </div>
      </SessionGuard>
    </SidebarProvider>
  );
}