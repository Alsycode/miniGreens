"use client";

import dynamic from "next/dynamic";

// Recharts uses browser APIs — load it only on the client
const RevenueChart = dynamic(() => import("./RevenueChart"), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] rounded-xl skeleton-shimmer" />
  ),
});

export default function RevenueChartWrapper({ data }: { data: { day: string; revenue: number }[] }) {
  return <RevenueChart data={data} />;
}
