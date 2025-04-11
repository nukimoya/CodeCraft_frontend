import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AlertCircle, CheckCircle2, XCircle, HelpCircle, ChevronLeft, Loader2 } from 'lucide-react';
import TestTimer from './testTimer';
import { AuthContext } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const SlideQuestionAnswering = ({
  classroomId,
  sectionId,
  slideId,
  slideInfo,
  onClose
}) => {
  // State management
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  // eslint-disable-next-line
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [detailedResults, setDetailedResults] = useState(null);
  const [showingResults, setShowingResults] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [xpEarned, setXpEarned] = useState(0);
  // eslint-disable-next-line
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [streakBonus, setStreakBonus] = useState(0);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [badgeEarned, setBadgeEarned] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const TEST_DURATION = 12; // Duration in minutes
  const navigate = useNavigate();

  // Fetch questions from API
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = user?.data?.token;
      const response = await fetch(
        `https://codecraft-production.up.railway.app/learner/classrooms/${classroomId}/sections/${sectionId}/slides/${slideId}/test`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions available');
      }
      setQuestions(data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [classroomId, sectionId, slideId, user?.data?.token]);

  // Calculate XP based on test performance
  const calculateXpReward = useCallback((score, correctAnswers, totalQuestions, timeSpent) => {
    // Base XP for completing the test
    let baseXp = 25;
    
    // XP for correct answers (10 XP per correct answer)
    let correctAnswerXp = correctAnswers * 10;
    
    // Perfect score bonus (50 XP)
    let perfectScoreBonus = correctAnswers === totalQuestions ? 50 : 0;
    
    // Speed bonus (if completed in less than 60% of allowed time)
    let speedBonusXp = 0;
    if (timeSpent < TEST_DURATION * 60 * 0.6) {
      speedBonusXp = 30;
    } else if (timeSpent < TEST_DURATION * 60 * 0.8) {
      speedBonusXp = 15;
    }
    
    // Streak bonus (if user has a streak of 3+ days)
    let streakBonusXp = 0;
    if (user?.data?.user?.current_streak >= 3) {
      streakBonusXp = Math.min(user.data.user.current_streak * 2, 20);
    }
    
    setSpeedBonus(speedBonusXp);
    setStreakBonus(streakBonusXp);
    
    return {
      total: baseXp + correctAnswerXp + perfectScoreBonus + speedBonusXp + streakBonusXp,
      breakdown: {
        base: baseXp,
        correctAnswers: correctAnswerXp,
        perfectScore: perfectScoreBonus,
        speed: speedBonusXp,
        streak: streakBonusXp
      }
    };
  }, [user?.data?.user?.current_streak]);

  // Check if user earned a badge
  const checkForBadges = useCallback((score, correctAnswers, totalQuestions) => {
    if (score >= 90) {
      return {
        icon: "🏆",
        name: "Excellence Badge",
        description: "Score 90% or higher on a quiz"
      };
    } else if (correctAnswers === totalQuestions) {
      return {
        icon: "🥇",
        name: "Perfect Score",
        description: "Answer all questions correctly"
      };
    } else if (score >= 80) {
      return {
        icon: "🥈",
        name: "High Achiever",
        description: "Score 80% or higher on a quiz"
      };
    }
    return null;
  }, []);

  // Award XP to user
  const awardXp = useCallback(async (amount, reason, activityType) => {
    try {
      const token = user?.data?.token;
      const response = await fetch(`https://codecraft-production.up.railway.app/learner/${user?.data?.user?.id}/xp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          reason,
          activity_type: activityType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to award XP');
      }

      const data = await response.json();
      console.log('XP awarded successfully:', data);
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  }, [user?.data?.token, user?.data?.user?.id]);

  // Modified submit test function with gamification
  const submitTest = useCallback(async () => {
    console.log('Starting test submission...');
    console.log('Submitted answers:', submittedAnswers);
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = user?.data?.token;
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const submissionPayload = {
        userAnswers: submittedAnswers.map(q => ({
          question_id: q.questionId,
          selected_option: q.selectedOption
        }))
      };
      console.log('Submission payload:', submissionPayload);

      const response = await fetch(
        `https://codecraft-production.up.railway.app/learner/classrooms/${classroomId}/sections/${sectionId}/slides/${slideId}/submit-test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(submissionPayload)
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Submission error:', errorData);
        throw new Error(errorData.message || 'Failed to submit test');
      }

      const data = await response.json();
      console.log('Submission response data:', data);

      // Calculate time spent in seconds
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      // Calculate score and XP
      const score = data.currentScore || 0;
      const correctAnswers = data.scoredAnswers?.filter(a => a.is_correct).length || 0;
      const totalQuestions = data.scoredAnswers?.length || 0;
      
      const xpReward = calculateXpReward(score, correctAnswers, totalQuestions, timeSpent);
      setXpEarned(xpReward.total);
      
      // Check for badges
      const badge = checkForBadges(score, correctAnswers, totalQuestions);
      setBadgeEarned(badge);
      
      // Award XP
      await awardXp(
        xpReward.total, 
        `Completed quiz with score: ${score.toFixed(1)}%`,
        'quiz'
      );
      
      // Show XP animation
      setShowXpAnimation(true);
      
      // Show confetti for high scores
      if (score >= 80) {
        setShowConfetti(true);
      }

      setFinalScore(score);
      setDetailedResults(data.scoredAnswers || []);
      setTestCompleted(true);
      
      console.log('Test completed successfully');
      console.log('Final score:', score);
      console.log('XP earned:', xpReward.total);
      console.log('Detailed results:', data.scoredAnswers);

    } catch (err) {
      console.error('Error in test submission:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
      console.log('Submission process completed');
    }
  }, [classroomId, sectionId, slideId, submittedAnswers, user?.data?.token, startTime, calculateXpReward, checkForBadges, awardXp]);

  // Fetch questions on component mount
  useEffect(() => {
    fetchQuestions();
    setStartTime(Date.now());
  }, [fetchQuestions]);

  // First, define handleOptionSelect with useCallback
  const handleOptionSelect = useCallback((displayIndex) => {
    setSelectedOption(displayIndex);
  }, []);

  // Then handleSubmit
  const handleSubmit = useCallback(() => {
    console.log('handleSubmit called');
    console.log('Current question index:', currentQuestionIndex);
    console.log('Selected option:', selectedOption);
    
    if (selectedOption === null) {
      console.log('No option selected, returning');
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    console.log('Current question:', currentQuestion);
    
    const newAnswer = {
      questionId: currentQuestion.question_id,
      selectedOption: currentQuestion.option_mapping[selectedOption]
    };
    console.log('New answer to be added:', newAnswer);

    setSubmittedAnswers(prev => {
      const updated = [...prev, newAnswer];
      console.log('Updated submitted answers:', updated);
      return updated;
    });
    
    if (currentQuestionIndex < questions.length - 1) {
      console.log('Moving to next question');
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      console.log('Last question reached, submitting test');
      submitTest();
    }
  }, [currentQuestionIndex, questions, selectedOption, submitTest]);

  // Finally handleKeyDown
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && selectedOption !== null) {
      handleSubmit();
    }
    
    const keyToIndex = {
      '1': 0, '2': 1, '3': 2, '4': 3,
      'a': 0, 'b': 1, 'c': 2, 'd': 3
    };
    
    const pressedKey = e.key.toLowerCase();
    if (keyToIndex.hasOwnProperty(pressedKey)) {
      const optionIndex = keyToIndex[pressedKey];
      if (optionIndex < questions[currentQuestionIndex]?.options.length) {
        handleOptionSelect(optionIndex);
      }
    }
  }, [selectedOption, handleSubmit, questions, currentQuestionIndex, handleOptionSelect]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle timer expiration
  const handleTimeUp = useCallback(() => {
    console.log('Timer expired');
    if (!testCompleted) {
      console.log('Test not completed, auto-submitting');
      submitTest();
    }
  }, [testCompleted, submitTest]);

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(null);
    }
  };

  useEffect(() => {
    console.log('Current state:', {
      currentQuestionIndex,
      questionsLength: questions.length,
      submittedAnswersCount: submittedAnswers.length,
      testCompleted,
      submitting,
      error
    });
  }, [currentQuestionIndex, questions.length, submittedAnswers.length, testCompleted, submitting, error]);

  // Add a function to handle navigation back to section page
  const handleBackToSection = () => {
    
      // Navigate back to the section page
      navigate(`/learner-classroom/${classroomId}/section/${sectionId}`);
      setShowingResults(false);
    
  };

  const handleBackToMainSection = useCallback(() => {
    console.log("Navigating back with:", { classroomId, sectionId });
    
    // Store the intended URL in localStorage before navigating
    const targetUrl = `/learner-classroom/${classroomId}/section/${sectionId}`;
    localStorage.setItem('lastSectionUrl', targetUrl);
    
    // Try direct navigation
    window.location.href = targetUrl;
  }, [ classroomId, sectionId]);

  const handleViewResults = useCallback(() => {
    setShowingResults(true);
  }, [setShowingResults]);

  // Result card component
  const ResultCard = ({ attempt, index }) => {
    return (
      <div className="card border mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <span className="fw-medium text-secondary">Question {index + 1}</span>
            {attempt.is_correct ? (
              <div className="badge bg-success-subtle text-success d-flex align-items-center px-3 py-2">
                <CheckCircle2 className="me-1" size={16} />
                Correct
              </div>
            ) : (
              <div className="badge bg-danger-subtle text-danger d-flex align-items-center px-3 py-2">
                <XCircle className="me-1" size={16} />
                Incorrect
              </div>
            )}
          </div>
          
          <p className="mb-4">{attempt.question_text}</p>
          
          <div className="d-flex flex-column gap-2">
            {attempt.options.map((option, optionIndex) => {
              const isUserSelected = optionIndex === attempt.user_selected_option;
              const isCorrectAnswer = optionIndex === attempt.correct_answer;
              
              let optionClass = 'bg-light border';
              if (isUserSelected && isCorrectAnswer) {
                optionClass = 'bg-success-subtle border-success';
              } else if (isUserSelected) {
                optionClass = 'bg-danger-subtle border-danger';
              } else if (isCorrectAnswer) {
                optionClass = 'bg-success-subtle border-success opacity-75';
              }
              
              return (
                <div 
                  key={`option-${index}-${optionIndex}`}
                  className={`p-3 rounded ${optionClass}`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="fw-medium me-2">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      <span>{option}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      {isUserSelected && (
                        <span className="small me-2">
                          {isCorrectAnswer ? 'Your answer (correct)' : 'Your answer'}
                        </span>
                      )}
                      {isCorrectAnswer && !isUserSelected && (
                        <span className="small me-2">Correct answer</span>
                      )}
                      {isUserSelected && isCorrectAnswer && (
                        <CheckCircle2 className="text-success ms-1" size={16} />
                      )}
                      {isUserSelected && !isCorrectAnswer && (
                        <XCircle className="text-danger ms-1" size={16} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-black mb-4" />
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !questions.length) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="font-medium text-red-600">Error</span>
          </div>
          <p className="mt-1 text-red-500">{error}</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Show empty state
  if (!questions.length) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <HelpCircle className="h-4 w-4 text-blue-500 mr-2" />
              <span className="font-semibold text-blue-600">No Questions Available</span>
            </div>
            <p className="mt-1 text-blue-500">There are no questions available for this slide.</p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Show test completed state with gamification
  if (testCompleted) {
    return (
      <div className="container-fluid py-5">
        <div className="card border-0 shadow-lg" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-body p-5">
            {!showingResults ? (
              <div className="text-center py-5">
                <h2 className="display-6 fw-bold mb-4">Test Completed!</h2>
                
                {/* Score display with animation */}
                <div className="my-5">
                  <div 
                    className="display-1 fw-bold mb-3" 
                    style={{ 
                      color: finalScore >= 60 ? '#198754' : '#dc3545',
                      animation: 'scoreReveal 1.2s ease-out'
                    }}
                  >
                    {(finalScore || 0).toFixed(1)}%
                  </div>
                  <div className="alert alert-light d-inline-block px-4 py-3">
                    <span className="fw-medium">
                      You answered <span className="text-primary">{detailedResults?.filter(r => r.is_correct).length || 0}</span> out of <span className="text-primary">{detailedResults?.length || 0}</span> questions correctly
                    </span>
                  </div>
                </div>
                
                {/* XP earned section */}
                <div className="card bg-light border-0 mb-4 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="h5 mb-0">XP Earned</h3>
                    <div className="badge bg-success px-3 py-2 fs-6">
                      +{xpEarned} XP
                    </div>
                  </div>
                  
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span>Base completion</span>
                      <span>+25 XP</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Correct answers</span>
                      <span>+{detailedResults?.filter(r => r.is_correct).length * 10 || 0} XP</span>
                    </div>
                    {finalScore === 100 && (
                      <div className="d-flex justify-content-between text-success">
                        <span>Perfect score bonus!</span>
                        <span>+50 XP</span>
                      </div>
                    )}
                    {speedBonus > 0 && (
                      <div className="d-flex justify-content-between text-primary">
                        <span>Speed bonus</span>
                        <span>+{speedBonus} XP</span>
                      </div>
                    )}
                    {streakBonus > 0 && (
                      <div className="d-flex justify-content-between text-warning">
                        <span>Streak bonus ({user?.data?.user?.current_streak} days)</span>
                        <span>+{streakBonus} XP</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Badge earned (if any) */}
                {badgeEarned && (
                  <div className="card border-warning bg-warning bg-opacity-10 mb-4 p-4">
                    <div className="text-center">
                      <div 
                        className="badge-icon mb-2 d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-25"
                        style={{ width: "80px", height: "80px", fontSize: "2.5rem" }}
                      >
                        <span role="img" aria-label="badge">{badgeEarned.icon}</span>
                      </div>
                      <h4 className="mb-1">{badgeEarned.name}</h4>
                      <p className="text-muted">{badgeEarned.description}</p>
                    </div>
                  </div>
                )}
                
                <div className="d-flex justify-content-center gap-3 mt-5">
                  <button
                    type="button"
                    onClick={handleViewResults}
                    className="btn btn-dark px-4 py-2"
                  >
                    View Detailed Results
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToMainSection}
                    className="btn btn-outline-secondary px-4 py-2"
                  >
                    Back to Section
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="d-flex justify-content-between align-items-center border-bottom pb-4 mb-4">
                  <h2 className="h3 fw-bold mb-0">Detailed Results</h2>
                  <div className="badge bg-dark fs-6 px-3 py-2">
                    Score: {(finalScore || 0).toFixed(1)}%
                  </div>
                </div>
                
                <div className="d-flex flex-column gap-4">
                  {detailedResults.map((attempt, index) => (
                    <ResultCard 
                      key={`result-${attempt.question_id}-${index}`} 
                      attempt={attempt} 
                      index={index} 
                    />
                  ))}
                </div>
                
                <div className="d-flex justify-content-center mt-5 pt-3 border-top">
                  <button
                    onClick={handleBackToSection}
                    className="btn btn-dark px-5 py-2"
                  >
                    Back to Section
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Confetti effect for high scores */}
        {showConfetti && <div id="confetti-container" className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1040 }}></div>}
      </div>
    );
  }

  // Main test interface
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="container-fluid py-4">
      <div className="card border-0 shadow-sm">
        {/* Header */}
        <div className="card-header bg-white border-bottom p-4">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="h4 fw-bold mb-0">
              {slideInfo?.title || 'Test Questions'}
            </h2>
            <TestTimer duration={TEST_DURATION} onTimeUp={handleTimeUp} />
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted small">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            <div className="badge bg-primary">
              {submittedAnswers.length} of {questions.length} answered
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="card-body p-4">
          <div className="mb-4">
            <h3 className="h5 fw-medium mb-4">{currentQuestion.question_text}</h3>
            
            <div className="d-flex flex-column gap-3">
              {currentQuestion.options.map((option, displayIndex) => {
                const isSelected = selectedOption === displayIndex;
                const isAnswered = submittedAnswers.find(
                  answer => answer.questionId === currentQuestion.question_id
                );
                
                // Simpler styling without showing correct/incorrect
                const optionClass = isSelected ? 'border-dark' : 'border';
                const bgClass = isSelected ? 'bg-light' : '';
                
                return (
                  <div
                    key={`question-${currentQuestion.question_id}-option-${displayIndex}`}
                    onClick={() => !isAnswered && handleOptionSelect(displayIndex)}
                    className={`p-3 rounded-3 cursor-pointer transition ${optionClass} ${bgClass} 
                      ${!isAnswered && !isSelected ? 'hover:bg-light' : ''}
                      ${isAnswered ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    <div className="d-flex align-items-start">
                      <div className={`d-flex align-items-center justify-content-center 
                        rounded-circle border me-3 mt-1
                        ${isSelected ? 'bg-dark border-dark text-white' : 'border-secondary'}
                        `}
                        style={{ width: '24px', height: '24px' }}
                      >
                        <span className="small fw-medium">
                          {String.fromCharCode(65 + displayIndex)}
                        </span>
                      </div>
                      <div className="flex-grow-1">
                        {option}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`btn d-flex align-items-center gap-2
                ${currentQuestionIndex === 0 ? 'btn-light disabled' : 'btn-light'}`}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null || submittedAnswers.find(
                answer => answer.questionId === currentQuestion.question_id
              )}
              className="btn btn-dark d-flex align-items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Submitting...
                </>
              ) : (
                currentQuestionIndex === questions.length - 1 ? 
                  'Submit Test' : 'Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideQuestionAnswering;