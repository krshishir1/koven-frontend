"use client";

import { useAuthStore } from "@/hooks/stores";
import { useEffect } from "react";

export default function AuthInitializer() {
  const checkSession = useAuthStore((s) => s.checkSession);
  const isAuthChecked = useAuthStore((s) => s.isAuthChecked);

  useEffect(() => {
    // Only run the check if it hasn't been run before
    if (!isAuthChecked) {
      checkSession();
    }
  }, [checkSession, isAuthChecked]);

  return null; // This component renders nothing
}