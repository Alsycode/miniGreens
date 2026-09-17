import { Hero } from "@/components/Hero";
import { TeaGrid } from "@/components/TeaGrid";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { ProductGrid } from "@/components/ProductGrid";
import { Testimonials } from "@/components/Testimonials";
import { SubscriptionTeaser } from "@/components/SubscriptionTeaser";
import { FeatureStrip } from "@/components/FeatureStrip";

export default function Home() {
  return (
    <div>
      <Hero />
      <TeaGrid />
      <WhyChooseUs />
      <ProductGrid />
      <Testimonials />
      <SubscriptionTeaser />
      <FeatureStrip />
    </div>
  );
}
