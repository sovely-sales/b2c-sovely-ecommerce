import HeroBanner from '../components/HeroBanner';
import CategoryStrip from '../components/CategoryStrip';
import DealBanners from '../components/DealBanners';
import AllProducts from '../components/AllProducts';
import PromoBanner from '../components/PromoBanner';
import TrustBar from '../components/TrustBar';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';

export default function Home() {
  return (
    <main id="home-page">
      <HeroBanner />
      <CategoryStrip />
      <DealBanners />
      <AllProducts />
      <PromoBanner />
      <TrustBar />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
