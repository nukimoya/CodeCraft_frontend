import React, { Fragment, useState } from 'react';
import { FaGamepad, FaUser, FaEnvelope, FaLock, FaShieldAlt, FaInfoCircle, FaCode, FaRocket, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, NavLink } from 'react-router';
import { toast } from 'react-toastify';
import { useAxios } from '../config/api';
import { errorHandler } from '../errorhandler/errorhandler';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [level, setLevel] = useState('');
  const [role, setRole] = useState('Learner');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const api = useAxios();

  function submitForm(e) {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword || !level || !role) {
      toast.error('Please fill in all fields.', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#FF4B4B',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#FF4B4B',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });
      return;
    }

    setLoading(true);

    api.post('/auth/signup', { username, email, password, level, role })
    .then((response) => {
      console.log(response);

      toast.success('Signup successful! Redirecting to login...', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    })
    .catch((error) => {
      console.log(error);
      errorHandler(error);
      setLoading(false);
    });
  }
  
  // Handle key press for Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      submitForm(e);
    }
  }

  return (
    <Fragment>
      <div className="container-fluid min-vh-100 d-flex flex-column bg-light">
        <header className="py-3 bg-white border-bottom border-primary shadow-sm">
          <div className="container text-center">
            <h3 className="fw-bold text-dark">
              <FaGamepad className="text-primary me-2" />
              Create Your CodeCraft Account
            </h3>
          </div>
        </header>

        <div className="container d-flex justify-content-center align-items-center flex-grow-1 py-4">
          <div className="card shadow-lg rounded-4 bg-white border-0 w-100" style={{ maxWidth: "512px" }}>
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div className="display-6 text-primary mb-2">🎮</div>
                <h4 className="text-dark">Begin Your Coding Adventure</h4>
                <p className="text-muted">Level up your programming skills!</p>
              </div>

              <form onSubmit={submitForm}>
                <div className="mb-3">
                  <label className="form-label fw-medium text-dark">
                    <FaUser className="text-primary me-2" />
                    Choose Your Username
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3 bg-light"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter a unique username"
                    disabled={loading}
                    onKeyPress={handleKeyPress}
                  />
                </div>

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
                    placeholder="Enter a valid email address"
                    disabled={loading}
                    onKeyPress={handleKeyPress}
                  />
                </div>

                <div className="mb-3 position-relative">
                  <label className="form-label fw-medium text-dark">
                    <FaLock className="text-primary me-2" />
                    Create Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control rounded-start-3 bg-light"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Must be at least 8 characters"
                      disabled={loading}
                      onKeyPress={handleKeyPress}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => !loading && setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash className="fs-5" /> : <FaEye className="fs-5" />}
                    </button>
                  </div>
                </div>

                <div className="mb-3 position-relative">
                  <label className="form-label fw-medium text-dark">
                    <FaShieldAlt className="text-primary me-2" />
                    Confirm Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control rounded-start-3 bg-light"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Passwords Must Match"
                      disabled={loading}
                      onKeyPress={handleKeyPress}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => !loading && setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash className="fs-5" /> : <FaEye className="fs-5" />}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium text-dark">
                    <FaGamepad className="text-primary me-2" />
                    Choose Your Role
                  </label>
                  <select
                    className="form-select rounded-3 bg-light"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                    onKeyPress={handleKeyPress}
                  >
                    <option value="Learner">Learner (Adventurer)</option>
                    <option value="Admin">Tutor (Game Master)</option>
                  </select>
                </div>

                <div className="alert alert-primary bg-primary bg-opacity-10 border-primary d-flex align-items-center" role="alert">
                  <FaInfoCircle className="text-primary me-2" />
                  <div className="small">
                    Choose wisely! Most players start as Learners on their coding journey.
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-medium text-dark">
                    <FaCode className="text-primary me-2" />
                    Select Your Starting Level
                  </label>
                  <select
                    className="form-select rounded-3 bg-light"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    disabled={loading}
                    onKeyPress={handleKeyPress}
                  >
                    <option value="">Choose your experience level</option>
                    <option value="Beginner">Beginner (Novice Explorer)</option>
                    <option value="Intermediate">Intermediate (Code Warrior)</option>
                    <option value="Advanced">Advanced (Master Coder)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 rounded-3 mt-4 py-2"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Your Profile...
                    </>
                  ) : (
                    <>
                      <FaRocket className="me-2" />
                      Begin Your Adventure
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-dark mt-4 mb-0">
                Already have an account? {' '}
                <NavLink to="/login" className="text-primary text-decoration-none">
                  Continue Your Journey
                </NavLink>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default Signup;
