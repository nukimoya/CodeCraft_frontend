import React, { useContext, useState } from 'react';
import { Trash2, HelpCircle, Download } from 'lucide-react';
import SlideQuestionGenerator from './slideQuestionGenerator'
import SlideQuestionsModal from './slideQuestionModal'
import { toast } from 'react-toastify';
import axios from 'axios';
import { AuthContext } from '../context/authContext';

const SlidesList = ({ slides, onDelete, classroomId, sectionId, onGenerateQuiz }) => {
  const { user } = useContext(AuthContext);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [questions, setQuestions] = useState([]);

  const fetchSlideQuestions = async (slideId) => {
    try {
      const token = user?.data?.token;
      const response = await axios.get(
        `http://localhost:5005/admin/classrooms/${classroomId}/course-sections/${sectionId}/slides/${slideId}/questions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
      return [];
    }
  };

  const handleGenerateQuiz = (slide) => {
    setSelectedSlide(slide);
    setIsGeneratingQuestions(true);
  };

  const handleQuestionsGenerated = async (generatedQuestions) => {
    setQuestions(generatedQuestions);
    
    if (selectedSlide) {
      const updatedSlide = {
        ...selectedSlide,
        questions: generatedQuestions
      };
      
      if (onGenerateQuiz) {
        onGenerateQuiz(updatedSlide);
      }
    }
    
    setIsGeneratingQuestions(false);
    toast.success('Questions generated successfully');
  };

  const handleViewQuiz = async (slide) => {
    console.log('Viewing quiz for slide:', slide);
    try {
      setSelectedSlide(slide);
      const fetchedQuestions = await fetchSlideQuestions(slide.slide_id);
      setQuestions(fetchedQuestions);
      setShowQuestionsModal(true);
    } catch (error) {
      console.error('Error viewing quiz:', error);
      toast.error('Failed to load quiz questions');
    }
  };

  return (
    <>
      <div className="row g-4">
        {slides.length > 0 ? (
          slides.map((slide) => (
            <div key={slide.slide_id} className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title mb-1">{slide.slide_name}</h5>
                      <p className="text-muted small">Slide {slide.slide_number}</p>
                    </div>
                    <span 
                      className="badge" 
                      style={{ backgroundColor: 'rgba(10, 38, 71, 0.1)', color: '#0A2647' }}
                    >
                      Active
                    </span>
                  </div>
                  
                  <div className="d-flex gap-2 mt-auto">
                    <a
                      href={slide.file_url}
                      download
                      className="btn btn-dark d-flex align-items-center justify-content-center flex-grow-1"
                      style={{ backgroundColor: '#0A2647', borderColor: '#0A2647' }}
                    >
                      <Download size={18} />
                      {/* Download */}
                    </a>
                    <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary d-flex align-items-center justify-content-center flex-grow-1"
                      onClick={() => handleGenerateQuiz(slide)}
                    >
                      <HelpCircle size={18} className="me-2" />
                      Generate Quiz
                    </button>
                    <button
                      className="btn btn-outline-primary d-flex align-items-center justify-content-center flex-grow-1"
                      onClick={() => handleViewQuiz(slide)}
                    >
                      <HelpCircle size={18} className="me-2" />
                      View Quiz
                    </button>
                    </div>
                    <button
                      className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this slide? This action cannot be undone.')) {
                          onDelete(slide.slide_id);
                        }
                      }}
                    >
                      <Trash2 size={18} />
                      
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <div className="mb-3">
              <i 
                className="bi bi-plus-circle" 
                style={{ fontSize: '2rem', color: '#6c757d' }}
              ></i>
            </div>
            <p className="text-muted">No slides uploaded yet</p>
          </div>
        )}
      </div>

      {/* Question Generator Modal */}
      {isGeneratingQuestions && selectedSlide && (
        <SlideQuestionGenerator
          isOpen={isGeneratingQuestions}
          slide={selectedSlide}
          classroomId={classroomId}
          sectionId={sectionId}
          onQuestionsGenerated={handleQuestionsGenerated}
          onClose={() => {
            setIsGeneratingQuestions(false);
            setSelectedSlide(null);
          }}
          onGenerateQuiz={handleGenerateQuiz}
        />
      )}

      {/* Questions Modal */}
      {showQuestionsModal && selectedSlide && (
        <SlideQuestionsModal
          slides={selectedSlide}
          questions={questions}
          onClose={() => {
            setShowQuestionsModal(false);
            setSelectedSlide(null);
            setQuestions([]);
          }}
          classroomId={classroomId}
          sectionId={sectionId}
          onQuestionsGenerated={(newQuestions) => {
            setQuestions(prev => [...prev, ...newQuestions]);
            toast.success('Questions generated successfully');
          }}
          onEditQuestion={(updatedQuestion) => {
            setQuestions(prev => 
              prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
            );
          }}
          onDeleteQuestion={(questionId) => {
            setQuestions(prev => prev.filter(q => q.id !== questionId));
          }}
        />
      )}
    </>
  );
};

export default SlidesList;