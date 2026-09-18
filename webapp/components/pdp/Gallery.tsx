"use client";

import { useState } from "react";
import Image from "next/image";
import { Leaf } from "@phosphor-icons/react";

export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const src = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-muted)">
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
          <div className="flex h-full w-full items-center justify-center">
            <Leaf size={40} className="text-(--color-navy)/30" />
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
              className={`relative size-20 shrink-0 overflow-hidden rounded-xl border bg-(--color-bg-muted) transition-colors ${
                i === active ? "border-(--color-navy)" : "border-(--color-border) hover:border-(--color-navy)/50"
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
