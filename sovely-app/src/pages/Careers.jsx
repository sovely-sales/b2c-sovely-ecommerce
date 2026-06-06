import React from "react";
import { Briefcase, MapPin, Clock, ArrowRight, Star } from "lucide-react";
import "./Careers.css";

const OPEN_POSITIONS = [
  {
    title: "Senior Frontend Engineer (React)",
    dept: "Engineering",
    location: "Bengaluru, India (Hybrid)",
    type: "Full-Time",
    desc: "Build responsive, high-performance user interfaces and checkout workflows for our consumer-facing e-commerce applications.",
  },
  {
    title: "Operations & Supply Specialist",
    dept: "Supply Chain",
    location: "Bengaluru, India (On-site)",
    type: "Full-Time",
    desc: "Manage warehouse logistics, supplier relationships, inventory alert thresholds, and package fulfillment processes.",
  },
  {
    title: "Product Manager (B2C & Search)",
    dept: "Product Management",
    location: "Bengaluru, India (Remote)",
    type: "Full-Time",
    desc: "Own the search, recommendation, and filters roadmap to enhance conversion rates and customer satisfaction.",
  },
  {
    title: "Customer Delight Executive",
    dept: "Customer Support",
    location: "Remote (India)",
    type: "Full-Time / Shift-based",
    desc: "Handle customer queries, process return/refund disputes, and guarantee order fulfillment resolution.",
  },
];

export default function Careers() {
  return (
    <div className="careers-page container section animate-fadeUp">
      <div className="careers-header text-center">
        <Briefcase size={48} className="header-icon" />
        <h1>Join the Sovely Team</h1>
        <p className="subtitle">
          Help us build the next generation of conversational and search-first
          e-commerce
        </p>
      </div>

      <div className="careers-content">
        <div className="intro-card glass">
          <Star size={24} className="card-icon" />
          <h3>Why Work with Us?</h3>
          <p>
            We are a fast-growing team of developers, designers, and logistics
            experts dedicated to building the most premium and responsive
            shopping experience in India. We offer competitive salaries,
            flexible work schedules, comprehensive health coverage, and a
            culture of continuous learning and growth.
          </p>
        </div>

        <h2 className="section-title">Open Positions</h2>
        <div className="positions-list">
          {OPEN_POSITIONS.map((pos, idx) => (
            <div key={idx} className="position-card glass">
              <div className="position-top">
                <div className="title-block">
                  <h3>{pos.title}</h3>
                  <span className="dept-tag">{pos.dept}</span>
                </div>
                <div className="meta-block">
                  <div className="meta-item">
                    <MapPin size={14} /> <span>{pos.location}</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={14} /> <span>{pos.type}</span>
                  </div>
                </div>
              </div>
              <p className="position-desc">{pos.desc}</p>
              <button
                className="btn btn-outline apply-btn"
                onClick={() =>
                  alert(
                    "Application workflow is currently offline. Please email your CV to careers@sovely.in",
                  )
                }
              >
                <span>Apply Now</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
