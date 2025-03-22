import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Shield, Clipboard, Bell, BrainCircuit } from 'lucide-react';
import { FaCode } from 'react-icons/fa';

const CreateClassroomSection = ({ onCreateClick, classroomId }) => {
  const navigate = useNavigate();
  
  // console.log("Classroom ID:", classroomId);
  
  return (
    <div className="mt-4 mb-4">
      <div className="bg-white rounded border shadow-sm p-4">
        <div className="border-bottom pb-3 mb-4">
          <h2 className="h4 fw-semibold"><FaCode className="me-2" />Manage Your Classroom</h2>
        </div>

        {/* Benefits Grid */}
        <div className="row g-3 mb-4">
          <div className="col-md-4 d-flex">
            <Bell className="text-primary me-2 mt-1" size={24} />
            <div>
              <h5 className="fw-medium mb-1">Post Announcements</h5>
              <p className="text-muted small">Keep your course mates updated with important information and deadlines.</p>
            </div>
          </div>
          
          <div className="col-md-4 d-flex">
            <BrainCircuit className="text-success me-2 mt-1" size={24} />
            <div>
              <h5 className="fw-medium mb-1">Generate Quizzes</h5>
              <p className="text-muted small">Create practice quizzes to help classmates test their knowledge.</p>
            </div>
          </div>

          <div className="col-md-4 d-flex">
            <Clipboard className="text-purple me-2 mt-1" size={24} />
            <div>
              <h5 className="fw-medium mb-1">Resource Sharing</h5>
              <p className="text-muted small">Share course materials and important updates with your classmates.</p>
            </div>
          </div>
        </div>

        

        {/* Getting Started Section */}
        <div className="bg-dark bg-opacity-10 rounded p-3 mb-4">
          <h5 className="fw-medium text-dark">Getting Started:</h5>
          <ol className="small text-dark ps-3">
            <li>Click "Create Classroom" below.</li>
            <li>Fill in your course and department details.</li>
            <li>Share the generated join code with your students.</li>
            <li>Add course content and resources to your classroom.</li>
            <li>Start posting announcements and creating quizzes.</li>
          </ol>
        </div>

        {/* Important Information Section */}
        <div className="bg-info bg-opacity-5 rounded p-3 mb-4">
          <h5 className="fw-medium">Important Information:</h5>
          <ul className="list-unstyled text-dark small">
            <li className="d-flex align-items-center">
              <span className="badge bg-success me-2"></span>
              You can create one active classroom at a time.
            </li>
            <li className="d-flex align-items-center">
              <span className="badge bg-warning me-2"></span>
              Share the join code with your students after creation.
            </li>
            <li className="d-flex align-items-center">
              <span className="badge bg-primary me-2"></span>
              Deactivate or delete an existing classroom before creating a new one.
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="d-flex flex-column flex-sm-row gap-3">
          {classroomId && (
            <button 
              className="btn btn-dark d-flex align-items-center"
              onClick={() => navigate(`/admin-classroom/${classroomId}`)}
            >
              <Shield size={20} className="me-2" />
              Manage Existing Classroom
            </button>
          )}
          
          <button 
            onClick={onCreateClick} 
            className="btn btn-outline-secondary d-flex align-items-center"
          >
            <BookOpen size={20} className="me-2" />
            Create Classroom
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClassroomSection;
