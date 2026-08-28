"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function RazorpayCheckoutButton({
  orderId,
  amountLabel,
}: {
  orderId: string;
  amountLabel: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "starting" | "failed">("idle");
  const [scriptReady, setScriptReady] = useState(false);

  async function handlePay() {
    setStatus("starting");
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
      body: { order_id: orderId },
    });
    if (error || !data) {
      setStatus("failed");
      return;
    }

    const rzp = new window.Razorpay({
      key: data.key_id,
      amount: data.amount,
      currency: data.currency,
      order_id: data.razorpay_order_id,
      name: "MiniGreens",
      theme: { color: "#3D7A52" },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const { data: verified } = await supabase.rpc("verify_razorpay_payment", {
          p_order_id: orderId,
          p_razorpay_payment_id: response.razorpay_payment_id,
          p_razorpay_signature: response.razorpay_signature,
        });
        if (verified) {
          router.push(`/checkout/success?orderId=${orderId}`);
        } else {
          setStatus("failed");
        }
      },
      modal: {
        ondismiss: () => setStatus("idle"),
      },
    });
    rzp.open();
    setStatus("idle");
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setScriptReady(true)}
      />
      <button
        onClick={handlePay}
        disabled={status === "starting" || !scriptReady}
        className="w-full rounded-full bg-(--color-olive) px-7 py-4 font-medium text-white transition-colors hover:bg-(--color-olive-dark) disabled:opacity-60"
      >
        {status === "starting" ? "Starting payment..." : `Pay ${amountLabel}`}
      </button>
      {status === "failed" && (
        <p className="mt-3 text-center text-sm text-red-400">
          Payment could not be completed. Please try again.
        </p>
      )}
    </>
  );
}
