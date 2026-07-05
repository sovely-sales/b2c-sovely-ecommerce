import React from "react";

export default function WhatsAppWidget() {
  const whatsappNumber = "919535094003";
  const message = "Hi! I need help with my order on Sovely.";
  const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={link}
      className="whatsapp-float animate-bounceUp"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        backgroundColor: "#25d366",
        color: "white",
        borderRadius: "50%",
        textAlign: "center",
        boxShadow: "0 8px 24px rgba(37, 211, 102, 0.3)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "60px",
        height: "60px",
        textDecoration: "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "3px solid #000",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1) rotate(5deg)";
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(37, 211, 102, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1) rotate(0deg)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(37, 211, 102, 0.3)";
      }}
    >
      <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.63 1.97 14.162.946 11.535.946c-5.438 0-9.863 4.372-9.867 9.802-.001 1.73.463 3.42 1.343 4.926l-1.014 3.705 3.821-.993zm11.272-7.01c-.3-.149-1.772-.864-2.047-.964-.275-.1-.475-.149-.675.15-.2.299-.775.964-.95 1.163-.175.199-.35.224-.65.075-.3-.149-1.265-.462-2.41-1.474-.89-.785-1.49-1.754-1.665-2.052-.175-.299-.019-.461.13-.609.135-.133.3-.349.45-.523.15-.174.2-.299.3-.499.1-.199.05-.374-.025-.524-.075-.15-.675-1.608-.925-2.203-.244-.582-.49-.5-.675-.509-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.772-.717 2.022-1.412.25-.694.25-1.29.175-1.413-.075-.124-.275-.199-.575-.349z" />
      </svg>
    </a>
  );
}
