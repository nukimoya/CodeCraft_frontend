import React from 'react';
import { useState } from 'react';
import { FaGamepad, FaEnvelope, FaLock, FaSignInAlt, FaGoogle, FaGithub, FaCode } from 'react-icons/fa';
import { NavLink } from 'react-router';
import { useAxios } from '../config/api';
import { errorHandler } from '../errorhandler/errorhandler';
import { toast } from 'react-toastify';
import { useAuthContext } from '../hooks/useAuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = useAuthContext()

    const api = useAxios();

    async function submitForm(e) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            
            localStorage.setItem("user", JSON.stringify(response));
            
            setEmail('');
            setPassword('');
            
            dispatch({type: "LOGIN", payload: response});
            
            toast.success('Login successful! Redirecting...');
            
        } catch (error) {
            console.log(error);
            errorHandler(error);
            toast.error('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    }
    
    // Handle key press for Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            submitForm(e);
        }
    }
    
    return (
        <div className="container-fluid min-vh-100 d-flex flex-column bg-light">
            <header className="py-3 bg-white border-bottom border-primary shadow-sm">
                <div className="container text-center">
                    <h3 className="fw-bold text-dark">
                        <FaGamepad className="text-primary me-2" />
                        Welcome Back to CodeCraft
                    </h3>
                </div>
            </header>

            <div className="container d-flex justify-content-center align-items-center flex-grow-1 py-4">
                <div className="card shadow-lg rounded-4 bg-white border-0 w-100" style={{ maxWidth: "450px" }}>
                    <div className="card-body p-4">
                        <div className="text-center mb-4">
                            <FaCode size={28} className="text-dark me-2 my-2" />
                            <h4 className="text-dark">Resume Your Adventure</h4>
                            <p className="text-muted">Your coding quests await!</p>
                        </div>

                        <form onSubmit={submitForm}>
                            <div className="mb-3">
                                <label className="form-label fw-medium text-dark">
                                    <FaEnvelope className="text-primary me-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    className="form-control rounded-3 bg-light"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    disabled={isLoading}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>

                            <div className="mb-3 position-relative">
                                <label className="form-label fw-medium text-dark">
                                    <FaLock className="text-primary me-2" />
                                    Password
                                </label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control rounded-start-3 bg-light"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={() => !isLoading && setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="rememberMe"
                                        disabled={isLoading}
                                    />
                                    <label className="form-check-label text-dark" htmlFor="rememberMe">
                                        Remember me
                                    </label>
                                </div>
                                <NavLink to="/forgot-password" className="text-primary text-decoration-none small">
                                    Forgot password?
                                </NavLink>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-100 rounded-3 py-2 mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Entering the Arena...
                                    </>
                                ) : (
                                    <>
                                        <FaSignInAlt className="me-2" />
                                        Continue Adventure
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="position-relative my-4">
                            <hr className="text-muted" />
                            <div className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                                OR
                            </div>
                        </div>

                        <button 
                            className="btn btn-outline-primary w-100 rounded-3 mb-3"
                            disabled={isLoading}
                        >
                            <FaGoogle className="me-2" />
                            Continue with Google
                        </button>

                        <button 
                            className="btn btn-outline-dark w-100 rounded-3"
                            disabled={isLoading}
                        >
                            <FaGithub className="me-2" />
                            Continue with GitHub
                        </button>

                        <p className="text-center text-dark mt-4 mb-0">
                            New to CodeCraft? {' '}
                            <NavLink to="/signup" className="text-primary text-decoration-none">
                                Start Your Journey
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;