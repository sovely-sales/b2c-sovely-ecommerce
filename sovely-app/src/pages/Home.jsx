import { useEffect } from "react";
import HeroBanner from "../components/HeroBanner";
import CategoryStrip from "../components/CategoryStrip";
import QuickTrack from "../components/QuickTrack";
import DealBanners from "../components/DealBanners";
import AllProducts from "../components/AllProducts";
import PromoBanner from "../components/PromoBanner";
import TrustBar from "../components/TrustBar";
import Newsletter from "../components/Newsletter";

export default function Home() {
  useEffect(() => {
    document.title = "Sovely - Premium E-commerce Experience";
  }, []);

  return (
    <main id="home-page">
      <HeroBanner />
      <CategoryStrip />
      <QuickTrack />
      <DealBanners />
      <AllProducts />
      <PromoBanner />
      <TrustBar />
      <Newsletter />
    </main>
  );
}
