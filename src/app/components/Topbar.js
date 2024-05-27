import React, { useState } from 'react';

const Topbar = ({ onFormChange }) => {
  const [activeForm, setActiveForm] = useState('BoardForm');

  const handleFormClick = (formName) => {
    setActiveForm(formName);
    onFormChange(formName);
  };

  return (
    <div className="bg-gray-800 text-white py-2 rounded-t-lg">
      <div className="container mx-auto flex justify-around items-center space-x-4">
        {['BoardForm', 'MediumForm', 'StandardForm', 'SubjectForm', 'ChapterForm'].map((formName) => (
          <div
            key={formName}
            className={`cursor-pointer hover:bg-gray-700 py-2 px-4 rounded ${
              activeForm === formName ? 'bg-gray-700' : ''
            }`}
            onClick={() => handleFormClick(formName)}
          >
            {formName.replace('Form', ' Form')}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Topbar;
