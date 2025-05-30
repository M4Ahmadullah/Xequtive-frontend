"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// PublicRoute is for auth pages that should not be accessible when logged in
// It works with the middleware to ensure users are redirected properly
export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only perform the check once loading is complete
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, they shouldn't access auth pages
        // Instead of an immediate redirect, we use router.push to avoid loops
        // We also check we're not already redirecting to avoid infinite loops
        if (!pathname.includes("?redirecting=true")) {
          router.push("/dashboard?redirecting=true");
        }
      } else {
        // User is not authenticated, mark as checked to render children
        setChecked(true);
      }
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Show loading state while authentication is being checked
  if (isLoading || (!checked && isAuthenticated)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Only render children if not authenticated and check is complete
  return !isAuthenticated || !checked ? children : null;
}
