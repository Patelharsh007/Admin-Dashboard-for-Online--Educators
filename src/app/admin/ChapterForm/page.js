"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";


function ChapterForm({ reloadKey, onChapterChange }) {
  const [chapters, setChapters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [standards, setStandards] = useState([]);
  const [mediums, setMediums] = useState([]);
  const [boards, setBoards] = useState([]);
  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [standardId, setStandardId] = useState("");
  const [mediumId, setMediumId] = useState("");
  const [boardId, setBoardId] = useState("");
  const [notification, setNotification] = useState("");
  const [errornotification, setErrorNotification] = useState("");
  const [isEditAllModalOpen, setIsEditAllModalOpen] = useState(false);
  const [editableChapters, setEditableChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState({});
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState({ field: "chapterId", order: "asc" });

  // Define new state variables for filters
  const [filtersubjects, setfilterSubjects] = useState([]);
  const [filteredstandards, setfilterStandards] = useState([]);
  const [filteredmediums, setfilterMediums] = useState([]);
  const [filteredboards, setfilterBoards] = useState([]);



  // Define state variables for edit all modal
  const [editAllFilterBoard, setEditAllFilterBoard] = useState("");
  const [editAllFilterMedium, setEditAllFilterMedium] = useState("");
  const [editAllFilterStandard, setEditAllFilterStandard] = useState("");
  const [editAllFilterSubject, setEditAllFilterSubject] = useState("");
  const [editAllFilterChapterName, setEditAllFilterChapterName] = useState("");

  // Define state variables for filters and set initial values
  const [chapterFilters, setChapterFilters] = useState({
    chapterName: "",
    subjectName: "",
    standardName: "",
    mediumName: "",
    boardName: "",
  });

  // Define state variable for fetched chapters
  const [fetchedChapters, setFetchedChapters] = useState([]);

  // Fetch chapters on component mount or when reloadKey changes
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/api/chapters'); // Replace with your API endpoint
      setFetchedChapters(response.data);
    };
    fetchData();
  }, [reloadKey]); // Dependency array includes reloadKey


  //Use-Effects

  // Call the new function load all chapters and boards when reload key changes
  useEffect(() => {
    loadChapters();
    loadBoards();
  }, [reloadKey]);


  useEffect(() => {
    loadStandards(mediumId);
  }, [mediumId]);

  useEffect(() => {
    loadMediums(boardId);
  }, [boardId]);

  useEffect(() => {
    loadSubjects(standardId);
  }, [standardId]);

  useEffect(() => {
    if (isEditAllModalOpen) {
      loadSubjectsSortedByBoard();
    }
  }, [isEditAllModalOpen]);


  // Call the new function to load all subjects  during filter
  useEffect(() => {
    loadAllSubjects();
  }, []);

  // Call the new function to load all standards during filter
  useEffect(() => {
    loadAllStandards();
  }, []);

  // Call the new function to load all mediums during filter
  useEffect(() => {
    loadAllMediums();
  }, []);

  // Call the new function to load all boards during filter
  useEffect(() => {
    loadAllBoards();
  }, []);

  // Define a new function to load chapters
  async function loadChapters() {
    try {
      const response = await axios.get("/api/chapters");
      setChapters(response.data);
    } catch (error) {
      console.error("Error loading chapters:", error);
      showErrorNotification("Error loading chapters");
    }
  }

  // Define a new function to load boards  
  async function loadBoards() {
    try {
      const response = await axios.get("/api/boards");
      setBoards(response.data);
    } catch (error) {
      console.error("Error loading boards:", error);
      showErrorNotification("Error loading boards");
    }
  }

  // Update the loadStandards function to accept a mediumId parameter
  async function loadStandards(mediumId) {
    try {
      if (mediumId) {
        const response = await axios.get(`/api/standards/${mediumId}`);
        setStandards(response.data);
      } else {
        setStandards([]);
      }
    } catch (error) {
      console.error("Error loading standards:", error);
      showErrorNotification("Error loading standards");
    }
  }


  // Update the loadMediums function to accept a boardId parameter
  async function loadMediums(boardId) {
    try {
      if (boardId) {
        const response = await axios.get(`/api/mediums/${boardId}`);
        setMediums(response.data);
      } else {
        setMediums([]);
      }
    } catch (error) {
      console.error("Error loading mediums:", error);
      showErrorNotification("Error loading mediums");
    }
  }


  // Update the loadSubjects function to accept a standardId parameter
  async function loadSubjects(standardId) {
    try {
      if (standardId) {
        const response = await axios.get(`/api/subjects/${standardId}`);
        setSubjects(response.data);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
      showErrorNotification("Error loading subjects");
    }
  }

  // Define a new function to load subjects sorted by board
  async function loadSubjectsSortedByBoard() {
    try {
      let url = "/api/subjects";

      const response = await axios.get(url);
      const sortedStandards = response.data.sort((a, b) => {
        // Sort by boardName
        const boardComparison = a.boardName.localeCompare(b.boardName);
        if (boardComparison !== 0) return boardComparison;

        // Sort by mediumName
        const mediumComparison = a.mediumName.localeCompare(b.mediumName);
        if (mediumComparison !== 0) return mediumComparison;

        // Assuming standardName is a number, sort numerically
        return a.standardName - b.standardName;
      });
      setSubjects(sortedStandards);
    } catch (error) {
      console.error("Error loading subjects sorted by board:", error);
    }
  }

  // Define a new function to add a chapter
  async function addChapter() {
    try {
      if (!name.trim() || !subjectId.trim()) {
        //alert("Please enter a valid chapter name and select a subject.");
        showErrorNotification("Please enter a valid chapter name and select a subject.");
        return;
      }

      await axios.post("/api/chapters", { name, parentref: subjectId });
      setName("");
      setSubjectId("");
      onChapterChange();
      loadChapters();
      showNotification("Chapter added successfully");

    } catch (error) {
      console.error("Error adding chapter:", error);
      //showNotification("Error adding chapter");
      showErrorNotification("Error adding chapter");
    }
  }

  //Already implemented at delete button
  // Define a new function to delete a chapter
  // async function deleteChapter(id) {
  //   try {
  //     await axios.delete(`/api/chapters/${id}`);
  //     setIsDeleteModalOpen(false);
  //     showNotification("Chapter deleted successfully");
  //     loadChapters();
  //     onChapterChange();
  //   } catch (error) {
  //     console.error("Error deleting chapter:", error);
  //     //showNotification("Error deleting chapter");
  //     showErrorNotification("Error deleting chapter");
  //   }
  // }

  // Show notification with green color
  function showNotification(message) {
    setNotification(message);
    setTimeout(() => {
      setNotification("");
    }, 5000);
  }

  //Show error notification with red color
  function showErrorNotification(message) {
    setErrorNotification(message);
    setTimeout(() => {
      setErrorNotification("");
    }, 5000);
  }

  // Define a new function to handle edit all chapters
  function handleEditAll() {
    loadBoards();
    setEditableChapters(
      chapters.map((chapter) => ({
        ...chapter,
        newName: chapter.chapterName,
        newSubjectId: chapter.subjectId,
        deleteFlag: false,
      }))
    );
    setIsEditAllModalOpen(true);
  }

  // Define a new function to handle changes in the editable chapters
  function handleEditAllChange(id, field, value) {
    setEditableChapters((prevChapters) =>
      prevChapters.map((chapter) =>
        chapter.chapterId === id ? { ...chapter, [field]: value } : chapter
      )
    );
  }

  // Define a new function to handle delete flag toggle
  function handleDeleteFlagToggle(id) {
    setEditableChapters((prevChapters) =>
      prevChapters.map((chapter) =>
        chapter.chapterId === id
          ? { ...chapter, deleteFlag: !chapter.deleteFlag }
          : chapter
      )
    );
  }

  // Define a new function to handle update all chapters
  async function handleUpdateAll() {
    try {
      const updatePromises = editableChapters
        .filter((chapter) => !chapter.deleteFlag)
        .map((chapter) =>
          axios.put(`/api/chapters/${chapter.chapterId}`, {
            name: chapter.newName,
            parentref: chapter.newSubjectId,
          })
        );

      const deletePromises = editableChapters
        .filter((chapter) => chapter.deleteFlag)
        .map((chapter) => axios.delete(`/api/chapters/${chapter.chapterId}`));

      await Promise.all([...updatePromises, ...deletePromises]);
      loadChapters();
      onChapterChange();
      showNotification("Chapters updated and deleted successfully");
      setIsEditAllModalOpen(false);
    } catch (error) {
      console.error("Error editing chapters:", error);
      //showNotification("Error editing chapters");
      showErrorNotification("Error editing chapters");
    }
  }

  // Define a new function to handle update all chapters
  function handleUpdateModal(chapter) {
    setCurrentChapter({
      ...chapter,
      newName: chapter.chapterName,
      newSubjectId: chapter.subjectId,
    });
    setIsUpdateModalOpen(true);
  }

  // Define a new function to handle delete modal
  function handleDeleteModal(chapter) {
    setCurrentChapter(chapter);
    setIsDeleteModalOpen(true);
  }

  // Define a new function to handle sorting
  function handleSort(field) {
    const order =
      sortBy.field === field && sortBy.order === "asc" ? "desc" : "asc";
    setSortBy({ field, order });
    const sortedChapters = [...chapters].sort((a, b) => {
      if (field === "chapterId") {
        return order === "asc" ? a.chapterId - b.chapterId : b.chapterId - a.chapterId;
      } else {
        const nameA = a[field].toLowerCase();
        const nameB = b[field].toLowerCase();
        if (nameA < nameB) return order === "asc" ? -1 : 1;
        if (nameA > nameB) return order === "asc" ? 1 : -1;
        return 0;
      }
    });
    setChapters(sortedChapters);
  }


  // Define a new function to handle chapter name filter changes
  const handleChapterNameChange = (e) => {
    setChapterFilters({ ...chapterFilters, chapterName: e.target.value });
  };


  // Define a new function to filter chapters based on the current filters
  const filterChapters = (chapters) => {
    const { chapterName, subjectName, standardName, mediumName, boardName } = chapterFilters;
    return chapters.filter((chapter) => (
      chapter.chapterName.toLowerCase().includes(chapterName.toLowerCase()) &&
      (!subjectName || chapter.subjectName.includes(subjectName)) &&
      (!standardName || chapter.standardName.includes(standardName)) &&
      (!mediumName || chapter.mediumName.includes(mediumName)) &&
      (!boardName || chapter.boardName.includes(boardName))
    ));
  };

  // Filter the fetched chapters based on the current filters
  const filteredChapters = filterChapters(fetchedChapters);

  // Define a new function to handle subject filter changes
  const handleSubjectFilterChange = (event) => {
    // Update the subject filter value
    const selectedSubject = event.target.value;
    setChapterFilters((prevFilters) => ({
      ...prevFilters,
      subjectName: selectedSubject,
    }));
  };

  // Define a new function to handle standard filter changes
  function handleStandardFilterChange(event) {
    const selectedStandard = event.target.value;
    setChapterFilters((prevFilters) => ({
      ...prevFilters,
      standardName: selectedStandard,
    }));
  }

  // Define a new function to handle medium filter changes
  function handleMediumFilterChange(event) {
    const selectedMedium = event.target.value;
    setChapterFilters((prevFilters) => ({
      ...prevFilters,
      mediumName: selectedMedium,
    }));
  }

  // Define a new function to handle board filter changes
  function handleBoardFilterChange(event) {
    const selectedBoard = event.target.value;
    setChapterFilters((prevFilters) => ({
      ...prevFilters,
      boardName: selectedBoard,
    }));
  }


  // Define a new function to load all subjects for filter
  async function loadAllSubjects() {
    try {
      const response = await axios.get(`/api/subjects`);
      setfilterSubjects(response.data);
    } catch (error) {
      console.error("Error loading subjects:", error);
      showErrorNotification("Error loading subjects");
    }
  }

  // Define a new function to load all standards for filter
  async function loadAllStandards() {
    try {
      const response = await axios.get(`/api/standards`);
      setfilterStandards(response.data);
    } catch (error) {
      console.error("Error loading standards:", error);
      showErrorNotification("Error loading standards");
    }
  }

  // Define a new function to load all mediums for filter  
  async function loadAllMediums() {
    try {
      const response = await axios.get(`/api/mediums`);
      setfilterMediums(response.data);
    } catch (error) {
      console.error("Error loading mediums:", error);
      showErrorNotification("Error loading mediums");
    }
  }

  // Define a new function to load all boards for filter
  async function loadAllBoards() {
    try {
      const response = await axios.get(`/api/boards`);
      setfilterBoards(response.data);
    } catch (error) {
      console.error("Error loading boards:", error);
      showErrorNotification("Error loading boards");
    }
  }

  // Function to handle changes in the board filter for edit all modal
  const handleEditAllFilterBoardChange = (event) => {
    setEditAllFilterBoard(event.target.value);
  };

  // Function to handle changes in the medium filter for edit all modal
  const handleEditAllFilterMediumChange = (event) => {
    setEditAllFilterMedium(event.target.value);
  };

  // Function to handle changes in the standard filter for edit all modal
  const handleEditAllFilterStandardChange = (event) => {
    setEditAllFilterStandard(event.target.value);
  };

  // Function to handle changes in the subject filter for edit all modal
  const handleEditAllFilterSubjectChange = (event) => {
    setEditAllFilterSubject(event.target.value);
  };

  // Function to handle changes in the chapter name filter for edit all modal
  const handleEditAllFilterChapterNameChange = (event) => {
    setEditAllFilterChapterName(event.target.value);
  };


  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 flex justify-between">
        Manage Chapters
        <button
          onClick={handleEditAll}
          className="p-2 bg-green-500 text-white rounded"
        >
          Edit
        </button>
      </h2>
      <div className="mb-4 flex">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          placeholder="Add new chapter"
          className="flex-1 p-2 border border-gray-300 rounded mr-2"
        />
        <select
          value={boardId}
          onChange={(e) => setBoardId(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded mr-2"
        >
          <option value="">Select board</option>
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </select>

        <select
          value={mediumId}
          onChange={(e) => setMediumId(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded mr-2"
        >
          <option value="">Select medium</option>
          {mediums.map((medium) => (
            <option key={medium.id} value={medium.id}>
              {medium.name}
            </option>
          ))}
        </select>
        <select
          value={standardId}
          onChange={(e) => setStandardId(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded mr-2"
        >
          <option value="">Select standard</option>
          {standards.map((standard) => (
            <option key={standard.id} value={standard.id}>
              {standard.name}
            </option>
          ))}
        </select>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded mr-2"
        >
          <option value="">Select subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        <button
          onClick={addChapter}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Add
        </button>
      </div>
      {notification && (<div className="p-2 bg-green-100 text-green-800 rounded mb-4">{notification}</div>)}
      {errornotification && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{errornotification}</div>}

      {/* FILTER BAR */}
      <div className="overflow-x-auto">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-4">Filter Chapters</h3>
          <input
            type="text"
            placeholder="Search Chapter Name"
            value={chapterFilters.chapterName}
            onChange={handleChapterNameChange}
            className="p-2 border border-gray-300 rounded mr-2"
          />
          <select
            value={chapterFilters.boardName}
            onChange={handleBoardFilterChange}
            className="flex-1 p-2 border border-gray-300 rounded mr-2"
          >
            <option value="">All Boards</option>
            {/* Filter unique mediums */}
            {Array.from(new Set(filteredboards.map(board => board.name)))
              .sort((a, b) => a.localeCompare(b))
              .map((boardName) => (
                <option key={boardName} value={boardName}>
                  {boardName}
                </option>
              ))}
          </select>
          <select
            value={chapterFilters.mediumName}
            onChange={handleMediumFilterChange}
            className="flex-1 p-2 border border-gray-300 rounded mr-2"
          >
            <option value="">All Mediums</option>
            {/* Filter unique mediums */}
            {Array.from(new Set(filteredmediums.map(medium => medium.name)))
              .sort((a, b) => a.localeCompare(b))
              .map((mediumName) => (
                <option key={mediumName} value={mediumName}>
                  {mediumName}
                </option>
              ))}
          </select>
          <select
            value={chapterFilters.standardName}
            onChange={handleStandardFilterChange}
            className="flex-1 p-2 border border-gray-300 rounded mr-2"
          >
            <option value="">All Standards</option>
            {/* Filter unique standards */}
            {Array.from(new Set(filteredstandards.map(standard => standard.name)))
              .sort((a, b) => a.localeCompare(b))
              .map((standardName) => (
                <option key={standardName} value={standardName}>
                  {standardName}
                </option>
              ))}
          </select>
          <select
            value={chapterFilters.subjectName}
            onChange={handleSubjectFilterChange}
            className="flex-1 p-2 border border-gray-300 rounded mr-2"
          >
            <option value="">All Subjects</option>
            {/* Filter unique subjects */}
            {Array.from(new Set(filtersubjects.map(subject => subject.name)))
              .sort((a, b) => a.localeCompare(b))
              .map((subjectName) => (
                <option key={subjectName} value={subjectName}>
                  {subjectName}
                </option>
              ))}
          </select>
        </div>

        {/* CHAPTERS TABLE */}
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2 text-left">
                Chapter ID
                <button onClick={() => handleSort("chapterId")}>
                  {sortBy.field === "chapterId" ? (
                    sortBy.order === "asc" ? (
                      <FaSortUp />
                    ) : (
                      <FaSortDown />
                    )
                  ) : (
                    <FaSort />
                  )}
                </button>
              </th>
              <th className="border-b p-2 text-left">
                Chapter Name
                <button onClick={() => handleSort("chapterName")}>
                  {sortBy.field === "chapterName" ? (
                    sortBy.order === "asc" ? (
                      <FaSortUp />
                    ) : (
                      <FaSortDown />
                    )
                  ) : (
                    <FaSort />
                  )}
                </button>
              </th>
              <th className="border-b p-2 text-left">Subject Name</th>
              <th className="border-b p-2 text-left">Standard Name</th>
              <th className="border-b p-2 text-left">Medium Name</th>
              <th className="border-b p-2 text-left">Board Name</th>
              <th className="border-b p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredChapters.map((chapter) => (
              <tr key={chapter.chapterId}>
                <td className="border-b p-2">{chapter.chapterId}</td>
                <td className="border-b p-2">{chapter.chapterName}</td>
                <td className="border-b p-2">{chapter.subjectName}</td>
                <td className="border-b p-2">{chapter.standardName}</td>
                <td className="border-b p-2">{chapter.mediumName}</td>
                <td className="border-b p-2">{chapter.boardName}</td>
                <td className="border-b p-2">
                  <button
                    onClick={() => {
                      handleUpdateModal(chapter);
                    }
                    }
                    className="p-1 bg-yellow-500 text-white rounded mr-2"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDeleteModal(chapter)}
                    className="p-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isUpdateModalOpen && (

        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white flex gap-10 p-6 px-35 rounded-lg shadow-md">

            <div className="mb-4">
              <p className="text-lg font-semibold mb-4">Current Details:</p>
              <p>Subject Name:{currentChapter.subjectName}</p>
              <p>Standard: {currentChapter.standardName}</p>
              <p>Medium Name: {currentChapter.mediumName}</p>
              <p>Board Name: {currentChapter.boardName}</p>
              <p>Standard Name: {currentChapter.standardName}</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Update Chapters</h3>

              <h5 className="text-lg font-semibold mb-4">Chapter Name:</h5>
              <input
                type="text"
                value={currentChapter.newName}
                onChange={(e) =>
                  setCurrentChapter({
                    ...currentChapter,
                    newName: e.target.value.toUpperCase(),
                  })
                }
                className="mb-4 p-2 border border-gray-300 rounded w-full"
              />

              <div className="mb-4">

                <h5 className="text-lg font-semibold mb-4">Select Board:</h5>
                <select
                  value={boardId}
                  onChange={(e) => setBoardId(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded mr-2"
                >
                  <option value="">Select Board</option>
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
                <br />
                <br />


                <h5 className="text-lg font-semibold mb-4">Select Medium:</h5>
                <select
                  value={mediumId}
                  onChange={(e) => setMediumId(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded mr-2"
                >
                  <option value="">Select Medium</option>
                  {mediums.map((medium) => (
                    <option key={medium.id} value={medium.id}>
                      {medium.name}
                    </option>
                  ))}
                </select>
                <br />
                <br />

                <h5 className="text-lg font-semibold mb-4">Select Standard:</h5>
                <select
                  value={standardId}
                  onChange={(e) => setStandardId(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded mr-2"
                >
                  <option value="">Select standard</option>
                  {standards.map((standard) => (
                    <option key={standard.id} value={standard.id}>
                      {standard.name}
                    </option>
                  ))}
                </select>
                <br />
                <br />

                <h5 className="text-lg font-semibold mb-4">Select Subject:</h5>
                <select
                  value={currentChapter.newSubjectId}
                  onChange={(e) =>
                    setCurrentChapter({
                      ...currentChapter,
                      newSubjectId: e.target.value,
                    })
                  }
                  className="mb-4 p-2 border border-gray-300 rounded w-full"
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <br />
                <br />

              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    //showNotification('Update request cancelled');
                    showErrorNotification('Update request cancelled');
                  }}
                  className="p-2 bg-gray-400 text-white rounded mr-2 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await axios.put(`/api/chapters/${currentChapter.chapterId}`, {
                        name: currentChapter.newName,
                        parentref: currentChapter.newSubjectId,
                      });
                      loadChapters();
                      onChapterChange();
                      setIsUpdateModalOpen(false);
                      showNotification("Chapter updated successfully");
                    } catch (error) {
                      console.error("Error updating chapter:", error);
                      //showNotification("Error updating chapter");
                      showErrorNotification("Error updating chapter");
                    }
                  }}
                  className="p-2 bg-blue-500 text-white rounded focus:outline-none"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p>
              Are you sure you want to delete the chapter "
              {currentChapter.chapterName}"?
            </p>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  //showNotification('Delete request cancelled')
                  showErrorNotification('Delete request cancelled');
                }
                }
                className="p-2 bg-gray-400 text-white rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.delete(`/api/chapters/${currentChapter.chapterId}`);
                    loadChapters();
                    onChapterChange();
                    setIsDeleteModalOpen(false);
                    showNotification("Chapter deleted successfully");
                  } catch (error) {
                    console.error("Error deleting chapter:", error);
                    showNotification("Error deleting chapter");
                  }
                }}
                className="p-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for editing multiple chapters */}
      {isEditAllModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 max-h-3/4 overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Edit Chapters</h3>
            <div className="mb-4">


              {/* Filter Bar */}
              <h5 className="text-lg font-semibold mb-4">Filters:</h5>

              <div className="flex justify-evenly ">

                <div>
                  <input
                    type="text"
                    placeholder="Search Chapter Name"
                    value={editAllFilterChapterName}
                    onChange={handleEditAllFilterChapterNameChange}
                    className="p-2 border border-gray-300 rounded mr-2"
                  />
                </div>

                <div>
                  <label htmlFor="editAllFilterBoard" className="block mb-1">Board:</label>
                  <select
                    id="editAllFilterBoard"
                    value={editAllFilterBoard}
                    onChange={handleEditAllFilterBoardChange}
                    className="p-2 border border-gray-300 rounded w-full"
                  >
                    <option value="" slected>All Boards</option>
                    {filteredboards.map(board => (
                      <option key={board.id} value={board.name}>{board.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="editAllFilterMedium" className="block mb-1">Medium:</label>
                  <select
                    id="editAllFilterMedium"
                    value={editAllFilterMedium}
                    onChange={handleEditAllFilterMediumChange}
                    className="p-2 border border-gray-300 rounded w-full"
                  >
                    <option value="">All Mediums</option>
                    {[...new Set(filteredmediums.map(medium => medium.name))]
                      .sort()
                      .map(mediumName => (
                        <option key={mediumName} value={mediumName}>
                          {mediumName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="editAllFilterStandard" className="block mb-1">Standard:</label>
                  <select
                    id="editAllFilterStandard"
                    value={editAllFilterStandard}
                    onChange={handleEditAllFilterStandardChange}
                    className="p-2 border border-gray-300 rounded w-full"
                  >
                    <option value="">All Standards</option>
                    {[...new Set(filteredstandards.map(standard => standard.name))]
                      .sort()
                      .map(standardName => (
                        <option key={standardName} value={standardName}>
                          {standardName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="editAllFilterSubject" className="block mb-1">Subject:</label>
                  <select
                    id="editAllFilterSubject"
                    value={editAllFilterSubject}
                    onChange={handleEditAllFilterSubjectChange}
                    className="p-2 border border-gray-300 rounded w-full"
                  >
                    <option value="">All Subjects</option>
                    {[...new Set(filtersubjects.map(subject => subject.name))]
                      .sort()
                      .map(subjectName => (
                        <option key={subjectName} value={subjectName}>
                          {subjectName}
                        </option>
                      ))}
                  </select>
                </div>

              </div>
            </div>

            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-2 text-left">Chapter ID</th>
                  <th className="border-b p-2 text-left">Chapter Name</th>
                  <th className="border-b p-2 text-left">Subject Name</th>
                  <th className="border-b p-2 text-left">Standard Name</th>
                  <th className="border-b p-2 text-left">Medium Name</th>
                  <th className="border-b p-2 text-left">Board Name</th>
                  <th className="border-b p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {editableChapters
                  .filter(chapter => {
                    return (
                      (!editAllFilterBoard || chapter.boardName === editAllFilterBoard) &&
                      (!editAllFilterMedium || chapter.mediumName === editAllFilterMedium) &&
                      (!editAllFilterStandard || chapter.standardName === editAllFilterStandard) &&
                      (!editAllFilterSubject || chapter.subjectName === editAllFilterSubject) &&
                      (!editAllFilterChapterName || chapter.chapterName.toLowerCase().includes(editAllFilterChapterName.toLowerCase()))
                    );
                  })
                  .map((chapter) => (
                    <tr key={chapter.chapterId}>
                      <td className="border-b p-2">{chapter.chapterId}</td>
                      <td className="border-b p-2">
                        <input
                          type="text"
                          value={chapter.newName}
                          onChange={(e) =>
                            handleEditAllChange(chapter.chapterId, "newName", e.target.value.toUpperCase())
                          }
                          className="p-2 border border-gray-300 rounded w-full"
                        />
                      </td>
                      <td className="border-b p-2">
                        <select
                          value={chapter.newSubjectId}
                          onChange={(e) => handleEditAllChange(chapter.chapterId, 'newSubjectId', e.target.value)}
                          className="p-2 border border-gray-300 rounded w-full"
                        >
                          <option value="">Select subject</option>
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {`${subject.name} (${subject.boardName} - ${subject.mediumName} - ${subject.standardName})`}
                            </option>
                          ))}
                        </select>
                      </td>


                      <td className="border-b p-2">{chapter.standardName}</td>
                      <td className="border-b p-2">{chapter.mediumName}</td>
                      <td className="border-b p-2">{chapter.boardName}</td>
                      <td className="border-b p-2">
                        <button
                          onClick={() => handleDeleteFlagToggle(chapter.chapterId)}
                          className={`p-2 rounded ${chapter.deleteFlag ? "bg-gray-500" : "bg-red-500"} text-white`}
                        >
                          {chapter.deleteFlag ? "Undo" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => {
                  setIsEditAllModalOpen(false);
                  //showNotification('Edit request cancelled')
                  setEditAllFilterBoard('')
                  setEditAllFilterMedium('')
                  setEditAllFilterStandard('')
                  setEditAllFilterSubject('')
                  setEditAllFilterChapterName('')
                  showErrorNotification('Edit request cancelled');
                }
                }
                className="p-2 bg-gray-400 text-white rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAll}
                className="p-2 bg-blue-500 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default ChapterForm;
