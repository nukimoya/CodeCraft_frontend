import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import 'animate.css';

const XpNotification = ({ amount, reason, onClose, duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Automatically hide the notification after the specified duration
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Allow time for fade-out animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Animation classes
  const animationClass = visible 
    ? 'animate__animated animate__fadeInUp' 
    : 'animate__animated animate__fadeOutDown';

  return (
    <div 
      className={`position-fixed bottom-0 end-0 p-3 ${animationClass}`} 
      style={{ zIndex: 1050 }}
    >
      <div 
        className="toast show" 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
        style={{
          background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div className="toast-header border-0 text-white" style={{ background: 'transparent' }}>
          <Star className="me-2" size={16} />
          <strong className="me-auto">XP Earned!</strong>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 300);
            }}
            aria-label="Close"
          ></button>
        </div>
        <div className="toast-body d-flex align-items-center text-white">
          <div className="me-3 fs-4 fw-bold">+{amount} XP</div>
          <div>{reason}</div>
        </div>
      </div>
    </div>
  );
};

export default XpNotification;