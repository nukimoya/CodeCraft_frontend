import axios from 'axios';
import { errorHandler } from '../errorhandler/errorhandler';
import { useAuthContext } from '../hooks/useAuthContext';

// Rename to useAxios to follow React Hook naming conventions
export const useAxios = () => {
    const { user } = useAuthContext();  // Add user here to access token

    const baseURL = 'https://code-craft-swart-xi.vercel.app/';

    const api = axios.create({
        baseURL,
        timeout:10000,
        headers: {
            'Content-Type': 'application/json',
            // Add default Authorization header if user token exists
            ...(user?.data?.token && { 
                'Authorization': `Bearer ${user.data.token}` 
            })
        }
    });

    api.interceptors.request.use((config) => {
        // Skip token for auth routes
        if (config.url === "/auth/login" || config.url === "/auth/signup") {
            return config;
        }

        // Get current token from user context
        const token = user?.data?.token;
        
        if (!token) {
            throw new Error("No authentication token found");
        }

        // Set the Authorization header
        config.headers.Authorization = `Bearer ${token}`;
        
        return config;
    },
    error => Promise.reject(error)
    );

    api.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401) {
                errorHandler(error);
            }
            return Promise.reject(error);
        }
    );

    return api;
}
