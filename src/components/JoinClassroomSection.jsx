import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap
import { Users, School, BookOpen } from 'lucide-react'; // Using Lucide React Icons

const JoinClassroomSection = ({ onJoinClick }) => {
  const navigate = useNavigate();


  const handleJoinClick = () => {
    
    // Navigate to learner-classroom page
    navigate('/learner-classroom');
  };

  return (
    <div className="mt-4 mb-4">
      <div className="card shadow border-0">
        <div className="card-header bg-white border-bottom">
          <h2 className="h5 mb-0">Classrooms</h2>
        </div>
        
        <div className="card-body">
          {/* Benefits Grid */}
          <div className="row g-4 mb-4">
            <div className="col-md-4 d-flex align-items-start">
              <Users className="text-primary me-3" size={28} />
              <div>
                <h5 className="mb-1">Stay in Touch</h5>
                <p className="text-muted small">Stay in touch with your course announcements.</p>
              </div>
            </div>

            <div className="col-md-4 d-flex align-items-start">
              <School className="text-success me-3" size={28} />
              <div>
                <h5 className="mb-1">Access Resources</h5>
                <p className="text-muted small">Get course materials and assignments directly from your teachers.</p>
              </div>
            </div>

            <div className="col-md-4 d-flex align-items-start">
              <BookOpen className="text-danger me-3" size={28} />
              <div>
                <h5 className="mb-1">Track Progress</h5>
                <p className="text-muted small">Monitor your learning journey and achievements.</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-light p-3 rounded mb-4">
            <h5 className="mb-2">How to join:</h5>
            <ul className="list-unstyled small text-muted">
              <li>1. Get the classroom code from your teacher.</li>
              <li>2. Click the "View Classrooms" button below.</li>
              <li>3. Enter the code in the popup window.</li>
            </ul>
          </div>

          {/* Join Button */}
          <div className="text-center text-md-start">
            <button 
              onClick={handleJoinClick} 
              className="btn btn-dark px-4 py-2 d-flex align-items-center justify-content-center gap-2"
            >
              <Users size={20} />
              <span>View Classrooms</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinClassroomSection;
