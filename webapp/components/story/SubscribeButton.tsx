"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react";
import { usePreorder } from "@/context/PreorderContext";

export function SubscribeButton({ planId, inverted = false }: { planId: string; inverted?: boolean }) {
  const router = useRouter();
  const { setSubscription } = usePreorder();

  return (
    <button
      type="button"
      onClick={() => {
        setSubscription({ planId });
        router.push("/subscribe");
      }}
      className={`group mt-7 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-colors ${
        inverted
          ? "bg-[#f1eee4] text-[#1d3a1b] hover:bg-white"
          : "bg-[#1d3a1b] text-white hover:bg-[#2c4a26]"
      }`}
    >
      Subscribe
      <ArrowRight size={15} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
