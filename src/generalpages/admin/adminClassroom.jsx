import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import AdminSidebar from '../../components/adminSidebar';
import CreateSectionModal from '../../components/createSectionModal';
import EmptyState from '../../components/emptyState';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../../styles/AdminClassroom.css'

const AdminClassroom = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [classroom, setClassroom] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = user?.data?.token;
      if (!token) throw new Error('No authentication token found');

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      let classroomData;
      
      if (classroomId) {
        // Fetch specific classroom if ID is provided
        const specificClassroomRes = await axios.get(
          `https://codecraft-production.up.railway.app/admin/classrooms/${classroomId}`, 
          config
        );
        classroomData = specificClassroomRes.data.classroom;
      } else {
        // Fetch first classroom if no ID provided
        const classroomsRes = await axios.get(
          'https://codecraft-production.up.railway.app/admin/classrooms', 
          config
        );
        classroomData = classroomsRes.data.classrooms[0];
        
        // If a classroom exists, update URL with its ID
        if (classroomData?.classroom_id) {
          navigate(`/admin-classroom/${classroomData.classroom_id}`, { replace: true });
        }
      }

      setClassroom(classroomData);

      if (classroomData?.classroom_id) {
        const sectionsRes = await axios.get(
          `https://codecraft-production.up.railway.app/Admin/classrooms/${classroomData.classroom_id}/course-sections`,
          config
        );
        setSections(sectionsRes.data.sections || []);
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch data';
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.data?.token, navigate, classroomId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateSectionClick = () => {
    if (!classroom?.classroom_id) {
      toast.error('Classroom data not available');
      return;
    }
    setShowCreateSectionModal(true);
  };

  const handleCreateSectionSuccess = () => {
    setShowCreateSectionModal(false);
    fetchData();
    toast.success('Section created successfully!');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If no classroom exists, show empty state
  if (!classroom) {
    return <EmptyState />;
  }

  const filteredSections = sections.filter(section =>
    section.course_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef)' }}>
      <AdminSidebar />
      <main className="p-5" style={{ marginLeft: "260px" }}>
        <div className="container-fluid">
          {/* Header Section */}
          <div className="card border-0 shadow-sm mb-4 overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                  <h1 className="display-6 fw-bold mb-2" style={{ color: '#0A2647' }}>
                    {classroom?.name}
                  </h1>
                  <div className="d-flex flex-wrap gap-2">
                    {['level', 'department', 'session'].map((info) => (
                      classroom?.[info] && (
                        <span 
                          key={`${info}-${classroom[info]}`}
                          className="badge rounded-pill"
                          style={{ 
                            background: 'rgba(10, 38, 71, 0.1)',
                            color: '#0A2647',
                            padding: '8px 16px',
                            fontSize: '0.9rem'
                          }}
                        >
                          {info.charAt(0).toUpperCase() + info.slice(1)}: {classroom[info]}
                        </span>
                      )
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleCreateSectionClick}
                  className="btn btn-dark px-4 py-2 d-flex align-items-center gap-2"
                  style={{ 
                    background: 'linear-gradient(to right, #0A2647, #144272)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(10, 38, 71, 0.15)'
                  }}
                >
                  <i className="bi bi-plus-circle"></i>
                  Create Section
                </button>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="input-group">
                <span className="input-group-text border-0 bg-light">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  placeholder="Search courses by title or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control border-0 bg-light py-2"
                  style={{ fontSize: '1rem' }}
                />
              </div>
            </div>
          </div>

          {/* Sections Grid */}
          <div className="row g-4">
            {filteredSections.map((section) => (
              <div key={section.course_section_id} className="col-md-6 col-lg-4">
                <Link
                  to={`/admin-classroom/${classroom?.classroom_id}/section/${section.course_section_id}`}
                  state={{
                    courseTitle: section.course_title,
                    courseCode: section.course_code,
                    courseDifficulty: section.course_difficulty || 'Course Difficulty Unavailable',
                  }}
                  className="text-decoration-none"
                >
                  <div 
                    className="card h-100 border-0 shadow-sm hover-shadow transition-all"
                    style={{ borderRadius: '12px' }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <div 
                              className="rounded-circle p-2"
                              style={{ background: 'rgba(10, 38, 71, 0.1)' }}
                            >
                              <i className="bi bi-book text-primary"></i>
                            </div>
                            <h5 className="card-title mb-0 fw-bold">{section.course_title}</h5>
                          </div>
                          <p className="text-muted mb-2">{section.course_code}</p>
                          <span 
                            className="badge"
                            style={{ 
                              background: 'rgba(10, 38, 71, 0.1)',
                              color: '#0A2647',
                              padding: '6px 12px'
                            }}
                          >
                            {section.course_difficulty}
                          </span>
                        </div>
                        <i className="bi bi-chevron-right text-primary"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredSections.length === 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5 text-center">
                <i className="bi bi-journal-text" style={{ fontSize: "3rem", color: '#0A2647' }}></i>
                <p className="mt-3 mb-0 text-muted fs-5">
                  {searchTerm ? 'No matching courses found.' : 'No course sections yet. Create one to get started!'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Create Section Modal */}
        {classroom?.classroom_id && (
          <CreateSectionModal
            isOpen={showCreateSectionModal}
            onClose={() => setShowCreateSectionModal(false)}
            onSuccess={handleCreateSectionSuccess}
            classroomId={classroom.classroom_id}
          />
        )}
      </main>
    </div>
  );
};

export default AdminClassroom;

