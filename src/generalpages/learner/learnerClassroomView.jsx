import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PlusCircle } from 'lucide-react';
import StudentSidebar from '../../components/learnerSidebar';
import JoinClassroomModal from '../../components/joinClassroomModal';
import { useStudentClassroom } from '../../context/StudentClassroomContext';

const StudentClassroomView = () => {
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const navigate = useNavigate();
    const { classrooms, loading, refetchClassrooms } = useStudentClassroom();
  
    useEffect(() => {
      if (!loading && classrooms?.length > 0) {
        navigate(`/student/classrooms/${classrooms[0].classroom_id}`);
      }
    }, [classrooms, loading, navigate]);
  
    const handleJoinSuccess = async (response) => {
      setIsTransitioning(true);
  
      try {
        setShowJoinModal(false);
        await refetchClassrooms();
  
        if (response?.classroom?.classroom_id) {
          navigate(`/student/classrooms/${response.classroom.classroom_id}`);
        }
      } catch (error) {
        console.error("Error handling classroom join:", error);
        setIsTransitioning(false);
      }
    };
  
    // 🔹 Show Loading State
    if (loading || isTransitioning) {
      return (
        <div className="vh-100 bg-white d-flex">
          <StudentSidebar />
          <main className="flex-grow-1 d-flex align-items-center justify-content-center">
            <div className="text-center">
              <div className="spinner-border text-dark" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-secondary mt-3">Loading your classroom...</p>
            </div>
          </main>
        </div>
      );
    }
  
    // 🔹 Show Empty State if No Classrooms Exist
    if (!classrooms || classrooms.length === 0) {
      return (
        <>
          <div className="vh-100 bg-white d-flex">
            <StudentSidebar />
            <main className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
              <div className="text-center">
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto" style={{ width: "64px", height: "64px" }}>
                  <BookOpen className="text-secondary" size={32} />
                </div>
                <h2 className="fw-bold text-dark mt-3">Welcome to Your Learning Space</h2>
                <p className="text-muted">
                  Join your first classroom to access course materials, participate in quizzes, and connect with your peers.
                </p>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="btn btn-dark d-inline-flex align-items-center gap-2 shadow-sm mt-3"
                >
                  <PlusCircle size={20} />
                  Join A Classroom
                </button>
              </div>
            </main>
          </div>
  
          <JoinClassroomModal
            isOpen={showJoinModal}
            onClose={() => setShowJoinModal(false)}
            onSuccess={handleJoinSuccess}
          />
        </>
      );
    }
  
    return null; // If classrooms exist, useEffect handles navigation
  };

export default StudentClassroomView;