import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const TestTimer = ({ duration, onTimeUp, className = '' }) => {
  // State for time remaining in seconds
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  
  // Derived state for warning condition (2 minutes remaining)
  const isWarning = useMemo(() => timeLeft <= 120, [timeLeft]);
  
  // Derived state for critical condition (30 seconds remaining)
  const isCritical = useMemo(() => timeLeft <= 30, [timeLeft]);
  
  // Format time as MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Timer effect
  useEffect(() => {
    // Only start the timer if we have a valid duration
    if (!duration) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount
    return () => clearInterval(timer);
  }, [duration, onTimeUp]);

  // Play sound effect when entering warning state
  useEffect(() => {
    if (isWarning && timeLeft === 120) {
      // You could add a sound effect here
      // const audio = new Audio('/path-to-warning-sound.mp3');
      // audio.play().catch(e => console.error('Error playing sound:', e));
    }
  }, [isWarning, timeLeft]);

  // Get dynamic styles based on time state
  const getTimerStyles = useCallback(() => {
    if (isCritical) {
      return {
        container: 'bg-red-100 border-red-300 animate-pulse',
        icon: 'text-red-600',
        text: 'text-red-700 font-bold'
      };
    }
    
    if (isWarning) {
      return {
        container: 'bg-amber-50 border-amber-200',
        icon: 'text-amber-500',
        text: 'text-amber-700'
      };
    }
    
    return {
      container: 'bg-gray-50 border-gray-200',
      icon: 'text-gray-500',
      text: 'text-gray-700'
    };
  }, [isWarning, isCritical]);

  const styles = getTimerStyles();

  return (
    <div 
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all duration-300 ${styles.container} ${className}`}
      role="timer"
      aria-live="polite"
    >
      {isCritical ? (
        <AlertCircle className={`h-4 w-4 ${styles.icon}`} />
      ) : (
        <Clock className={`h-4 w-4 ${styles.icon}`} />
      )}
      
      <span className={`font-medium ${styles.text}`}>
        {formattedTime}
      </span>
    </div>
  );
};

export default TestTimer;
