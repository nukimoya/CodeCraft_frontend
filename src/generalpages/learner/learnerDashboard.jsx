import React, { useState, useEffect, useContext } from 'react';
import { FaFire, FaMedal, FaStar, FaTrophy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AddQuestModal from '../../components/addquestModal';
import StudentSidebar from '../../components/learnerSidebar';
import FocusMode from '../../components/focusMode';
import JoinClassroomSection from '../../components/JoinClassroomSection'; 
import { AuthContext } from '../../context/authContext';

// Add these utility functions
const calculateLevel = (xp) => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

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

// Badge mapping function
const getHighestBadge = (level) => {
  if (level < 5) return { icon: "🥉", name: "Bronze Badge" };
  if (level < 10) return { icon: "🥈", name: "Silver Badge" };
  if (level < 15) return { icon: "🥇", name: "Gold Badge" };
  if (level < 20) return { icon: "💎", name: "Diamond Badge" };
  if (level < 25) return { icon: "🏆", name: "Champion Badge" };
  if (level < 30) return { icon: "👑", name: "Crown Badge" };
  return { icon: "⚡", name: "Ultimate Badge" };
};

const LearnerDashboard = () => {
  const [dailyTip, setDailyTip] = useState("");
  const [userStats, setUserStats] = useState({
    current_streak: 0,
    highest_streak: 0,
    total_active_days: 0,
    xp: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // eslint-disable-next-line
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAddQuestModal, setShowAddQuestModal] = useState(false);
  
  // Calculate user level and rank based on fetched XP
  const currentLevel = calculateLevel(userStats.xp);
  const levelRank = getLevelRank(currentLevel);
  const highestBadge = getHighestBadge(currentLevel);

  // Fetch user stats from API
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

  useEffect(() => {
    // Check if we have a stored section URL to navigate to
    const lastSectionUrl = localStorage.getItem('lastSectionUrl');
    if (lastSectionUrl) {
      console.log("Found stored URL, navigating to:", lastSectionUrl);
      localStorage.removeItem('lastSectionUrl'); // Clear it
      navigate(lastSectionUrl); // Redirect to the stored URL
    }
  }, [navigate]);

  useEffect(() => {
    const tips = [
        "Try teaching what you've learned to someone else - it's the best way to master it!",
        "Take a 5-minute break every 25 minutes to stay fresh.",
        "Stay hydrated! Your brain works better when you drink enough water.",
        "Create mind maps to connect different concepts you're learning.",
        "Set small, achievable daily goals to maintain momentum.",
      ];

    setDailyTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  return (
    <div className="vh-100 bg-white d-flex">
      <StudentSidebar />
      {/* Main Content */}
      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="container">
          {/* Top Section with Greeting, Daily Tip, and Badge */}
          <div className="d-flex flex-column flex-md-row mt-4 mb-4">
            {/* Left Column: Greeting and Daily Tip */}
            <div className="flex-grow-1 me-md-4">
              {/* Greeting Section */}
              <div className="mb-3">
                <h1 className="h4 fw-bold">Hello, {user?.data?.user?.username}</h1>
                <p className="text-secondary mb-0">Welcome back to CodeCraft!</p>
              </div>
              
              {/* Daily Tip Card */}
              <div className="card bg-light text-dark">
                <div className="card-body d-flex align-items-start">
                  <span className="fs-3 me-3">💡</span>
                  <div>
                    <h3 className="h6 fw-bold text-primary">Daily Learning Tip</h3>
                    <p className="mb-0 text-primary">{dailyTip}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column: Badge Display */}
            <div className="mt-4 mt-md-0" style={{ minWidth: "180px" }}>
              <div className="d-flex flex-column align-items-center bg-light rounded-3 p-3 shadow-sm h-100">
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div 
                      className="badge-icon mb-2 d-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10"
                      style={{ width: "70px", height: "70px", fontSize: "2.5rem" }}
                    >
                      <span role="img" aria-label="badge">{highestBadge.icon}</span>
                    </div>
                    <h6 className="mb-1 text-center">{highestBadge.name}</h6>
                    <div className="d-flex align-items-center">
                      <FaTrophy className="text-warning me-1" size={14} />
                      <span className="small text-muted">{levelRank}</span>
                    </div>
                    <div className="d-flex align-items-center mt-1">
                      <FaStar className="text-warning me-1" size={14} />
                      <span className="small">{userStats.xp.toLocaleString()} XP</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="fs-6 text-secondary">Current Streak</h3>
                  <FaFire className="text-warning" />
                </div>
                {loading ? (
                  <div className="d-flex justify-content-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-baseline">
                    <span className="h3 fw-bold">{userStats.current_streak}</span>
                    <span className="ms-2 text-success small">days</span>
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="fs-6 text-secondary">Total Active Days</h3>
                  <span className="fs-5">⭐</span>
                </div>
                {loading ? (
                  <div className="d-flex justify-content-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-baseline">
                    <span className="h3 fw-bold">{userStats.total_active_days}</span>
                    <span className="ms-2 text-warning small">days active on CodeCraft</span>
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="fs-6 text-secondary">Highest Streak</h3>
                  <FaMedal className="text-warning" />
                </div>
                {loading ? (
                  <div className="d-flex justify-content-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-baseline">
                    <span className="h3 fw-bold">{userStats.highest_streak}</span>
                    <span className="ms-2 text-primary small">streak on CodeCraft</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Join Classroom Section */}
          <JoinClassroomSection onJoinClick={() => setShowJoinModal(true)} />

          {/* Focus Mode */}
          <FocusMode />

          {/* Modals */}
          <AddQuestModal
            isOpen={showAddQuestModal}
            onClose={() => setShowAddQuestModal(false)}
            onQuestAdded={() => {
              setShowAddQuestModal(false);
              // refreshQuests();
            }}
          />

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show mt-3" role="alert">
              <strong>Error:</strong> {error}
              <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LearnerDashboard;
