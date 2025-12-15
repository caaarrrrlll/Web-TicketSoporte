"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ["/login", "/register"];

  useEffect(() => {
    const user = localStorage.getItem("sessionUser");
    if (!user && !publicRoutes.includes(pathname)) {
      router.push("/login");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
