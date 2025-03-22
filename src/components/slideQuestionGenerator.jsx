import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/authContext';
import { toast } from 'react-toastify';

const SlideQuestionGenerator = ({ slide, classroomId, sectionId, onQuestionsGenerated, onClose }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warningAccepted, setWarningAccepted] = useState(false);
  
  const [slideStructure, setSlideStructure] = useState({
    mainConcepts: '',
    definitions: '',
    examples: '',
    additionalNotes: ''
  });

  const generateQuestions = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Dismiss any existing toasts
    toast.dismiss();

    if (!warningAccepted) {
      setError('Please acknowledge the warning about regenerating questions');
      setLoading(false);
      return;
    }

    if (!Object.values(slideStructure).some(value => value.trim())) {
      setError('Please provide content in at least one section');
      setLoading(false);
      return;
    }

    try {
      const token = user?.data?.token;
      if (!token) throw new Error('No authentication token found');

      const formattedContent = `
        Main Concepts:
        ${slideStructure.mainConcepts}

        Key Definitions:
        ${slideStructure.definitions}

        Examples:
        ${slideStructure.examples}

        Additional Notes:
        ${slideStructure.additionalNotes}
      `.trim();

      const response = await fetch(
        `http://localhost:5005/admin/classrooms/${classroomId}/course-sections/${sectionId}/slides/${slide.slide_id}/generate-questions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slideContent: formattedContent,
            slideNumber: slide.slide_number
          })
        }
      );

      const data = await response.json();
      // console.log('API Response:', data);

      if (!response.ok) throw new Error(data.error || 'Failed to generate questions');

      if (data.questions && Array.isArray(data.questions)) {
        // console.log('Generated Questions:', data.questions);
        onQuestionsGenerated(data.questions);
        
        // Use a unique toast ID and prevent duplicates
        toast.success('Questions generated successfully', {
          toastId: 'questions-generated',
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        
        onClose();
      } else {
        throw new Error('Invalid questions data received from server');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setError(error.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Modal content - separate from backdrop */}
      <div className="modal fade show d-block" style={{ zIndex: 1051 }}>
        <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '600px' }}>
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom-0 px-4 pt-4 pb-0">
              <h5 className="modal-title fw-bold">Generate Questions</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              />
            </div>

            <div className="modal-body p-4 pt-2">
              <p className="text-muted mb-4">
                Organize the content from <span className="fw-medium">{slide.slide_name}</span> into sections below for better question generation.
              </p>

              <form onSubmit={generateQuestions}>
                <div className="alert alert-warning d-flex align-items-center mb-4 py-2 px-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <small>Generating new questions will replace any existing questions for this slide.</small>
                </div>

                <div className="form-check mb-4">
                  <input
                    type="checkbox"
                    id="warning-confirmation"
                    checked={warningAccepted}
                    onChange={() => setWarningAccepted(!warningAccepted)}
                    className="form-check-input"
                  />
                  <label className="form-check-label" htmlFor="warning-confirmation">
                    <small>I understand that existing questions will be replaced</small>
                  </label>
                </div>

                <div className="mb-3">
                  <div className="form-floating">
                    <textarea
                      className="form-control"
                      placeholder="Main concepts"
                      value={slideStructure.mainConcepts}
                      onChange={(e) => setSlideStructure(prev => ({
                        ...prev,
                        mainConcepts: e.target.value
                      }))}
                      style={{ height: '100px' }}
                    />
                    <label>Main Concepts</label>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="form-floating">
                    <textarea
                      className="form-control"
                      placeholder="Key definitions"
                      value={slideStructure.definitions}
                      onChange={(e) => setSlideStructure(prev => ({
                        ...prev,
                        definitions: e.target.value
                      }))}
                      style={{ height: '100px' }}
                    />
                    <label>Key Definitions</label>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-floating">
                    <textarea
                      className="form-control"
                      placeholder="Examples"
                      value={slideStructure.examples}
                      onChange={(e) => setSlideStructure(prev => ({
                        ...prev,
                        examples: e.target.value
                      }))}
                      style={{ height: '100px' }}
                    />
                    <label>Examples</label>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-floating">
                    <textarea
                      className="form-control"
                      placeholder="Additional notes"
                      value={slideStructure.additionalNotes}
                      onChange={(e) => setSlideStructure(prev => ({
                        ...prev,
                        additionalNotes: e.target.value
                      }))}
                      style={{ height: '100px' }}
                    />
                    <label>Additional Notes</label>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center mt-4 mb-0 py-2 px-3">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    <small>{error}</small>
                  </div>
                )}

                <div className="modal-footer border-top-0 px-0 mt-4">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !warningAccepted}
                    className="btn btn-dark px-4"
                    style={{ backgroundColor: '#0A2647', borderColor: '#0A2647' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Generating...
                      </>
                    ) : (
                      'Generate Questions'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SlideQuestionGenerator;