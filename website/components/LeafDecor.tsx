import Image from "next/image";

export function LeafDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Image
        src="/images/leaf-bg.png"
        alt=""
        fill
        priority
        className="object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-(--color-ink)/40" />
    </div>
  );
}
