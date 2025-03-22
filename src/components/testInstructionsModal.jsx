import React, { useEffect, useCallback } from 'react';
import { AlertTriangle, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const TestInstructionsModal = ({ isOpen, onClose, onBeginTest, testDuration }) => {
  // Handle escape key press
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) onClose();
  }, [isOpen, onClose]);

  // Set up event listeners and body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  // Handle begin test button click
  const handleBeginTest = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    onBeginTest(); // Call the onBeginTest function passed from parent
  };

  return (
    <div 
      className={`modal fade ${isOpen ? 'show d-block' : ''}`}
      tabIndex="-1"
      role="dialog"
      aria-labelledby="testInstructionsModal"
      aria-modal="true"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content border-0 shadow-lg">
          {/* Header */}
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold" id="testInstructionsModal">
              Test Instructions
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          {/* Content */}
          <div className="modal-body p-4">
            <div className="d-flex flex-column gap-4">
              {/* Warning section */}
              <div className="alert alert-warning d-flex gap-3 mb-0">
                <AlertTriangle className="flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="fw-semibold mb-2">Important:</p>
                  <ul className="list-unstyled mb-0">
                    <li className="d-flex align-items-center mb-2">
                      <span className="bullet-point me-2">•</span>
                      Your progress will not be saved if you refresh or leave this page
                    </li>
                    <li className="d-flex align-items-center mb-2">
                      <span className="bullet-point me-2">•</span>
                      All answers will be automatically submitted when the timer ends
                    </li>
                    <li className="d-flex align-items-center">
                      <span className="bullet-point me-2">•</span>
                      Once submitted, you cannot retake this test
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Test duration */}
              <div className="alert alert-info d-flex gap-3 mb-0">
                <Clock className="flex-shrink-0 mt-1" size={20} />
                <div>
                  <h6 className="fw-semibold mb-1">Test Duration</h6>
                  <p className="mb-0">
                    You have <span className="fw-medium">{testDuration} minutes</span> to complete this test. 
                    The timer will start as soon as you begin.
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="alert alert-success d-flex gap-3 mb-0">
                <CheckCircle className="flex-shrink-0 mt-1" size={20} />
                <div>
                  <h6 className="fw-semibold mb-1">Navigation</h6>
                  <p className="mb-0">
                    Use the Previous and Next buttons to move between questions. 
                    You can review and change your answers before final submission.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-top">
            <button
              onClick={handleBeginTest}
              className="btn btn-dark w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <span>Begin Test</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        .modal.fade.show {
          animation: fadeIn 0.2s ease-out;
        }
        
        .modal-dialog {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from {
            transform: translate(0, -20px);
            opacity: 0;
          }
          to {
            transform: translate(0, 0);
            opacity: 1;
          }
        }
        
        .bullet-point {
          color: var(--bs-warning);
          font-size: 1.5rem;
          line-height: 1;
        }
      `}</style>
    </div>
  );
};

// Add keyframe animation in your global CSS
// @keyframes scale-in {
//   from { opacity: 0; transform: scale(0.95); }
//   to { opacity: 1; transform: scale(1); }
// }
// .animate-scale-in { animation: scale-in 0.2s ease-out; }

export default TestInstructionsModal;