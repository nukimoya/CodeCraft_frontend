import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import StudentSidebar from '../../components/learnerSidebar';
import StudentEmptyState from '../../components/classroomEmptyState';
import { AuthContext } from '../../context/authContext';

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center align-items-center min-vh-100">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const LearnerClassroomPage = () => {
  const { user } = useContext(AuthContext);
  // eslint-disable-next-line
  const [classroom, setClassroom] = useState(null);
  const [courseSections, setCourseSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [enrolledClassrooms, setEnrolledClassrooms] = useState(null);
  const [activeClassroomData, setActiveClassroomData] = useState(null);

  // Helper function to check if a course is available for the user's level
  const isCourseAvailable = (courseLevel) => {
    const userLevel = (user?.data?.user?.level || 'beginner').toLowerCase();
    const courseLevelLower = (courseLevel || 'beginner').toLowerCase();
    
    // Map difficulty levels to numbers
    const difficultyLevels = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3
    };
  
    // Convert user level to numeric value
    const userLevelValue = difficultyLevels[userLevel] || 1;
    
    // Convert course level to numeric value
    const courseLevelValue = difficultyLevels[courseLevelLower] || 1;
  
    // console.log('User:', userLevel, `(${userLevelValue})`, 'Course:', courseLevel, `(${courseLevelValue})`);
    
    return userLevelValue >= courseLevelValue;
  };
  


  const fetchClassroomData = useCallback(async () => {
    try {
      const token = user?.data?.token;
      if (!token) {
        navigate('/login');
        return;
      }

      // First fetch enrolled classrooms
      const enrolledResponse = await fetch('http://localhost:5005/learner/classrooms', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!enrolledResponse.ok) {
        throw new Error('Failed to fetch enrolled classrooms');
      }
      
      const enrolledData = await enrolledResponse.json();
      // console.log('Enrolled classrooms:', enrolledData);
      setEnrolledClassrooms(enrolledData.classrooms);

      // If there are enrolled classrooms, fetch the first one's details
      if (enrolledData.classrooms && enrolledData.classrooms.length > 0) {
        const activeClassroom = enrolledData.classrooms[0];
        // console.log('Active classroom:', activeClassroom); // Debug log
        setActiveClassroomData(activeClassroom); // Store the active classroom data

        const [classroomData, sectionsData] = await Promise.all([
          fetch(`http://localhost:5005/learner/classrooms/${activeClassroom.classroom_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }).then(async res => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              console.error('Classroom fetch error:', errorData);
              throw new Error(errorData.message || 'Failed to fetch classroom');
            }
            return res.json();
          }),
          fetch(`http://localhost:5005/learner/classrooms/${activeClassroom.classroom_id}/sections`, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }).then(async res => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({}));
              console.error('Sections fetch error:', errorData);
              throw new Error(errorData.message || 'Failed to fetch sections');
            }
            return res.json();
          })
        ]);

        // console.log('Classroom Data:', classroomData);
        // console.log('Sections Data:', sectionsData);

        // Merge the classroom data from both responses
        setClassroom({
          ...classroomData.classroom,
          ...activeClassroom // Include data from the enrolled classrooms response
        });
        setCourseSections(sectionsData.sections || []);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.data?.token, navigate]);

  useEffect(() => {
    fetchClassroomData();
  }, [fetchClassroomData]);

  // Show loading state while checking enrollment
  if (loading) {
    return <LoadingSpinner />;
  }

  // Show empty state if user has no classrooms
  if (!loading && (!enrolledClassrooms || enrolledClassrooms.length === 0)) {
    return (
      <>
        <StudentEmptyState />
        {/* <JoinClassroomModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            setLoading(true);
            fetchClassroomData();
          }}
        /> */}
      </>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="text-danger mb-3">
            <i className="bi bi-exclamation-triangle" style={{ fontSize: "2rem" }}></i>
          </div>
          <p className="h5 mb-3">{error}</p>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="btn btn-dark"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Add this helper function to check if user can access the difficulty level

  // Add this helper function to get the tooltip message
  // const getAccessMessage = (sectionDifficulty) => {
  //   if (canAccessDifficulty(sectionDifficulty)) {
  //     return '';
  //   }
  //   return `You need to be ${sectionDifficulty} level or higher to access this content`;
  // };
  
  const filteredSections = courseSections.filter(section =>
    section.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the first section to extract classroom info
  // const firstSection = courseSections[0] || {};

  return (
    <div className="min-vh-100 bg-light">
      <StudentSidebar />
      <main className="p-4" style={{ marginLeft: "260px" }}>
        <div className="container-fluid">
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h1 className="h3 fw-bold mb-2">{activeClassroomData?.name || "My Classroom"}</h1>
                  
                  {/* <div className="d-flex flex-wrap gap-2">
                    <span className="badge bg-light text-dark">
                      Classroom: {activeClassroomData?.name || "Unknown"}
                    </span>
                    
                    {firstSection.course_difficulty && (
                      <span className="badge bg-light text-dark">
                        Difficulty: {firstSection.course_difficulty}
                      </span>
                    )}
                    
                    {firstSection.department && (
                      <span className="badge bg-light text-dark">
                        Department: {firstSection.department}
                      </span>
                    )}
                    
                    {firstSection.instructor_name && (
                      <span className="badge bg-light text-dark">
                        Instructor: {firstSection.instructor_name}
                      </span>
                    )}
                  </div> */}
                </div>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="row g-4">
                {filteredSections.map((section) => {
                  const isAvailable = isCourseAvailable(section.course_difficulty);
                  
                  return (
                    <div key={section.course_section_id} className="col-md-6">
                      <Link
                        to={isAvailable ? `/learner-classroom/${section.classroom_id}/section/${section.course_section_id}` : '#'}
                        className={`text-decoration-none ${!isAvailable ? 'pe-none' : ''}`}
                        onClick={(e) => {
                          if (!isAvailable) {
                            e.preventDefault();
                            setError(`You need to be ${section.course_difficulty} level or higher to access this content. Your current level is ${user?.data?.user?.level || 'Beginner'}.`);
                          }
                        }}
                        state={{
                          courseTitle: section.course_title,
                          courseCode: section.course_code,
                          courseDescription: section.course_description,
                          courseDifficulty: section.course_difficulty,
                        }}
                      >
                        <div className={`card h-100 border-0 shadow-sm hover-shadow transition-all ${!isAvailable ? 'opacity-50' : ''}`}>
                          <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <i className="bi bi-book text-muted"></i>
                                  <h5 className="card-title mb-0">{section.course_title}</h5>
                                </div>
                                <div className="d-flex flex-wrap gap-2 mb-2">
                                  <span className="badge bg-light text-dark">
                                    {section.course_code}
                                  </span>
                                  <span className={`badge ${isAvailable ? 'bg-success' : 'bg-danger'} text-white`}>
                                    {section.course_difficulty} Level
                                  </span>
                                  {!isAvailable && (
                                    <span className="badge bg-secondary">
                                      <i className="bi bi-lock-fill me-1"></i>
                                      Locked
                                    </span>
                                  )}
                                </div>
                                <p className="text-muted mb-0">{section.course_description || 'No description available'}</p>
                              </div>
                              {isAvailable && <i className="bi bi-chevron-right text-muted"></i>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Error Toast */}
              {error && (
                <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
                  <div 
                    className="toast show align-items-center text-white bg-danger border-0" 
                    role="alert" 
                    aria-live="assertive" 
                    aria-atomic="true"
                  >
                    <div className="d-flex">
                      <div className="toast-body">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        {error}
                      </div>
                      <button 
                        type="button" 
                        className="btn-close btn-close-white me-2 m-auto" 
                        onClick={() => setError(null)}
                        aria-label="Close"
                      ></button>
                    </div>
                  </div>
                </div>
              )}

              {filteredSections.length === 0 && (
                <div className="text-center py-5 bg-white rounded shadow-sm">
                  <i className="bi bi-journal-text" style={{ fontSize: "2rem", color: '#0A2647' }}></i>
                  <p className="mt-3 text-muted">
                    {searchTerm ? 'No matching courses found.' : 'No course sections available.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnerClassroomPage;