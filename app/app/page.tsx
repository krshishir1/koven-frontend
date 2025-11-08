
import { Suspense } from "react";
import DashboardLayout from "@/components/DashboardLayout";

export default function Page({
    searchParams,
  }: {
    searchParams: Promise<{ idea?: string }>
  }) {
    return (
      <Suspense fallback={<>...</>}>
        <DashboardLayout searchParams={searchParams} />
      </Suspense>
    )
  }




