import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, Check } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddQuestModal = ({ isOpen, onClose, onQuestAdded }) => {
  const [questData, setQuestData] = useState({
    title: '',
    description: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: ''
  });

  const resetForm = () => {
    setQuestData({ title: '', description: '' });
    setStatus({ loading: false, success: false, error: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        'https://codecraft-production.up.railway.app/api/quests/add',
        questData,
        { 
          headers: { 
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setStatus({ loading: false, success: true, error: '' });

        setTimeout(() => {
          if (onQuestAdded) {
            onQuestAdded(response.data);
          }
          onClose();
          resetForm();
        }, 1500);
      } else {
        throw new Error('No data received from server');
      }

    } catch (err) {
      let errorMessage = 'Failed to add quest. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Please log in again to add quests.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setStatus({
        loading: false,
        success: false,
        error: errorMessage
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Quest</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                onClose();
                resetForm();
              }}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Quest Title</label>
                <input
                  type="text"
                  value={questData.title}
                  onChange={(e) => setQuestData({ ...questData, title: e.target.value })}
                  className="form-control"
                  placeholder="Enter quest title"
                  required
                  maxLength={100}
                  disabled={status.loading || status.success}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  value={questData.description}
                  onChange={(e) => setQuestData({ ...questData, description: e.target.value })}
                  className="form-control"
                  placeholder="Enter quest description"
                  rows="3"
                  required
                  maxLength={500}
                  disabled={status.loading || status.success}
                />
                <small className="text-muted">
                  {questData.description.length}/500 characters
                </small>
              </div>

              {status.error && (
                <div className="alert alert-danger d-flex align-items-center">
                  <AlertCircle className="me-2" />
                  <span>{status.error}</span>
                </div>
              )}

              {status.success && (
                <div className="alert alert-success d-flex align-items-center">
                  <Check className="me-2" />
                  <span>Quest added successfully!</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                disabled={status.loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={status.loading || status.success || !questData.title || !questData.description}
              >
                {status.loading ? 'Adding...' : 'Add Quest'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuestModal;
