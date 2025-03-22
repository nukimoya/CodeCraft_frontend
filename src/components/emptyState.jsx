import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PlusCircle } from 'lucide-react';
import AdminSidebar from './adminSidebar';
import CreateClassroomModal from './createClassroomModal';
import "../styles/EmptyState.css";
import { toast } from 'react-toastify';

const EmptyState = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = (classroom) => {
    console.log('Create success callback with classroom:', classroom);
    
    if (!classroom) {
      console.error('No classroom data received');
      return;
    }

    try {
      setShowCreateModal(false);
      
      // Navigate to the new classroom
      if (classroom.classroom_id) {
        console.log('Navigating to classroom:', classroom.classroom_id);
        navigate(`/admin-classroom/${classroom.classroom_id}`);
      } else {
        console.error('No classroom ID in response');
        toast.error('Could not navigate to new classroom');
      }
    } catch (error) {
      console.error('Error in handleCreateSuccess:', error);
      toast.error('Error processing classroom creation');
    }
  };

  return (
    <>
      <div className="min-vh-100" style={{ background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef)' }}>
        <AdminSidebar />
        <main 
          className="d-flex align-items-center justify-content-center p-5" 
          style={{ 
            marginLeft: "260px",
            minHeight: "calc(100vh - 64px)"
          }}
        >
          <div 
            className="bg-white rounded-4 p-5 text-center position-relative"
            style={{ 
              maxWidth: "36rem",
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}
          >
            {/* Decorative Background Elements */}
            <div className="position-absolute top-0 end-0 mt-4 me-4 opacity-25">
              <div className="rounded-circle bg-primary" style={{ width: '120px', height: '120px', filter: 'blur(40px)' }} />
            </div>
            <div className="position-absolute bottom-0 start-0 mb-4 ms-4 opacity-25">
              <div className="rounded-circle bg-info" style={{ width: '100px', height: '100px', filter: 'blur(35px)' }} />
            </div>

            {/* Icon Container */}
            <div 
              className="d-flex align-items-center justify-content-center mx-auto rounded-circle mb-4 position-relative"
              style={{ 
                width: "96px", 
                height: "96px",
                background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.06), inset 0 -1px 2px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <BookOpen 
                className="text-primary"
                size={42}
                strokeWidth={1.5}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
            </div>

            {/* Text Content */}
            <div className="mb-5 position-relative">
              <h1 className="display-5 fw-bold text-dark mb-3" style={{ letterSpacing: '-0.02em' }}>
                No Active Classrooms
              </h1>
              <p className="text-secondary fs-5 mb-0 mx-auto" style={{ maxWidth: '480px', lineHeight: '1.6' }}>
                Get started by creating your first classroom to manage sections and resources.
              </p>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateClick}
              className="btn btn-primary btn-lg d-inline-flex align-items-center gap-2 px-5 py-3 mb-2"
              style={{ 
                background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                border: 'none',
                boxShadow: '0 8px 24px rgba(13, 110, 253, 0.25)',
                transition: 'all 0.2s ease',
                transform: 'translateY(0)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <PlusCircle size={24} strokeWidth={1.5} />
              <span className="fw-semibold">Create Classroom</span>
            </button>

            {/* Additional Help Text */}
            <p className="text-muted mt-4 mb-0">
              Need help? Check out our{' '}
              <a 
                href="/" 
                className="text-decoration-none fw-medium"
                style={{ 
                  background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                getting started guide
              </a>
            </p>
          </div>
        </main>
      </div>

      <CreateClassroomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
};

export default EmptyState;
