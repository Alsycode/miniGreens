"use client";

import { useState } from "react";
import Image from "next/image";
import { Leaf } from "@phosphor-icons/react";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const src = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-(--color-border) bg-black">
        {src ? (
          <Image
            src={src}
            alt={name}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 45vw, 90vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-(--color-olive)/20">
            <Leaf size={40} className="text-(--color-sage)" />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`relative size-20 shrink-0 overflow-hidden rounded-xl border bg-black transition-colors ${
                i === active
                  ? "border-(--color-sage)"
                  : "border-(--color-border) hover:border-(--color-sage)/60"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
