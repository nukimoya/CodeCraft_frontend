import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import AdminSidebar from '../../components/adminSidebar';
import { toast } from 'react-toastify';
import axios from 'axios';

const AnnouncementPage = () => {
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('general');
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [fetchingClassrooms, setFetchingClassrooms] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Fetch classrooms when component mounts
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setFetchingClassrooms(true);
        const token = user?.data?.token;
        
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5005/admin/classrooms', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // console.log('Fetched classrooms:', response.data);
        setClassrooms(response.data.classrooms || []);
      } catch (error) {
        console.error('Error fetching classrooms:', error);
        toast.error('Failed to fetch classrooms');
      } finally {
        setFetchingClassrooms(false);
      }
    };

    fetchClassrooms();
  }, [user?.data?.token, navigate]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const addLink = () => {
    if (newLink && !links.includes(newLink)) {
      setLinks([...links, newLink]);
      setNewLink('');
    }
  };

  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassroom) {
      toast.error('Please select a classroom');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('content', content);
    formData.append('tag', tag);
    formData.append('links', JSON.stringify(links));
    files.forEach(file => formData.append('files', file));

    try {
      const token = user?.data?.token;
      const response = await axios.post(
        `http://localhost:5005/admin/classrooms/${selectedClassroom}/announcements`, 
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success('Announcement posted successfully');
        navigate('/admin-view-announcements');
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to post announcement');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingClassrooms) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!fetchingClassrooms && (!classrooms || classrooms.length === 0)) {
    return (
      <div className="min-vh-100 bg-light">
        <AdminSidebar />
        <main className="p-4" style={{ marginLeft: "260px" }}>
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <i className="bi bi-exclamation-circle" style={{ fontSize: "3rem", color: "#0A2647" }}></i>
              <h2 className="mt-4 mb-3">No Classrooms Found</h2>
              <p className="text-muted mb-4">You need to create a classroom before posting announcements.</p>
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
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h3 fw-bold mb-4">Create Announcement</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Select Classroom</label>
                  <select
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Select a classroom</option>
                    {classrooms.map((classroom) => (
                      <option key={classroom.classroom_id} value={classroom.classroom_id}>
                        {classroom.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Announcement Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="form-control"
                    rows="6"
                    placeholder="Write your announcement here..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Tag</label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="form-select"
                  >
                    <option value="general">General</option>
                    <option value="important">Important</option>
                    <option value="reminder">Reminder</option>
                    <option value="assignment">Assignment</option>
                    <option value="resource">Useful Resource</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Attach Files</label>
                  <div className="input-group mb-2">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      className="form-control"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="input-group-text"
                    >
                      <i className="bi bi-upload me-2"></i>
                      Browse
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="list-group mt-2">
                      {files.map((file, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <span className="text-truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label">Add Links</label>
                  <div className="input-group mb-2">
                    <input
                      type="url"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="Enter URL"
                      className="form-control"
                    />
                    <button
                      type="button"
                      onClick={addLink}
                      className="btn btn-outline-secondary"
                    >
                      Add
                    </button>
                  </div>
                  {links.length > 0 && (
                    <div className="list-group mt-2">
                      {links.map((link, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <a href={link} target="_blank" rel="noopener noreferrer" className="text-truncate text-primary">
                            {link}
                          </a>
                          <button
                            type="button"
                            onClick={() => removeLink(index)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedClassroom}
                  className="btn btn-primary text-white w-100 py-2"
                  style={{ backgroundColor: '#0A2647', borderColor: '#0A2647' }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Posting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Post Announcement
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnnouncementPage;