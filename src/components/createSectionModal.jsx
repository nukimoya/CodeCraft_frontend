import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/authContext';

const CreateSectionModal = ({ isOpen, onClose, classroomId, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    courseTitle: '',
    courseCode: '',
    courseDifficulty: 'Beginner',
    courseDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = user?.data?.token;
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!classroomId) {
        throw new Error('No classroom ID provided');
      }

      const response = await fetch(`http://localhost:5005/Admin/classrooms/${classroomId}/course-sections/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          courseTitle: formData.courseTitle,
          courseCode: formData.courseCode,
          courseDifficulty: formData.courseDifficulty,
          courseDescription: formData.courseDescription
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to create section');
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        setFormData({
          courseTitle: '',
          courseCode: '',
          courseDifficulty: 'Beginner',
          courseDescription: ''
        });
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="modal-backdrop fade show position-fixed top-0 start-0 w-100 h-100" 
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.99)',
          backdropFilter: 'blur(4px)',
          zIndex: 1999 
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="modal fade show d-block" 
        style={{ zIndex: 2000 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create Course Section</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Course Title</label>
                  <input
                    type="text"
                    name="courseTitle"
                    value={formData.courseTitle}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., Introduction to Programming"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Course Code</label>
                  <input
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., CSC101"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Course Description</label>
                  <textarea
                    name="courseDescription"
                    value={formData.courseDescription}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter a brief description of the course"
                    rows="3"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Course Difficulty</label>
                  <select
                    name="courseDifficulty"
                    value={formData.courseDifficulty}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={loading}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success text-center">
                    Course section created successfully!
                  </div>
                )}

                <div className="modal-footer px-0 pb-0">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-outline-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.courseTitle || !formData.courseCode || !formData.courseDescription}
                    className="btn btn-dark"
                    style={{ backgroundColor: '#0A2647', borderColor: '#0A2647' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Section'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateSectionModal;
