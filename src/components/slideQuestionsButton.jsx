import React from 'react';
import { FileQuestion } from 'lucide-react';

const SlideQuestionsButton = ({    
  slide,    
  onSetSelectedSlide,    
  onFetchSlideQuestions  
}) => {
  const handleClick = () => {
    onSetSelectedSlide(slide);
    onFetchSlideQuestions(slide.slide_id);
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 text-gray-400 hover:text-black transition-colors"
    >
      <FileQuestion size={20} />
    </button>
  );
};

export default SlideQuestionsButton;