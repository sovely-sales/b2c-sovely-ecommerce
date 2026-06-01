import React from "react";
import { Newspaper, Download, Calendar, ArrowRight, Rss } from "lucide-react";
import "./Press.css";

const PRESS_RELEASES = [
  {
    title: "Sovely Launches All-in-One Delivery Platform in Metro Cities",
    date: "May 10, 2026",
    summary: "Sovely Technologies announces the official expansion of its next-day delivery service to Bangalore, Delhi NCR, and Mumbai, offering customers a curated portfolio of lifestyle and household goods."
  },
  {
    title: "Onboarding over 5,000 Local Verified Suppliers Across India",
    date: "April 18, 2026",
    summary: "Sovely expands its supplier network, allowing local merchants to digitize inventory and reach millions of new consumers via our integrated B2C dropshipping channels."
  },
  {
    title: "Sovely Raises Seed Funding to Accelerate Logistics Integration",
    date: "March 5, 2026",
    summary: "Sovely announces a successful seed round led by leading venture funds to scale warehouse automation, expand delivery routes, and optimize real-time tracking pipelines."
  }
];

export default function Press() {
  return (
    <div className="press-page container section animate-fadeUp">
      <div className="press-header text-center">
        <Newspaper size={48} className="header-icon" />
        <h1>Press & Media Room</h1>
        <p className="subtitle">Official news, press releases, and brand assets from Sovely</p>
      </div>

      <div className="press-content">
        <div className="media-assets-grid">
          <div className="asset-card glass">
            <Rss size={24} className="card-icon" />
            <h3>Media Inquiries</h3>
            <p>
              Are you a journalist or researcher working on a story about e-commerce, logistics, or digital supply chains? Get in touch with our PR representatives.
            </p>
            <a href="mailto:press@sovely.in" className="btn btn-outline apply-btn" style={{ padding: "8px 16px", marginTop: "10px" }}>
              Email PR Team
            </a>
          </div>

          <div className="asset-card glass">
            <Download size={24} className="card-icon" />
            <h3>Brand Assets</h3>
            <p>
              Download high-resolution logos, brand guidelines, warehouse imagery, and executive portraits for editorial use.
            </p>
            <button className="btn btn-primary apply-btn" style={{ padding: "8px 16px", marginTop: "10px" }} onClick={() => alert("Downloading media pack...")}>
              <Download size={14} /> Logo Pack (Zip)
            </button>
          </div>
        </div>

        <h2 className="section-title">Latest News & Press Releases</h2>
        <div className="releases-list">
          {PRESS_RELEASES.map((pr, idx) => (
            <div key={idx} className="release-card glass">
              <div className="release-meta">
                <Calendar size={14} /> <span>{pr.date}</span>
              </div>
              <h3>{pr.title}</h3>
              <p className="release-summary">{pr.summary}</p>
              <button className="read-more-btn" onClick={() => alert("Full press release view is currently offline.")}>
                <span>Read Full Story</span> <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
