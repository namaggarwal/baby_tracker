import { useState, useRef } from 'react';
import './SwipeableItem.css';

export default function SwipeableItem({ children, onDelete, threshold = -80 }) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const itemRef = useRef(null);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const x = e.touches[0].clientX;
    const diff = x - startX;
    
    // Only allow left swipe
    if (diff < 0) {
      setCurrentX(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (currentX < threshold) {
      onDelete();
    }
    setCurrentX(0);
  };

  const handleMouseDown = (e) => {
    setStartX(e.clientX);
    setIsSwiping(true);
  };

  const handleMouseMove = (e) => {
    if (!isSwiping) return;
    const x = e.clientX;
    const diff = x - startX;
    if (diff < 0) setCurrentX(diff);
  };

  const handleMouseUp = () => {
    setIsSwiping(false);
    if (currentX < threshold) {
      onDelete();
    }
    setCurrentX(0);
  };

  return (
    <div className="swipe-container">
      <div className="swipe-background">
        <span className="material-symbols-outlined">delete</span>
      </div>
      <div 
        ref={itemRef}
        className="swipe-content"
        style={{ 
          transform: `translateX(${currentX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease',
          cursor: isSwiping ? 'grabbing' : 'grab'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children}
      </div>
    </div>
  );
}
