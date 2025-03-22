import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { getRole } from '../utils/auth';

const StudentClassroomContext = createContext(null);

const StudentClassroomProvider = ({ children }) => {
  const [classrooms, setClassrooms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const refreshUserRole = () => {
    const role = localStorage.getItem('role');
    setUserRole(role);
    setIsInitialized(true);
  };

  const fetchClassrooms = useCallback(async () => {
    if (!isInitialized || userRole !== 'student') {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');

      const response = await fetch('http://localhost:5005/student/classrooms', {
        headers: {
          'Authorization': token,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setClassrooms(data.classrooms);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [isInitialized, userRole]);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  // Effect for role changes
  useEffect(() => {
    refreshUserRole();
    
    const handleStorageChange = (e) => {
      if (e.key === 'role' || e.key === 'token') {
        refreshUserRole();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const contextValue = {
    classrooms,
    loading,
    error,
    isInitialized,
    refreshUserRole,
    refetchClassrooms: fetchClassrooms,
    hasClassrooms: Boolean(classrooms?.length),
    userRole
  };

  return (
    <StudentClassroomContext.Provider value={contextValue}>
      {children}
    </StudentClassroomContext.Provider>
  );
};

const useStudentClassroom = () => {
  const context = useContext(StudentClassroomContext);
  
  if (context === null) {
    throw new Error('useStudentClassroom must be used within a StudentClassroomProvider');
  }
  
  return context;
};

export { StudentClassroomProvider, useStudentClassroom };