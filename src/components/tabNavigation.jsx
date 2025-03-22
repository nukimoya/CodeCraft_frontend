import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab, slidesCount, pqCount }) => {
  return (
    <ul className="nav nav-tabs card-header-tabs">
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === 'slides' ? 'active' : ''}`}
          onClick={() => setActiveTab('slides')}
        >
          Slides ({slidesCount})
        </button>
      </li>
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === 'pastQuestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('pastQuestions')}
        >
          Additional Content ({pqCount})
        </button>
      </li>
    </ul>
  );
};

export default TabNavigation;