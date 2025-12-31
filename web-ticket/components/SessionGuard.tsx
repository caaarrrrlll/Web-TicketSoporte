"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isChecking, setIsChecking] = useState(true);

  const publicRoutes = ["/login", "/register"];

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !publicRoutes.includes(pathname)) {
        router.push("/login");
      } 
      
      setIsChecking(false);
    };

    checkSession();
  }, [pathname, router]);

  return <>{children}</>;
}