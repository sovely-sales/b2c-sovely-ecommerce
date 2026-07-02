import React, { useState } from "react";
import { useData } from "../context/DataContext";
import "./CategoryStrip.css";

export default function CategoryStrip() {
  const { categories, setSelectedCategory } = useData();
  const [imageErrors, setImageErrors] = useState({});

  const handleClick = (catName) => {
    setSelectedCategory(catName);
    const el = document.getElementById("all-products-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleImageError = (catId) => {
    setImageErrors((prev) => ({ ...prev, [catId]: true }));
  };

  if (!categories || categories.length === 0) return null;

  const topCategories = categories.slice(0, 12);

  return (
    <section className="category-strip" id="category-strip">
      <div className="container">
        <div className="strip-scroll">
          {topCategories.map((cat) => (
            <button
              key={cat.id}
              className="strip-item"
              onClick={() => handleClick(cat.name)}
            >
              <div className="strip-icon-circle" style={{ background: cat.bg }}>
                {imageErrors[cat.id] || !cat.image ? (
                  <span className="strip-emoji">{cat.icon || "📦"}</span>
                ) : (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="strip-img"
                    onError={() => handleImageError(cat.id)}
                  />
                )}
              </div>
              <span className="strip-label">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
