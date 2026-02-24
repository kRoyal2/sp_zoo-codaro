"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SeedProvider({ children }: { children: React.ReactNode }) {
  const isSeeded = useQuery(api.seed.isSeeded);
  const seedData = useMutation(api.seed.seedData);

  useEffect(() => {
    if (isSeeded === false) {
      seedData();
    }
  }, [isSeeded, seedData]);

  return <>{children}</>;
}
