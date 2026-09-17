import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ScrollSequence } from "@/components/ScrollSequence";
import { TeaGrid } from "@/components/TeaGrid";
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
      <div className="bg-black">
        <Navbar />
      </div>
      <ScrollSequence />
      <div className="h-32 bg-gradient-to-b from-(--color-ink) to-transparent" />
      <Hero />
      <TeaGrid />
      <WhyChooseUs />
      <ProductGrid />
      <Testimonials />
      <SubscriptionTeaser />
      <FeatureStrip />
      <Footer />
    </div>
  );
}
