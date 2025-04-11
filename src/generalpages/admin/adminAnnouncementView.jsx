import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import AdminSidebar from '../../components/adminSidebar';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Plus, 
  Filter, 
  Search,
  Trash2,
  AlertTriangle
} from 'lucide-react';

const AnnouncementsHub = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const { user } = useContext(AuthContext);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState(null);

  // Fetch classrooms on component mount
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = user?.data?.token;
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          return;
        }
        
        const response = await axios.get('https://codecraft-production.up.railway.app/admin/classrooms', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setClassrooms(response.data.classrooms || []);
        
        if (response.data.classrooms && response.data.classrooms.length > 0) {
          setSelectedClassroom(response.data.classrooms[0].classroom_id);
        }
      } catch (error) {
        console.error('Error fetching classrooms:', error);
        setError("Failed to fetch classrooms. Please try again later.");
        toast.error('Failed to fetch classrooms');
      }
    };

    fetchClassrooms();
  }, [user?.data?.token]);

  // Fetch announcements when classroom or tag changes
  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!selectedClassroom) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        const token = user?.data?.token;
        
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }
        
        const query = selectedTag ? `?tag=${selectedTag}` : '';
        
        const response = await axios.get(
          `https://codecraft-production.up.railway.app/admin/classrooms/${selectedClassroom}/announcements${query}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setAnnouncements(response.data.announcements || []);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setError("Failed to fetch announcements. Please try again later.");
        toast.error('Failed to fetch announcements');
      } finally {
        setLoading(false);
      }
    };

    if (selectedClassroom) {
      fetchAnnouncements();
    }
  }, [selectedClassroom, selectedTag, user?.data?.token]);

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      setDeleteLoading(true);
      const token = user?.data?.token;
      
      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        setDeleteLoading(false);
        return;
      }
      
      await axios.delete(
        `https://codecraft-production.up.railway.app/admin/classrooms/${selectedClassroom}/announcements/${announcementId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setAnnouncements(announcements.filter(a => a.announcement_id !== announcementId));
      toast.success('Announcement deleted successfully');
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter announcements by search term
  const filteredAnnouncements = announcements.filter(announcement => 
    announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get tag badge color
  const getTagColor = (tag) => {
    switch(tag) {
      case 'important': return 'bg-danger';
      case 'exam': return 'bg-purple';
      case 'assignment': return 'bg-primary';
      case 'reminder': return 'bg-warning';
      case 'resource': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!classrooms || classrooms.length === 0) {
    return (
      <div className="min-vh-100 bg-light">
        <AdminSidebar />
        <main className="p-4" style={{ marginLeft: "260px" }}>
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <AlertTriangle size={48} className="text-warning mb-3" />
              <h2 className="mb-3">No Classrooms Found</h2>
              <p className="text-muted mb-4">You need to create a classroom before viewing announcements.</p>
              <Link
                to="/create-classroom"
                className="btn btn-primary"
                style={{ backgroundColor: '#0A2647', borderColor: '#0A2647' }}
              >
                Create Classroom
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <AdminSidebar />
      <main className="p-4" style={{ marginLeft: "260px" }}>
        <div className="container-fluid">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <h1 className="h3 fw-bold mb-3 mb-md-0">Classroom Announcements</h1>
            <Link
              to={`/create-announcements/${selectedClassroom}`}
              className="btn btn-primary text-white d-flex align-items-center gap-2"
              style={{ backgroundColor: '#0A2647', borderColor: '#0A2647' }}
            >
              <Plus size={18} />
              New Announcement
            </Link>
          </div>

          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3 mb-4">
                <div className="col-md-5">
                  <label className="form-label">Select Classroom</label>
                  <select
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                    className="form-select"
                  >
                    {classrooms.map((classroom) => (
                      <option key={classroom.classroom_id} value={classroom.classroom_id}>
                        {classroom.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Filter by Tag</label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="form-select"
                  >
                    <option value="">All Tags</option>
                    <option value="general">General</option>
                    <option value="important">Important</option>
                    <option value="reminder">Reminder</option>
                    <option value="assignment">Assignment</option>
                    <option value="resource">Resource</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Search</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search announcements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <AlertTriangle size={32} className="text-danger mb-3" />
                  <p className="text-danger">{error}</p>
                  <button 
                    className="btn btn-outline-primary mt-3"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredAnnouncements.length > 0 ? (
                <div className="announcement-list">
                  {filteredAnnouncements.map((announcement) => (
                    <div key={announcement.announcement_id} className="card mb-3 border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className={`badge ${getTagColor(announcement.tag)} text-white`}>
                            {announcement.tag}
                          </span>
                          <div className="d-flex align-items-center gap-3">
                            <span className="text-muted small">
                              {formatDate(announcement.date)}
                            </span>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => setConfirmDelete(announcement.announcement_id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="card-text mb-4 announcement-content">
                          {announcement.content}
                        </p>
                        
                        {announcement.files?.length > 0 && (
                          <div className="mb-3">
                            <h6 className="d-flex align-items-center gap-2 mb-2">
                              <FileText size={16} />
                              Attachments
                            </h6>
                            <div className="list-group">
                              {announcement.files.map((file, index) => (
                                <a
                                  key={index}
                                  href={file.fileUrl}
                                  download
                                  className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                                >
                                  <Download size={16} />
                                  <span className="text-truncate">{file.fileName}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {announcement.links?.length > 0 && (
                          <div>
                            <h6 className="d-flex align-items-center gap-2 mb-2">
                              <ExternalLink size={16} />
                              Links
                            </h6>
                            <div className="list-group">
                              {announcement.links.map((link, index) => (
                                <a
                                  key={index}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="list-group-item list-group-item-action text-primary text-truncate"
                                >
                                  {link}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <Filter size={32} className="text-muted mb-3" />
                  <p className="text-muted">
                    {searchTerm 
                      ? 'No announcements match your search.' 
                      : selectedTag 
                        ? `No announcements with tag "${selectedTag}" found.` 
                        : 'No announcements found for this classroom.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button type="button" className="btn-close" onClick={() => setConfirmDelete(null)}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this announcement? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setConfirmDelete(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    disabled={deleteLoading}
                    onClick={() => handleDeleteAnnouncement(confirmDelete)}
                  >
                    {deleteLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Deleting...
                      </>
                    ) : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .announcement-content {
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .bg-purple {
          background-color: #6f42c1;
        }
        
        /* Custom scrollbar for announcement list */
        .announcement-list {
          max-height: calc(100vh - 300px);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #0A2647 #f1f1f1;
        }
        
        .announcement-list::-webkit-scrollbar {
          width: 8px;
        }
        
        .announcement-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .announcement-list::-webkit-scrollbar-thumb {
          background: #0A2647;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementsHub;