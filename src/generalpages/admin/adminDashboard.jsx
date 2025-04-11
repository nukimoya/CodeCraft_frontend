import React, { useState, useEffect, useContext } from "react";

import {
  FaTrophy,
  FaFire,
  FaMedal,
  FaChalkboardTeacher,
  FaLightbulb,
  FaUsers,
} from "react-icons/fa";
import CreateClassroomSection from "../../components/createClassroomSection";
import CreateClassroomModal from "../../components/createClassroomModal";
import AdminSidebar from "../../components/adminSidebar";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../../context/authContext";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  // Add this console log to see the full user object structure
  // console.log("Full user object:", user);

  const [dailyTip, setDailyTip] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classroomStats, setClassroomStats] = useState({
    totalStudents: 0,
    activeClassrooms: 0,
  });
  const [adminClassrooms, setAdminClassrooms] = useState([]);

  // Define the handleCreateClick function
  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  useEffect(() => {
    const fetchClassroomStats = async () => {
      try {
        const token = user?.data?.token;
        // console.log(token);
        const response = await fetch('https://codecraft-production.up.railway.app/admin/classrooms-stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setClassroomStats(data);
          // console.log(data);
        }
      } catch (error) {
        console.error('Error fetching classroom stats:', error);
      }
    };

    const fetchAdminClassrooms = async () => {
      try {
        const token = user?.data?.token;
        const response = await fetch('https://codecraft-production.up.railway.app/admin/classrooms', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAdminClassrooms(data.classrooms || []);
          // console.log("Admin classrooms:", data.classrooms);
        }
      } catch (error) {
        console.error('Error fetching admin classrooms:', error);
      }
    };

    fetchClassroomStats();
    fetchAdminClassrooms();

    const tips = [
        "Try teaching what you've learned to someone else - it's the best way to master it!",
        "Take a 5-minute break every 25 minutes to stay fresh.",
        "Stay hydrated! Your brain works better when you drink enough water.",
        "Create mind maps to connect different concepts you're learning.",
        "Set small, achievable daily goals to maintain momentum.",
      ];
    setDailyTip(tips[Math.floor(Math.random() * tips.length)]);
  }, [user?.data?.token]);

  // Get the first classroom ID if available
  const firstClassroomId = adminClassrooms.length > 0 ? adminClassrooms[0].classroom_id : null;

  return (
    <div className="d-flex min-vh-100">
      <AdminSidebar />
      <main className="flex-grow-1 p-4" style={{ marginLeft: "260px" }}>
        {/* <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} /> */}

        {/* Welcome Message */}
        <div className="mb-4">
          <h1 className="h4 fw-bold">
            {/* <FaCode className="me-2" /> */}
            Hello, {user.data.user.username}
          </h1>
          <p className="text-muted">Welcome back to CodeCraft, Tutor!</p>
        </div>

        {/* Daily Tip */}
        <div className="alert alert-primary d-flex align-items-center" role="alert">
          <FaLightbulb className="fs-4 me-3 text-primary" />
          <div>
            <h5 className="mb-1">Daily Learning Tip</h5>
            <p className="mb-0">{dailyTip}</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Current Streak</h6>
                  <h4 className="fw-bold">{user?.data?.user?.current_streak || 0} days</h4>
                </div>
                <FaFire className="text-warning fs-3" />
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Total Active Days</h6>
                  <h4 className="fw-bold">{user?.data?.user?.total_active_days || 0}</h4>
                </div>
                <FaTrophy className="text-success fs-3" />
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Highest Streak</h6>
                  <h4 className="fw-bold">{user?.data?.user?.highest_streak || 0}</h4>
                </div>
                <FaMedal className="text-warning fs-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Classroom Statistics */}
        <h2 className="h5 mt-4">
          <FaUsers className="me-2" />
          Classroom Statistics
        </h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Active Classrooms</h6>
                  <h4 className="fw-bold">{classroomStats.activeClassrooms}</h4>
                </div>
                <FaChalkboardTeacher className="text-primary fs-3" />
              </div>
            </div>
          </div>
        </div>


        {/* Create Classroom Section */}
        <div className="mt-4">
          <h2 className="h5 mb-3">
           
          </h2>
          <CreateClassroomSection 
            onCreateClick={handleCreateClick} 
            classroomId={firstClassroomId}
          />
        </div>

        <CreateClassroomModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      </main>
    </div>
  );
};

export default AdminDashboard;
