"use client";

import { useState, useTransition } from "react";
import { CheckCircle, MapPin, Clock } from "@phosphor-icons/react";
import type { Database } from "@mobile/database";
import { markOrderDelivered } from "@/app/dashboard/(protected)/delivery/actions";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"] & {
  order_items: Database["public"]["Tables"]["order_items"]["Row"][];
  profiles: { full_name: string; email: string | null } | null;
  addresses: Database["public"]["Tables"]["addresses"]["Row"] | null;
};

type DeliverySlot = { time: string; deliveries: OrderRow[] };

function DeliveryRow({ order, onDeliver }: {
  order: OrderRow;
  onDeliver: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const done = order.status === "delivered";
  const customerName = order.profiles?.full_name ?? order.addresses?.full_name ?? "—";

  function handleDeliver() {
    startTransition(() => onDeliver(order.id));
  }

  const itemsSummary = order.order_items
    .map((i) => `${i.product_name} ×${i.quantity}`)
    .join(", ");

  return (
    <div
      className={`flex items-start justify-between gap-4 px-6 py-4 transition-all duration-400
        ${done ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Status indicator */}
        <div className={`mt-0.5 flex-shrink-0 transition-all duration-300 ${done ? "text-emerald-500" : "text-slate-300"}`}>
          <CheckCircle size={20} weight={done ? "fill" : "regular"} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold text-sm ${done ? "line-through text-slate-400" : "text-[#0A2416]"}`}>
              {customerName}
            </p>
            <span className="font-mono text-[10px] text-slate-400">{order.order_number}</span>
          </div>

          {order.addresses && (
            <div className="flex items-center gap-1 mt-0.5 text-slate-500 text-xs">
              <MapPin size={11} className="flex-shrink-0" />
              <span className="truncate">
                {order.addresses.street}, {order.addresses.city}
              </span>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-1 truncate">{itemsSummary}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <p className="text-sm font-bold text-slate-700">₹{Number(order.total).toFixed(0)}</p>

        {done ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle size={14} weight="fill" className="text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-700">Done</span>
          </div>
        ) : (
          <button
            onClick={handleDeliver}
            disabled={isPending}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 active:scale-[0.97] disabled:opacity-50"
            style={{ backgroundColor: "#CAEF61", color: "#0A2416" }}
          >
            {isPending ? "Saving..." : "Mark Delivered"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function DeliveryQueueClient({ slots }: { slots: DeliverySlot[] }) {
  const [localSlots, setLocalSlots] = useState(slots);

  function handleDeliver(id: string) {
    setLocalSlots((prev) =>
      prev.map((slot) => ({
        ...slot,
        deliveries: slot.deliveries.map((o) => (o.id === id ? { ...o, status: "delivered" as const } : o)),
      }))
    );
    markOrderDelivered(id);
  }

  const totalDeliveries = localSlots.reduce((acc, s) => acc + s.deliveries.length, 0);
  const completedCount = localSlots.reduce(
    (acc, s) => acc + s.deliveries.filter((o) => o.status === "delivered").length,
    0
  );
  const remaining = totalDeliveries - completedCount;

  return (
    <div>
      {/* Summary strip */}
      <div
        className="flex items-center divide-x divide-slate-200 border-b border-slate-200 animate-fade-up"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        {[
          { label: "Total", value: totalDeliveries },
          { label: "Completed", value: completedCount },
          { label: "Remaining", value: remaining },
        ].map(({ label, value }) => (
          <div key={label} className="flex-1 px-6 py-4 text-center">
            <p className="text-2xl font-bold text-[#0A2416]">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className="divide-y divide-slate-100 animate-fade-up" style={{ "--i": 2 } as React.CSSProperties}>
        {localSlots.length === 0 && (
          <div className="px-6 py-16 text-center text-slate-400 text-sm">
            No deliveries scheduled for today.
          </div>
        )}
        {localSlots.map((slot) => (
          <div key={slot.time}>
            {/* Slot header */}
            <div className="flex items-center gap-2 px-6 py-3 bg-slate-50/80">
              <Clock size={14} className="text-slate-400 flex-shrink-0" />
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {slot.time}
              </p>
              <span className="text-xs text-slate-400">
                · {slot.deliveries.length} {slot.deliveries.length === 1 ? "delivery" : "deliveries"}
              </span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50">
              {slot.deliveries.map((order) => (
                <DeliveryRow
                  key={order.id}
                  order={order}
                  onDeliver={handleDeliver}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
