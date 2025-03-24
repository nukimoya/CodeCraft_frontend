import React, { useState, useContext, useEffect, useCallback } from "react";
import StudentSidebar from "../../components/learnerSidebar.jsx";
import { FaCode, FaEdit, FaUser, FaEnvelope, FaTrophy, FaUserTag } from "react-icons/fa";
// import axios from "axios";
import { AuthContext } from "../../context/authContext";
import { useAxios } from "../../config/api.js";

// Add this utility function at the top of your file
const calculateLevel = (xp) => {
  // Simple level formula: level = sqrt(xp / 100) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const calculateXpForNextLevel = (level) => {
  // XP needed for next level
  return Math.pow(level, 2) * 100;
};

// Convert numeric level to named rank
const getLevelRank = (level) => {
  if (level < 5) return "Rookie";
  if (level < 10) return "Apprentice";
  if (level < 15) return "Veteran";
  if (level < 20) return "Elite";
  if (level < 25) return "Pro";
  if (level < 30) return "Master";
  if (level < 35) return "Grandmaster";
  return "Legendary";
};

const LearnerProfile = () => {
  const { user, dispatch } = useContext(AuthContext);
  const api = useAxios();
  const [isEditing, setIsEditing] = useState(false);
  const [userStats, setUserStats] = useState({
    current_streak: 0,
    highest_streak: 0,
    total_active_days: 0,
    xp: 0
  });
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line
  const [error, setError] = useState(null);
  const [editForm, setEditForm] = useState({
    username: user?.data?.user?.username || "",
    email: user?.data?.user?.email || "",
    Level: user?.data?.user?.Level || "",
    role: user?.data?.user?.role || "qwerty",
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.data?.user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const token = user.data.token;
        const userId = user.data.user.id;
        
        const response = await fetch(`http://localhost:5005/learner/${userId}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user stats: ${response.status}`);
        }
        
        const data = await response.json();
        // console.log('Fetched user stats:', data);
        
        setUserStats({
          current_streak: data?.user?.current_streak,
          highest_streak: data?.user?.highest_streak,
          total_active_days: data?.user?.total_active_days,
          xp: data?.user?.xp || user?.data?.user?.xp || 0
        });
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setError('Failed to load your stats. Please try again later.');
        
        // Fallback to user data from context if API fails
        setUserStats({
          current_streak: user?.data?.user?.current_streak || 0,
          highest_streak: user?.data?.user?.highest_streak || 0,
          total_active_days: user?.data?.user?.total_active_days || 0,
          xp: user?.data?.user?.xp || 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStats();
  }, [user?.data?.user?.id, user?.data?.token, user?.data?.user]);

  // Fetch XP directly from the database
  const [userXp, setUserXp] = useState(0);
  const fetchUserXp = useCallback(async () => {
    try {
      const token = user?.data?.token;
      const response = await fetch(`http://localhost:5005/learner/${user?.data?.user?.id}/xp`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch XP');
      }

      const data = await response.json();
      setUserXp(data.xp || 0);
    } catch (error) {
      console.error('Error fetching XP:', error);
      setUserXp(0);
    }
  }, [user?.data?.token, user?.data?.user?.id]);

  useEffect(() => {
    fetchUserXp();
  }, [fetchUserXp]);

  // Calculate level and XP progress
  const currentLevel = calculateLevel(userXp);
  const nextLevelXp = calculateXpForNextLevel(currentLevel);
  const previousLevelXp = calculateXpForNextLevel(currentLevel - 1);
  const xpProgress = ((userXp - previousLevelXp) / (nextLevelXp - previousLevelXp)) * 100;
  const xpNeeded = nextLevelXp - userXp;
  const levelRank = getLevelRank(currentLevel);

  const formatRole = (role) => {
    if (!role) return "Unknown";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user?.data?.token) throw new Error("No authentication token found.");

      const response = await api.put("/student/profile/update", editForm);

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
      setLoading(false);
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
    <div className="min-vh-100 bg-light">
      <StudentSidebar />
      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="container">
          <div className="card shadow-sm p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h4">Student Profile Information</h1>
              <button
                onClick={() => !loading && setIsEditing(!isEditing)}
                className="btn btn-outline-primary d-flex align-items-center"
                disabled={loading}
              >
                <FaEdit className="me-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editForm.username}
                      onChange={handleEditFormChange}
                      className="form-control"
                      disabled={loading}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-dark mt-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving Changes...
                    </>
                  ) : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="row g-3">
                <div className="col-md-6 d-flex align-items-center">
                  <FaUser className="text-secondary me-2" />
                  <div>
                    <p className="small text-muted mb-0">UserName</p>
                    <p className="fw-semibold">{user.data.user.username}</p>
                  </div>
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <FaEnvelope className="text-secondary me-2" />
                  <div>
                    <p className="small text-muted mb-0">Email</p>
                    <p className="fw-semibold">{user.data.user.email}</p>
                  </div>
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <FaCode className="text-secondary me-2" />
                  <div>
                    <p className="small text-muted mb-0">Level</p>
                    <p className="fw-semibold">{user.data.user.level}</p>
                  </div>
                </div>

                <div className="col-md-6 d-flex align-items-center">
                  <FaUserTag className="text-secondary me-2" />
                  <div>
                    <p className="small text-muted mb-0">Role</p>
                    <p className="fw-semibold">{formatRole(user.data.user.role)}</p>
                  </div>
                </div>

                {/* XP Section */}
                <div className="col-12">
                  <div className="card border-warning mb-3">
                    <div className="card-header bg-warning text-white">
                      <FaTrophy className="me-2" />
                      Experience Points (XP)
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <h5 className="card-title mb-1">Current Level</h5>
                          <p className="card-text text-muted mb-0">
                            {levelRank} (Level {currentLevel})
                          </p>
                        </div>
                        <div className="text-end">
                          <h5 className="card-title mb-1">Total XP</h5>
                          <p className="card-text text-muted mb-0">
                            {userXp.toLocaleString()} XP
                          </p>
                        </div>
                      </div>
                      <div className="progress mb-3" style={{ height: "10px" }}>
                        <div
                          className="progress-bar bg-warning"
                          role="progressbar"
                          style={{ width: `${xpProgress}%` }}
                          aria-valuenow={xpProgress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <p className="card-text small text-muted mb-0">
                        {xpNeeded.toLocaleString()} XP needed for Level {currentLevel + 1}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h2 className="h5">Activity Statistics</h2>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card border-primary text-primary p-3">
                        <p className="small mb-0">Current Streak</p>
                        <h4>{userStats.current_streak || 0} days</h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-success text-success p-3">
                        <p className="small mb-0">Highest Streak</p>
                        <h4>{userStats.highest_streak || 0} days</h4>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card border-warning text-warning p-3">
                        <p className="small mb-0">Total Active Days</p>
                        <h4>{userStats.total_active_days || 0} days</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnerProfile;
