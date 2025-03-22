import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

const UploadModal = ({ 
  show, 
  type, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  isLoading 
}) => {
  if (!show) return null;

  // Handle file input change
  const handleFileChange = (e) => {
    const files = e.target.files;
    console.log('Files selected:', files);
    
    if (files && files.length > 0) {
      if (type === 'slide') {
        console.log('Setting slide file:', files[0]);
        setFormData({
          ...formData,
          file: files[0]
        });
      } else {
        console.log('Setting PQ files:', Array.from(files));
        setFormData({
          ...formData,
          files: Array.from(files)
        });
      }
    }
  };

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {type === 'slide' ? 'Upload Slide' : 'Upload Past Questions'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          {type === 'slide' ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Slide Name</Form.Label>
                <Form.Control
                  type="text"
                  name="slide_name"
                  value={formData.slide_name}
                  onChange={handleInputChange}
                  placeholder="Enter slide name"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Slide Number</Form.Label>
                <Form.Control
                  type="number"
                  name="slide_number"
                  value={formData.slide_number}
                  onChange={handleInputChange}
                  placeholder="Enter slide number"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Slide File</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.ppt,.pptx"
                  required
                />
                {formData.file && (
                  <div className="mt-2 text-success">
                    Selected: {formData.file.name} ({Math.round(formData.file.size / 1024)} KB)
                  </div>
                )}
              </Form.Group>
            </>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Past Question Name</Form.Label>
                <Form.Control
                  type="text"
                  name="past_question_name"
                  value={formData.past_question_name}
                  onChange={handleInputChange}
                  placeholder="Enter past question name"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Past Question Files</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  multiple
                  required
                />
                {formData.files && formData.files.length > 0 && (
                  <div className="mt-2 text-success">
                    Selected {formData.files.length} file(s)
                  </div>
                )}
              </Form.Group>
            </>
          )}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isLoading || 
                (type === 'slide' && (!formData.slide_name || !formData.slide_number || !formData.file)) ||
                (type === 'pq' && (!formData.past_question_name || !formData.files || formData.files.length === 0))
              }
              style={{ backgroundColor: '#0A2647', borderColor: '#0A2647' }}
            >
              {isLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UploadModal;