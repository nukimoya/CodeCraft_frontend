import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/landing.css";
import { NavLink } from "react-router";
import { 
  FaTrophy, FaUsers, FaRocket, FaStar, FaGamepad, FaAward, FaFire, FaInfoCircle, FaCode, FaJs, FaJava, FaPython, FaMedal, FaChartLine 
} from 'react-icons/fa';
import codingAdventureImage from "../assets/images/c614c77f-a14d-4d61-bef2-5bff99176df5.jpeg";

const LandingPage = () => {
  return (
    <div className="min-vh-100 d-flex flex-column bg-dark">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top border-bottom border-primary">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <FaGamepad className="me-2 text-primary" />
            <span className="fw-bold">Code<span className="text-primary">Craft</span></span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item"><a className="nav-link" href="#features">Quests</a></li>
              <li className="nav-item"><a className="nav-link" href="#courses">Skill Trees</a></li>
              <li className="nav-item"><a className="nav-link" href="#leaderboard">Leaderboard</a></li> 
              <li className="nav-item">
                <NavLink to="/login" className="btn btn-outline-primary ms-2">Login</NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/signup" className="btn btn-primary ms-2">Start Adventure</NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-dark text-white text-center py-5" style={{ marginTop: '56px', background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)' }}>
        <div className="container px-4">
          <div className="row flex-lg-row-reverse align-items-center g-5">
            <div className="col-10 col-sm-8 col-lg-6">
              <div className="position-relative">
                <img src={codingAdventureImage} className="d-block mx-lg-auto img-fluid rounded-3 shadow-lg" alt="Coding Adventure" />
                <div className="position-absolute top-0 end-0 bg-primary text-white px-3 py-1 rounded-pill m-2">
                  <FaFire className="me-1" /> Level Up!
                </div>
              </div>
            </div>
            <div className="col-lg-6 text-start">
              <h1 className="display-4 fw-bold mb-3">Begin Your Coding <span className="text-primary">Adventure</span></h1>
              <p className="lead mb-4">Embark on an epic journey to master programming. Complete quests, earn XP, unlock achievements, and rise through the ranks!</p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-start">
                <NavLink to="/signup" className="btn btn-primary btn-lg px-4 me-md-2 rounded-pill">
                  <FaRocket className="me-2" /> Start Your Quest
                </NavLink>
                <a href="#features" className="btn btn-outline-light btn-lg px-4 rounded-pill">View Missions</a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-5 bg-dark text-white">
        <div className="container">
          <h2 className="text-center mb-5">Epic Features</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm bg-dark border-primary">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-primary p-3 rounded-circle d-inline-block mb-3">
                    <FaTrophy className="text-white" size={40} />
                  </div>
                  <h4 className="text-primary">Achievement System</h4>
                  <p className="text-light">Unlock badges and earn XP while mastering new programming skills</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm bg-dark border-primary">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-primary p-3 rounded-circle d-inline-block mb-3">
                    <FaUsers className="text-white" size={40} />
                  </div>
                  <h4 className="text-primary">Multiplayer Challenges</h4>
                  <p className="text-light">Compete with other players in real-time coding battles</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm bg-dark border-primary">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-primary p-3 rounded-circle d-inline-block mb-3">
                    <FaStar className="text-white" size={40} />
                  </div>
                  <h4 className="text-primary">Skill Trees</h4>
                  <p className="text-light">Customize your learning path and unlock new abilities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section id="courses" className="py-5 bg-darker text-white">
        <div className="container">
          <h2 className="text-center mb-5">Choose Your Difficulty</h2>
          <div className="row g-4">
            {['Warrior (Beginner)', 'Mage (Intermediate)', 'Ranger (Advanced )'].map((path, index) => (
              <div key={index} className="col-md-4">
                <div className="card h-100 bg-dark border-primary">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <FaAward className="text-primary me-2" size={30} />
                      <h5 className="card-title mb-0 text-primary">{path}</h5>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-light">Progress</span>
                        <span className="text-primary">Level 3</span>
                      </div>
                      <div className="progress" style={{height: "10px"}}>
                        <div className="progress-bar bg-primary" style={{width: `${(index + 1) * 25}%`}} role="progressbar"></div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between text-light">
                      <small>🏆 12 Achievements</small>
                      <small>⚔️ 48 Challenges</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="p-3 rounded-3 bg-dark bg-opacity-25">
                <FaUsers className="mb-2" size={50} />
                <h2 className="display-4 fw-bold">10K+</h2>
                <p className="lead">Active Players</p>
                <h4 className="text-primary">Haffa relax o!</h4>
              </div>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="p-3 rounded-3 bg-dark bg-opacity-25">
                <FaTrophy className="mb-2" size={85} />
                <h2 className="display-4 fw-bold">50+</h2>
                <p className="lead">Challenges</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-dark bg-opacity-25">
                <FaStar className="mb-2" size={85} />
                <h2 className="display-4 fw-bold">95%</h2>
                <p className="lead">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-dark text-white">
        <div className="container text-center">
          <h2 className="mb-4">Ready to Begin Your Adventure?</h2>
          <p className="lead mb-4">Join thousands of players who have already leveled up their coding skills!</p>
          <NavLink to="/signup" className="btn btn-primary btn-lg rounded-pill">
            <FaRocket className="me-2" /> Start Your Journey
          </NavLink>
        </div>
      </section>

      {/* About Section */}
      <section className="py-5 bg-dark text-white">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm bg-dark border-primary">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-primary p-3 rounded-circle d-inline-block mb-3">
                    <FaInfoCircle className="text-white" size={40} />
                  </div>
                  <h4 className="text-primary">Platform Overview</h4>
                  <p className="text-light">
                    Discover a revolutionary way to learn programming through gamification. Our platform offers interactive quests, real-time challenges, and a supportive community to help you master coding skills.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm bg-dark border-primary">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-primary p-3 rounded-circle d-inline-block mb-3">
                    <FaCode className="text-white" size={40} />
                  </div>
                  <h4 className="text-primary">Supported Languages</h4>
                  <p className="text-light">
                    Learn and practice popular programming languages including:
                    <ul className="list-unstyled mt-2">
                      <li><FaJs className="me-2 text-warning" /> JavaScript</li>
                      <li><FaJava className="me-2 text-danger" /> Java</li>
                      <li><FaPython className="me-2 text-info" /> Python</li>
                    </ul>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm bg-dark border-primary">
                <div className="card-body text-center p-4">
                  <div className="feature-icon bg-primary p-3 rounded-circle d-inline-block mb-3">
                    <FaGamepad className="text-white" size={40} />
                  </div>
                  <h4 className="text-primary">Gamification Benefits</h4>
                  <p className="text-light">
                    Gamification enhances learning by:
                    <ul className="list-unstyled mt-2">
                      <li><FaTrophy className="me-2 text-warning" /> Earning XP points for progress</li>
                      <li><FaMedal className="me-2 text-info" /> Unlocking badges for achievements</li>
                      <li><FaChartLine className="me-2 text-success" /> Competing on leaderboards</li>
                    </ul>
                    This approach boosts motivation, attention, and retention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-darker text-white text-center py-4 mt-auto border-top border-primary">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h5 className="text-primary">CodeCraft</h5>
              <p className="small">Level up your coding skills through play.</p>
            </div>
            <div className="col-md-4">
              <h5 className="text-primary">Quick Links</h5>
              <ul className="list-unstyled">
                <li><a href="#features" className="text-white text-decoration-none">Quests</a></li>
                <li><a href="#courses" className="text-white text-decoration-none">Skill Trees</a></li>
                <li><a href="#leaderboard" className="text-white text-decoration-none">Leaderboard</a></li>
              </ul>
            </div>
            <div className="col-md-4">
              <h5 className="text-primary">Join Our Guild</h5>
              <p className="small">Follow us for daily quests and tips!</p>
            </div>
          </div>
          <hr className="border-primary" />
          <p className="small mb-0">&copy; 2024 CodeCraft. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
