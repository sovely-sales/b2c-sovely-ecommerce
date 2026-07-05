import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Maximize2, X } from "lucide-react";
import "./FloatingVideo.css";

export default function FloatingVideo() {
  const [isMuted, setIsMuted] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, posX: 0, posY: 0 });

  const [videoUrl, setVideoUrl] = useState("https://assets.mixkit.co/videos/preview/mixkit-holding-a-cellphone-running-in-a-vertical-format-42319-large.mp4");

  useEffect(() => {
    const fetchConfig = async () => {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8014";
      try {
        const res = await fetch(`${API_URL}/api/marketing`);
        if (res.ok) {
          const mData = await res.json();
          const videoDoc = mData.find((m) => m.section === "floating-video");
          if (videoDoc && videoDoc.data) {
            setIsVisible(videoDoc.data.enabled);
            if (videoDoc.data.url) {
              setVideoUrl(videoDoc.data.url);
            }
          }
        }
      } catch (err) {
        console.error("Error loading marketing video config:", err);
      }
    };
    fetchConfig();
  }, []);

  const handleStart = (clientX, clientY) => {
    dragRef.current.isDragging = true;
    dragRef.current.startX = clientX;
    dragRef.current.startY = clientY;
    dragRef.current.posX = position.x;
    dragRef.current.posY = position.y;
  };

  const handleMove = (clientX, clientY) => {
    if (!dragRef.current.isDragging) return;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.posX + dx,
      y: dragRef.current.posY + dy,
    });
  };

  const handleEnd = () => {
    dragRef.current.isDragging = false;
  };

  // Touch Event Handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  // Mouse Event Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest(".video-bubble-btn")) return; // Allow clicking buttons
    handleStart(e.clientX, e.clientY);

    const onMouseMove = (moveEvent) => {
      handleMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      handleEnd();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Bubble */}
      <div
        className="floating-video-bubble"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
      >
        <video
          src={videoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="bubble-video-player"
        />

        {/* Controls Overlay */}
        <div className="bubble-controls">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="video-bubble-btn"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          <button
            onClick={() => setIsExpanded(true)}
            className="video-bubble-btn"
            title="Expand"
          >
            <Maximize2 size={12} />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="video-bubble-btn close-btn"
            title="Close"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Full Modal Popup */}
      {isExpanded && (
        <div className="video-modal-overlay" onClick={() => setIsExpanded(false)}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setIsExpanded(false)}
              aria-label="Close video player"
            >
              <X size={20} />
            </button>
            <video
              src={videoUrl}
              autoPlay
              controls
              loop
              playsInline
              className="modal-video-player"
            />
          </div>
        </div>
      )}
    </>
  );
}
