"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/context/SidebarContext";
import { Sidebar } from "@/components/Sidebar";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const noSidebarRoutes = ["/login", "/register"];
  const hideSidebar = noSidebarRoutes.includes(pathname);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-100">
        {!hideSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col bg-gray-100">
          <main className="flex-1 p-6">{children}</main>
        </div>

      </div>
    </SidebarProvider>
  );
}
