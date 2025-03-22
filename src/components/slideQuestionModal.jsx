import React, { useState, useContext, useCallback } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import SlideQuestionGenerator from './slideQuestionGenerator';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/authContext';

const SlideQuestionsModal = ({ 
  slides, 
  questions, 
  onClose, 
  classroomId, 
  sectionId, 
  onEditQuestion, 
  onDeleteQuestion, 
  onQuestionsGenerated 
}) => {
  const { user } = useContext(AuthContext);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [localQuestions, setLocalQuestions] = useState(questions);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Log for debugging
  console.log('Selected slide:', slides.slide_id);
  console.log('Initial questions:', questions);

  const handleEditQuestion = async (updatedQuestion) => {
    try {
      const token = user?.data?.token;
      const response = await axios.put(
        `http://localhost:5005/Admin/classrooms/${classroomId}/course-sections/${sectionId}/slides/${slides.id}/questions/${updatedQuestion.id}`,
        updatedQuestion,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Update local state with edited question
        setLocalQuestions(prevQuestions =>
          prevQuestions.map(q =>
            q.id === updatedQuestion.id ? updatedQuestion : q
          )
        );
        
        setIsEditModalOpen(false);
        setCurrentQuestion(null);
        // toast.success('Question updated successfully');
      }
    } catch (error) {
      console.error('Error editing question:', error);
      toast.error('Failed to update question');
    }
  };

  const handleGenerateNewQuestions = async (newQuestions) => {
    try {
      // Update local state
      setLocalQuestions(prevQuestions => [...prevQuestions, ...newQuestions]);
      
      // Notify parent component
      if (onQuestionsGenerated) {
        onQuestionsGenerated(newQuestions);
      }
      
      setIsGeneratorOpen(false);
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Failed to generate questions');
    }
  };

  const handleDeleteClick = useCallback((question) => {
    setQuestionToDelete(question);
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!questionToDelete) return;
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5005/Admin/classrooms/${classroomId}/questions/${questionToDelete.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setLocalQuestions(prevQuestions => 
        prevQuestions.filter(q => q.id !== questionToDelete.id)
      );
      
      toast.success('Question deleted successfully');
      setShowDeleteConfirm(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    } finally {
      setIsLoading(false);
    }
  };

  const EditQuestionModal = () => {
    const [editedQuestion, setEditedQuestion] = useState(currentQuestion);

    const updateField = (field, value) => {
      setEditedQuestion(prev => ({
        ...prev,
        [field]: value
      }));
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsEditModalOpen(false)}
        />
        
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Edit Question</h2>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question Text</label>
              <textarea
                value={editedQuestion.question_text}
                onChange={(e) => updateField('question_text', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Options</label>
              {editedQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...editedQuestion.options];
                      newOptions[index] = e.target.value;
                      updateField('options', newOptions);
                    }}
                    className="w-full px-3 py-2 border rounded-lg mr-2"
                  />
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={editedQuestion.correct_answer === index}
                    onChange={() => updateField('correct_answer', index)}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditQuestion(editedQuestion)}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const QuestionCard = ({ question, index }) => (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h6 className="card-title mb-0 fw-bold">Question {index + 1}</h6>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                setCurrentQuestion(question);
                setIsEditModalOpen(true);
              }}
            >
              <i className="bi bi-pencil me-1"></i>
              Edit
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleDeleteClick(question)}
            >
              <i className="bi bi-trash me-1"></i>
              Delete
            </button>
          </div>
        </div>
        
        <p className="card-text mb-3">{question.question_text}</p>
        
        <div className="d-flex flex-column gap-2">
          {question.options.map((option, optIndex) => (
            <div 
              key={optIndex}
              className={`p-2 rounded ${
                question.correct_answer === optIndex 
                  ? 'bg-success bg-opacity-10 border border-success text-success' 
                  : 'bg-light border'
              }`}
            >
              <div className="d-flex align-items-center">
                <span className="fw-medium me-2">
                  {String.fromCharCode(65 + optIndex)}.
                </span>
                <span>{option}</span>
                {question.correct_answer === optIndex && (
                  <i className="bi bi-check-lg ms-auto text-success"></i>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DeleteConfirmationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isLoading && setShowDeleteConfirm(false)}
      />
      
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-red-100">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Delete Question</h3>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this question? This action cannot be undone.
        </p>

        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mb-6">
          {questionToDelete?.question_text}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => !isLoading && setShowDeleteConfirm(false)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Question'
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop with blur effect */}
      <div 
        className="position-fixed top-0 start-0 w-100 h-100" 
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1050
        }}
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="modal fade show d-block" style={{ zIndex: 1051 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow">
            {/* Header */}
            <div className="modal-header border-bottom-0 px-4 pt-4 pb-0">
              <div>
                <h5 className="modal-title fw-bold">Slide Questions</h5>
                <p className="text-muted mb-0">
                  Managing questions for <span className="fw-medium">{slides.slide_name}</span>
                </p>
              </div>
              <div className="d-flex align-items-center gap-2">
                {/* <button
                  onClick={() => setIsGeneratorOpen(true)}
                  className="btn btn-dark d-flex align-items-center"
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Generate Questions
                </button> */}
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                />
              </div>
            </div>

            {/* Body */}
            <div className="modal-body p-4">
              {localQuestions.length > 0 ? (
                <div className="row g-4">
                  {localQuestions.map((question, index) => (
                    <div key={question.id || index} className="col-md-6">
                      <QuestionCard 
                        question={question}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-plus-circle display-4 text-muted mb-3"></i>
                  <h5 className="fw-bold mb-2">No questions yet</h5>
                  <p className="text-muted mb-4">
                    Get started by generating questions for this slide.
                  </p>
                  <button
                    onClick={() => setIsGeneratorOpen(true)}
                    className="btn btn-dark d-inline-flex align-items-center"
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    Generate Questions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nested Modals */}
      {showDeleteConfirm && <DeleteConfirmationModal />}
      {isEditModalOpen && <EditQuestionModal />}
      {isGeneratorOpen && (
        <SlideQuestionGenerator 
          slide={slides} 
          classroomId={classroomId} 
          sectionId={sectionId} 
          onQuestionsGenerated={handleGenerateNewQuestions}
          onClose={() => setIsGeneratorOpen(false)}
        />
      )}
    </>
  );
};

export default SlideQuestionsModal;