import React, { useState } from 'react';
import { Trash2, AlertTriangle, } from 'lucide-react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, type, isLoading, itemName }) => {
  if (!isOpen) return null;

  const messages = {
    classroom: {
      title: 'Delete Classroom',
      warning: 'This action cannot be undone. This will permanently delete:',
      consequences: [
        'All course sections within this classroom',
        'All uploaded slides and materials',
        'All past questions and resources',
        'Student enrollment data and progress',
        'Classroom announcements and communications',
        'All generated quizzes and quiz data'
      ]
    },
    section: {
      title: 'Delete Course Section',
      warning: 'This action cannot be undone. This will permanently delete:',
      consequences: [
        'All slides uploaded to this section',
        'All past questions in this section',
        'Student progress data for this section'
      ]
    },
    slide: {
      title: 'Delete Slide',
      warning: 'Are you sure you want to delete this slide?',
      consequences: [
        'The slide file will be permanently removed',
        'Students will no longer have access to this material'
      ]
    },
    pastQuestion: {
      title: 'Delete Past Question',
      warning: 'Are you sure you want to delete this past question?',
      consequences: [
        'All associated files will be permanently removed',
        'Students will no longer have access to these materials'
      ]
    }
  };

  const message = messages[type];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show position-fixed top-0 start-0 w-100 h-100" 
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1040 
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="modal fade show d-block" 
        style={{ zIndex: 1045 }}
      >
        <div className="modal-dialog modal-dialog-centered position-relative">
          <div className="modal-content">
            <div className="modal-header border-bottom">
              <h5 className="modal-title text-danger d-flex align-items-center gap-2">
                <AlertTriangle size={20} />
                {message.title}
              </h5>
              {!isLoading && (
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              )}
            </div>

            <div className="modal-body">
              <div className="mb-4">
                <p className="fw-medium mb-2">{message.warning}</p>
                {itemName && (
                  <p className="text-muted fst-italic mb-4">"{itemName}"</p>
                )}
                <ul className="list-unstyled">
                  {message.consequences.map((consequence, index) => (
                    <li key={index} className="d-flex align-items-center gap-2 mb-2">
                      <div 
                        className="bg-danger rounded-circle"
                        style={{ width: '6px', height: '6px' }}
                      />
                      <span className="text-muted">{consequence}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="modal-footer border-top">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="btn btn-outline-secondary"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="btn btn-danger d-flex align-items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete {type}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Example usage in a component
const DeleteButton = ({ type, itemId, itemName, onDelete, isDeleting }) => {
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    try {
      await onDelete();
      setShowModal(false);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-outline-danger d-inline-flex align-items-center gap-2"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span>Deleting...</span>
          </>
        ) : (
          <>
            <Trash2 size={16} />
            <span>Delete</span>
          </>
        )}
      </button>

      <DeleteConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        type={type}
        isLoading={isDeleting}
        itemName={itemName}
      />
    </>
  );
};

export { DeleteButton, DeleteConfirmationModal };
