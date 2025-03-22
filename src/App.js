import './App.css';
// import { useLastLocation } from './hooks/useLastLocation';
import React, { useContext } from 'react';
import { createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate
 } from 'react-router-dom';

import Login from './generalpages/Login.jsx';
import Signup from './generalpages/Signup.jsx';
import LandingPage from './generalpages/LandingPage.jsx';
import LearnerDashboard from './generalpages/learner/learnerDashboard.jsx'
import AdminDashboard from './generalpages/admin/adminDashboard.jsx';
import LearnerProfile from './generalpages/learner/learnerProfile.jsx';
import { AuthContext } from './context/authContext.jsx';
import LearnerClassroomPage from './generalpages/learner/learnerClassroom.jsx';
import { StudentClassroomProvider } from './context/learnerClassroomContext.jsx';
import AdminProfile from './generalpages/admin/adminProfile.jsx';
import ClassroomPage from './generalpages/admin/adminClassroom.jsx';
import { ClassroomProvider } from './context/classroomContext.jsx';
import CourseSectionPage from './generalpages/admin/courseSectionPage.jsx';
import AnnouncementPage from './generalpages/admin/adminAnnouncement.jsx';
import AnnouncementsHub from './generalpages/admin/adminAnnouncementView.jsx'
import StudentSectionPage from './generalpages/learner/studentSectionPage.jsx';
import LearnerAnnouncements from './generalpages/learner/learnerAnnouncement.jsx';
import LearnerLeaderboard from './generalpages/learner/learnerLeaderboard.jsx';
import AdminLeaderboard from './generalpages/admin/adminLeaderboard.jsx';

function App() {
  // useLastLocation();
  const { user } = useContext(AuthContext);
  const ActiveUser = user?.data?.user || null;

  console.log("User Role:", ActiveUser?.role);



  const router = createBrowserRouter(
    createRoutesFromElements(
    <Route>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={!ActiveUser? <Login/> : <Navigate to="/dashboard"/> } />

      <Route 
        path="/dashboard" element={ActiveUser? (ActiveUser.role === "Admin"? <AdminDashboard/> 
      : <LearnerDashboard/>) : <Navigate to="/login"/>
      } />

      <Route path="/signup" element={<Signup />} />

      <Route 
        path="/learner-profile" element={ActiveUser ? <LearnerProfile/> 
      : <Navigate to="/login"/>} />

      <Route 
        path="/admin-profile" element={ActiveUser ? <AdminProfile/> 
      : <Navigate to="/login"/>} />

      <Route 
        path="/learner-classroom/" 
        element={
          ActiveUser ? (
            <StudentClassroomProvider>
              <LearnerClassroomPage />
            </StudentClassroomProvider>
          ) : (
            <Navigate to="/login"/>
          )
        } 
      />

      <Route 
        path="/learner-classroom/:classroomId/section/:sectionId" 
        element={
          ActiveUser ? (
            <StudentClassroomProvider>
              <StudentSectionPage />
            </StudentClassroomProvider>
          ) : (
            <Navigate to="/login"/>
          )
        } 
      />

      <Route
        path="/learner-announcements"
        element={
          ActiveUser ? <StudentClassroomProvider>
            <LearnerAnnouncements />
            </StudentClassroomProvider>
          : <Navigate to="/login" />
        }
      />

      <Route
        path="/learner-leaderboard"
        element={
          ActiveUser ? <StudentClassroomProvider>
            <LearnerLeaderboard />
          </StudentClassroomProvider>
          : <Navigate to="/login" />
        }
      />

      {/* admin routes */}
      <Route 
        path="/admin-classroom/:classroomId?" 
        element={
          ActiveUser ? (
            <ClassroomProvider><ClassroomPage /></ClassroomProvider>
          ) : (
            <Navigate to="/login"/>
          )
        } 
      />

      <Route
       path="/admin-classroom/:classroomId/section/:sectionId"
        element={
        ActiveUser ? <CourseSectionPage /> 
        : <Navigate to="/login"/>
        } />

      <Route
        path="/create-announcements"
        element={
          ActiveUser ? <ClassroomProvider><AnnouncementPage /></ClassroomProvider>
          : <Navigate to="/login"/>
        }
      />

      <Route
        path="/admin-view-announcements"
        element={
          ActiveUser ? <ClassroomProvider><AnnouncementsHub /></ClassroomProvider>
          : <Navigate to="/login"/>
        }
      />

      <Route
        path="/admin-leaderboard"
        element={
          ActiveUser ? <ClassroomProvider><AdminLeaderboard /></ClassroomProvider>
          : <Navigate to="/login"/>
        }
      />
      {/* <Route path="/logout" element={<Logout />} /> */}

      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Route>
    )
  );
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
