import 'bootstrap/dist/css/bootstrap.min.css';
import { Brain, Clock, Target, Lock,
  //  Timer, Wind 
  } from 'lucide-react';
// import FocusModeModal from './focusModeModal';

// const UnavailableCard = ({ minutes }) => {
//   const hours = Math.floor(minutes / 60);
//   const mins = minutes % 60;
//   const progress = Math.min((minutes / 60) * 100, 100); // Progress bar percentage

//   return (
//     <div className="alert alert-primary p-4 rounded shadow-sm">
//       <div className="mb-3 d-flex align-items-center">
//         <Brain className="text-primary me-2" size={24} />
//         <h4 className="mb-0">Focus Mode</h4>
//       </div>

//       <div className="border p-3 rounded bg-white mb-3">
//         <div className="d-flex align-items-center">
//           <Lock className="text-primary me-2" size={18} />
//           <div>
//             <h5 className="mb-1">Currently in Recovery Phase</h5>
//             <p className="text-muted small">Your brain needs time to process today's learning sessions.</p>
//           </div>
//         </div>
//       </div>

//       <div className="mb-3">
//         <div className="d-flex align-items-center text-primary">
//           <Timer size={18} className="me-2" />
//           <strong>Available in: {hours}h {mins}m</strong>
//         </div>

//         {/* Progress Bar */}
//         <div className="progress mt-2">
//           <div
//             className="progress-bar progress-bar-striped bg-primary"
//             role="progressbar"
//             style={{ width: `${progress}%` }}
//           ></div>
//         </div>
//       </div>

//       <div className="bg-light p-3 rounded">
//         <div className="d-flex align-items-center mb-2">
//           <Wind size={18} className="me-2" />
//           <span className="fw-semibold">Why the wait?</span>
//         </div>
//         <p className="mb-2">Research shows that spacing out sessions helps with:</p>
//         <ul className="small text-muted ps-3">
//           <li>Better information retention</li>
//           <li>Reduced mental fatigue</li>
//           <li>Improved long-term learning</li>
//         </ul>
//       </div>

//       <button disabled className="btn btn-secondary w-100 mt-3" style={{ cursor: 'not-allowed' }}>
//         Focus Mode Recharging
//       </button>
//     </div>
//   );
// };

const FocusMode = () => {
  

  return (
    <div className="container-fluid mt-4">
      <div className="card shadow border-0">
        <div className="card-header bg-white border-bottom">
          <h2 className="h5 mb-0">Focus Mode</h2>
        </div>

        <div className="card-body">
          {/* Benefits Grid */}
          <div className="row g-4 mb-4">
            <div className="col-md-4 d-flex align-items-start">
              <Brain className="text-primary me-3" size={28} />
              <div>
                <h5 className="mb-1">Enhanced Focus</h5>
                <p className="text-muted small">Minimize distractions and maximize your learning potential.</p>
              </div>
            </div>

            <div className="col-md-4 d-flex align-items-start">
              <Clock className="text-warning me-3" size={28} />
              <div>
                <h5 className="mb-1">Time Management</h5>
                <p className="text-muted small">Structure your study sessions for optimal retention.</p>
              </div>
            </div>

            <div className="col-md-4 d-flex align-items-start">
              <Target className="text-success me-3" size={28} />
              <div>
                <h5 className="mb-1">Goal Tracking</h5>
                <p className="text-muted small">Set and achieve your learning objectives.</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-light p-3 rounded mb-4">
            <div className="d-flex align-items-center mb-2">
              <Lock size={18} className="text-primary me-2" />
              <h5 className="mb-0">How it works:</h5>
            </div>
            <ul className="small text-muted ps-3">
              <li>Choose your focus duration (25-90 minutes).</li>
              <li>Select your learning objectives.</li>
              <li>Take a recovery break when your session ends.</li>
            </ul>
          </div>

          {/* Start Session Button */}
          <div className="text-center">
            <button
              // onClick={() => setShowFocusModal(true)}
              className="btn btn-dark d-flex align-items-center gap-2 px-4 py-2"
            >
              <Brain size={20} />
              <span>Start Focus Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* <FocusModeModal isOpen={showFocusModal} onClose={() => setShowFocusModal(false)} onStatusChange={checkSessionStatus} /> */}
    </div>
  );
};

export default FocusMode;
