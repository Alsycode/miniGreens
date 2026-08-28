import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { ProductGrid } from "@/components/ProductGrid";
import { SubscriptionTeaser } from "@/components/SubscriptionTeaser";
import { FeatureStrip } from "@/components/FeatureStrip";
import { Footer } from "@/components/Footer";
import { LeafDecor } from "@/components/LeafDecor";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <LeafDecor />
      <Navbar />
      <Hero />
      <WhyChooseUs />
      <ProductGrid />
      <SubscriptionTeaser />
      <FeatureStrip />
      <Footer />
    </div>
  );
}
