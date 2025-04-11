import React, { useState, useEffect, useContext } from 'react';
import { FileText, Download, ExternalLink, Search, Filter, Bell, Calendar, X, BookOpen, AlertCircle, ChevronLeft } from 'lucide-react';
import LearnerSidebar from '../../components/learnerSidebar';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const tags = [
    { value: 'important', label: 'Important', color: 'bg-danger' },
    { value: 'reminder', label: 'Reminder', color: 'bg-primary' },
    { value: 'assignment', label: 'Assignment', color: 'bg-info' },
    { value: 'general', label: 'General', color: 'bg-secondary' },
    { value: 'resource', label: 'Resource', color: 'bg-success' }
  ];

  // Fetch classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = user?.data?.token;
        
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }
        
        const url = `https://codecraft-production.up.railway.app/learner/classrooms`;
        
        const response = await fetch(url, { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          } 
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        setClassrooms(data.classrooms || []);
        
        // Set the first classroom as selected if available
        if (data.classrooms && data.classrooms.length > 0) {
          setSelectedClassroom(data.classrooms[0].classroom_id);
        }
      } catch (error) {
        setError('Failed to load classrooms. Please try again.');
      }
    };

    fetchClassrooms();
  }, [user]);

  // Fetch announcements when selectedClassroom or activeTags change
  useEffect(() => {
    // Only fetch if we have a selected classroom
    if (!selectedClassroom) {
      setLoading(false);
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = user?.data?.token;
        
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }
        
        const queryString = activeTags.length > 0 
          ? `?tags=${activeTags.join(',')}`
          : '';
          
        const url = `https://codecraft-production.up.railway.app/learner/classrooms/${selectedClassroom}/announcements${queryString}`;
        
        const response = await fetch(url, { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          } 
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        setAnnouncements(data.announcements || []);
      } catch (error) {
        setError('Failed to load announcements. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [selectedClassroom, activeTags, user]);

  const toggleTag = (tag) => {
    setActiveTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeTags.length === 0 || activeTags.includes(announcement.tag))
  );

  // If no classrooms, show empty state
  if (!loading && (!classrooms || classrooms.length === 0)) {
    return (
      <div className="min-vh-100 bg-light">
        <LearnerSidebar />
        <main className="p-4" style={{ marginLeft: "260px" }}>
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div className="card shadow-sm text-center p-5">
                  <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: "80px", height: "80px" }}>
                    <BookOpen size={32} className="text-secondary" />
                  </div>
                  <h3 className="fw-bold mb-3">No Classroom Access</h3>
                  <p className="text-muted mb-4">
                    You need to join a classroom before you can view announcements. Join a classroom to start receiving important updates and notifications.
                  </p>
                  <Link
                    to="/learner-classroom"
                    className="btn btn-dark px-4 py-2"
                  >
                    Join a Classroom
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-dark mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <LearnerSidebar />
      <main className="p-4" style={{ marginLeft: "260px" }}>
        <div className="container-fluid">
          {/* Header */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-link text-decoration-none text-muted p-0 mb-3 d-flex align-items-center"
              >
                <ChevronLeft size={18} />
                <span>Back</span>
              </button>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <h3 className="fw-bold mb-0">Classroom Announcements</h3>
                <div className="d-flex align-items-center gap-2">
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn btn-outline-secondary d-flex align-items-center"
                  >
                    <Filter size={16} className="me-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={`card shadow-sm mb-4 ${showFilters ? '' : 'd-none'}`}>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="position-relative">
                    <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                    <input
                      type="text"
                      placeholder="Search announcements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-control ps-5"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <select
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                    className="form-select"
                  >
                    {classrooms?.map((classroom) => (
                      <option key={classroom.classroom_id} value={classroom.classroom_id}>
                        {classroom.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <div className="d-flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.value}
                        onClick={() => toggleTag(tag.value)}
                        className={`btn ${
                          activeTags.includes(tag.value)
                            ? `${tag.color} text-white`
                            : 'btn-outline-secondary'
                        } d-flex align-items-center`}
                      >
                        {tag.label}
                        {activeTags.includes(tag.value) && (
                          <X size={16} className="ms-2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <AlertCircle size={18} className="me-2" />
              <div>{error}</div>
            </div>
          )}

          {/* Announcements */}
          {filteredAnnouncements.length > 0 ? (
            <div className="row g-4">
              {filteredAnnouncements.map((announcement) => (
                <div key={announcement.announcement_id} className="col-12">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body p-4">
                      <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                        <span className={`badge ${tags.find(t => t.value === announcement.tag)?.color || 'bg-secondary'}`}>
                          {announcement.tag}
                        </span>
                        <div className="d-flex align-items-center text-muted small">
                          <Calendar size={14} className="me-2" />
                          {new Date(announcement.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="mb-0 text-break">
                          {announcement.content}
                        </p>
                      </div>

                      {(announcement.files?.length > 0 || announcement.links?.length > 0) && (
                        <div className="pt-3 border-top">
                          {announcement.files?.length > 0 && (
                            <div className="mb-3">
                              <h6 className="d-flex align-items-center mb-3">
                                <FileText size={16} className="me-2 text-muted" />
                                Attachments
                              </h6>
                              <div className="list-group list-group-flush">
                                {announcement.files.map((file, index) => (
                                  <a
                                    key={index}
                                    href={file.fileUrl}
                                    download
                                    className="list-group-item list-group-item-action d-flex align-items-center py-2 px-3 border-0"
                                  >
                                    <Download size={16} className="me-2 text-muted" />
                                    <span className="text-truncate">{file.fileName}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {announcement.links?.length > 0 && (
                            <div>
                              <h6 className="d-flex align-items-center mb-3">
                                <ExternalLink size={16} className="me-2 text-muted" />
                                Related Links
                              </h6>
                              <div className="list-group list-group-flush">
                                {announcement.links.map((link, index) => (
                                  <a
                                    key={index}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="list-group-item list-group-item-action d-flex align-items-center py-2 px-3 border-0 text-primary"
                                  >
                                    <ExternalLink size={16} className="me-2 text-muted" />
                                    <span className="text-break">{link}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card shadow-sm border-0 p-5 text-center">
              <div className="py-5">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: "80px", height: "80px" }}>
                  <Bell size={32} className="text-secondary" />
                </div>
                <h4 className="fw-bold mb-2">No announcements found</h4>
                <p className="text-muted">
                  {searchQuery || activeTags.length > 0 
                    ? 'Try adjusting your search or filters'
                    : 'Check back later for updates'}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentAnnouncements;