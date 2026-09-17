const MESSAGES = [
  "🌱 100% Farm Fresh, Cut To Order",
  "🎁 Free Gift On Orders Above ₹999!",
  "🚚 Free Delivery Across Bengaluru",
  "⭐ 30,000+ Happy Customers",
];

export function AnnouncementBar() {
  const loop = [...MESSAGES, ...MESSAGES];
  return (
    <div className="relative z-30 overflow-hidden bg-(--color-navy) py-2 text-white">
      <div className="flex w-max animate-marquee gap-12 whitespace-nowrap text-xs font-medium tracking-wide">
        {loop.map((msg, i) => (
          <span key={i} className="flex items-center gap-2">
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
