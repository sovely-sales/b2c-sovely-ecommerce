import HeroBanner from '../components/HeroBanner';
import FeaturedProducts from '../components/FeaturedProducts';
import PromoBanner from '../components/PromoBanner';
import Testimonials from '../components/Testimonials';
import Newsletter from '../components/Newsletter';

export default function Home() {
  return (
    <main id="home-page">
      <HeroBanner />
      <FeaturedProducts />
      <PromoBanner />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
