import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/authContext';
import AdminSidebar from '../../components/adminSidebar';
import SectionHeader from '../../components/sectionHeader';
import TabNavigation from '../../components/tabNavigation';
import SlidesList from '../../components/slideList';
import PastQuestionsList from '../../components/PastQuestionList';
import UploadModal from '../../components/uploadModal';
import { toast } from 'react-toastify';

const CourseSectionPage = () => {
  const { classroomId, sectionId } = useParams();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  
  // State management
  const [slides, setSlides] = useState([]);
  const [pastQuestions, setPastQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadType, setUploadType] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('slides');

  // Form states
  const [slideForm, setSlideForm] = useState({
    slide_name: '',
    slide_number: '',
    file: null
  });

  const [pqForm, setPqForm] = useState({
    past_question_name: '',
    files: []
  });

  // Question-related states
  //eslint-disable-next-line
  const [questions, setQuestions] = useState([]);

  // console.log(location)

  const courseTitle = location?.state?.courseTitle || 'Course Title Unavailable';
  const courseCode = location?.state?.courseCode || 'Course Code Unavailable';
  const courseDifficulty = location?.state?.courseDifficulty || 'Course Difficulty Unavailable';

  // Wrap fetchData in useCallback to memoize it
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = user?.data?.token;
      
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const [slidesRes, pqRes] = await Promise.all([
        axios.get(`http://localhost:5005/Admin/classrooms/${classroomId}/course-sections/${sectionId}/slides`, config),
        axios.get(`http://localhost:5005/Admin/classrooms/${classroomId}/course-sections/${sectionId}/past-questions`, config)
      ]);

      setSlides(slidesRes.data.slides || []);
      setPastQuestions(pqRes.data.pastQuestions || []);

    } catch (error) {
      console.error('Fetch error:', error);
    //   setError('Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [classroomId, sectionId, user?.data?.token]); // Add dependencies here

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Now we only need fetchData as a dependency

  // Handle uploads
  const handleSlideUpload = async (e) => {
    e.preventDefault();
    try {
      console.log('Starting slide upload...');
      setUploadLoading(true);
      
      // Log form data before creating FormData
      console.log('Slide form data:', {
        slide_name: slideForm.slide_name,
        slide_number: slideForm.slide_number,
        file: slideForm.file ? {
          name: slideForm.file.name,
          type: slideForm.file.type,
          size: slideForm.file.size
        } : null
      });
      
      const formData = new FormData();
      formData.append('file', slideForm.file);
      formData.append('slide_name', slideForm.slide_name);
      formData.append('slide_number', slideForm.slide_number);

      // Log FormData entries (for debugging)
      console.log('FormData created with the following entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[0] === 'file' ? pair[1].name : pair[1]));
      }

      console.log('Sending form data to API:', {
        endpoint: `http://localhost:5005/Admin/classrooms/${classroomId}/course-sections/${sectionId}/slides/upload`,
        classroomId,
        sectionId,
        slide_name: slideForm.slide_name,
        slide_number: slideForm.slide_number,
        fileSize: slideForm.file?.size,
        fileName: slideForm.file?.name
      });

      const token = user?.data?.token;
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      const response = await axios.post(
        `http://localhost:5005/Admin/classrooms/${classroomId}/course-sections/${sectionId}/slides/upload`,
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log('Upload response:', response.data);

      await fetchData();
      setUploadType(null);
      setSlideForm({ slide_name: '', slide_number: '', file: null });
      toast.success('Slide uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });
      toast.error(`Failed to upload slide: ${error.response?.data?.message || error.message}`);
    } finally {
      console.log('Upload process completed');
      setUploadLoading(false);
    }
  };

  // const handleQuestionsGenerated = (newQuestions) => {
  //   console.log('Received new questions:', newQuestions);
  //   setQuestions(newQuestions);
  //   toast.success('Questions generated successfully');
  // };

  const handleGenerateQuiz = (updatedSlide) => {
    setSlides(prevSlides => 
      prevSlides.map(slide => 
        slide.slide_id === updatedSlide.slide_id ? updatedSlide : slide
      )
    );
    toast.success('Quiz updated successfully');
  };

  // Also add a useEffect to monitor questions state
  useEffect(() => {
    console.log('Questions state updated:', questions);
  }, [questions]);


  const handlePQUpload = async (e) => {
    e.preventDefault();
    try {
      setUploadLoading(true);
      const formData = new FormData();
      formData.append('past_question_name', pqForm.past_question_name);
      pqForm.files.forEach(file => {
        formData.append('files', file);
      });

      const token = user?.data?.token;
      await axios.post(
        `http://localhost:5005/Admin/classrooms/${classroomId}/course-sections/${sectionId}/past-questions/upload`,
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      await fetchData();
      setUploadType(null);
      setPqForm({ past_question_name: '', files: [] });
      toast.success('Past questions uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload past questions');
    } finally {
      setUploadLoading(false);
    }
  };

  // Delete handlers
  const handleDeleteSlide = async (slideId) => {
    try {
      const token = user?.data?.token;
      console.log('Attempting to delete slide:', slideId);

      const response = await axios.delete(
        `http://localhost:5005/admin/classrooms/${classroomId}/course-sections/${sectionId}/slides/${slideId}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        await fetchData(); // Refresh the slides list
        toast.success('Slide deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
      toast.error(error.response?.data?.message || 'Failed to delete slide');
    }
  };

  const handleDeletePastQuestion = async (questionId) => {
    try {
      const token = user?.data?.token;
      await axios.delete(
        `http://localhost:5005/course-rep/classrooms/${classroomId}/past-questions/${questionId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      await fetchData();
      toast.success('Past question deleted successfully');
    } catch (error) {
      toast.error('Failed to delete past question');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <AdminSidebar />
      <main className="p-4" style={{ marginLeft: "260px" }}>
        <div className="container-fluid">
          <SectionHeader 
            courseTitle={courseTitle}
            courseCode={courseCode}
            courseDifficulty={courseDifficulty}
            onUploadSlide={() => setUploadType('slide')}
            onUploadPQ={() => setUploadType('pq')}
          />

          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <TabNavigation 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                slidesCount={slides.length}
                pqCount={pastQuestions.length}
              />
            </div>

            <div className="card-body">
              {activeTab === 'slides' ? (
                <SlidesList 
                  slides={slides}
                  onDelete={handleDeleteSlide}
                  classroomId={classroomId}
                  sectionId={sectionId}
                  onGenerateQuiz={handleGenerateQuiz}
                />
              ) : (
                <PastQuestionsList 
                  pastQuestions={pastQuestions}
                  onDelete={handleDeletePastQuestion}
                />
              )}
            </div>
          </div>
        </div>

        {/* Question Generator Modal
        {isGeneratingQuestions && selectedSlideForQuestions && (
          <SlideQuestionGenerator
            slide={selectedSlideForQuestions}
            classroomId={classroomId}
            sectionId={sectionId}
            onQuestionsGenerated={handleQuestionsGenerated}
            onClose={() => {
              setIsGeneratingQuestions(false);
              setSelectedSlideForQuestions(null);
            }}
          />
        )} */}

        {/* Questions Modal */}
        {/* {showQuestionsModal && selectedSlide && (
          <SlideQuestionsModal
            selectedSlide={selectedSlide}
            questions={questions}
            onClose={() => {
              setShowQuestionsModal(false);
              setSelectedSlide(null);
            }}
            classroomId={classroomId}
            sectionId={sectionId}
            onDeleteQuestion={handleDeleteQuestion}
            onQuestionsGenerated={handleQuestionsGenerated}
          />
        )} */}

        {/* <div className='container-fluid'>
          <div className='row'>
            <div className='col-12'>
              <ClassroomEmptyState />
            </div>
          </div>
        </div> */}

        <UploadModal 
          show={!!uploadType}
          type={uploadType}
          onClose={() => setUploadType(null)}
          onSubmit={uploadType === 'slide' ? handleSlideUpload : handlePQUpload}
          formData={uploadType === 'slide' ? slideForm : pqForm}
          setFormData={uploadType === 'slide' ? setSlideForm : setPqForm}
          isLoading={uploadLoading}
        />
      </main>
    </div>
  );
};

export default CourseSectionPage; 