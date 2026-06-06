import {
  Zap,
  Percent,
  Gift,
  Flame,
  Tag,
  ShoppingBag,
  Star,
  Heart,
  Truck,
} from "lucide-react";
import { useData } from "../context/DataContext";
import "./DealBanners.css";

const ICON_MAP = {
  Zap,
  Percent,
  Gift,
  Flame,
  Tag,
  ShoppingBag,
  Star,
  Heart,
  Truck,
};

const DEFAULT_DEALS = [
  {
    icon: "Zap",
    title: "Flash Sale",
    subtitle: "Up to 60% Off",
    desc: "Ends tonight",
    gradient: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
  },
  {
    icon: "Percent",
    title: "Budget Buys",
    subtitle: "Under ₹199",
    desc: "Best value picks",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
  },
  {
    icon: "Gift",
    title: "Gift Store",
    subtitle: "Curated Hampers",
    desc: "For every occasion",
    gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
  },
  {
    icon: "Flame",
    title: "Trending Now",
    subtitle: "Top Sellers",
    desc: "Most popular items",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
];

export default function DealBanners() {
  const { marketing } = useData();

  const dealsDoc = marketing?.find((m) => m.section === "deal-banners");
  const activeDeals =
    dealsDoc?.data?.length > 0 ? dealsDoc.data : DEFAULT_DEALS;

  return (
    <section className="deal-banners-section">
      <div className="container">
        <div className="deal-banners-grid">
          {activeDeals.map((deal, idx) => {
            const IconComponent = ICON_MAP[deal.icon] || Zap;

            return (
              <div
                key={idx}
                className="deal-banner-card"
                style={{ background: deal.gradient }}
              >
                <div className="deal-icon-wrap">
                  <IconComponent size={20} />
                </div>
                <div className="deal-text">
                  <h3>{deal.title}</h3>
                  <p className="deal-subtitle">{deal.subtitle}</p>
                  <span className="deal-desc">{deal.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
