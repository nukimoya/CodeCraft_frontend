import React, { useState, useContext } from 'react';
import {  
  FaEdit,
  FaUser,
  FaEnvelope,
  FaUserTag
} from 'react-icons/fa';
import { useAxios } from "../../config/api";
import AdminSidebar from '../../components/adminSidebar';
import { AuthContext } from "../../context/authContext";

const AdminProfile = () => {
  const { user, dispatch } = useContext(AuthContext);
  const api = useAxios();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user?.data?.user?.username || "",
    email: user?.data?.user?.email || "",
    // Level: user?.data?.user?.Level || "",
    // role: user?.data?.user?.role || "",
  });

  const formatRole = (role) => {
    if (!role) return "Unknown";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!user?.data?.token) throw new Error("No authentication token found.");

      const response = await api.put("/admin/profile/update", editForm);

      if (response.status !== 200) {
        throw new Error(response.data.message || "Error updating profile.");
      }

      dispatch({
        type: "UPDATE_USER",
        payload: { user: editForm }
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100">
      <AdminSidebar />
      <main className="flex-grow-1 p-4" style={{ marginLeft: "260px" }}>
        <div className="container-fluid">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 fw-bold">Admin Profile Information</h1>
                <button
                  onClick={() => !isLoading && setIsEditing(!isEditing)}
                  className="btn btn-outline-primary d-flex align-items-center gap-2"
                  disabled={isLoading}
                >
                  <FaEdit />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleEditSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        name="username"
                        className="form-control"
                        value={editForm.username}
                        onChange={handleEditFormChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="text"
                        name="email"
                        className="form-control"
                        value={editForm.email}
                        onChange={handleEditFormChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Saving Changes...
                      </>
                    ) : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <>
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <FaUser className="text-muted me-2" size={20} />
                        <div>
                          <small className="text-muted d-block">Username</small>
                          <span className="fw-medium">{user.data.user.username}</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <FaEnvelope className="text-muted me-2" size={20} />
                        <div>
                          <small className="text-muted d-block">Email</small>
                          <span className="fw-medium">{user.data.user.email}</span>
                        </div>
                      </div>
                    </div>
                    {/* Admin has no level */}
                    {/* <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <FaLevel className="text-muted me-2" size={20} />
                        <div>
                          <small className="text-muted d-block">Level</small>
                          <span className="fw-medium">{user.data.user.level}</span>
                        </div>
                      </div>
                    </div> */}
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <FaUserTag className="text-muted me-2" size={20} />
                        <div>
                          <small className="text-muted d-block">Role</small>
                          <span className="fw-medium">{formatRole(user.data.user.role)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h2 className="h5 fw-bold mb-3">Activity Statistics</h2>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card border-primary bg-opacity-10">
                        <div className="card-body">
                          <small className="text-primary">Current Streak</small>
                          <h3 className="fw-bold text-primary mb-0">{user.data.user.current_streak || 0} days</h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-success bg-opacity-10">
                        <div className="card-body">
                          <small className="text-success">Total Active Days</small>
                          <h3 className="fw-bold text-success mb-0">{user.data.user.total_active_days || 0} days</h3>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-warning bg-opacity-10">
                        <div className="card-body">
                          <small className="text-warning">Highest Streak</small>
                          <h3 className="fw-bold text-warning mb-0">{user.data.user.highest_streak || 0} days</h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfile;
