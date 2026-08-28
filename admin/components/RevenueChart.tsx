"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm shadow-lg"
      style={{ backgroundColor: "#0A2416" }}
    >
      <p className="text-xs font-medium mb-0.5" style={{ color: "#CAEF61" }}>
        {label}
      </p>
      <p className="font-semibold text-white">
        ₹{payload[0].value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export default function RevenueChart({ data }: { data: { day: string; revenue: number }[] }) {
  return (
    <div className="animate-fade-up" style={{ "--i": 4 } as React.CSSProperties}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={32} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid
            vertical={false}
            stroke="#E0DAD1"
            strokeDasharray="0"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 12, fontFamily: "var(--font-geist-sans)" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF", fontSize: 11, fontFamily: "var(--font-geist-sans)" }}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(61,122,82,0.06)", radius: 8 } as object} />
          <Bar dataKey="revenue" fill="#3D7A52" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
