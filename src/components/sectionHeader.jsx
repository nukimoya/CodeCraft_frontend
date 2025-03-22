import React from 'react';

const SectionHeader = ({ courseTitle, courseCode, courseDifficulty, onUploadSlide, onUploadPQ }) => {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="h3 fw-bold mb-1">{courseTitle}</h1>
            <p className="text-muted mb-0">{courseCode}</p>
            <p className='text-muted mb-0'>{courseDifficulty}</p>
          </div>
          <div className="d-flex gap-2">
            <button
              onClick={onUploadSlide}
              className="btn btn-dark"
              style={{ backgroundColor: '#0A2647', borderColor: '#0A2647' }}
            >
              <i className="bi bi-upload me-2"></i>
              Upload Slide
            </button>
            <button
              onClick={onUploadPQ}
              className="btn btn-outline-dark"
            >
              <i className="bi bi-file-text me-2"></i>
              Upload Additional Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;