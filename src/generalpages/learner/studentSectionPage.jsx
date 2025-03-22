import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Download, BookOpen, ChevronLeft, Search, CheckCircle, AlertCircle, Award, Star, Zap, Trophy, BarChart3, Loader2, ArrowUpCircle, ArrowDownCircle, MinusCircle, Target } from 'lucide-react';
import LearnerSidebar from '../../components/learnerSidebar';
import SlideQuestionAnswering from '../../components/slideQestionAnswering';
import { AuthContext } from '../../context/authContext';
import TestInstructionsModal from '../../components/testInstructionsModal';
import XpNotification from '../../components/XpNotification';
import 'animate.css';
import SlideProgressViewer from '../../components/slideProgressViewer';
import { toast } from 'react-toastify';
import { createPortal } from 'react-dom';

// Utility functions for gamification
const calculateLevel = (xp) => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const getLevelRank = (level) => {
  if (level < 5) return "Rookie";
  if (level < 10) return "Apprentice";
  if (level < 15) return "Veteran";
  if (level < 20) return "Elite";
  if (level < 25) return "Pro";
  if (level < 30) return "Master";
  if (level < 35) return "Grandmaster";
  return "Legendary";
};

const StudentSectionPage = () => {
  const { classroomId, sectionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const courseTitle = location?.state?.courseTitle || 'Course Title Unavailable';
  const courseCode = location?.state?.courseCode || 'Course Code Unavailable';
  
  const [slides, setSlides] = useState([]);
  const [pastQuestions, setPastQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('slides');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewedSlides, setViewedSlides] = useState({});
  const [isAnsweringQuestions, setIsAnsweringQuestions] = useState(false);
  const [selectedSlideForAnswering, setSelectedSlideForAnswering] = useState(null);
  const [showTestInstructions, setShowTestInstructions] = useState(false);
  const [selectedSlideForTest, setSelectedSlideForTest] = useState(null);
  const [xpNotification, setXpNotification] = useState(null);
  const [sectionCompletion, setSectionCompletion] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [viewingProgress, setViewingProgress] = useState(false);
  const [progressData, setProgressData] = useState(null);
  
  // User XP and level
  const userXp = user?.data?.user?.xp || 0;
  const currentLevel = calculateLevel(userXp);
  //eslint-disable-next-line
  const levelRank = getLevelRank(currentLevel);

  useEffect(() => {
    const userId = user?.data?.user?.id;
    
    if (userId) {
      const saved = localStorage.getItem(`viewed-slides-${sectionId}-${userId}`);
      setViewedSlides(saved ? JSON.parse(saved) : {});
    }
  }, [sectionId, user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = user?.data?.token;
        
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }
        
        const slidesUrl = `http://localhost:5005/learner/classrooms/${classroomId}/sections/${sectionId}/slides`;
        const pqUrl = `http://localhost:5005/learner/classrooms/${classroomId}/sections/${sectionId}/past-questions`;

        const [slidesRes, pqRes] = await Promise.all([
          fetch(slidesUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }),
          fetch(pqUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          })
        ]);

        if (!slidesRes.ok || !pqRes.ok) {
          throw new Error(`Failed to fetch course materials`);
        }

        const slidesData = await slidesRes.json();
        const pqData = await pqRes.json();

        setSlides(slidesData.slides || []);
        setPastQuestions(pqData.pastQuestions || []);
      } catch (error) {
        setError('Failed to load course materials. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.data?.token) {
      fetchData();
    }
  }, [classroomId, sectionId, user]);

  // Award XP for viewing a slide
  const markAsViewed = async (slideId) => {
    const userId = user?.data?.user?.id;
    if (!userId) return;
    
    // Only award XP if this is the first time viewing
    if (!viewedSlides[slideId]) {
      // Award XP
      try {
        const token = user?.data?.token;
        const response = await fetch(`http://localhost:5005/users/${userId}/xp`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: 15,
            reason: 'Viewed a new slide',
            activity_type: 'slide_view'
          })
        });
        
        if (response.ok) {
          // Show XP notification
          setXpNotification({
            amount: 15,
            reason: 'Viewed a new slide'
          });
          
          // Hide notification after 3 seconds
          setTimeout(() => {
            setXpNotification(null);
          }, 3000);
        }
      } catch (error) {
        console.error('Error awarding XP:', error);
      }
    }
    
    // Mark as viewed in local storage
    const newViewedSlides = { ...viewedSlides, [slideId]: new Date().toISOString() };
    setViewedSlides(newViewedSlides);
    localStorage.setItem(`viewed-slides-${sectionId}-${userId}`, JSON.stringify(newViewedSlides));
    
    // Check for achievements
    checkAchievements(newViewedSlides);
  };

  // Check for achievements based on progress
  const checkAchievements = (viewedSlides) => {
    const viewedCount = Object.keys(viewedSlides).length;
    const totalSlides = slides.length;
    const progress = totalSlides > 0 ? (viewedCount / totalSlides) * 100 : 0;
    setSectionCompletion(progress);
    
    // Define achievements
    const newAchievements = [];
    
    // First slide viewed
    if (viewedCount === 1 && !achievements.includes('first_slide')) {
      newAchievements.push({
        id: 'first_slide',
        title: 'First Step',
        description: 'Viewed your first slide in this section',
        icon: '🎯',
        xp: 25
      });
    }
    
    // 25% completion
    if (progress >= 25 && progress < 50 && !achievements.includes('quarter_complete')) {
      newAchievements.push({
        id: 'quarter_complete',
        title: 'Getting Started',
        description: 'Completed 25% of this section',
        icon: '🔄',
        xp: 50
      });
    }
    
    // 50% completion
    if (progress >= 50 && progress < 75 && !achievements.includes('half_complete')) {
      newAchievements.push({
        id: 'half_complete',
        title: 'Halfway There',
        description: 'Completed 50% of this section',
        icon: '⏱️',
        xp: 75
      });
    }
    
    // 75% completion
    if (progress >= 75 && progress < 100 && !achievements.includes('three_quarters_complete')) {
      newAchievements.push({
        id: 'three_quarters_complete',
        title: 'Almost There',
        description: 'Completed 75% of this section',
        icon: '🔋',
        xp: 100
      });
    }
    
    // 100% completion
    if (progress === 100 && !achievements.includes('section_complete')) {
      newAchievements.push({
        id: 'section_complete',
        title: 'Section Master',
        description: 'Completed 100% of this section',
        icon: '🏆',
        xp: 200
      });
    }
    
    // Award achievements
    if (newAchievements.length > 0) {
      // Add to achievements list
      setAchievements(prev => [...prev, ...newAchievements.map(a => a.id)]);
      
      // Show achievement notification
      newAchievements.forEach(achievement => {
        // Award XP for achievement
        awardXp(achievement.xp, `Achievement: ${achievement.title}`);
        
        // Show notification (you'll need to implement this)
        // showAchievementNotification(achievement);
      });
    }
  };

  // Award XP function
  const awardXp = async (amount, reason) => {
    try {
      const userId = user?.data?.user?.id;
      const token = user?.data?.token;
      
      const response = await fetch(`http://localhost:5005/users/${userId}/xp_update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          reason,
          activity_type: 'achievement'
        })
      });
      
      if (response.ok) {
        // Show XP notification
        setXpNotification({
          amount,
          reason
        });
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setXpNotification(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  };

  const getProgress = () => {
    if (slides.length === 0) return 0;
    return Math.round((Object.keys(viewedSlides).length / slides.length) * 100);
  };

  const filterItems = (items) => {
    return items.filter(item => 
      item.slide_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.past_question_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleTakeTestClick = (slide) => {
    setSelectedSlideForTest(slide);
    setShowTestInstructions(true);
  };

  const handleCloseInstructions = () => {
    setShowTestInstructions(false);
    setSelectedSlideForTest(null);
  };

  const handleBeginTest = () => {
    setShowTestInstructions(false);
    setSelectedSlideForAnswering(selectedSlideForTest);
    setIsAnsweringQuestions(true);
  };
  const calculateTrend = (scores) => {
    if (!scores || scores.length < 2) return {
      text: <span className="text-secondary">Not enough data</span>,
      status: "neutral"
    };
    
    const firstScore = scores[scores.length - 1]?.score || 0;
    const lastScore = scores[0]?.score || 0;
    
    if (lastScore > firstScore) return {
      text: <span className="text-success">Improving</span>,
      status: "Improving"
    };
    if (lastScore < firstScore) return {
      text: <span className="text-danger">Declining</span>,
      status: "Declining"
    };
    return {
      text: <span className="text-secondary">Stable</span>,
      status: "neutral"
    };
  };

  const getTrendIcon = (trend) => {
    switch (trend.status) {
      case "Improving":
        return <ArrowUpCircle className="text-success" size={20} />;
      case "Declining":
        return <ArrowDownCircle className="text-danger" size={20} />;
      default:
        return <MinusCircle className="text-secondary" size={20} />;
    }
  };

  const fetchProgressData = async (slide) => {
    try {
      setLoadingProgress(true);
      const token = user?.data?.token;
      
      // Debug: Log request details
      // console.log('Fetching progress data for:', {
      //   slideId: slide.slide_id,
      //   classroomId,
      //   sectionId,
      //   tokenExists: !!token
      // });

      const apiUrl = `http://localhost:5005/learner/classrooms/${classroomId}/sections/${sectionId}/slides/${slide.slide_id}/slides-progress`;
      // console.log('API URL:', apiUrl);

      // Debug: Log headers
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };
      // console.log('Request headers:', headers);

      const response = await fetch(apiUrl, { headers });

      // Debug: Log response details
      // console.log('Response status:', response.status);
      // console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Debug: Log error details
        const errorText = await response.text();
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch progress data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Debug: Log successful response data
      // console.log('Progress data received:', data);

      // Validate expected data structure
      if (!data || !data.progressSummary) {
        console.error('Invalid data structure received:', data);
        throw new Error('Invalid response format');
      }

      setProgressData(data);
      setViewingProgress(true);
      
      // Debug: Log state update
      // console.log('State updated successfully');

    } catch (err) {
      // Debug: Enhanced error logging
      console.error('Error in fetchProgressData:', {
        message: err.message,
        stack: err.stack,
        slide,
        classroomId,
        sectionId
      });
      
      // More specific error messages
      if (err.message.includes('Failed to fetch')) {
        toast.error('Network error: Please check your connection');
      } else if (err.message.includes('Invalid response format')) {
        toast.error('Server returned unexpected data format');
      } else {
        toast.error(`Error: ${err.message}`);
      }
    } finally {
      setLoadingProgress(false);
      // Debug: Log completion
      // console.log('Progress data fetch completed');
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-dark mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading course materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <LearnerSidebar />
      <main className="p-4" style={{ marginLeft: "260px" }}>
        {isAnsweringQuestions && selectedSlideForAnswering ? (
          <SlideQuestionAnswering
            classroomId={classroomId}
            sectionId={sectionId}
            slideId={selectedSlideForAnswering.slide_id}
            slideInfo={selectedSlideForAnswering}
            onClose={handleCloseInstructions}
          />
        ) : (
          <div className="container-fluid">
            <div className="card shadow-sm mb-4">
              <div className="card-body p-4">
                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-link text-decoration-none text-muted p-0 mb-3 d-flex align-items-center"
                >
                  <ChevronLeft size={18} />
                  <span>Back to Classroom</span>
                </button>
                
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                  <div>
                    <h1 className="h3 fw-bold mb-1">{courseTitle}</h1>
                    <p className="text-muted mb-0">{courseCode}</p>
                  </div>
                  <div className="mt-3 mt-md-0 text-md-end">
                    {/* Gamified Progress Display */}
                    <div className="d-flex flex-column w-100">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex align-items-center">
                          <div className="me-2 d-flex align-items-center">
                            <CheckCircle size={14} className="text-success me-1" />
                            <span className="small fw-medium">
                              {Object.keys(viewedSlides).length} of {slides.length}
                            </span>
                          </div>
                          <div className="badge bg-light text-dark border">
                            <Trophy size={12} className="text-warning me-1" />
                            <span className="small">{getProgress()}% Complete</span>
                          </div>
                        </div>
                        <div>
                          {getProgress() === 100 ? (
                            <span className="badge bg-success px-2 py-1">
                              <Star size={12} className="me-1" />
                              Section Mastered!
                            </span>
                          ) : (
                            <span className="small text-primary">
                              {slides.length - Object.keys(viewedSlides).length} slides remaining
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div 
                          className="progress-bar bg-success" 
                          role="progressbar" 
                          style={{ 
                            width: `${getProgress()}%`,
                            transition: "width 0.5s ease-in-out"
                          }}
                          aria-valuenow={getProgress()} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Banner - Show when a milestone is reached */}
            {sectionCompletion >= 50 && sectionCompletion < 75 && (
              <div className="card bg-primary text-white mb-4 border-0 shadow">
                <div className="card-body p-3 d-flex align-items-center">
                  <div className="me-3 p-2 bg-white bg-opacity-25 rounded-circle">
                    <Award size={24} />
                  </div>
                  <div>
                    <h5 className="mb-0">Halfway Milestone Reached!</h5>
                    <p className="mb-0">You've completed 50% of this section. Keep going!</p>
                  </div>
                  <div className="ms-auto">
                    <span className="badge bg-white text-primary p-2">+75 XP</span>
                  </div>
                </div>
              </div>
            )}

            {sectionCompletion === 100 && (
              <div className="card bg-success text-white mb-4 border-0 shadow">
                <div className="card-body p-3 d-flex align-items-center">
                  <div className="me-3 p-2 bg-white bg-opacity-25 rounded-circle">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h5 className="mb-0">Section Mastered!</h5>
                    <p className="mb-0">Congratulations! You've completed all slides in this section.</p>
                  </div>
                  <div className="ms-auto">
                    <span className="badge bg-white text-success p-2">+200 XP</span>
                  </div>
                </div>
              </div>
            )}

            <div className="card shadow-sm">
              <div className="card-header bg-white p-3 border-bottom">
                <div className="position-relative">
                  <Search className="position-absolute top-50 translate-middle-y ms-3" size={18} />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control ps-5"
                  />
                </div>
              </div>
              
              <div className="border-bottom">
                <ul className="nav nav-tabs border-0">
                  <li className="nav-item">
                    <button
                      onClick={() => setActiveTab('slides')}
                      className={`nav-link border-0 rounded-0 px-4 py-3 ${
                        activeTab === 'slides' ? 'active fw-medium border-bottom border-dark border-3' : 'text-muted'
                      }`}
                    >
                      Course Slides
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      onClick={() => setActiveTab('pastQuestions')}
                      className={`nav-link border-0 rounded-0 px-4 py-3 ${
                        activeTab === 'pastQuestions' ? 'active fw-medium border-bottom border-dark border-3' : 'text-muted'
                      }`}
                    >
                      Extra Content
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body p-4">
                {activeTab === 'slides' && (
                  <div className="row g-4">
                    {filterItems(slides).length > 0 ? (
                      filterItems(slides).map((slide) => (
                        <div key={slide.slide_number} className="col-md-6 col-lg-4">
                          <div className="card h-100 border" style={{ minHeight: '200px' }}>
                            <div className="card-body p-3 d-flex flex-column">
                              <div>
                                <div className="d-flex align-items-center mb-3" style={{ minHeight: '28px' }}>
                                  <div className="d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                                    <BookOpen className="text-muted" size={18} />
                                  </div>
                                  <h5 className="card-title mb-0 ml-2 fw-medium">{slide.slide_name}</h5>
                                </div>
                                <div className="d-flex align-items-center mb-3" style={{ minHeight: '24px' }}>
                                  <span className="badge bg-light text-dark me-2">Slide {slide.slide_number}</span>
                                  {viewedSlides[slide.slide_id] ? (
                                    <span className="badge bg-success-subtle text-success d-flex align-items-center">
                                      <CheckCircle size={12} className="me-1" />
                                      Viewed
                                    </span>
                                  ) : (
                                    <span className="badge bg-warning-subtle text-warning d-flex align-items-center">
                                      <Star size={12} className="me-1" />
                                      +15 XP
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mt-auto">
                                <div className="d-flex gap-2">
                                  <a
                                    href={slide.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => markAsViewed(slide.slide_id)}
                                    className="btn btn-outline-secondary flex-grow-1 btn-sm"
                                    style={{ height: '32px' }}
                                  >
                                    <Download size={14} className="me-1" />
                                    Download
                                  </a>
                                  <button
                                    onClick={() => handleTakeTestClick(slide)}
                                    className="btn btn-dark flex-grow-1 btn-sm"
                                    style={{ height: '32px' }}
                                  >
                                    <Zap size={14} className="me-1" />
                                    Take Test
                                  </button>
                                  <button
                                    onClick={() => fetchProgressData(slide)}
                                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                                    title="View Progress"
                                    disabled={loadingProgress}
                                  >
                                    {loadingProgress ? (
                                      <Loader2 className="spinner-border spinner-border-sm" />
                                    ) : (
                                      <>
                                        <BarChart3 size={18} />
                                       
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center py-5 bg-light rounded">
                        <p className="text-muted mb-0">
                          {searchQuery ? 'No matching slides found.' : 'No slides available yet'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'pastQuestions' && (
                  <div className="row g-4">
                    {filterItems(pastQuestions).length > 0 ? (
                      filterItems(pastQuestions).map((pq) => (
                        <div key={pq.past_question_id} className="col-md-6 col-lg-4">
                          <div className="card h-100 border">
                            <div className="card-body p-3">
                              <div className="d-flex align-items-center mb-3">
                                <FileText className="text-muted me-2" size={18} />
                                <h5 className="card-title mb-0 fw-medium">{pq.past_question_name}</h5>
                              </div>
                              <div className="list-group list-group-flush">
                                {pq.file_urls?.map((url, index) => (
                                  <a
                                    key={index}
                                    href={url}
                                    download
                                    className="list-group-item list-group-item-action d-flex align-items-center py-2 px-3 border-0"
                                  >
                                    <Download size={16} className="me-2 text-muted" />
                                    <span className="text-truncate">{pq.file_names?.[index] || `File ${index + 1}`}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center py-5 bg-light rounded">
                        <p className="text-muted mb-0">
                          {searchQuery ? 'No matching past questions found.' : 'No past questions available yet'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center mt-4" role="alert">
                <AlertCircle size={18} className="me-2" />
                <div>{error}</div>
              </div>
            )}
          </div>
        )}

        <SlideProgressViewer
          slide={selectedSlideForAnswering}
          classroomId={classroomId}
          sectionId={sectionId}
          onClose={handleCloseInstructions}
        />

        <TestInstructionsModal
          isOpen={showTestInstructions}
          onClose={handleCloseInstructions}
          onBeginTest={handleBeginTest}
          testDuration={12}
        />

        {/* XP Notification */}
        {xpNotification && (
          <XpNotification 
            amount={xpNotification.amount} 
            reason={xpNotification.reason}
            onClose={() => setXpNotification(null)}
          />
        )}

        {viewingProgress && progressData && createPortal(
          <div 
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            onClick={() => !loadingProgress && setViewingProgress(false)}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          >
            <div 
              className="modal-dialog modal-lg modal-dialog-centered"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-content border-0 shadow">
                {/* Header */}
                <div className="modal-header bg-dark border-0 p-4">
                  <div className="w-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="modal-title fw-bold text-white d-flex align-items-center">
                        <BarChart3 className="me-2" size={20} />
                        Performance Analysis
                      </h5>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setViewingProgress(false)}
                        disabled={loadingProgress}
                        aria-label="Close"
                      />
                    </div>
                    <h3 className="fs-5 mb-0 text-white">{progressData.slideName}</h3>
                  </div>
                </div>

                {/* Body */}
                <div className="modal-body p-4">
                  {/* Stats Cards */}
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="card h-100 border-0 bg-primary bg-opacity-10">
                        <div className="card-body text-center p-3">
                          <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '48px', height: '48px' }}>
                            <BarChart3 className="text-primary" size={20} />
                          </div>
                          <div className="text-white  mb-2">Average Score</div>
                          <div className="display-6 fw-bold text-white">
                            {progressData.progressSummary.averageScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card h-100 border-0 bg-success bg-opacity-10">
                        <div className="card-body text-center p-3">
                          <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '48px', height: '48px' }}>
                            <Trophy className="text-success" size={20} />
                          </div>
                          <div className="text-success mb-2">Highest Score</div>
                          <div className="display-6 fw-bold text-success">
                            {progressData.progressSummary.highestScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card h-100 border-0 bg-warning bg-opacity-10">
                        <div className="card-body text-center p-3">
                          <div className=" rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '48px', height: '48px' }}>
                            <Target className="text-warning" size={20} />
                          </div>
                          <div className="text-warning mb-2">Total Attempts</div>
                          <div className="display-6 fw-bold text-warning">
                            {progressData.progressSummary.attemptCount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Trend */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="fs-6 fw-bold mb-0">Performance Trend</h4>
                        <div className="badge bg-light border px-3 py-2 d-flex align-items-center gap-2">
                          {getTrendIcon(calculateTrend(progressData.progressSummary.lastFiveScores))}
                          {calculateTrend(progressData.progressSummary.lastFiveScores).text}
                        </div>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th className="rounded-start py-2 ps-3">Attempt</th>
                              <th className="py-2">Date</th>
                              <th className="py-2">Score</th>
                              <th className="rounded-end py-2 pe-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {progressData.progressSummary.lastFiveScores.map((score, index) => (
                              <tr key={index}>
                                <td className="py-2 ps-3">#{progressData.progressSummary.lastFiveScores.length - index}</td>
                                <td className="py-2">{new Date(score.date).toLocaleDateString()}</td>
                                <td className="py-2">
                                  <span className={`badge rounded-pill ${
                                    parseFloat(score.score) >= 80 ? 'bg-success bg-opacity-10 text-success' : 
                                    parseFloat(score.score) >= 60 ? 'bg-primary bg-opacity-10 text-primary' : 
                                    'bg-danger bg-opacity-10 text-danger'
                                  }`}>
                                    {score.score}%
                                  </span>
                                </td>
                                <td className="py-2 pe-3">
                                  <span className={`badge rounded-pill ${
                                    score.passingStatus === 'Pass' 
                                      ? 'bg-success bg-opacity-10 text-success' 
                                      : 'bg-danger bg-opacity-10 text-danger'
                                  }`}>
                                    {score.passingStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Study Recommendations */}
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-3">
                      <h4 className="fs-6 fw-bold mb-3">Study Recommendations</h4>
                      <div className={`alert ${
                        progressData.needsImprovement 
                          ? 'bg-warning bg-opacity-10 border-warning' 
                          : 'bg-success bg-opacity-10 border-success'
                      } d-flex align-items-center gap-3 mb-0`}>
                        <i className={`bi bi-book fs-5 ${
                          progressData.needsImprovement ? 'text-warning' : 'text-success'
                        }`}></i>
                        <div className={progressData.needsImprovement ? 'text-warning' : 'text-success'}>
                          {progressData.studyRecommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer border-0 px-4 pb-4">
                  <button
                    type="button"
                    className="btn btn-primary px-4 py-2"
                    onClick={() => setViewingProgress(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </main>
    </div>
  );
};

export default StudentSectionPage;
