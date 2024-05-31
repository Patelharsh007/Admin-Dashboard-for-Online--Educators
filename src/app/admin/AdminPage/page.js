"use client";
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Topbar from '../../components/Topbar';
import BoardForm from '../BoardForm/page';
import MediumForm from '../MediumForm/page';
import StandardForm from '../StandardForm/page';
import SubjectForm from '../SubjectForm/page';
import ChapterForm from '../ChapterForm/page';

function AdminPage() {
  const [activeForm, setActiveForm] = useState('BoardForm');
  const [reloadKeys, setReloadKeys] = useState({
    board: 0,
    standard: 0,
    subject: 0,
    medium: 0,
    chapter: 0,
  });

  const handleReload = (formType) => {
    setReloadKeys((prevKeys) => ({
      ...prevKeys,
      [formType]: prevKeys[formType] + 1,
    }));
  };

  const handleFormChange = (formName) => {
    setActiveForm(formName);
  };

  const handleBoardChange = () => {
    handleReload('board');
    handleReload('medium');
    handleReload('standard');
    handleReload('subject');
  };

  const handleMediumChange = () => {
    handleReload('medium');
    handleReload('standard');
    handleReload('subject');
  };

  const handleStandardChange = () => {
    handleReload('standard');
    handleReload('subject');
  };

  const handleSubjectChange = () => {
    handleReload('subject');
    handleReload('chapter');
  };

  const handleChapterChange = () => {
    handleReload('chapter');
  };

  
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto my-20 p-4 bg-white shadow-md rounded-lg max-w-7xl">

        <Topbar onFormChange={handleFormChange} />
        <div className="p-4">
          {activeForm === 'BoardForm' && (
            <BoardForm reloadKey={reloadKeys.board} onBoardChange={handleBoardChange} />
          )}
          {activeForm === 'MediumForm' && (
            <MediumForm reloadKey={reloadKeys.medium} onMediumChange={handleMediumChange} />
          )}
          {activeForm === 'StandardForm' && (
            <StandardForm reloadKey={reloadKeys.standard} onStandardChange={handleStandardChange} />
          )}
          {activeForm === 'SubjectForm' && (
            <SubjectForm reloadKey={reloadKeys.subject} onSubjectChange={handleSubjectChange} />
          )}
          {activeForm === 'ChapterForm' && (
          <ChapterForm reloadKey={reloadKeys.chapter} onChapterChange={handleChapterChange}/>
        )}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
