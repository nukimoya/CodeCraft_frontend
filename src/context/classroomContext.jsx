import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContext';

const ClassroomContext = createContext(null);

const ClassroomProvider = ({ children }) =>  {
  const { user } = useContext(AuthContext);
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
    if (!isInitialized || userRole !== 'Admin') {
      setLoading(false);
      return;
    }

    try {
      const token = user?.data?.token;
      if (!token) throw new Error('No authentication token found.');

      const response = await fetch('https://codecraft-production.up.railway.app/Admin/classrooms', {
        headers: {
          'Authorization': `Bearer ${token}`,
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
  }, [isInitialized, userRole, user?.data?.token]);

  useEffect(() => {
    refreshUserRole();
    
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'role' || e.key === null) {
        refreshUserRole();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [userRole, isInitialized, fetchClassrooms]);

  const contextValue = {
    classrooms,
    loading,
    error,
    isInitialized,
    refreshUserRole,
    refreshClassrooms: fetchClassrooms,
    userRole,
    hasClassrooms: Boolean(classrooms?.length),
  };

  return (
    <ClassroomContext.Provider value={contextValue}>
      {children}
    </ClassroomContext.Provider>
  );
}
const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if(context === null){
    throw new Error('useClassroom must be used within a ClassroomProvider');  

  }
  return context;
};

export {ClassroomProvider , useClassroom};