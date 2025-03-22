import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { toast } from "react-toastify";
import { useAxios } from "../config/api";

const Logout = () => {
  const { dispatch } = useContext(AuthContext);
  const api = useAxios();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call logout endpoint if you have one
        // await api.post('/auth/logout');
        
        // Clear user from context
        dispatch({ type: 'LOGOUT' });
        
        // Clear local storage
        localStorage.removeItem("user");
        
        // Show success message
        toast.success('Successfully logged out. Come back soon!', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Navigate to home page
        navigate('/');

      } catch (error) {
        console.error('Logout error:', error);
        
        // Show error message but still clear local state
        toast.error('There was an issue logging out, but your local session has been cleared.', {
          position: "top-center",
          autoClose: 5000,
        });
        
        // Clear local state even if server request fails
        dispatch({ type: 'LOGOUT' });
        localStorage.removeItem("user");
        
        // Navigate to home page even if there's an error
        navigate('/');
      }
    };

    performLogout();
  }, [dispatch, api, navigate]);

  // Return null instead of Navigate component
  return null;
};

export default Logout;
