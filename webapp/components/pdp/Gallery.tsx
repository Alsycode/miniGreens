"use client";

import { useState } from "react";
import Image from "next/image";
import { productImageFit } from "@/lib/productImages";
import { Leaf } from "@phosphor-icons/react";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const src = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#faf8f0] shadow-[0_14px_22px_rgba(34,44,24,0.12)]">
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            priority
            className={productImageFit(src)}
            sizes="(min-width: 1024px) 45vw, 90vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Leaf size={40} className="text-[#1d3a1b]/30" />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-6 flex gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#faf8f0] transition-colors ${
                i === active ? "border-[#1d3a1b]" : "border-transparent hover:border-[#1d3a1b]/40"
              }`}
            >
              <Image src={img} alt="" fill className={productImageFit(img)} sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
