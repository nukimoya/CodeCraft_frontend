import React from 'react';

const PastQuestionsList = ({ pastQuestions, onDelete }) => {
  return (
    <div className="row g-4">
      {pastQuestions.length > 0 ? (
        pastQuestions.map((pq) => (
          <div key={pq.past_question_id} className="col-md-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title mb-0">{pq.past_question_name}</h5>
                  <button 
                    className="btn btn-link text-danger p-0"
                    onClick={() => onDelete(pq.past_question_id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
                <div className="mt-3">
                  {pq.file_urls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      download
                      className="d-flex align-items-center text-decoration-none text-dark mb-2"
                    >
                      <i className="bi bi-file-earmark-text me-2"></i>
                      <span className="text-truncate">{pq.file_names[index]}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-12 text-center py-5">
          <div className="mb-3">
            <i className="bi bi-plus-circle" style={{ fontSize: '2rem', color: '#6c757d' }}></i>
          </div>
          <p className="text-muted">No past questions uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default PastQuestionsList;