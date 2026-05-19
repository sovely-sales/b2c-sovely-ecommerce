import { Zap, Percent, Gift, Flame } from 'lucide-react';
import './DealBanners.css';

const DEALS = [
  {
    icon: <Zap size={20} />,
    title: 'Flash Sale',
    subtitle: 'Up to 60% Off',
    desc: 'Ends tonight',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
  },
  {
    icon: <Percent size={20} />,
    title: 'Budget Buys',
    subtitle: 'Under ₹199',
    desc: 'Best value picks',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
  },
  {
    icon: <Gift size={20} />,
    title: 'Gift Store',
    subtitle: 'Curated Hampers',
    desc: 'For every occasion',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  },
  {
    icon: <Flame size={20} />,
    title: 'Trending Now',
    subtitle: 'Top Sellers',
    desc: 'Most popular items',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
];

export default function DealBanners() {
  return (
    <section className="deal-banners-section">
      <div className="container">
        <div className="deal-banners-grid">
          {DEALS.map((deal, idx) => (
            <div 
              key={idx} 
              className="deal-banner-card"
              style={{ background: deal.gradient }}
            >
              <div className="deal-icon-wrap">{deal.icon}</div>
              <div className="deal-text">
                <h3>{deal.title}</h3>
                <p className="deal-subtitle">{deal.subtitle}</p>
                <span className="deal-desc">{deal.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
