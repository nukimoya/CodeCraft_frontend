import React, { useState, useContext } from "react";
import { AiOutlineWarning } from "react-icons/ai";
import { AlertCircle } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/authContext";
import { toast } from "react-toastify";

const CreateClassroomModal = ({ isOpen, onClose, onSuccess }) => {
  // console.log('CreateClassroomModal rendered with props:', { isOpen, onClose: !!onClose, onSuccess: !!onSuccess });
  
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    console.log('Form field changed:', e.target.name, e.target.value);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started with data:', formData);
    
    setLoading(true);
    setError("");

    try {
      const token = user?.data?.token;
      console.log('Using token:', token ? 'Token exists' : 'No token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Sending request to create classroom...');
      const response = await fetch(
        "http://localhost:5005/admin/classrooms/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const data = await response.json();
        console.error('Error response:', data);
        throw new Error(data.message || "Failed to create classroom");
      }

      const responseData = await response.json();
      console.log('Success response:', responseData);

      if (!responseData || !responseData.classroom) {
        throw new Error('Invalid response data');
      }

      setSuccess(true);
      toast.success('Classroom created successfully!');

      // Call onSuccess with the classroom data
      if (onSuccess) {
        console.log('Calling onSuccess with classroom:', responseData.classroom);
        onSuccess(responseData.classroom);
      }

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error in form submission:', err);
      toast.error(err.message || 'Failed to create classroom');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) {
    // console.log('Modal is closed, returning null');
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show position-fixed top-0 start-0 w-100 h-100" 
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.99)',
          backdropFilter: 'blur(4px)',
          zIndex: 1999
        }}
        onClick={() => {
          console.log('Backdrop clicked, closing modal');
          onClose();
        }}
      ></div>

      {/* Modal */}
      <div 
        className="modal fade show d-block" 
        style={{ zIndex: 2000 }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered position-relative">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create New Classroom</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  console.log('Close button clicked');
                  onClose();
                }}
              ></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-warning d-flex align-items-start">
                <AlertCircle className="me-2" />
                <div>
                  <strong>Important Notes:</strong>
                  <ul className="mb-0 ps-3">
                    <li>
                      Tutors can only create one active classroom
                      at a time.
                    </li>
                    <li>
                      To create a new classroom, please ensure any existing
                      classroom is deactivated or deleted first.
                    </li>
                  </ul>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* <div className="mb-3">
                  <label className="form-label">Language Name</label>
                  <input
                    type="text"
                    name="course_name"
                    value={formData.course_name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g Objective C..."
                    required
                  />
                </div> */}

                <div className="mb-3">
                  <label className="form-label">Language Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., Objective C"
                    required
                  />
                </div>

                {/* <div className="mb-3">
                  <label className="form-label">Difficulty Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div> */}

                {/* <div className="mb-3">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div> */}

                {/* <div className="mb-3">
                  <label className="form-label">Session</label>
                  <input
                    type="text"
                    name="session"
                    value={formData.session}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., 2023/2024"
                    required
                    pattern="\d{4}/\d{4}"
                    title="Please enter session in format: YYYY/YYYY"
                  />
                </div> */}

                {error && (
                  <div className="alert alert-danger d-flex align-items-center">
                    <AiOutlineWarning className="me-2" />
                    <p className="mb-0">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success text-center">
                    Classroom created successfully! Check your email for the join
                    code.
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-fill"
                    onClick={() => {
                      console.log('Cancel button clicked');
                      onClose();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-dark flex-fill"
                    disabled={loading || !formData.name}
                  >
                    {loading ? "Creating..." : "Create Classroom"}
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

export default CreateClassroomModal;
