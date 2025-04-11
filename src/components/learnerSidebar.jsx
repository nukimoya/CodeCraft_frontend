import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaUser, 
  FaSchool, 
  FaBullhorn,  
  FaSignOutAlt, 
  FaCode,
  FaTrophy
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/authContext";
import { toast } from 'react-toastify';
import axios from 'axios';

const StudentSidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  //eslint-disable-next-line
  const [classroomId, setClassroomId] = useState(null);
  const navigate = useNavigate();
  const { user, dispatch } = useContext(AuthContext);

  const handleLogout = () => {
    try {
      dispatch({ type: "LOGOUT" });
      localStorage.removeItem("user");
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  // Fetch the admin's classroom ID
  useEffect(() => {
    const fetchClassroomId = async () => {
      try {
        const token = user?.data?.token;
        if (!token){
          navigate('/login');
          return;
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        const response = await axios.get('https://codecraft-production.up.railway.app/learner/classrooms', config);
        // console.log('Admin classrooms:', response.data);
        
        if (response.data.classrooms && response.data.classrooms.length > 0) {
          setClassroomId(response.data.classrooms[0]?.classroom_id);
        }
      } catch (error) {
        console.error('Error fetching classroom:', error);
      }
    };

    fetchClassroomId();
  }, [user?.data?.token, navigate]);

  // Check if the current path is related to classrooms (including section pages)
  const isClassroomPath = () => {
    return location.pathname.includes('/learner-classroom') || 
           location.pathname.match(/\/learner-classroom\/.*\/section\/.*/);
  };

  const menuItems = [
    { 
      title: "Home", 
      path: "/dashboard", 
      isActive: location.pathname === "/dashboard",
      icon: <FaHome size={18} /> 
    },
    {
      title: "Classrooms",
      path: "/learner-classroom",
      isActive: isClassroomPath(),
      icon: <FaSchool size={18} />,
    },
    { 
      title: "Announcements", 
      path: "/learner-announcements", 
      isActive: location.pathname === "/learner-announcements",
      icon: <FaBullhorn size={18} /> 
    },
    { 
      title: "Leaderboard", 
      path: "/learner-leaderboard", 
      isActive: location.pathname === "/learner-leaderboard",
      icon: <FaTrophy size={18} /> 
    },
  ];

  const bottomMenuItems = [
    { 
      title: "Profile", 
      path: "/learner-profile", 
      isActive: location.pathname === "/learner-profile",
      icon: <FaUser size={18} /> 
    },
    { 
      title: "Logout", 
      path: "#", 
      icon: <FaSignOutAlt size={18} />, 
      onClick: handleLogout
    },
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        className="btn btn-outline-dark d-lg-none position-fixed top-0 start-0 m-3 z-3"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{ zIndex: 1060 }}
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`d-flex flex-column bg-white border-end shadow-sm position-fixed top-0 bottom-0 transition-all ${
          isMobileMenuOpen ? "start-0" : "start-n100"
        } p-3`}
        style={{ width: "260px", zIndex: 1050 }}
      >
        {/* Sidebar Header */}
        <div className="d-flex align-items-center justify-content-center py-3 border-bottom">
          <FaCode size={28} className="text-dark me-2" />
          <h4 className="mb-0 text-dark fw-bold">CodeCraft</h4>
        </div>

        {/* Navigation Items */}
        <ul className="nav flex-column mt-3">
          {menuItems.map((item) => (
            <li key={item.title} className="nav-item">
              <Link
                to={item.path || "#"}
                className={`nav-link d-flex align-items-center py-2 px-3 rounded ${
                  item.isActive ? "bg-dark text-white" : "text-dark"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="me-2">{item.icon}</span>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>

        {/* Bottom Items */}
        <div className="mt-auto border-top pt-3">
          <ul className="nav flex-column">
            {bottomMenuItems.map((item) => (
              <li key={item.title} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link d-flex align-items-center py-2 px-3 rounded ${
                    item.isActive ? "bg-dark text-white" : "text-dark"
                  }`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (item.onClick) item.onClick();
                  }}
                >
                  <span className="me-2">{item.icon}</span>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default StudentSidebar;
