"use client";

import { Sidebar } from "@/components/Sidebar";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/convex/_generated/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  // Assuming worker profiles correspond to the organization context for this app
  const currentWorker = useQuery(api.myFunctions.getCurrentWorker);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (currentWorker === null) {
        // null means no worker profile exists
        router.push("/onboarding/workspace");
      }
    }
  }, [isLoading, isAuthenticated, currentWorker, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
