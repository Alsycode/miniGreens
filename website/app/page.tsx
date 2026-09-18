import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ScrollSequence } from "@/components/ScrollSequence";
import { TeaCarousel } from "@/components/TeaCarousel";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { ProductGrid } from "@/components/ProductGrid";
import { Testimonials } from "@/components/Testimonials";
import { SubscriptionTeaser } from "@/components/SubscriptionTeaser";
import { FeatureStrip } from "@/components/FeatureStrip";
import { Footer } from "@/components/Footer";
import { LeafDecor } from "@/components/LeafDecor";

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      <LeafDecor />
      <Navbar />
      <ScrollSequence />
      <div className="h-32 bg-gradient-to-b from-(--color-ink) to-transparent" />
      <TeaCarousel />
      <div className="h-16 sm:h-28" />
      <Hero />
      <WhyChooseUs />
      <ProductGrid />
      <Testimonials />
      <SubscriptionTeaser />
      <FeatureStrip />
      <Footer />
    </div>
  );
}
