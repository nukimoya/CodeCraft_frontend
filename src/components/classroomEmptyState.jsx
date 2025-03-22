import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PlusCircle, Users } from 'lucide-react';
import StudentSidebar from './learnerSidebar';
import { useStudentClassroom } from '../context/learnerClassroomContext';
// import useStudentClassroomNavigation from '../hooks/useStudentClassroomNavigation';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import { toast } from 'react-toastify';

const StudentEmptyState = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { refetchClassrooms } = useStudentClassroom();
  const [availableClassrooms, setAvailableClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const { handleClassroomNavigation } = useStudentClassroomNavigation();

  const fetchAvailableClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      const token = user?.data?.token;
      
      const response = await axios.get('http://localhost:5005/learner/classrooms/available', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      setAvailableClassrooms(response.data.classrooms);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      setError('Failed to load available classrooms');
    } finally {
      setLoading(false);
    }
  }, [user?.data?.token]);

  useEffect(() => {
    fetchAvailableClassrooms();
  }, [fetchAvailableClassrooms]);

  // const handleClassroomNavigation = (classroomId) => {
  //   // Implement classroom navigation logic here
  //   console.log(`Navigating to classroom ${classroomId}`);
  //   navigate("/learner-classroom");
  // };

  // const handleJoinClick = () => {
  //   setShowJoinModal(true);
  // };

  // const handleJoinSuccess = async (response) => {
  //   // Close the modal first for better UX
  //   setShowJoinModal(false);
    
  //   // Refetch classrooms to get the updated list
  //   await refetchClassrooms();
    
  //   // Navigate to the newly joined classroom if available in the response
  //   if (response?.classroom?.classroom_id) {
  //     handleClassroomNavigation(response.classroom.classroom_id);
  //   }

  //   await fetchAvailableClassrooms(); // Refresh available classrooms
  // };

  const handleJoinClassroom = async (classroomId) => {
    try {
      console.log('Attempting to join classroom:', classroomId);
      const token = user?.data?.token;
      
      const response = await axios.post(
        `http://localhost:5005/learner/classrooms/${classroomId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      console.log('Join classroom response:', response.data);
      
      // Handle successful join
      await refetchClassrooms();
      await fetchAvailableClassrooms();

      // Show success message and navigate
      toast.success('Successfully joined classroom!');
      
      if (response.data.classroom && response.data.classroom.classroom_id) {
        console.log('Navigating to joined classroom:', response.data.classroom.classroom_id);
        setTimeout(() => {
          navigate(`/learner-classroom/${response.data.classroom.classroom_id}`);
        }, 1500); // Short delay to show success message
      }

    } catch (error) {
      console.error('Error joining classroom:', error);
      toast.error(error.response?.data?.message || 'Failed to join classroom');
    }
  };

  // const chunk = (arr, size) =>
  //   Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
  //     arr.slice(i * size, i * size + size)
  //   );

  return (
    <>
      <div className="min-vh-100" style={{ background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef)' }}>
        <StudentSidebar />
        <main className="pt-4 px-5" style={{ marginLeft: '260px' }}>
          {/* Empty State Section */}
          <div className="bg-white rounded-4 shadow-sm p-5 pt-2 text-center mb-5" 
            style={{ 
              maxWidth: '36rem',
              margin: '0 auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
            <div className="d-flex align-items-center justify-content-center mx-auto rounded-circle mb-4"
              style={{ 
                width: "96px", 
                height: "96px",
                background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.06)'
              }}>
              <BookOpen size={42} className="text-primary" strokeWidth={1.5} />
            </div>
            
            <h1 className="display-6 fw-bold text-dark mb-3">
              Welcome to Your Learning Journey
            </h1>
            <p className="text-secondary fs-5 mb-4">
              Join a classroom to begin exploring course materials and resources.
            </p>
            
            {/* <button
              onClick={handleJoinClassroom}
              className="btn btn-primary btn-lg d-inline-flex align-items-center gap-2 px-4 py-3"
              style={{ 
                background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)',
                border: 'none',
                boxShadow: '0 8px 24px rgba(13, 110, 253, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              <PlusCircle size={20} />
              <span className="fw-semibold">Join A Classroom</span>
            </button> */}
          </div>

          {/* Available Classrooms Section */}
          <div className="container-fluid px-4">
            <div className="text-center mb-5">
              <h2 className="display-6 fw-bold text-dark mb-3">Available Classrooms</h2>
              <p className="text-secondary fs-5">Discover and join available classrooms to start learning</p>
            </div>
            
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger mx-auto" style={{ maxWidth: '500px' }}>
                {error}
              </div>
            ) : (
              <div className="row g-4">
                {availableClassrooms.map((classroom) => (
                  <div key={classroom.classroom_id} className="col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm hover-shadow-lg transition-all"
                      style={{ 
                        borderRadius: '16px',
                        transition: 'all 0.3s ease'
                      }}>
                      <div className="card-body">
                        <div className="d-flex align-items-center gap-3 mb-4">
                          <div className="rounded-circle p-3 bg-light">
                            <Users size={24} className="text-primary" />
                          </div>
                          <h3 className="card-title h5 fw-bold mb-0">
                            {classroom.name}
                          </h3>
                        </div>
                        
                        {/* <p className="card-text text-secondary test-truncate" style={{ minHeight: '3rem' }}>
                          {classroom.description}
                        </p> */}
                        
                        <div className="d-flex flex-wrap gap-2 mb-4">
                          <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                            {classroom.level}
                          </span>
                          {classroom.department && (
                            <span className="badge rounded-pill bg-light text-dark px-3 py-2">
                              {classroom.department}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleJoinClassroom(classroom.classroom_id)}
                          className="btn btn-dark w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                          style={{ borderRadius: '12px' }}
                        >
                          <PlusCircle size={18} />
                          Join Classroom
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {availableClassrooms.length === 0 && (
                  <div className="text-center py-5">
                    <p className="text-secondary fs-5">
                      No classrooms available at the moment.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* <JoinClassroomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={handleJoinSuccess}
      /> */}
    </>
  );
};

export default StudentEmptyState;